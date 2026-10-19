'use strict';

import { el, limpiar, barajar } from '../core/util.js';
import { celda } from './ayudas.js';

// ---------- Plano de asientos (herramienta de aula) ----------
const plano = {
  id: 'plano-asientos', nombre: 'Plano de asientos', icono: '🪑', color: '#588157',
  descripcion: 'Reparte a los alumnos por los pupitres al azar. Toca dos pupitres para intercambiar a sus ocupantes.',
  acepta: ['lista'], minimo: 2, imprimible: true,
  opciones: [
    { k: 'columnas', etiqueta: 'Pupitres por fila', tipo: 'rango', min: 2, max: 10, paso: 1, def: 5 },
    { k: 'barajar', etiqueta: 'Barajar al empezar', tipo: 'check', def: true }
  ],
  montar(h) {
    let alumnos = h.datos.map((x) => ({ t: x.t, img: x.img }));
    if (h.opciones.barajar) alumnos = barajar(alumnos);
    const cols = h.opciones.columnas || 5;
    const total = Math.ceil(alumnos.length / cols) * cols;
    const asientos = Array.from({ length: total }, (_, k) => alumnos[k] || null);
    let sel = null;
    const cont = el('div', { class: 'plano' });
    const pizarra = el('div', { class: 'plano-pizarra e-card', text: 'Pizarra' });
    const grid = el('div', { class: 'plano-grid', style: { '--cols': cols } });
    const barajarBtn = el('button', { class: 'e-btn', text: '🔀 Barajar de nuevo', on: { click: () => { const ocupados = barajar(asientos.filter(Boolean)); let k = 0; asientos.forEach((_, j) => { asientos[j] = asientos[j] ? ocupados[k++] : null; }); h.sonido.acierto(); pintar(); } } });
    const fin = el('button', { class: 'e-btn', text: 'Terminar', on: { click: () => h.terminar() } });
    cont.append(pizarra, grid, el('div', { class: 'plano-bot' }, [barajarBtn, fin])); h.raiz.appendChild(cont);
    function pintar() {
      limpiar(grid);
      asientos.forEach((a, k) => grid.append(el('button', { class: 'plano-p e-card' + (sel === k ? ' sel' : '') + (a ? '' : ' vacio'), on: { click: () => tocar(k) } }, [a ? celda(a.t, a.img) : null])));
    }
    function tocar(k) {
      if (sel === null) { sel = k; pintar(); return; }
      if (sel !== k) { [asientos[sel], asientos[k]] = [asientos[k], asientos[sel]]; h.sonido.clic(); }
      sel = null; pintar();
    }
    pintar();
    return {};
  },
  imprimir(datos, opc) {
    const cols = (opc && opc.columnas) || 5; const n = Math.ceil(datos.length / cols) * cols; const al = barajar(datos);
    let filas = '';
    for (let r = 0; r < n / cols; r++) { filas += '<tr>'; for (let c = 0; c < cols; c++) { const a = al[r * cols + c]; filas += `<td style="border:2px solid #111;height:60px;text-align:center;width:${100 / cols}%">${a ? a.t : ''}</td>`; } filas += '</tr>'; }
    return `<div style="text-align:center;border:2px solid #111;padding:8px;margin-bottom:14px">Pizarra</div><table style="width:100%;border-collapse:separate;border-spacing:8px">${filas}</table>`;
  }
};

export default [plano];
