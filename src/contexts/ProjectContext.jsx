import { createContext, useContext, useState, useEffect } from 'react'

const ProjectContext = createContext(null)

export function ProjectProvider({ children }) {
  const [selectedProject, setSelectedProject] = useState(null)

  // Cargar proyecto seleccionado del localStorage al iniciar
  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('selected_project')
      if (savedProject) {
        setSelectedProject(JSON.parse(savedProject))
      }
    } catch (error) {
      console.error('Error cargando proyecto seleccionado:', error)
    }
  }, [])

  // Guardar proyecto seleccionado en localStorage cuando cambie
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('selected_project', JSON.stringify(selectedProject))
    } else {
      localStorage.removeItem('selected_project')
    }
  }, [selectedProject])

  const selectProject = (project) => {
    setSelectedProject(project)
  }

  const clearProject = () => {
    setSelectedProject(null)
  }

  const value = {
    selectedProject,
    selectProject,
    clearProject,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject debe ser usado dentro de ProjectProvider')
  }
  return context
}

