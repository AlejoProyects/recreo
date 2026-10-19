'use strict';

import { el } from '../core/util.js';

// Celda con imagen y/o texto (lo que se muestra en tarjetas, botones, etc.)
export function celda(t, img, clase = '') {
  return el('div', { class: 'celda ' + clase }, [
    img ? el('img', { attrs: { src: img, alt: '', draggable: 'false' } }) : null,
    t ? el('span', { text: t }) : null
  ]);
}

// Ajustes reutilizables que declaran las plantillas.
export const OPC = {
  tiempo: (def = 0) => ({ k: 'tiempo', etiqueta: 'Temporizador', tipo: 'rango', min: 0, max: 600, paso: 10, def, cero: 'Sin límite', sufijo: ' s' }),
  vidas: (def = 0) => ({ k: 'vidas', etiqueta: 'Vidas', tipo: 'rango', min: 0, max: 9, paso: 1, def, cero: 'Ilimitadas' }),
  alea: (def = true, etiqueta = 'Orden aleatorio') => ({ k: 'alea', etiqueta, tipo: 'check', def }),
  aleaResp: (def = true) => ({ k: 'aleaResp', etiqueta: 'Barajar las respuestas', tipo: 'check', def }),
  mostrarOk: (def = true) => ({ k: 'mostrarOk', etiqueta: 'Mostrar la respuesta correcta al fallar', tipo: 'check', def }),
  velocidad: (def = 5) => ({ k: 'velocidad', etiqueta: 'Velocidad', tipo: 'rango', min: 1, max: 10, paso: 1, def })
};

export const valoresPorDefecto = (specs) => Object.fromEntries((specs || []).map((s) => [s.k, s.def]));

// Pausa que se cancela si el juego se destruye (evita timers colgados).
export function temporizadores() {
  const ids = new Set();
  return {
    esperar(fn, ms) { const id = setTimeout(() => { ids.delete(id); fn(); }, ms); ids.add(id); return id; },
    cada(fn, ms) { const id = setInterval(fn, ms); ids.add(id); return id; },
    cancelar(id) { clearTimeout(id); clearInterval(id); ids.delete(id); },
    limpiar() { ids.forEach((id) => { clearTimeout(id); clearInterval(id); }); ids.clear(); }
  };
}
