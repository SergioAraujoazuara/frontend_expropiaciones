import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext'
import fincaService from '../services/fincaService'
import fichaCampoService from '../services/fichaCampoService'
import Button from './ui/Button'
import PageHeader from './layout/PageHeader'

const ExpropiacionFinca = () => {
  const navigate = useNavigate()
  const { fincaId } = useParams()
  const { selectedProject } = useProject()
  const [searchTerm, setSearchTerm] = useState('')
  const [finca, setFinca] = useState(null)
  const [loading, setLoading] = useState(true)
  const [opcionesBloqueadas, setOpcionesBloqueadas] = useState(new Set()) // Set de IDs de opciones bloqueadas

  useEffect(() => {
    if (fincaId) {
      loadFinca()
      loadOpcionesBloqueadas()
    } else {
      setLoading(false)
    }
  }, [fincaId])

  const loadFinca = async () => {
    try {
      setLoading(true)
      const fincaData = await fincaService.getFinca(fincaId)
      setFinca(fincaData)
    } catch (err) {
      console.error('Error cargando finca:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadOpcionesBloqueadas = async () => {
    if (!fincaId) return
    
    try {
      // Cargar todas las fichas y actas en paralelo
      const [
        fichasParcelaData,
        fichasConstruccionesData,
        actasBackendData
      ] = await Promise.all([
        fichaCampoService.listFichasCampoParcela({ finca: fincaId }).catch(() => []),
        fichaCampoService.listFichasCampoConstrucciones({ finca: fincaId }).catch(() => []),
        fincaService.getActasByFinca(fincaId).catch(() => [])
      ])
      
      // Procesar fichas de parcela
      const fichasParcelaArray = Array.isArray(fichasParcelaData) ? fichasParcelaData : (fichasParcelaData?.data || [])
      const tieneFichaParcela = fichasParcelaArray.length > 0
      
      // Procesar fichas de construcciones
      const fichasConstruccionesArray = Array.isArray(fichasConstruccionesData) ? fichasConstruccionesData : (fichasConstruccionesData?.data || [])
      const tieneFichaConstrucciones = fichasConstruccionesArray.length > 0
      
      // Procesar actas del backend
      const actasArray = Array.isArray(actasBackendData) ? actasBackendData : (actasBackendData?.data || [])
      
      // Determinar qué opciones están bloqueadas
      const bloqueadas = new Set()
      
      if (tieneFichaParcela) {
        bloqueadas.add('ficha-parcela')
      }
      if (tieneFichaConstrucciones) {
        bloqueadas.add('ficha-construcciones')
      }
      
      // Verificar actas
      const tieneActaPrevia = actasArray.some(a => a.tipo_acta === 'previa' || a.tipo === 'previa')
      const tieneActaOcupacion = actasArray.some(a => a.tipo_acta === 'ocupacion' || a.tipo === 'ocupacion')
      const tieneActaComparecencia = actasArray.some(a => a.tipo_acta === 'comparecencia' || a.tipo === 'comparecencia')
      const tieneMutuoAcuerdo = actasArray.some(a => 
        a.tipo_acta === 'justiprecio' || a.tipo === 'justiprecio' || 
        a.tipo_acta === 'mutuo_acuerdo' || a.tipo === 'mutuo_acuerdo'
      )
      
      if (tieneActaPrevia) {
        bloqueadas.add('acta-previa')
      }
      if (tieneActaOcupacion) {
        bloqueadas.add('acta-ocupacion')
      }
      if (tieneActaComparecencia) {
        bloqueadas.add('acta-comparecencia')
      }
      if (tieneMutuoAcuerdo) {
        bloqueadas.add('mutuo-acuerdo')
      }
      
      setOpcionesBloqueadas(bloqueadas)
    } catch (err) {
      console.error('Error cargando opciones bloqueadas:', err)
    }
  }

  const opciones = [
    {
      id: 'ficha-parcela',
      titulo: 'Ficha de Campo - Parcela',
      descripcion: 'Crear y gestionar fichas de campo para parcelas afectadas',
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      ruta: `/expropiaciones/${fincaId}/ficha-campo/parcela`
    },
    {
      id: 'ficha-construcciones',
      titulo: 'Ficha de Campo - Construcciones',
      descripcion: 'Crear y gestionar fichas de campo para construcciones afectadas',
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      ruta: `/expropiaciones/${fincaId}/ficha-campo/construcciones`
    },
    {
      id: 'acta-previa',
      titulo: 'Acta Previa',
      descripcion: 'Gestiona las actas previas a la ocupación',
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      ruta: `/expropiaciones/${fincaId}/acta-previa`
    },
    {
      id: 'acta-ocupacion',
      titulo: 'Acta de Ocupación',
      descripcion: 'Gestiona las actas de ocupación de fincas',
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      ruta: `/expropiaciones/${fincaId}/acta-ocupacion`
    },
    {
      id: 'acta-comparecencia',
      titulo: 'Acta de Comparecencia',
      descripcion: 'Gestiona las actas de comparecencia de titulares',
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      ruta: `/expropiaciones/${fincaId}/acta-comparecencia`
    },
    {
      id: 'mutuo-acuerdo',
      titulo: 'Mutuo Acuerdo',
      descripcion: 'Gestiona los acuerdos de mutuo acuerdo para justiprecio',
      icono: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      ruta: `/expropiaciones/${fincaId}/mutuo-acuerdo`
    }
  ]

  const handleClick = (opcion) => {
    // Si la opción está bloqueada, no hacer nada
    if (opcionesBloqueadas.has(opcion.id)) {
      return
    }
    if (opcion.subopciones) {
      // Si tiene subopciones, no navegar directamente
      return
    }
    if (opcion.ruta) {
      navigate(opcion.ruta)
    }
  }

  const opcionesFiltradas = opciones.filter(opcion => {
    if (!searchTerm.trim()) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      opcion.titulo.toLowerCase().includes(searchLower) ||
      opcion.descripcion.toLowerCase().includes(searchLower)
    )
  })

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

  if (!fincaId) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">No se ha seleccionado una finca</p>
          <Button onClick={() => navigate('/expropiaciones')} variant="outline">
            Volver a expropiaciones
          </Button>
        </div>
      </div>
    )
  }

  const getBackPath = () => {
    if (selectedProject) {
      return `/expropiaciones/${selectedProject.id}/fincas`
    }
    return '/expropiaciones'
  }

  const getSubtitle = () => {
    if (finca) {
      return `Finca ${finca.numero_finca || 'N/A'}${selectedProject ? ` - ${selectedProject.nombre || 'N/A'}` : ''}`
    }
    return 'Gestiona las actas y fichas de campo del proceso expropiatorio'
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <PageHeader
        title="Expropiación de Finca"
        subtitle={getSubtitle()}
        onBack={() => navigate(getBackPath())}
        showBackButton={true}
      />
      
      <div className="w-full pt-6 pb-6 pl-10 pr-16">

        {/* Lista de opciones */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-white px-6 py-4 flex-shrink-0 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Opciones disponibles
              </h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {opciones.length} opción{opciones.length !== 1 ? 'es' : ''} disponible{opciones.length !== 1 ? 's' : ''}
            </p>
            {/* Buscador */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar opción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {opcionesFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">No se encontraron opciones</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchTerm.trim() ? 'Intenta con otro término de búsqueda' : 'No hay opciones disponibles'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {opcionesFiltradas.map((opcion) => {
                  const estaBloqueada = opcionesBloqueadas.has(opcion.id)
                  return (
                  <div
                    key={opcion.id}
                    className={`group p-4 border-2 rounded-lg transition-all ${
                      estaBloqueada
                        ? 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-sky-700 cursor-pointer'
                    }`}
                    onClick={() => handleClick(opcion)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                          estaBloqueada ? 'bg-gray-300' : 'bg-gray-400'
                        }`}>
                          <div className={estaBloqueada ? 'text-gray-500' : 'text-white'}>
                            {opcion.icono}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold truncate ${
                              estaBloqueada ? 'text-gray-500' : 'text-gray-900'
                            }`}>
                              {opcion.titulo}
                            </p>
                            {estaBloqueada ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-300">
                                Completada
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                Pendiente
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            estaBloqueada ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {opcion.descripcion}
                          </p>
                          {opcion.subopciones && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="space-y-2">
                                {opcion.subopciones.map((subopcion) => (
                                  <div
                                    key={subopcion.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(subopcion.ruta)
                                    }}
                                    className="p-2 bg-gray-50 rounded border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors cursor-pointer"
                                  >
                                    <p className="text-xs font-medium text-gray-900 mb-0.5">
                                      {subopcion.titulo}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {subopcion.descripcion}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {opcion.ruta && !opcion.subopciones && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleClick(opcion)
                            }}
                            variant="outline"
                            className="text-xs"
                            disabled={estaBloqueada}
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            }
                          >
                            {estaBloqueada ? 'Enviada' : 'Acceder'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpropiacionFinca

