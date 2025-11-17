import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import proyectoService from '../../services/proyectoService'
import Button from '../ui/Button'
import FincasList from './FincasList'

function ProyectoDetalle() {
  const { proyectoId } = useParams()
  const navigate = useNavigate()
  
  const [proyecto, setProyecto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('fincas') // 'informacion' | 'fincas'

  useEffect(() => {
    loadProyecto()
  }, [proyectoId])

  const loadProyecto = async () => {
    try {
      setLoading(true)
      setError('')
      const proyectoData = await proyectoService.getProyecto(proyectoId)
      setProyecto(proyectoData)
    } catch (err) {
      setError(err.message || 'Error al cargar proyecto')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Proyecto no encontrado'}</p>
          <Button onClick={() => navigate('/gestion-proyectos')} variant="outline">
            Volver a proyectos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      <div className="w-full pt-8 pb-6 pl-10 pr-16">
        {/* Header del proyecto */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/gestion-proyectos')}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                title="Volver a proyectos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {proyecto.nombre || 'Proyecto sin nombre'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {proyecto.tramo && `${proyecto.tramo} - `}
                  {proyecto.clave && `Clave: ${proyecto.clave}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('informacion')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'informacion'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab('fincas')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'fincas'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fincas
              </button>
            </nav>
          </div>

          {/* Contenido de tabs */}
          <div className="p-6">
            {activeTab === 'informacion' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del proyecto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.nombre || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tramo</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.tramo || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subtramo</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.subtramo || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Clave</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.clave || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiario</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.beneficiario || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.contrato || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de inicio</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.estado || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</label>
                    <p className="mt-1 text-sm text-gray-900">{proyecto.responsable || '-'}</p>
                  </div>
                  {proyecto.observaciones && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</label>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{proyecto.observaciones}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'fincas' && (
              <FincasList />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProyectoDetalle

