'use strict';

import { el, aviso, escapar, barajar } from '../core/util.js';
import { codificar, sinImagenes, paquete, urlBase } from '../core/codec.js';
import { contenidoParaJugar } from '../core/contenido.js';
import { NOMBRE } from '../nombre.js';
import { actividades } from '../core/almacen.js';
import { EDADES, ASIGNATURAS, metaDe } from '../core/etiquetas.js';

function modal(titulo, cuerpo, acciones = []) {
  const fondo = el('div', { class: 'modal-fondo', on: { click: (e) => { if (e.target === fondo) fondo.remove(); } } }, [
    el('div', { class: 'modal' }, [el('h2', { text: titulo }), ...[].concat(cuerpo), el('div', { class: 'acciones' }, [...acciones, el('button', { class: 'btn btn-claro', text: 'Cerrar', on: { click: () => fondo.remove() } })])])
  ]);
  document.body.appendChild(fondo);
  return fondo;
}
async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); aviso('Copiado al portapapeles'); }
  catch (_) { aviso('No se pudo copiar automáticamente; selecciónalo y copia con Ctrl+C'); }
}
const tieneImagenes = (act) => JSON.stringify(act.contenido).includes('data:image');

// Enlace compartible. Si incluye imágenes puede ser muy largo: se ofrece también la versión sin imágenes.
async function enlaceDe(act, { imagenes, tarea } = {}) {
  const datos = imagenes ? paquete(act) : sinImagenes(act);
  if (tarea) datos.tarea = tarea;
  return `${urlBase()}#/c/${await codificar(datos)}`;
}

export async function compartir(act, { propia = false, alGuardar = null } = {}) {
  const campo = el('input', { attrs: { type: 'text', readonly: true }, on: { focus: (e) => e.target.select() } });
  const nota = el('p', { class: 'sub' });
  let conImg = false;
  const pintar = async () => {
    const url = await enlaceDe(act, { imagenes: conImg });
    campo.value = url;
    nota.textContent = `Enlace de ${url.length.toLocaleString('es')} caracteres. El contenido viaja dentro del propio enlace: no se sube a ningún servidor.`;
    return url;
  };
  const hay = tieneImagenes(act);
  const chk = hay ? el('label', { class: 'chk' }, [el('input', { attrs: { type: 'checkbox' }, on: { change: (e) => { conImg = e.target.checked; pintar(); } } }), ' Incluir las imágenes (el enlace será mucho más largo)']) : null;

  // Datos para publicar (solo en actividades propias): título, franja de edad, asignatura, tema y visibilidad.
  let meta = null, cuerpoMeta = null;
  if (propia) {
    const m = metaDe(act);
    meta = { titulo: act.titulo, edad: new Set(m.edad), asig: new Set(m.asig), tema: act.tema || '', publica: !!act.publica };
    const chips = (lista, set) => el('div', { class: 'chips-meta' }, lista.map((t) => {
      const b = el('button', { class: 'etiqueta-btn' + (set.has(t) ? ' act' : ''), attrs: { type: 'button' }, text: t, on: { click: () => { set.has(t) ? set.delete(t) : set.add(t); b.classList.toggle('act'); } } });
      return b;
    }));
    cuerpoMeta = el('div', { class: 'meta-pub' }, [
      el('label', { class: 'campo', text: 'Título del recurso' }), el('input', { attrs: { type: 'text', maxlength: 80 }, value: meta.titulo, on: { input: (e) => { meta.titulo = e.target.value; } } }),
      el('label', { class: 'campo', text: 'Franja de edad' }), chips(EDADES, meta.edad),
      el('label', { class: 'campo', text: 'Asignatura' }), chips(ASIGNATURAS, meta.asig),
      el('label', { class: 'campo', text: 'Tema' }), el('input', { attrs: { type: 'text', maxlength: 60, placeholder: 'Ej.: Fracciones' }, value: meta.tema, on: { input: (e) => { meta.tema = e.target.value; } } }),
      el('div', { class: 'fila', style: { marginTop: '10px' } }, [
        el('label', { class: 'chk' }, [el('input', { attrs: { type: 'radio', name: 'vis' }, checked: !meta.publica, on: { change: () => { meta.publica = false; } } }), ' Privada (solo en este dispositivo)']),
        el('label', { class: 'chk' }, [el('input', { attrs: { type: 'radio', name: 'vis' }, checked: meta.publica, on: { change: () => { meta.publica = true; } } }), ' Publicar en la Comunidad'])
      ])
    ]);
  }
  const guardarMeta = async () => {
    act.titulo = (meta.titulo || '').trim() || act.titulo;
    act.edad = [...meta.edad]; act.asignaturas = [...meta.asig]; act.tema = meta.tema.trim(); act.publica = meta.publica;
    act.etiquetas = [...act.edad, ...act.asignaturas, ...(act.tema ? [act.tema] : [])];
    act.modificado = Date.now();
    await actividades.guardar(act);
    aviso(act.publica ? 'Publicada en la Comunidad de este dispositivo' : 'Guardada como privada');
    if (alGuardar) alGuardar();
  };

  modal('Compartir recurso', [
    cuerpoMeta,
    el('h3', { text: 'Enlace', style: { margin: '14px 0 6px' } }),
    el('p', { text: 'Cualquiera con este enlace podrá jugar tu actividad y guardar una copia para editarla.' }), campo, chk, nota
  ], [
    el('button', { class: 'btn btn-claro', text: 'Descargar archivo', on: { click: () => descargar(act) } }),
    el('button', { class: 'btn btn-claro', text: 'Copiar enlace', on: { click: () => copiar(campo.value) } }),
    propia ? el('button', { class: 'btn', text: 'Guardar datos', on: { click: guardarMeta } }) : null
  ].filter(Boolean));
  await pintar();
}

export function descargar(act) {
  const a = el('a', { attrs: { href: URL.createObjectURL(new Blob([JSON.stringify(paquete(act))], { type: 'application/json' })), download: (act.titulo || 'actividad').replace(/[^\w\- áéíóúñ]/gi, '') + '.ajuega.json' } });
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export async function incrustar(act) {
  const tam = el('select', {}, [['800x500', 'Mediano 800 × 500'], ['640x400', 'Pequeño 640 × 400'], ['1000x625', 'Grande 1000 × 625']].map(([v, t]) => el('option', { attrs: { value: v }, text: t })));
  const area = el('textarea', { attrs: { rows: 4, readonly: true }, on: { focus: (e) => e.target.select() } });
  const url = (await enlaceDe(act, { imagenes: false })).replace('#/c/', '#/embed/');
  const pintar = () => { const [w, h] = tam.value.split('x'); area.value = `<iframe src="${url}" width="${w}" height="${h}" style="border:0" allowfullscreen></iframe>`; };
  tam.onchange = pintar; pintar();
  modal('Incrustar en un sitio web', [
    el('p', { text: 'Copia este código HTML y pégalo en tu blog, aula virtual o página web.' }), el('label', { class: 'campo', text: 'Tamaño' }), tam, el('br'), el('br'), area,
    el('p', { class: 'sub', text: 'La actividad se incrusta sin imágenes. Funciona cuando esta página está publicada en internet.' })
  ], [el('button', { class: 'btn', text: 'Copiar código', on: { click: () => copiar(area.value) } })]);
}

export async function definirTarea(act) {
  const campo = el('input', { attrs: { type: 'text', readonly: true }, on: { focus: (e) => e.target.select() } });
  const tarea = { id: act.id, titulo: act.titulo, creada: Date.now() };
  campo.value = await enlaceDe(act, { imagenes: false, tarea });
  modal('Definir tarea', [
    el('p', { text: 'Envía este enlace a tus alumnos. Al abrirlo escribirán su nombre y jugarán la actividad.' }),
    campo,
    el('p', { class: 'sub', html: 'Al terminar, cada alumno recibe un <b>código de resultado</b> que te entrega. Pégalo en <a href="#/resultados">Mis resultados</a> para registrarlo.' })
  ], [el('button', { class: 'btn', text: 'Copiar enlace', on: { click: () => copiar(campo.value) } })]);
}

// ---------------------------------------------------------------------------
// Impresión: la plantilla puede aportar su propia hoja (crucigrama, sopa de letras...);
// si no, se genera una genérica a partir del tipo de contenido.
// ---------------------------------------------------------------------------
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const hueco = (t) => escapar(t).replace(/\[[^\]]*\]/g, '<span class="lin">&nbsp;</span>');

export const HOJAS = {
  quiz: (c) => `<ol class="q">${c.map((q) => `<li><b>${escapar(q.q)}</b>${q.img ? `<br><img src="${q.img}" class="im">` : ''}<ul class="op">${q.resp.map((r, i) => `<li>${LETRAS[i]}) ${escapar(r.t)}</li>`).join('')}</ul></li>`).join('')}</ol>`,
  pares: (c) => {
    const der = barajar(c.map((p) => p.b));
    return `<div class="dos"><ol>${c.map((p) => `<li>${escapar(p.a)} <span class="lin corta">&nbsp;</span></li>`).join('')}</ol><ul class="sl">${der.map((b, i) => `<li>${LETRAS[i % 26]}) ${escapar(b)}</li>`).join('')}</ul></div>`;
  },
  lista: (c) => `<ol>${c.map((x) => `<li>${escapar(x.t)}${x.img ? ` <img src="${x.img}" class="im">` : ''}</li>`).join('')}</ol>`,
  grupos: (c) => `<p><b>Palabras:</b> ${barajar(c.flatMap((g) => g.items.map((i) => i.t))).map(escapar).join(' · ')}</p><div class="cols">${c.map((g) => `<div class="caja"><b>${escapar(g.nombre)}</b></div>`).join('')}</div>`,
  oraciones: (c) => {
    const pal = c.flatMap((o) => [...o.t.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]));
    return `${pal.length ? `<p><b>Banco de palabras:</b> ${barajar(pal).map(escapar).join(' · ')}</p>` : ''}<ol>${c.map((o) => `<li>${hueco(o.t)}</li>`).join('')}</ol>`;
  },
  vf: (c) => `<ol>${c.map((x) => `<li>${escapar(x.t)} &nbsp; <b>V / F</b></li>`).join('')}</ol>`,
  diagrama: (c) => `<div class="diag"><img src="${c.img}">${c.pins.map((p, i) => `<span class="pin" style="left:${p.x}%;top:${p.y}%">${i + 1}</span>`).join('')}</div><ol>${c.pins.map(() => '<li><span class="lin">&nbsp;</span></li>').join('')}</ol>`
};

const ESTILO_HOJA = `*{box-sizing:border-box}body{font-family:Nunito,'Segoe UI',sans-serif;color:#111;margin:24px 32px;font-size:15px;line-height:1.6}
h1{font-size:24px;margin:0 0 2px}.sub{color:#555;margin:0 0 18px}.lin{display:inline-block;min-width:140px;border-bottom:1px solid #111}.lin.corta{min-width:90px}
ol.q>li{margin-bottom:14px}ul.op{list-style:none;padding-left:18px;margin:4px 0}.dos{display:flex;gap:60px}.sl{list-style:none}.im{max-height:90px;vertical-align:middle}
.cols{display:flex;gap:12px}.caja{flex:1;min-height:170px;border:2px solid #111;padding:8px}.diag{position:relative;display:inline-block;max-width:80%}.diag img{max-width:100%}
.pin{position:absolute;transform:translate(-50%,-50%);background:#e11;color:#fff;border-radius:50%;width:22px;height:22px;text-align:center;font-weight:700;font-size:13px;line-height:22px}
.pie{margin-top:30px;color:#888;font-size:12px}table.cw{border-collapse:collapse}table.cw td{width:28px;height:28px;border:1px solid #111;font-size:11px;position:relative;vertical-align:top}
table.cw td.v{border:none}table.cw td sup{position:absolute;top:0;left:1px;font-size:9px}table.ws td{width:26px;height:26px;text-align:center;font-weight:700;border:none}`;

export function imprimir(act, plantilla) {
  const { tipo, datos } = contenidoParaJugar(plantilla, act);
  if (!tipo || !datos) { aviso('No hay contenido suficiente para imprimir'); return; }
  let cuerpo;
  try { cuerpo = plantilla.imprimir ? plantilla.imprimir(datos, act.opciones) : HOJAS[tipo] ? HOJAS[tipo](datos) : '<p>Sin vista imprimible</p>'; }
  catch (e) { cuerpo = `<p>No se pudo generar la hoja: ${escapar(e.message)}</p>`; }
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>${escapar(act.titulo)}</title><style>${ESTILO_HOJA}</style></head><body>
    <h1>${escapar(act.titulo)}</h1><p class="sub">${escapar(plantilla.nombre)} · Nombre: ____________________ Fecha: __________</p>${cuerpo}<p class="pie">${escapar(NOMBRE)}</p></body></html>`;
  const f = el('iframe', { style: 'position:fixed;width:0;height:0;border:0' });
  f.srcdoc = html;
  f.onload = () => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 60000); };
  document.body.appendChild(f);
}
