'use strict';

import { el, limpiar, uid, aviso, sinAcentos } from '../core/util.js';
import { pagina } from './layout.js';
import { actividades } from '../core/almacen.js';
import { plantillaPorId } from '../plantillas.js';
import { iconoPlantilla } from './crear.js';
import { descargar } from './acciones.js';
import { cuenta } from '../core/contenido.js';

// Importa un archivo .ajuega.json (o JSON de actividad) como actividad nueva.
export async function importarArchivo() {
  return new Promise((ok) => {
    const i = el('input', { attrs: { type: 'file', accept: '.json,application/json' } });
    i.onchange = async () => {
      const f = i.files[0]; if (!f) return ok(null);
      try {
        const d = JSON.parse(await f.text());
        if (!plantillaPorId(d.plantilla) || !d.tipo || d.contenido == null) throw new Error('formato');
        const act = { ...d, id: uid(), creado: Date.now(), modificado: Date.now(), publica: false };
        await actividades.guardar(act); ok(act);
      } catch (_) { aviso('El archivo no es una actividad válida'); ok(null); }
    };
    i.oncancel = () => ok(null);
    i.click();
  });
}

export async function copiarActividad(base) {
  const act = { ...JSON.parse(JSON.stringify(base)), id: uid(), creado: Date.now(), modificado: Date.now(), titulo: base.titulo + ' (copia)' };
  delete act.tarea;
  await actividades.guardar(act);
  return act;
}

export async function vistaMis(raiz) {
  const main = pagina(raiz);
  const grid = el('div', { class: 'mis-grid' });
  let todas = [], q = '';

  async function cargar() { todas = (await actividades.todos()).sort((a, b) => b.modificado - a.modificado); pintar(); }
  function pintar() {
    limpiar(grid);
    const f = sinAcentos(q).toLowerCase();
    const l = todas.filter((a) => !f || sinAcentos(a.titulo + ' ' + (a.etiquetas || []).join(' ')).toLowerCase().includes(f));
    if (!todas.length) { grid.append(el('div', { class: 'vacio' }, [el('p', { text: 'Todavía no has creado ninguna actividad.' }), el('a', { class: 'btn btn-grande', text: 'Crear mi primera actividad', attrs: { href: '#/crear' } })])); return; }
    if (!l.length) grid.append(el('p', { class: 'sub', text: 'Nada coincide con la búsqueda.' }));
    l.forEach((a) => {
      const p = plantillaPorId(a.plantilla); if (!p) return;
      grid.append(el('div', { class: 'mis-card' }, [
        el('a', { class: 'mis-top', attrs: { href: '#/a/' + a.id } }, [iconoPlantilla(p), el('div', {}, [el('b', { text: a.titulo }), el('small', { text: `${p.nombre} · ${cuenta(a.tipo, a.contenido)} elementos` })])]),
        el('div', { class: 'mis-fecha sub', text: 'Modificada ' + new Date(a.modificado).toLocaleDateString('es') }),
        el('div', { class: 'fila' }, [
          el('a', { class: 'btn btn-mini', text: '▶ Jugar', attrs: { href: '#/a/' + a.id } }),
          el('a', { class: 'btn btn-claro btn-mini', text: 'Editar', attrs: { href: '#/editar/' + a.id } }),
          el('button', { class: 'btn btn-claro btn-mini', text: 'Duplicar', on: { click: async () => { await copiarActividad(a); aviso('Actividad duplicada'); cargar(); } } }),
          el('button', { class: 'btn btn-claro btn-mini', text: '⬇', attrs: { title: 'Descargar archivo' }, on: { click: () => descargar(a) } }),
          el('button', { class: 'btn btn-peligro btn-mini', text: '🗑', attrs: { title: 'Eliminar' }, on: { click: async () => { if (confirm(`¿Eliminar "${a.titulo}"? No se puede deshacer.`)) { await actividades.borrar(a.id); cargar(); } } } })
        ])
      ]));
    });
  }

  main.append(el('div', { class: 'tarjeta' }, [
    el('div', { class: 'fila entre' }, [el('h2', { text: 'Mis actividades' }), el('div', { class: 'fila' }, [
      el('button', { class: 'btn btn-claro', text: 'Importar archivo', on: { click: async () => { if (await importarArchivo()) { aviso('Actividad importada'); cargar(); } } } }),
      el('a', { class: 'btn', text: '+ Crear actividad', attrs: { href: '#/crear' } })])]),
    el('div', { style: { margin: '14px 0' } }, [el('input', { attrs: { type: 'search', placeholder: 'Buscar en mis actividades…' }, on: { input: (e) => { q = e.target.value; pintar(); } } })]),
    grid
  ]));
  cargar();
}
