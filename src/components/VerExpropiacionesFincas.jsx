import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext'
import proyectoService from '../services/proyectoService'
import fincaService from '../services/fincaService'
import fichaCampoService from '../services/fichaCampoService'
import Button from './ui/Button'
import PageHeader from './layout/PageHeader'

const VerExpropiacionesFincas = () => {
  const navigate = useNavigate()
  const { proyectoId } = useParams()
  const { selectProject } = useProject()
  
  const [proyecto, setProyecto] = useState(null)
  const [fincas, setFincas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchFinca, setSearchFinca] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [progresoFincas, setProgresoFincas] = useState({}) // { fincaId: { porcentaje, etapasCompletadas, totalEtapas } }

  useEffect(() => {
    if (proyectoId) {
      loadProyecto()
      loadFincas()
    }
  }, [proyectoId])

  useEffect(() => {
    setCurrentPage(1) // Resetear página al cambiar búsqueda
  }, [searchFinca])

  const loadProyecto = async () => {
    try {
      const proyectoData = await proyectoService.getProyecto(proyectoId)
      setProyecto(proyectoData)
      // Actualizar el proyecto seleccionado en el contexto
      selectProject(proyectoData)
    } catch (err) {
      console.error('Error cargando proyecto:', err)
      setError('Error al cargar proyecto')
    }
  }

  const loadFincas = async () => {
    if (!proyectoId) return
    
    try {
      setLoading(true)
      setError('')
      const fincasData = await fincaService.listFincasByProyecto(proyectoId)
      setFincas(fincasData)
      
      // Cargar progreso de todas las fincas en paralelo
      if (fincasData.length > 0) {
        loadProgresoFincas(fincasData)
      }
    } catch (err) {
      setError(err.message || 'Error al cargar fincas')
      setFincas([])
    } finally {
      setLoading(false)
    }
  }

  const calcularProgresoFinca = async (fincaId) => {
    try {
      // Cargar todas las actas y fichas en paralelo
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
      const fichaParcela = fichasParcelaArray.length > 0 ? fichasParcelaArray[0] : null
      
      // Procesar fichas de construcciones
      const fichasConstruccionesArray = Array.isArray(fichasConstruccionesData) ? fichasConstruccionesData : (fichasConstruccionesData?.data || [])
      const fichaConstrucciones = fichasConstruccionesArray.length > 0 ? fichasConstruccionesArray[0] : null
      
      // Procesar actas del backend
      const actasArray = Array.isArray(actasBackendData) ? actasBackendData : (actasBackendData?.data || [])
      
      // Definir las 4 etapas principales (excluyendo acta de comparecencia)
      const etapas = [
        {
          tipo: 'ficha_campo',
          completada: !!(fichaParcela || fichaConstrucciones)
        },
        {
          tipo: 'acta_previa',
          completada: !!actasArray.find(a => a.tipo_acta === 'previa' || a.tipo === 'previa')
        },
        {
          tipo: 'acta_ocupacion',
          completada: !!actasArray.find(a => a.tipo_acta === 'ocupacion' || a.tipo === 'ocupacion')
        },
        {
          tipo: 'acta_justiprecio',
          completada: !!actasArray.find(a => 
            a.tipo_acta === 'justiprecio' || a.tipo === 'justiprecio' || 
            a.tipo_acta === 'mutuo_acuerdo' || a.tipo === 'mutuo_acuerdo'
          )
        }
      ]
      
      const etapasCompletadas = etapas.filter(e => e.completada).length
      const totalEtapas = etapas.length
      const porcentaje = totalEtapas > 0 ? Math.round((etapasCompletadas / totalEtapas) * 100) : 0
      
      return {
        porcentaje,
        etapasCompletadas,
        totalEtapas
      }
    } catch (err) {
      console.error(`Error calculando progreso para finca ${fincaId}:`, err)
      return {
        porcentaje: 0,
        etapasCompletadas: 0,
        totalEtapas: 4
      }
    }
  }

  const loadProgresoFincas = async (fincasData) => {
    try {
      // Calcular progreso de todas las fincas en paralelo
      const progresosPromises = fincasData.map(finca => 
        calcularProgresoFinca(finca.id).then(progreso => ({ fincaId: finca.id, progreso }))
      )
      
      const resultados = await Promise.all(progresosPromises)
      
      // Crear objeto con el progreso de cada finca
      const progresoMap = {}
      resultados.forEach(({ fincaId, progreso }) => {
        progresoMap[fincaId] = progreso
      })
      
      setProgresoFincas(progresoMap)
    } catch (err) {
      console.error('Error cargando progreso de fincas:', err)
    }
  }

  const handleVerExpropiacion = (fincaId) => {
    navigate(`/ver-expropiaciones/${fincaId}`)
  }

  const fincasFiltradas = fincas.filter(finca => {
    if (!searchFinca.trim()) return true
    const searchLower = searchFinca.toLowerCase()
    return (
      (finca.numero_finca && finca.numero_finca.toString().toLowerCase().includes(searchLower)) ||
      (finca.municipio && finca.municipio.toLowerCase().includes(searchLower)) ||
      (finca.provincia && finca.provincia.toLowerCase().includes(searchLower)) ||
      (finca.referencia_catastral && finca.referencia_catastral.toLowerCase().includes(searchLower))
    )
  })

  // Calcular paginación
  const totalPages = Math.ceil(fincasFiltradas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const fincasPaginated = fincasFiltradas.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading && !proyecto) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error && !proyecto) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/ver-expropiaciones')} variant="outline">
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <PageHeader
        title="Fincas del proyecto"
        subtitle={proyecto ? `${proyecto.nombre || 'Proyecto sin nombre'}` : 'Selecciona una finca para ver sus expropiaciones'}
        onBack={() => navigate('/ver-expropiaciones')}
        showBackButton={true}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
      />
      
      <div className="w-full pt-6 pb-6 pl-10 pr-16">

        {/* Lista de fincas */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-white px-6 py-4 flex-shrink-0 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Fincas del proyecto
              </h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {fincasFiltradas.length} finca{fincasFiltradas.length !== 1 ? 's' : ''} {searchFinca.trim() ? 'encontrada' : 'registrada'}{fincasFiltradas.length !== 1 ? 's' : ''}
              {fincasFiltradas.length > 0 && ` (Página ${currentPage} de ${totalPages})`}
            </p>
            {/* Buscador */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar finca..."
                value={searchFinca}
                onChange={(e) => setSearchFinca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="p-6 flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Cargando fincas...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : fincasFiltradas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p className="text-sm font-medium">No se encontraron fincas</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchFinca.trim() ? 'Intenta con otro término de búsqueda' : 'Este proyecto no tiene fincas registradas'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 pr-2">
                  {fincasPaginated.map((finca) => (
                    <div
                      key={finca.id}
                      className="group p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-700 transition-all cursor-pointer"
                      onClick={() => handleVerExpropiacion(finca.id)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-lg bg-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                Finca {finca.numero_finca || 'N/A'}
                              </p>
                              {finca.tipo_finca && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {finca.tipo_finca}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                              {finca.municipio && (
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">Municipio:</span> {finca.municipio}
                                </span>
                              )}
                              {finca.provincia && (
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">Provincia:</span> {finca.provincia}
                                </span>
                              )}
                              {finca.referencia_catastral && (
                                <span className="text-xs text-gray-600">
                                  <span className="font-medium">Ref. Catastral:</span> {finca.referencia_catastral}
                                </span>
                              )}
                            </div>
                            {/* KPI de Progreso */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {progresoFincas[finca.id] ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-medium text-gray-700">
                                    {progresoFincas[finca.id].etapasCompletadas} de {progresoFincas[finca.id].totalEtapas} actas ({progresoFincas[finca.id].porcentaje}%)
                                  </span>
                                  {(() => {
                                    const porcentaje = progresoFincas[finca.id].porcentaje
                                    
                                    if (porcentaje === 0) {
                                      return (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                          Pendiente
                                        </span>
                                      )
                                    } else if (porcentaje === 100) {
                                      return (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-300">
                                          Completada
                                        </span>
                                      )
                                    } else {
                                      return (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-300">
                                          En proceso
                                        </span>
                                      )
                                    }
                                  })()}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                                  <span className="text-xs text-gray-500">Calculando progreso...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVerExpropiacion(finca.id)
                            }}
                            variant="outline"
                            className="text-xs"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            }
                          >
                            Ver expropiaciones
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} - {Math.min(endIndex, fincasFiltradas.length)} de {fincasFiltradas.length} fincas
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="text-xs px-3 py-1.5"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        }
                      />
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Mostrar solo algunas páginas alrededor de la actual
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                variant={currentPage === page ? 'solid' : 'outline'}
                                className="text-xs px-3 py-1.5 min-w-[2.5rem]"
                              >
                                {page}
                              </Button>
                            )
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 text-gray-400">
                                ...
                              </span>
                            )
                          }
                          return null
                        })}
                      </div>
                      
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="text-xs px-3 py-1.5"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        }
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerExpropiacionesFincas

