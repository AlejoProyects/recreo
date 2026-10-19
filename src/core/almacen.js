'use strict';

// Persistencia en IndexedDB: un único almacén de actividades y otro de resultados.
const abrir = () => new Promise((ok, mal) => {
  const r = indexedDB.open('recreo-datos', 1);
  r.onupgradeneeded = () => { r.result.createObjectStore('actividades', { keyPath: 'id' }); r.result.createObjectStore('resultados', { keyPath: 'id' }); };
  r.onsuccess = () => ok(r.result);
  r.onerror = () => mal(r.error);
});
const op = async (almacen, modo, fn) => {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction(almacen, modo);
    const req = fn(t.objectStore(almacen));
    t.oncomplete = () => ok(req && req.result);
    t.onerror = () => mal(t.error);
  });
};
const API = (almacen) => ({
  todos: () => op(almacen, 'readonly', (s) => s.getAll()),
  uno: (id) => op(almacen, 'readonly', (s) => s.get(id)),
  guardar: (o) => op(almacen, 'readwrite', (s) => s.put(o)),
  borrar: (id) => op(almacen, 'readwrite', (s) => s.delete(id))
});
export const actividades = API('actividades');
export const resultados = API('resultados');

// Preferencias por dispositivo (si el almacenamiento falla, se usan los valores por defecto).
export const pref = {
  leer(k, def) { try { const v = localStorage.getItem('aj:' + k); return v == null ? def : JSON.parse(v); } catch (_) { return def; } },
  guardar(k, v) { try { localStorage.setItem('aj:' + k, JSON.stringify(v)); } catch (_) {} }
};
