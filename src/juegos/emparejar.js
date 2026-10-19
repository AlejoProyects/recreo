'use strict';

import { el, limpiar, barajar } from '../core/util.js';
import { celda, OPC, temporizadores } from './ayudas.js';
import { activarArrastre } from './arrastrar.js';

const lado = (p, k) => ({ t: p[k], img: p[k === 'a' ? 'imgA' : 'imgB'], aud: p[k === 'a' ? 'audA' : 'audB'] });

// ---------- Une las parejas ----------
const une = {
  id: 'une', nombre: 'Une las parejas', icono: '🔗', color: '#e63946',
  descripcion: 'Arrastra y suelta cada palabra junto a su definición.',
  acepta: ['pares'], minimo: 2, imprimible: true,
  opciones: [OPC.alea(true, 'Barajar las parejas'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    const pares = h.opciones.alea ? barajar(h.datos) : h.datos.slice();
    const cont = el('div', { class: 'une' });
    const chips = el('div', { class: 'une-chips' });
    const filas = el('div', { class: 'une-filas' });
    cont.append(chips, filas);
    h.raiz.appendChild(cont);
    let hechas = 0;
    barajar(pares).forEach((p) => chips.append(el('div', { class: 'chip e-btn', dataset: { id: p.id } }, [celda(p.a, p.imgA, '', p.audA)])));
    pares.forEach((p) => filas.append(el('div', { class: 'une-fila' }, [
      el('div', { class: 'destino', dataset: { id: p.id } }),
      el('div', { class: 'une-def e-card' }, [celda(p.b, p.imgB, '', p.audB)])
    ])));
    h.progreso(0, pares.length);
    const ctl = activarArrastre(cont, {
      chip: '.chip', destino: '.destino', habilitado: (c) => !c.classList.contains('puesto'),
      alSoltar(c, d) {
        if (d.firstChild) return false;
        const pc = pares.find((x) => x.id === c.dataset.id), pd = pares.find((x) => x.id === d.dataset.id);
        const bien = pc.id === pd.id || (pc.b === pd.b && pc.imgB === pd.imgB);
        if (bien) {
          c.classList.add('puesto', 'ok'); d.append(c); hechas++; h.acierto(1); h.progreso(hechas, pares.length);
          if (hechas >= pares.length) T.esperar(() => h.terminar(), 700);
          return true;
        }
        c.classList.add('tiembla'); T.esperar(() => c.classList.remove('tiembla'), 500);
        h.fallo(); ctl.limpiarSeleccion();
        return false;
      }
    });
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Parejas (memoria) ----------
const memoria = {
  id: 'parejas', nombre: 'Parejas', icono: '🧠', color: '#2a9d8f',
  descripcion: 'Toca un par de fichas a la vez para descubrir si son iguales.',
  acepta: ['pares'], minimo: 2, imprimible: false,
  opciones: [OPC.tiempo(0)],
  montar(h) {
    const T = temporizadores();
    const fichas = barajar(h.datos.flatMap((p) => [{ pid: p.id, ...lado(p, 'a') }, { pid: p.id, ...lado(p, 'b') }]));
    const cols = Math.ceil(Math.sqrt(fichas.length * 1.5));
    const grid = el('div', { class: 'memo', style: { '--cols': cols } });
    let abiertas = [], bloqueo = false, hechas = 0;
    fichas.forEach((f) => {
      const b = el('button', { class: 'ficha' }, [el('div', { class: 'ficha-dorso e-card', text: '?' }), el('div', { class: 'ficha-cara e-card' }, [celda(f.t, f.img, '', f.aud)])]);
      b.onclick = () => {
        if (bloqueo || b.classList.contains('abierta') || b.classList.contains('hecha')) return;
        b.classList.add('abierta'); h.sonido.clic(); abiertas.push({ b, f });
        if (abiertas.length === 2) {
          bloqueo = true;
          const [x, y] = abiertas;
          if (x.f.pid === y.f.pid) {
            T.esperar(() => { x.b.classList.add('hecha'); y.b.classList.add('hecha'); hechas++; h.acierto(1); h.progreso(hechas, h.datos.length); abiertas = []; bloqueo = false; if (hechas >= h.datos.length) h.terminar(); }, 500);
          } else {
            h.fallo({ vida: false });
            T.esperar(() => { x.b.classList.remove('abierta'); y.b.classList.remove('abierta'); abiertas = []; bloqueo = false; }, 900);
          }
        }
      };
      grid.append(b);
    });
    h.raiz.appendChild(grid); h.progreso(0, h.datos.length);
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Cada oveja con su pareja ----------
const encuentra = {
  id: 'encuentra', nombre: 'Cada oveja con su pareja', icono: '🐑', color: '#8ac926',
  descripcion: 'Toca en la respuesta correspondiente para eliminarla. Repite hasta que todas las respuestas se hayan ido.',
  acepta: ['pares'], minimo: 2, imprimible: false,
  opciones: [OPC.alea(true, 'Preguntas en orden aleatorio'), OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    const orden = h.opciones.alea ? barajar(h.datos) : h.datos.slice();
    let i = 0;
    const pregunta = el('div', { class: 'enc-q e-card' });
    const grid = el('div', { class: 'enc-grid' });
    h.raiz.append(pregunta, grid);
    const resp = new Map();
    barajar(h.datos).forEach((p) => {
      const b = el('button', { class: 'e-btn enc-r' }, [celda(p.b, p.imgB)]);
      b.onclick = () => {
        if (b.disabled) return;
        if (orden[i].id === p.id || (orden[i].b === p.b && orden[i].imgB === p.imgB && !b.classList.contains('quitada'))) {
          b.classList.add('ok', 'quitada'); b.disabled = true; h.acierto(1); i++;
          T.esperar(() => { b.style.visibility = 'hidden'; }, 400);
          if (i >= orden.length) T.esperar(() => h.terminar(), 600); else pintarQ();
        } else { b.classList.add('mal'); h.fallo(); T.esperar(() => b.classList.remove('mal'), 600); }
      };
      grid.append(b); resp.set(p.id, b);
    });
    function pintarQ() { limpiar(pregunta); pregunta.append(celda(orden[i].a, orden[i].imgA)); h.progreso(i, orden.length); }
    pintarQ();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- ¿Pareja o no? ----------
const parejaONo = {
  id: 'pareja-o-no', nombre: '¿Pareja o no?', icono: '⚖️', color: '#f15bb5',
  descripcion: 'Decide si las dos tarjetas van juntas o no.',
  acepta: ['pares'], minimo: 3, imprimible: false,
  opciones: [OPC.tiempo(0), OPC.vidas(0)],
  montar(h) {
    const T = temporizadores();
    const bs = h.datos.map((p) => p);
    const rondas = barajar(h.datos).map((p) => {
      const mezcla = Math.random() < 0.5;
      const otro = barajar(bs.filter((o) => o.b !== p.b))[0];
      return mezcla && otro ? { a: lado(p, 'a'), b: lado(otro, 'b'), ok: false } : { a: lado(p, 'a'), b: lado(p, 'b'), ok: true };
    });
    let i = 0, ocupado = false;
    const cont = el('div', { class: 'pon' });
    const cartas = el('div', { class: 'pon-cartas' });
    const botones = el('div', { class: 'pon-bot' }, [
      el('button', { class: 'e-btn pon-si', text: '✔ Son pareja', on: { click: () => decidir(true) } }),
      el('button', { class: 'e-btn pon-no', text: '✘ No son pareja', on: { click: () => decidir(false) } })
    ]);
    cont.append(cartas, botones); h.raiz.appendChild(cont);
    function pintar() {
      limpiar(cartas); const r = rondas[i]; h.progreso(i, rondas.length);
      cartas.append(el('div', { class: 'e-card pon-carta' }, [celda(r.a.t, r.a.img)]), el('span', { class: 'pon-y', text: '＋' }), el('div', { class: 'e-card pon-carta' }, [celda(r.b.t, r.b.img)]));
      ocupado = false;
    }
    function decidir(v) {
      if (ocupado) return; ocupado = true;
      const bien = v === rondas[i].ok;
      cartas.classList.add(bien ? 'bien' : 'mal');
      if (bien) h.acierto(1); else if (h.fallo()) return;
      T.esperar(() => { cartas.classList.remove('bien', 'mal'); i++; i >= rondas.length ? h.terminar() : pintar(); }, 800);
    }
    pintar();
    return { destruir: () => T.limpiar() };
  }
};

// ---------- Tarjetas flash ----------
const flash = {
  id: 'flash', nombre: 'Tarjetas flash', icono: '🗂️', color: '#00bbf9',
  descripcion: 'Ponte a prueba usando tarjetas con indicaciones en el anverso y respuestas en el reverso.',
  acepta: ['pares'], minimo: 1, imprimible: false,
  opciones: [OPC.alea(true, 'Barajar las tarjetas'), { k: 'reverso', etiqueta: 'Empezar mostrando la respuesta', tipo: 'check', def: false }],
  montar(h) {
    let mazo = h.opciones.alea ? barajar(h.datos) : h.datos.slice();
    const total = mazo.length; let sabidas = 0;
    const carta = el('button', { class: 'flash-carta' });
    const pintar = () => {
      limpiar(carta); const p = mazo[0];
      const a = lado(p, 'a'), b = lado(p, 'b'); const frente = h.opciones.reverso ? b : a, dorso = h.opciones.reverso ? a : b;
      carta.classList.remove('vuelta');
      carta.append(el('div', { class: 'carta-cara-f e-card' }, [celda(frente.t, frente.img, '', frente.aud)]), el('div', { class: 'carta-cara-d e-card' }, [celda(dorso.t, dorso.img, '', dorso.aud)]));
      h.progreso(sabidas, total);
    };
    carta.onclick = () => { carta.classList.toggle('vuelta'); h.sonido.clic(); };
    const lo = el('button', { class: 'e-btn ok-b', text: '✔ La sabía', on: { click: () => { sabidas++; h.acierto(1); mazo.shift(); sig(); } } });
    const no = el('button', { class: 'e-btn mal-b', text: '↻ Repasar', on: { click: () => { h.fallo({ vida: false }); mazo.push(mazo.shift()); sig(); } } });
    const sig = () => { if (!mazo.length) h.terminar(); else pintar(); };
    h.raiz.append(el('div', { class: 'flash' }, [carta, el('div', { class: 'flash-bot' }, [no, lo]), el('small', { text: 'Toca la tarjeta para girarla' })]));
    pintar();
    return {};
  }
};

// ---------- Voltear fichas ----------
const voltear = {
  id: 'voltear', nombre: 'Voltear fichas', icono: '🔄', color: '#9b5de5',
  descripcion: 'Explora una serie de fichas de dos caras: toca para ampliar y gira para ver el reverso.',
  acepta: ['pares', 'lista'], minimo: 1, imprimible: false,
  opciones: [],
  montar(h) {
    const datos = h.tipo === 'lista' ? h.datos.map((x) => ({ a: x.t, imgA: x.img, b: '', imgB: null })) : h.datos;
    const vistas = new Set();
    const grid = el('div', { class: 'vol-grid', style: { '--cols': Math.ceil(Math.sqrt(datos.length * 1.6)) } });
    const capa = el('div', { class: 'vol-capa', attrs: { hidden: true } });
    datos.forEach((p, i) => grid.append(el('button', { class: 'e-btn vol-ficha', on: { click: () => abrir(p, i) } }, [celda(p.a, p.imgA, '', p.audA)])));
    h.raiz.append(grid, capa); h.progreso(0, datos.length);
    function abrir(p, i) {
      limpiar(capa); capa.hidden = false;
      const c = el('div', { class: 'vol-carta' }, [el('div', { class: 'carta-cara-f e-card' }, [celda(p.a, p.imgA, '', p.audA)]), el('div', { class: 'carta-cara-d e-card' }, [celda(p.b || '—', p.imgB, '', p.audB)])]);
      c.onclick = (e) => { e.stopPropagation(); c.classList.toggle('vuelta'); h.sonido.clic(); };
      capa.append(c, el('small', { text: 'Toca la ficha para girarla · toca fuera para cerrar' }));
      capa.onclick = () => { capa.hidden = true; vistas.add(i); grid.children[i].classList.add('vista'); h.progreso(vistas.size, datos.length); if (vistas.size >= datos.length) h.terminar(); };
    }
    return {};
  }
};

export default [une, memoria, encuentra, parejaONo, flash, voltear];
