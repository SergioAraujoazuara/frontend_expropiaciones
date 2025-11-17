import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import fichaCampoService from '../../services/fichaCampoService'
import Button from '../ui/Button'
import PageHeader from '../layout/PageHeader'

const VerFichaCampoParcela = () => {
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
      const fichaData = await fichaCampoService.getFichaCampoParcela(fichaId)
      setFicha(fichaData.data || fichaData)
    } catch (err) {
      console.error('Error cargando ficha:', err)
      setError(err.message || 'Error al cargar la ficha de campo')
    } finally {
      setLoading(false)
    }
  }

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
    return typeof value === 'number' ? value.toString() : value
  }

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return ''
    if (typeof value === 'boolean') return value ? 'Sí' : 'No'
    return value
  }

  const getImageUrl = (imageData, mimeType) => {
    if (!imageData) return null
    
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        return imageData
      }
      return `data:${mimeType || 'image/jpeg'};base64,${imageData}`
    }
    
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
    
    if (imageData instanceof Blob) {
      return URL.createObjectURL(imageData)
    }
    
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
      id: 'registro', 
      label: 'Datos del registro', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'catastral', 
      label: 'Datos catastrales', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: 'caracteristicas', 
      label: 'Características', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      id: 'afeccion', 
      label: 'Afección', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'subparcelas', 
      label: 'Subparcelas', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    },
    { 
      id: 'afecciones_detalladas', 
      label: 'Afecciones detalladas', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ficha de campo...</p>
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
      {/* Header */}
      <PageHeader
        title="Ficha de Campo - Parcela"
        subtitle={`Finca ${ficha.numero_finca || 'N/A'} - ${ficha.municipio || ''} (${ficha.provincia || ''})`}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
                    <input
                      type="text"
                      value={ficha.titulo_proyecto || ficha.proyecto_data?.nombre || 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Finca</label>
                    <input
                      type="text"
                      value={ficha.numero_finca ? `Finca ${ficha.numero_finca}` : 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de elaboración</label>
                    <input
                      type="date"
                      value={formatDate(ficha.fecha_elaboracion)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ficha</label>
                    <input
                      type="text"
                      value={ficha.tipo_ficha ? 'Parcela Afectada' : 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  {ficha.encabezado && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Encabezado</label>
                      <input
                        type="text"
                        value={ficha.encabezado_data?.nombre || ficha.encabezado || 'N/A'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Datos del registro */}
            {activeSection === 'registro' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Datos del registro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Finca registral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.finca_registral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tomo registral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.tomo_registral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Libro registral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.libro_registral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Folio registral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.folio_registral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inscripción registral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.inscripcion_registral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sección registral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.seccion_registral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carga registral</label>
                    <textarea
                      value={formatValue(ficha.carga_registral)}
                      disabled
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Datos catastrales */}
            {activeSection === 'catastral' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Datos catastrales</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Polígono</label>
                    <input
                      type="text"
                      value={formatValue(ficha.poligono)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parcela</label>
                    <input
                      type="text"
                      value={formatValue(ficha.parcela)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subparcela</label>
                    <input
                      type="text"
                      value={formatValue(ficha.subparcela)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referencia catastral</label>
                    <input
                      type="text"
                      value={formatValue(ficha.referencia_catastral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valor catastral (€)</label>
                    <input
                      type="number"
                      value={formatNumber(ficha.valor_catastral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Superficie catastral (m²)</label>
                    <input
                      type="number"
                      value={formatNumber(ficha.superficie_catastral)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paraje</label>
                    <input
                      type="text"
                      value={formatValue(ficha.paraje)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calificación fiscal</label>
                    <input
                      type="text"
                      value={formatValue(ficha.calificacion_fiscal)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Calificación urbanística</label>
                    <input
                      type="text"
                      value={formatValue(ficha.calificacion_urbanistica)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Características de la finca */}
            {activeSection === 'caracteristicas' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Características de la finca</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Norte Parcial</label>
                    <textarea
                      value={formatValue(ficha.lindero_norte_parcial)}
                      disabled
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Sur Parcial</label>
                    <textarea
                      value={formatValue(ficha.lindero_sur_parcial)}
                      disabled
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Este Parcial</label>
                    <textarea
                      value={formatValue(ficha.lindero_este_parcial)}
                      disabled
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Oeste Parcial</label>
                    <textarea
                      value={formatValue(ficha.lindero_oeste_parcial)}
                      disabled
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Naturaleza</label>
                    <input
                      type="text"
                      value={formatValue(ficha.naturaleza)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aprovechamiento actual</label>
                    <input
                      type="text"
                      value={formatValue(ficha.aprovechamiento_actual)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Forma y configuración</label>
                    <input
                      type="text"
                      value={formatValue(ficha.forma_configuracion)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Afección */}
            {activeSection === 'afeccion' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Afección</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de afección</label>
                    <input
                      type="text"
                      value={ficha.tipo_afeccion ? ficha.tipo_afeccion.charAt(0).toUpperCase() + ficha.tipo_afeccion.slice(1) : 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      checked={ficha.divide_finca || false}
                      disabled
                      className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-2 focus:ring-sky-500 cursor-not-allowed"
                    />
                    <label className="ml-2 text-sm text-gray-700">Divide finca</label>
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Subparcelas */}
            {activeSection === 'subparcelas' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Matriz de subparcelas (A-H)</h4>
                <div className="space-y-6">
                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letra) => {
                    const subparcela = ficha[`subparcela_${letra}`]
                    const aprovechamiento = ficha[`aprovechamiento_${letra}`]
                    const unidad = ficha[`unidad_${letra}`]
                    const supf_expro = ficha[`supf_expro_${letra}`]
                    const supf_serv_aer = ficha[`supf_serv_aer_${letra}`]
                    const supf_serv_subt = ficha[`supf_serv_subt_${letra}`]
                    const supf_ocup_temp = ficha[`supf_ocup_temp_${letra}`]
                    
                    if (!subparcela && !aprovechamiento && !unidad && !supf_expro && !supf_serv_aer && !supf_serv_subt && !supf_ocup_temp) {
                      return null
                    }
                    
                    return (
                      <div key={letra} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Subparcela {letra.toUpperCase()}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Subparcela</label>
                            <input
                              type="text"
                              value={formatValue(subparcela)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Aprovechamiento</label>
                            <input
                              type="text"
                              value={formatValue(aprovechamiento)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Unidad (m²)</label>
                            <input
                              type="number"
                              value={formatNumber(unidad)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Expro (m²)</label>
                            <input
                              type="number"
                              value={formatNumber(supf_expro)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Serv.Aer (m²)</label>
                            <input
                              type="number"
                              value={formatNumber(supf_serv_aer)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Serv.Subt (m²)</label>
                            <input
                              type="number"
                              value={formatNumber(supf_serv_subt)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Ocup.Temp (m²)</label>
                            <input
                              type="number"
                              value={formatNumber(supf_ocup_temp)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {!['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].some(letra => ficha[`subparcela_${letra}`]) && (
                    <p className="text-center py-8 text-gray-500 text-sm">No hay subparcelas registradas</p>
                  )}
                </div>
              </div>
            )}

            {/* Sección: Afecciones detalladas */}
            {activeSection === 'afecciones_detalladas' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Afecciones detalladas (1-10)</h4>
                <div className="space-y-4">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                    const tipo = ficha[`tipo_afeccion_${num}`]
                    const estado = ficha[`estado_conservacion_${num}`]
                    const descripcion = ficha[`descripcion_${num}`]
                    const cantidad = ficha[`cantidad_${num}`]
                    
                    if (!tipo && !estado && !descripcion && !cantidad) {
                      return null
                    }
                    
                    return (
                      <div key={num} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Afección {num}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de afección</label>
                            <input
                              type="text"
                              value={formatValue(tipo)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Estado de conservación</label>
                            <input
                              type="text"
                              value={formatValue(estado)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                            <textarea
                              value={formatValue(descripcion)}
                              disabled
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                            <input
                              type="number"
                              value={formatNumber(cantidad)}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-500 bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {!Array.from({ length: 10 }, (_, i) => i + 1).some(num => 
                    ficha[`tipo_afeccion_${num}`] || ficha[`estado_conservacion_${num}`] || ficha[`descripcion_${num}`] || ficha[`cantidad_${num}`]
                  ) && (
                    <p className="text-center py-8 text-gray-500 text-sm">No hay afecciones detalladas registradas</p>
                  )}
                </div>
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
                      value={formatValue(ficha.plano_numero)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anejo</label>
                    <input
                      type="text"
                      value={formatValue(ficha.anejo)}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sección: Multimedia */}
            {activeSection === 'multimedia' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Multimedia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['foto_1', 'foto_2', 'foto_3', 'croquis'].map((tipo) => {
                    const imagen = ficha[tipo]
                    const mimeType = ficha[`${tipo}_tipo_mime`]
                    const tamaño = ficha[`${tipo}_tamaño`]
                    const imageUrl = getImageUrl(imagen, mimeType)
                    
                    return (
                      <div key={tipo} className="border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                          {tipo.replace('_', ' ')}
                        </label>
                        {imageUrl ? (
                          <div>
                            <img 
                              src={imageUrl} 
                              alt={tipo}
                              className="w-full h-48 object-cover rounded-lg mb-2"
                            />
                            {tamaño && (
                              <p className="text-xs text-gray-500">
                                Tamaño: {(tamaño / 1024).toFixed(2)} KB
                              </p>
                            )}
                            {mimeType && (
                              <p className="text-xs text-gray-500">
                                Tipo: {mimeType}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-300 border-dashed">
                            <p className="text-sm text-gray-400">No hay imagen disponible</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer con botón volver */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 justify-end">
            <Button
              type="button"
              onClick={() => navigate(`/ver-expropiaciones/${fincaId}`)}
              variant="outline"
              className="text-sm px-4 py-2"
            >
              Volver
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerFichaCampoParcela
