'use strict';

import { el, limpiar, uid, aviso } from '../core/util.js';
import { pagina } from './layout.js';
import { actividades, pref } from '../core/almacen.js';
import { EJEMPLOS } from '../datos/ejemplos.js';
import { plantillaPorId } from '../plantillas.js';
import { iconoPlantilla } from './crear.js';
import { ir } from '../core/router.js';

// Listas de reproducción: secuencias de actividades que se juegan una tras otra.
// Se guardan en este dispositivo: [{id, nombre, items: [{id, ej}]}] (ej = actividad de ejemplo).
export const leerListas = () => pref.leer('listas', []);
export const guardarListas = (l) => pref.guardar('listas', l);

export const urlItem = (it, lista, n) => `#/${it.ej ? 'e' : 'a'}/${it.id}?lista=${lista.id}&n=${n}`;

export async function titulosDe(items) {
  const propias = new Map((await actividades.todos()).map((a) => [a.id, a]));
  return items.map((it) => { const a = it.ej ? EJEMPLOS.find((e) => e.id === it.id) : propias.get(it.id); return a ? { it, a } : null; });
}

// Tarjeta de la página de actividad: añadir la actividad actual a una lista.
export function tarjetaLista(act, esEjemplo) {
  const caja = el('div', { class: 'panel' }, [el('h3', { text: 'Lista de reproducción' })]);
  const pintar = () => {
    limpiar(caja); caja.append(el('h3', { text: 'Lista de reproducción' }));
    const ls = leerListas();
    const sel = el('select', {}, [...ls.map((l) => el('option', { attrs: { value: l.id }, text: `${l.nombre} (${l.items.length})` })), el('option', { attrs: { value: '__nueva' }, text: '+ Nueva lista…' })]);
    caja.append(el('p', { class: 'sub', text: 'Junta varias actividades y juégalas una tras otra.' }), sel,
      el('div', { class: 'fila', style: { marginTop: '10px' } }, [
        el('button', { class: 'btn btn-mini', text: 'Añadir esta actividad', on: { click: () => {
          let todas = leerListas(); let l;
          if (sel.value === '__nueva') { const n = (prompt('Nombre de la lista:') || '').trim().slice(0, 50); if (!n) return; l = { id: uid(), nombre: n, items: [] }; todas.push(l); }
          else l = todas.find((x) => x.id === sel.value);
          if (l.items.some((i) => i.id === act.id)) return aviso('Ya está en esa lista');
          l.items.push({ id: act.id, ej: !!esEjemplo }); guardarListas(todas); aviso(`Añadida a "${l.nombre}"`); pintar();
        } } }),
        el('a', { class: 'enlace-btn', text: 'Gestionar listas', attrs: { href: '#/listas' } })
      ]));
  };
  pintar();
  return caja;
}

export async function vistaListas(raiz) {
  const main = pagina(raiz);
  const cuerpo = el('div');
  async function pintar() {
    limpiar(cuerpo);
    const ls = leerListas();
    if (!ls.length) cuerpo.append(el('div', { class: 'tarjeta' }, [el('p', { class: 'sub', text: 'Todavía no tienes listas. Crea una aquí o usa "Añadir esta actividad" en la página de cualquier actividad.' })]));
    for (const l of ls) {
      const filas = (await titulosDe(l.items)).map((x, i) => x && el('div', { class: 'lista-fila' }, [
        el('span', { class: 'ed-n', text: String(i + 1) }), iconoPlantilla(plantillaPorId(x.a.plantilla)), el('b', { text: x.a.titulo }),
        el('span', { class: 'esp' }),
        el('button', { class: 'ed-mini', attrs: { title: 'Subir' }, text: '▲', on: { click: () => { if (i > 0) { [l.items[i - 1], l.items[i]] = [l.items[i], l.items[i - 1]]; guardarListas(ls); pintar(); } } } }),
        el('button', { class: 'ed-mini', attrs: { title: 'Bajar' }, text: '▼', on: { click: () => { if (i < l.items.length - 1) { [l.items[i + 1], l.items[i]] = [l.items[i], l.items[i + 1]]; guardarListas(ls); pintar(); } } } }),
        el('button', { class: 'ed-mini', attrs: { title: 'Quitar de la lista' }, text: '✕', on: { click: () => { l.items.splice(i, 1); guardarListas(ls); pintar(); } } })
      ]));
      // actividades que se pueden añadir
      const propias = (await actividades.todos()).filter((a) => !a.papelera);
      const opciones = [...propias.map((a) => ({ id: a.id, ej: false, t: a.titulo })), ...EJEMPLOS.map((e) => ({ id: e.id, ej: true, t: e.titulo + ' (ejemplo)' }))].filter((o) => !l.items.some((i) => i.id === o.id));
      const sel = el('select', {}, opciones.map((o, k) => el('option', { attrs: { value: String(k) }, text: o.t })));
      cuerpo.append(el('div', { class: 'tarjeta' }, [
        el('div', { class: 'fila entre' }, [el('h3', { text: l.nombre }), el('div', { class: 'fila' }, [
          el('button', { class: 'btn btn-mini', text: '▶ Reproducir', attrs: { disabled: !l.items.length }, on: { click: () => ir(urlItem(l.items[0], l, 0).slice(1)) } }),
          el('button', { class: 'btn btn-claro btn-mini', text: 'Cambiar nombre', on: { click: () => { const n = (prompt('Nuevo nombre:', l.nombre) || '').trim(); if (n) { l.nombre = n.slice(0, 50); guardarListas(ls); pintar(); } } } }),
          el('button', { class: 'btn btn-peligro btn-mini', text: 'Eliminar lista', on: { click: () => { if (confirm(`¿Eliminar la lista "${l.nombre}"?`)) { guardarListas(ls.filter((x) => x !== l)); pintar(); } } } })])]),
        ...filas.filter(Boolean),
        el('div', { class: 'fila', style: { marginTop: '12px' } }, [el('div', { style: { flex: 1, minWidth: '200px' } }, [sel]),
          el('button', { class: 'btn btn-claro btn-mini', text: 'Añadir', attrs: { disabled: !opciones.length }, on: { click: () => { const o = opciones[+sel.value]; if (o) { l.items.push({ id: o.id, ej: o.ej }); guardarListas(ls); pintar(); } } } })])
      ]));
    }
  }
  main.append(el('div', { class: 'tarjeta' }, [
    el('div', { class: 'fila entre' }, [el('h1', { text: 'Listas de reproducción' }), el('button', { class: 'btn', text: '+ Nueva lista', on: { click: () => { const n = (prompt('Nombre de la lista:') || '').trim().slice(0, 50); if (!n) return; guardarListas([...leerListas(), { id: uid(), nombre: n, items: [] }]); pintar(); } } })]),
    el('p', { class: 'sub', text: 'Agrupa actividades y juégalas en secuencia, por ejemplo para una clase completa.' })
  ]), cuerpo);
  pintar();
}
