'use strict';

// Constructor mínimo de DOM: el('div', {class, text, html, attrs, on, style}, hijos)
export function el(tag, props = {}, hijos = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k === 'on') for (const [ev, fn] of Object.entries(v)) n.addEventListener(ev, fn);
    else if (k === 'style') { if (typeof v === 'string') n.style.cssText = v; else for (const [p, val] of Object.entries(v)) (p.startsWith('--') ? n.style.setProperty(p, val) : (n.style[p] = val)); }
    else if (k === 'attrs') for (const [a, val] of Object.entries(v)) { if (val === true) n.setAttribute(a, ''); else if (val !== false && val != null) n.setAttribute(a, val); }
    else n[k] = v;
  }
  for (const h of [].concat(hijos)) if (h != null && h !== false) n.append(h.nodeType ? h : document.createTextNode(h));
  return n;
}
export const limpiar = (n) => { while (n.firstChild) n.removeChild(n.firstChild); return n; };
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const escapar = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function barajar(arr, rnd = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const rango = (n) => Array.from({ length: n }, (_, i) => i);
export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
export const sinAcentos = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const normalizar = (s) => sinAcentos(s).toLowerCase().replace(/[^a-z0-9ñ ]/g, '').replace(/\s+/g, ' ').trim();
export const fmtTiempo = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function aviso(texto, ms = 2600) {
  const t = el('div', { class: 'aviso', text: texto });
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('visible'));
  setTimeout(() => { t.classList.remove('visible'); setTimeout(() => t.remove(), 300); }, ms);
}
