import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useProject } from '../../contexts/ProjectContext'
import fincaService from '../../services/fincaService'
import fichaCampoService from '../../services/fichaCampoService'
import Button from '../ui/Button'
import PageHeader from '../layout/PageHeader'

const FichaCampoConstrucciones = () => {
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
    tipo_ficha: 'construcciones',
    encabezado: '',
    
    // Naturaleza
    naturaleza: '',
    
    // Referencias
    plano_numero: '',
    anejo: '',
  })

  // Construcciones (1-5)
  const [construcciones, setConstrucciones] = useState({
    1: { tipo_construccion: '', estado_conservacion: '', superficie_total: '', descripcion: '' },
    2: { tipo_construccion: '', estado_conservacion: '', superficie_total: '', descripcion: '' },
    3: { tipo_construccion: '', estado_conservacion: '', superficie_total: '', descripcion: '' },
    4: { tipo_construccion: '', estado_conservacion: '', superficie_total: '', descripcion: '' },
    5: { tipo_construccion: '', estado_conservacion: '', superficie_total: '', descripcion: '' },
  })

  // Estado para imágenes (multimedia)
  const [imagenes, setImagenes] = useState({
    foto_1: null,
    foto_2: null,
    foto_3: null,
    croquis_1: null,
    croquis_2: null
  })

  const [previews, setPreviews] = useState({
    foto_1: null,
    foto_2: null,
    foto_3: null,
    croquis_1: null,
    croquis_2: null
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
        proyecto: parseInt(selectedProject.id)
      }))
    }
  }, [selectedProject])

  const loadFinca = async () => {
    try {
      setLoading(true)
      const fincaData = await fincaService.getFinca(fincaId)
      setFinca(fincaData)
      
      const proyectoIdFromFinca = fincaData?.proyecto || fincaData?.proyecto_id
      
      setFormData(prev => ({
        ...prev,
        finca: parseInt(fincaId),
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

  const handleConstruccionChange = (num, field, value) => {
    setConstrucciones(prev => ({
      ...prev,
      [num]: {
        ...prev[num],
        [field]: value
      }
    }))
  }

  const handleImageChange = (tipo, file) => {
    if (file) {
      setImagenes(prev => ({
        ...prev,
        [tipo]: file
      }))
      
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
          fichaCampoService.subirImagenFichaCampoConstrucciones(fichaId, tipo, archivo)
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

    // Validar que al menos una construcción tenga datos
    const tieneConstrucciones = Object.values(construcciones).some(c => c.tipo_construccion)
    if (!tieneConstrucciones) {
      setError('Debe especificar al menos una construcción')
      setActiveSection('construcciones')
      return
    }

    try {
      setSaving(true)
      setError('')
      
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
      
      // Construir el objeto completo con todos los datos
      const fichaData = {
        // Relaciones
        proyecto: parseInt(proyectoId),
        finca: fincaIdNum,
        ...(formData.encabezado && { encabezado: parseInt(formData.encabezado) }),
        
        // Datos básicos
        fecha_elaboracion: formData.fecha_elaboracion,
        tipo_ficha: 'construcciones',
        
        // Naturaleza
        naturaleza: formData.naturaleza || '',
        
        // Referencias
        plano_numero: formData.plano_numero || '',
        anejo: formData.anejo || '',
      }

      // Agregar construcciones (1-5)
      for (let i = 1; i <= 5; i++) {
        const c = construcciones[i]
        fichaData[`tipo_construccion_${i}`] = c.tipo_construccion || ''
        fichaData[`estado_conservacion_construccion_${i}`] = c.estado_conservacion || ''
        fichaData[`superficie_total_construccion_${i}`] = c.superficie_total && c.superficie_total !== '' 
          ? parseFloat(c.superficie_total) 
          : null
        fichaData[`descripcion_construccion_${i}`] = c.descripcion || ''
      }

      // Crear la ficha con todos los datos de una vez
      console.log('Creando ficha de campo construcciones...', fichaData)
      const createResponse = await fichaCampoService.createFichaCampoConstrucciones(fichaData)
      console.log('Respuesta de creación:', createResponse)
      
      const fichaId = createResponse?.data?.data?.id || createResponse?.data?.id || createResponse?.id
      console.log('fichaId obtenido:', fichaId)
      
      if (!fichaId) {
        console.error('No se pudo obtener el ID. Respuesta completa:', createResponse)
        throw new Error('No se pudo obtener el ID de la ficha creada')
      }
      
      // Subir imágenes si hay alguna seleccionada
      const tieneImagenes = imagenes.foto_1 || imagenes.foto_2 || imagenes.foto_3 || imagenes.croquis_1 || imagenes.croquis_2
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
      <PageHeader
        title="Ficha de Campo - Construcciones"
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
                        value="Construcciones"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Naturaleza
                      </label>
                      <input
                        type="text"
                        value={formData.naturaleza}
                        onChange={(e) => handleInputChange('naturaleza', e.target.value)}
                        placeholder="Naturaleza"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                    const c = construcciones[num]
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
                              value={c.tipo_construccion}
                              onChange={(e) => handleConstruccionChange(num, 'tipo_construccion', e.target.value)}
                              placeholder="Tipo de construcción"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Estado de conservación
                            </label>
                            <input
                              type="text"
                              value={c.estado_conservacion}
                              onChange={(e) => handleConstruccionChange(num, 'estado_conservacion', e.target.value)}
                              placeholder="Estado de conservación"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Superficie total (m²)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={c.superficie_total}
                              onChange={(e) => handleConstruccionChange(num, 'superficie_total', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descripción
                            </label>
                            <textarea
                              value={c.descripcion}
                              onChange={(e) => handleConstruccionChange(num, 'descripcion', e.target.value)}
                              rows={3}
                              placeholder="Descripción de la construcción"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
                        placeholder="Plano Nº"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Anejo</label>
                      <input
                        type="text"
                        value={formData.anejo}
                        onChange={(e) => handleInputChange('anejo', e.target.value)}
                        placeholder="Anejo"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
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
                        const tipo = `foto_${num}`
                        return (
                          <div key={num} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Foto {num}
                            </label>
                            {previews[tipo] ? (
                              <div className="relative">
                                <img
                                  src={previews[tipo]}
                                  alt={`Preview ${tipo}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(tipo)}
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
                                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="mb-2 text-sm text-gray-500">Click para subir</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(tipo, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
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
                        const tipo = `croquis_${num}`
                        return (
                          <div key={num} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Croquis {num}
                            </label>
                            {previews[tipo] ? (
                              <div className="relative">
                                <img
                                  src={previews[tipo]}
                                  alt={`Preview ${tipo}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(tipo)}
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
                                  <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  <p className="mb-2 text-sm text-gray-500">Click para subir</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(tipo, e.target.files[0])}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer con botones */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/expropiaciones/${fincaId}`)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={saving}
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
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FichaCampoConstrucciones

