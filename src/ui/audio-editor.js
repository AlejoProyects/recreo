'use strict';

import { el, limpiar, aviso } from '../core/util.js';
import { reproducir } from '../juegos/ayudas.js';

const MAX_SEG = 15;

// Botón de audio para una fila del editor: grabar con el micrófono, escuchar y quitar.
// `obj[clave]` guarda el audio como data URL (webm/opus, unos pocos KB por segundo).
export function botonAudio(obj, clave) {
  const caja = el('span', { class: 'ed-aud' });
  let rec = null, flujo = null, trozos = [], corte = null;

  const parar = () => { clearTimeout(corte); if (rec && rec.state !== 'inactive') rec.stop(); };
  async function grabar() {
    try { flujo = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (_) { aviso('No se pudo acceder al micrófono. Revisa el permiso del navegador.'); return; }
    trozos = []; rec = new MediaRecorder(flujo);
    rec.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data); };
    rec.onstop = () => {
      flujo.getTracks().forEach((t) => t.stop());
      const lector = new FileReader();
      lector.onload = () => { obj[clave] = lector.result; rec = null; pintar(); };
      lector.readAsDataURL(new Blob(trozos, { type: rec.mimeType || 'audio/webm' }));
    };
    rec.start(); corte = setTimeout(parar, MAX_SEG * 1000); pintar();
  }

  function pintar() {
    limpiar(caja);
    const grabando = rec && rec.state === 'recording';
    if (grabando) caja.append(el('button', { class: 'ed-img ed-rec', attrs: { type: 'button', title: 'Detener la grabación' }, text: '⏹', on: { click: parar } }));
    else if (obj[clave]) caja.append(
      el('button', { class: 'ed-img con', attrs: { type: 'button', title: 'Escuchar' }, text: '\u{1F50A}', on: { click: () => reproducir(obj[clave]) } }),
      el('button', { class: 'ed-quitar ed-aud-x', attrs: { type: 'button', title: 'Quitar el audio' }, text: '✕', on: { click: () => { obj[clave] = null; pintar(); } } }));
    else caja.append(el('button', { class: 'ed-img', attrs: { type: 'button', title: 'Grabar audio (máx. ' + MAX_SEG + ' s)' }, text: '\u{1F3A4}', on: { click: grabar } }));
  }
  pintar();
  return caja;
}
