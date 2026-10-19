'use strict';

// Franjas de edad y asignaturas (mismas opciones que ofrece el original al publicar).
export const EDADES = ['Preescolar', 'Prejardín', 'Jardín', 'Transición', 'Básica Primaria', '1°', '2°', '3°', '4°', '5°', 'Secundaria', '6°', '7°', '8°', '9°', 'Media', '10°', '11°',
  'Técnica', 'Educación Superior', 'Universidad', 'Profesional', 'Adultos', 'NEE'];
export const ASIGNATURAS = ['Artística', 'Biología', 'C. Sociales', 'Ciencias Naturales', 'Economía', 'Ed. Física', 'ESL', 'Español', 'Ética', 'Filosofía', 'Física', 'Francés', 'Geografía',
  'Historia', 'Inglés', 'Literatura', 'Mate', 'Música', 'Políticas', 'Química', 'Religión', 'Tecnología E Informática'];

// Sinónimos para reconocer etiquetas escritas a mano (p. ej. en las actividades de ejemplo).
const SINONIMOS = { 'ciencias sociales': 'C. Sociales', 'matematicas': 'Mate', 'matemáticas': 'Mate', 'educacion fisica': 'Ed. Física', 'informatica': 'Tecnología E Informática', 'primaria': 'Básica Primaria' };
const sin = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function canon(tag) {
  const t = String(tag).trim();
  const por = SINONIMOS[t.toLowerCase()] || SINONIMOS[sin(t)];
  if (por) return por;
  return [...EDADES, ...ASIGNATURAS].find((x) => sin(x) === sin(t)) || t;
}

// Clasifica los datos de una actividad en edad / asignaturas / temas (usa los campos propios o deduce de las etiquetas).
export function metaDe(a) {
  const etq = (a.etiquetas || []).map(canon);
  return {
    edad: a.edad || etq.filter((t) => EDADES.includes(t)),
    asig: a.asignaturas || etq.filter((t) => ASIGNATURAS.includes(t)),
    temas: [...new Set([a.tema, ...etq.filter((t) => !EDADES.includes(t) && !ASIGNATURAS.includes(t))].filter(Boolean))]
  };
}
