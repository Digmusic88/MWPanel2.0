import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Download, Loader2, Eye, Settings } from 'lucide-react';
import { User } from '../../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (users: Omit<User, 'id' | 'createdAt'>[]) => Promise<void>;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  userField: keyof Omit<User, 'id' | 'createdAt'>;
}

const USER_FIELDS = [
  { key: 'name', label: 'Nombre', required: true },
  { key: 'email', label: 'Email', required: true },
  { key: 'role', label: 'Rol', required: true },
  { key: 'phone', label: 'Teléfono', required: false },
  { key: 'avatar', label: 'Avatar URL', required: false },
  { key: 'isActive', label: 'Estado Activo', required: false },
  { key: 'grade', label: 'Grupo Base', required: false },
] as const;

const ROLE_VALUES = ['admin', 'teacher', 'student', 'parent'];

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'importing'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  const resetModal = () => {
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMappings([]);
    setValidationErrors([]);
    setCurrentPage(1);
    setIsImporting(false);
    setImportProgress(0);
    setDragActive(false);
  };

  const handleClose = () => {
    if (!isImporting) {
      resetModal();
      onClose();
    }
  };

  const parseCSV = (text: string): { headers: string[], data: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) throw new Error('El archivo CSV está vacío');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, data };
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setValidationErrors(['Solo se permiten archivos CSV']);
      return;
    }

    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);
      
      setCsvHeaders(headers);
      setCsvData(data);
      setValidationErrors([]);
      
      // Auto-mapear columnas comunes
      const autoMappings: ColumnMapping[] = [];
      USER_FIELDS.forEach(field => {
        const matchingHeader = headers.find(h => 
          h.toLowerCase().includes(field.key.toLowerCase()) ||
          h.toLowerCase().includes(field.label.toLowerCase())
        );
        if (matchingHeader) {
          autoMappings.push({
            csvColumn: matchingHeader,
            userField: field.key as keyof Omit<User, 'id' | 'createdAt'>
          });
        }
      });
      
      setColumnMappings(autoMappings);
      setStep('mapping');
    } catch (error) {
      setValidationErrors(['Error al procesar el archivo CSV: ' + (error as Error).message]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const validateMappings = (): string[] => {
    const errors: string[] = [];
    const requiredFields = USER_FIELDS.filter(f => f.required);
    
    requiredFields.forEach(field => {
      const mapping = columnMappings.find(m => m.userField === field.key);
      if (!mapping) {
        errors.push(`El campo "${field.label}" es obligatorio y debe ser mapeado`);
      }
    });

    return errors;
  };

  const validateData = (): string[] => {
    const errors: string[] = [];
    const emailMapping = columnMappings.find(m => m.userField === 'email');
    const roleMapping = columnMappings.find(m => m.userField === 'role');

    csvData.forEach((row, index) => {
      // Validar email
      if (emailMapping) {
        const email = row[emailMapping.csvColumn];
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(`Fila ${index + 2}: Email inválido "${email}"`);
        }
      }

      // Validar rol
      if (roleMapping) {
        const role = row[roleMapping.csvColumn]?.toLowerCase();
        if (role && !ROLE_VALUES.includes(role)) {
          errors.push(`Fila ${index + 2}: Rol inválido "${role}". Valores permitidos: ${ROLE_VALUES.join(', ')}`);
        }
      }
    });

    return errors;
  };

  const handlePreview = () => {
    const mappingErrors = validateMappings();
    const dataErrors = validateData();
    const allErrors = [...mappingErrors, ...dataErrors];

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    setValidationErrors([]);
    setStep('preview');
  };

  const convertToUsers = (): Omit<User, 'id' | 'createdAt'>[] => {
    return csvData.map(row => {
      const user: any = {
        isActive: true, // Valor por defecto
      };

      columnMappings.forEach(mapping => {
        const value = row[mapping.csvColumn];
        
        switch (mapping.userField) {
          case 'isActive':
            user[mapping.userField] = value?.toLowerCase() === 'true' || value?.toLowerCase() === 'activo';
            break;
          case 'role':
            const roleMap: Record<string, User['role']> = {
              'admin': 'admin',
              'administrador': 'admin',
              'teacher': 'teacher',
              'profesor': 'teacher',
              'student': 'student',
              'estudiante': 'student',
              'parent': 'parent',
              'padre': 'parent',
              'guardian': 'parent'
            };
            user[mapping.userField] = roleMap[value?.toLowerCase()] || 'student';
            break;
          default:
            user[mapping.userField] = value || undefined;
        }
      });

      return user;
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    setStep('importing');
    setImportProgress(0);

    try {
      const users = convertToUsers();
      
      // Simular progreso
      for (let i = 0; i <= 100; i += 10) {
        setImportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await onImport(users);
      handleClose();
    } catch (error) {
      setValidationErrors(['Error durante la importación: ' + (error as Error).message]);
      setStep('preview');
    } finally {
      setIsImporting(false);
    }
  };

  const updateColumnMapping = (csvColumn: string, userField: keyof Omit<User, 'id' | 'createdAt'> | '') => {
    setColumnMappings(prev => {
      const filtered = prev.filter(m => m.csvColumn !== csvColumn);
      if (userField) {
        return [...filtered, { csvColumn, userField }];
      }
      return filtered;
    });
  };

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'role', 'phone', 'isActive', 'grade'];
    const sampleData = [
      'Juan Pérez,juan.perez@ejemplo.com,student,+1234567890,true,10° Grado',
      'María García,maria.garcia@ejemplo.com,teacher,+1234567891,true,',
      'Ana López,ana.lopez@ejemplo.com,parent,+1234567892,true,'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_usuarios.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  const paginatedData = csvData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(csvData.length / itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">Importar Usuarios desde CSV</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Sube un archivo CSV con los datos de los usuarios que deseas importar
                </p>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar plantilla CSV</span>
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-300 hover:border-emerald-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Arrastra tu archivo CSV aquí
                </p>
                <p className="text-gray-600 mb-4">o</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Seleccionar archivo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-800">Errores encontrados:</span>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Mapear Columnas</h3>
                <span className="text-sm text-gray-600">{csvData.length} filas detectadas</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Mapea las columnas de tu CSV con los campos del sistema
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {csvHeaders.map(header => (
                  <div key={header} className="border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Columna CSV: <span className="font-semibold">{header}</span>
                    </label>
                    <select
                      value={columnMappings.find(m => m.csvColumn === header)?.userField || ''}
                      onChange={(e) => updateColumnMapping(header, e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">No mapear</option>
                      {USER_FIELDS.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label} {field.required && '*'}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-800">Errores de mapeo:</span>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Vista Previa de Datos</h3>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {csvData.length} usuarios listos para importar
                  </span>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-red-800">Errores de validación:</span>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1 max-h-32 overflow-y-auto">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {columnMappings.map(mapping => (
                          <th key={mapping.userField} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {USER_FIELDS.find(f => f.key === mapping.userField)?.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {columnMappings.map(mapping => (
                            <td key={mapping.userField} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {row[mapping.csvColumn] || '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, csvData.length)} de {csvData.length} registros
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Importando usuarios...</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">{importProgress}% completado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-between">
          <div className="flex space-x-3">
            {step === 'mapping' && (
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Volver
              </button>
            )}
            {step === 'preview' && (
              <button
                onClick={() => setStep('mapping')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Volver
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {step !== 'importing' && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
            
            {step === 'mapping' && (
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Vista Previa
              </button>
            )}
            
            {step === 'preview' && validationErrors.length === 0 && (
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors"
              >
                Importar {csvData.length} Usuarios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
