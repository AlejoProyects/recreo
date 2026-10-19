'use strict';

import { el, limpiar, barajar } from '../core/util.js';
import { celda, OPC, temporizadores } from './ayudas.js';

const prep = (h) => {
  let qs = h.datos.map((q) => ({ ...q, resp: h.opciones.aleaResp === false ? q.resp : barajar(q.resp) }));
  if (h.opciones.alea) qs = barajar(qs);
  return qs;
};

// ---------- Concurso (gameshow) ----------
const concurso = {
  id: 'concurso', nombre: 'Concurso', icono: '🎤', color: '#ffb703',
  descripcion: 'Un cuestionario con presión de tiempo, comodines y una pregunta bonus final.',
  acepta: ['quiz'], minimo: 3, imprimible: true,
  opciones: [{ k: 'segundos', etiqueta: 'Tiempo por pregunta', tipo: 'rango', min: 5, max: 60, paso: 5, def: 20, sufijo: ' s' }, OPC.vidas(3), OPC.alea(true, 'Preguntas en orden aleatorio'), { k: 'comodines', etiqueta: 'Usar comodines', tipo: 'check', def: true }],
  montar(h) {
    const T = temporizadores();
    const qs = prep(h);
    let i = 0, resta = 0, ocupado = false, total = h.opciones.segundos || 20, id = null;
    const usados = { mitad: false, pasar: false, tiempo: false };
    const cont = el('div', { class: 'conc' });
    h.raiz.appendChild(cont);

    function pintar() {
      limpiar(cont); ocupado = false;
      const q = qs[i]; const bonus = i === qs.length - 1 && qs.length > 2;
      total = h.opciones.segundos || 20; resta = total;
      h.progreso(i, qs.length);
      const barra = el('div', { class: 'conc-barra' }, [el('i')]);
      const botones = q.resp.map((r) => el('button', { class: 'e-btn', text: r.t, on: { click: (e) => responder(r, e.currentTarget) } }));
      const com = h.opciones.comodines ? el('div', { class: 'conc-com' }, [
        el('button', { class: 'e-btn', text: '50:50', attrs: { disabled: usados.mitad }, on: { click: (e) => { usados.mitad = true; e.currentTarget.disabled = true;
          const malos = barajar(botones.filter((_, k) => !q.resp[k].ok)).slice(0, Math.max(1, Math.floor(botones.length / 2)));
          malos.forEach((b) => { b.disabled = true; b.style.visibility = 'hidden'; }); } } }),
        el('button', { class: 'e-btn', text: 'Pasar', attrs: { disabled: usados.pasar }, on: { click: (e) => { usados.pasar = true; e.currentTarget.disabled = true; clearInterval(id); i++; i >= qs.length ? h.terminar() : pintar(); } } }),
        el('button', { class: 'e-btn', text: '+15 s', attrs: { disabled: usados.tiempo }, on: { click: (e) => { usados.tiempo = true; e.currentTarget.disabled = true; resta += 15; total += 15; } } })
      ]) : null;
      cont.append(...[bonus ? el('div', { class: 'conc-bonus', text: '★ Pregunta bonus: vale el doble ★' }) : null, barra, el('div', { class: 'e-card conc-q' }, [celda(q.q, q.img)]), el('div', { class: 'quiz-r n' + Math.min(botones.length, 6) }, botones), com].filter(Boolean));
      clearInterval(id);
      id = T.cada(() => {
        if (ocupado) return;
        resta -= 0.1; barra.firstChild.style.width = Math.max(0, (resta / total) * 100) + '%';
        if (resta <= 0) { ocupado = true; clearInterval(id); h.fallo(); botones.forEach((b, k) => { if (q.resp[k].ok) b.classList.add('ok'); }); T.esperar(sig, 1100); }
      }, 100);
      pintar.q = { q, bonus, botones };
    }
    function responder(r, btn) {
      if (ocupado) return; ocupado = true; clearInterval(id);
      const { q, bonus, botones } = pintar.q;
      if (r.ok) { btn.classList.add('ok'); h.acierto((100 + Math.round(resta * 5)) * (bonus ? 2 : 1)); }
      else { btn.classList.add('mal'); botones.forEach((b, k) => { if (q.resp[k].ok) b.classList.add('ok'); }); if (h.fallo()) return; }
      T.esperar(sig, 1000);
    }
    const sig = () => { i++; i >= qs.length ? h.terminar() : pintar(); };
    pintar();
    return { destruir: () => T.limpiar(), alAgotarTiempo: () => {} };
  }
};

// ---------- Ganar o perder ----------
const ganarPerder = {
  id: 'ganar-perder', nombre: 'Ganar o perder', icono: '🎲', color: '#8338ec',
  descripcion: 'Un cuestionario en el que tú eliges cuántos puntos apuestas en cada pregunta.',
  acepta: ['quiz'], minimo: 2, imprimible: false,
  opciones: [{ k: 'inicio', etiqueta: 'Puntos de partida', tipo: 'rango', min: 0, max: 500, paso: 50, def: 100 }, OPC.alea(true, 'Preguntas en orden aleatorio'), OPC.aleaResp(), OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    const qs = prep(h);
    let i = 0, apuesta = 0, ocupado = false, puntos = h.opciones.inicio ?? 100;
    h.fijarPuntos(puntos);
    const cont = el('div', { class: 'gp' });
    h.raiz.appendChild(cont);
    function pintar() {
      limpiar(cont); ocupado = false; apuesta = 0; h.progreso(i, qs.length);
      const q = qs[i];
      const apuestas = [10, 20, 50, 100].map((a) => el('button', { class: 'e-btn gp-ap', text: '±' + a, on: { click: (e) => { apuesta = a; apuestas.forEach((b) => b.classList.remove('sel')); e.currentTarget.classList.add('sel'); } } }));
      const botones = q.resp.map((r) => el('button', { class: 'e-btn', text: r.t, on: { click: (e) => responder(r, e.currentTarget) } }));
      cont.append(el('div', { class: 'gp-fila' }, [el('b', { text: '¿Cuánto apuestas?' }), ...apuestas]), el('div', { class: 'e-card conc-q' }, [celda(q.q, q.img)]), el('div', { class: 'quiz-r n' + Math.min(botones.length, 6) }, botones));
      pintar.q = { q, botones };
    }
    function responder(r, btn) {
      if (ocupado) return;
      if (!apuesta) { cont.querySelector('.gp-fila').classList.add('tiembla'); T.esperar(() => cont.querySelector('.gp-fila') && cont.querySelector('.gp-fila').classList.remove('tiembla'), 500); return; }
      ocupado = true; const { q, botones } = pintar.q;
      if (r.ok) { btn.classList.add('ok'); puntos += apuesta; h.acierto(0); } else { btn.classList.add('mal'); botones.forEach((b, k) => { if (q.resp[k].ok) b.classList.add('ok'); }); puntos = Math.max(0, puntos - apuesta); h.fallo({ vida: false }); }
      h.fijarPuntos(puntos);
      T.esperar(() => { i++; i >= qs.length ? h.terminar() : pintar(); }, 1100);
    }
    pintar();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Cuestionario de imágenes ----------
const imagenes = {
  id: 'quiz-imagen', nombre: 'Cuestionario de imágenes', icono: '🖼️', color: '#06d6a0',
  descripcion: 'La imagen se va revelando poco a poco. Responde cuanto antes para ganar más puntos.',
  acepta: ['quiz'], minimo: 2, imprimible: false,
  opciones: [{ k: 'revela', etiqueta: 'Tiempo de revelado', tipo: 'rango', min: 4, max: 30, paso: 2, def: 12, sufijo: ' s' }, OPC.alea(true, 'Preguntas en orden aleatorio'), OPC.aleaResp(), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    const qs = prep(h);
    let i = 0, t0 = 0, ocupado = false, id = null;
    const cont = el('div', { class: 'qi' });
    h.raiz.appendChild(cont);
    function pintar() {
      limpiar(cont); ocupado = false; h.progreso(i, qs.length);
      const q = qs[i], total = (h.opciones.revela || 12) * 1000;
      const vista = el('div', { class: 'qi-vista e-card' }, [q.img ? el('img', { attrs: { src: q.img, alt: '' } }) : el('div', { class: 'qi-txt', text: q.q })]);
      const botones = q.resp.map((r) => el('button', { class: 'e-btn', text: r.t, on: { click: (e) => responder(r, e.currentTarget) } }));
      cont.append(...[q.img ? el('div', { class: 'qi-q', text: q.q }) : null, vista, el('div', { class: 'quiz-r n' + Math.min(botones.length, 6) }, botones)].filter(Boolean));
      const nodo = vista.firstChild; t0 = performance.now();
      clearInterval(id);
      id = T.cada(() => { const p = Math.min(1, (performance.now() - t0) / total); nodo.style.filter = `blur(${(1 - p) * 26}px)`; if (p >= 1) clearInterval(id); }, 60);
      pintar.q = { q, botones, total };
    }
    function responder(r, btn) {
      if (ocupado) return; ocupado = true; clearInterval(id);
      const { q, botones, total } = pintar.q;
      cont.querySelector('.qi-vista').firstChild.style.filter = 'none';
      if (r.ok) { btn.classList.add('ok'); const p = Math.min(1, (performance.now() - t0) / total); h.acierto(Math.max(1, Math.round(10 * (1 - p)))); }
      else { btn.classList.add('mal'); botones.forEach((b, k) => { if (q.resp[k].ok) b.classList.add('ok'); }); if (h.fallo()) return; }
      T.esperar(() => { i++; i >= qs.length ? h.terminar() : pintar(); }, 1100);
    }
    pintar();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Verdadero o falso (arcade) ----------
const verdaderoFalso = {
  id: 'verdadero-falso', nombre: 'Verdadero o falso', icono: '✅', color: '#118ab2',
  descripcion: 'Las afirmaciones pasan a toda velocidad. Mira cuántas aciertas antes de que se acabe el tiempo.',
  acepta: ['vf'], minimo: 3, imprimible: true,
  opciones: [OPC.velocidad(4), OPC.tiempo(60), OPC.vidas(3)],
  montar(h) {
    const T = temporizadores();
    let cola = barajar(h.datos), k = 0, vivo = null, ocupado = false;
    const cont = el('div', { class: 'vf' });
    const pista = el('div', { class: 'vf-pista' });
    const si = el('button', { class: 'e-btn vf-si', text: '✔ Verdadero', on: { click: () => decidir(true) } });
    const no = el('button', { class: 'e-btn vf-no', text: '✘ Falso', on: { click: () => decidir(false) } });
    cont.append(pista, el('div', { class: 'vf-bot' }, [no, si])); h.raiz.appendChild(cont);
    const dur = () => Math.max(2.5, 12 - (h.opciones.velocidad || 4) * 1.0) * 1000;

    function siguiente() {
      if (k >= cola.length) { cola = barajar(h.datos); k = 0; }
      ocupado = false; const item = cola[k++];
      limpiar(pista);
      const carta = el('div', { class: 'e-card vf-carta', text: item.t });
      pista.append(carta);
      carta.animate([{ transform: 'translateX(60%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1, offset: .15 }, { transform: 'translateX(0)', opacity: 1, offset: .75 }, { transform: 'translateX(-120%)', opacity: 0 }], { duration: dur(), easing: 'linear' });
      vivo = { item, carta, t: T.esperar(() => { if (ocupado) return; ocupado = true; carta.classList.add('mal'); if (!h.fallo()) T.esperar(siguiente, 300); }, dur()) };
    }
    function decidir(v) {
      if (ocupado || !vivo) return; ocupado = true; T.cancelar(vivo.t);
      const bien = v === vivo.item.ok;
      vivo.carta.getAnimations().forEach((a) => a.pause());
      vivo.carta.classList.add(bien ? 'ok' : 'mal');
      if (bien) h.acierto(1); else if (h.fallo()) return;
      T.esperar(siguiente, 450);
    }
    const tecla = (e) => { if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'v') decidir(true); else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'f') decidir(false); };
    window.addEventListener('keydown', tecla);
    siguiente();
    return { destruir: () => { T.limpiar(); window.removeEventListener('keydown', tecla); } };
  }
};

export default [concurso, ganarPerder, imagenes, verdaderoFalso];
