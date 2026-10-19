# Recreo

Creador de actividades interactivas e imprimibles para el aula, **en español, gratis y sin restricciones**.
Funciona 100 % en el navegador: no hay servidor, cuentas ni límites de uso. El nombre se cambia en `src/nombre.js`.

## Qué incluye

- **35 plantillas**: Cuestionario, Rueda aleatoria, Abrecajas, Cartas al azar, Une las parejas, Parejas, Cada oveja con su pareja,
  ¿Pareja o no?, Tarjetas flash, Voltear fichas, Anagrama, Ahorcado, Sopa de letras, Crucigrama, Deletrea la palabra,
  Escribe la respuesta, Reordenar, Imanes de palabras, Completar la frase, Concurso, Ganar o perder, Cuestionario de imágenes,
  Verdadero o falso, Ordenar por grupo, Clasificación rápida, Ordenar por rango, Observa y memoriza, Diagrama etiquetado,
  Persecución en laberinto, Atrapa al topo, Avión, Explotar globos, Fruta voladora, Generador de matemáticas y Plano de asientos.
- **35 estilos visuales** y 6 fuentes (incluida una apta para dislexia) en cada actividad, cambiables en vivo.
- **Cambio de plantilla** con un clic: el contenido se adapta (p. ej. Parejas → Cuestionario → Sopa de letras).
- Editor de contenido por tipo, con imágenes e importación de texto pegado.
- **Imprimir** cualquier actividad (hoja limpia; crucigrama y sopa de letras con su propia hoja).
- **Compartir** por enlace (el contenido viaja comprimido dentro del enlace) o por archivo, **incrustar** con `<iframe>`.
- **Tareas**: enlace para alumnos → código de resultado → importación en *Mis resultados* (con exportación a CSV).
- Tabla de clasificación, opciones por plantilla (temporizador, vidas, orden aleatorio…), pantalla completa y modo táctil.
- Comunidad con 37 actividades de ejemplo para jugar, copiar y editar.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/ (estático, base relativa)
```

Prueba de humo (en el navegador, con el servidor de desarrollo abierto), en la consola de la página:

```js
(await import('/src/dev/probar.js')).probarTodas()
```

Monta cada plantilla con cada tipo de contenido compatible y cada actividad de ejemplo, y reporta errores.

## Estructura

- `src/core/` — contenido y adaptadores, estilos, escenario (reproductor), almacenamiento (IndexedDB), router, codec de enlaces.
- `src/juegos/` — las plantillas, agrupadas por familia. Cada una declara `acepta` (tipos de contenido que juega de forma nativa),
  `opciones` y `montar(host)`.
- `src/ui/` — páginas (portada, crear, editor, actividad, comunidad, mis actividades, resultados, funciones).
- `src/datos/` — actividades de ejemplo.

## Límites conocidos

- Al no haber servidor, los datos viven en el navegador del dispositivo (IndexedDB): exporta tus actividades a archivo para respaldarlas o moverlas.
- La Comunidad contiene solo los ejemplos incluidos; no hay biblioteca pública de millones de actividades.
- Los resultados de las tareas llegan al profesor mediante un código que entrega el alumno, no de forma automática.
