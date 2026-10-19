'use strict';

import { el } from '../core/util.js';
import { actual } from '../core/router.js';
import { NOMBRE } from '../nombre.js';
import { COLORES, colorActual, temaActual, alternarTema, fijarColor, marcaSvg } from '../core/tema.js';

const NAV = [['/', 'Inicio'], ['/funciones', 'Funciones'], ['/mis', 'Mis actividades'], ['/listas', 'Listas'], ['/resultados', 'Mis resultados']];

const marca = () => el('a', { class: 'logo', attrs: { href: '#/' }, html: marcaSvg() + `<span>${NOMBRE}</span>` });

// Botón de tema (claro/oscuro) y paleta de colores.
function controlTema() {
  const caja = el('div', { class: 'tema-ctl' });
  const boton = el('button', { class: 'ico-btn', attrs: { type: 'button', title: 'Cambiar entre tema claro y oscuro' }, on: { click: () => { alternarTema(); pintarIcono(); } } });
  const pintarIcono = () => { boton.textContent = temaActual() === 'oscuro' ? '☀' : '☾'; boton.title = temaActual() === 'oscuro' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'; };
  pintarIcono();
  const paleta = el('div', { class: 'paleta', attrs: { hidden: true } });
  const pintarPaleta = () => {
    paleta.replaceChildren(...COLORES.map((c) => el('button', { class: c.id === colorActual() ? 'act' : '', style: { '--c': c.c }, attrs: { type: 'button' }, on: { click: () => { fijarColor(c.id); pintarPaleta(); } } }, [el('i'), c.nombre])));
  };
  pintarPaleta();
  const color = el('button', { class: 'ico-btn', attrs: { type: 'button', title: 'Elegir color del tema' }, text: '◑', on: { click: (e) => { e.stopPropagation(); paleta.hidden = !paleta.hidden; } } });
  document.addEventListener('click', (e) => { if (!caja.contains(e.target)) paleta.hidden = true; });
  caja.append(boton, color, paleta);
  return caja;
}

export function cabecera() {
  const { ruta } = actual();
  const enlaces = NAV.map(([r, t]) => el('a', { class: ruta === r ? 'act' : '', text: t, attrs: { href: '#' + r } }));
  return el('header', { class: 'cab' }, [
    marca(),
    el('span', { class: 'lema', text: 'Juega, aprende y repite' }),
    el('span', { class: 'esp' }),
    el('nav', {}, [...enlaces, controlTema(), el('a', { class: 'btn', text: 'Crear actividad', attrs: { href: '#/crear' } })])
  ]);
}

export function pie() {
  return el('footer', { class: 'pie' }, [
    marca(), el('span', { text: 'Actividades interactivas e imprimibles para el aula' }),
    el('a', { text: 'Funciones', attrs: { href: '#/funciones' } }),
    el('a', { text: 'Crear', attrs: { href: '#/crear' } })
  ]);
}

// Envuelve una vista con cabecera y pie; devuelve el contenedor de contenido.
export function pagina(raiz, { ancho = true } = {}) {
  const main = el('main', { class: ancho ? 'contenedor' : '' });
  raiz.append(cabecera(), main, pie());
  return main;
}
