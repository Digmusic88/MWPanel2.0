import assert from 'assert';
import { 
  initDb, 
  getCursos, 
  getCurso, 
  getMaterias, 
  getMateriasByCurso, 
  addCurso, 
  addMateria, 
  updateCurso, 
  updateMateria, 
  archiveMateria,
  unarchiveMateria,
  deleteCurso, 
  deleteMateria,
  findCursoByName,
  findMateriaByName
} from '../db.js';

// Función para ejecutar los tests
async function runTests() {
  console.log('Iniciando tests de la base de datos...');
  
  try {
    // Inicializar la base de datos
    await initDb();
    
    // Test 1: Crear un curso
    console.log('Test 1: Crear un curso');
    const nombreCursoTest = `Curso Test ${Date.now()}`;
    const resultadoCurso = await addCurso(nombreCursoTest, { description: 'Curso de prueba' });
    assert.strictEqual(resultadoCurso.success, true, 'El curso debería crearse correctamente');
    assert.strictEqual(resultadoCurso.curso.name, nombreCursoTest, 'El nombre del curso debería coincidir');
    
    // Test 2: Verificar que el curso existe
    console.log('Test 2: Verificar que el curso existe');
    const cursoCreado = await getCurso(resultadoCurso.curso.id);
    assert.notStrictEqual(cursoCreado, null, 'El curso debería existir');
    assert.strictEqual(cursoCreado.name, nombreCursoTest, 'El nombre del curso debería coincidir');
    
    // Test 3: Crear una materia en el curso
    console.log('Test 3: Crear una materia en el curso');
    const nombreMateriaTest = `Materia Test ${Date.now()}`;
    const resultadoMateria = await addMateria(cursoCreado.id, nombreMateriaTest, { description: 'Materia de prueba' });
    assert.strictEqual(resultadoMateria.success, true, 'La materia debería crearse correctamente');
    assert.strictEqual(resultadoMateria.materia.name, nombreMateriaTest, 'El nombre de la materia debería coincidir');
    assert.strictEqual(resultadoMateria.materia.archived, false, 'La materia debería crearse como no archivada');
    assert.strictEqual(resultadoMateria.materia.archivedAt, null, 'La materia debería tener archivedAt como null');
    
    // Test 4: Verificar que la materia existe en el curso
    console.log('Test 4: Verificar que la materia existe en el curso');
    const materiasCurso = await getMateriasByCurso(cursoCreado.id);
    assert.strictEqual(materiasCurso.length > 0, true, 'Debería haber al menos una materia en el curso');
    const materiaCreada = materiasCurso.find(m => m.id === resultadoMateria.materia.id);
    assert.notStrictEqual(materiaCreada, undefined, 'La materia debería existir en el curso');
    
    // Test 5: Actualizar el curso
    console.log('Test 5: Actualizar el curso');
    const nuevoNombreCurso = `${nombreCursoTest} (Actualizado)`;
    const resultadoActualizarCurso = await updateCurso(cursoCreado.id, { name: nuevoNombreCurso });
    assert.strictEqual(resultadoActualizarCurso.success, true, 'El curso debería actualizarse correctamente');
    assert.strictEqual(resultadoActualizarCurso.curso.name, nuevoNombreCurso, 'El nombre del curso debería actualizarse');
    
    // Test 6: Actualizar la materia
    console.log('Test 6: Actualizar la materia');
    const nuevoNombreMateria = `${nombreMateriaTest} (Actualizada)`;
    const resultadoActualizarMateria = await updateMateria(materiaCreada.id, { name: nuevoNombreMateria });
    assert.strictEqual(resultadoActualizarMateria.success, true, 'La materia debería actualizarse correctamente');
    assert.strictEqual(resultadoActualizarMateria.materia.name, nuevoNombreMateria, 'El nombre de la materia debería actualizarse');
    
    // Test 7: Archivar la materia
    console.log('Test 7: Archivar la materia');
    const resultadoArchivarMateria = await archiveMateria(materiaCreada.id);
    assert.strictEqual(resultadoArchivarMateria.success, true, 'La materia debería archivarse correctamente');
    assert.strictEqual(resultadoArchivarMateria.materia.archived, true, 'La materia debería estar archivada');
    assert.notStrictEqual(resultadoArchivarMateria.materia.archivedAt, null, 'La materia debería tener una fecha de archivo');
    
    // Test 8: Verificar que la materia archivada no aparece en la lista normal
    console.log('Test 8: Verificar que la materia archivada no aparece en la lista normal');
    const materiasNormales = await getMateriasByCurso(cursoCreado.id);
    const materiaArchivada = materiasNormales.find(m => m.id === materiaCreada.id);
    assert.strictEqual(materiaArchivada, undefined, 'La materia archivada no debería aparecer en la lista normal');
    
    // Test 9: Verificar que la materia archivada aparece cuando se incluyen archivadas
    console.log('Test 9: Verificar que la materia archivada aparece cuando se incluyen archivadas');
    const materiasConArchivadas = await getMateriasByCurso(cursoCreado.id, { includeArchived: true });
    const materiaArchivadaIncluida = materiasConArchivadas.find(m => m.id === materiaCreada.id);
    assert.notStrictEqual(materiaArchivadaIncluida, undefined, 'La materia archivada debería aparecer cuando se incluyen archivadas');
    assert.strictEqual(materiaArchivadaIncluida.archived, true, 'La materia debería estar marcada como archivada');
    
    // Test 10: Intentar archivar una materia ya archivada
    console.log('Test 10: Intentar archivar una materia ya archivada');
    const resultadoArchivarDuplicado = await archiveMateria(materiaCreada.id);
    assert.strictEqual(resultadoArchivarDuplicado.success, true, 'La operación debería ser idempotente');
    assert.strictEqual(resultadoArchivarDuplicado.materia.archived, true, 'La materia debería seguir archivada');
    
    // Test 11: Desarchivar la materia
    console.log('Test 11: Desarchivar la materia');
    const resultadoDesarchivarMateria = await unarchiveMateria(materiaCreada.id);
    assert.strictEqual(resultadoDesarchivarMateria.success, true, 'La materia debería desarchivarse correctamente');
    assert.strictEqual(resultadoDesarchivarMateria.materia.archived, false, 'La materia debería estar desarchivada');
    assert.strictEqual(resultadoDesarchivarMateria.materia.archivedAt, null, 'La materia debería tener archivedAt como null');
    
    // Test 12: Verificar que la materia desarchivada aparece en la lista normal
    console.log('Test 12: Verificar que la materia desarchivada aparece en la lista normal');
    const materiasActualizadas = await getMateriasByCurso(cursoCreado.id);
    const materiaDesarchivada = materiasActualizadas.find(m => m.id === materiaCreada.id);
    assert.notStrictEqual(materiaDesarchivada, undefined, 'La materia desarchivada debería aparecer en la lista normal');
    assert.strictEqual(materiaDesarchivada.archived, false, 'La materia debería estar marcada como no archivada');
    
    // Test 13: Intentar desarchivar una materia ya desarchivada
    console.log('Test 13: Intentar desarchivar una materia ya desarchivada');
    const resultadoDesarchivarDuplicado = await unarchiveMateria(materiaCreada.id);
    assert.strictEqual(resultadoDesarchivarDuplicado.success, true, 'La operación debería ser idempotente');
    assert.strictEqual(resultadoDesarchivarDuplicado.materia.archived, false, 'La materia debería seguir desarchivada');
    
    // Test 14: Buscar curso por nombre
    console.log('Test 14: Buscar curso por nombre');
    const cursoEncontrado = await findCursoByName(nuevoNombreCurso);
    assert.notStrictEqual(cursoEncontrado, undefined, 'El curso debería encontrarse por nombre');
    assert.strictEqual(cursoEncontrado.id, cursoCreado.id, 'El ID del curso encontrado debería coincidir');
    
    // Test 15: Buscar materia por nombre
    console.log('Test 15: Buscar materia por nombre');
    const materiaEncontrada = await findMateriaByName(nuevoNombreMateria, cursoCreado.id);
    assert.notStrictEqual(materiaEncontrada, undefined, 'La materia debería encontrarse por nombre');
    assert.strictEqual(materiaEncontrada.id, materiaCreada.id, 'El ID de la materia encontrada debería coincidir');
    
    // Test 16: Eliminar la materia
    console.log('Test 16: Eliminar la materia');
    const resultadoEliminarMateria = await deleteMateria(materiaCreada.id);
    assert.strictEqual(resultadoEliminarMateria.success, true, 'La materia debería eliminarse correctamente');
    
    // Test 17: Verificar que la materia ya no existe
    console.log('Test 17: Verificar que la materia ya no existe');
    const materiasFinales = await getMateriasByCurso(cursoCreado.id, { includeArchived: true });
    const materiaEliminada = materiasFinales.find(m => m.id === materiaCreada.id);
    assert.strictEqual(materiaEliminada, undefined, 'La materia no debería existir después de eliminarla');
    
    // Test 18: Eliminar el curso
    console.log('Test 18: Eliminar el curso');
    const resultadoEliminarCurso = await deleteCurso(cursoCreado.id);
    assert.strictEqual(resultadoEliminarCurso.success, true, 'El curso debería eliminarse correctamente');
    
    // Test 19: Verificar que el curso ya no existe
    console.log('Test 19: Verificar que el curso ya no existe');
    const cursoEliminado = await getCurso(cursoCreado.id);
    assert.strictEqual(cursoEliminado, null, 'El curso no debería existir después de eliminarlo');
    
    console.log('Todos los tests han pasado correctamente');
  } catch (error) {
    console.error('Error en los tests:', error);
    process.exit(1);
  }
}

// Ejecutar los tests
runTests();
