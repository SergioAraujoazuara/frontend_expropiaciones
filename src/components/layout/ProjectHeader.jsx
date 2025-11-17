import { useNavigate } from 'react-router-dom'
import { useProject } from '../../contexts/ProjectContext'
import Button from '../ui/Button'

const ProjectHeader = () => {
  const { selectedProject, clearProject } = useProject()
  const navigate = useNavigate()

  if (!selectedProject) {
    return null
  }

  const handleChangeProject = () => {
    clearProject()
    navigate('/home')
  }

  return (
    <div className="bg-gray-200 shadow-lg border-b border-sky-800 flex-shrink-0 py-9">
      <div className="w-full h-full flex items-center justify-between pl-12 pr-16">
        <div className="flex items-center gap-4 flex-1">
          {/* Icono del proyecto */}
          {/* <div className="flex-shrink-0">
            <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div> */}

            {/* Información del proyecto */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-gray-800">
                  {selectedProject.nombre || 'Proyecto sin nombre'}
                  {selectedProject.tramo && (
                    <span className="ml-2 text-gray-600 font-normal">
                      - {selectedProject.tramo}
                    </span>
                  )}
                </h2>
                <span className="px-3 py-1 bg-sky-700 text-white text-xs font-medium rounded-full">
                  Seleccionado
                </span>
              </div>
            
            {/* Información adicional */}
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              {selectedProject.clave && (
                <span className="text-xs text-gray-600 font-medium">
                  Clave: <span className="text-gray-800 font-semibold">{selectedProject.clave}</span>
                </span>
              )}
              {selectedProject.beneficiario && (
                <span className="text-xs text-gray-600 font-medium">
                  Beneficiario: <span className="text-gray-800 font-semibold">{selectedProject.beneficiario}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botón para deseleccionar y redirigir al home */}
        <div className="flex-shrink-0">
          <Button
            onClick={handleChangeProject}
            variant="outline"
            title="Cambiar proyecto"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          >
            Cambiar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProjectHeader

