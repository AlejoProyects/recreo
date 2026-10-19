'use strict';

import { el, limpiar } from '../core/util.js';
import { ESTILOS, FUENTES, miniatura } from '../core/estilos.js';
import { PLANTILLAS } from '../plantillas.js';
import { tipoPara } from '../core/contenido.js';
import { pref } from '../core/almacen.js';
import { iconoPlantilla } from './crear.js';

export const estiloRecordado = () => pref.leer('estilo', 'clasico');
export const recordarEstilo = (id) => pref.guardar('estilo', id);

// ---- Cambiar plantilla ----
export function panelPlantillas(act, alElegir) {
  const compat = PLANTILLAS.filter((p) => tipoPara(p, act.tipo));
  const caja = el('div', { class: 'panel' }, [el('h3', { text: 'Cambiar plantilla' })]);
  // la plantilla actual va siempre primera (se recalcula en cada pintado)
  const ordenadas = () => [...compat.filter((p) => p.id === act.plantilla), ...compat.filter((p) => p.id !== act.plantilla)];
  const lista = el('div', { class: 'cambia-lista' });
  let todo = false;
  const pintar = () => {
    limpiar(lista);
    const vis = todo ? ordenadas() : ordenadas().slice(0, 5);
    vis.forEach((p) => lista.append(el('button', { class: 'cambia-it' + (p.id === act.plantilla ? ' act' : ''), on: { click: () => alElegir(p) } }, [iconoPlantilla(p), el('span', { text: p.nombre })])));
    if (compat.length > 5) lista.append(el('button', { class: 'enlace-btn cambia-mas', text: todo ? 'Mostrar menos' : 'Mostrar todo', on: { click: () => { todo = !todo; pintar(); } } }));
  };
  pintar();
  caja.append(lista);
  return caja;
}

// ---- Estilo visual + fuentes ----
export function panelEstilo(act, alCambiar) {
  const caja = el('div', { class: 'panel' }, [el('h3', { text: 'Estilo visual' })]);
  const grid = el('div', { class: 'estilos-grid' });
  const pintar = () => {
    limpiar(grid);
    ESTILOS.forEach((e) => grid.append(el('button', { class: 'estilo-op' + (e.id === act.estilo ? ' act' : ''), attrs: { title: e.nombre }, on: { click: () => { act.estilo = e.id; recordarEstilo(e.id); pintar(); alCambiar(); } } }, [
      miniatura(e.id), el('span', { text: e.nombre })])));
  };
  pintar();
  const sel = el('select', { on: { change: (e) => { act.fuente = e.target.value; alCambiar(); } } }, [
    el('option', { attrs: { value: 'auto', selected: !act.fuente || act.fuente === 'auto' }, text: 'Según el estilo' }),
    ...FUENTES.map((f) => el('option', { attrs: { value: f.id, selected: act.fuente === f.id }, text: f.nombre, style: { fontFamily: f.css } }))
  ]);
  caja.append(grid, el('h4', { class: 'panel-sub', text: 'Fuentes' }), sel);
  return caja;
}

// ---- Opciones de la plantilla ----
export function panelOpciones(plantilla, act, alCambiar) {
  const caja = el('div', { class: 'panel' }, [el('h3', { text: 'Opciones' })]);
  const specs = plantilla.opciones || [];
  if (!specs.length) { caja.append(el('p', { class: 'sub', text: 'Esta plantilla no tiene opciones.' })); return caja; }
  specs.forEach((s) => {
    const v = act.opciones[s.k] ?? s.def;
    if (s.tipo === 'check') {
      caja.append(el('label', { class: 'chk' }, [el('input', { attrs: { type: 'checkbox' }, checked: !!v, on: { change: (e) => { act.opciones[s.k] = e.target.checked; alCambiar(); } } }), ' ' + s.etiqueta]));
    } else if (s.tipo === 'rango') {
      const etiqueta = (x) => (x === 0 && s.cero) ? s.cero : x + (s.sufijo || '');
      const val = el('b', { text: etiqueta(v) });
      caja.append(el('div', { class: 'opc-rango' }, [
        el('label', { class: 'opc-et' }, [el('span', { text: s.etiqueta }), val]),
        el('input', { attrs: { type: 'range', min: s.min, max: s.max, step: s.paso, value: v }, on: {
          input: (e) => { val.textContent = etiqueta(+e.target.value); },
          change: (e) => { act.opciones[s.k] = +e.target.value; alCambiar(); }
        } })
      ]));
    } else if (s.tipo === 'opcion') {
      caja.append(el('div', { class: 'opc-rango' }, [el('label', { class: 'opc-et', text: s.etiqueta }),
        el('select', { on: { change: (e) => { act.opciones[s.k] = e.target.value; alCambiar(); } } }, s.opciones.map((o) => el('option', { attrs: { value: o.v, selected: o.v === v }, text: o.t })))]));
    }
  });
  return caja;
}
