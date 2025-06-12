import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  initDb,
  saveDbNow,
  getCursos,
  getCurso,
  getMaterias,
  getMateria,
  getMateriasByCurso,
  addCurso,
  addMateria,
  updateCurso,
  updateMateria,
  deleteCurso,
  deleteMateria,
  syncNames
} from './db.js';

// Configuración de Express
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// Inicializar la base de datos
await initDb();

// Sincronizar con datos existentes en la UI
// Esta función se puede llamar con datos reales de la UI
// Por ahora usamos un array vacío
await syncNames([], []);

// Rutas API
// Cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const cursos = await getCursos();
    res.status(200).json(cursos);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cursos/:id', async (req, res) => {
  try {
    const curso = await getCurso(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json(curso);
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/cursos', async (req, res) => {
  try {
    const { nombre, ...datosExtra } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del curso es obligatorio' });
    }
    
    const resultado = await addCurso(nombre, datosExtra);
    
    if (!resultado.success) {
      return res.status(409).json({ error: resultado.message, curso: resultado.curso });
    }
    
    res.status(201).json(resultado.curso);
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/cursos/:id', async (req, res) => {
  try {
    const resultado = await updateCurso(req.params.id, req.body);
    
    if (!resultado.success) {
      return res.status(404).json({ error: resultado.message });
    }
    
    res.status(200).json(resultado.curso);
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/cursos/:id', async (req, res) => {
  try {
    const resultado = await deleteCurso(req.params.id);
    
    if (!resultado.success) {
      return res.status(400).json({ error: resultado.message });
    }
    
    res.status(200).json({ message: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Materias
app.get('/api/materias', async (req, res) => {
  try {
    const materias = await getMaterias();
    res.status(200).json(materias);
  } catch (error) {
    console.error('Error al obtener materias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/materias/:id', async (req, res) => {
  try {
    const materia = await getMateria(req.params.id);
    if (!materia) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.status(200).json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/cursos/:id/materias', async (req, res) => {
  try {
    const curso = await getCurso(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    const materias = await getMateriasByCurso(req.params.id);
    res.status(200).json(materias);
  } catch (error) {
    console.error('Error al obtener materias del curso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/cursos/:id/materias', async (req, res) => {
  try {
    const { nombre, ...datosExtra } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
    }
    
    const curso = await getCurso(req.params.id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    
    const resultado = await addMateria(req.params.id, nombre, datosExtra);
    
    if (!resultado.success) {
      return res.status(409).json({ error: resultado.message, materia: resultado.materia });
    }
    
    res.status(201).json(resultado.materia);
  } catch (error) {
    console.error('Error al crear materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/materias/:id', async (req, res) => {
  try {
    const resultado = await updateMateria(req.params.id, req.body);
    
    if (!resultado.success) {
      return res.status(404).json({ error: resultado.message });
    }
    
    res.status(200).json(resultado.materia);
  } catch (error) {
    console.error('Error al actualizar materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/materias/:id', async (req, res) => {
  try {
    const resultado = await deleteMateria(req.params.id);
    
    if (!resultado.success) {
      return res.status(404).json({ error: resultado.message });
    }
    
    res.status(200).json({ message: 'Materia eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para sincronizar nombres
app.post('/api/sync', async (req, res) => {
  try {
    const { cursos = [], materias = [] } = req.body;
    const resultados = await syncNames(cursos, materias);
    res.status(200).json(resultados);
  } catch (error) {
    console.error('Error al sincronizar nombres:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para la página principal
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

// Manejar cierre del servidor
process.on('SIGINT', async () => {
  console.log('Cerrando servidor...');
  await saveDbNow();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando servidor...');
  await saveDbNow();
  process.exit(0);
});
