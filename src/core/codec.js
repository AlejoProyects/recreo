'use strict';

// Codifica una actividad en texto para ponerla en un enlace: JSON -> gzip -> base64url.
const deB64 = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function comprimir(texto) {
  const cs = new Blob([texto]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(cs).arrayBuffer());
}
async function descomprimir(bytes) {
  const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(ds).text();
}

const CAMPOS = ['titulo', 'plantilla', 'tipo', 'contenido', 'opciones', 'estilo', 'fuente', 'etiquetas'];
export const paquete = (act) => Object.fromEntries(CAMPOS.map((k) => [k, act[k]]));

// Quita imágenes (las más pesadas) para que el enlace sea corto.
export function sinImagenes(act) {
  return JSON.parse(JSON.stringify(paquete(act), (k, v) => (typeof v === 'string' && v.startsWith('data:image') ? null : v)));
}

export async function codificar(obj) {
  const bytes = await comprimir(JSON.stringify(obj));
  // se procesa en trozos para no desbordar la pila con actividades grandes
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function decodificar(texto) {
  return JSON.parse(await descomprimir(deB64(texto)));
}

export const urlBase = () => location.href.split('#')[0];
