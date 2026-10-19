'use strict';

// Ilustraciones planas (SVG propios, viewBox 160x120) de cada plantilla. Se usan como miniatura
// en el selector de plantillas, la lista "Cambiar plantilla" y las tarjetas de actividades.
const B = '#14a5f7', R = '#ff4d6d', W = '#ffffff', Y = '#ffc233', G = '#2bc16b', P = '#9b5de5', K = '#1d3557', O = '#ff8a3d', L = '#bfe6fb';

const r = (x, y, w, h, f, rx = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}"/>`;
const c = (x, y, rad, f) => `<circle cx="${x}" cy="${y}" r="${rad}" fill="${f}"/>`;
const t = (x, y, s, tam, f = W, a = 'middle') => `<text x="${x}" y="${y}" font-family="Nunito,Segoe UI,sans-serif" font-weight="800" font-size="${tam}" fill="${f}" text-anchor="${a}">${s}</text>`;
const l = (x1, y1, x2, y2, f = K, w = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${f}" stroke-width="${w}" stroke-linecap="round"/>`;
const p = (d, f = 'none', s = K, w = 3) => `<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ok = (x, y, f = W) => p(`M${x - 6} ${y} l5 5 l8 -10`, 'none', f, 3.5);
const no = (x, y, f = R) => p(`M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`, 'none', f, 3);
const sector = (cx, cy, rad, a0, a1, f) => { const x0 = cx + rad * Math.cos(a0), y0 = cy + rad * Math.sin(a0), x1 = cx + rad * Math.cos(a1), y1 = cy + rad * Math.sin(a1); return `<path d="M${cx} ${cy} L${x0.toFixed(1)} ${y0.toFixed(1)} A${rad} ${rad} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${f}"/>`; };
const star = (x, y, rad, f = Y) => p(Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rad * 0.45 : rad; return (i ? 'L' : 'M') + (x + q * Math.cos(a)).toFixed(1) + ' ' + (y + q * Math.sin(a)).toFixed(1); }).join(' ') + 'Z', f, f, 1);

const ILU = {
  cuestionario: () => r(30, 10, 100, 26, W) + l(40, 20, 100, 20, L, 4) + l(40, 28, 80, 28, L, 4) + r(30, 46, 47, 28, B) + ok(53, 60) + r(83, 46, 47, 28, W) + no(106, 60) + r(30, 80, 47, 28, W) + no(53, 94) + r(83, 80, 47, 28, W) + no(106, 94),
  rueda: () => [0, 1, 2, 3, 4, 5].map((i) => sector(80, 66, 46, i * Math.PI / 3, (i + 1) * Math.PI / 3, [B, R, Y, G, P, O][i])).join('') + c(80, 66, 9, W) + p('M80 8 l-9 -3 l9 24 l9 -24 z', R, W, 2),
  abrecajas: () => [[28, 18, '1'], [62, 18, '2'], [96, 18, '3'], [45, 60, '4'], [79, 60, '5']].map(([x, y, n]) => r(x, y, 32, 32, B) + t(x + 16, y + 23, n, 18)).join('') + star(112, 28, 9, R),
  cartas: () => r(38, 22, 56, 80, W, 7) + `<g transform="rotate(14 110 62)">${r(82, 22, 56, 80, B, 7)}${c(110, 62, 12, W)}${star(110, 62, 8, R)}</g>` + t(66, 70, '?', 30, B),
  une: () => r(22, 16, 44, 22, B) + r(22, 49, 44, 22, B) + r(22, 82, 44, 22, B) + r(94, 16, 44, 22, W) + r(94, 49, 44, 22, W) + r(94, 82, 44, 22, W) + l(66, 27, 94, 60, R, 3) + l(66, 60, 94, 93, R, 3) + l(66, 93, 94, 27, R, 3),
  parejas: () => [[24, 14], [66, 14], [108, 14], [24, 58], [66, 58], [108, 58]].map(([x, y], i) => r(x, y, 34, 34, i === 1 || i === 3 ? W : i === 0 || i === 5 ? B : L)).join('') + p('M83 24 v14 M76 31 h14', 'none', B, 5) + star(41, 75, 8, R) + star(125, 75, 8, R) + p('M41 24 v14 M34 31 h14', 'none', W, 5),
  encuentra: () => r(24, 8, 112, 26, K) + t(80, 27, '¿ ? ¿', 16) + [[22, 46], [60, 46], [98, 46], [22, 82], [60, 82], [98, 82]].map(([x, y], i) => r(x, y, 40, 28, i === 1 ? G : W)).join('') + ok(80, 60),
  'pareja-o-no': () => r(14, 20, 54, 62, B, 7) + r(92, 20, 54, 62, R, 7) + t(41, 60, 'A', 28) + t(119, 60, 'B', 28) + c(80, 51, 14, Y) + t(80, 57, '=', 20, K) + r(34, 94, 38, 18, G) + r(88, 94, 38, 18, W),
  flash: () => r(26, 32, 100, 70, L, 8) + r(34, 22, 100, 70, W, 8) + l(48, 42, 112, 42, B, 5) + l(48, 56, 96, 56, L, 5) + l(48, 70, 104, 70, L, 5) + c(120, 82, 8, R),
  voltear: () => r(22, 22, 52, 76, B, 7) + r(86, 22, 52, 76, W, 7) + p('M60 14 a20 20 0 0 1 40 0', 'none', R, 4) + p('M96 8 l5 7 l-8 2', R, R, 2) + t(48, 68, 'A', 32) + t(112, 68, 'B', 32, B),
  anagrama: () => ['H', 'L', 'L', 'E', 'O'].map((x, i) => r(16 + i * 26, 30, 22, 30, i % 2 ? R : B) + t(27 + i * 26, 52, x, 18)).join('') + p('M44 78 q36 30 76 0', 'none', R, 4) + p('M112 70 l10 6 l-12 4', R, R, 2),
  ahorcado: () => l(30, 106, 100, 106, K, 5) + l(48, 106, 48, 14, K, 5) + l(48, 14, 98, 14, K, 5) + l(98, 14, 98, 30, K, 4) + c(98, 40, 10, W) + p('M98 50 v26 M98 58 l-12 12 M98 58 l12 12 M98 76 l-10 18 M98 76 l10 18', 'none', K, 4) + [0, 1, 2, 3].map((i) => l(112 + i * 12, 104, 120 + i * 12, 104, K, 3)).join(''),
  sopa: () => Array.from({ length: 5 }, (_, i) => Array.from({ length: 6 }, (_, j) => r(14 + j * 22, 12 + i * 20, 19, 17, (i === j - 1 || (i === 2 && j > 0 && j < 5)) ? (i === 2 ? R : B) : W, 3)).join('')).join('') + p('M18 70 H140', 'none', R, 3),
  crucigrama: () => [[20, 20], [52, 20], [84, 20], [116, 20]].map(([x, y]) => r(x, y, 28, 28, W)).join('') + [[52, 52], [52, 84]].map(([x, y]) => r(x, y, 28, 28, B)).join('') + r(84, 52, 28, 28, W) + r(84, 84, 28, 28, W) + t(66, 72, 'A', 18) + t(66, 104, 'B', 18) + r(20, 20, 28, 28, Y),
  deletrea: () => r(30, 10, 100, 24, W) + l(42, 22, 98, 22, L, 4) + [0, 1, 2, 3].map((i) => r(22 + i * 30, 46, 26, 30, i < 2 ? B : W, 4) + (i < 2 ? t(35 + i * 30, 68, 'AB'[i], 18) : '')).join('') + [0, 1, 2, 3, 4].map((i) => r(14 + i * 28, 88, 22, 24, R, 4)).join(''),
  escribe: () => r(24, 12, 112, 30, W) + l(36, 27, 100, 27, L, 4) + r(24, 54, 112, 34, W) + l(34, 71, 34, 71, K, 3) + `<rect x="40" y="62" width="3" height="18" fill="${B}"/>` + r(56, 96, 48, 16, B) + t(80, 109, 'OK', 12),
  reordenar: () => r(14, 24, 40, 24, R) + t(34, 41, 'amo', 13) + r(60, 24, 20, 24, B) + t(70, 41, 'Yo', 13) + r(86, 24, 48, 24, B) + t(110, 41, 'te', 13) + p('M26 18 q54 -26 108 0', 'none', R, 3) + r(14, 72, 40, 24, B) + r(60, 72, 40, 24, W) + r(106, 72, 40, 24, B),
  imanes: () => p('M44 30 v34 a26 26 0 0 0 52 0 v-34', 'none', R, 14) + r(36, 22, 18, 14, W, 2) + r(86, 22, 18, 14, W, 2) + r(18, 90, 38, 18, B) + r(64, 96, 34, 18, Y) + r(106, 88, 36, 18, G),
  completar: () => r(14, 16, 132, 52, W) + l(26, 34, 74, 34, K, 4) + r(80, 24, 40, 20, L, 4) + l(26, 54, 60, 54, K, 4) + r(66, 44, 40, 20, L, 4) + r(22, 84, 34, 24, B) + r(62, 84, 34, 24, R) + r(102, 84, 34, 24, G) + p('M80 74 v-12', 'none', K, 2),
  concurso: () => r(26, 12, 108, 30, P) + t(80, 33, 'x2', 18) + [[26, 52], [86, 52], [26, 84], [86, 84]].map(([x, y], i) => r(x, y, 48, 26, i === 1 ? G : B)).join('') + c(142, 14, 10, Y) + t(142, 19, '50', 11, K),
  'ganar-perder': () => r(26, 18, 50, 50, W, 8) + c(40, 32, 4, K) + c(62, 54, 4, K) + c(51, 43, 4, K) + r(84, 38, 50, 50, R, 8) + c(98, 52, 4, W) + c(120, 74, 4, W) + c(98, 74, 4, W) + c(120, 52, 4, W) + t(80, 108, '+ / -', 16, K),
  'quiz-imagen': () => r(30, 10, 100, 60, W, 6) + c(62, 34, 10, Y) + p('M34 62 l26 -22 l18 16 l14 -10 l30 16 v8 h-88 z', G, G, 1) + `<rect x="30" y="10" width="100" height="60" rx="6" fill="${L}" opacity=".6"/>` + r(30, 80, 47, 26, B) + r(83, 80, 47, 26, W),
  'verdadero-falso': () => r(14, 24, 62, 70, G, 8) + ok(45, 62) + r(84, 24, 62, 70, R, 8) + p('M104 52 l22 22 M126 52 l-22 22', 'none', W, 6) + t(80, 112, 'V / F', 12, K),
  'por-grupo': () => r(16, 12, 60, 96, B, 6) + r(84, 12, 60, 96, R, 6) + [0, 1, 2].map((i) => r(24, 24 + i * 28, 44, 20, W, 4)).join('') + [0, 1].map((i) => r(92, 24 + i * 28, 44, 20, W, 4)).join('') + r(92, 80, 44, 20, L, 4),
  'clasificacion-rapida': () => r(52, 14, 56, 28, Y, 6) + p('M80 46 v18 M72 58 l8 8 l8 -8', 'none', K, 4) + r(16, 76, 60, 34, B) + r(84, 76, 60, 34, R) + p('M118 12 l-8 14 h10 l-6 14', 'none', O, 4),
  rango: () => [[22, 86, 28], [58, 62, 52], [94, 38, 76]].map(([x, y, h], i) => r(x, 110 - h, 36, h, [B, R, G][i], 4) + t(x + 18, 110 - h + 24, String(i + 1), 20)).join(''),
  memoriza: () => p('M14 60 q66 -52 132 0 q-66 52 -132 0 z', W, K, 4) + c(80, 60, 22, B) + c(80, 60, 10, K) + c(73, 53, 4, W) + [0, 1, 2].map((i) => c(40 + i * 40, 104, 6, [R, Y, G][i])).join(''),
  diagrama: () => r(22, 14, 116, 92, W, 6) + c(80, 56, 20, G) + c(80, 56, 8, Y) + [[34, 28, '1'], [126, 40, '2'], [48, 92, '3']].map(([x, y, n]) => c(x, y, 11, R) + t(x, y + 5, n, 14)).join('') + l(45, 33, 64, 48, R, 2) + l(115, 42, 98, 50, R, 2),
  laberinto: () => r(12, 10, 136, 100, K, 6) + p('M22 20 H138 V100 H22 Z M22 40 H100 M60 60 H138 M22 80 H100', 'none', B, 4) + c(32, 30, 6, Y) + c(128, 90, 8, R) + r(112, 28, 16, 12, G, 3),
  topo: () => [[34, 70], [96, 70], [65, 94]].map(([x, y]) => `<ellipse cx="${x + 14}" cy="${y + 12}" rx="26" ry="11" fill="${K}"/>`).join('') + c(48, 62, 16, '#a0633a') + c(43, 58, 3, W) + c(53, 58, 3, W) + c(48, 66, 4, K) + p('M96 28 l22 22', 'none', K, 6) + r(108, 14, 28, 18, R, 4),
  avion: () => `<g transform="rotate(-12 80 60)">${p('M20 62 L132 48 L20 40 L36 54 Z', W, K, 3)}${p('M62 54 L44 82 L70 56 M62 50 L46 24 L72 48', B, K, 3)}</g>` + r(104, 86, 40, 16, W, 8) + r(14, 92, 30, 14, L, 7),
  globos: () => [[40, 44, R], [76, 32, B], [112, 46, Y], [58, 70, G], [96, 74, P]].map(([x, y, f]) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="${f}"/>` + l(x, y + 19, x - 4, y + 36, K, 1.5)).join(''),
  fruta: () => c(54, 52, 22, R) + p('M54 30 q4 -12 12 -14', 'none', G, 4) + c(110, 70, 22, O) + p('M110 48 q-2 -10 6 -14', 'none', G, 4) + p('M10 96 h30 M124 100 h28', 'none', B, 3),
  'generador-mates': () => r(22, 14, 116, 92, W, 8) + t(54, 54, '+', 32, B) + t(106, 54, '−', 32, R) + t(54, 94, '×', 32, G) + t(106, 94, '÷', 32, P),
  'plano-asientos': () => r(36, 10, 88, 16, K) + [0, 1, 2, 3].map((i) => r(20 + (i % 2) * 70 + (i % 2 ? 0 : 0), 40 + Math.floor(i / 2) * 36, 50, 26, i === 2 ? R : B, 4)).join('') + [0, 1].map((i) => c(45 + i * 70, 54 + 0, 5, W)).join('')
};

export function ilustracion(id) {
  const f = ILU[id];
  return `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${f ? f() : r(50, 30, 60, 60, B)}</svg>`;
}
