'use strict';

import { el, limpiar, uid, aviso } from '../core/util.js';
import { pagina } from './layout.js';
import { pasos, iconoPlantilla } from './crear.js';
import { plantillaPorId } from '../plantillas.js';
import { TIPOS, nuevoItem, contenidoVacio, cuenta } from '../core/contenido.js';
import { actividades } from '../core/almacen.js';
import { ir } from '../core/router.js';
import { opcionesIniciales } from '../juegos/ayudas.js';
import { estiloRecordado } from './selectores.js';

// ---- imágenes: se reducen a 640 px para no inflar el almacenamiento ----
export function elegirImagen() {
  return new Promise((ok) => {
    const i = el('input', { attrs: { type: 'file', accept: 'image/*' } });
    i.onchange = () => {
      const f = i.files[0]; if (!f) return ok(null);
      const r = new FileReader();
      r.onload = () => {
        const im = new Image();
        im.onload = () => {
          const k = Math.min(1, 640 / Math.max(im.width, im.height));
          const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          ok(c.toDataURL(/png|gif|webp/.test(f.type) ? 'image/png' : 'image/jpeg', 0.82));
        };
        im.onerror = () => ok(null); im.src = r.result;
      };
      r.readAsDataURL(f);
    };
    i.oncancel = () => ok(null);
    i.click();
  });
}

function botonImagen(obj, clave, onCambio) {
  const b = el('button', { class: 'ed-img', attrs: { type: 'button', title: 'Añadir imagen' } });
  const pintar = () => { limpiar(b); b.classList.toggle('con', !!obj[clave]); if (obj[clave]) b.append(el('img', { attrs: { src: obj[clave] } })); else b.textContent = '🖼'; };
  b.onclick = async (e) => {
    if (obj[clave] && e.shiftKey) { obj[clave] = null; pintar(); onCambio && onCambio(); return; }
    const d = await elegirImagen(); if (d) { obj[clave] = d; pintar(); onCambio && onCambio(); }
  };
  b.oncontextmenu = (e) => { e.preventDefault(); obj[clave] = null; pintar(); };
  pintar();
  return b;
}

const quitar = (fn) => el('button', { class: 'ed-quitar', attrs: { type: 'button', title: 'Eliminar' }, text: '✕', on: { click: fn } });

// ---------------------------------------------------------------------------
// Editores por tipo de contenido. Cada uno recibe el contenido (se muta) y un contenedor.
// ---------------------------------------------------------------------------
const EDITORES = {
  quiz(c, host, repintar) {
    c.forEach((q, qi) => {
      const radios = 'ok' + q.id;
      host.append(el('div', { class: 'ed-fila ed-quiz' }, [
        el('span', { class: 'ed-n', text: String(qi + 1) }),
        el('div', { class: 'ed-cuerpo' }, [
          el('div', { class: 'ed-linea' }, [
            el('textarea', { attrs: { rows: 1, placeholder: 'Pregunta' }, value: q.q, on: { input: (e) => { q.q = e.target.value; } } }),
            botonImagen(q, 'img')
          ]),
          ...q.resp.map((r, ri) => el('div', { class: 'ed-linea ed-resp' }, [
            el('input', { attrs: { type: 'radio', name: radios, title: 'Respuesta correcta' }, checked: r.ok, on: { change: () => { q.resp.forEach((x, k) => { x.ok = k === ri; }); } } }),
            el('input', { attrs: { type: 'text', placeholder: 'Respuesta ' + (ri + 1) }, value: r.t, on: { input: (e) => { r.t = e.target.value; } } }),
            q.resp.length > 2 ? quitar(() => { q.resp.splice(ri, 1); if (!q.resp.some((x) => x.ok)) q.resp[0].ok = true; repintar(); }) : null
          ])),
          q.resp.length < 6 ? el('button', { class: 'enlace-btn', attrs: { type: 'button' }, text: '+ Respuesta', on: { click: () => { q.resp.push({ t: '', ok: false }); repintar(); } } }) : null
        ]),
        quitar(() => { c.splice(qi, 1); repintar(); })
      ]));
    });
  },
  pares(c, host, repintar) {
    host.append(el('div', { class: 'ed-cab' }, [el('span'), el('b', { text: 'Término / pregunta' }), el('b', { text: 'Definición / respuesta' }), el('span')]));
    c.forEach((p, i) => host.append(el('div', { class: 'ed-fila ed-par' }, [
      el('span', { class: 'ed-n', text: String(i + 1) }),
      el('div', { class: 'ed-linea' }, [el('input', { attrs: { type: 'text' }, value: p.a, on: { input: (e) => { p.a = e.target.value; } } }), botonImagen(p, 'imgA')]),
      el('div', { class: 'ed-linea' }, [el('input', { attrs: { type: 'text' }, value: p.b, on: { input: (e) => { p.b = e.target.value; } } }), botonImagen(p, 'imgB')]),
      quitar(() => { c.splice(i, 1); repintar(); })
    ])));
  },
  lista(c, host, repintar) {
    c.forEach((it, i) => host.append(el('div', { class: 'ed-fila' }, [
      el('span', { class: 'ed-n', text: String(i + 1) }),
      el('div', { class: 'ed-linea ed-cuerpo' }, [el('input', { attrs: { type: 'text' }, value: it.t, on: { input: (e) => { it.t = e.target.value; } } }), botonImagen(it, 'img')]),
      quitar(() => { c.splice(i, 1); repintar(); })
    ])));
  },
  oraciones(c, host, repintar) {
    c.forEach((it, i) => host.append(el('div', { class: 'ed-fila' }, [
      el('span', { class: 'ed-n', text: String(i + 1) }),
      el('div', { class: 'ed-linea ed-cuerpo' }, [el('input', { attrs: { type: 'text', placeholder: 'Ej.: El [sol] sale por el [este]' }, value: it.t, on: { input: (e) => { it.t = e.target.value; } } })]),
      quitar(() => { c.splice(i, 1); repintar(); })
    ])));
  },
  vf(c, host, repintar) {
    c.forEach((it, i) => host.append(el('div', { class: 'ed-fila' }, [
      el('span', { class: 'ed-n', text: String(i + 1) }),
      el('div', { class: 'ed-linea ed-cuerpo' }, [
        el('input', { attrs: { type: 'text', placeholder: 'Afirmación' }, value: it.t, on: { input: (e) => { it.t = e.target.value; } } }),
        el('select', { class: 'ed-vf', on: { change: (e) => { it.ok = e.target.value === '1'; } } }, [
          el('option', { attrs: { value: '1', selected: it.ok }, text: 'Verdadero' }), el('option', { attrs: { value: '0', selected: !it.ok }, text: 'Falso' })])
      ]),
      quitar(() => { c.splice(i, 1); repintar(); })
    ])));
  },
  grupos(c, host, repintar) {
    c.forEach((g, i) => host.append(el('div', { class: 'ed-grupo' }, [
      el('div', { class: 'ed-linea' }, [
        el('input', { attrs: { type: 'text', placeholder: 'Nombre del grupo' }, value: g.nombre, on: { input: (e) => { g.nombre = e.target.value; } } }),
        quitar(() => { c.splice(i, 1); repintar(); })
      ]),
      el('textarea', { attrs: { rows: 4, placeholder: 'Un elemento por línea' }, value: g.items.map((x) => x.t).join('\n'),
        on: { input: (e) => { g.items = e.target.value.split('\n').map((t) => ({ t, img: null })); } } })
    ])));
  },
  mates(c, host) {
    const ops = [['+', 'Suma'], ['-', 'Resta'], ['×', 'Multiplicación'], ['÷', 'División']];
    host.append(
      el('div', { class: 'fila' }, ops.map(([o, n]) => el('label', { class: 'chk' }, [
        el('input', { attrs: { type: 'checkbox' }, checked: c.ops.includes(o), on: { change: (e) => { c.ops = e.target.checked ? [...new Set([...c.ops, o])] : c.ops.filter((x) => x !== o); } } }), ` ${n} (${o})`]))),
      el('div', { class: 'fila', style: { marginTop: '14px' } }, [
        el('label', { class: 'campo', text: 'Número máximo' }), el('input', { attrs: { type: 'number', min: 2, max: 1000 }, value: c.max, style: { width: '110px' }, on: { input: (e) => { c.max = Math.max(2, +e.target.value || 10); } } }),
        el('label', { class: 'campo', text: 'Cantidad de preguntas' }), el('input', { attrs: { type: 'number', min: 3, max: 50 }, value: c.n, style: { width: '110px' }, on: { input: (e) => { c.n = Math.max(3, +e.target.value || 10); } } })
      ])
    );
  },
  diagrama(c, host, repintar) {
    const zona = el('div', { class: 'ed-diag' });
    if (!c.img) {
      zona.append(el('button', { class: 'btn', attrs: { type: 'button' }, text: 'Subir imagen', on: { click: async () => { const d = await elegirImagen(); if (d) { c.img = d; repintar(); } } } }));
    } else {
      const caja = el('div', { class: 'ed-diag-img' }, [el('img', { attrs: { src: c.img, draggable: 'false' } })]);
      const pintarPins = () => {
        caja.querySelectorAll('.pin').forEach((n) => n.remove());
        c.pins.forEach((p, i) => caja.append(el('span', { class: 'pin', style: { left: p.x + '%', top: p.y + '%' }, text: String(i + 1) })));
      };
      caja.onclick = (e) => {
        const r = caja.querySelector('img').getBoundingClientRect();
        c.pins.push({ id: uid(), x: +(((e.clientX - r.left) / r.width) * 100).toFixed(1), y: +(((e.clientY - r.top) / r.height) * 100).toFixed(1), t: '' });
        repintar();
      };
      zona.append(el('p', { class: 'sub', text: 'Haz clic sobre la imagen para añadir un punto y escribe su etiqueta.' }), caja);
      pintarPins();
      c.pins.forEach((p, i) => zona.append(el('div', { class: 'ed-fila' }, [
        el('span', { class: 'ed-n', text: String(i + 1) }),
        el('div', { class: 'ed-linea ed-cuerpo' }, [el('input', { attrs: { type: 'text', placeholder: 'Etiqueta' }, value: p.t, on: { input: (e) => { p.t = e.target.value; } } })]),
        quitar(() => { c.pins.splice(i, 1); repintar(); })
      ])));
      zona.append(el('button', { class: 'btn btn-claro btn-mini', attrs: { type: 'button' }, text: 'Cambiar imagen', on: { click: async () => { const d = await elegirImagen(); if (d) { c.img = d; repintar(); } } } }));
    }
    host.append(zona);
  }
};

// Importar texto pegado: "a<TAB>b", "a;b" o "a - b" -> filas
function dialogoImportar(tipo, alAceptar) {
  const area = el('textarea', { attrs: { rows: 10, placeholder: tipo === 'pares' ? 'Una pareja por línea, separada con tabulación, punto y coma o guion:\nperro - dog\ngato - cat' : 'Un elemento por línea' }, style: { width: '100%' } });
  const fondo = el('div', { class: 'modal-fondo' }, [el('div', { class: 'modal' }, [
    el('h2', { text: 'Importar texto' }), area,
    el('div', { class: 'acciones' }, [
      el('button', { class: 'btn btn-claro', text: 'Cancelar', on: { click: () => fondo.remove() } }),
      el('button', { class: 'btn', text: 'Importar', on: { click: () => { alAceptar(area.value); fondo.remove(); } } })
    ])
  ])]);
  document.body.appendChild(fondo);
  area.focus();
}

export async function vistaEditor(raiz, params) {
  const main = pagina(raiz);
  let act = null, plantilla = null;
  if (params.id) {
    act = await actividades.uno(params.id);
    if (!act) { ir('/mis'); return; }
    plantilla = plantillaPorId(act.plantilla);
  } else {
    plantilla = plantillaPorId(params.plantilla);
    if (!plantilla) { ir('/crear'); return; }
    const tipo = plantilla.acepta[0];
    act = {
      id: uid(), titulo: '', plantilla: plantilla.id, tipo, contenido: contenidoVacio(tipo, tipo === 'quiz' ? 4 : 6),
      opciones: opcionesIniciales(plantilla), estilo: estiloRecordado(), fuente: 'auto', publica: false, etiquetas: [],
      creado: Date.now(), modificado: Date.now(), nuevo: true
    };
  }
  const tipo = act.tipo;
  const c = act.contenido;
  const filas = el('div', { class: 'ed-lista' });
  const pintar = () => { limpiar(filas); EDITORES[tipo](c, filas, pintar); };

  const titulo = el('input', { attrs: { type: 'text', placeholder: 'Introduce un título', maxlength: 80 }, value: act.titulo, on: { input: (e) => { act.titulo = e.target.value; } } });
  const etiquetas = el('input', { attrs: { type: 'text', placeholder: 'Etiquetas separadas por comas (opcional)' }, value: (act.etiquetas || []).join(', '), on: { input: (e) => { act.etiquetas = e.target.value.split(',').map((x) => x.trim()).filter(Boolean); } } });

  const esLista = Array.isArray(c);
  const barra = el('div', { class: 'fila' }, [
    esLista ? el('button', { class: 'btn btn-claro', attrs: { type: 'button' }, text: '+ Añadir', on: { click: () => { c.push(nuevoItem[tipo]()); pintar(); } } }) : null,
    esLista && ['pares', 'lista', 'oraciones', 'vf'].includes(tipo) ? el('button', { class: 'btn btn-claro', attrs: { type: 'button' }, text: 'Importar texto', on: { click: () => dialogoImportar(tipo, (txt) => {
      const nuevos = txt.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const it = nuevoItem[tipo]();
        if (tipo === 'pares') { const [a, ...b] = l.split(/\t|;| - | – /); it.a = (a || '').trim(); it.b = b.join(' - ').trim(); }
        else it.t = l;
        return it;
      });
      const vacios = (x) => !(x.t || x.a || x.b || x.q);
      while (c.length && vacios(c[c.length - 1])) c.pop();
      c.push(...nuevos); pintar();
    }) } }) : null,
    el('span', { class: 'esp' }),
    el('button', { class: 'btn btn-grande', text: 'Hecho', on: { click: guardar } })
  ]);

  async function guardar() {
    const n = cuenta(tipo, c);
    if (n < (plantilla.minimo || 1)) { aviso(`Esta plantilla necesita al menos ${plantilla.minimo || 1} elemento(s) completos. Tienes ${n}.`); return; }
    act.titulo = act.titulo.trim() || plantilla.nombre;
    act.modificado = Date.now();
    delete act.nuevo;
    await actividades.guardar(act);
    ir('/a/' + act.id);
  }

  main.append(
    pasos(2),
    el('div', { class: 'tarjeta' }, [
      el('div', { class: 'fila' }, [iconoPlantilla(plantilla), el('div', {}, [el('h2', { text: plantilla.nombre }), el('p', { class: 'sub', text: plantilla.descripcion })])]),
      el('div', { class: 'ed-meta' }, [el('label', { class: 'campo', text: 'Título' }), titulo, el('label', { class: 'campo', text: 'Etiquetas', style: { marginTop: '10px' } }), etiquetas])
    ]),
    el('div', { class: 'tarjeta' }, [el('div', { class: 'fila entre' }, [el('h3', { text: TIPOS[tipo].nombre }), el('span', { class: 'sub', text: TIPOS[tipo].ayuda })]), filas, barra])
  );
  pintar();
}
