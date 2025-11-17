import { useState, useEffect } from 'react'
import fincaService from '../../services/fincaService'
import personaService from '../../services/personaService'
import Button from '../ui/Button'

function CrearFinca({ proyectoId, finca, isEditing, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState('basica') // basica, ubicacion, catastral, superficies, valoraciones, linderos, cultivos
  
  // Estado del formulario - organizado por secciones
  const [formData, setFormData] = useState({
    // Información básica
    numero_finca: '',
    tipo_finca: 'FP',
    tipo_afeccion: 'parcial',
    divide_finca: false,
    
    // Ubicación
    municipio: '',
    provincia: '',
    comunidad_autonoma: '',
    
    // Datos catastrales
    poligono: '',
    parcela: '',
    subparcela: '',
    referencia_catastral: '',
    paraje: '',
    calificacion_fiscal: '',
    calificacion_urbanistica: '',
    naturaleza: '',
    
    // Superficies
    supf_expro: '',
    supf_serv_aer: '',
    supf_serv_subt: '',
    supf_ocup_temp: '',
    superficie_catastral: '',
    superficie_subparcela: '',
    
    // Valoraciones
    valor_catastral: '',
    valor_catastral_suelo: '',
    valor_catastral_construccion: '',
    uso: '',
    
    // Linderos totales
    lindero_norte_total: '',
    lindero_sur_total: '',
    lindero_este_total: '',
    lindero_oeste_total: '',
    
    // Linderos parciales
    lindero_norte_parcial: '',
    lindero_sur_parcial: '',
    lindero_este_parcial: '',
    lindero_oeste_parcial: '',
    
    // Cultivos
    cultivo_catastral: '',
    aprovechamiento_actual: '',
    
    // Plano
    plano_numero: ''
  })

  const [titularesCatastrales, setTitularesCatastrales] = useState([])
  const [titularesActuales, setTitularesActuales] = useState([])
  const [titularesArrendatarios, setTitularesArrendatarios] = useState([])

  const personaFieldDefinitions = [
    { field: 'nif', label: 'NIF', required: true },
    { field: 'nombre', label: 'Nombre completo', required: true },
    { field: 'telefono', label: 'Teléfono' },
    { field: 'email', label: 'Email' },
    { field: 'domicilio', label: 'Domicilio', required: true },
    { field: 'codigo_postal', label: 'Código postal', required: true },
    { field: 'localidad', label: 'Localidad', required: true },
    { field: 'provincia', label: 'Provincia', required: true },
  ]

  const personaAdditionalFields = [
    { field: 'profesion', label: 'Profesión' },
    { field: 'estado_civil', label: 'Estado civil' },
    { field: 'nacionalidad', label: 'Nacionalidad' },
  ]

  const catastralFieldDefinitions = [
    { field: 'domicilio_catastral', label: 'Domicilio catastral', required: true },
    { field: 'codigo_postal_catastral', label: 'Código postal catastral', required: true },
    { field: 'localidad_catastral', label: 'Localidad catastral', required: true },
    { field: 'provincia_catastral', label: 'Provincia catastral', required: true },
  ]

  useEffect(() => {
    if (isEditing && finca) {
      // Prellenar formulario con datos de la finca
      setFormData({
        numero_finca: finca.numero_finca || '',
        tipo_finca: finca.tipo_finca || 'FP',
        tipo_afeccion: finca.tipo_afeccion || 'parcial',
        divide_finca: finca.divide_finca || false,
        municipio: finca.municipio || '',
        provincia: finca.provincia || '',
        comunidad_autonoma: finca.comunidad_autonoma || '',
        poligono: finca.poligono || '',
        parcela: finca.parcela || '',
        subparcela: finca.subparcela || '',
        referencia_catastral: finca.referencia_catastral || '',
        paraje: finca.paraje || '',
        calificacion_fiscal: finca.calificacion_fiscal || '',
        calificacion_urbanistica: finca.calificacion_urbanistica || '',
        naturaleza: finca.naturaleza || '',
        supf_expro: finca.supf_expro || '',
        supf_serv_aer: finca.supf_serv_aer || '',
        supf_serv_subt: finca.supf_serv_subt || '',
        supf_ocup_temp: finca.supf_ocup_temp || '',
        superficie_catastral: finca.superficie_catastral || '',
        superficie_subparcela: finca.superficie_subparcela || '',
        valor_catastral: finca.valor_catastral || '',
        valor_catastral_suelo: finca.valor_catastral_suelo || '',
        valor_catastral_construccion: finca.valor_catastral_construccion || '',
        uso: finca.uso || '',
        lindero_norte_total: finca.lindero_norte_total || '',
        lindero_sur_total: finca.lindero_sur_total || '',
        lindero_este_total: finca.lindero_este_total || '',
        lindero_oeste_total: finca.lindero_oeste_total || '',
        lindero_norte_parcial: finca.lindero_norte_parcial || '',
        lindero_sur_parcial: finca.lindero_sur_parcial || '',
        lindero_este_parcial: finca.lindero_este_parcial || '',
        lindero_oeste_parcial: finca.lindero_oeste_parcial || '',
        cultivo_catastral: finca.cultivo_catastral || '',
        aprovechamiento_actual: finca.aprovechamiento_actual || '',
        plano_numero: finca.plano_numero || ''
      })

      setTitularesCatastrales(
        (finca.titulares_catastrales || []).map((titular) => ({
          id: titular.id || null,
          persona: {
            id: titular.persona?.id || null,
            nif: titular.persona?.nif || '',
            nombre: titular.persona?.nombre || '',
            telefono: titular.persona?.telefono || '',
            email: titular.persona?.email || '',
            domicilio: titular.persona?.domicilio || '',
            codigo_postal: titular.persona?.codigo_postal || '',
            localidad: titular.persona?.localidad || '',
            provincia: titular.persona?.provincia || '',
            fecha_nacimiento: titular.persona?.fecha_nacimiento || '',
            profesion: titular.persona?.profesion || '',
            estado_civil: titular.persona?.estado_civil || '',
            nacionalidad: titular.persona?.nacionalidad || '',
          },
          domicilio_catastral: titular.domicilio_catastral || '',
          codigo_postal_catastral: titular.codigo_postal_catastral || '',
          localidad_catastral: titular.localidad_catastral || '',
          provincia_catastral: titular.provincia_catastral || '',
        }))
      )

      setTitularesActuales(
        (finca.titulares_actuales || []).map((titular) => ({
          id: titular.id || null,
          persona: {
            id: titular.persona?.id || null,
            nif: titular.persona?.nif || '',
            nombre: titular.persona?.nombre || '',
            telefono: titular.persona?.telefono || '',
            email: titular.persona?.email || '',
            domicilio: titular.persona?.domicilio || '',
            codigo_postal: titular.persona?.codigo_postal || '',
            localidad: titular.persona?.localidad || '',
            provincia: titular.persona?.provincia || '',
            fecha_nacimiento: titular.persona?.fecha_nacimiento || '',
            profesion: titular.persona?.profesion || '',
            estado_civil: titular.persona?.estado_civil || '',
            nacionalidad: titular.persona?.nacionalidad || '',
          },
        }))
      )

      setTitularesArrendatarios(
        (finca.arrendatarios || []).map((titular) => ({
          id: titular.id || null,
          persona: {
            id: titular.persona?.id || null,
            nif: titular.persona?.nif || '',
            nombre: titular.persona?.nombre || '',
            telefono: titular.persona?.telefono || '',
            email: titular.persona?.email || '',
            domicilio: titular.persona?.domicilio || '',
            codigo_postal: titular.persona?.codigo_postal || '',
            localidad: titular.persona?.localidad || '',
            provincia: titular.persona?.provincia || '',
            fecha_nacimiento: titular.persona?.fecha_nacimiento || '',
            profesion: titular.persona?.profesion || '',
            estado_civil: titular.persona?.estado_civil || '',
            nacionalidad: titular.persona?.nacionalidad || '',
          },
        }))
      )
    }
    if (!isEditing || !finca) {
      setTitularesCatastrales([])
      setTitularesActuales([])
      setTitularesArrendatarios([])
    }
  }, [finca, isEditing])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const createEmptyPersona = () => ({
    id: null,
    nif: '',
    nombre: '',
    telefono: '',
    email: '',
    domicilio: '',
    codigo_postal: '',
    localidad: '',
    provincia: '',
    fecha_nacimiento: '',
    profesion: '',
    estado_civil: '',
    nacionalidad: '',
  })

  const createEmptyCatastralData = () => ({
    domicilio_catastral: '',
    codigo_postal_catastral: '',
    localidad_catastral: '',
    provincia_catastral: '',
  })

  const getTitularState = (type) => {
    switch (type) {
      case 'catastral':
        return [titularesCatastrales, setTitularesCatastrales]
      case 'actual':
        return [titularesActuales, setTitularesActuales]
      case 'arrendatario':
        return [titularesArrendatarios, setTitularesArrendatarios]
      default:
        return [[], () => {}]
    }
  }

  const handleAddTitular = (type) => {
    const [list, setter] = getTitularState(type)
    const newEntry = {
      id: null,
      persona: createEmptyPersona(),
    }

    if (type === 'catastral') {
      newEntry.catastral = createEmptyCatastralData()
    }

    setter([...list, newEntry])
  }

  const handleRemoveTitular = (type, index) => {
    const [list, setter] = getTitularState(type)
    const updated = list.filter((_, idx) => idx !== index)
    setter(updated)
  }

  const handlePersonaFieldChange = (type, index, field, value) => {
    const [list, setter] = getTitularState(type)
    const updated = list.map((entry, idx) => {
      if (idx !== index) return entry
      return {
        ...entry,
        persona: {
          ...entry.persona,
          [field]: value,
        },
      }
    })
    setter(updated)
  }

  const handleTitularExtraFieldChange = (type, index, field, value) => {
    const [list, setter] = getTitularState(type)
    const updated = list.map((entry, idx) => {
      if (idx !== index) return entry
      if (type !== 'catastral') return entry
      return {
        ...entry,
        catastral: {
          ...entry.catastral,
          [field]: value,
        },
      }
    })
    setter(updated)
  }

  const handleBuscarPersona = async (type, index) => {
    const [list, setter] = getTitularState(type)
    const entry = list[index]
    const nif = entry?.persona?.nif?.trim()

    if (!nif) {
      setError('Ingresa un NIF para buscar a la persona')
      return
    }

    try {
      setError('')
      const persona = await personaService.getPersonaByNif(nif)
      const updated = list.map((item, idx) => {
        if (idx !== index) return item
        return {
          ...item,
          persona: {
            id: persona.id || null,
            nif: persona.nif || nif.toUpperCase(),
            nombre: persona.nombre || '',
            telefono: persona.telefono || '',
            email: persona.email || '',
            domicilio: persona.domicilio || '',
            codigo_postal: persona.codigo_postal || '',
            localidad: persona.localidad || '',
            provincia: persona.provincia || '',
            fecha_nacimiento: persona.fecha_nacimiento || '',
            profesion: persona.profesion || '',
            estado_civil: persona.estado_civil || '',
            nacionalidad: persona.nacionalidad || '',
          },
        }
      })
      setter(updated)
    } catch (buscarError) {
      setError(buscarError.message || 'No se encontró una persona con ese NIF')
    }
  }

  const validateTitularesSection = () => {
    const requiredPersonaFields = ['nif', 'nombre', 'domicilio', 'codigo_postal', 'localidad', 'provincia']

    for (const titular of titularesCatastrales) {
      for (const field of requiredPersonaFields) {
        if (!titular.persona?.[field]) {
          setError('Completa los datos obligatorios del titular catastral (NIF, Nombre, Domicilio, Código Postal, Localidad y Provincia)')
          return false
        }
      }
      const extraFields = ['domicilio_catastral', 'codigo_postal_catastral', 'localidad_catastral', 'provincia_catastral']
      for (const field of extraFields) {
        if (!titular.catastral?.[field]) {
          setError('Completa los datos catastrales requeridos (domicilio, código postal, localidad y provincia catastral)')
          return false
        }
      }
    }

    const basicPersonaFields = ['nif', 'nombre']
    for (const titular of [...titularesActuales, ...titularesArrendatarios]) {
      for (const field of basicPersonaFields) {
        if (!titular.persona?.[field]) {
          setError('Los titulares actuales y arrendatarios requieren al menos NIF y Nombre')
          return false
        }
      }
    }

    setError('')
    return true
  }

  const clearExistingTitulares = async (fincaId) => {
    if (!isEditing || !finca) return

    const deletions = []
    ;(finca.titulares_catastrales || []).forEach((titular) => {
      if (titular.id) {
        deletions.push(fincaService.deleteTitularCatastral(fincaId, titular.id))
      }
    })
    ;(finca.titulares_actuales || []).forEach((titular) => {
      if (titular.id) {
        deletions.push(fincaService.deleteTitularActual(fincaId, titular.id))
      }
    })
    ;(finca.arrendatarios || []).forEach((titular) => {
      if (titular.id) {
        deletions.push(fincaService.deleteTitularArrendatario(fincaId, titular.id))
      }
    })

    if (deletions.length > 0) {
      await Promise.allSettled(deletions)
    }
  }

  const ensurePersona = async (personaData) => {
    if (!personaData?.nif) {
      throw new Error('NIF requerido para crear la persona del titular')
    }

    if (personaData.id) {
      return personaData.id
    }

    const nif = personaData.nif.toUpperCase().trim()

    try {
      const existingPersona = await personaService.getPersonaByNif(nif)
      if (existingPersona?.id) {
        return existingPersona.id
      }
    } catch (lookupError) {
      // Ignorar si no se encuentra, se creará una nueva persona
    }

    const payload = {
      nif,
      nombre: personaData.nombre,
      telefono: personaData.telefono || '',
      email: personaData.email || '',
      domicilio: personaData.domicilio,
      codigo_postal: personaData.codigo_postal,
      localidad: personaData.localidad,
      provincia: personaData.provincia,
      profesion: personaData.profesion || '',
      estado_civil: personaData.estado_civil || '',
      nacionalidad: personaData.nacionalidad || '',
    }

    if (personaData.fecha_nacimiento) {
      payload.fecha_nacimiento = personaData.fecha_nacimiento
    }

    const nuevaPersona = await personaService.createPersona(payload)
    return nuevaPersona.id
  }

  const syncTitulares = async (fincaId) => {
    if (!fincaId) return

    await clearExistingTitulares(fincaId)

    for (const titular of titularesCatastrales) {
      const personaId = await ensurePersona(titular.persona)
      await fincaService.addTitularCatastral(fincaId, {
        persona_id: personaId,
        domicilio_catastral: titular.catastral?.domicilio_catastral,
        codigo_postal_catastral: titular.catastral?.codigo_postal_catastral,
        localidad_catastral: titular.catastral?.localidad_catastral,
        provincia_catastral: titular.catastral?.provincia_catastral,
      })
    }

    for (const titular of titularesActuales) {
      const personaId = await ensurePersona(titular.persona)
      await fincaService.addTitularActual(fincaId, personaId)
    }

    for (const titular of titularesArrendatarios) {
      const personaId = await ensurePersona(titular.persona)
      await fincaService.addTitularArrendatario(fincaId, personaId)
    }
  }

  const handleSubmit = async () => {
    // Validación básica
    if (!formData.numero_finca || !formData.municipio || !formData.provincia) {
      setError('Por favor, completa los campos obligatorios: Número de finca, Municipio y Provincia')
      setActiveSection('basica')
      return
    }

    if (!validateTitularesSection()) {
      setActiveSection('titulares')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Preparar datos para enviar
      const dataToSend = {
        proyecto: proyectoId,
        ...formData,
        // Convertir strings vacíos a null para campos numéricos
        supf_expro: formData.supf_expro ? parseFloat(formData.supf_expro) : null,
        supf_serv_aer: formData.supf_serv_aer ? parseFloat(formData.supf_serv_aer) : null,
        supf_serv_subt: formData.supf_serv_subt ? parseFloat(formData.supf_serv_subt) : null,
        supf_ocup_temp: formData.supf_ocup_temp ? parseFloat(formData.supf_ocup_temp) : null,
        superficie_catastral: formData.superficie_catastral ? parseFloat(formData.superficie_catastral) : null,
        superficie_subparcela: formData.superficie_subparcela ? parseFloat(formData.superficie_subparcela) : null,
        valor_catastral: formData.valor_catastral ? parseFloat(formData.valor_catastral) : null,
        valor_catastral_suelo: formData.valor_catastral_suelo ? parseFloat(formData.valor_catastral_suelo) : null,
        valor_catastral_construccion: formData.valor_catastral_construccion ? parseFloat(formData.valor_catastral_construccion) : null
      }

      let response
      let targetFincaId = null

      if (isEditing && finca) {
        response = await fincaService.updateFinca(finca.id, dataToSend)
        targetFincaId = finca.id
      } else {
        response = await fincaService.createFinca(dataToSend)
        targetFincaId = response?.id || null
      }

      if (!targetFincaId) {
        throw new Error('No se pudo determinar el ID de la finca para registrar los titulares')
      }

      await syncTitulares(targetFincaId)

      onSuccess()
    } catch (err) {
      setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} finca`)
    } finally {
      setLoading(false)
    }
  }

  // Validar secciones completas
  const validateSection = (sectionId) => {
    switch (sectionId) {
      case 'basica':
        return !!formData.numero_finca
      case 'ubicacion':
        return !!formData.municipio && !!formData.provincia
      case 'catastral':
        return true // Opcional
      case 'superficies':
        return true // Opcional
      case 'valoraciones':
        return true // Opcional
      case 'linderos':
        return true // Opcional
      case 'cultivos':
        return true // Opcional
      case 'titulares':
        return true // Validación personalizada se maneja en handleSubmit
      default:
        return false
    }
  }

  const allSectionsValid = () => {
    return validateSection('basica') && validateSection('ubicacion')
  }

  const sections = [
    { 
      id: 'basica', 
      label: 'Información básica', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'ubicacion', 
      label: 'Ubicación', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
      id: 'superficies', 
      label: 'Superficies', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      id: 'valoraciones', 
      label: 'Valoraciones', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'linderos', 
      label: 'Linderos', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    { 
      id: 'cultivos', 
      label: 'Cultivos', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'titulares',
      label: 'Titulares',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a3 3 0 110-6 3 3 0 010 6zM9 11a3 3 0 110-6 3 3 0 010 6z" />
        </svg>
      )
    }
  ]

  const titularSections = [
    {
      key: 'catastral',
      title: 'Titulares catastrales',
      description: 'Personas registradas en el catastro para esta finca.',
      list: titularesCatastrales,
      setter: setTitularesCatastrales,
      extraFields: catastralFieldDefinitions,
      showCatastral: true,
    },
    {
      key: 'actual',
      title: 'Titulares actuales',
      description: 'Propietarios actuales de la finca.',
      list: titularesActuales,
      setter: setTitularesActuales,
      extraFields: [],
      showCatastral: false,
    },
    {
      key: 'arrendatario',
      title: 'Arrendatarios',
      description: 'Personas que arriendan o habitan la finca.',
      list: titularesArrendatarios,
      setter: setTitularesArrendatarios,
      extraFields: [],
      showCatastral: false,
    },
  ]

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-[1100px] h-[800px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-200 px-6 py-4 flex items-center justify-between border-b border-gray-300">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {isEditing ? 'Editar finca' : 'Nueva finca'}
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

        {/* Tabs de secciones */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-2 overflow-x-auto">
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
        <div className="p-6 overflow-y-auto flex-1">
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
                    Número de finca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.numero_finca}
                    onChange={(e) => handleInputChange('numero_finca', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Número de finca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de finca
                  </label>
                  <select
                    value={formData.tipo_finca}
                    onChange={(e) => handleInputChange('tipo_finca', e.target.value)}
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
                    Tipo de afección
                  </label>
                  <select
                    value={formData.tipo_afeccion}
                    onChange={(e) => handleInputChange('tipo_afeccion', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="parcial">Parcial</option>
                    <option value="total">Total</option>
                    <option value="pendiente">Pendiente</option>
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

          {/* Sección: Ubicación */}
          {activeSection === 'ubicacion' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Ubicación geográfica</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => handleInputChange('municipio', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Municipio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => handleInputChange('provincia', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Provincia"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comunidad autónoma
                  </label>
                  <input
                    type="text"
                    value={formData.comunidad_autonoma}
                    onChange={(e) => handleInputChange('comunidad_autonoma', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Comunidad autónoma"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Referencia catastral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paraje</label>
                  <input
                    type="text"
                    value={formData.paraje}
                    onChange={(e) => handleInputChange('paraje', e.target.value)}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Ej: S.N.U., S.U."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Naturaleza</label>
                  <input
                    type="text"
                    value={formData.naturaleza}
                    onChange={(e) => handleInputChange('naturaleza', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Ej: Rústica, Urbana"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección: Superficies */}
          {activeSection === 'superficies' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Superficies (m²)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie expropiada</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.supf_expro}
                    onChange={(e) => handleInputChange('supf_expro', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie servidumbre aérea</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.supf_serv_aer}
                    onChange={(e) => handleInputChange('supf_serv_aer', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie servidumbre subterránea</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.supf_serv_subt}
                    onChange={(e) => handleInputChange('supf_serv_subt', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie ocupación temporal</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.supf_ocup_temp}
                    onChange={(e) => handleInputChange('supf_ocup_temp', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie catastral</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.superficie_catastral}
                    onChange={(e) => handleInputChange('superficie_catastral', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Superficie subparcela</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.superficie_subparcela}
                    onChange={(e) => handleInputChange('superficie_subparcela', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección: Valoraciones */}
          {activeSection === 'valoraciones' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Valoraciones catastrales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor catastral</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_catastral}
                    onChange={(e) => handleInputChange('valor_catastral', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor catastral suelo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_catastral_suelo}
                    onChange={(e) => handleInputChange('valor_catastral_suelo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor catastral construcción</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_catastral_construccion}
                    onChange={(e) => handleInputChange('valor_catastral_construccion', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uso</label>
                  <input
                    type="text"
                    value={formData.uso}
                    onChange={(e) => handleInputChange('uso', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Uso actual de la parcela"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección: Linderos */}
          {activeSection === 'linderos' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Linderos</h4>
              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-800 mb-3">Linderos totales de la parcela</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Norte</label>
                      <textarea
                        value={formData.lindero_norte_total}
                        onChange={(e) => handleInputChange('lindero_norte_total', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero completo en dirección Norte"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Sur</label>
                      <textarea
                        value={formData.lindero_sur_total}
                        onChange={(e) => handleInputChange('lindero_sur_total', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero completo en dirección Sur"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Este</label>
                      <textarea
                        value={formData.lindero_este_total}
                        onChange={(e) => handleInputChange('lindero_este_total', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero completo en dirección Este"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Oeste</label>
                      <textarea
                        value={formData.lindero_oeste_total}
                        onChange={(e) => handleInputChange('lindero_oeste_total', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero completo en dirección Oeste"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-800 mb-3">Linderos parciales (solo superficie expropiada)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Norte Parcial</label>
                      <textarea
                        value={formData.lindero_norte_parcial}
                        onChange={(e) => handleInputChange('lindero_norte_parcial', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero de la superficie a expropiar en dirección Norte"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Sur Parcial</label>
                      <textarea
                        value={formData.lindero_sur_parcial}
                        onChange={(e) => handleInputChange('lindero_sur_parcial', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero de la superficie a expropiar en dirección Sur"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Este Parcial</label>
                      <textarea
                        value={formData.lindero_este_parcial}
                        onChange={(e) => handleInputChange('lindero_este_parcial', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero de la superficie a expropiar en dirección Este"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lindero Oeste Parcial</label>
                      <textarea
                        value={formData.lindero_oeste_parcial}
                        onChange={(e) => handleInputChange('lindero_oeste_parcial', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Lindero de la superficie a expropiar en dirección Oeste"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sección: Cultivos */}
          {activeSection === 'cultivos' && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Cultivos y aprovechamientos</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cultivo catastral</label>
                  <textarea
                    value={formData.cultivo_catastral}
                    onChange={(e) => handleInputChange('cultivo_catastral', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Cultivo que aparece en catastro. Puede reflejar varios cultivos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aprovechamiento actual</label>
                  <textarea
                    value={formData.aprovechamiento_actual}
                    onChange={(e) => handleInputChange('aprovechamiento_actual', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Cultivo que posee la parcela en la actualidad. Puede reflejar varios cultivos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plano número</label>
                  <input
                    type="text"
                    value={formData.plano_numero}
                    onChange={(e) => handleInputChange('plano_numero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Ej: 1 de 12"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sección: Titulares */}
          {activeSection === 'titulares' && (
            <div className="space-y-6">
              {titularSections.map((section) => (
                <div key={section.key} className="border border-gray-200 bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      type="button"
                      className="text-xs px-3 py-1.5"
                      onClick={() => handleAddTitular(section.key)}
                    >
                      Agregar {section.key === 'arrendatario' ? 'arrendatario' : 'titular'}
                    </Button>
                  </div>

                  {section.list.length === 0 ? (
                    <p className="text-xs text-gray-500 mt-4">
                      No se han registrado {section.key === 'arrendatario' ? 'arrendatarios' : 'titulares'} para esta finca.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {section.list.map((entry, index) => (
                        <div key={`${section.key}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800">{section.title} #{index + 1}</p>
                            <Button
                              variant="ghost"
                              type="button"
                              className="text-xs text-red-600 hover:text-red-700 px-2"
                              onClick={() => handleRemoveTitular(section.key, index)}
                            >
                              Eliminar
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {personaFieldDefinitions.map((fieldDef) => (
                              <div key={fieldDef.field}>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                  {fieldDef.label}
                                  {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {fieldDef.field === 'nif' ? (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={entry.persona?.[fieldDef.field] || ''}
                                      onChange={(e) => handlePersonaFieldChange(section.key, index, fieldDef.field, e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                      placeholder="Ej: 12345678Z"
                                    />
                                    <Button
                                      variant="outline"
                                      type="button"
                                      className="text-[11px] px-3 py-1.5"
                                      onClick={() => handleBuscarPersona(section.key, index)}
                                    >
                                      Buscar
                                    </Button>
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    value={entry.persona?.[fieldDef.field] || ''}
                                    onChange={(e) => handlePersonaFieldChange(section.key, index, fieldDef.field, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {personaAdditionalFields.map((fieldDef) => (
                              <div key={fieldDef.field}>
                                <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                  {fieldDef.label}
                                </label>
                                <input
                                  type="text"
                                  value={entry.persona?.[fieldDef.field] || ''}
                                  onChange={(e) => handlePersonaFieldChange(section.key, index, fieldDef.field, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                              </div>
                            ))}
                          </div>

                          {section.showCatastral && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {section.extraFields.map((fieldDef) => (
                                <div key={fieldDef.field}>
                                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                    {fieldDef.label}
                                    {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.catastral?.[fieldDef.field] || ''}
                                    onChange={(e) => handleTitularExtraFieldChange(section.key, index, fieldDef.field, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 text-gray-600 border border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="outline"
            className="flex-1"
            disabled={loading || !allSectionsValid()}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Guardar cambios' : 'Crear finca')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CrearFinca

