'use strict';

// Arrastrar y soltar con punteros (ratón y táctil) + alternativa por clic (seleccionar y tocar destino).
// `alSoltar(chip, destino)` debe devolver true si acepta el soltado.
export function activarArrastre(cont, { chip = '.chip', destino = '.destino', alSoltar, habilitado = () => true }) {
  let sel = null;
  const marcar = (c) => { if (sel) sel.classList.remove('sel'); sel = c; if (sel) sel.classList.add('sel'); };

  function soltarEn(c, d) {
    if (!d) return false;
    const ok = alSoltar(c, d);
    if (ok !== false) marcar(null);
    return ok;
  }

  cont.addEventListener('pointerdown', (e) => {
    const c = e.target.closest(chip);
    if (!c || !cont.contains(c) || !habilitado(c) || e.button > 0) return;
    const r = c.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    let fantasma = null, movido = false;
    const x0 = e.clientX, y0 = e.clientY;
    const mover = (ev) => {
      if (!movido && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
      if (!movido) {
        movido = true;
        fantasma = c.cloneNode(true);
        fantasma.classList.add('fantasma');
        fantasma.style.cssText += `;position:fixed;width:${r.width}px;height:${r.height}px;margin:0;z-index:999;pointer-events:none;opacity:.92`;
        document.body.appendChild(fantasma);
        c.classList.add('arrastrando');
      }
      fantasma.style.left = ev.clientX - dx + 'px'; fantasma.style.top = ev.clientY - dy + 'px';
    };
    const fin = (ev) => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', fin); window.removeEventListener('pointercancel', fin);
      if (!movido) return; // fue un clic: lo gestiona el listener de click
      c.classList.remove('arrastrando');
      const objetivos = document.elementsFromPoint(ev.clientX, ev.clientY);
      fantasma.remove();
      const d = objetivos.map((n) => n.closest && n.closest(destino)).find((n) => n && cont.contains(n));
      c.dataset.arrastrado = '1'; setTimeout(() => delete c.dataset.arrastrado, 0);
      soltarEn(c, d);
    };
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', fin); window.addEventListener('pointercancel', fin);
  });

  cont.addEventListener('click', (e) => {
    const c = e.target.closest(chip);
    if (c && cont.contains(c)) { if (c.dataset.arrastrado || !habilitado(c)) return; marcar(sel === c ? null : c); return; }
    const d = e.target.closest(destino);
    if (d && sel && cont.contains(d)) soltarEn(sel, d);
  });
  return { limpiarSeleccion: () => marcar(null) };
}
