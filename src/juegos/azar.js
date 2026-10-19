'use strict';

import { el, limpiar, barajar } from '../core/util.js';
import { celda, OPC, temporizadores } from './ayudas.js';

// ---------- Cuestionario ----------
const cuestionario = {
  id: 'cuestionario', nombre: 'Cuestionario', icono: '❓', color: '#2ea8f5',
  descripcion: 'Una serie de preguntas de opción múltiple. Pulsa la respuesta correcta para continuar.',
  acepta: ['quiz'], minimo: 1, imprimible: true,
  opciones: [OPC.alea(true, 'Preguntas en orden aleatorio'), OPC.aleaResp(), OPC.mostrarOk(true), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    let qs = h.datos.map((q) => ({ ...q, resp: h.opciones.aleaResp ? barajar(q.resp) : q.resp }));
    if (h.opciones.alea) qs = barajar(qs);
    let i = 0, bloqueado = false;
    const caja = el('div', { class: 'quiz' });
    h.raiz.appendChild(caja);

    function pintar() {
      limpiar(caja);
      const q = qs[i];
      h.progreso(i, qs.length);
      caja.append(
        el('div', { class: 'quiz-q e-card' }, [celda(q.q, q.img)]),
        el('div', { class: 'quiz-r n' + Math.min(q.resp.length, 6) }, q.resp.map((r) =>
          el('button', { class: 'e-btn', text: r.t, on: { click: (ev) => responder(r, ev.currentTarget, q) } })))
      );
      bloqueado = false;
    }
    function responder(r, btn, q) {
      if (bloqueado || btn.disabled) return;
      if (r.ok) {
        bloqueado = true; btn.classList.add('ok'); h.acierto(1);
        T.esperar(() => { i++; i >= qs.length ? h.terminar() : pintar(); }, 650);
      } else {
        btn.classList.add('mal'); btn.disabled = true;
        if (h.fallo()) return;
        if (h.opciones.mostrarOk) {
          bloqueado = true;
          [...caja.querySelectorAll('.e-btn')].forEach((b, k) => { if (q.resp[k].ok) b.classList.add('ok'); });
          T.esperar(() => { i++; i >= qs.length ? h.terminar() : pintar(); }, 1100);
        }
      }
    }
    pintar();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Rueda aleatoria ----------
const COLORES = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#457b9d', '#9b5de5', '#f15bb5', '#00bbf9', '#8ac926', '#ff7f51'];
const rueda = {
  id: 'rueda', nombre: 'Rueda aleatoria', icono: '🎡', color: '#f4a261',
  descripcion: 'Gira la rueda para ver qué elemento aparece a continuación.',
  acepta: ['lista', 'pares', 'quiz', 'grupos', 'oraciones'], minimo: 2, imprimible: false,
  opciones: [{ k: 'quitar', etiqueta: 'Quitar el elemento elegido de la rueda', tipo: 'check', def: false }, { k: 'giro', etiqueta: 'Duración del giro', tipo: 'rango', min: 2, max: 10, paso: 1, def: 5, sufijo: ' s' }],
  montar(h) {
    let items = h.datos.map((x) => ({ t: x.t ?? x.a ?? x.q ?? x.nombre ?? '', img: x.img ?? x.imgA ?? null }));
    let angulo = 0, girando = false;
    const cont = el('div', { class: 'rueda' });
    const canvas = el('canvas', { class: 'rueda-canvas' });
    const flecha = el('div', { class: 'rueda-flecha' });
    const ganador = el('div', { class: 'rueda-ganador', attrs: { hidden: true } });
    const centro = el('button', { class: 'rueda-giro', text: 'GIRAR', on: { click: girar } });
    const caja = el('div', { class: 'rueda-caja' }, [canvas, flecha, centro]);
    cont.append(caja, ganador);
    h.raiz.appendChild(cont);
    const imgs = new Map();
    items.forEach((it) => { if (it.img) { const im = new Image(); im.src = it.img; imgs.set(it.img, im); im.onload = dibujar; } });

    function dibujar() {
      const lado = Math.min(caja.clientWidth, caja.clientHeight) || 400;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.height = lado * dpr; canvas.style.width = canvas.style.height = lado + 'px';
      const g = canvas.getContext('2d'); g.scale(dpr, dpr);
      const r = lado / 2 - 6, n = items.length, a = (Math.PI * 2) / n;
      g.clearRect(0, 0, lado, lado);
      g.save(); g.translate(lado / 2, lado / 2); g.rotate(angulo);
      items.forEach((it, k) => {
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, k * a, (k + 1) * a); g.closePath();
        g.fillStyle = COLORES[k % COLORES.length]; g.fill();
        g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2; g.stroke();
        g.save(); g.rotate(k * a + a / 2); g.textAlign = 'right'; g.textBaseline = 'middle'; g.fillStyle = '#fff';
        const tam = Math.max(11, Math.min(26, (r * 0.9 * a) * 0.55, r / 9));
        g.font = `800 ${tam}px Nunito, sans-serif`; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 3;
        const max = r * 0.72;
        let txt = it.t || '';
        while (g.measureText(txt).width > max && txt.length > 3) txt = txt.slice(0, -2);
        if (txt !== it.t) txt += '…';
        g.fillText(txt, r - 14, 0);
        const im = it.img && imgs.get(it.img);
        if (im && im.complete) { const s = Math.min(r * 0.3, tam * 2.4); g.drawImage(im, r * 0.28 - s / 2, -s / 2, s, s); }
        g.restore();
      });
      g.restore();
    }
    const alRedim = () => dibujar();
    window.addEventListener('resize', alRedim);
    new ResizeObserver(dibujar).observe(caja);

    function girar() {
      if (girando || items.length < 1) return;
      girando = true; ganador.hidden = true; centro.disabled = true;
      const n = items.length, a = (Math.PI * 2) / n;
      const objetivo = Math.floor(Math.random() * n);
      // la flecha apunta arriba (-90°): el centro del sector `objetivo` debe quedar ahí
      const base = -Math.PI / 2 - (objetivo * a + a / 2);
      const vueltas = Math.PI * 2 * (4 + Math.floor(Math.random() * 3));
      const final = base + vueltas + Math.ceil((angulo - base) / (Math.PI * 2)) * Math.PI * 2;
      const ini = angulo, dur = (h.opciones.giro || 5) * 1000, t0 = performance.now();
      let ultimo = -1;
      (function paso(t) {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        angulo = ini + (final - ini) * e; dibujar();
        const sec = Math.floor((((-angulo - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 4) % (Math.PI * 2) / a);
        if (sec !== ultimo) { ultimo = sec; h.sonido.tic(); }
        if (p < 1) requestAnimationFrame(paso); else fin(objetivo);
      })(t0);
    }
    function fin(k) {
      girando = false; centro.disabled = false;
      const it = items[k];
      ganador.hidden = false; limpiar(ganador); ganador.append(celda(it.t, it.img));
      h.sonido.acierto(); h.confeti(50); h.acierto(0, { sonar: false });
      if (h.opciones.quitar) {
        items = items.filter((_, j) => j !== k);
        if (items.length < 2) { centro.disabled = true; setTimeout(() => h.terminar(), 1200); }
        dibujar();
      }
    }
    dibujar();
    return { destruir: () => window.removeEventListener('resize', alRedim) };
  }
};

// ---------- Abrecajas ----------
const abrecajas = {
  id: 'abrecajas', nombre: 'Abrecajas', icono: '📦', color: '#f6a623',
  descripcion: 'Toca cada caja una por una para abrirlas y descubrir el elemento que hay en su interior.',
  acepta: ['lista', 'pares', 'quiz', 'grupos', 'oraciones'], minimo: 2, imprimible: false,
  opciones: [OPC.alea(true, 'Elementos en orden aleatorio')],
  montar(h) {
    let items = h.datos.map((x) => ({ t: x.t ?? x.a ?? x.q ?? x.nombre ?? '', img: x.img ?? x.imgA ?? null }));
    if (h.opciones.alea) items = barajar(items);
    let abiertas = 0;
    const cols = Math.ceil(Math.sqrt(items.length * 1.6));
    const grid = el('div', { class: 'cajas', style: { '--cols': cols } });
    const reveal = el('div', { class: 'cajas-reveal', attrs: { hidden: true } });
    grid.append(...items.map((it, k) => {
      const b = el('button', { class: 'caja', on: { click: () => abrir(b, it) } }, [el('span', { class: 'caja-n', text: String(k + 1) })]);
      return b;
    }));
    h.raiz.append(grid, reveal);
    h.progreso(0, items.length);
    function abrir(b, it) {
      if (b.classList.contains('abierta')) return;
      b.classList.add('abierta'); abiertas++; h.sonido.acierto(); h.acierto(0, { sonar: false }); h.progreso(abiertas, items.length);
      limpiar(reveal); reveal.hidden = false;
      reveal.append(el('div', { class: 'e-card cajas-card' }, [celda(it.t, it.img)]), el('small', { text: 'Toca para continuar' }));
      reveal.onclick = () => { reveal.hidden = true; if (abiertas >= items.length) h.terminar(); };
    }
    return {};
  }
};

// ---------- Cartas al azar ----------
const cartas = {
  id: 'cartas', nombre: 'Cartas al azar', icono: '🃏', color: '#9b5de5',
  descripcion: 'Reparte tarjetas al azar de un mazo barajado.',
  acepta: ['lista', 'pares', 'quiz', 'grupos', 'oraciones'], minimo: 1, imprimible: false,
  opciones: [{ k: 'repetir', etiqueta: 'Volver a barajar al terminar el mazo', tipo: 'check', def: false }],
  montar(h) {
    const todos = h.datos.map((x) => ({ t: x.t ?? x.a ?? x.q ?? x.nombre ?? '', img: x.img ?? x.imgA ?? null }));
    let mazo = barajar(todos), vistas = 0;
    const cont = el('div', { class: 'cartas' });
    const carta = el('div', { class: 'carta' }, [el('div', { class: 'carta-dorso e-card', text: '?' }), el('div', { class: 'carta-cara e-card' })]);
    const info = el('div', { class: 'cartas-info' });
    const btn = el('button', { class: 'e-btn cartas-btn', text: 'Repartir una carta', on: { click: repartir } });
    cont.append(carta, info, btn);
    h.raiz.appendChild(cont);
    const total = () => todos.length;
    const pintarInfo = () => { info.textContent = `Quedan ${mazo.length} de ${total()} cartas`; h.progreso(vistas, total()); };
    function repartir() {
      if (!mazo.length) { if (h.opciones.repetir) mazo = barajar(todos); else return h.terminar(); }
      const c = mazo.pop(); vistas++;
      carta.classList.remove('vuelta');
      setTimeout(() => {
        const cara = carta.querySelector('.carta-cara'); limpiar(cara); cara.append(celda(c.t, c.img));
        carta.classList.add('vuelta'); h.sonido.clic(); h.acierto(0, { sonar: false });
        pintarInfo();
        if (!mazo.length && !h.opciones.repetir) btn.textContent = 'Terminar';
      }, carta.classList.contains('vuelta') ? 350 : 0);
    }
    pintarInfo();
    return {};
  }
};

export default [cuestionario, rueda, abrecajas, cartas];
