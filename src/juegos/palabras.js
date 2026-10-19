'use strict';

import { el, limpiar, barajar, normalizar, escapar } from '../core/util.js';
import { celda, OPC, temporizadores } from './ayudas.js';
import { activarArrastre } from './arrastrar.js';
import { generarSopa, generarCruci, normPalabra } from './generadores.js';

// Obtiene {pista, palabra} de cualquier tipo compatible.
const comoPalabras = (h) => h.datos.map((x) => (h.tipo === 'pares'
  ? { pista: { t: x.a, img: x.imgA }, palabra: String(x.b).trim() }
  : { pista: null, palabra: String(x.t ?? x.b ?? '').trim() })).filter((x) => x.palabra);

const LETRAS_ES = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

// ---------------------------------------------------------------------------
// Motor común de "casillas + banco de letras" (Anagrama y Deletrea la palabra)
// ---------------------------------------------------------------------------
function motorLetras(h, rondas, { señuelos = 0 }) {
  const T = temporizadores();
  let i = 0, ocupado = false;
  const cont = el('div', { class: 'let' });
  h.raiz.appendChild(cont);

  function ronda() {
    limpiar(cont); ocupado = false;
    const r = rondas[i]; h.progreso(i, rondas.length);
    const palabra = r.palabra.toUpperCase();
    const chars = [...palabra];
    const banco = chars.filter((c) => c !== ' ');
    let extra = [];
    for (let k = 0; k < señuelos; k++) extra.push(LETRAS_ES[(Math.random() * LETRAS_ES.length) | 0]);
    let mezcla = barajar([...banco, ...extra]);
    if (!señuelos && banco.length > 1) { let n = 0; while (mezcla.join('') === banco.join('') && n++ < 20) mezcla = barajar(mezcla); }
    const slots = chars.map((c) => (c === ' ' ? null : { v: null }));
    const bancoEl = [];
    const slotsEl = el('div', { class: 'let-slots' }, chars.map((c, k) => c === ' ' ? el('span', { class: 'let-esp' }) :
      el('button', { class: 'let-slot e-card', on: { click: () => quitar(k) } })));
    const bancoDiv = el('div', { class: 'let-banco' }, mezcla.map((c, k) => { const b = el('button', { class: 'let-l e-btn', text: c, on: { click: () => poner(k) } }); bancoEl.push(b); return b; }));
    if (r.pista) cont.append(el('div', { class: 'let-pista e-card' }, [celda(r.pista.t, r.pista.img)]));
    cont.append(slotsEl, bancoDiv);

    const pintar = () => slots.forEach((s, k) => { if (s) { slotsEl.children[k].textContent = s.v ? mezcla[s.v.b] : ''; } });
    function poner(b) {
      if (ocupado || bancoEl[b].disabled) return;
      const k = slots.findIndex((s) => s && !s.v);
      if (k < 0) return;
      slots[k].v = { b }; bancoEl[b].disabled = true; h.sonido.clic(); pintar();
      if (slots.every((s) => !s || s.v)) comprobar();
    }
    function quitar(k) {
      if (ocupado || !slots[k] || !slots[k].v) return;
      bancoEl[slots[k].v.b].disabled = false; slots[k].v = null; pintar();
    }
    function comprobar() {
      ocupado = true;
      const intento = chars.map((c, k) => (c === ' ' ? ' ' : mezcla[slots[k].v.b])).join('');
      if (intento === palabra) {
        slotsEl.classList.add('ok'); h.acierto(1);
        T.esperar(() => { i++; i >= rondas.length ? h.terminar() : ronda(); }, 900);
      } else {
        slotsEl.classList.add('mal');
        if (h.fallo()) return;
        T.esperar(() => { slotsEl.classList.remove('mal'); slots.forEach((s) => { if (s) s.v = null; }); bancoEl.forEach((b) => { b.disabled = false; }); pintar(); ocupado = false; }, 700);
      }
    }
    // teclado físico
    ronda.tecla = (e) => {
      if (e.key === 'Backspace') { for (let k = slots.length - 1; k >= 0; k--) if (slots[k] && slots[k].v) { quitar(k); break; } return; }
      const c = e.key.toUpperCase();
      const b = mezcla.findIndex((x, k) => x === c && !bancoEl[k].disabled);
      if (b >= 0) poner(b);
    };
  }
  const tecla = (e) => { if (ronda.tecla && !e.ctrlKey && !e.altKey && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) ronda.tecla(e); };
  window.addEventListener('keydown', tecla);
  ronda();
  return { destruir: () => { T.limpiar(); window.removeEventListener('keydown', tecla); } };
}

const anagrama = {
  id: 'anagrama', nombre: 'Anagrama', icono: '🔀', color: '#e63946',
  descripcion: 'Arrastra las letras a sus posiciones correctas para ordenar la palabra o frase.',
  acepta: ['lista', 'pares'], minimo: 1, imprimible: true,
  opciones: [OPC.alea(true, 'Palabras en orden aleatorio'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) { const r = comoPalabras(h); return motorLetras(h, h.opciones.alea ? barajar(r) : r, { señuelos: 0 }); },
  imprimir(datos) {
    const w = datos.map((x) => String(x.t ?? x.b ?? '').toUpperCase());
    return `<ol>${w.map((p) => `<li style="margin-bottom:14px;font-size:20px;letter-spacing:6px">${escapar(barajar([...p.replace(/ /g, '')]).join(' '))} &nbsp; <span class="lin">&nbsp;</span></li>`).join('')}</ol>`;
  }
};

const deletrea = {
  id: 'deletrea', nombre: 'Deletrea la palabra', icono: '🔤', color: '#2a9d8f',
  descripcion: 'Pulsa o escribe las letras en su sitio para deletrear la respuesta de cada pista.',
  acepta: ['pares', 'lista'], minimo: 1, imprimible: false,
  opciones: [OPC.alea(true, 'Pistas en orden aleatorio'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) { const r = comoPalabras(h); return motorLetras(h, h.opciones.alea ? barajar(r) : r, { señuelos: 3 }); }
};

// ---------------------------------------------------------------------------
// Ahorcado
// ---------------------------------------------------------------------------
const ahorcado = {
  id: 'ahorcado', nombre: 'Ahorcado', icono: '🪢', color: '#6d597a',
  descripcion: 'Intenta completar la palabra eligiendo las letras correctas.',
  acepta: ['lista', 'pares'], minimo: 1, imprimible: false,
  opciones: [OPC.alea(true, 'Palabras en orden aleatorio'), { k: 'intentos', etiqueta: 'Fallos permitidos', tipo: 'rango', min: 3, max: 10, paso: 1, def: 6 }, OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    let rondas = comoPalabras(h); if (h.opciones.alea) rondas = barajar(rondas);
    let i = 0, ocupado = false;
    const cont = el('div', { class: 'ahor' });
    h.raiz.appendChild(cont);
    const max = h.opciones.intentos || 6;

    function dibujo(fallos) {
      const partes = Math.ceil((fallos / max) * 6);
      const p = [
        '<circle cx="150" cy="62" r="16" />', '<line x1="150" y1="78" x2="150" y2="125" />', '<line x1="150" y1="90" x2="130" y2="110" />',
        '<line x1="150" y1="90" x2="170" y2="110" />', '<line x1="150" y1="125" x2="132" y2="155" />', '<line x1="150" y1="125" x2="168" y2="155" />'
      ].slice(0, partes).join('');
      return `<svg viewBox="0 0 220 190" class="ahor-svg"><g stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"><line x1="30" y1="175" x2="150" y2="175"/><line x1="60" y1="175" x2="60" y2="20"/><line x1="60" y1="20" x2="150" y2="20"/><line x1="150" y1="20" x2="150" y2="46"/>${p}</g></svg>`;
    }

    function ronda() {
      limpiar(cont); ocupado = false;
      const r = rondas[i]; h.progreso(i, rondas.length);
      const palabra = r.palabra.toUpperCase();
      const clave = [...palabra].map((c) => normPalabra(c) || c);
      const usadas = new Set(); let fallos = 0;
      const svg = el('div', { class: 'ahor-dib', html: dibujo(0) });
      const pal = el('div', { class: 'ahor-pal' });
      const teclado = el('div', { class: 'ahor-teclado' });
      const pintarPal = (revelar) => { limpiar(pal); [...palabra].forEach((c, k) => pal.append(c === ' ' ? el('span', { class: 'let-esp' }) : el('span', { class: 'ahor-c' + (revelar && !usadas.has(clave[k]) ? ' falta' : ''), text: usadas.has(clave[k]) || revelar ? c : '' }))); };
      const teclas = [...LETRAS_ES].map((L) => {
        const b = el('button', { class: 'e-btn ahor-t', text: L, on: { click: () => probar(L, b) } });
        return b;
      });
      teclado.append(...teclas);
      cont.append(el('div', { class: 'ahor-izq' }, [svg]), el('div', { class: 'ahor-der' }, [r.pista ? el('div', { class: 'e-card ahor-pista' }, [celda(r.pista.t, r.pista.img)]) : null, pal, teclado]));
      pintarPal(false);

      function probar(L, b) {
        if (ocupado || b.disabled) return;
        b.disabled = true; usadas.add(L);
        if (clave.includes(L)) {
          b.classList.add('ok'); h.sonido.acierto(); pintarPal(false);
          if (clave.every((c, k) => palabra[k] === ' ' || usadas.has(c))) { ocupado = true; h.acierto(1, { sonar: false }); h.confeti(30); T.esperar(sig, 1200); }
        } else {
          b.classList.add('mal'); fallos++; svg.innerHTML = dibujo(fallos); h.sonido.error();
          if (fallos >= max) { ocupado = true; h.fallo({ vida: false, sonar: false }); pintarPal(true); T.esperar(sig, 1800); }
        }
      }
      ronda.tecla = (e) => { const L = e.key.toUpperCase(); const k = [...LETRAS_ES].indexOf(L); if (k >= 0) probar(L, teclas[k]); };
    }
    const sig = () => { i++; i >= rondas.length ? h.terminar() : ronda(); };
    const tecla = (e) => { if (!e.ctrlKey && !e.altKey && ronda.tecla) ronda.tecla(e); };
    window.addEventListener('keydown', tecla);
    ronda();
    return { destruir: () => { T.limpiar(); window.removeEventListener('keydown', tecla); } };
  }
};

// ---------------------------------------------------------------------------
// Sopa de letras
// ---------------------------------------------------------------------------
const sopa = {
  id: 'sopa', nombre: 'Sopa de letras', icono: '🔎', color: '#457b9d',
  descripcion: 'Las palabras están escondidas en una cuadrícula de letras. Encuéntralas lo más rápido que puedas.',
  acepta: ['lista', 'pares'], minimo: 2, imprimible: true,
  opciones: [{ k: 'dirs', grupo: 'formato', etiqueta: 'Direcciones', tipo: 'opcion', def: 'todas', opciones: [{ v: 'todas', t: 'Todas (con diagonales y al revés)' }, { v: 'basicas', t: 'Solo horizontal y vertical' }] }, { k: 'pistas', grupo: 'formato', etiqueta: 'Mostrar la lista de palabras', tipo: 'check', def: true }, OPC.tiempo(0)],
  montar(h) {
    const palabras = comoPalabras(h).map((r) => r.palabra);
    const S = generarSopa(palabras, { dirs: h.opciones.dirs });
    const cont = el('div', { class: 'sopa' });
    const gridEl = el('div', { class: 'sopa-grid', style: { '--n': S.n } });
    const lista = el('ul', { class: 'sopa-lista', attrs: { hidden: !h.opciones.pistas } });
    cont.append(gridEl, lista); h.raiz.appendChild(cont);
    const celdas = [];
    S.grid.forEach((f, y) => f.forEach((c, x) => { const d = el('div', { class: 'sopa-c', text: c, dataset: { x, y } }); celdas.push(d); gridEl.append(d); }));
    const halladas = new Set();
    const items = new Map(S.colocadas.map((c) => [c.palabra, el('li', { text: c.orig })]));
    items.forEach((li) => lista.append(li));
    h.progreso(0, S.colocadas.length);
    const en = (x, y) => celdas[y * S.n + x];
    const colores = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#c77dff', '#ff9f1c', '#8ac926'];
    let ini = null;

    function linea(a, b) { // celdas entre a y b si forman línea recta
      const dx = Math.sign(b.x - a.x), dy = Math.sign(b.y - a.y);
      const nx = Math.abs(b.x - a.x), ny = Math.abs(b.y - a.y);
      if (!(nx === 0 || ny === 0 || nx === ny)) return null;
      const n = Math.max(nx, ny) + 1;
      return Array.from({ length: n }, (_, i) => ({ x: a.x + dx * i, y: a.y + dy * i }));
    }
    const posDe = (ev) => { const t = document.elementFromPoint(ev.clientX, ev.clientY); return t && t.classList.contains('sopa-c') ? { x: +t.dataset.x, y: +t.dataset.y } : null; };
    const limpiarSel = () => celdas.forEach((c) => c.classList.remove('sel'));
    gridEl.addEventListener('pointerdown', (ev) => { const p = posDe(ev); if (!p) return; ini = p; limpiarSel(); en(p.x, p.y).classList.add('sel'); });
    gridEl.addEventListener('pointermove', (ev) => {
      if (!ini) return; const p = posDe(ev); if (!p) return;
      limpiarSel(); const l = linea(ini, p); (l || [ini]).forEach((q) => en(q.x, q.y).classList.add('sel'));
    });
    const fin = (ev) => {
      if (!ini) return;
      const p = posDe(ev) || ini; const l = linea(ini, p); ini = null;
      const letras = l ? l.map((q) => S.grid[q.y][q.x]).join('') : '';
      const hit = l && S.colocadas.find((c) => !halladas.has(c.palabra) && (c.palabra === letras || c.palabra === [...letras].reverse().join('')));
      limpiarSel();
      if (hit) {
        const col = colores[halladas.size % colores.length];
        l.forEach((q) => { const c = en(q.x, q.y); c.classList.add('hallada'); c.style.background = col; });
        halladas.add(hit.palabra); items.get(hit.palabra).classList.add('hecha'); h.acierto(1); h.progreso(halladas.size, S.colocadas.length);
        if (halladas.size >= S.colocadas.length) setTimeout(() => h.terminar(), 800);
      } else if (l && l.length > 1) h.fallo({ vida: false });
    };
    window.addEventListener('pointerup', fin);
    return { destruir: () => window.removeEventListener('pointerup', fin) };
  },
  imprimir(datos, opc) {
    const S = generarSopa(datos.map((x) => String(x.t ?? x.b ?? '')), { dirs: (opc && opc.dirs) || 'todas' });
    return `<table class="ws">${S.grid.map((f) => `<tr>${f.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</table><p><b>Palabras:</b> ${S.colocadas.map((c) => escapar(c.orig)).join(' · ')}</p>`;
  }
};

// ---------------------------------------------------------------------------
// Crucigrama
// ---------------------------------------------------------------------------
const crucigrama = {
  id: 'crucigrama', nombre: 'Crucigrama', icono: '📰', color: '#1d3557',
  descripcion: 'Usa las pistas para resolver el crucigrama. Toca una palabra y escribe la respuesta.',
  acepta: ['pares'], minimo: 2, imprimible: true,
  opciones: [OPC.tiempo(0)],
  montar(h) {
    const items = h.datos.map((x) => (h.tipo === 'pares' ? { pista: x.a, resp: x.b } : { pista: x.q, resp: (x.resp.find((r) => r.ok) || {}).t || '' }));
    const C = generarCruci(items);
    const cont = el('div', { class: 'cruci' });
    const tablero = el('div', { class: 'cruci-grid', style: { '--w': C.w, '--h': C.h } });
    const pistas = el('div', { class: 'cruci-pistas' });
    const entrada = el('input', { class: 'cruci-in', attrs: { autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', 'aria-label': 'Escribe la respuesta' } });
    cont.append(tablero, pistas, entrada); h.raiz.appendChild(cont);
    const celdas = new Map(); // "x,y" -> {el, letra, esperada, palabras[]}
    C.palabras.forEach((p) => { for (let k = 0; k < p.w.length; k++) {
      const x = p.x + (p.horiz ? k : 0), y = p.y + (p.horiz ? 0 : k), key = x + ',' + y;
      if (!celdas.has(key)) { const d = el('div', { class: 'cc', style: { gridColumn: x + 1, gridRow: y + 1 } }); celdas.set(key, { el: d, letra: '', esperada: p.w[k], palabras: [] }); tablero.append(d); }
      celdas.get(key).palabras.push(p);
      if (k === 0) { const num = celdas.get(key).el.querySelector('sup') || celdas.get(key).el.appendChild(el('sup', { text: String(p.n) })); num.textContent = String(p.n); }
    } });
    const clavesDe = (p) => Array.from({ length: p.w.length }, (_, k) => (p.x + (p.horiz ? k : 0)) + ',' + (p.y + (p.horiz ? 0 : k)));
    let sel = null, pos = 0;
    const listaPistas = (titulo, horiz) => el('div', {}, [el('h4', { text: titulo }), el('ul', {}, C.palabras.filter((p) => p.horiz === horiz).sort((a, b) => a.n - b.n).map((p) => {
      const li = el('li', { text: `${p.n}. ${p.pista}`, on: { click: () => elegir(p, 0) } }); p.li = li; return li;
    }))]);
    pistas.append(listaPistas('Horizontales', true), listaPistas('Verticales', false), el('button', { class: 'e-btn cruci-comp', text: 'Comprobar', on: { click: comprobar } }));
    if (C.sinColocar.length) pistas.append(el('small', { text: `No cupieron ${C.sinColocar.length} palabra(s) en el tablero.` }));

    function pintar() {
      celdas.forEach((c) => { c.el.classList.remove('activa', 'palabra'); c.el.firstChild && c.el.firstChild.nodeType === 3 && c.el.removeChild(c.el.firstChild); c.el.insertBefore(document.createTextNode(c.letra), c.el.firstChild); });
      C.palabras.forEach((p) => p.li && p.li.classList.toggle('act', p === sel));
      if (!sel) return;
      const ks = clavesDe(sel); ks.forEach((k) => celdas.get(k).el.classList.add('palabra')); celdas.get(ks[pos]).el.classList.add('activa');
    }
    function elegir(p, k) { sel = p; pos = k; pintar(); entrada.focus({ preventScroll: true }); }
    celdas.forEach((c, key) => c.el.addEventListener('click', () => {
      const ps = c.palabras; const [x, y] = key.split(',').map(Number);
      const p = (sel && ps.includes(sel) && ps.length > 1) ? ps.find((q) => q !== sel) : ps[0];
      elegir(p, p.horiz ? x - p.x : y - p.y);
    }));
    function escribir(ch) {
      if (!sel) return; const ks = clavesDe(sel);
      celdas.get(ks[pos]).letra = ch; celdas.get(ks[pos]).el.classList.remove('mala');
      if (pos < ks.length - 1) pos++; pintar(); h.sonido.tic();
    }
    entrada.addEventListener('input', () => { const v = normPalabra(entrada.value); entrada.value = ''; for (const ch of v) escribir(ch); });
    entrada.addEventListener('keydown', (e) => {
      if (!sel) return; const ks = clavesDe(sel);
      if (e.key === 'Backspace') { e.preventDefault(); if (celdas.get(ks[pos]).letra) celdas.get(ks[pos]).letra = ''; else if (pos > 0) { pos--; celdas.get(ks[pos]).letra = ''; } pintar(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { pos = Math.min(ks.length - 1, pos + 1); pintar(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { pos = Math.max(0, pos - 1); pintar(); }
      else if (e.key === 'Enter') comprobar();
    });
    const hechas = new Set();
    function comprobar() {
      let malas = 0;
      celdas.forEach((c) => { c.el.classList.remove('mala', 'buena'); if (c.letra && c.letra !== c.esperada) { c.el.classList.add('mala'); malas++; } });
      C.palabras.forEach((p) => {
        const ok = clavesDe(p).every((k) => celdas.get(k).letra === celdas.get(k).esperada);
        if (ok && !hechas.has(p)) { hechas.add(p); h.acierto(1); p.li && p.li.classList.add('hecha'); clavesDe(p).forEach((k) => celdas.get(k).el.classList.add('buena')); }
      });
      h.progreso(hechas.size, C.palabras.length);
      if (malas) h.fallo({ vida: false });
      if (hechas.size >= C.palabras.length) setTimeout(() => h.terminar(), 700);
    }
    h.progreso(0, C.palabras.length);
    return { alAgotarTiempo: () => { comprobar(); h.terminar({ motivo: 'tiempo' }); } };
  },
  imprimir(datos) {
    const items = datos.map((x) => (x.a !== undefined ? { pista: x.a, resp: x.b } : { pista: x.q, resp: (x.resp.find((r) => r.ok) || {}).t || '' }));
    const C = generarCruci(items);
    const m = new Map(); C.palabras.forEach((p) => { for (let k = 0; k < p.w.length; k++) { const key = (p.x + (p.horiz ? k : 0)) + ',' + (p.y + (p.horiz ? 0 : k)); if (!m.has(key)) m.set(key, { n: '' }); if (k === 0) m.get(key).n = p.n; } });
    let filas = '';
    for (let y = 0; y < C.h; y++) { filas += '<tr>'; for (let x = 0; x < C.w; x++) { const c = m.get(x + ',' + y); filas += c ? `<td>${c.n ? `<sup>${c.n}</sup>` : ''}</td>` : '<td class="v"></td>'; } filas += '</tr>'; }
    const lis = (horiz) => C.palabras.filter((p) => p.horiz === horiz).sort((a, b) => a.n - b.n).map((p) => `<li value="${p.n}">${escapar(p.pista)}</li>`).join('');
    return `<table class="cw">${filas}</table><div class="dos"><div><h3>Horizontales</h3><ol>${lis(true)}</ol></div><div><h3>Verticales</h3><ol>${lis(false)}</ol></div></div>`;
  }
};

// ---------------------------------------------------------------------------
// Escribe la respuesta
// ---------------------------------------------------------------------------
const escribe = {
  id: 'escribe', nombre: 'Escribe la respuesta', icono: '⌨️', color: '#f4a261',
  descripcion: 'Escribe la respuesta correcta para cada pista o pregunta.',
  acepta: ['pares'], minimo: 1, imprimible: false,
  opciones: [OPC.alea(true, 'Preguntas en orden aleatorio'), { k: 'acentos', grupo: 'maestria', etiqueta: 'Ignorar mayúsculas y tildes', tipo: 'check', def: true }, { k: 'intentos', grupo: 'maestria', etiqueta: 'Intentos por pregunta', tipo: 'rango', min: 1, max: 5, paso: 1, def: 2 }, OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    let rondas = h.datos.map((x) => (h.tipo === 'pares' ? { p: { t: x.a, img: x.imgA }, r: String(x.b) } : { p: { t: x.q, img: x.img }, r: (x.resp.find((z) => z.ok) || {}).t || '' }));
    if (h.opciones.alea) rondas = barajar(rondas);
    let i = 0, intentos = 0, ocupado = false;
    const cont = el('div', { class: 'esc-resp' });
    h.raiz.appendChild(cont);
    const igual = (a, b) => (h.opciones.acentos ? normalizar(a) === normalizar(b) : a.trim() === b.trim());
    function ronda() {
      limpiar(cont); intentos = 0; ocupado = false;
      const r = rondas[i]; h.progreso(i, rondas.length);
      const entrada = el('input', { class: 'esc-resp-in', attrs: { type: 'text', autocomplete: 'off', placeholder: 'Escribe tu respuesta…' } });
      const msg = el('div', { class: 'esc-resp-msg' });
      const ok = el('button', { class: 'e-btn', text: 'Comprobar', on: { click: comprobar } });
      entrada.addEventListener('keydown', (e) => { if (e.key === 'Enter') comprobar(); });
      cont.append(el('div', { class: 'e-card esc-resp-q' }, [celda(r.p.t, r.p.img)]), entrada, ok, msg);
      setTimeout(() => entrada.focus(), 50);
      function comprobar() {
        if (ocupado || !entrada.value.trim()) return;
        if (igual(entrada.value, r.r)) { ocupado = true; entrada.classList.add('ok'); msg.textContent = '¡Correcto!'; h.acierto(1); T.esperar(sig, 900); return; }
        intentos++; entrada.classList.add('mal'); T.esperar(() => entrada.classList.remove('mal'), 500);
        if (h.fallo()) return;
        if (intentos >= (h.opciones.intentos || 2)) { ocupado = true; msg.textContent = 'Respuesta: ' + r.r; T.esperar(sig, 1800); }
        else { msg.textContent = 'Inténtalo de nuevo'; entrada.select(); }
      }
    }
    const sig = () => { i++; i >= rondas.length ? h.terminar() : ronda(); };
    ronda();
    return { destruir: () => T.limpiar() };
  }
};

// ---------------------------------------------------------------------------
// Reordenar (unjumble) e Imanes de palabras
// ---------------------------------------------------------------------------
const palabrasDe = (t) => String(t).replace(/[\[\]]/g, '').trim().split(/\s+/).filter(Boolean);

const reordenar = {
  id: 'reordenar', nombre: 'Reordenar', icono: '↔️', color: '#00bbf9',
  descripcion: 'Toca o arrastra las palabras para reordenar cada oración correctamente.',
  acepta: ['oraciones'], minimo: 1, imprimible: true,
  opciones: [OPC.alea(true, 'Oraciones en orden aleatorio'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    let frases = h.datos.map((x) => String(x.t ?? x.b ?? x.q ?? '')).filter((t) => palabrasDe(t).length >= 2);
    if (!frases.length) { h.raiz.append(el('p', { class: 'esc-error', text: 'Las frases necesitan al menos dos palabras.' })); return {}; }
    if (h.opciones.alea) frases = barajar(frases);
    let i = 0, ocupado = false;
    const cont = el('div', { class: 'reo' });
    h.raiz.appendChild(cont);
    function ronda() {
      limpiar(cont); ocupado = false; h.progreso(i, frases.length);
      const ws = palabrasDe(frases[i]);
      let mezcla = barajar(ws.map((w, k) => ({ w, k }))); let n = 0;
      while (mezcla.map((m) => m.k).join() === ws.map((_, k) => k).join() && n++ < 20) mezcla = barajar(mezcla);
      const linea = el('div', { class: 'reo-linea' });
      const banco = el('div', { class: 'reo-banco' });
      const chip = (m, enLinea) => el('button', { class: 'e-btn reo-w', text: m.w, on: { click: () => (enLinea ? bajar(m) : subir(m)) } });
      const orden = [];
      const pintar = () => {
        limpiar(linea); limpiar(banco);
        orden.forEach((m) => linea.append(chip(m, true)));
        mezcla.filter((m) => !orden.includes(m)).forEach((m) => banco.append(chip(m, false)));
        if (!orden.length) linea.append(el('span', { class: 'reo-hueco', text: 'Toca las palabras en orden' }));
      };
      const subir = (m) => { orden.push(m); h.sonido.clic(); pintar(); if (orden.length === ws.length) comprobar(); };
      const bajar = (m) => { if (ocupado) return; orden.splice(orden.indexOf(m), 1); pintar(); };
      function comprobar() {
        ocupado = true;
        if (orden.every((m, k) => m.w === ws[k])) { linea.classList.add('ok'); h.acierto(1); T.esperar(() => { i++; i >= frases.length ? h.terminar() : ronda(); }, 1000); }
        else { linea.classList.add('mal'); if (h.fallo()) return; T.esperar(() => { linea.classList.remove('mal'); orden.length = 0; pintar(); ocupado = false; }, 800); }
      }
      cont.append(linea, banco); pintar();
    }
    ronda();
    return { destruir: () => T.limpiar() };
  },
  imprimir(datos) {
    return `<ol>${datos.map((x) => `<li style="margin-bottom:16px">${escapar(barajar(palabrasDe(x.t ?? x.b ?? x.q ?? '')).join(' / '))}<br><span class="lin" style="min-width:80%">&nbsp;</span></li>`).join('')}</ol>`;
  }
};

const imanes = {
  id: 'imanes', nombre: 'Imanes de palabras', icono: '🧲', color: '#ef476f',
  descripcion: 'Arrastra las palabras o letras hasta la línea para formar las frases.',
  acepta: ['oraciones', 'lista', 'pares'], minimo: 1, imprimible: false,
  opciones: [OPC.alea(true, 'Frases en orden aleatorio'), { k: 'letras', grupo: 'formato', etiqueta: 'Usar letras en vez de palabras', tipo: 'check', def: false }, OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    let frases = h.datos.map((x) => String(x.t ?? x.b ?? x.q ?? '')).filter((t) => t.replace(/[\[\]\s]/g, '').length >= 2);
    if (!frases.length) { h.raiz.append(el('p', { class: 'esc-error', text: 'No hay frases suficientes.' })); return {}; }
    if (h.opciones.alea) frases = barajar(frases);
    let i = 0;
    const tablero = el('div', { class: 'ima' });
    h.raiz.appendChild(tablero);

    function ronda() {
      limpiar(tablero); h.progreso(i, frases.length);
      const frase = frases[i].replace(/[\[\]]/g, '').trim();
      const piezas = h.opciones.letras ? [...frase.replace(/\s+/g, '')] : palabrasDe(frase);
      const meta = h.opciones.letras ? frase.replace(/\s+/g, '') : palabrasDe(frase).join(' ');
      const zona = el('div', { class: 'ima-zona' }, [el('div', { class: 'ima-linea' }, [el('span', { text: 'Forma la frase sobre esta línea' })])]);
      const boton = el('button', { class: 'e-btn ima-comp', text: 'Comprobar', on: { click: comprobar } });
      tablero.append(zona, boton);
      const imanes_ = piezas.map((t) => {
        const m = el('div', { class: 'ima-m', text: t });
        m.style.left = 4 + Math.random() * 82 + '%'; m.style.top = 56 + Math.random() * 30 + '%';
        m.addEventListener('pointerdown', (e) => {
          const r = zona.getBoundingClientRect(); const mr = m.getBoundingClientRect();
          const dx = e.clientX - mr.left, dy = e.clientY - mr.top; m.setPointerCapture(e.pointerId); m.style.zIndex = 20; m.style.transition = 'none';
          const mov = (ev) => {
            m.style.left = ((ev.clientX - dx - r.left) / r.width) * 100 + '%'; m.style.top = ((ev.clientY - dy - r.top) / r.height) * 100 + '%';
          };
          const fin = () => { m.removeEventListener('pointermove', mov); m.removeEventListener('pointerup', fin); m.style.zIndex = ''; h.sonido.clic(); };
          m.addEventListener('pointermove', mov); m.addEventListener('pointerup', fin);
        });
        zona.append(m); return m;
      });
      function comprobar() {
        const zr = zona.querySelector('.ima-linea').getBoundingClientRect();
        const sobre = imanes_.filter((m) => { const r = m.getBoundingClientRect(); const cy = r.top + r.height / 2; return cy > zr.top - 8 && cy < zr.bottom + 8; })
          .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
        const intento = h.opciones.letras ? sobre.map((m) => m.textContent).join('') : sobre.map((m) => m.textContent).join(' ');
        if (sobre.length === piezas.length && intento === meta) {
          h.acierto(1); zona.classList.add('ok'); T.esperar(() => { i++; i >= frases.length ? h.terminar() : ronda(); }, 900);
        } else { zona.classList.add('mal'); h.fallo({ vida: false }); T.esperar(() => zona.classList.remove('mal'), 600); }
      }
    }
    ronda();
    return { destruir: () => T.limpiar() };
  }
};

// ---------------------------------------------------------------------------
// Completar la frase
// ---------------------------------------------------------------------------
const completar = {
  id: 'completar', nombre: 'Completar la frase', icono: '✍️', color: '#90be6d',
  descripcion: 'Una actividad "cloze": arrastra las palabras a los espacios en blanco dentro del texto.',
  acepta: ['oraciones'], soloNativa: true, minimo: 1, imprimible: true,
  opciones: [OPC.alea(true, 'Frases en orden aleatorio'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    let frases = h.datos.map((x) => x.t).filter((t) => /\[[^\]]+\]/.test(t));
    if (!frases.length) { h.raiz.append(el('p', { class: 'esc-error', text: 'Marca las palabras que faltan con [corchetes] en el editor. Ej.: El [sol] sale por el [este].' })); return {}; }
    if (h.opciones.alea) frases = barajar(frases);
    let i = 0;
    const cont = el('div', { class: 'cmp' });
    h.raiz.appendChild(cont);
    function ronda() {
      limpiar(cont); h.progreso(i, frases.length);
      const partes = frases[i].split(/(\[[^\]]+\])/).filter((p) => p !== '');
      const huecos = partes.filter((p) => /^\[/.test(p)).map((p) => p.slice(1, -1).trim());
      let puestas = 0;
      const texto = el('p', { class: 'cmp-texto e-card' }, partes.map((p) => (/^\[/.test(p) ? el('span', { class: 'destino cmp-hueco', dataset: { w: p.slice(1, -1).trim() } }) : p)));
      const banco = el('div', { class: 'cmp-banco' }, barajar(huecos).map((w) => el('div', { class: 'chip e-btn cmp-w', text: w, dataset: { w } })));
      cont.append(texto, banco);
      const ctl = activarArrastre(cont, {
        chip: '.chip', destino: '.destino', habilitado: (c) => !c.classList.contains('puesto'),
        alSoltar(c, d) {
          if (d.firstChild) return false;
          if (c.dataset.w === d.dataset.w) {
            c.classList.add('puesto', 'ok'); d.append(c); puestas++; h.acierto(1);
            if (puestas >= huecos.length) T.esperar(() => { i++; i >= frases.length ? h.terminar() : ronda(); }, 900);
            return true;
          }
          c.classList.add('tiembla'); T.esperar(() => c.classList.remove('tiembla'), 500); h.fallo(); ctl.limpiarSeleccion(); return false;
        }
      });
    }
    ronda();
    return { destruir: () => T.limpiar() };
  },
  imprimir: (datos) => {
    const pal = datos.flatMap((o) => [...String(o.t).matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]));
    return `<p><b>Banco de palabras:</b> ${barajar(pal).map(escapar).join(' · ')}</p><ol>${datos.map((o) => `<li>${escapar(o.t).replace(/\[[^\]]*\]/g, '<span class="lin">&nbsp;</span>')}</li>`).join('')}</ol>`;
  }
};

export default [anagrama, ahorcado, sopa, crucigrama, deletrea, escribe, reordenar, imanes, completar];
