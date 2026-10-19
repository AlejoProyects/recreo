'use strict';

import { el, limpiar, barajar } from '../core/util.js';
import { celda, OPC, temporizadores } from './ayudas.js';

// ---------- Cuestionario ----------
const cuestionario = {
  id: 'cuestionario', nombre: 'Cuestionario', icono: '❓', color: '#2ea8f5',
  descripcion: 'Una serie de preguntas de opción múltiple. Pulsa la respuesta correcta para continuar.',
  acepta: ['quiz'], minimo: 1, imprimible: true,
  opciones: [{ k: 'auto', grupo: 'ritmo', etiqueta: 'Continuar automáticamente tras marcar', tipo: 'check', def: true }, OPC.mostrarOk(true), OPC.alea(true, 'Barajar el orden de las preguntas'), OPC.aleaResp(),
    { k: 'letras', grupo: 'formato', etiqueta: 'Letras en respuestas', tipo: 'opcion', def: 'abc', opciones: [{ v: 'abc', t: 'A, B, C' }, { v: 'ninguno', t: 'Ninguno' }] }, OPC.vidas(0)],
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
        el('div', { class: 'quiz-q e-card' }, [celda(q.q, q.img, '', q.aud)]),
        el('div', { class: 'quiz-r n' + Math.min(q.resp.length, 6) }, q.resp.map((r, k) =>
          el('button', { class: 'e-btn', text: (h.opciones.letras === 'ninguno' ? '' : 'ABCDEF'[k] + ') ') + r.t, on: { click: (ev) => responder(r, ev.currentTarget, q) } })))
      );
      bloqueado = false;
    }
    // Avanza solo tras una pausa o, si "continuar automáticamente" está apagado, con un botón.
    function avanzar(ms) {
      const sig = () => { i++; i >= qs.length ? h.terminar() : pintar(); };
      if (h.opciones.auto === false) caja.append(el('button', { class: 'e-btn quiz-sig', text: 'Siguiente ▶', on: { click: sig } }));
      else T.esperar(sig, ms);
    }
    function responder(r, btn, q) {
      if (bloqueado || btn.disabled) return;
      if (r.ok) {
        bloqueado = true; btn.classList.add('ok'); h.acierto(1);
        avanzar(650);
      } else {
        btn.classList.add('mal'); btn.disabled = true;
        if (h.fallo()) return;
        if (h.opciones.mostrarOk) {
          bloqueado = true;
          [...caja.querySelectorAll('.e-btn')].forEach((b, k) => { if (q.resp[k].ok) b.classList.add('ok'); });
          avanzar(1100);
        }
      }
    }
    pintar();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Rueda aleatoria ----------
const COLORES = ['#0079c8', '#c8202f', '#c65a0b', '#0a8a3b', '#a93cb8', '#0097a7', '#d6a300', '#d6336c'];
const POTENCIA = { baja: { s: 4, v: 3 }, media: { s: 6, v: 5 }, alta: { s: 8, v: 8 } };
const rueda = {
  id: 'rueda', nombre: 'Rueda aleatoria', icono: '🎡', color: '#f4a261',
  descripcion: 'Gira la rueda para ver qué elemento aparece a continuación.',
  acepta: ['lista', 'pares', 'quiz', 'grupos', 'oraciones'], minimo: 2, imprimible: false,
  opciones: [{ k: 'potencia', etiqueta: 'Potencia de giro', tipo: 'opcion', def: 'media', opciones: [{ v: 'baja', t: 'Baja' }, { v: 'media', t: 'Media' }, { v: 'alta', t: 'Alta' }] }],
  montar(h) {
    const T = temporizadores();
    let items = h.datos.map((x) => ({ t: x.t ?? x.a ?? x.q ?? x.nombre ?? '', img: x.img ?? x.imgA ?? null, aud: x.aud ?? x.audA ?? null }));
    let angulo = 0, zoom = 1, fase = 'reposo', elegido = -1;
    const cont = el('div', { class: 'rueda' });
    const canvas = el('canvas', { class: 'rueda-canvas' });
    const pista = el('div', { class: 'rueda-pista', text: 'Arrastra la rueda para girarla' });
    const botones = el('div', { class: 'rueda-botones' });
    const bGirar = el('button', { class: 'rueda-b', text: 'Girar', on: { click: () => girar() } });
    const bReanudar = el('button', { class: 'rueda-b', text: 'Reanudar', on: { click: () => volver() } });
    const bEliminar = el('button', { class: 'rueda-b', text: 'Eliminar', on: { click: eliminar } });
    cont.append(canvas, pista, botones);
    h.raiz.appendChild(cont);
    const pintarBotones = () => { limpiar(botones); botones.append(...(fase === 'zoom' && !bloqueado ? [bReanudar, bEliminar] : fase === 'reposo' ? [bGirar] : [])); pista.hidden = fase !== 'reposo'; };
    let bloqueado = true;
    const imgs = new Map();
    items.forEach((it) => { if (it.img) { const im = new Image(); im.src = it.img; imgs.set(it.img, im); im.onload = dibujar; } });

    // Geometría: el puntero (flecha) queda a la izquierda del borde; la rueda va centrada.
    const geo = () => {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      const R = Math.max(40, Math.min(H * 0.43, W * 0.32));
      return { W, H, R, cx: W / 2, cy: H / 2 };
    };
    const lineas = (g, texto, ancho) => {
      const pal = String(texto).split(/\s+/); const out = []; let l = '';
      pal.forEach((p) => { const prueba = l ? l + ' ' + p : p; if (g.measureText(prueba).width > ancho && l) { out.push(l); l = p; } else l = prueba; });
      if (l) out.push(l); return out;
    };
    // mejor tamaño de letra para que el texto envuelto quepa en el sector
    const ajustar = (g, texto, ancho, alto, max) => {
      let tam = max, ls = [texto];
      for (; tam > 9; tam -= 2) { g.font = `800 ${tam}px Nunito, sans-serif`; ls = lineas(g, texto, ancho); if (ls.length * tam * 1.15 <= alto && ls.every((l) => g.measureText(l).width <= ancho)) break; }
      return { tam, ls };
    };

    function dibujar() {
      const { W, H, R, cx, cy } = geo(); if (!W || !H) return;
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(W * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
      const g = canvas.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      const n = items.length, a = (Math.PI * 2) / n;
      const px = cx - R, py = cy; // punta del puntero sobre el borde
      g.save();
      g.translate(px, py); g.scale(zoom, zoom); g.translate(-px, -py);
      g.translate(cx, cy);
      // aro exterior
      g.beginPath(); g.arc(0, 0, R + 9, 0, Math.PI * 2); g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 14; g.fill(); g.shadowBlur = 0;
      g.beginPath(); g.arc(0, 0, R + 9, 0, Math.PI * 2); g.strokeStyle = '#b5b5b5'; g.lineWidth = 2; g.stroke();
      g.rotate(angulo);
      items.forEach((it, k) => {
        g.save(); g.rotate(k * a + a / 2);
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, -a / 2, a / 2); g.closePath();
        g.fillStyle = COLORES[k % COLORES.length]; g.fill();
        const gr = g.createLinearGradient(R * 0.1, -R * 0.5, R, R * 0.5); gr.addColorStop(0, 'rgba(255,255,255,.14)'); gr.addColorStop(1, 'rgba(0,0,0,.2)');
        g.fillStyle = gr; g.fill(); g.restore();
        g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, R, k * a, (k + 1) * a); g.closePath(); g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke();
      });
      items.forEach((it, k) => {
        // el texto va del borde hacia el centro: con el sector junto al puntero (izquierda) se lee en horizontal
        g.save(); g.rotate(k * a + a / 2 + Math.PI); g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#fff';
        const ancho = R * 0.62, alto = Math.max(24, 2 * R * 0.55 * Math.sin(Math.min(a / 2, Math.PI / 2)) * 0.85);
        const { tam, ls } = ajustar(g, it.t || '', ancho, alto, Math.min(R * 0.2, 60));
        g.font = `800 ${tam}px Nunito, sans-serif`;
        ls.forEach((l, i) => g.fillText(l, -(R - 20), (i - (ls.length - 1) / 2) * tam * 1.15));
        const im = it.img && imgs.get(it.img);
        if (im && im.complete) { const s = Math.min(R * 0.3, tam * 2.4); g.drawImage(im, -(R * 0.3) - s / 2, -s / 2, s, s); }
        g.restore();
      });
      // cubo central blanco
      g.beginPath(); g.arc(0, 0, R * 0.09, 0, Math.PI * 2); g.fillStyle = '#fff'; g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 8; g.fill(); g.shadowBlur = 0;
      g.strokeStyle = '#bdbdbd'; g.lineWidth = 3; g.stroke();
      g.restore();
      // flecha gris a la izquierda del puntero (no se amplía)
      g.save(); g.translate(px - 14, py); g.fillStyle = '#eee'; g.strokeStyle = '#a8a8a8'; g.lineWidth = 3; g.lineJoin = 'round';
      const L = Math.max(46, R * 0.28), A = L * 0.8;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-L * 0.5, -A * 0.5); g.lineTo(-L * 0.5, -A * 0.22); g.lineTo(-L, -A * 0.22); g.lineTo(-L, A * 0.22); g.lineTo(-L * 0.5, A * 0.22); g.lineTo(-L * 0.5, A * 0.5); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
    const ro = new ResizeObserver(dibujar); ro.observe(canvas);

    const animar = (desde, hasta, ms, fn) => new Promise((ok) => {
      const t0 = performance.now();
      (function paso(t) { const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3); fn(desde + (hasta - desde) * e); if (p < 1) requestAnimationFrame(paso); else ok(); })(t0);
    });

    function girar(potencia) {
      if (fase !== 'reposo' || items.length < 2) return;
      const P = POTENCIA[potencia || h.opciones.potencia || 'media'] || POTENCIA.media;
      fase = 'girando'; elegido = -1; pintarBotones();
      const n = items.length, a = (Math.PI * 2) / n, objetivo = Math.floor(Math.random() * n);
      // el centro del sector `objetivo` debe quedar en el puntero (ángulo π, a la izquierda)
      const base = Math.PI - (objetivo * a + a / 2);
      const final = base + Math.PI * 2 * (P.v + Math.floor(Math.random() * 3)) + Math.ceil((angulo - base) / (Math.PI * 2)) * Math.PI * 2;
      const ini = angulo, dur = P.s * 1000, t0 = performance.now();
      let ultimo = -1;
      (function paso(t) {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        angulo = ini + (final - ini) * e; dibujar();
        const sec = Math.floor(((((Math.PI - angulo) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / a);
        if (sec !== ultimo) { ultimo = sec; h.sonido.tic(); }
        if (p < 1) requestAnimationFrame(paso); else resultado(objetivo);
      })(t0);
    }
    async function resultado(k) {
      elegido = k; fase = 'zoom'; bloqueado = true; pintarBotones(); h.sonido.acierto(); h.acierto(0, { sonar: false });
      const { H, R } = geo(); const a = (Math.PI * 2) / items.length;
      const zmax = Math.min(5, Math.max(1.7, (H * 0.95) / (2 * R * Math.sin(Math.min(a / 2, Math.PI / 2)))));
      await animar(1, zmax, 2000, (v) => { zoom = v; dibujar(); });
      bloqueado = false; pintarBotones();
    }
    async function volver() {
      if (bloqueado) return; bloqueado = true; limpiar(botones);
      await animar(zoom, 1, 700, (v) => { zoom = v; dibujar(); });
      elegido = -1; fase = 'reposo'; dibujar(); pintarBotones();
    }
    async function eliminar() {
      if (bloqueado) return; bloqueado = true; limpiar(botones);
      const k = elegido;
      await animar(zoom, 1, 600, (v) => { zoom = v; dibujar(); });
      items = items.filter((_, j) => j !== k); elegido = -1; fase = 'reposo';
      dibujar(); pintarBotones();
      if (items.length < 2) T.esperar(() => h.terminar(), 600);
    }

    // girar arrastrando: sigue el dedo/ratón y, si se suelta con impulso, lanza el giro
    let arr = null;
    const angDe = (e) => { const { cx, cy } = geo(); const r = canvas.getBoundingClientRect(); return Math.atan2(e.clientY - r.top - cy, e.clientX - r.left - cx); };
    canvas.addEventListener('pointerdown', (e) => { if (fase !== 'reposo') return; canvas.setPointerCapture(e.pointerId); arr = { a0: angDe(e), ang0: angulo, hist: [[performance.now(), angDe(e)]] }; });
    canvas.addEventListener('pointermove', (e) => {
      if (!arr) return; const a = angDe(e);
      let d = a - arr.hist[arr.hist.length - 1][1]; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      angulo += d; arr.hist.push([performance.now(), a]); if (arr.hist.length > 6) arr.hist.shift(); dibujar();
    });
    const soltar = () => {
      if (!arr) return; const hist = arr.hist; arr = null;
      if (hist.length < 2) return;
      const [t1, a1] = hist[0], [t2, a2] = hist[hist.length - 1]; let d = a2 - a1; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
      const v = Math.abs(d) / Math.max(1, t2 - t1) * 1000; // rad/s
      if (v > 2.5) girar(v > 9 ? 'alta' : v > 5 ? 'media' : 'baja');
    };
    canvas.addEventListener('pointerup', soltar); canvas.addEventListener('pointercancel', soltar);

    bloqueado = false; pintarBotones(); dibujar();
    return { destruir: () => { ro.disconnect(); T.limpiar(); } };
  }
};

// ---------- Abrecajas ----------
const abrecajas = {
  id: 'abrecajas', nombre: 'Abrecajas', icono: '📦', color: '#f6a623',
  descripcion: 'Toca cada caja una por una para abrirlas y descubrir el elemento que hay en su interior.',
  acepta: ['lista', 'pares', 'quiz', 'grupos', 'oraciones'], minimo: 2, imprimible: false,
  opciones: [OPC.alea(true, 'Elementos en orden aleatorio')],
  montar(h) {
    let items = h.datos.map((x) => ({ t: x.t ?? x.a ?? x.q ?? x.nombre ?? '', img: x.img ?? x.imgA ?? null, aud: x.aud ?? x.audA ?? null }));
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
      reveal.append(el('div', { class: 'e-card cajas-card' }, [celda(it.t, it.img, '', it.aud)]), el('small', { text: 'Toca para continuar' }));
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
    const todos = h.datos.map((x) => ({ t: x.t ?? x.a ?? x.q ?? x.nombre ?? '', img: x.img ?? x.imgA ?? null, aud: x.aud ?? x.audA ?? null }));
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
        const cara = carta.querySelector('.carta-cara'); limpiar(cara); cara.append(celda(c.t, c.img, '', c.aud));
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
