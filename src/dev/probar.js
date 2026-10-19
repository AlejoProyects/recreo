'use strict';

// Prueba de humo (solo desarrollo): monta cada plantilla con cada ejemplo compatible,
// la inicia, simula algunos clics y reporta errores. Uso: (await import('/src/dev/probar.js')).probarTodas()
import { PLANTILLAS } from '../plantillas.js';
import { EJEMPLOS } from '../datos/ejemplos.js';
import { montarEscenario } from '../core/escenario.js';
import { contenidoParaJugar, cuenta, tipoPara } from '../core/contenido.js';
import { valoresPorDefecto } from '../juegos/ayudas.js';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export async function probarTodas(soloId) {
  const informe = [];
  for (const e of EJEMPLOS) if (!PLANTILLAS.some((p) => p.id === e.plantilla)) informe.push({ id: e.id, estado: 'EJEMPLO con plantilla inexistente: ' + e.plantilla });
  const errores = [];
  const alError = (e) => errores.push(String(e.message || e.reason || e));
  window.addEventListener('error', alError); window.addEventListener('unhandledrejection', alError);
  const cont = document.createElement('div');
  cont.style.cssText = 'position:fixed;left:-3000px;top:0;width:1000px';
  document.body.appendChild(cont);
  for (const p of PLANTILLAS) {
    if (soloId && p.id !== soloId) continue;
    const compat = EJEMPLOS.filter((e, i, arr) => tipoPara(p, e.tipo) && arr.findIndex((x) => x.tipo === e.tipo) === i);
    if (!compat.length) { informe.push({ id: p.id, estado: 'SIN EJEMPLO compatible' }); continue; }
    for (const ej of compat) {
    const act = { ...ej, opciones: valoresPorDefecto(p.opciones) };
    const { tipo, datos } = contenidoParaJugar(p, act);
    if (!tipo || !datos || cuenta(tipo, datos) < (p.minimo || 1)) { informe.push({ id: p.id, estado: 'contenido insuficiente', con: ej.tipo }); continue; }
    errores.length = 0;
    let ctl;
    try {
      ctl = montarEscenario(cont, { plantilla: p, titulo: ej.titulo, tipo, datos, opciones: act.opciones, estilo: ej.estilo || 'clasico', fuente: 'auto', alTerminar: null });
      ctl.escenario.querySelector('.esc-iniciar').click();
      await esperar(120);
      // clics aleatorios sobre elementos interactivos
      for (let i = 0; i < 6; i++) {
        const bs = [...ctl.escenario.querySelectorAll('button:not(.esc-btn):not([disabled])')];
        if (bs.length) bs[(Math.random() * bs.length) | 0].click();
        await esperar(60);
      }
      const txt = ctl.escenario.textContent;
      if (/null|undefined|\[object|NaN/.test(txt)) errores.push('texto sospechoso en pantalla: ' + (txt.match(/.{0,20}(null|undefined|\[object|NaN).{0,20}/) || [''])[0]);
      const err = ctl.escenario.querySelector('.esc-error');
      informe.push({ id: p.id, estado: err || errores.length ? 'ERROR' : 'ok', con: ej.tipo, detalle: err ? err.textContent : errores.join(' | ') || undefined });
    } catch (e) { informe.push({ id: p.id, con: ej.tipo, estado: 'EXCEPCION', detalle: String(e.stack || e).slice(0, 300) }); }
    try { ctl && ctl.destruir(); } catch (_) {}
    }
  }
  // cada ejemplo con su propia plantilla y estilo
  if (!soloId) for (const ej of EJEMPLOS) {
    const p = PLANTILLAS.find((x) => x.id === ej.plantilla); if (!p) continue;
    const act = { ...ej, opciones: valoresPorDefecto(p.opciones) };
    const { tipo, datos } = contenidoParaJugar(p, act);
    errores.length = 0; let ctl;
    try {
      if (!tipo || !datos || cuenta(tipo, datos) < (p.minimo || 1)) { informe.push({ id: 'ejemplo:' + ej.id, estado: 'contenido insuficiente para ' + p.id }); continue; }
      ctl = montarEscenario(cont, { plantilla: p, titulo: ej.titulo, tipo, datos, opciones: act.opciones, estilo: ej.estilo, fuente: 'auto', alTerminar: null });
      ctl.escenario.querySelector('.esc-iniciar').click(); await esperar(150);
      const err = ctl.escenario.querySelector('.esc-error');
      informe.push({ id: 'ejemplo:' + ej.id, estado: err || errores.length ? 'ERROR' : 'ok', detalle: err ? err.textContent : errores.join(' | ') || undefined });
    } catch (e) { informe.push({ id: 'ejemplo:' + ej.id, estado: 'EXCEPCION', detalle: String(e).slice(0, 200) }); }
    try { ctl && ctl.destruir(); } catch (_) {}
  }
  cont.remove();
  window.removeEventListener('error', alError); window.removeEventListener('unhandledrejection', alError);
  return informe;
}
