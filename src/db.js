import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';

// Configuración de la base de datos
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'db.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter, { cursos: [], materias: [] });

// Variable para controlar el guardado automático
let saveTimeout = null;
const AUTOSAVE_DELAY = 5000; // 5 segundos

// Función para cargar la base de datos
async function loadDb() {
  try {
    await db.read();
    // Asegurarse de que la estructura existe
    db.data = db.data || { cursos: [], materias: [] };
    return true;
  } catch (error) {
    console.error('Error al cargar la base de datos:', error);
    return false;
  }
}

// Función para guardar la base de datos con autosave
async function saveDb() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(async () => {
    try {
      await db.write();
      console.log('Base de datos guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la base de datos:', error);
    }
    saveTimeout = null;
  }, AUTOSAVE_DELAY);
}

// Función para guardar inmediatamente (útil al cerrar la aplicación)
async function saveDbNow() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  
  try {
    await db.write();
    console.log('Base de datos guardada inmediatamente');
    return true;
  } catch (error) {
    console.error('Error al guardar la base de datos inmediatamente:', error);
    return false;
  }
}

// Funciones de acceso a datos
async function getCursos() {
  await loadDb();
  return db.data.cursos;
}

async function getCurso(id) {
  await loadDb();
  return db.data.cursos.find(curso => curso.id === id) || null;
}

async function getMateriasByCurso(cursoId) {
  await loadDb();
  return db.data.materias.filter(materia => materia.cursoId === cursoId);
}

async function getMaterias() {
  await loadDb();
  return db.data.materias;
}

async function getMateria(id) {
  await loadDb();
  return db.data.materias.find(materia => materia.id === id) || null;
}

async function findCursoByName(nombre) {
  await loadDb();
  return db.data.cursos.find(
    curso => curso.name.toLowerCase() === nombre.toLowerCase()
  );
}

async function findMateriaByName(nombre, cursoId = null) {
  await loadDb();
  return db.data.materias.find(
    materia => 
      materia.name.toLowerCase() === nombre.toLowerCase() && 
      (cursoId === null || materia.cursoId === cursoId)
  );
}

async function addCurso(nombre, datosExtra = {}) {
  await loadDb();
  
  // Verificar si ya existe un curso con ese nombre
  const cursoExistente = await findCursoByName(nombre);
  if (cursoExistente) {
    return { 
      success: false, 
      curso: cursoExistente, 
      message: 'Ya existe un curso con ese nombre' 
    };
  }
  
  // Crear nuevo curso
  const nuevoCurso = {
    id: nanoid(),
    name: nombre,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...datosExtra
  };
  
  db.data.cursos.push(nuevoCurso);
  await saveDb();
  
  return { success: true, curso: nuevoCurso };
}

async function addMateria(cursoId, nombre, datosExtra = {}) {
  await loadDb();
  
  // Verificar si existe el curso
  const curso = await getCurso(cursoId);
  if (!curso) {
    return { 
      success: false, 
      message: `No existe un curso con el ID: ${cursoId}` 
    };
  }
  
  // Verificar si ya existe una materia con ese nombre en ese curso
  const materiaExistente = await findMateriaByName(nombre, cursoId);
  if (materiaExistente) {
    return { 
      success: false, 
      materia: materiaExistente, 
      message: 'Ya existe una materia con ese nombre en este curso' 
    };
  }
  
  // Crear nueva materia
  const nuevaMateria = {
    id: nanoid(),
    cursoId,
    name: nombre,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...datosExtra
  };
  
  db.data.materias.push(nuevaMateria);
  await saveDb();
  
  return { success: true, materia: nuevaMateria };
}

async function updateCurso(id, datos) {
  await loadDb();
  
  const index = db.data.cursos.findIndex(curso => curso.id === id);
  if (index === -1) {
    return { 
      success: false, 
      message: `No existe un curso con el ID: ${id}` 
    };
  }
  
  // Si se está actualizando el nombre, verificar que no exista otro curso con ese nombre
  if (datos.name && datos.name !== db.data.cursos[index].name) {
    const cursoExistente = await findCursoByName(datos.name);
    if (cursoExistente && cursoExistente.id !== id) {
      return { 
        success: false, 
        message: 'Ya existe otro curso con ese nombre' 
      };
    }
  }
  
  // Actualizar curso
  db.data.cursos[index] = {
    ...db.data.cursos[index],
    ...datos,
    updatedAt: new Date().toISOString()
  };
  
  await saveDb();
  
  return { success: true, curso: db.data.cursos[index] };
}

async function updateMateria(id, datos) {
  await loadDb();
  
  const index = db.data.materias.findIndex(materia => materia.id === id);
  if (index === -1) {
    return { 
      success: false, 
      message: `No existe una materia con el ID: ${id}` 
    };
  }
  
  // Si se está actualizando el nombre, verificar que no exista otra materia con ese nombre en el mismo curso
  if (datos.name && datos.name !== db.data.materias[index].name) {
    const cursoId = datos.cursoId || db.data.materias[index].cursoId;
    const materiaExistente = await findMateriaByName(datos.name, cursoId);
    if (materiaExistente && materiaExistente.id !== id) {
      return { 
        success: false, 
        message: 'Ya existe otra materia con ese nombre en este curso' 
      };
    }
  }
  
  // Actualizar materia
  db.data.materias[index] = {
    ...db.data.materias[index],
    ...datos,
    updatedAt: new Date().toISOString()
  };
  
  await saveDb();
  
  return { success: true, materia: db.data.materias[index] };
}

async function deleteCurso(id) {
  await loadDb();
  
  const index = db.data.cursos.findIndex(curso => curso.id === id);
  if (index === -1) {
    return { 
      success: false, 
      message: `No existe un curso con el ID: ${id}` 
    };
  }
  
  // Verificar si hay materias asociadas
  const materiasAsociadas = db.data.materias.filter(materia => materia.cursoId === id);
  if (materiasAsociadas.length > 0) {
    return { 
      success: false, 
      message: `No se puede eliminar el curso porque tiene ${materiasAsociadas.length} materias asociadas` 
    };
  }
  
  // Eliminar curso
  db.data.cursos.splice(index, 1);
  await saveDb();
  
  return { success: true };
}

async function deleteMateria(id) {
  await loadDb();
  
  const index = db.data.materias.findIndex(materia => materia.id === id);
  if (index === -1) {
    return { 
      success: false, 
      message: `No existe una materia con el ID: ${id}` 
    };
  }
  
  // Eliminar materia
  db.data.materias.splice(index, 1);
  await saveDb();
  
  return { success: true };
}

// Función para sincronizar nombres existentes en la UI
async function syncNames(cursosUI = [], materiasUI = []) {
  await loadDb();
  
  const resultados = {
    cursos: { creados: 0, existentes: 0 },
    materias: { creadas: 0, existentes: 0 }
  };
  
  // Sincronizar cursos
  for (const cursoUI of cursosUI) {
    const cursoExistente = await findCursoByName(cursoUI.name);
    if (!cursoExistente) {
      await addCurso(cursoUI.name, cursoUI);
      resultados.cursos.creados++;
    } else {
      resultados.cursos.existentes++;
    }
  }
  
  // Sincronizar materias
  for (const materiaUI of materiasUI) {
    if (!materiaUI.cursoId || !materiaUI.name) continue;
    
    const materiaExistente = await findMateriaByName(materiaUI.name, materiaUI.cursoId);
    if (!materiaExistente) {
      await addMateria(materiaUI.cursoId, materiaUI.name, materiaUI);
      resultados.materias.creadas++;
    } else {
      resultados.materias.existentes++;
    }
  }
  
  await saveDbNow();
  return resultados;
}

// Inicializar la base de datos
async function initDb() {
  const success = await loadDb();
  if (success) {
    console.log('Base de datos inicializada correctamente');
    
    // Crear datos iniciales si la base de datos está vacía
    if (db.data.cursos.length === 0) {
      console.log('Creando datos iniciales...');
      
      // Ejemplo de datos iniciales
      const cursoDemo = {
        name: 'Curso Demo',
        description: 'Curso de demostración',
        isActive: true
      };
      
      const { curso } = await addCurso(cursoDemo.name, cursoDemo);
      
      if (curso) {
        await addMateria(curso.id, 'Materia Demo 1', {
          description: 'Materia de demostración 1',
          isActive: true
        });
        
        await addMateria(curso.id, 'Materia Demo 2', {
          description: 'Materia de demostración 2',
          isActive: true
        });
        
        await saveDbNow();
        console.log('Datos iniciales creados correctamente');
      }
    }
  }
  
  return success;
}

// Exportar funciones
export {
  initDb,
  loadDb,
  saveDb,
  saveDbNow,
  getCursos,
  getCurso,
  getMaterias,
  getMateria,
  getMateriasByCurso,
  findCursoByName,
  findMateriaByName,
  addCurso,
  addMateria,
  updateCurso,
  updateMateria,
  deleteCurso,
  deleteMateria,
  syncNames
};
