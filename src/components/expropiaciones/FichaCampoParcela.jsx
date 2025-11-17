import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useProject } from '../../contexts/ProjectContext'
import fincaService from '../../services/fincaService'
import fichaCampoService from '../../services/fichaCampoService'
import Button from '../ui/Button'
import PageHeader from '../layout/PageHeader'

const FichaCampoParcela = () => {
  const navigate = useNavigate()
  const { fincaId } = useParams()
  const location = useLocation()
  const { selectedProject } = useProject()
  
  // Detectar si viene del flujo de "Ver Expropiaciones"
  const searchParams = new URLSearchParams(location.search)
  const fromVerExpropiaciones = searchParams.get('from') === 'ver-expropiaciones'
  
  const [finca, setFinca] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('basica')
  
  // Estado del formulario - organizado por secciones según el modelo del backend
  const [formData, setFormData] = useState({
    // Información básica
    proyecto: selectedProject?.id || '',
    finca: fincaId || '',
    fecha_elaboracion: new Date().toISOString().split('T')[0],
    tipo_ficha: 'parcela_afectada',
    encabezado: '',
    
    // Datos del registro
    finca_registral: '',
    tomo_registral: '',
    libro_registral: '',
    folio_registral: '',
    inscripcion_registral: '',
    seccion_registral: '',
    carga_registral: '',
    
    // Datos catastrales
    poligono: '',
    parcela: '',
    subparcela: '',
    referencia_catastral: '',
    valor_catastral: '',
    superficie_catastral: '',
    paraje: '',
    calificacion_fiscal: '',
    calificacion_urbanistica: '',
    
    // Características de la finca
    lindero_norte_parcial: '',
    lindero_sur_parcial: '',
    lindero_este_parcial: '',
    lindero_oeste_parcial: '',
    naturaleza: '',
    aprovechamiento_actual: '',
    forma_configuracion: '',
    
    // Afección
    tipo_afeccion: 'parcial',
    divide_finca: false,
    
    // Referencias
    plano_numero: '',
    anejo: '',
  })

  // Matriz de subparcelas (A-H)
  const [subparcelas, setSubparcelas] = useState({
    a: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    b: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    c: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    d: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    e: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    f: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    g: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
    h: { subparcela: '', aprovechamiento: '', unidad: '', supf_expro: '', supf_serv_aer: '', supf_serv_subt: '', supf_ocup_temp: '' },
  })

  // Afecciones detalladas (1-10)
  const [afeccionesDetalladas, setAfeccionesDetalladas] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      tipo_afeccion: '',
      estado_conservacion: '',
      descripcion: '',
      cantidad: ''
    }))
  )

  // Estado para imágenes (multimedia)
  const [imagenes, setImagenes] = useState({
    foto_1: null,
    foto_2: null,
    foto_3: null,
    croquis: null
  })

  const [previews, setPreviews] = useState({
    foto_1: null,
    foto_2: null,
    foto_3: null,
    croquis: null
  })

  useEffect(() => {
    if (fincaId) {
      loadFinca()
    } else {
      setLoading(false)
    }
  }, [fincaId])

  useEffect(() => {
    if (selectedProject && !formData.proyecto) {
      setFormData(prev => ({
        ...prev,
        proyecto: parseInt(selectedProject.id) // Asegurar que es un número
      }))
    }
  }, [selectedProject])

  const loadFinca = async () => {
    try {
      setLoading(true)
      const fincaData = await fincaService.getFinca(fincaId)
      setFinca(fincaData)
      
      // Obtener el proyecto_id de la finca si está disponible
      const proyectoIdFromFinca = fincaData?.proyecto || fincaData?.proyecto_id
      
      setFormData(prev => ({
        ...prev,
        finca: parseInt(fincaId), // Asegurar que es un número
        // Usar el proyecto de la finca si está disponible, sino usar el del contexto
        proyecto: proyectoIdFromFinca 
          ? parseInt(proyectoIdFromFinca) 
          : (selectedProject?.id ? parseInt(selectedProject.id) : prev.proyecto)
      }))
    } catch (err) {
      console.error('Error cargando finca:', err)
      setError('Error al cargar la información de la finca')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubparcelaChange = (letra, field, value) => {
    setSubparcelas(prev => ({
      ...prev,
      [letra]: {
        ...prev[letra],
        [field]: value
      }
    }))
  }

  const handleAfeccionDetalladaChange = (index, field, value) => {
    setAfeccionesDetalladas(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value
      }
      return updated
    })
  }

  const handleImageChange = (tipo, file) => {
    if (file) {
      setImagenes(prev => ({
        ...prev,
        [tipo]: file
      }))
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({
          ...prev,
          [tipo]: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (tipo) => {
    setImagenes(prev => ({
      ...prev,
      [tipo]: null
    }))
    setPreviews(prev => ({
      ...prev,
      [tipo]: null
    }))
  }

  const uploadImages = async (fichaId) => {
    if (!fichaId) {
      console.error('No se puede subir imágenes: fichaId no está definido')
      return
    }

    const uploadPromises = []
    const errores = []
    
    for (const [tipo, archivo] of Object.entries(imagenes)) {
      if (archivo) {
        console.log(`Subiendo ${tipo} para ficha ${fichaId}...`)
        uploadPromises.push(
          fichaCampoService.subirImagenFichaCampoParcela(fichaId, tipo, archivo)
            .then(() => {
              console.log(`✓ ${tipo} subida exitosamente`)
            })
            .catch(err => {
              const errorMsg = err?.response?.data?.details || err?.message || `Error subiendo ${tipo}`
              console.error(`✗ Error subiendo ${tipo}:`, errorMsg, err)
              errores.push({ tipo, error: errorMsg })
            })
        )
      }
    }
    
    if (uploadPromises.length > 0) {
      await Promise.allSettled(uploadPromises)
      
      if (errores.length > 0) {
        const erroresMsg = errores.map(e => `${e.tipo}: ${e.error}`).join(', ')
        setError(`Algunas imágenes no se pudieron subir: ${erroresMsg}`)
      } else {
        console.log('✓ Todas las imágenes se subieron correctamente')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.proyecto || !formData.finca || !formData.fecha_elaboracion) {
      setError('Por favor, completa todos los campos obligatorios')
      setActiveSection('basica')
      return
    }

    // Validar que al menos una subparcela tenga datos
    const tieneSubparcelas = Object.values(subparcelas).some(sp => sp.subparcela)
    if (!tieneSubparcelas) {
      setError('Debe especificar al menos una subparcela')
      setActiveSection('subparcelas')
      return
    }

    try {
      setSaving(true)
      setError('')
      
      // Validar que tenemos los IDs necesarios
      const proyectoId = formData.proyecto || (finca?.proyecto || finca?.proyecto_id) || selectedProject?.id
      const fincaIdNum = parseInt(formData.finca || fincaId)
      
      if (!proyectoId) {
        setError('No se pudo determinar el proyecto. Por favor, vuelve a seleccionar el proyecto.')
        setActiveSection('basica')
        return
      }
      
      if (!fincaIdNum) {
        setError('No se pudo determinar la finca. Por favor, vuelve a seleccionar la finca.')
        setActiveSection('basica')
        return
      }
      
      // Construir el objeto completo con todos los datos para crear la ficha de una vez
      const fichaData = {
        // Relaciones (asegurar que son números enteros)
        proyecto: parseInt(proyectoId),
        finca: fincaIdNum,
        ...(formData.encabezado && { encabezado: parseInt(formData.encabezado) }),
        
        // Datos básicos
        fecha_elaboracion: formData.fecha_elaboracion,
        tipo_ficha: 'parcela_afectada',
        
        // Datos del registro
        finca_registral: formData.finca_registral || '',
        tomo_registral: formData.tomo_registral || '',
        libro_registral: formData.libro_registral || '',
        folio_registral: formData.folio_registral || '',
        inscripcion_registral: formData.inscripcion_registral || '',
        seccion_registral: formData.seccion_registral || '',
        carga_registral: formData.carga_registral || '',
        
        // Datos catastrales (campos obligatorios con valores por defecto si están vacíos)
        poligono: formData.poligono || '',
        parcela: formData.parcela || '',
        subparcela: formData.subparcela || '',
        referencia_catastral: formData.referencia_catastral || '',
        valor_catastral: formData.valor_catastral && formData.valor_catastral !== '' 
          ? parseFloat(formData.valor_catastral) 
          : 0.00,
        superficie_catastral: formData.superficie_catastral && formData.superficie_catastral !== '' 
          ? parseFloat(formData.superficie_catastral) 
          : 0.00,
        paraje: formData.paraje || '',
        calificacion_fiscal: formData.calificacion_fiscal || '',
        calificacion_urbanistica: formData.calificacion_urbanistica || '',
        
        // Características de la finca
        lindero_norte_parcial: formData.lindero_norte_parcial || '',
        lindero_sur_parcial: formData.lindero_sur_parcial || '',
        lindero_este_parcial: formData.lindero_este_parcial || '',
        lindero_oeste_parcial: formData.lindero_oeste_parcial || '',
        naturaleza: formData.naturaleza || '',
        aprovechamiento_actual: formData.aprovechamiento_actual || '',
        forma_configuracion: formData.forma_configuracion || '',
        
        // Afección
        tipo_afeccion: formData.tipo_afeccion || 'parcial',
        divide_finca: formData.divide_finca || false,
        
        // Referencias
        plano_numero: formData.plano_numero || '',
        anejo: formData.anejo || '',
      }

      // Agregar matriz de subparcelas (A-H)
      const letras = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      letras.forEach(letra => {
        const sp = subparcelas[letra]
        fichaData[`subparcela_${letra}`] = sp.subparcela || ''
        fichaData[`aprovechamiento_${letra}`] = sp.aprovechamiento || ''
        fichaData[`unidad_${letra}`] = sp.unidad && sp.unidad !== '' ? parseFloat(sp.unidad) : null
        fichaData[`supf_expro_${letra}`] = sp.supf_expro && sp.supf_expro !== '' ? parseFloat(sp.supf_expro) : null
        fichaData[`supf_serv_aer_${letra}`] = sp.supf_serv_aer && sp.supf_serv_aer !== '' ? parseFloat(sp.supf_serv_aer) : null
        fichaData[`supf_serv_subt_${letra}`] = sp.supf_serv_subt && sp.supf_serv_subt !== '' ? parseFloat(sp.supf_serv_subt) : null
        fichaData[`supf_ocup_temp_${letra}`] = sp.supf_ocup_temp && sp.supf_ocup_temp !== '' ? parseFloat(sp.supf_ocup_temp) : null
      })

      // Agregar afecciones detalladas (1-10)
      afeccionesDetalladas.forEach((afeccion, index) => {
        const num = index + 1
        fichaData[`tipo_afeccion_${num}`] = afeccion.tipo_afeccion || ''
        fichaData[`estado_conservacion_${num}`] = afeccion.estado_conservacion || ''
        fichaData[`descripcion_${num}`] = afeccion.descripcion || ''
        fichaData[`cantidad_${num}`] = afeccion.cantidad && afeccion.cantidad !== '' ? parseInt(afeccion.cantidad) : null
      })

      // Crear la ficha con todos los datos de una vez
      console.log('Creando ficha de campo parcela...', fichaData)
      const createResponse = await fichaCampoService.createFichaCampoParcela(fichaData)
      console.log('Respuesta de creación:', createResponse)
      
      const fichaId = createResponse?.data?.data?.id || createResponse?.data?.id || createResponse?.id
      console.log('fichaId obtenido:', fichaId)
      
      if (!fichaId) {
        console.error('No se pudo obtener el ID. Respuesta completa:', createResponse)
        throw new Error('No se pudo obtener el ID de la ficha creada')
      }
      
      // Subir imágenes si hay alguna seleccionada
      const tieneImagenes = imagenes.foto_1 || imagenes.foto_2 || imagenes.foto_3 || imagenes.croquis
      console.log('¿Tiene imágenes para subir?', tieneImagenes, imagenes)
      
      if (tieneImagenes) {
        console.log('Iniciando subida de imágenes para ficha:', fichaId)
        await uploadImages(fichaId)
      } else {
        console.log('No hay imágenes para subir')
      }
      
      // Redirigir a la página de opciones de la finca
      navigate(fromVerExpropiaciones ? `/ver-expropiaciones/${fincaId}` : `/expropiaciones/${fincaId}`)
    } catch (err) {
      console.error('Error guardando ficha de campo:', err)
      setError(err.message || 'Error al guardar la ficha de campo')
    } finally {
      setSaving(false)
    }
  }

  const validateSection = (sectionId) => {
    switch (sectionId) {
      case 'basica':
        return !!formData.proyecto && !!formData.finca && !!formData.fecha_elaboracion
      case 'registro':
        return true // Opcional
      case 'catastral':
        return true // Opcional
      case 'caracteristicas':
        return true // Opcional
      case 'afeccion':
        return true // Opcional
      case 'subparcelas':
        return Object.values(subparcelas).some(sp => sp.subparcela)
      case 'afecciones_detalladas':
        return true // Opcional
      case 'referencias':
        return true // Opcional
      default:
        return false
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
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <PageHeader
        title="Ficha de Campo - Parcela"
        subtitle={finca ? `Finca ${finca.numero_finca || 'N/A'}${selectedProject ? ` - ${selectedProject.nombre || 'N/A'}` : ''}` : 'Crear nueva ficha de campo'}
        onBack={() => navigate(fromVerExpropiaciones ? `/ver-expropiaciones/${fincaId}` : `/expropiaciones/${fincaId}`)}
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

            <form onSubmit={handleSubmit}>
              {/* Sección: Información básica */}
              {activeSection === 'basica' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Información básica</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proyecto <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={selectedProject?.nombre || 'No seleccionado'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Finca <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={finca ? `Finca ${finca.numero_finca || 'N/A'}` : 'Cargando...'}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de elaboración <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_elaboracion}
                        onChange={(e) => handleInputChange('fecha_elaboracion', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de ficha <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value="Parcela Afectada"
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Encabezado
                      </label>
                      <input
                        type="text"
                        value={formData.encabezado}
                        onChange={(e) => handleInputChange('encabezado', e.target.value)}
                        placeholder="ID del encabezado (opcional)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
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
                        value={formData.finca_registral}
                        onChange={(e) => handleInputChange('finca_registral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Finca registral"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tomo registral</label>
                      <input
                        type="text"
                        value={formData.tomo_registral}
                        onChange={(e) => handleInputChange('tomo_registral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Tomo registral"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Libro registral</label>
                      <input
                        type="text"
                        value={formData.libro_registral}
                        onChange={(e) => handleInputChange('libro_registral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Libro registral"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Folio registral</label>
                      <input
                        type="text"
                        value={formData.folio_registral}
                        onChange={(e) => handleInputChange('folio_registral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Folio registral"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Inscripción registral</label>
                      <input
                        type="text"
                        value={formData.inscripcion_registral}
                        onChange={(e) => handleInputChange('inscripcion_registral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Inscripción registral"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sección registral</label>
                      <input
                        type="text"
                        value={formData.seccion_registral}
                        onChange={(e) => handleInputChange('seccion_registral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Sección registral"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carga registral</label>
                      <textarea
                        value={formData.carga_registral}
                        onChange={(e) => handleInputChange('carga_registral', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Carga registral"
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
                        value={formData.poligono}
                        onChange={(e) => handleInputChange('poligono', e.target.value)}
                        maxLength={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Polígono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Parcela</label>
                      <input
                        type="text"
                        value={formData.parcela}
                        onChange={(e) => handleInputChange('parcela', e.target.value)}
                        maxLength={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Parcela"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subparcela</label>
                      <input
                        type="text"
                        value={formData.subparcela}
                        onChange={(e) => handleInputChange('subparcela', e.target.value)}
                        maxLength={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Subparcela"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Referencia catastral</label>
                      <input
                        type="text"
                        value={formData.referencia_catastral}
                        onChange={(e) => handleInputChange('referencia_catastral', e.target.value)}
                        maxLength={50}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Referencia catastral"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor catastral (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.valor_catastral}
                        onChange={(e) => handleInputChange('valor_catastral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Superficie catastral (m²)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.superficie_catastral}
                        onChange={(e) => handleInputChange('superficie_catastral', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paraje</label>
                      <input
                        type="text"
                        value={formData.paraje}
                        onChange={(e) => handleInputChange('paraje', e.target.value)}
                        maxLength={200}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Paraje"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calificación fiscal</label>
                      <input
                        type="text"
                        value={formData.calificacion_fiscal}
                        onChange={(e) => handleInputChange('calificacion_fiscal', e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Ej: ALMENDRO SECANO-01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calificación urbanística</label>
                      <input
                        type="text"
                        value={formData.calificacion_urbanistica}
                        onChange={(e) => handleInputChange('calificacion_urbanistica', e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Ej: S.N.U., S.U."
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
                        value={formData.lindero_norte_parcial}
                        onChange={(e) => handleInputChange('lindero_norte_parcial', e.target.value)}
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero Norte Parcial"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Sur Parcial</label>
                      <textarea
                        value={formData.lindero_sur_parcial}
                        onChange={(e) => handleInputChange('lindero_sur_parcial', e.target.value)}
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero Sur Parcial"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Este Parcial</label>
                      <textarea
                        value={formData.lindero_este_parcial}
                        onChange={(e) => handleInputChange('lindero_este_parcial', e.target.value)}
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero Este Parcial"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Oeste Parcial</label>
                      <textarea
                        value={formData.lindero_oeste_parcial}
                        onChange={(e) => handleInputChange('lindero_oeste_parcial', e.target.value)}
                        rows={3}
                        maxLength={300}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero Oeste Parcial"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Naturaleza</label>
                      <input
                        type="text"
                        value={formData.naturaleza}
                        onChange={(e) => handleInputChange('naturaleza', e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Ej: Rústica, Urbana"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aprovechamiento actual</label>
                      <input
                        type="text"
                        value={formData.aprovechamiento_actual}
                        onChange={(e) => handleInputChange('aprovechamiento_actual', e.target.value)}
                        maxLength={200}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Aprovechamiento actual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Forma y configuración</label>
                      <input
                        type="text"
                        value={formData.forma_configuracion}
                        onChange={(e) => handleInputChange('forma_configuracion', e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Forma y configuración"
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
                      <select
                        value={formData.tipo_afeccion}
                        onChange={(e) => handleInputChange('tipo_afeccion', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        <option value="parcial">Parcial</option>
                        <option value="total">Total</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        id="divide_finca"
                        checked={formData.divide_finca}
                        onChange={(e) => handleInputChange('divide_finca', e.target.checked)}
                        className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-2 focus:ring-sky-500"
                      />
                      <label htmlFor="divide_finca" className="ml-2 text-sm text-gray-700">
                        Divide finca
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección: Subparcelas */}
              {activeSection === 'subparcelas' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Matriz de subparcelas (A-H)</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Complete al menos una subparcela. Cada subparcela puede tener aprovechamiento, unidad (m²) y diferentes tipos de superficies afectadas.
                  </p>
                  <div className="space-y-6">
                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letra) => {
                      const sp = subparcelas[letra]
                      return (
                        <div key={letra} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <h5 className="text-sm font-semibold text-gray-800 mb-3">Subparcela {letra.toUpperCase()}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Subparcela</label>
                              <input
                                type="text"
                                value={sp.subparcela}
                                onChange={(e) => handleSubparcelaChange(letra, 'subparcela', e.target.value)}
                                maxLength={20}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder={`Subparcela ${letra.toUpperCase()}`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Aprovechamiento</label>
                              <input
                                type="text"
                                value={sp.aprovechamiento}
                                onChange={(e) => handleSubparcelaChange(letra, 'aprovechamiento', e.target.value)}
                                maxLength={100}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="Aprovechamiento"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Unidad (m²)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sp.unidad}
                                onChange={(e) => handleSubparcelaChange(letra, 'unidad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Expro (m²)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sp.supf_expro}
                                onChange={(e) => handleSubparcelaChange(letra, 'supf_expro', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Serv.Aer (m²)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sp.supf_serv_aer}
                                onChange={(e) => handleSubparcelaChange(letra, 'supf_serv_aer', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Serv.Subt (m²)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sp.supf_serv_subt}
                                onChange={(e) => handleSubparcelaChange(letra, 'supf_serv_subt', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">Supf. Ocup.Temp (m²)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={sp.supf_ocup_temp}
                                onChange={(e) => handleSubparcelaChange(letra, 'supf_ocup_temp', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Sección: Afecciones detalladas */}
              {activeSection === 'afecciones_detalladas' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Afecciones detalladas (1-10)</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Complete las afecciones detalladas que apliquen. Puede dejar campos vacíos si no son necesarios.
                  </p>
                  <div className="space-y-4">
                    {afeccionesDetalladas.map((afeccion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h5 className="text-sm font-semibold text-gray-800 mb-3">Afección {index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de afección</label>
                            <input
                              type="text"
                              value={afeccion.tipo_afeccion}
                              onChange={(e) => handleAfeccionDetalladaChange(index, 'tipo_afeccion', e.target.value)}
                              maxLength={100}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              placeholder="Tipo de afección"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Estado de conservación</label>
                            <input
                              type="text"
                              value={afeccion.estado_conservacion}
                              onChange={(e) => handleAfeccionDetalladaChange(index, 'estado_conservacion', e.target.value)}
                              maxLength={100}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              placeholder="Estado de conservación"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                            <textarea
                              value={afeccion.descripcion}
                              onChange={(e) => handleAfeccionDetalladaChange(index, 'descripcion', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              placeholder="Descripción detallada"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Cantidad</label>
                            <input
                              type="number"
                              min="0"
                              value={afeccion.cantidad}
                              onChange={(e) => handleAfeccionDetalladaChange(index, 'cantidad', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
                        value={formData.plano_numero}
                        onChange={(e) => handleInputChange('plano_numero', e.target.value)}
                        maxLength={50}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Ej: 1 de 12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anejo</label>
                      <input
                        type="text"
                        value={formData.anejo}
                        onChange={(e) => handleInputChange('anejo', e.target.value)}
                        maxLength={100}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Anejo"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sección: Multimedia */}
              {activeSection === 'multimedia' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Multimedia</h4>
                  <p className="text-xs text-gray-500 mb-4">
                    Puede subir hasta 3 fotos y un croquis. Las imágenes se subirán después de crear la ficha.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Foto 1 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto 1</label>
                      {previews.foto_1 ? (
                        <div className="relative">
                          <img 
                            src={previews.foto_1} 
                            alt="Preview Foto 1" 
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('foto_1')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">Haga clic para seleccionar</p>
                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 500KB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange('foto_1', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Foto 2 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto 2</label>
                      {previews.foto_2 ? (
                        <div className="relative">
                          <img 
                            src={previews.foto_2} 
                            alt="Preview Foto 2" 
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('foto_2')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">Haga clic para seleccionar</p>
                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 500KB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange('foto_2', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Foto 3 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto 3</label>
                      {previews.foto_3 ? (
                        <div className="relative">
                          <img 
                            src={previews.foto_3} 
                            alt="Preview Foto 3" 
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('foto_3')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">Haga clic para seleccionar</p>
                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 500KB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange('foto_3', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Croquis */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Croquis</label>
                      {previews.croquis ? (
                        <div className="relative">
                          <img 
                            src={previews.croquis} 
                            alt="Preview Croquis" 
                            className="w-full h-48 object-cover rounded-lg mb-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('croquis')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500">Haga clic para seleccionar</p>
                            <p className="text-xs text-gray-500">PNG, JPG (MAX. 1MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange('croquis', e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer con botones */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 justify-end">
            <Button
              type="button"
              onClick={() => navigate(`/expropiaciones/${fincaId}`)}
              variant="outline"
              className="text-sm px-4 py-2"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={handleSubmit}
              className="text-sm px-4 py-2"
              icon={
                saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              }
            >
              {saving ? 'Guardando...' : 'Crear Ficha'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FichaCampoParcela
