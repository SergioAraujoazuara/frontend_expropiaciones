import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import fincaService from '../services/fincaService'
import fichaCampoService from '../services/fichaCampoService'
import Button from './ui/Button'
import PageHeader from './layout/PageHeader'

const VerExpropiacionFinca = () => {
  const navigate = useNavigate()
  const { fincaId } = useParams()
  
  const [finca, setFinca] = useState(null)
  const [actas, setActas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Definir las etapas del proceso (ordenadas)
  const etapas = [
    {
      id: 'etapa-1',
      numero: 1,
      titulo: 'Ficha de Campo',
      descripcion: 'Parcela y/o Construcciones',
      tipo: 'ficha_campo',
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      subactas: [
        {
          id: 'ficha-parcela',
          titulo: 'Ficha de Campo - Parcela',
          tipo: 'ficha_parcela',
          rutaVer: (id) => `/ver-expropiaciones/${fincaId}/ficha/${id}`,
          icono: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          id: 'ficha-construcciones',
          titulo: 'Ficha de Campo - Construcciones',
          tipo: 'ficha_construcciones',
          rutaVer: (id) => `/ver-expropiaciones/${fincaId}/ficha-construcciones/${id}`,
          icono: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'etapa-2',
      numero: 2,
      titulo: 'Acta Previa',
      descripcion: 'Acta previa a la ocupación',
      tipo: 'acta_previa',
      rutaVer: (id) => `/ver-expropiaciones/${fincaId}/acta-previa/${id}`,
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'etapa-3',
      numero: 3,
      titulo: 'Acta de Ocupación',
      descripcion: 'Acta de ocupación de fincas',
      tipo: 'acta_ocupacion',
      rutaVer: (id) => `/ver-expropiaciones/${fincaId}/acta-ocupacion/${id}`,
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'etapa-4',
      numero: 4,
      titulo: 'Mutuo Acuerdo',
      descripcion: 'Acta de justiprecio por mutuo acuerdo',
      tipo: 'acta_justiprecio',
      rutaVer: (id) => `/ver-expropiaciones/${fincaId}/mutuo-acuerdo/${id}`,
      icono: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  // Acta de Comparecencia (comodín, no cuenta en el avance)
  const actaComparecencia = {
    id: 'acta-comparecencia',
    titulo: 'Acta de Comparecencia',
    descripcion: 'Acta de comparecencia de titulares (comodín)',
    tipo: 'acta_comparecencia',
    rutaVer: (id) => `/ver-expropiaciones/${fincaId}/acta-comparecencia/${id}`,
    icono: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }

  useEffect(() => {
    if (fincaId) {
      loadFinca()
      loadActas()
    }
  }, [fincaId])

  const loadFinca = async () => {
    try {
      const fincaData = await fincaService.getFinca(fincaId)
      setFinca(fincaData)
    } catch (err) {
      console.error('Error cargando finca:', err)
      setError('Error al cargar finca')
    }
  }

  const loadActas = async () => {
    if (!fincaId) {
      setActas([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      // Cargar todas las actas en paralelo
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
      
      // Mapear las etapas con su estado
      const etapasMapeadas = etapas.map(etapa => {
        if (etapa.tipo === 'ficha_campo') {
          // Etapa 1: Ficha de Campo (completada si hay al menos una ficha)
          const completada = !!(fichaParcela || fichaConstrucciones)
          const subactasMapeadas = etapa.subactas.map(subacta => {
            let datos = null
            if (subacta.tipo === 'ficha_parcela') {
              datos = fichaParcela
            } else if (subacta.tipo === 'ficha_construcciones') {
              datos = fichaConstrucciones
            }
            return {
              ...subacta,
              completada: !!datos,
              datos
            }
          })
          return {
            ...etapa,
            completada,
            subactas: subactasMapeadas,
            datos: completada ? { fichaParcela, fichaConstrucciones } : null
          }
        } else {
          // Otras etapas: buscar en las actas del backend
          const actaCompletada = actasArray.find(a => {
            if (etapa.tipo === 'acta_previa') return a.tipo_acta === 'previa' || a.tipo === 'previa'
            if (etapa.tipo === 'acta_ocupacion') return a.tipo_acta === 'ocupacion' || a.tipo === 'ocupacion'
            if (etapa.tipo === 'acta_justiprecio') return a.tipo_acta === 'justiprecio' || a.tipo === 'justiprecio' || a.tipo_acta === 'mutuo_acuerdo' || a.tipo === 'mutuo_acuerdo'
            return false
          })
          return {
            ...etapa,
            completada: !!actaCompletada,
            datos: actaCompletada || null
          }
        }
      })
      
      // También cargar acta de comparecencia (comodín, no cuenta en avance)
      const actaComparecenciaCompletada = actasArray.find(a => 
        a.tipo_acta === 'comparecencia' || a.tipo === 'comparecencia'
      )
      const actaComparecenciaMapeada = {
        ...actaComparecencia,
        completada: !!actaComparecenciaCompletada,
        datos: actaComparecenciaCompletada || null
      }
      
      setActas([...etapasMapeadas, actaComparecenciaMapeada])
    } catch (err) {
      console.error('Error cargando actas:', err)
      setError(err.message || 'Error al cargar actas')
      setActas([...etapas.map(e => ({ ...e, completada: false, datos: null })), { ...actaComparecencia, completada: false, datos: null }])
    } finally {
      setLoading(false)
    }
  }

  const handleVerActa = (acta) => {
    if (!acta.completada || !acta.datos) return
    
    if (acta.rutaVer) {
      const ruta = acta.rutaVer(acta.datos.id)
      navigate(ruta)
    }
  }

  const handleVerSubacta = (subacta) => {
    if (!subacta.completada || !subacta.datos) return
    
    const ruta = subacta.rutaVer(subacta.datos.id)
    navigate(ruta)
  }

  const getRutaEdicion = (tipo) => {
    const rutas = {
      'ficha_parcela': `/expropiaciones/${fincaId}/ficha-campo/parcela`,
      'ficha_construcciones': `/expropiaciones/${fincaId}/ficha-campo/construcciones`,
      'acta_previa': `/expropiaciones/${fincaId}/acta-previa`,
      'acta_ocupacion': `/expropiaciones/${fincaId}/acta-ocupacion`,
      'acta_comparecencia': `/expropiaciones/${fincaId}/acta-comparecencia`,
      'acta_justiprecio': `/expropiaciones/${fincaId}/mutuo-acuerdo`
    }
    return rutas[tipo] || null
  }

  const handleIniciarEditarActa = (acta) => {
    const ruta = getRutaEdicion(acta.tipo)
    if (ruta) {
      // Agregar parámetro para indicar que viene del flujo de "Ver Expropiaciones"
      navigate(`${ruta}?from=ver-expropiaciones`)
    }
  }

  const handleIniciarEditarSubacta = (subacta) => {
    const ruta = getRutaEdicion(subacta.tipo)
    if (ruta) {
      // Agregar parámetro para indicar que viene del flujo de "Ver Expropiaciones"
      navigate(`${ruta}?from=ver-expropiaciones`)
    }
  }

  // Calcular progreso basado en etapas (excluyendo acta de comparecencia)
  const etapasActas = actas.filter(a => a.numero) // Solo las etapas numeradas
  const etapasCompletadas = etapasActas.filter(e => e.completada).length
  const totalEtapas = etapasActas.length
  const porcentajeProgreso = totalEtapas > 0 ? Math.round((etapasCompletadas / totalEtapas) * 100) : 0

  if (loading && !finca) {
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
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <PageHeader
        title="Expropiaciones de la finca"
        subtitle={finca ? `Finca ${finca.numero_finca || 'N/A'} - ${finca.municipio || ''} (${finca.provincia || ''})` : 'Cargando información de la finca...'}
        onBack={() => {
          const proyectoId = finca?.proyecto || finca?.proyecto_id
          if (proyectoId) {
            navigate(`/ver-expropiaciones/${proyectoId}/fincas`)
          } else {
            navigate('/ver-expropiaciones')
          }
        }}
        showBackButton={true}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
      />
      
      <div className="w-full pt-6 pb-6 pl-10 pr-16">
        {/* Indicador de Progreso */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Progreso de la Expropiación</h2>
              <p className="text-sm text-gray-600 mt-1">
                {etapasCompletadas} de {totalEtapas} etapas completadas
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-700">{porcentajeProgreso}%</div>
              <p className="text-xs text-gray-500 mt-1">Completado</p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-sky-800 transition-all duration-500 rounded-full"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
        </div>

        {/* Lista de Etapas */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-white px-6 py-4 flex-shrink-0 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Etapas del Proceso
            </h2>
            <p className="text-xs text-gray-600 mt-2">
              {etapasCompletadas} completadas • {totalEtapas - etapasCompletadas} pendientes
            </p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600 mx-auto"></div>
                <p className="mt-3 text-sm text-gray-500">Cargando etapas...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actas.filter(a => a.numero).map((etapa) => (
                  <div
                    key={etapa.id}
                    className={`group p-4 border-2 rounded-lg transition-all ${
                      etapa.completada
                        ? 'border-gray-400 bg-white hover:bg-gray-50 hover:border-gray-500'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm border-2 ${
                              etapa.completada 
                                ? 'bg-gray-700 text-white border-gray-800' 
                                : 'bg-gray-200 text-gray-600 border-gray-300'
                            }`}
                          >
                            {etapa.numero}
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
                            <div className="text-white">
                              {etapa.icono}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${etapa.completada ? 'text-gray-900' : 'text-gray-500'}`}>
                              {etapa.titulo}
                            </p>
                            {etapa.completada && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-300">
                                Completada
                              </span>
                            )}
                            {!etapa.completada && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                Pendiente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{etapa.descripcion}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {etapa.completada && etapa.rutaVer && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVerActa(etapa)
                            }}
                            variant="solid"
                            className="text-xs group-hover:bg-sky-700 group-hover:border-sky-700"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            }
                          >
                            Ver detalles
                          </Button>
                        )}
                        {!etapa.completada && getRutaEdicion(etapa.tipo) && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIniciarEditarActa(etapa)
                            }}
                            variant="outline"
                            className="text-xs"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            }
                          >
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Subactas para Ficha de Campo */}
                    {etapa.subactas && etapa.subactas.length > 0 && (
                      <div className="ml-16 space-y-2 border-t border-gray-200 pt-3 mt-3">
                        {etapa.subactas.map((subacta) => (
                          <div
                            key={subacta.id}
                            className={`group p-3 border rounded-lg transition-all ${
                              subacta.completada
                                ? 'border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 cursor-pointer'
                                : 'border-gray-200 bg-white'
                            }`}
                            onClick={() => subacta.completada && handleVerSubacta(subacta)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={subacta.completada ? 'text-gray-700' : 'text-gray-400'}>
                                  {subacta.icono}
                                </div>
                                <p className={`text-xs font-medium ${subacta.completada ? 'text-gray-900' : 'text-gray-500'}`}>
                                  {subacta.titulo}
                                </p>
                                {subacta.completada && (
                                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-300">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {subacta.completada && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleVerSubacta(subacta)
                                    }}
                                    variant="outline"
                                    className="text-xs"
                                    size="sm"
                                  >
                                    Ver
                                  </Button>
                                )}
                                {!subacta.completada && getRutaEdicion(subacta.tipo) && (
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleIniciarEditarSubacta(subacta)
                                    }}
                                    variant="outline"
                                    className="text-xs"
                                    size="sm"
                                    icon={
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                      </svg>
                                    }
                                  >
                                    Iniciar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acta de Comparecencia (Comodín) */}
        {actas.find(a => a.id === 'acta-comparecencia') && (
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            
            <div className="p-6">
              {(() => {
                const actaComp = actas.find(a => a.id === 'acta-comparecencia')
                return actaComp ? (
                  <div
                    className={`group p-4 border-2 rounded-lg transition-all ${
                      actaComp.completada
                        ? 'border-gray-400 bg-white hover:bg-gray-50 hover:border-gray-500 cursor-pointer'
                        : 'border-gray-200 bg-white'
                    }`}
                    onClick={() => actaComp.completada && handleVerActa(actaComp)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
                          <div className="text-white">
                            {actaComp.icono}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-semibold ${actaComp.completada ? 'text-gray-900' : 'text-gray-500'}`}>
                              {actaComp.titulo}
                            </p>
                            {actaComp.completada && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 border border-teal-300">
                                Completada
                              </span>
                            )}
                            {!actaComp.completada && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {actaComp.completada && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleVerActa(actaComp)
                            }}
                            variant="solid"
                            className="text-xs group-hover:bg-sky-700 group-hover:border-sky-700"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            }
                          >
                            Ver detalles
                          </Button>
                        )}
                        {!actaComp.completada && getRutaEdicion(actaComp.tipo) && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIniciarEditarActa(actaComp)
                            }}
                            variant="outline"
                            className="text-xs"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            }
                          >
                            Iniciar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerExpropiacionFinca

