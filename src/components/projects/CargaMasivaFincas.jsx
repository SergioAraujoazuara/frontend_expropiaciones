import { useState } from 'react'
import fincaService from '../../services/fincaService'
import Button from '../ui/Button'

function CargaMasivaFincas({ proyectoId, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  
  // Opciones de configuración
  const [tipoFinca, setTipoFinca] = useState('FP')
  const [tipoAfeccion, setTipoAfeccion] = useState('total')
  const [comunidadAutonoma, setComunidadAutonoma] = useState('')
  const [createMode, setCreateMode] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validar que sea un archivo Excel
      const validExtensions = ['.xlsx', '.xls']
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'))
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Por favor, selecciona un archivo Excel (.xlsx o .xls)')
        setFile(null)
        return
      }
      
      setFile(selectedFile)
      setError('')
      setSuccess('')
      setPreview(null)
      setResult(null)
    }
  }

  const handlePreview = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fincaService.uploadExcel(file, proyectoId, {
        tipo_finca: tipoFinca,
        tipo_afeccion: tipoAfeccion,
        comunidad_autonoma: comunidadAutonoma,
        create: false // Solo preview
      })

      setPreview(response.data_preview || [])
      setResult({
        total_records: response.total_records,
        sheet_names: response.sheet_names,
        total_titulares: response.total_titulares || 0,
        columnas_disponibles: response.columnas_disponibles || [],
        columnas_mapeadas: response.columnas_mapeadas || []
      })
      setSuccess(`Archivo procesado correctamente. Se encontraron ${response.total_records} registros y ${response.total_titulares || 0} titulares.`)
    } catch (err) {
      setError(err.message || 'Error al procesar el archivo')
      setPreview(null)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero')
      return
    }

    if (!preview && !createMode) {
      setError('Por favor, primero revisa la vista previa del archivo')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      
      const response = await fincaService.uploadExcel(file, proyectoId, {
        tipo_finca: tipoFinca,
        tipo_afeccion: tipoAfeccion,
        comunidad_autonoma: comunidadAutonoma,
        create: true // Crear fincas
      })

      setResult({
        created_count: response.created_count || 0,
        created: response.created || [],
        errors: response.errors || [],
        total_records: response.total_records
      })

      if (response.created_count > 0) {
        setSuccess(`Se crearon ${response.created_count} finca${response.created_count !== 1 ? 's' : ''} correctamente.`)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError('No se pudieron crear las fincas. Revisa los errores.')
      }
    } catch (err) {
      if (err?.data) {
        const createdCount = err.data.created_count || 0
        const rawErrors = err.data.errors || []
        const totalRecords = err.data.total_records || (createdCount + rawErrors.length)

        const normalizedErrors = rawErrors.map((errorItem) => {
          if (typeof errorItem?.error === 'string') {
            return errorItem.error.replace(/^\[|\]$/g, '')
          }
          if (Array.isArray(errorItem?.error)) {
            return errorItem.error.join(' ').replace(/^\[|\]$/g, '')
          }
          return ''
        })

        const duplicateCount = normalizedErrors.filter((msg) =>
          msg.toLowerCase().includes('ya existe una finca')
        ).length
        const unexpectedCount = normalizedErrors.filter((msg) =>
          msg.toLowerCase().includes('error inesperado')
        ).length

        setResult({
          created_count: createdCount,
          created: err.data.created || [],
          errors: rawErrors.map((item, idx) => ({
            ...item,
            error: normalizedErrors[idx] || item?.error
          })),
          total_records: totalRecords
        })

        let friendlyMessage = err.message || 'No se pudieron crear las fincas.'

        if (rawErrors.length > 0) {
          if (duplicateCount === rawErrors.length) {
            friendlyMessage = 'Todas las fincas del archivo ya existen en el proyecto. No se creó ninguna nueva.'
          } else if (duplicateCount > 0) {
            friendlyMessage = `${duplicateCount} finca${duplicateCount !== 1 ? 's' : ''} ya estaba${duplicateCount !== 1 ? 'n' : ''} registrada${duplicateCount !== 1 ? 's' : ''} y no se cargó${duplicateCount !== 1 ? 'n' : ''} de nuevo.`
            if (createdCount > 0) {
              friendlyMessage += ` Se crearon ${createdCount} nueva${createdCount !== 1 ? 's' : ''}.`
            }
          } else if (unexpectedCount === rawErrors.length) {
            friendlyMessage = 'No se pudieron crear las fincas por un error interno. Revisa los datos del archivo o inténtalo nuevamente.'
          } else {
            const firstMessage = normalizedErrors.find(Boolean)
            if (firstMessage) {
              friendlyMessage = firstMessage
            }
          }
        }

        setError(friendlyMessage)
      } else {
        setError(err.message || 'Error al cargar las fincas')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-200 px-6 py-4 flex items-center justify-between border-b border-gray-300">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Carga masiva de fincas
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:bg-gray-300 rounded-lg p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Selección de archivo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo Excel <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 transition-colors text-center">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p>Haz clic para seleccionar un archivo Excel</p>
                      <p className="text-xs mt-1">Formatos soportados: .xlsx, .xls</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Configuración */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de finca <span className="text-red-500">*</span>
              </label>
              <select
                value={tipoFinca}
                onChange={(e) => setTipoFinca(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="FP">Finca de Proyecto</option>
                <option value="FC">Finca Complementaria</option>
                <option value="AR">Arrendatario</option>
                <option value="DP">Pública</option>
                <option value="PE">Pendiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de afección <span className="text-red-500">*</span>
              </label>
              <select
                value={tipoAfeccion}
                onChange={(e) => setTipoAfeccion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="parcial">Parcial</option>
                <option value="total">Total</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comunidad autónoma
              </label>
              <input
                type="text"
                value={comunidadAutonoma}
                onChange={(e) => setComunidadAutonoma(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* Vista previa */}
          {preview && preview.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Vista previa (primeras 5 filas)</h4>
              <div className="space-y-4">
                {preview.slice(0, 5).map((row, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition hover:border-sky-300"
                  >
                    <div className="px-4 py-3 bg-gray-200 flex items-start justify-between gap-3">
                      <div>
                        {row.numero_finca && (
                          <p className="text-[11px] text-gray-600">
                            Número finca: {row.numero_finca}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-600">
                          {row.referencia_catastral
                            ? `Ref. catastral: ${row.referencia_catastral}`
                            : 'Sin referencia catastral'}
                        </p>
                      </div>
                      {row.superficie && (
                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-700">
                          Superficie: {row.superficie}
                        </span>
                      )}
                    </div>

                    <div className="px-4 py-4 space-y-4 text-xs text-gray-600 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {row.municipio && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Municipio:</span>
                            <span>{row.municipio}</span>
                          </div>
                        )}
                        {row.provincia && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Provincia:</span>
                            <span>{row.provincia}</span>
                          </div>
                        )}
                        {row.parcela && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Parcela:</span>
                            <span>{row.parcela}</span>
                          </div>
                        )}
                        {row.valor_catastral && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Valor catastral:</span>
                            <span>{row.valor_catastral}</span>
                          </div>
                        )}
                      </div>

                      {row.titulares && row.titulares.length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-3">
                            Titulares catastrales ({row.titulares.length})
                          </p>
                          <div className="space-y-2">
                            {row.titulares.map((titular, tIdx) => (
                              <div
                                key={tIdx}
                                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                              >
                                <div className="text-xs text-gray-800 flex flex-wrap items-center gap-2">
                                  <span className="font-medium">
                                    {titular.nombre || 'Sin nombre'}
                                  </span>
                                  {titular.nif && (
                                    <span className="text-gray-500">NIF: {titular.nif}</span>
                                  )}
                                </div>
                                <div className="mt-1 text-[11px] text-gray-600 space-y-1">
                                  {titular.domicilio && (
                                    <p>
                                      <span className="font-medium text-gray-700">Domicilio:</span>{' '}
                                      {titular.domicilio}
                                    </p>
                                  )}
                                  {titular.localidad && (
                                    <p>
                                      <span className="font-medium text-gray-700">Localidad:</span>{' '}
                                      {titular.localidad}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados */}
          {result && result.created_count !== undefined && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Resultados de la carga</h4>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">✓ {result.created_count}</span> finca{result.created_count !== 1 ? 's' : ''} creada{result.created_count !== 1 ? 's' : ''} correctamente
                  </p>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800 font-semibold mb-2">
                      ✗ {result.errors.length} error{result.errors.length !== 1 ? 'es' : ''} encontrado{result.errors.length !== 1 ? 's' : ''}:
                    </p>
                    <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                      {result.errors.slice(0, 10).map((error, idx) => (
                        <li key={idx}>
                          Fila {error.row_index}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 text-gray-600 border border-gray-300"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePreview}
            variant="outline"
            className="flex-1"
            disabled={loading || !file}
          >
            {loading ? 'Procesando...' : 'Vista previa'}
          </Button>
          <Button
            onClick={handleUpload}
            variant="outline"
            className="flex-1"
            disabled={loading || !file || (!preview && !createMode)}
          >
            {loading ? 'Cargando...' : 'Cargar fincas'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CargaMasivaFincas

