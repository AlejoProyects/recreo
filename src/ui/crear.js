'use strict';

import { el, limpiar, sinAcentos } from '../core/util.js';
import { pagina } from './layout.js';
import { PLANTILLAS } from '../plantillas.js';
import { ir } from '../core/router.js';

export const pasos = (n) => el('ol', { class: 'pasos-barra' }, ['Elige una plantilla', 'Introduce el contenido', 'Juega'].map((t, i) =>
  el('li', { class: i + 1 === n ? 'act' : i + 1 < n ? 'hecho' : '' }, [el('b', { text: String(i + 1) }), t])));

export function iconoPlantilla(p) {
  return el('span', { class: 'plt-ico', style: { '--c': p.color }, text: p.icono });
}

export function tarjetaPlantilla(p, onClick) {
  return el('a', { class: 'plt', attrs: { href: '#/crear/' + p.id }, on: onClick ? { click: (e) => { e.preventDefault(); onClick(p); } } : {} }, [
    iconoPlantilla(p),
    el('span', { class: 'plt-t' }, [el('b', { text: p.nombre }), el('small', { text: p.descripcion })])
  ]);
}

export function vistaCrear(raiz) {
  const main = pagina(raiz);
  let orden = 'rec', q = '';
  const lista = el('div', { class: 'plantillas-grid' });
  const buscar = el('input', { attrs: { type: 'search', placeholder: 'Buscar plantillas…' }, on: { input: (e) => { q = e.target.value; pintar(); } } });
  const selOrden = el('select', { on: { change: (e) => { orden = e.target.value; pintar(); } } }, [
    el('option', { attrs: { value: 'rec' }, text: 'Recomendadas' }), el('option', { attrs: { value: 'alfa' }, text: 'Alfabético' })]);

  function pintar() {
    limpiar(lista);
    const f = sinAcentos(q).toLowerCase();
    let l = PLANTILLAS.filter((p) => !f || sinAcentos(p.nombre + ' ' + p.descripcion).toLowerCase().includes(f));
    if (orden === 'alfa') l = l.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    if (!l.length) lista.append(el('p', { class: 'sub', text: 'No hay plantillas que coincidan.' }));
    l.forEach((p) => lista.append(tarjetaPlantilla(p)));
  }
  main.append(
    pasos(1),
    el('div', { class: 'tarjeta' }, [
      el('div', { class: 'fila entre' }, [el('h2', { text: 'Elige una plantilla' }), el('span', { class: 'sub', text: PLANTILLAS.length + ' plantillas, todas incluidas' })]),
      el('div', { class: 'fila', style: { marginBottom: '16px' } }, [el('div', { style: { flex: 1, minWidth: '200px' } }, [buscar]), el('label', { class: 'sub', text: 'Ordenar por: ' }), selOrden]),
      lista
    ])
  );
  pintar();
}
