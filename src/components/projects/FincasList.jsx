import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import fincaService from '../../services/fincaService'
import Button from '../ui/Button'
import CrearFinca from './CrearFinca'
import CargaMasivaFincas from './CargaMasivaFincas'

function FincasList() {
  const { proyectoId } = useParams()
  const [fincas, setFincas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchFinca, setSearchFinca] = useState('')
  const [showCrearModal, setShowCrearModal] = useState(false)
  const [showCargaMasivaModal, setShowCargaMasivaModal] = useState(false)
  const [fincaSeleccionada, setFincaSeleccionada] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'

  useEffect(() => {
    if (proyectoId) {
      loadFincas()
    }
  }, [proyectoId])

  const loadFincas = async () => {
    try {
      setLoading(true)
      setError('')
      const fincasData = await fincaService.listFincasByProyecto(proyectoId)
      setFincas(fincasData)
    } catch (err) {
      setError(err.message || 'Error al cargar fincas')
    } finally {
      setLoading(false)
    }
  }

  const handleNuevaFinca = () => {
    setFincaSeleccionada(null)
    setIsEditing(false)
    setShowCrearModal(true)
  }

  const handleEditarFinca = (finca) => {
    setFincaSeleccionada(finca)
    setIsEditing(true)
    setShowCrearModal(true)
  }

  const handleEliminarFinca = async (fincaId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta finca? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setError('')
      await fincaService.deleteFinca(fincaId)
      await loadFincas()
    } catch (err) {
      setError(err.message || 'Error al eliminar finca')
    }
  }

  const getTipoFincaColor = () => 'bg-gray-200 text-gray-700 border border-gray-300'

  const getTipoFincaLabel = (tipo) => {
    const labels = {
      'FP': 'Finca de Proyecto',
      'FC': 'Finca Complementaria',
      'AR': 'Arrendatario',
      'DP': 'Pública',
      'PE': 'Pendiente'
    }
    return labels[tipo] || tipo
  }

  const fincasFiltradas = fincas.filter(finca => {
    if (!searchFinca.trim()) return true
    const searchLower = searchFinca.toLowerCase()
    return (
      (finca.numero_finca && finca.numero_finca.toLowerCase().includes(searchLower)) ||
      (finca.municipio && finca.municipio.toLowerCase().includes(searchLower)) ||
      (finca.provincia && finca.provincia.toLowerCase().includes(searchLower)) ||
      (finca.referencia_catastral && finca.referencia_catastral.toLowerCase().includes(searchLower))
    )
  })

  const formatValue = (value, suffix = '') => {
    if (value === null || value === undefined || value === '' || value === false) {
      return <span className="text-gray-400 text-xs">—</span>
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }
    return (
      <span className="text-gray-900 text-xs">{`${value}${suffix}`}</span>
    )
  }

  const renderTitularSection = (label, list = [], options = {}) => {
    const { addressField } = options
    const baseClasses = 'text-[10px] uppercase tracking-wide text-gray-500 font-semibold'

    if (!list || list.length === 0) {
      return (
        <div>
          <p className={baseClasses}>{label}</p>
          <p className="text-gray-400 text-xs">—</p>
        </div>
      )
    }

    const first = list[0] || {}
    const persona = first.persona || {}
    const remaining = Math.max(list.length - 1, 0)
    const addressCandidate = addressField ? first[addressField] : undefined
    const resolvedAddress = addressCandidate || persona.domicilio || ''

    return (
      <div className="space-y-0.5">
        <p className={baseClasses}>{label}</p>
        <p className="text-xs text-gray-900">
          {persona.nombre || 'Sin nombre'}
          {remaining > 0 && (
            <span className="text-[10px] text-gray-500 ml-1">(+{remaining})</span>
          )}
        </p>
        {persona.nif && (
          <p className="text-[10px] text-gray-600">
            NIF: <span className="text-xs text-gray-900">{persona.nif}</span>
          </p>
        )}
        {resolvedAddress && (
          <p className="text-[10px] text-gray-600">
            Dom.: <span className="text-xs text-gray-900">{resolvedAddress}</span>
          </p>
        )}
      </div>
    )
  }

  const tableColumns = [
    {
      key: 'numero_finca',
      label: 'Número de finca',
      render: (finca) => formatValue(finca.numero_finca)
    },
    {
      key: 'tipo_finca',
      label: 'Tipo de finca',
      render: (finca) => (
        finca.tipo_finca ? (
          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex ${getTipoFincaColor(finca.tipo_finca)}`}>
            {getTipoFincaLabel(finca.tipo_finca)}
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )
      )
    },
    {
      key: 'titulares_resumen',
      label: 'Titulares',
      render: (finca) => (
        <div className="space-y-2 min-w-[180px]">
          {renderTitularSection('Catastral', finca.titulares_catastrales, { addressField: 'domicilio_catastral' })}
          {renderTitularSection('Actual', finca.titulares_actuales)}
          {renderTitularSection('Arrendatario', finca.arrendatarios)}
        </div>
      )
    },
    {
      key: 'tipo_afeccion',
      label: 'Tipo de afección',
      render: (finca) => formatValue(finca.tipo_afeccion ? finca.tipo_afeccion.charAt(0).toUpperCase() + finca.tipo_afeccion.slice(1) : '')
    },
    {
      key: 'divide_finca',
      label: 'Divide finca',
      render: (finca) => (
        finca.divide_finca === true || finca.divide_finca === false
          ? formatValue(finca.divide_finca)
          : <span className="text-gray-400 text-xs">—</span>
      )
    },
    {
      key: 'municipio',
      label: 'Municipio',
      render: (finca) => formatValue(finca.municipio)
    },
    {
      key: 'provincia',
      label: 'Provincia',
      render: (finca) => formatValue(finca.provincia)
    },
    {
      key: 'comunidad_autonoma',
      label: 'Comunidad autónoma',
      render: (finca) => formatValue(finca.comunidad_autonoma)
    },
    {
      key: 'poligono',
      label: 'Polígono',
      render: (finca) => formatValue(finca.poligono)
    },
    {
      key: 'parcela',
      label: 'Parcela',
      render: (finca) => formatValue(finca.parcela)
    },
    {
      key: 'subparcela',
      label: 'Subparcela',
      render: (finca) => formatValue(finca.subparcela)
    },
    {
      key: 'referencia_catastral',
      label: 'Referencia catastral',
      render: (finca) => formatValue(finca.referencia_catastral)
    },
    {
      key: 'paraje',
      label: 'Paraje',
      render: (finca) => formatValue(finca.paraje)
    },
    {
      key: 'calificacion_fiscal',
      label: 'Calificación fiscal',
      render: (finca) => formatValue(finca.calificacion_fiscal)
    },
    {
      key: 'calificacion_urbanistica',
      label: 'Calificación urbanística',
      render: (finca) => formatValue(finca.calificacion_urbanistica)
    },
    {
      key: 'naturaleza',
      label: 'Naturaleza',
      render: (finca) => formatValue(finca.naturaleza)
    },
    {
      key: 'supf_expro',
      label: 'Sup. expropiada (m²)',
      render: (finca) => formatValue(finca.supf_expro, ' m²')
    },
    {
      key: 'supf_serv_aer',
      label: 'Sup. serv. aérea (m²)',
      render: (finca) => formatValue(finca.supf_serv_aer, ' m²')
    },
    {
      key: 'supf_serv_subt',
      label: 'Sup. serv. subterránea (m²)',
      render: (finca) => formatValue(finca.supf_serv_subt, ' m²')
    },
    {
      key: 'supf_ocup_temp',
      label: 'Sup. ocupación temporal (m²)',
      render: (finca) => formatValue(finca.supf_ocup_temp, ' m²')
    },
    {
      key: 'superficie_catastral',
      label: 'Superficie catastral (m²)',
      render: (finca) => formatValue(finca.superficie_catastral, ' m²')
    },
    {
      key: 'superficie_subparcela',
      label: 'Superficie subparcela (m²)',
      render: (finca) => formatValue(finca.superficie_subparcela, ' m²')
    },
    {
      key: 'superficie_total_afectada',
      label: 'Superficie total afectada (m²)',
      render: (finca) => formatValue(finca.superficie_total_afectada, ' m²')
    },
    {
      key: 'valor_catastral',
      label: 'Valor catastral (€)',
      render: (finca) => formatValue(finca.valor_catastral, ' €')
    },
    {
      key: 'valor_catastral_suelo',
      label: 'Valor catastral suelo (€)',
      render: (finca) => formatValue(finca.valor_catastral_suelo, ' €')
    },
    {
      key: 'valor_catastral_construccion',
      label: 'Valor catastral construcción (€)',
      render: (finca) => formatValue(finca.valor_catastral_construccion, ' €')
    },
    {
      key: 'uso',
      label: 'Uso / Aprovechamiento',
      render: (finca) => formatValue(finca.uso)
    },
    {
      key: 'lindero_norte_total',
      label: 'Lindero norte (total)',
      render: (finca) => formatValue(finca.lindero_norte_total)
    },
    {
      key: 'lindero_sur_total',
      label: 'Lindero sur (total)',
      render: (finca) => formatValue(finca.lindero_sur_total)
    },
    {
      key: 'lindero_este_total',
      label: 'Lindero este (total)',
      render: (finca) => formatValue(finca.lindero_este_total)
    },
    {
      key: 'lindero_oeste_total',
      label: 'Lindero oeste (total)',
      render: (finca) => formatValue(finca.lindero_oeste_total)
    },
    {
      key: 'lindero_norte_parcial',
      label: 'Lindero norte (parcial)',
      render: (finca) => formatValue(finca.lindero_norte_parcial)
    },
    {
      key: 'lindero_sur_parcial',
      label: 'Lindero sur (parcial)',
      render: (finca) => formatValue(finca.lindero_sur_parcial)
    },
    {
      key: 'lindero_este_parcial',
      label: 'Lindero este (parcial)',
      render: (finca) => formatValue(finca.lindero_este_parcial)
    },
    {
      key: 'lindero_oeste_parcial',
      label: 'Lindero oeste (parcial)',
      render: (finca) => formatValue(finca.lindero_oeste_parcial)
    },
    {
      key: 'cultivo_catastral',
      label: 'Cultivo catastral',
      render: (finca) => formatValue(finca.cultivo_catastral)
    },
    {
      key: 'aprovechamiento_actual',
      label: 'Aprovechamiento actual',
      render: (finca) => formatValue(finca.aprovechamiento_actual)
    },
    {
      key: 'plano_numero',
      label: 'Plano Nº',
      render: (finca) => formatValue(finca.plano_numero)
    }
  ]

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-sm">Cargando fincas...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header con botones */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fincas del proyecto</h2>
          <p className="text-xs text-gray-600 mt-1">
            {fincas.length} finca{fincas.length !== 1 ? 's' : ''} registrada{fincas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Ver como tarjetas"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h4v4H4V6zm6 0h4v4h-4V6zm6 0h4v4h-4V6zM4 12h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
              </svg>
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1 transition-colors border-l border-gray-300 ${
                viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Ver como tabla"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              Tabla
            </button>
          </div>
          <Button
            onClick={() => setShowCargaMasivaModal(true)}
            variant="outline"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          >
            Carga masiva
          </Button>
          <Button
            onClick={handleNuevaFinca}
            variant="solid"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Nueva finca
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar finca..."
            value={searchFinca}
            onChange={(e) => setSearchFinca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de fincas */}
      {fincasFiltradas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-sm font-medium">
            {searchFinca.trim() ? 'No se encontraron fincas' : 'No hay fincas registradas'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {searchFinca.trim() ? 'Intenta con otro término de búsqueda' : 'Crea tu primera finca'}
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-3">
          {fincasFiltradas.map((finca) => (
            <div
              key={finca.id}
              className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-md border border-gray-300">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">
                        Finca {finca.numero_finca || 'Sin número'}
                      </p>
                      {finca.tipo_finca && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoFincaColor(finca.tipo_finca)}`}>
                          {getTipoFincaLabel(finca.tipo_finca)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {finca.municipio && (
                        <span className="text-xs text-gray-600">
                          {finca.municipio}
                          {finca.provincia && `, ${finca.provincia}`}
                        </span>
                      )}
                      {finca.referencia_catastral && (
                        <span className="text-xs text-gray-600">
                          Ref: <span className="text-gray-800 font-semibold">{finca.referencia_catastral}</span>
                        </span>
                      )}
                      {finca.superficie_total_afectada && (
                        <span className="text-xs text-gray-600">
                          Superficie: <span className="text-gray-800 font-semibold">{finca.superficie_total_afectada} m²</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={() => handleEditarFinca(finca)}
                    variant="outline"
                    className="text-xs"
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    }
                  >
                    Editar
                  </Button>
                  <button
                    onClick={() => handleEliminarFinca(finca.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar finca"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm ">
          <div className="w-full ">
            <div className="w-20 overflow-x-auto inline-block min-w-full align-middle">
              <table className="divide-y divide-gray-200 text-xs whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                {tableColumns.map((column) => (
                  <th key={column.key} scope="col" className="px-3 py-2 text-left font-semibold">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-xs">
              {fincasFiltradas.map((finca) => (
                <tr
                  key={finca.id}
                  className="border-2 border-transparent hover:border-sky-300 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleEditarFinca(finca)}
                >
                  {tableColumns.map((column) => (
                    <td key={column.key} className="px-3 py-2 align-top">
                      {column.render(finca)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right align-top" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleEditarFinca(finca)}
                        variant="outline"
                        className="text-xs"
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        }
                      >
                        Editar
                      </Button>
                      <button
                        onClick={() => handleEliminarFinca(finca.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar finca"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear/editar finca */}
      {showCrearModal && (
        <CrearFinca
          proyectoId={proyectoId}
          finca={fincaSeleccionada}
          isEditing={isEditing}
          onClose={() => {
            setShowCrearModal(false)
            setFincaSeleccionada(null)
            setIsEditing(false)
          }}
          onSuccess={() => {
            setShowCrearModal(false)
            setFincaSeleccionada(null)
            setIsEditing(false)
            loadFincas()
          }}
        />
      )}

      {/* Modal de carga masiva */}
      {showCargaMasivaModal && (
        <CargaMasivaFincas
          proyectoId={proyectoId}
          onClose={() => setShowCargaMasivaModal(false)}
          onSuccess={() => {
            setShowCargaMasivaModal(false)
            loadFincas()
          }}
        />
      )}
    </div>
  )
}

export default FincasList

