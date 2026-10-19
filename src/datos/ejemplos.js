'use strict';

// Actividades de ejemplo de la Comunidad (contenido propio, en español).
const R = (t, ok = false) => ({ t, ok });
const q = (id, enun, ...resp) => ({ id, q: enun, img: null, resp });
const par = (id, a, b) => ({ id, a, b, imgA: null, imgB: null });
const it = (id, t) => ({ id, t, img: null });

import { EJEMPLOS_2 } from './ejemplos2.js';

const BASE = [
  { id: 'ej-capitales', titulo: 'Capitales de Sudamérica', plantilla: 'cuestionario', tipo: 'quiz', etiquetas: ['Geografía', 'Primaria'], estilo: 'clasico',
    contenido: [
      q('1', '¿Cuál es la capital de Colombia?', R('Bogotá', true), R('Medellín'), R('Cali'), R('Cartagena')),
      q('2', '¿Cuál es la capital de Perú?', R('Lima', true), R('Cusco'), R('Quito'), R('La Paz')),
      q('3', '¿Cuál es la capital de Chile?', R('Santiago', true), R('Valparaíso'), R('Lima'), R('Montevideo')),
      q('4', '¿Cuál es la capital de Argentina?', R('Buenos Aires', true), R('Córdoba'), R('Rosario'), R('Asunción')),
      q('5', '¿Cuál es la capital de Ecuador?', R('Quito', true), R('Guayaquil'), R('Cuenca'), R('Bogotá'))
    ] },
  { id: 'ej-celula', titulo: 'Partes de la célula', plantilla: 'une', tipo: 'pares', etiquetas: ['Ciencias Naturales', 'Biología'], estilo: 'selva',
    contenido: [par('1', 'Núcleo', 'Contiene el material genético'), par('2', 'Mitocondria', 'Produce la energía de la célula'), par('3', 'Membrana', 'Controla lo que entra y sale'),
      par('4', 'Ribosoma', 'Fabrica proteínas'), par('5', 'Cloroplasto', 'Realiza la fotosíntesis')] },
  { id: 'ej-verbos', titulo: 'Verbos en pasado', plantilla: 'parejas', tipo: 'pares', etiquetas: ['Español', 'Gramática'], estilo: 'primaria',
    contenido: [par('1', 'Yo como', 'Yo comí'), par('2', 'Tú vas', 'Tú fuiste'), par('3', 'Ella hace', 'Ella hizo'), par('4', 'Nosotros vemos', 'Nosotros vimos'), par('5', 'Ellos dicen', 'Ellos dijeron'), par('6', 'Yo tengo', 'Yo tuve')] },
  { id: 'ej-sistema', titulo: 'Planetas del Sistema Solar', plantilla: 'rueda', tipo: 'lista', etiquetas: ['Ciencias Naturales', 'Astronomía'], estilo: 'espacio',
    contenido: ['Mercurio', 'Venus', 'Tierra', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'].map((t, i) => it(String(i), t)) },
  { id: 'ej-animales', titulo: 'Clasifica los animales', plantilla: 'por-grupo', tipo: 'grupos', etiquetas: ['Ciencias Naturales', 'Primaria'], estilo: 'mascotas',
    contenido: [
      { id: 'g1', nombre: 'Mamíferos', items: ['Perro', 'Delfín', 'Murciélago', 'Vaca'].map((t) => ({ t, img: null })) },
      { id: 'g2', nombre: 'Aves', items: ['Águila', 'Pingüino', 'Loro', 'Colibrí'].map((t) => ({ t, img: null })) },
      { id: 'g3', nombre: 'Reptiles', items: ['Serpiente', 'Tortuga', 'Iguana', 'Cocodrilo'].map((t) => ({ t, img: null })) }
    ] },
  { id: 'ej-oraciones', titulo: 'Completa el refrán', plantilla: 'completar', tipo: 'oraciones', etiquetas: ['Español', 'Refranes'], estilo: 'aula',
    contenido: [{ id: '1', t: 'Más vale [tarde] que nunca' }, { id: '2', t: 'A [caballo] regalado no se le mira el diente' }, { id: '3', t: 'No hay [mal] que por bien no venga' }, { id: '4', t: 'Al que madruga Dios lo [ayuda]' }] },
  { id: 'ej-vf', titulo: 'Verdadero o falso: el cuerpo humano', plantilla: 'verdadero-falso', tipo: 'vf', etiquetas: ['Ciencias Naturales'], estilo: 'nubes',
    contenido: [{ id: '1', t: 'El corazón bombea la sangre', ok: true }, { id: '2', t: 'Los pulmones digieren los alimentos', ok: false }, { id: '3', t: 'El esqueleto adulto tiene 206 huesos', ok: true },
      { id: '4', t: 'El cerebro está en el abdomen', ok: false }, { id: '5', t: 'La piel es el órgano más grande', ok: true }, { id: '6', t: 'Los riñones filtran la sangre', ok: true }] },
  { id: 'ej-mates', titulo: 'Sumas y restas', plantilla: 'generador-mates', tipo: 'mates', etiquetas: ['Matemáticas', 'Primaria'], estilo: 'videojuego', contenido: { ops: ['+', '-'], max: 20, n: 10 } },
  { id: 'ej-palabras', titulo: 'Palabras del mar', plantilla: 'anagrama', tipo: 'lista', etiquetas: ['Vocabulario', 'Español'], estilo: 'submarino',
    contenido: ['delfin', 'ballena', 'tiburon', 'medusa', 'pulpo', 'tortuga'].map((t, i) => it(String(i), t)) },
  { id: 'ej-planta', titulo: 'Partes de una planta', plantilla: 'diagrama', tipo: 'diagrama', etiquetas: ['Ciencias Naturales', 'Biología'], estilo: 'primavera',
    contenido: {
      img: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='#e8f6ff'/><rect y='300' width='400' height='100' fill='#8d5a2b'/>
<g stroke='#6b4423' stroke-width='3' fill='none'><path d='M200 300 L150 370'/><path d='M200 300 L200 385'/><path d='M200 300 L255 372'/></g>
<rect x='194' y='130' width='12' height='172' fill='#3f9d3f'/><ellipse cx='150' cy='215' rx='48' ry='20' fill='#4cbb4c' transform='rotate(-25 150 215)'/><ellipse cx='252' cy='190' rx='48' ry='20' fill='#4cbb4c' transform='rotate(25 252 190)'/>
<g fill='#ff6fa5'><circle cx='200' cy='95' r='30'/><circle cx='165' cy='125' r='30'/><circle cx='235' cy='125' r='30'/><circle cx='175' cy='70' r='30'/><circle cx='225' cy='70' r='30'/></g><circle cx='200' cy='100' r='20' fill='#ffd23f'/></svg>`),
      pins: [{ id: 'p1', x: 50, y: 25, t: 'Flor' }, { id: 'p2', x: 36, y: 53, t: 'Hoja' }, { id: 'p3', x: 50, y: 66, t: 'Tallo' }, { id: 'p4', x: 50, y: 94, t: 'Raíz' }, { id: 'p5', x: 50, y: 82, t: 'Suelo' }]
    } },
  { id: 'ej-oficios', titulo: 'Oficios y herramientas', plantilla: 'encuentra', tipo: 'pares', etiquetas: ['Vocabulario'], estilo: 'madera',
    contenido: [par('1', 'Carpintero', 'Martillo'), par('2', 'Médico', 'Estetoscopio'), par('3', 'Pintor', 'Brocha'), par('4', 'Cocinero', 'Cuchillo'), par('5', 'Agricultor', 'Azadón')] }
];

export const EJEMPLOS = [...BASE, ...EJEMPLOS_2];
