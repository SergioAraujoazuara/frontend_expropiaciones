import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import userService from '../services/userService'
import Button from './ui/Button'
import PageHeader from './layout/PageHeader'

const VerExpropiaciones = () => {
  const navigate = useNavigate()
  
  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProyectos()
  }, [])

  const loadProyectos = async () => {
    try {
      setLoading(true)
      const proyectosData = await userService.getUserProjects()
      setProyectos(proyectosData)
    } catch (err) {
      console.error('Error cargando proyectos:', err)
      setError('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectProject = (proyecto) => {
    navigate(`/ver-expropiaciones/${proyecto.id}/fincas`)
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

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <PageHeader
        title="Ver Expropiaciones"
        subtitle="Selecciona un proyecto para ver las expropiaciones existentes"
        showBackButton={true}
        onBack={() => navigate('/home')}
      />
      
      <div className="w-full pt-6 pb-6 pl-10 pr-16">

        {/* Mensaje si no hay proyectos */}
        {proyectos.length === 0 && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-amber-800">
                No tienes proyectos asignados. Contacta al administrador para que te asigne un proyecto.
              </p>
            </div>
          </div>
        )}

        {/* Selector de proyecto con cards */}
        {proyectos.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Proyectos disponibles
            </h3>
            <div className="space-y-3">
              {proyectos.map((proyecto) => (
                <div 
                  key={proyecto.id} 
                  className="group p-4 border rounded-lg transition-all cursor-pointer border-gray-200 hover:bg-gray-50 hover:border-sky-700"
                  onClick={() => handleSelectProject(proyecto)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {proyecto.nombre || 'Proyecto sin nombre'}
                        </h4>
                      </div>
                      {proyecto.tramo && (
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Tramo:</span> {proyecto.tramo}
                        </p>
                      )}
                      {proyecto.beneficiario && (
                        <p className="text-xs text-gray-600 mb-3">
                          <span className="font-medium">Beneficiario:</span> {proyecto.beneficiario}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-2">
                      {proyecto.estado && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          proyecto.estado === 'activo' 
                            ? 'bg-green-100 text-green-800' 
                            : proyecto.estado === 'completado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {proyecto.estado}
                        </span>
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectProject(proyecto)
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
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerExpropiaciones

