'use strict';

import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/lora/500.css';
import '@fontsource/lora/700.css';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';

// ---------------------------------------------------------------------------
// Estilos visuales: (id, nombre, fondo, tinta, tarjeta, tinta de tarjeta, acento, decoración, extra)
// El fondo es CSS; la decoración son emojis que se repiten como patrón tenue.
// ---------------------------------------------------------------------------
const D = (id, nombre, fondo, tinta, tarjeta, tintaT, acento, deco = [], extra = {}) =>
  ({ id, nombre, fondo, tinta, tarjeta, tintaT, acento, deco, ...extra });

export const ESTILOS = [
  D('clasico', 'Clásico', 'linear-gradient(160deg,#eef8ff,#cfeaff)', '#1d3557', '#ffffff', '#1d3557', '#2ea8f5'),
  D('aula', 'Aula', 'linear-gradient(180deg,#f4e7c8,#e3cf9d)', '#3b2a14', '#fffaf0', '#3b2a14', '#3e8e5a', ['✏️', '📐', '📏', '🔤']),
  D('playa', 'Playa', 'linear-gradient(180deg,#8fdcff 0%,#c9f0ff 55%,#f7e2a8 56%,#f1d38a 100%)', '#0b4a63', '#ffffff', '#0b4a63', '#ff8a3d', ['🐚', '🌴', '🦀']),
  D('londres', 'Londres', 'linear-gradient(180deg,#b9c3cc,#e3e7ea)', '#2b2f36', '#ffffff', '#2b2f36', '#c8102e', ['🚌', '☎️', '👑']),
  D('videojuego', 'Videojuego', 'linear-gradient(160deg,#1a1033,#2a1b5e)', '#f4f0ff', '#2d2160', '#f4f0ff', '#39ff88', ['🎮', '👾', '⭐'], { fuente: 'fredoka' }),
  D('otono', 'Otoño', 'linear-gradient(180deg,#ffd9a0,#f0a860)', '#4a2410', '#fff4e3', '#4a2410', '#c4561f', ['🍂', '🍁', '🌰']),
  D('anil', 'Añil', 'linear-gradient(160deg,#27306b,#3f4aa8)', '#eef0ff', '#ffffff', '#27306b', '#ffd166'),
  D('legibilidad', 'Alta legibilidad', '#ffffff', '#000000', '#fffbe0', '#000000', '#0050d8', [], { fuente: 'nunito', grande: true }),
  D('corcho', 'Panel de corcho', 'linear-gradient(160deg,#c9955a,#b07b42)', '#ffffff', '#fffdf2', '#3a2a14', '#d94f3d', ['📌']),
  D('biblioteca', 'Biblioteca mágica', 'linear-gradient(160deg,#3b1f4a,#6b3a73)', '#fbeeff', '#fff7ea', '#3b1f4a', '#f2b632', ['📖', '✨', '🔮'], { fuente: 'lora' }),
  D('nubes', 'Nubes', 'linear-gradient(180deg,#7cc4f5,#d9f0ff)', '#0e3a5c', '#ffffff', '#0e3a5c', '#ff7a90', ['☁️']),
  D('pizarrab', 'Pizarra blanca', '#fdfdfd', '#1c2733', '#ffffff', '#1c2733', '#1f7ae0', [], { borde: '#cfd8e0' }),
  D('submarino', 'Submarino', 'linear-gradient(180deg,#0a6fa8,#04304d)', '#e8f9ff', '#d9f4ff', '#05324f', '#ffb347', ['🐠', '🫧', '🐙', '🐢']),
  D('selva', 'Selva', 'linear-gradient(160deg,#2f7d3a,#164d22)', '#f0ffe8', '#fdfbe8', '#1c3d14', '#ffb703', ['🌿', '🦜', '🐒', '🍃']),
  D('detective', 'Detective', 'linear-gradient(160deg,#4b3f35,#2a221c)', '#f2e6d0', '#f5ecd8', '#2a221c', '#c0392b', ['🔍', '🕵️', '👣'], { fuente: 'lora' }),
  D('verano', 'Verano', 'linear-gradient(180deg,#ffe27a,#ffb347)', '#5a2d00', '#fffbea', '#5a2d00', '#00a8cc', ['☀️', '🍉', '🕶️']),
  D('madera', 'Escritorio de madera', 'repeating-linear-gradient(90deg,#b98a57 0 38px,#a97a48 38px 40px)', '#2c1b08', '#fffaf0', '#2c1b08', '#2e7d6b', ['📎']),
  D('primaria', 'Primaria', 'linear-gradient(160deg,#fff3b0,#ffd6e0)', '#3d2c5c', '#ffffff', '#3d2c5c', '#ff5d8f', ['🔢', '🅰️', '🎨'], { fuente: 'fredoka' }),
  D('mascotas', 'Mascotas', 'linear-gradient(160deg,#ffe8d1,#ffd0a8)', '#5a3418', '#fffaf5', '#5a3418', '#e07b39', ['🐶', '🐱', '🐾', '🐹']),
  D('tv', 'Concurso de TV', 'radial-gradient(circle at 50% 30%,#3a2bb0,#10094f)', '#ffffff', '#1a1380', '#ffffff', '#ffd400', ['⭐', '🎤'], { fuente: 'fredoka' }),
  D('espeluznante', 'Espeluznante', 'linear-gradient(160deg,#1c1030,#0a0612)', '#ffb86b', '#2a1747', '#ffd9a8', '#ff7a1a', ['🎃', '🦇', '👻', '🕸️'], { fuente: 'patrick' }),
  D('espacio', 'Espacio', 'radial-gradient(circle at 70% 20%,#2a2a7a,#07071f)', '#eaf0ff', '#1c1f5c', '#eaf0ff', '#ff5ec4', ['⭐', '🪐', '🚀', '✨']),
  D('pizarrao', 'Pizarra oscura', 'linear-gradient(160deg,#2f3b36,#1f2824)', '#f4f4ee', '#3b4842', '#f4f4ee', '#ffe066', ['✏️'], { fuente: 'patrick' }),
  D('celeste', 'Celeste', 'linear-gradient(180deg,#d6f1ff,#a8dcf5)', '#0b3d5c', '#ffffff', '#0b3d5c', '#1a8ad4'),
  D('neon', 'Neón', 'linear-gradient(160deg,#0b0b14,#14142a)', '#eaffff', '#101024', '#eaffff', '#00f0ff', [], { borde: '#00f0ff', brillo: true }),
  D('celebracion', 'Celebración', 'linear-gradient(160deg,#ffe1f0,#e3f2ff)', '#4a1d5e', '#ffffff', '#4a1d5e', '#ff4fa3', ['🎉', '🎈', '🎊', '🎂']),
  D('dinosaurio', 'Dinosaurio', 'linear-gradient(180deg,#d9e8a0,#9bbf4a)', '#2a3d0c', '#fbfff0', '#2a3d0c', '#e0662b', ['🦖', '🦕', '🌋', '🥚']),
  D('primavera', 'Primavera', 'linear-gradient(180deg,#e9ffd9,#ffe0f0)', '#2d4a1c', '#ffffff', '#2d4a1c', '#e8559a', ['🌸', '🌷', '🐝', '🦋']),
  D('oeste', 'Salvaje oeste', 'linear-gradient(180deg,#f6c777,#c98a45)', '#3b1d08', '#fff1d6', '#3b1d08', '#a3361f', ['🤠', '🌵', '🐎'], { fuente: 'lora' }),
  D('comics', 'Cómics', 'radial-gradient(circle,#ffe14d 2px,transparent 2.5px) 0 0/18px 18px,#fff6a8', '#111111', '#ffffff', '#111111', '#ff2d55', ['💥'], { fuente: 'fredoka', borde: '#111' }),
  D('granito', 'Granito', 'linear-gradient(160deg,#c9ccd1,#9ea3aa)', '#1f2328', '#f3f4f6', '#1f2328', '#3b6fd4'),
  D('corazones', 'Corazones', 'linear-gradient(160deg,#ffd1dc,#ff9db8)', '#6b0f2f', '#fff5f8', '#6b0f2f', '#e8174f', ['❤️', '💖', '💕']),
  D('invierno', 'Invierno', 'linear-gradient(180deg,#dff1ff,#b9d9f2)', '#143a5a', '#ffffff', '#143a5a', '#2a7fd1', ['❄️', '⛄', '🧣']),
  D('azulnegro', 'Azul y negro', 'linear-gradient(160deg,#050a1a,#0a2350)', '#e9f0ff', '#0e1f45', '#e9f0ff', '#2f8cff'),
  D('navidad', 'Navidad', 'linear-gradient(160deg,#b3162a,#6e0b1a)', '#fff4f0', '#fffaf2', '#5a0d18', '#1f8f4a', ['🎄', '🎁', '⛄', '⭐'])
];

export const FUENTES = [
  { id: 'nunito', nombre: 'Predeterminada', css: "'Nunito','Segoe UI',system-ui,sans-serif" },
  { id: 'fredoka', nombre: 'Redondeada', css: "'Fredoka','Nunito',sans-serif" },
  { id: 'patrick', nombre: 'Manuscrita', css: "'Patrick Hand','Comic Sans MS',cursive" },
  { id: 'lora', nombre: 'Con serifa', css: "'Lora',Georgia,serif" },
  { id: 'dislexia', nombre: 'Apta para dislexia', css: "'OpenDyslexic','Comic Sans MS',sans-serif" },
  { id: 'mono', nombre: 'Monoespaciada', css: "'Cascadia Code',Consolas,'Courier New',monospace" }
];

export const estiloPorId = (id) => ESTILOS.find((e) => e.id === id) || ESTILOS[0];
export const fuentePorId = (id) => FUENTES.find((f) => f.id === id) || FUENTES[0];

// Patrón de emojis como imagen SVG (data URI), muy tenue.
function patron(deco) {
  if (!deco.length) return 'none';
  const t = 90;
  const items = deco.map((e, i) => `<text x='${(i * 37) % t + 8}' y='${(i * 53) % t + 28}' font-size='26' transform='rotate(${(i * 37) % 40 - 20} ${(i * 37) % t + 20} ${(i * 53) % t + 20})'>${e}</text>`).join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${t * 1.6}' height='${t * 1.6}' viewBox='0 0 ${t} ${t}' opacity='.22'>${items}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Aplica el estilo y la fuente a un nodo (el "escenario" del juego o una miniatura).
export function aplicarEstilo(nodo, estiloId, fuenteId) {
  const e = estiloPorId(estiloId);
  const f = fuentePorId(fuenteId && fuenteId !== 'auto' ? fuenteId : (e.fuente || 'nunito'));
  const s = nodo.style;
  s.setProperty('--e-fondo', e.fondo);
  s.setProperty('--e-patron', patron(e.deco));
  s.setProperty('--e-tinta', e.tinta);
  s.setProperty('--e-tarjeta', e.tarjeta);
  s.setProperty('--e-tinta-t', e.tintaT);
  s.setProperty('--e-acento', e.acento);
  s.setProperty('--e-borde', e.borde || 'rgba(0,0,0,.18)');
  s.setProperty('--e-brillo', e.brillo ? `0 0 14px ${e.acento}` : '0 3px 10px rgba(0,0,0,.18)');
  s.setProperty('--e-fuente', f.css);
  s.setProperty('--e-escala', e.grande ? '1.12' : '1');
  nodo.dataset.estilo = e.id;
}

export function miniatura(estiloId) {
  const d = document.createElement('div');
  d.className = 'mini-estilo';
  aplicarEstilo(d, estiloId);
  d.innerHTML = '<span class="mini-tarjeta">Aa</span>';
  return d;
}
