'use strict';

import { el } from '../core/util.js';
import { actual } from '../core/router.js';
import { NOMBRE } from '../nombre.js';

const NAV = [['/', 'Inicio'], ['/funciones', 'Funciones'], ['/comunidad', 'Comunidad'], ['/mis', 'Mis actividades'], ['/resultados', 'Mis resultados']];

export function cabecera() {
  const { ruta } = actual();
  const enlaces = NAV.map(([r, t]) => el('a', { class: ruta === r ? 'act' : '', text: t, attrs: { href: '#' + r } }));
  return el('header', { class: 'cab' }, [
    el('a', { class: 'logo', attrs: { href: '#/' } }, [el('i', {}, [el('b'), el('b'), el('b'), el('b')]), NOMBRE]),
    el('span', { class: 'lema', text: 'Crea mejores lecciones de forma más rápida' }),
    el('span', { class: 'esp' }),
    el('nav', {}, [...enlaces, el('a', { class: 'btn', text: 'Crear actividad', attrs: { href: '#/crear' } })])
  ]);
}

export function pie() {
  return el('footer', { class: 'pie' }, [
    el('span', { text: NOMBRE + ' · Actividades interactivas e imprimibles para el aula' }),
    el('a', { text: 'Funciones', attrs: { href: '#/funciones' } }),
    el('a', { text: 'Comunidad', attrs: { href: '#/comunidad' } }),
    el('a', { text: 'Crear', attrs: { href: '#/crear' } })
  ]);
}

// Envuelve una vista con cabecera y pie; devuelve el contenedor de contenido.
export function pagina(raiz, { ancho = true } = {}) {
  const main = el('main', { class: ancho ? 'contenedor' : '' });
  raiz.append(cabecera(), main, pie());
  return main;
}
