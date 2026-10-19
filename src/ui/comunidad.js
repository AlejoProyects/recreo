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

export function vistaComunidad(raiz) {
  const main = pagina(raiz);
  let q = '', etiqueta = '';
  const grid = el('div', { class: 'mis-grid' });
  const chips = el('div', { class: 'fila' });
  const todas = [...new Set(EJEMPLOS.flatMap((e) => e.etiquetas))].sort((a, b) => a.localeCompare(b, 'es'));

  function pintar() {
    limpiar(grid); limpiar(chips);
    chips.append(el('button', { class: 'etiqueta-btn' + (!etiqueta ? ' act' : ''), text: 'Todas', on: { click: () => { etiqueta = ''; pintar(); } } }),
      ...todas.map((t) => el('button', { class: 'etiqueta-btn' + (etiqueta === t ? ' act' : ''), text: t, on: { click: () => { etiqueta = t; pintar(); } } })));
    const f = sinAcentos(q).toLowerCase();
    const l = EJEMPLOS.filter((e) => (!etiqueta || e.etiquetas.includes(etiqueta)) && (!f || sinAcentos(e.titulo + ' ' + e.etiquetas.join(' ')).toLowerCase().includes(f)));
    if (!l.length) grid.append(el('p', { class: 'sub', text: 'No hay actividades que coincidan.' }));
    l.forEach((e) => {
      const p = plantillaPorId(e.plantilla);
      if (!p) return;
      grid.append(el('div', { class: 'mis-card' }, [
        el('a', { class: 'mis-top', attrs: { href: '#/e/' + e.id } }, [iconoPlantilla(p), el('div', {}, [el('b', { text: e.titulo }), el('small', { text: `${p.nombre} · ${cuenta(e.tipo, e.contenido)} elementos` })])]),
        el('div', {}, e.etiquetas.map((t) => el('span', { class: 'etiqueta', text: t }))),
        el('div', { class: 'fila' }, [
          el('a', { class: 'btn btn-mini', text: '▶ Jugar', attrs: { href: '#/e/' + e.id } }),
          el('button', { class: 'btn btn-claro btn-mini', text: 'Copiar y editar', on: { click: async () => {
            const act = { ...JSON.parse(JSON.stringify(e)), id: uid(), opciones: opcionesIniciales(p), fuente: 'auto', creado: Date.now(), modificado: Date.now() };
            await actividades.guardar(act); aviso('Copia guardada en Mis actividades'); ir('/editar/' + act.id);
          } } })
        ])
      ]));
    });
  }

  main.append(
    el('div', { class: 'tarjeta' }, [
      el('div', { class: 'fila entre' }, [el('h1', { text: 'Comunidad' }), el('input', { attrs: { type: 'search', placeholder: 'Buscar actividades públicas…' }, style: { maxWidth: '420px' }, on: { input: (ev) => { q = ev.target.value; pintar(); } } })]),
      el('p', { class: 'sub', text: 'Actividades de ejemplo listas para jugar, copiar y adaptar. Las actividades que otros te compartan por enlace o archivo también se abren aquí.' }),
      el('h3', { text: 'Explorar por etiqueta', style: { margin: '14px 0 8px' } }), chips
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
