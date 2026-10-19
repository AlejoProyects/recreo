'use strict';

import './css/sitio.css';
import './css/escenario.css';
import './css/paginas.css';
import { ruta, iniciarRouter } from './core/router.js';
import { vistaInicio } from './ui/inicio.js';
import { vistaCrear } from './ui/crear.js';
import { vistaEditor } from './ui/editor.js';
import { vistaActividad, vistaEjemplo, vistaCompartida, vistaIncrustada } from './ui/actividad.js';
import { vistaComunidad } from './ui/comunidad.js';
import { vistaResultados } from './ui/resultados.js';
import { vistaFunciones } from './ui/funciones.js';
import { vistaMis } from './ui/mis.js';

ruta('/', vistaInicio);
ruta('/crear', vistaCrear);
ruta('/crear/:plantilla', vistaEditor);
ruta('/editar/:id', vistaEditor);
ruta('/a/:id', vistaActividad);
ruta('/mis', vistaMis);
ruta('/comunidad', vistaComunidad);
ruta('/e/:id', vistaEjemplo);
ruta('/c/:data', vistaCompartida);
ruta('/embed/:data', vistaIncrustada);
ruta('/resultados', vistaResultados);
ruta('/funciones', vistaFunciones);

iniciarRouter(document.getElementById('app'));
