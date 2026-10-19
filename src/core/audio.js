'use strict';

// Sonidos sintetizados con WebAudio (sin archivos). Se pueden silenciar.
let ctx = null;
let silencio = false;
export const silenciar = (v) => { silencio = !!v; };
export const estaSilenciado = () => silencio;

const ac = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};
function tono(f, t0, dur, tipo = 'triangle', vol = 0.18, f2 = null) {
  const a = ac(), o = a.createOscillator(), g = a.createGain();
  o.type = tipo;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0); o.stop(t0 + dur + 0.03);
}
const sonar = (fn) => { if (silencio) return; try { fn(ac().currentTime); } catch (_) {} };

export const acierto = () => sonar((t) => { tono(659.25, t, 0.12); tono(987.77, t + 0.09, 0.2); });
export const error = () => sonar((t) => { tono(220, t, 0.18, 'sawtooth', 0.12); tono(165, t + 0.12, 0.25, 'sawtooth', 0.12); });
export const clic = () => sonar((t) => tono(880, t, 0.05, 'square', 0.05));
export const tic = () => sonar((t) => tono(1200 + Math.random() * 100, t, 0.04, 'square', 0.05));
export const aviso = () => sonar((t) => tono(520, t, 0.1, 'sine', 0.15));
export const fin = () => sonar((t) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tono(f, t + i * 0.12, 0.25, 'triangle', 0.18)));
export const derrota = () => sonar((t) => [392, 330, 262, 196].forEach((f, i) => tono(f, t + i * 0.16, 0.3, 'sawtooth', 0.1)));
export const salto = () => sonar((t) => tono(300, t, 0.15, 'square', 0.06, 700));
export const desbloquear = () => { try { ac(); } catch (_) {} };

// Confeti simple en un canvas temporal.
export function confeti(n = 110) {
  const c = document.createElement('canvas');
  c.className = 'confeti';
  c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  const col = ['#ff5d8f', '#ffd166', '#06d6a0', '#2ea8f5', '#9b5de5', '#ff8a3d'];
  const ps = Array.from({ length: n }, () => ({
    x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.4, vx: (Math.random() - 0.5) * 5,
    vy: 2 + Math.random() * 5, r: 4 + Math.random() * 6, c: col[(Math.random() * col.length) | 0], a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3
  }));
  let vivo = 160;
  (function paso() {
    g.clearRect(0, 0, c.width, c.height);
    ps.forEach((p) => { p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); g.restore(); });
    if (--vivo > 0) requestAnimationFrame(paso); else c.remove();
  })();
}
