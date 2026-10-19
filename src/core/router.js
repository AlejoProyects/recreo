'use strict';

// Router por hash. Rutas con parámetros: '/a/:id'. Cada vista recibe (contenedor, params, consulta)
// y puede devolver una función de limpieza.
const rutas = [];
let limpieza = null;
let raiz = null;

export function ruta(patron, vista) {
  const nombres = [];
  const re = new RegExp('^' + patron.replace(/:([a-z]+)/gi, (_, n) => { nombres.push(n); return '([^/]+)'; }) + '$');
  rutas.push({ re, nombres, vista });
}
export const ir = (ruta) => { location.hash = '#' + ruta; };
export function actual() {
  const [ruta, qs = ''] = (location.hash.slice(1) || '/').split('?');
  return { ruta, consulta: new URLSearchParams(qs) };
}
export function iniciarRouter(nodo) {
  raiz = nodo;
  let turno = 0;
  const pintar = () => {
    if (typeof limpieza === 'function') { try { limpieza(); } catch (_) {} }
    limpieza = null;
    const { ruta: r, consulta } = actual();
    for (const { re, nombres, vista } of rutas) {
      const m = r.match(re);
      if (!m) continue;
      const params = Object.fromEntries(nombres.map((n, i) => [n, decodeURIComponent(m[i + 1])]));
      // Cada vista pinta en su propio contenedor: si es asíncrona y el usuario ya navegó, escribe en uno descartado.
      const cont = document.createElement('div');
      cont.className = 'vista';
      raiz.replaceChildren(cont);
      window.scrollTo(0, 0);
      const mio = ++turno;
      Promise.resolve(vista(cont, params, consulta)).then((fn) => {
        if (typeof fn !== 'function') return;
        if (mio === turno) limpieza = fn; else { try { fn(); } catch (_) {} }
      }).catch((e) => console.error('Error en la vista', r, e));
      return;
    }
    ir('/');
  };
  window.addEventListener('hashchange', pintar);
  pintar();
}
