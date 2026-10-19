'use strict';

import azar from './juegos/azar.js';
import emparejar from './juegos/emparejar.js';
import palabras from './juegos/palabras.js';
import concursos from './juegos/concursos.js';
import clasificar from './juegos/clasificar.js';
import arcade from './juegos/arcade.js';
import aula from './juegos/aula.js';

// Registro de todas las plantillas (juegos). Cada una declara qué tipos de contenido acepta.
export const PLANTILLAS = [...azar, ...emparejar, ...palabras, ...concursos, ...clasificar, ...arcade, ...aula];
export const plantillaPorId = (id) => PLANTILLAS.find((p) => p.id === id) || null;
