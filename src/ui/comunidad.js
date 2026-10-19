'use strict';

import { el, limpiar, sinAcentos, aviso, uid } from '../core/util.js';
import { pagina } from './layout.js';
import { EJEMPLOS } from '../datos/ejemplos.js';
import { plantillaPorId } from '../plantillas.js';
import { iconoPlantilla } from './crear.js';
import { cuenta } from '../core/contenido.js';
import { actividades } from '../core/almacen.js';
import { opcionesIniciales } from '../juegos/ayudas.js';
import { ir } from '../core/router.js';
import { importarArchivo } from './mis.js';
import { metaDe, EDADES, ASIGNATURAS } from '../core/etiquetas.js';

export async function vistaComunidad(raiz) {
  const main = pagina(raiz);
  let q = '', edad = '', asig = '';
  const grid = el('div', { class: 'mis-grid' });
  const filtros = el('div');
  // ejemplos incluidos + actividades que el usuario publicó en este dispositivo
  const propias = (await actividades.todos()).filter((a) => a.publica && !a.papelera).map((a) => ({ ...a, _propia: true }));
  const todas = [...propias, ...EJEMPLOS.map((e) => ({ ...e, _propia: false }))].map((a) => ({ ...a, _meta: metaDe(a) }));
  const usadas = (k, orden) => orden.filter((t) => todas.some((a) => a._meta[k].includes(t)));

  function chips(titulo, lista, actual, fijar) {
    return el('div', { class: 'filtro-fila' }, [el('b', { text: titulo }), el('div', { class: 'fila', style: { gap: '6px' } }, [
      el('button', { class: 'etiqueta-btn' + (!actual ? ' act' : ''), text: 'Todas', on: { click: () => { fijar(''); pintar(); } } }),
      ...lista.map((t) => el('button', { class: 'etiqueta-btn' + (actual === t ? ' act' : ''), text: t, on: { click: () => { fijar(t); pintar(); } } }))])]);
  }

  function pintar() {
    limpiar(grid); limpiar(filtros);
    filtros.append(chips('Franjas de edad', usadas('edad', EDADES), edad, (v) => { edad = v; }), chips('Asignaturas', usadas('asig', ASIGNATURAS), asig, (v) => { asig = v; }));
    const f = sinAcentos(q).toLowerCase();
    const l = todas.filter((a) => (!edad || a._meta.edad.includes(edad)) && (!asig || a._meta.asig.includes(asig))
      && (!f || sinAcentos(a.titulo + ' ' + a._meta.temas.join(' ') + ' ' + a._meta.asig.join(' ')).toLowerCase().includes(f)));
    if (!l.length) grid.append(el('p', { class: 'sub', text: 'No hay actividades que coincidan.' }));
    l.forEach((e) => {
      const p = plantillaPorId(e.plantilla);
      if (!p) return;
      const etiquetas = [...e._meta.edad, ...e._meta.asig, ...e._meta.temas];
      const abrir = e._propia ? '#/a/' + e.id : '#/e/' + e.id;
      grid.append(el('div', { class: 'mis-card' }, [
        el('a', { class: 'mis-top', attrs: { href: abrir } }, [iconoPlantilla(p), el('div', {}, [el('b', { text: e.titulo }), el('small', { text: `${p.nombre} · ${cuenta(e.tipo, e.contenido)} elementos${e._propia ? ' · Tuya' : ''}` })])]),
        el('div', {}, etiquetas.map((t) => el('span', { class: 'etiqueta', text: t }))),
        el('div', { class: 'fila' }, [
          el('a', { class: 'btn btn-mini', text: '▶ Jugar', attrs: { href: abrir } }),
          e._propia ? null : el('button', { class: 'btn btn-claro btn-mini', text: 'Copiar y editar', on: { click: async () => {
            const act = { ...JSON.parse(JSON.stringify(e)), id: uid(), opciones: opcionesIniciales(p), fuente: 'auto', creado: Date.now(), modificado: Date.now() };
            delete act._meta; delete act._propia;
            await actividades.guardar(act); aviso('Copia guardada en Mis actividades'); ir('/editar/' + act.id);
          } } })
        ])
      ]));
    });
  }

  main.append(
    el('div', { class: 'tarjeta' }, [
      el('div', { class: 'fila entre' }, [el('h1', { text: 'Comunidad' }), el('input', { attrs: { type: 'search', placeholder: 'Buscar actividades públicas…' }, style: { maxWidth: '420px' }, on: { input: (ev) => { q = ev.target.value; pintar(); } } })]),
      el('p', { class: 'sub', text: 'Actividades de ejemplo y las que tú publiques desde "Compartir". Las que otros te envíen por enlace o archivo también se abren aquí.' }),
      el('h3', { text: 'Explorar por etiqueta', style: { margin: '14px 0 8px' } }), filtros
    ]),
    el('div', { class: 'tarjeta' }, [grid]),
    el('div', { class: 'tarjeta' }, [
      el('h3', { text: '¿Te compartieron una actividad?' }),
      el('p', { class: 'sub', text: 'Si te enviaron un enlace, ábrelo directamente. Si te enviaron un archivo, impórtalo.' }),
      el('button', { class: 'btn btn-claro', text: 'Importar archivo de actividad', on: { click: async () => { const a = await importarArchivo(); if (a) ir('/a/' + a.id); } } })
    ])
  );
  pintar();
}
