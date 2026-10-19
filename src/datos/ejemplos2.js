'use strict';

// Más actividades de ejemplo (contenido propio, en español) que cubren el resto de plantillas.
const R = (t, ok = false) => ({ t, ok });
const q = (id, enun, ...resp) => ({ id, q: enun, img: null, resp });
const par = (id, a, b) => ({ id, a, b, imgA: null, imgB: null });
const it = (t, i) => ({ id: 'i' + i, t, img: null });
const lista = (...ts) => ts.map((t, i) => it(t, i));
const frases = (...ts) => ts.map((t, i) => ({ id: 'f' + i, t }));

const quizHistoria = [
  q('1', '¿En qué año llegó Cristóbal Colón a América?', R('1492', true), R('1500'), R('1453'), R('1810')),
  q('2', '¿En qué año se independizó Colombia (Grito de Independencia)?', R('1810', true), R('1492'), R('1900'), R('1750')),
  q('3', '¿Quién liderò la independencia de varios países de Sudamérica?', R('Simón Bolívar', true), R('Napoleón'), R('Cervantes'), R('Colón')),
  q('4', '¿Qué civilización construyó Machu Picchu?', R('Los incas', true), R('Los mayas'), R('Los aztecas'), R('Los romanos')),
  q('5', '¿Cuál era la capital del Imperio inca?', R('Cusco', true), R('Lima'), R('Quito'), R('Bogotá'))
];
quizHistoria[2].q = '¿Quién lideró la independencia de varios países de Sudamérica?';

export const EJEMPLOS_2 = [
  { id: 'ej-historia', titulo: 'Historia de América', plantilla: 'concurso', tipo: 'quiz', etiquetas: ['Ciencias Sociales', 'Historia'], estilo: 'tv', contenido: quizHistoria },
  { id: 'ej-apuesta', titulo: 'Ciencia: apuesta tus puntos', plantilla: 'ganar-perder', tipo: 'quiz', etiquetas: ['Ciencias Naturales'], estilo: 'neon',
    contenido: [q('1', '¿Cuál es el planeta más grande?', R('Júpiter', true), R('Tierra'), R('Marte'), R('Venus')), q('2', '¿Qué gas respiramos para vivir?', R('Oxígeno', true), R('Helio'), R('Nitrógeno'), R('Hidrógeno')),
      q('3', '¿Cuántos estados de la materia son los clásicos?', R('Tres', true), R('Dos'), R('Cinco'), R('Siete')), q('4', '¿Qué órgano bombea la sangre?', R('Corazón', true), R('Pulmón'), R('Hígado'), R('Riñón'))] },
  { id: 'ej-laberinto', titulo: 'Laberinto de la tabla del 7', plantilla: 'laberinto', tipo: 'quiz', etiquetas: ['Matemáticas', 'Primaria'], estilo: 'videojuego',
    contenido: [q('1', '7 × 3 = ?', R('21', true), R('24'), R('18'), R('28')), q('2', '7 × 6 = ?', R('42', true), R('36'), R('49'), R('48')), q('3', '7 × 8 = ?', R('56', true), R('54'), R('63'), R('48')), q('4', '7 × 9 = ?', R('63', true), R('56'), R('72'), R('69'))] },
  { id: 'ej-topo', titulo: 'Atrapa al topo: capitales', plantilla: 'topo', tipo: 'quiz', etiquetas: ['Geografía'], estilo: 'dinosaurio',
    contenido: [q('1', 'Capital de Brasil', R('Brasilia', true), R('Río de Janeiro'), R('São Paulo'), R('Salvador')), q('2', 'Capital de Uruguay', R('Montevideo', true), R('Asunción'), R('Lima'), R('Quito')), q('3', 'Capital de Bolivia', R('La Paz', true), R('Lima'), R('Bogotá'), R('Quito'))] },
  { id: 'ej-avion', titulo: 'Vuela hasta el verbo', plantilla: 'avion', tipo: 'quiz', etiquetas: ['Español', 'Gramática'], estilo: 'nubes',
    contenido: [q('1', '¿Cuál es un verbo?', R('Correr', true), R('Mesa'), R('Azul'), R('Rápidamente')), q('2', '¿Cuál es un sustantivo?', R('Casa', true), R('Cantar'), R('Verde'), R('Muy')), q('3', '¿Cuál es un adjetivo?', R('Alto', true), R('Libro'), R('Saltar'), R('Allí'))] },
  { id: 'ej-globos', titulo: 'Explota el sinónimo', plantilla: 'globos', tipo: 'quiz', etiquetas: ['Español', 'Vocabulario'], estilo: 'celebracion',
    contenido: [q('1', 'Sinónimo de "feliz"', R('Contento', true), R('Triste'), R('Enojado'), R('Cansado')), q('2', 'Sinónimo de "grande"', R('Enorme', true), R('Pequeño'), R('Delgado'), R('Corto')), q('3', 'Sinónimo de "rápido"', R('Veloz', true), R('Lento'), R('Quieto'), R('Pesado'))] },
  { id: 'ej-fruta', titulo: 'Fruta voladora: animales', plantilla: 'fruta', tipo: 'quiz', etiquetas: ['Ciencias Naturales', 'Primaria'], estilo: 'verano',
    contenido: [q('1', '¿Cuál es un mamífero?', R('Ballena', true), R('Tiburón'), R('Pingüino'), R('Cocodrilo')), q('2', '¿Cuál es un ave?', R('Águila', true), R('Murciélago'), R('Serpiente'), R('Delfín')), q('3', '¿Cuál es un reptil?', R('Iguana', true), R('Rana'), R('Perro'), R('Loro'))] },
  { id: 'ej-crucigrama', titulo: 'Crucigrama de Colombia', plantilla: 'crucigrama', tipo: 'pares', etiquetas: ['Geografía', 'Ciencias Sociales'], estilo: 'aula',
    contenido: [par('1', 'Capital del país', 'Bogotá'), par('2', 'Océano al oeste', 'Pacífico'), par('3', 'Bebida típica hecha de grano', 'Café'), par('4', 'Cordillera que lo atraviesa', 'Andes'), par('5', 'Río principal que da nombre a un departamento', 'Magdalena'), par('6', 'Ciudad de la eterna primavera', 'Medellín')] },
  { id: 'ej-sopa', titulo: 'Sopa de frutas', plantilla: 'sopa', tipo: 'lista', etiquetas: ['Vocabulario', 'Primaria'], estilo: 'primavera', contenido: lista('mango', 'banano', 'papaya', 'guayaba', 'lulo', 'maracuya', 'piña', 'sandia') },
  { id: 'ej-ahorcado', titulo: 'Ahorcado de animales', plantilla: 'ahorcado', tipo: 'lista', etiquetas: ['Vocabulario'], estilo: 'pizarrao', contenido: lista('elefante', 'jirafa', 'cocodrilo', 'mariposa', 'tortuga', 'canguro') },
  { id: 'ej-ruleta', titulo: 'Ruleta de turnos', plantilla: 'rueda', tipo: 'lista', etiquetas: ['Aula', 'Dinámicas'], estilo: 'celebracion', contenido: lista('Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo') },
  { id: 'ej-cajas', titulo: 'Abre la caja: retos del día', plantilla: 'abrecajas', tipo: 'lista', etiquetas: ['Aula', 'Dinámicas'], estilo: 'otono', contenido: lista('Cuenta un chiste', 'Di tres animales', 'Canta una estrofa', 'Imita a un animal', 'Baila 10 segundos', 'Nombra 5 frutas') },
  { id: 'ej-cartas', titulo: 'Cartas para conversar', plantilla: 'cartas', tipo: 'lista', etiquetas: ['Aula', 'Expresión oral'], estilo: 'madera', contenido: lista('¿Cuál es tu comida favorita?', '¿Qué haces los fines de semana?', 'Describe tu casa', '¿Qué quieres ser de grande?', 'Cuenta algo que aprendiste hoy') },
  { id: 'ej-oraciones2', titulo: 'Ordena las oraciones', plantilla: 'reordenar', tipo: 'oraciones', etiquetas: ['Español', 'Gramática'], estilo: 'papel', contenido: frases('El perro corre por el parque', 'Mi mamá cocina arroz con pollo', 'Hoy vamos a la escuela temprano', 'Los niños juegan en el patio') },
  { id: 'ej-imanes', titulo: 'Imanes: frases del colegio', plantilla: 'imanes', tipo: 'oraciones', etiquetas: ['Español'], estilo: 'corcho', contenido: frases('La maestra escribe en el tablero', 'Los estudiantes leen un libro', 'Guardamos los cuadernos en la mochila') },
  { id: 'ej-rapida', titulo: 'Clasificación rápida: reciclaje', plantilla: 'clasificacion-rapida', tipo: 'grupos', etiquetas: ['Ciencias Naturales', 'Medio ambiente'], estilo: 'selva',
    contenido: [{ id: 'g1', nombre: 'Orgánico', items: ['Cáscara de banano', 'Restos de comida', 'Hojas secas'].map((t) => ({ t, img: null })) }, { id: 'g2', nombre: 'Reciclable', items: ['Botella plástica', 'Periódico', 'Lata'].map((t) => ({ t, img: null })) }, { id: 'g3', nombre: 'No reciclable', items: ['Pañal', 'Espejo roto', 'Colilla'].map((t) => ({ t, img: null })) }] },
  { id: 'ej-rango', titulo: 'Planetas por distancia al Sol', plantilla: 'rango', tipo: 'lista', etiquetas: ['Ciencias Naturales', 'Astronomía'], estilo: 'espacio', contenido: lista('Mercurio', 'Venus', 'Tierra', 'Marte', 'Júpiter', 'Saturno') },
  { id: 'ej-memoria', titulo: 'Observa y memoriza: objetos', plantilla: 'memoriza', tipo: 'lista', etiquetas: ['Aula', 'Memoria'], estilo: 'detective', contenido: lista('Lápiz', 'Reloj', 'Llave', 'Gafas', 'Libro', 'Tijeras', 'Pelota', 'Taza') },
  { id: 'ej-escribe', titulo: 'Escribe el plural', plantilla: 'escribe', tipo: 'pares', etiquetas: ['Español', 'Gramática'], estilo: 'aula', contenido: [par('1', 'lápiz', 'lápices'), par('2', 'luz', 'luces'), par('3', 'canción', 'canciones'), par('4', 'pez', 'peces'), par('5', 'feliz', 'felices')] },
  { id: 'ej-flash', titulo: 'Tarjetas: inglés básico', plantilla: 'flash', tipo: 'pares', etiquetas: ['Inglés', 'Vocabulario'], estilo: 'londres', contenido: [par('1', 'casa', 'house'), par('2', 'perro', 'dog'), par('3', 'libro', 'book'), par('4', 'agua', 'water'), par('5', 'escuela', 'school'), par('6', 'amigo', 'friend')] },
  { id: 'ej-voltear', titulo: 'Voltear fichas: colores en inglés', plantilla: 'voltear', tipo: 'pares', etiquetas: ['Inglés'], estilo: 'comics', contenido: [par('1', 'rojo', 'red'), par('2', 'azul', 'blue'), par('3', 'verde', 'green'), par('4', 'amarillo', 'yellow')] },
  { id: 'ej-deletrea', titulo: 'Deletrea: partes del cuerpo', plantilla: 'deletrea', tipo: 'pares', etiquetas: ['Vocabulario', 'Primaria'], estilo: 'mascotas', contenido: [par('1', 'Sirve para ver', 'ojos'), par('2', 'Sirve para oír', 'oídos'), par('3', 'Sirve para caminar', 'piernas'), par('4', 'Sirve para escribir', 'mano')] },
  { id: 'ej-imagenes', titulo: 'Adivina el dibujo', plantilla: 'quiz-imagen', tipo: 'quiz', etiquetas: ['Aula'], estilo: 'celeste',
    contenido: [q('1', '¿Qué animal es?', R('Gato', true), R('Perro'), R('Conejo'), R('Zorro')), q('2', '¿Qué fruta es?', R('Manzana', true), R('Pera'), R('Uva'), R('Cereza'))] },
  { id: 'ej-parejaono', titulo: '¿Pareja o no? Animales y sonidos', plantilla: 'pareja-o-no', tipo: 'pares', etiquetas: ['Primaria', 'Ciencias Naturales'], estilo: 'mascotas', contenido: [par('1', 'Perro', 'Ladra'), par('2', 'Gato', 'Maúlla'), par('3', 'Vaca', 'Muge'), par('4', 'Pato', 'Grazna'), par('5', 'Caballo', 'Relincha')] },
  { id: 'ej-plano', titulo: 'Plano de asientos del grado 5.º', plantilla: 'plano-asientos', tipo: 'lista', etiquetas: ['Aula', 'Organización'], estilo: 'granito', contenido: lista('Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabel', 'Juan') },
  { id: 'ej-cartasmemoria', titulo: 'Parejas: figuras geométricas', plantilla: 'parejas', tipo: 'pares', etiquetas: ['Matemáticas', 'Primaria'], estilo: 'primaria', contenido: [par('1', 'Triángulo', '3 lados'), par('2', 'Cuadrado', '4 lados iguales'), par('3', 'Pentágono', '5 lados'), par('4', 'Hexágono', '6 lados')] }
];
