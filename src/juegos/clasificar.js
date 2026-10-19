'use strict';

import { el, limpiar, barajar } from '../core/util.js';
import { celda, OPC, temporizadores } from './ayudas.js';
import { activarArrastre } from './arrastrar.js';

const planos = (grupos) => grupos.flatMap((g) => g.items.map((it, k) => ({ ...it, gid: g.id || g.nombre, key: (g.id || g.nombre) + ':' + k })));

// ---------- Ordenar por grupo ----------
const porGrupo = {
  id: 'por-grupo', nombre: 'Ordenar por grupo', icono: '🗃️', color: '#3a86ff',
  descripcion: 'Arrastra y suelta cada elemento en su grupo correcto.',
  acepta: ['grupos'], minimo: 2, imprimible: true,
  opciones: [OPC.alea(true, 'Barajar los elementos'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    const grupos = h.datos; const todos = planos(grupos);
    const cont = el('div', { class: 'grp' });
    const cajas = el('div', { class: 'grp-cajas' }, grupos.map((g) => el('div', { class: 'grp-caja e-card' }, [el('b', { class: 'grp-tit', text: g.nombre }), el('div', { class: 'destino grp-dest', dataset: { gid: g.id || g.nombre } })])));
    const pool = el('div', { class: 'grp-pool' }, (h.opciones.alea ? barajar(todos) : todos).map((it) => el('div', { class: 'chip e-btn', dataset: { gid: it.gid } }, [celda(it.t, it.img)])));
    cont.append(cajas, pool); h.raiz.appendChild(cont);
    let puestos = 0; h.progreso(0, todos.length);
    const ctl = activarArrastre(cont, {
      chip: '.chip', destino: '.destino', habilitado: (c) => !c.classList.contains('puesto'),
      alSoltar(c, d) {
        if (c.dataset.gid === d.dataset.gid) { c.classList.add('puesto', 'ok'); d.append(c); puestos++; h.acierto(1); h.progreso(puestos, todos.length); if (puestos >= todos.length) T.esperar(() => h.terminar(), 700); return true; }
        c.classList.add('tiembla'); T.esperar(() => c.classList.remove('tiembla'), 500); h.fallo(); ctl.limpiarSeleccion(); return false;
      }
    });
    return { destruir: () => T.limpiar() };
  },
  imprimir: (g) => `<p><b>Elementos:</b> ${barajar(g.flatMap((x) => x.items.map((i) => i.t))).join(' · ')}</p><div class="cols">${g.map((x) => `<div class="caja"><b>${x.nombre}</b></div>`).join('')}</div>`
};

// ---------- Clasificación rápida ----------
const rapida = {
  id: 'clasificacion-rapida', nombre: 'Clasificación rápida', icono: '⚡', color: '#fb5607',
  descripcion: 'Los elementos aparecen de uno en uno. Arrástralos a su caja antes de que se acabe el tiempo.',
  acepta: ['grupos'], minimo: 3, imprimible: false,
  opciones: [OPC.velocidad(4), OPC.vidas(3), OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    const cola = barajar(planos(h.datos)); let i = 0, ocupado = false, id = null;
    const cont = el('div', { class: 'rap' });
    const zona = el('div', { class: 'rap-zona' });
    const barra = el('div', { class: 'conc-barra' }, [el('i')]);
    const cajas = el('div', { class: 'rap-cajas' }, h.datos.map((g) => el('div', { class: 'destino rap-caja e-card', dataset: { gid: g.id || g.nombre } }, [el('b', { text: g.nombre })])));
    cont.append(barra, zona, cajas); h.raiz.appendChild(cont);
    const dur = () => Math.max(2.5, 11 - (h.opciones.velocidad || 4)) * 1000;
    const ctl = activarArrastre(cont, {
      chip: '.chip', destino: '.destino', habilitado: () => !ocupado,
      alSoltar(c, d) {
        if (ocupado) return false; ocupado = true; clearInterval(id);
        const bien = c.dataset.gid === d.dataset.gid;
        d.classList.add(bien ? 'bien' : 'mal'); T.esperar(() => d.classList.remove('bien', 'mal'), 600);
        c.remove(); ctl.limpiarSeleccion();
        if (bien) h.acierto(1); else if (h.fallo()) return true;
        T.esperar(siguiente, 500); return true;
      }
    });
    function siguiente() {
      if (i >= cola.length) return h.terminar();
      ocupado = false; h.progreso(i, cola.length); const it = cola[i++];
      limpiar(zona); zona.append(el('div', { class: 'chip e-btn rap-item', dataset: { gid: it.gid } }, [celda(it.t, it.img)]));
      const t0 = performance.now(), total = dur(); clearInterval(id);
      id = T.cada(() => {
        const p = (performance.now() - t0) / total; barra.firstChild.style.width = Math.max(0, 100 - p * 100) + '%';
        if (p >= 1) { clearInterval(id); if (ocupado) return; ocupado = true; limpiar(zona); ctl.limpiarSeleccion(); if (!h.fallo()) T.esperar(siguiente, 400); }
      }, 60);
    }
    siguiente();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Ordenar por rango ----------
const rango = {
  id: 'rango', nombre: 'Ordenar por rango', icono: '🔢', color: '#8ac926',
  descripcion: 'Arrastra los elementos hasta ponerlos en el orden correcto.',
  acepta: ['lista'], minimo: 3, imprimible: true,
  opciones: [OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    const correcto = h.datos.map((x, k) => ({ ...x, k }));
    let orden = barajar(correcto); let n = 0; while (orden.every((x, j) => x.k === j) && n++ < 20) orden = barajar(correcto);
    const cont = el('div', { class: 'ran' });
    const lista = el('div', { class: 'ran-lista' });
    const comp = el('button', { class: 'e-btn ran-comp', text: 'Comprobar el orden', on: { click: comprobar } });
    cont.append(lista, comp); h.raiz.appendChild(cont);
    const pintar = (marcas) => {
      limpiar(lista);
      orden.forEach((x, j) => {
        const fila = el('div', { class: 'ran-fila e-card' + (marcas ? (x.k === j ? ' bien' : ' mal') : ''), dataset: { k: x.k } }, [
          el('span', { class: 'ran-n', text: String(j + 1) }), el('div', { class: 'ran-t' }, [celda(x.t, x.img)]),
          el('div', { class: 'ran-fl' }, [el('button', { class: 'ran-b', text: '▲', on: { click: () => mover(j, -1) } }), el('button', { class: 'ran-b', text: '▼', on: { click: () => mover(j, 1) } })])
        ]);
        fila.addEventListener('pointerdown', (e) => { if (e.target.closest('.ran-b')) return; arrastrar(e, fila, j); });
        lista.append(fila);
      });
    };
    function mover(j, d) { const t = j + d; if (t < 0 || t >= orden.length) return; [orden[j], orden[t]] = [orden[t], orden[j]]; h.sonido.clic(); pintar(); }
    function arrastrar(e, fila, j) {
      const filas = [...lista.children]; const y0 = e.clientY; let actual = j; fila.setPointerCapture(e.pointerId); fila.classList.add('sel');
      const mov = (ev) => {
        const dy = ev.clientY - y0; fila.style.transform = `translateY(${dy}px)`;
        const alto = fila.offsetHeight + 6; const destino = Math.max(0, Math.min(orden.length - 1, j + Math.round(dy / alto)));
        if (destino !== actual) { actual = destino; }
      };
      const fin = () => {
        fila.removeEventListener('pointermove', mov); fila.removeEventListener('pointerup', fin);
        if (actual !== j) { const [x] = orden.splice(j, 1); orden.splice(actual, 0, x); h.sonido.clic(); }
        pintar();
      };
      fila.addEventListener('pointermove', mov); fila.addEventListener('pointerup', fin);
    }
    function comprobar() {
      const ok = orden.filter((x, j) => x.k === j).length;
      pintar(true);
      if (ok === orden.length) { h.acierto(orden.length); T.esperar(() => h.terminar(), 800); }
      else { h.fallo({ vida: false }); T.esperar(() => pintar(), 1200); }
    }
    pintar();
    return { destruir: () => T.limpiar(), alAgotarTiempo: () => { const ok = orden.filter((x, j) => x.k === j).length; h.fijarPuntos(ok); h.terminar({ motivo: 'tiempo' }); } };
  },
  imprimir: (c) => `<p>Numera los elementos en el orden correcto (1, 2, 3…):</p><ul style="list-style:none;line-height:2.2">${barajar(c).map((x) => `<li><span class="lin corta">&nbsp;</span> ${x.t}</li>`).join('')}</ul>`
};

// ---------- Observa y memoriza ----------
const memoriza = {
  id: 'memoriza', nombre: 'Observa y memoriza', icono: '👁️', color: '#7209b7',
  descripcion: 'Observa con atención y recuerda los elementos. Al final, toca los que viste.',
  acepta: ['lista'], minimo: 4, imprimible: false,
  opciones: [{ k: 'segundos', etiqueta: 'Tiempo para memorizar', tipo: 'rango', min: 3, max: 40, paso: 1, def: 10, sufijo: ' s' }],
  montar(h) {
    const T = temporizadores();
    const todos = barajar(h.datos.map((x, k) => ({ ...x, k })));
    const vistos = new Set(todos.slice(0, Math.max(2, Math.ceil(todos.length / 2))).map((x) => x.k));
    const cont = el('div', { class: 'mem' });
    h.raiz.appendChild(cont);
    const grid = (items, alClic) => el('div', { class: 'mem-grid', style: { '--cols': Math.ceil(Math.sqrt(items.length * 1.5)) } }, items.map((x) => el('button', { class: 'e-btn mem-it', on: alClic ? { click: (e) => alClic(x, e.currentTarget) } : {} }, [celda(x.t, x.img)])));
    // fase 1: memorizar
    const seg = h.opciones.segundos || 10; let resta = seg;
    const info = el('div', { class: 'mem-info' });
    cont.append(info, grid(todos.filter((x) => vistos.has(x.k)), null));
    const id = T.cada(() => { resta--; info.textContent = `¡Memoriza! ${resta} s`; if (resta <= 0) { clearInterval(id); elegir(); } }, 1000);
    info.textContent = `¡Memoriza! ${resta} s`;
    // fase 2: elegir
    let aciertos = 0, fallos = 0;
    function elegir() {
      limpiar(cont);
      const faltan = vistos.size;
      cont.append(el('div', { class: 'mem-info', text: `Toca los ${faltan} elementos que viste` }), grid(barajar(todos), (x, b) => {
        if (b.disabled) return; b.disabled = true;
        if (vistos.has(x.k)) { b.classList.add('ok'); aciertos++; h.acierto(1); } else { b.classList.add('mal'); fallos++; h.fallo({ vida: false }); }
        if (aciertos + fallos >= faltan) T.esperar(() => h.terminar(), 900);
      }));
    }
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Diagrama etiquetado ----------
const diagrama = {
  id: 'diagrama', nombre: 'Diagrama etiquetado', icono: '📍', color: '#e63946',
  descripcion: 'Arrastra las etiquetas hasta su lugar correcto en la imagen.',
  acepta: ['diagrama'], soloNativa: true, minimo: 1, imprimible: true,
  opciones: [OPC.alea(true, 'Barajar las etiquetas'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    const d = h.datos; const pins = d.pins;
    const cont = el('div', { class: 'dia' });
    const imgBox = el('div', { class: 'dia-img' }, [el('img', { attrs: { src: d.img, alt: '', draggable: 'false' } }),
      ...pins.map((p, k) => el('div', { class: 'destino dia-pin', style: { left: p.x + '%', top: p.y + '%' }, dataset: { id: p.id }, text: String(k + 1) }))]);
    const pool = el('div', { class: 'dia-pool' }, (h.opciones.alea ? barajar(pins) : pins).map((p) => el('div', { class: 'chip e-btn', dataset: { id: p.id }, text: p.t })));
    cont.append(imgBox, pool); h.raiz.appendChild(cont); h.progreso(0, pins.length);
    let hechos = 0;
    const ctl = activarArrastre(cont, {
      chip: '.chip', destino: '.destino', habilitado: (c) => !c.classList.contains('puesto'),
      alSoltar(c, dst) {
        if (dst.classList.contains('hecho')) return false;
        if (c.dataset.id === dst.dataset.id) {
          c.classList.add('puesto', 'ok'); dst.classList.add('hecho'); dst.textContent = ''; dst.append(c); hechos++; h.acierto(1); h.progreso(hechos, pins.length);
          if (hechos >= pins.length) T.esperar(() => h.terminar(), 700); return true;
        }
        c.classList.add('tiembla'); T.esperar(() => c.classList.remove('tiembla'), 500); h.fallo(); ctl.limpiarSeleccion(); return false;
      }
    });
    return { destruir: () => T.limpiar() };
  },
  imprimir: (d) => `<div class="diag"><img src="${d.img}">${d.pins.map((p, i) => `<span class="pin" style="left:${p.x}%;top:${p.y}%">${i + 1}</span>`).join('')}</div><p><b>Etiquetas:</b> ${barajar(d.pins.map((p) => p.t)).join(' · ')}</p><ol>${d.pins.map(() => '<li><span class="lin">&nbsp;</span></li>').join('')}</ol>`
};

export default [porGrupo, rapida, rango, memoriza, diagrama];
