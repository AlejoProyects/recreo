'use strict';

import { uid, barajar } from './util.js';

// ---------------------------------------------------------------------------
// Tipos de contenido. Cada plantilla acepta uno o varios; "cambiar plantilla"
// adapta el contenido de un tipo a otro cuando es posible.
//   quiz      [{q, img, resp:[{t, ok}]}]       preguntas con opciones
//   pares     [{a, b, imgA, imgB}]             dos lados que van juntos
//   lista     [{t, img}]                       elementos sueltos
//   grupos    [{nombre, items:[{t, img}]}]     elementos en categorías
//   oraciones [{t}]                            frases ("El [sol] sale" marca huecos con [corchetes])
//   vf        [{t, ok}]                        afirmaciones verdadero/falso
//   mates     {ops, max, n}                    parámetros del generador
// ---------------------------------------------------------------------------

export const TIPOS = {
  quiz: { nombre: 'Preguntas con opciones', ayuda: 'Cada pregunta tiene varias respuestas; marca la correcta.' },
  pares: { nombre: 'Parejas (palabra y definición)', ayuda: 'Dos lados que van juntos: término y significado, pregunta y respuesta.' },
  lista: { nombre: 'Lista de elementos', ayuda: 'Palabras, nombres o frases cortas.' },
  grupos: { nombre: 'Grupos o categorías', ayuda: 'Elementos repartidos en categorías.' },
  oraciones: { nombre: 'Frases', ayuda: 'Una frase por línea. En "completar la frase" marca los huecos con [corchetes].' },
  vf: { nombre: 'Afirmaciones verdadero/falso', ayuda: 'Escribe una afirmación y marca si es verdadera o falsa.' },
  mates: { nombre: 'Generador de matemáticas', ayuda: 'Elige operaciones y rango de números.' },
  diagrama: { nombre: 'Diagrama etiquetado', ayuda: 'Sube una imagen y marca los puntos que hay que etiquetar.' }
};

export const nuevoItem = {
  quiz: () => ({ id: uid(), q: '', img: null, resp: [{ t: '', ok: true }, { t: '', ok: false }, { t: '', ok: false }, { t: '', ok: false }] }),
  pares: () => ({ id: uid(), a: '', b: '', imgA: null, imgB: null }),
  lista: () => ({ id: uid(), t: '', img: null }),
  grupos: () => ({ id: uid(), nombre: '', items: [{ t: '', img: null }, { t: '', img: null }] }),
  oraciones: () => ({ id: uid(), t: '' }),
  vf: () => ({ id: uid(), t: '', ok: true })
};

export function contenidoVacio(tipo, n = 5) {
  if (tipo === 'mates') return { ops: ['+', '-'], max: 10, n: 10 };
  if (tipo === 'diagrama') return { img: null, pins: [] };
  if (tipo === 'grupos') return [nuevoItem.grupos(), nuevoItem.grupos()];
  return Array.from({ length: n }, () => nuevoItem[tipo]());
}

const lleno = (s) => String(s ?? '').trim().length > 0;
const conImg = (t, img) => lleno(t) || !!img;

// Elementos "jugables" del contenido (los vacíos no cuentan).
export function limpioDe(tipo, c) {
  if (tipo === 'mates') return c;
  if (tipo === 'diagrama') return c && c.img ? { ...c, pins: c.pins.filter((p) => lleno(p.t)) } : { img: null, pins: [] };
  const a = Array.isArray(c) ? c : [];
  switch (tipo) {
    case 'quiz': return a.map((x) => ({ ...x, resp: x.resp.filter((r) => lleno(r.t)) }))
      .filter((x) => conImg(x.q, x.img) && x.resp.length >= 2 && x.resp.some((r) => r.ok));
    case 'pares': return a.filter((x) => conImg(x.a, x.imgA) && conImg(x.b, x.imgB));
    case 'lista': return a.filter((x) => conImg(x.t, x.img));
    case 'grupos': return a.map((g) => ({ ...g, items: g.items.filter((i) => conImg(i.t, i.img)) })).filter((g) => lleno(g.nombre) && g.items.length);
    case 'oraciones': return a.filter((x) => lleno(x.t));
    case 'vf': return a.filter((x) => lleno(x.t));
    default: return a;
  }
}
export function cuenta(tipo, c) {
  if (tipo === 'mates') return c && c.ops && c.ops.length ? 1 : 0;
  if (tipo === 'diagrama') return limpioDe(tipo, c).pins.length;
  const l = limpioDe(tipo, c);
  return tipo === 'grupos' ? l.reduce((s, g) => s + g.items.length, 0) : l.length;
}

// ---------------------------------------------------------------------------
// Adaptadores: de un tipo a otro. Devuelven null si no es posible.
// ---------------------------------------------------------------------------
// Preguntas de matemáticas con cuatro opciones numéricas. Las divisiones son siempre exactas.
export function generarMates(c) {
  const ops = c.ops && c.ops.length ? c.ops : ['+'];
  const max = Math.max(2, Math.min(1000, c.max || 10));
  const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const out = [];
  for (let i = 0; i < Math.max(1, c.n || 10); i++) {
    const op = ops[r(0, ops.length - 1)]; let a, b, res;
    if (op === '+') { a = r(1, max); b = r(1, max); res = a + b; }
    else if (op === '-') { a = r(1, max); b = r(0, a); res = a - b; }
    else if (op === '×') { a = r(2, Math.min(max, 12)); b = r(2, Math.min(max, 12)); res = a * b; }
    else { b = r(2, Math.min(max, 12)); res = r(1, Math.min(max, 12)); a = b * res; }
    const malas = new Set();
    let guard = 0;
    while (malas.size < 3 && guard++ < 50) { const d = r(1, Math.max(3, Math.ceil(Math.abs(res) * 0.3))) * (Math.random() < 0.5 ? -1 : 1); const v = res + d; if (v !== res && v >= 0) malas.add(v); }
    for (let k = 1; malas.size < 3; k++) if (res + k !== res) malas.add(res + k);
    out.push({ id: uid(), q: `${a} ${op} ${b} = ?`, img: null, resp: [{ t: String(res), ok: true }, ...[...malas].map((v) => ({ t: String(v), ok: false }))] });
  }
  return out;
}

const ADAPT = {
  'mates>quiz': (c) => generarMates(c),
  'quiz>pares': (c) => c.map((x) => ({ id: uid(), a: x.q, imgA: x.img, audA: x.aud, b: (x.resp.find((r) => r.ok) || {}).t || '', imgB: null })),
  'quiz>oraciones': (c) => c.map((x) => ({ id: uid(), t: x.q })),
  'quiz>vf': (c) => c.flatMap((x) => {
    const ok = x.resp.find((r) => r.ok); const mal = x.resp.find((r) => !r.ok);
    return [{ id: uid(), t: `${x.q} → ${ok.t}`, ok: true }, mal ? { id: uid(), t: `${x.q} → ${mal.t}`, ok: false } : null].filter(Boolean);
  }),
  'pares>quiz': (c) => c.map((x, i) => {
    const otros = barajar(c.filter((_, j) => j !== i).map((o) => o.b).filter((b) => b && b !== x.b)).slice(0, 3);
    return { id: uid(), q: x.a, img: x.imgA, aud: x.audA, resp: [{ t: x.b, ok: true }, ...otros.map((t) => ({ t, ok: false }))] };
  }).filter((q) => q.resp.length >= 2),
  'pares>lista': (c) => c.map((x) => ({ id: uid(), t: x.a, img: x.imgA, aud: x.audA })),
  'pares>vf': (c) => c.flatMap((x, i) => {
    const otro = c[(i + 1) % c.length];
    return [{ id: uid(), t: `${x.a} → ${x.b}`, ok: true }, c.length > 1 && otro.b !== x.b ? { id: uid(), t: `${x.a} → ${otro.b}`, ok: false } : null].filter(Boolean);
  }),
  'pares>grupos': (c) => {
    const m = new Map();
    c.forEach((x) => { const k = x.b.trim(); if (!m.has(k)) m.set(k, []); m.get(k).push({ t: x.a, img: x.imgA }); });
    return [...m].map(([nombre, items]) => ({ id: uid(), nombre, items }));
  },
  'oraciones>lista': (c) => c.map((x) => ({ id: uid(), t: x.t.replace(/[\[\]]/g, ''), img: null })),
  'grupos>lista': (c) => c.flatMap((g) => g.items.map((i) => ({ id: uid(), t: i.t, img: i.img }))),
  'grupos>pares': (c) => c.flatMap((g) => g.items.map((i) => ({ id: uid(), a: i.t, imgA: i.img, b: g.nombre, imgB: null }))),
  'grupos>quiz': (c) => {
    const nombres = c.map((g) => g.nombre);
    return c.flatMap((g) => g.items.map((i) => ({
      id: uid(), q: i.t, img: i.img,
      resp: [{ t: g.nombre, ok: true }, ...barajar(nombres.filter((n) => n !== g.nombre)).slice(0, 3).map((t) => ({ t, ok: false }))]
    })));
  },
  'vf>quiz': (c) => c.map((x) => ({ id: uid(), q: x.t, img: null, resp: [{ t: 'Verdadero', ok: x.ok }, { t: 'Falso', ok: !x.ok }] })),
  'vf>lista': (c) => c.map((x) => ({ id: uid(), t: x.t, img: null })),
  'vf>oraciones': (c) => c.map((x) => ({ id: uid(), t: x.t }))
};

export function puedeAdaptar(de, a) { return de === a || !!ADAPT[de + '>' + a]; }

// `c` ya debe venir "limpio". Devuelve contenido del tipo `a` o null.
export function adaptar(de, c, a) {
  if (de === a) return c;
  const f = ADAPT[de + '>' + a];
  if (!f) return null;
  try { return f(c); } catch (_) { return null; }
}

// Elige el tipo con que una plantilla puede usar un contenido (el primero compatible).
export function tipoPara(plantilla, tipoActual) {
  if (plantilla.acepta.includes(tipoActual)) return tipoActual;
  if (plantilla.soloNativa) return null;
  return plantilla.acepta.find((t) => puedeAdaptar(tipoActual, t)) || null;
}

// Contenido ya adaptado y limpio, listo para jugar.
export function contenidoParaJugar(plantilla, act) {
  const t = tipoPara(plantilla, act.tipo);
  if (!t) return { tipo: null, datos: null };
  const limpio = limpioDe(act.tipo, act.contenido);
  const datos = adaptar(act.tipo, limpio, t);
  return { tipo: t, datos: datos ? limpioDe(t, datos) : null };
}
