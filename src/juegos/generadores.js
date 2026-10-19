'use strict';

import { barajar, sinAcentos } from '../core/util.js';

// Palabra en mayúsculas, sin acentos (conserva la Ñ), solo letras.
export const normPalabra = (s) => sinAcentos(String(s).toUpperCase().replace(/Ñ/g, '\u0001')).replace(/\u0001/g, 'Ñ').replace(/[^A-ZÑ0-9]/g, '');

const ALFABETO = 'AAAEEEIIOOOUBCDLMNRSTPGFVHQJZ';
const DIRS_TODAS = [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]];
const DIRS_BASICAS = [[1, 0], [0, 1]];

// ---------------------------------------------------------------------------
// Sopa de letras
// ---------------------------------------------------------------------------
export function generarSopa(palabras, { dirs = 'todas', rnd = Math.random } = {}) {
  const orig = [...new Set(palabras.map((p) => String(p).trim()).filter(Boolean))];
  const items = orig.map((o) => ({ o, w: normPalabra(o) })).filter((x) => x.w.length >= 2).sort((a, b) => b.w.length - a.w.length);
  if (!items.length) return { n: 0, grid: [], colocadas: [] };
  const suma = items.reduce((s, x) => s + x.w.length, 0);
  let n = Math.min(20, Math.max(8, items[0].w.length, Math.ceil(Math.sqrt(suma * 2.2))));
  const D = dirs === 'basicas' ? DIRS_BASICAS : DIRS_TODAS;

  for (let intento = 0; intento < 6; intento++, n = Math.min(24, n + 1)) {
    const grid = Array.from({ length: n }, () => Array(n).fill(null));
    const colocadas = [];
    let todas = true;
    for (const it of items) {
      let ok = false;
      for (let k = 0; k < 300 && !ok; k++) {
        const [dx, dy] = D[(rnd() * D.length) | 0];
        const x = (rnd() * n) | 0, y = (rnd() * n) | 0;
        const x1 = x + dx * (it.w.length - 1), y1 = y + dy * (it.w.length - 1);
        if (x1 < 0 || y1 < 0 || x1 >= n || y1 >= n) continue;
        let cabe = true;
        for (let i = 0; i < it.w.length && cabe; i++) { const c = grid[y + dy * i][x + dx * i]; if (c && c !== it.w[i]) cabe = false; }
        if (!cabe) continue;
        for (let i = 0; i < it.w.length; i++) grid[y + dy * i][x + dx * i] = it.w[i];
        colocadas.push({ palabra: it.w, orig: it.o, x, y, dx, dy });
        ok = true;
      }
      if (!ok) { todas = false; break; }
    }
    if (todas || intento === 5) {
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!grid[y][x]) grid[y][x] = ALFABETO[(rnd() * ALFABETO.length) | 0];
      return { n, grid, colocadas };
    }
  }
  return { n: 0, grid: [], colocadas: [] };
}

// ---------------------------------------------------------------------------
// Crucigrama
// ---------------------------------------------------------------------------
export function generarCruci(items, { rnd = Math.random } = {}) {
  const lista = items.map((x) => ({ pista: x.pista, orig: x.resp, w: normPalabra(x.resp) })).filter((x) => x.w.length >= 2).sort((a, b) => b.w.length - a.w.length);
  if (!lista.length) return { w: 0, h: 0, palabras: [], sinColocar: [] };
  const celdas = new Map(); // "x,y" -> letra
  const colocadas = [];
  const k = (x, y) => x + ',' + y;
  const get = (x, y) => celdas.get(k(x, y));

  function cabe(w, x, y, horiz) {
    const dx = horiz ? 1 : 0, dy = horiz ? 0 : 1;
    if (get(x - dx, y - dy) || get(x + dx * w.length, y + dy * w.length)) return -1;
    let cruces = 0;
    for (let i = 0; i < w.length; i++) {
      const cx = x + dx * i, cy = y + dy * i, c = get(cx, cy);
      if (c) { if (c !== w[i]) return -1; cruces++; }
      else if (get(cx + dy, cy + dx) || get(cx - dy, cy - dx)) return -1; // vecinas en paralelo
    }
    return cruces;
  }
  const poner = (it, x, y, horiz) => {
    for (let i = 0; i < it.w.length; i++) celdas.set(k(x + (horiz ? i : 0), y + (horiz ? 0 : i)), it.w[i]);
    colocadas.push({ ...it, x, y, horiz });
  };

  poner(lista[0], 0, 0, true);
  const sinColocar = [];
  for (const it of lista.slice(1)) {
    const cand = [];
    for (const p of colocadas) {
      for (let i = 0; i < p.w.length; i++) for (let j = 0; j < it.w.length; j++) {
        if (p.w[i] !== it.w[j]) continue;
        const horiz = !p.horiz;
        const x = horiz ? p.x + (p.horiz ? i : 0) - j : p.x + (p.horiz ? i : 0);
        const y = horiz ? p.y + (p.horiz ? 0 : i) : p.y + (p.horiz ? 0 : i) - j;
        const c = cabe(it.w, x, y, horiz);
        if (c >= 1) cand.push({ x, y, horiz, c });
      }
    }
    if (!cand.length) { sinColocar.push(it); continue; }
    cand.sort((a, b) => b.c - a.c || rnd() - 0.5);
    poner(it, cand[0].x, cand[0].y, cand[0].horiz);
  }

  // normalizar coordenadas y numerar
  const xs = colocadas.flatMap((p) => [p.x, p.x + (p.horiz ? p.w.length - 1 : 0)]);
  const ys = colocadas.flatMap((p) => [p.y, p.y + (p.horiz ? 0 : p.w.length - 1)]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const palabras = colocadas.map((p) => ({ ...p, x: p.x - x0, y: p.y - y0 }));
  const inicios = [...new Set(palabras.map((p) => p.y * 1000 + p.x))].sort((a, b) => a - b);
  palabras.forEach((p) => { p.n = inicios.indexOf(p.y * 1000 + p.x) + 1; });
  return { w: Math.max(...xs) - x0 + 1, h: Math.max(...ys) - y0 + 1, palabras, sinColocar };
}
