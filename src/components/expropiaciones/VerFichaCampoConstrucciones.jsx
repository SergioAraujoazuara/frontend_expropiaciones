import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import fichaCampoService from '../../services/fichaCampoService'
import PageHeader from '../layout/PageHeader'

const VerFichaCampoConstrucciones = () => {
  const navigate = useNavigate()
  const { fincaId, fichaId } = useParams()
  
  const [ficha, setFicha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('basica')

  useEffect(() => {
    if (fichaId) {
      loadFicha()
    }
  }, [fichaId])

  const loadFicha = async () => {
    try {
      setLoading(true)
      setError('')
      const fichaData = await fichaCampoService.getFichaCampoConstrucciones(fichaId)
      setFicha(fichaData.data || fichaData)
    } catch (err) {
      console.error('Error cargando ficha:', err)
      setError(err.message || 'Error al cargar la ficha de campo')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    { 
      id: 'basica', 
      label: 'Información básica', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'construcciones', 
      label: 'Construcciones', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: 'referencias', 
      label: 'Referencias', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    { 
      id: 'multimedia', 
      label: 'Multimedia', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
  ]

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toISOString().split('T')[0]
    } catch {
      return dateString
    }
  }

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return ''
    return typeof value === 'number' ? value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value
  }

  const getImageUrl = (imageData, mimeType) => {
    if (!imageData) return null
    
    // Si es un string (base64 que viene del backend)
    if (typeof imageData === 'string') {
      // Si ya tiene el prefijo data:, devolverlo directamente
      if (imageData.startsWith('data:')) {
        return imageData
      }
      // Si es base64 puro, agregar el prefijo data URL
      return `data:${mimeType || 'image/jpeg'};base64,${imageData}`
    }
    
    // Si es un array de bytes (Uint8Array), convertir a base64
    if (Array.isArray(imageData) || (imageData.data && Array.isArray(imageData.data))) {
      try {
        const bytes = Array.isArray(imageData) ? imageData : imageData.data
        const binary = String.fromCharCode.apply(null, bytes)
        const base64 = btoa(binary)
        return `data:${mimeType || 'image/jpeg'};base64,${base64}`
      } catch (e) {
        console.error('Error convirtiendo bytes a base64:', e)
        return null
      }
    }
    
    // Si es un blob, crear URL
    if (imageData instanceof Blob) {
      return URL.createObjectURL(imageData)
    }
    
    // Si es bytes (Buffer), convertir a base64
    if (imageData instanceof Uint8Array) {
      try {
        const binary = String.fromCharCode.apply(null, Array.from(imageData))
        const base64 = btoa(binary)
        return `data:${mimeType || 'image/jpeg'};base64,${base64}`
      } catch (e) {
        console.error('Error convirtiendo Uint8Array a base64:', e)
        return null
      }
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error || !ficha) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No se pudo cargar la ficha'}</p>
          <button
            onClick={() => navigate(`/ver-expropiaciones/${fincaId}`)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      <PageHeader
        title="Ficha de Campo - Construcciones"
        subtitle={ficha ? `Finca ${ficha.numero_finca || 'N/A'}${ficha.municipio ? ` - ${ficha.municipio}${ficha.provincia ? ` (${ficha.provincia})` : ''}` : ''}` : 'Ver ficha de campo'}
        onBack={() => navigate(`/ver-expropiaciones/${fincaId}`)}
        showBackButton={true}
      />
      
      <div className="flex-1 flex flex-col min-h-0 pt-6 pb-6 pl-10 pr-16">
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Tabs de secciones */}
          <div className="bg-gray-100 border-b border-gray-200 px-6 py-2 overflow-x-auto flex-shrink-0">
            <div className="flex space-x-1 min-w-max">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeSection === section.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className={activeSection === section.id ? 'text-white' : 'text-gray-500'}>
                    {section.icon}
                  </span>
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Sección: Información básica */}
            {activeSection === 'basica' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Información básica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proyecto
                    </label>
                    <input
                      type="text"
                      value={ficha.titulo_proyecto || ficha.proyecto_data?.nombre || 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finca
                    </label>
                    <input
                      type="text"
                      value={`Finca ${ficha.numero_finca || 'N/A'}`}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de elaboración
                    </label>
                    <input
                      type="date"
                      value={formatDate(ficha.fecha_elaboracion)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de ficha
                    </label>
                    <input
                      type="text"
                      value="Construcciones"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  {ficha.encabezado && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Encabezado
                      </label>
                      <input
                        type="text"
                        value={ficha.encabezado_data?.nombre || ficha.encabezado || 'N/A'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Naturaleza
                    </label>
                    <input
                      type="text"
                      value={ficha.naturaleza || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Construcciones */}
            {activeSection === 'construcciones' && (
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Construcciones (1-5)</h4>
                {[1, 2, 3, 4, 5].map((num) => {
                  const tipo = ficha[`tipo_construccion_${num}`]
                  const estado = ficha[`estado_conservacion_construccion_${num}`]
                  const superficie = ficha[`superficie_total_construccion_${num}`]
                  const descripcion = ficha[`descripcion_construccion_${num}`]
                  
                  // Solo mostrar si tiene al menos un campo con datos
                  if (!tipo && !estado && !superficie && !descripcion) {
                    return null
                  }
                  
                  return (
                    <div key={num} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h5 className="text-sm font-semibold text-gray-800 mb-4">Construcción {num}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de construcción
                          </label>
                          <input
                            type="text"
                            value={tipo || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado de conservación
                          </label>
                          <input
                            type="text"
                            value={estado || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Superficie total (m²)
                          </label>
                          <input
                            type="text"
                            value={superficie ? `${formatNumber(superficie)} m²` : ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={descripcion || ''}
                            disabled
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                {![1, 2, 3, 4, 5].some(num => {
                  const tipo = ficha[`tipo_construccion_${num}`]
                  const estado = ficha[`estado_conservacion_construccion_${num}`]
                  const superficie = ficha[`superficie_total_construccion_${num}`]
                  const descripcion = ficha[`descripcion_construccion_${num}`]
                  return tipo || estado || superficie || descripcion
                }) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay construcciones registradas</p>
                  </div>
                )}
                {ficha.superficie_total_construcciones && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-gray-700">Superficie Total de Construcciones</label>
                      <p className="text-lg font-bold text-gray-900">{formatNumber(ficha.superficie_total_construcciones)} m²</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sección: Referencias */}
            {activeSection === 'referencias' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Referencias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plano Nº</label>
                    <input
                      type="text"
                      value={ficha.plano_numero || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anejo</label>
                    <input
                      type="text"
                      value={ficha.anejo || ''}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Multimedia */}
            {activeSection === 'multimedia' && (
              <div className="space-y-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Multimedia</h4>
                
                {/* Fotos */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Fotos</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((num) => {
                      const foto = ficha[`foto_${num}`]
                      const mimeType = ficha[`foto_${num}_tipo_mime`] || 'image/jpeg'
                      const imageUrl = getImageUrl(foto, mimeType)
                      
                      return (
                        <div key={num} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Foto {num}
                          </label>
                          {imageUrl ? (
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt={`Foto ${num}`}
                                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                              <p className="text-xs text-gray-400">No disponible</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Croquis */}
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Croquis</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((num) => {
                      const croquis = ficha[`croquis_${num}`]
                      const mimeType = ficha[`croquis_${num}_tipo_mime`] || 'image/jpeg'
                      const imageUrl = getImageUrl(croquis, mimeType)
                      
                      return (
                        <div key={num} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Croquis {num}
                          </label>
                          {imageUrl ? (
                            <div className="relative">
                              <img
                                src={imageUrl}
                                alt={`Croquis ${num}`}
                                className="w-full h-48 object-cover rounded-lg border border-gray-300"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                              <p className="text-xs text-gray-400">No disponible</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {!ficha.foto_1 && !ficha.foto_2 && !ficha.foto_3 && !ficha.croquis_1 && !ficha.croquis_2 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No hay imágenes disponibles</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerFichaCampoConstrucciones
