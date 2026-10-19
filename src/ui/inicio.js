'use strict';

import { el } from '../core/util.js';
import { pagina } from './layout.js';
import { PLANTILLAS } from '../plantillas.js';
import { tarjetaPlantilla } from './crear.js';
import { ESTILOS } from '../core/estilos.js';

const VENTAJAS = [
  ['⏱️', 'Crea una actividad en 1 minuto', 'Añade tu contenido, pulsa jugar y listo. Sin registro y sin límites.'],
  ['🧩', `${'{N}'}+ tipos de actividad`, 'Cuestionario, Parejas, Tarjetas, Rueda, Crucigrama y más. Cambia de plantilla con un solo clic.'],
  ['📚', 'Actividades listas para usar', 'Explora la comunidad, juega, copia y adapta cualquier actividad pública.'],
  ['🖨️', 'Imprime cualquier actividad', 'Cada actividad se imprime como una hoja limpia. Lista para clase o deberes.'],
  ['🎓', 'Enseña a tu manera', 'Juega en la pantalla del aula o asígnala como tarea y revisa los resultados.'],
  ['🎨', 'Personaliza como quieras', 'Mismo contenido, juegos y estilos visuales diferentes. Cambia colores, fuentes y reglas.']
];

export function vistaInicio(raiz) {
  const main = pagina(raiz, { ancho: false });
  const n = PLANTILLAS.length;

  main.append(
    el('section', { class: 'bloque hero' }, [
      el('div', { class: 'hero-txt' }, [
        el('h1', { text: 'Más clase, menos preparación.' }),
        el('ul', { class: 'checks' }, [
          el('li', { html: 'Crea actividades interactivas en <b>solo un minuto</b>' }),
          el('li', { html: `<b>${n}+</b> tipos de actividad, ${ESTILOS.length} estilos visuales, impresión y más` }),
          el('li', { html: '<b>Gratis</b>, en español y sin restricciones' })
        ]),
        el('a', { class: 'btn btn-grande', text: 'Empieza a crear', attrs: { href: '#/crear' } }),
        el('a', { class: 'enlace-btn', text: 'Ver actividades de la comunidad', attrs: { href: '#/comunidad' } })
      ]),
      el('div', { class: 'hero-demo' }, [
        el('div', { class: 'hero-pantalla' }, [el('div', { class: 'hero-rueda' }), el('div', { class: 'hero-flecha' })]),
        el('p', { class: 'manuscrito', text: 'Crea actividades como estas ↗' })
      ])
    ]),

    el('section', { class: 'bloque' }, [
      el('h2', { class: 'centro', text: 'Más fácil, imposible.' }),
      el('p', { class: 'centro sub', text: 'Crea un recurso personalizado con apenas unas palabras y un par de clics.' }),
      el('div', { class: 'pasos' }, [
        ['1', 'Elige una plantilla'], ['2', 'Introduce tu contenido'], ['3', 'Juégalo en cualquier dispositivo o imprímelo']
      ].map(([num, t]) => el('div', { class: 'paso' }, [el('b', { text: num }), el('span', { text: t })])))
    ]),

    el('section', { class: 'bloque' }, [
      el('h2', { class: 'centro', text: 'Diseñado para ahorrar tiempo' }),
      el('div', { class: 'ventajas' }, VENTAJAS.map(([ico, t, d]) => el('div', { class: 'ventaja' }, [
        el('div', { class: 'ventaja-ico', text: ico }), el('h3', { text: t.replace('{N}', String(n)) }), el('p', { class: 'sub', text: d })
      ]))),
      el('p', { class: 'centro' }, [el('a', { class: 'btn btn-grande', text: 'Empieza a crear', attrs: { href: '#/crear' } })])
    ]),

    el('section', { class: 'bloque' }, [
      el('h2', { class: 'centro', text: 'Más información sobre nuestras plantillas' }),
      el('p', { class: 'centro sub', text: 'Selecciona una plantilla para empezar.' }),
      el('div', { class: 'plantillas-grid' }, PLANTILLAS.map((p) => tarjetaPlantilla(p)))
    ])
  );
}
