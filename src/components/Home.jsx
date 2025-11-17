import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import userService from '../services/userService'
import Button from './ui/Button'
import PageHeader from './layout/PageHeader'

function Home() {
  const { user, logout, getRemainingSessionTime } = useAuth()
  const { selectedProject, selectProject } = useProject()
  const [remainingTime, setRemainingTime] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [userProjects, setUserProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectToView, setProjectToView] = useState(null)
  const [editUser, setEditUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: ''
  })

  useEffect(() => {
    // Actualizar tiempo restante cada minuto
    const updateRemainingTime = () => {
      const time = getRemainingSessionTime()
      setRemainingTime(time)
    }

    updateRemainingTime()
    const interval = setInterval(updateRemainingTime, 60000) // Cada minuto

    // Cargar información del usuario y proyectos
    loadUserInfo()
    loadUserProjects()

    return () => clearInterval(interval)
  }, [getRemainingSessionTime])

  const getDisplayRole = (data) => {
    if (!data) return ''
    return (
      data.role_display ||
      data.role_name ||
      data.role ||
      data.primary_role ||
      data.rol ||
      (Array.isArray(data.groups) && data.groups[0]?.name) ||
      ''
    )
  }

  const loadUserInfo = async () => {
    try {
      setLoading(true)
      const info = await userService.getPersonalInfo()
      setUserInfo({
        ...info,
        role: getDisplayRole(info)
      })
      setEditUser({
        first_name: info.first_name || '',
        last_name: info.last_name || '',
        email: info.email || '',
        username: info.username || ''
      })
    } catch (error) {
      console.error('Error cargando información del usuario:', error)
      // Usar información del contexto si falla
      if (user) {
        setUserInfo({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          username: user.username || '',
          role: getDisplayRole(user)
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const loadUserProjects = async () => {
    try {
      const projects = await userService.getUserProjects()
      setUserProjects(projects)
    } catch (error) {
      console.error('Error cargando proyectos:', error)
      setUserProjects([])
    }
  }

  const handleEdit = () => {
    setEditUser({
      first_name: userInfo?.first_name || '',
      last_name: userInfo?.last_name || '',
      email: userInfo?.email || '',
      username: userInfo?.username || '',
      role: userInfo?.role || ''
    })
    setShowEditModal(true)
  }

  const handleSave = async () => {
    // Validar campos antes de enviar
    if (!editUser.first_name || !editUser.first_name.trim()) {
      alert('El nombre es obligatorio')
      return
    }
    if (!editUser.last_name || !editUser.last_name.trim()) {
      alert('El apellido es obligatorio')
      return
    }
    // Email no se valida porque está bloqueado y no se puede cambiar
    if (!editUser.username || !editUser.username.trim()) {
      alert('El nombre de usuario es obligatorio')
      return
    }

    // Validar longitud mínima
    if (editUser.first_name.trim().length < 2) {
      alert('El nombre debe tener al menos 2 caracteres')
      return
    }
    if (editUser.last_name.trim().length < 2) {
      alert('El apellido debe tener al menos 2 caracteres')
      return
    }
    if (editUser.username.trim().length < 3) {
      alert('El nombre de usuario debe tener al menos 3 caracteres')
      return
    }

    // Validar caracteres permitidos en username (letras, números, guiones, guiones bajos y puntos)
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/
    if (!usernameRegex.test(editUser.username.trim())) {
      alert('El nombre de usuario solo puede contener letras, números, guiones, guiones bajos y puntos')
      return
    }

    try {
      // Preparar datos para enviar (trimear los valores)
      // IMPORTANTE: Enviar todos los campos requeridos, incluso si no cambiaron
      const dataToSend = {
        first_name: editUser.first_name.trim(),
        last_name: editUser.last_name.trim(),
        email: (userInfo?.email || user?.email || '').trim().toLowerCase(), // Email no se puede cambiar, usar el actual
        username: editUser.username.trim()
      }

      const updated = await userService.updatePersonalInfo(dataToSend)
      setUserInfo({
        ...updated,
        role: getDisplayRole(updated)
      })
      setShowEditModal(false)
      // Actualizar el contexto también
      if (user) {
        user.first_name = updated.first_name
        user.last_name = updated.last_name
        user.email = updated.email
        user.username = updated.username
        const newRole = getDisplayRole(updated)
        if (newRole) {
          user.role = newRole
          user.role_display = newRole
        }
      }
      // Recargar información
      await loadUserInfo()
    } catch (error) {
      console.error('Error actualizando información:', error)
      // Mostrar mensaje de error más descriptivo
      const errorMsg = error.message || 'Error al actualizar información'
      alert(errorMsg)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const userNombre = userInfo?.first_name && userInfo?.last_name
    ? `${userInfo.first_name} ${userInfo.last_name}`
    : userInfo?.first_name || userInfo?.email || user?.email || 'Usuario'
  const userRole = getDisplayRole(userInfo) || getDisplayRole(user) || null

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <PageHeader
        title="Inicio"
        subtitle="Panel principal de la aplicación"
        showBackButton={false}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        }
      />
      
      <div className="w-full py-8 px-6">
        <div className="w-full">
          {/* Welcome Card con toda la información del usuario */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {userNombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Bienvenido, {userInfo?.first_name || user?.email || 'Usuario'}
                  </h2>
                  <p className="text-sm text-gray-500">{userInfo?.email || user?.email}</p>
                  {userRole && (
                    <p className="text-xs inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6.938 4.016a9 9 0 10-17.876 0 12.071 12.071 0 00.274 2.362 2.25 2.25 0 001.302 1.652c.403.173.93.293 1.629.356A23.87 23.87 0 0012 19c2.081 0 4.02-.243 5.733-.614.699-.063 1.226-.183 1.63-.356a2.25 2.25 0 001.302-1.652 12.066 12.066 0 00.273-2.362z" />
                      </svg>
                      {userRole}
                    </p>
                  )}
                  {remainingTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      Sesión expira en: {remainingTime.formatted}
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={handleEdit}
                variant="outline"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Editar perfil
              </Button>
            </div>

            {/* Información completa del usuario */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">
                Información personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Nombre</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userInfo?.first_name || 'No especificado'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Apellido</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userInfo?.last_name || 'No especificado'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Email</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userInfo?.email || user?.email}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Usuario</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userInfo?.username || user?.username || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Rol</span>
                  <span className="text-sm font-medium text-gray-900">
                    {userRole || 'No asignado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje cuando no hay proyecto seleccionado */}
          {userProjects.length > 0 && !selectedProject && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  Selecciona un proyecto para continuar
                </p>
              </div>
            </div>
          )}

          {/* Proyectos Asociados */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Proyectos asociados
            </h3>
            {userProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>No hay proyectos asociados</p>
                <p className="text-xs text-gray-400 mt-2">Los proyectos aparecerán aquí cuando estén disponibles</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="p-4 border border-gray-200 rounded-lg bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {project.nombre || 'Proyecto sin nombre'}
                          </h4>
                        </div>
                        {project.tramo && (
                          <p className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Tramo:</span> {project.tramo}
                          </p>
                        )}
                        {project.beneficiario && (
                          <p className="text-xs text-gray-600 mb-3">
                            <span className="font-medium">Beneficiario:</span> {project.beneficiario}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {project.estado && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            project.estado === 'activo' 
                              ? 'bg-green-100 text-green-800' 
                              : project.estado === 'completado'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {project.estado}
                          </span>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            setProjectToView(project)
                            setShowProjectModal(true)
                          }}
                          variant="outline"
                          className="text-xs"
                          icon={
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          }
                        >
                          Ver Información
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal para ver información del proyecto */}
      {showProjectModal && projectToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Información del proyecto
              </h3>
              <button
                onClick={() => {
                  setShowProjectModal(false)
                  setProjectToView(null)
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Header con nombre y estado */}
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {projectToView.nombre || 'Proyecto sin nombre'}
                    {projectToView.tramo && ` - ${projectToView.tramo}`}
                    {projectToView.estado && (
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                        projectToView.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : projectToView.estado === 'pausado'
                          ? 'bg-yellow-100 text-yellow-800'
                          : projectToView.estado === 'finalizado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {projectToView.estado === 'activo' ? 'Activo' : 
                         projectToView.estado === 'pausado' ? 'Pausado' :
                         projectToView.estado === 'finalizado' ? 'Finalizado' : projectToView.estado}
                      </span>
                    )}
                  </h4>
                </div>

                {/* Información Básica */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Información básica</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Nombre del proyecto</span>
                      <span className="text-sm font-medium text-gray-900">{projectToView.nombre || 'Sin nombre'}</span>
                    </div>
                    {projectToView.tramo && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Tramo</span>
                        <span className="text-sm font-medium text-gray-900">{projectToView.tramo}</span>
                      </div>
                    )}
                    {projectToView.subtramo && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Subtramo</span>
                        <span className="text-sm font-medium text-gray-900">{projectToView.subtramo}</span>
                      </div>
                    )}
                    {projectToView.clave && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Clave</span>
                        <span className="text-sm font-medium text-gray-900">{projectToView.clave}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del Contrato */}
                <div className="pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Información del contrato</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectToView.beneficiario && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Beneficiario</span>
                        <span className="text-sm font-medium text-gray-900">{projectToView.beneficiario}</span>
                      </div>
                    )}
                    {projectToView.contrato && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Contrato</span>
                        <span className="text-sm font-medium text-gray-900">{projectToView.contrato}</span>
                      </div>
                    )}
                    {projectToView.fecha_inicio && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Fecha de Inicio</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(projectToView.fecha_inicio).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado y Responsable */}
                <div className="pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Estado y responsable</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectToView.estado && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Estado del proyecto</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-fit ${
                          projectToView.estado === 'activo' 
                            ? 'bg-green-100 text-green-800' 
                            : projectToView.estado === 'pausado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : projectToView.estado === 'finalizado'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {projectToView.estado === 'activo' ? 'Activo' : 
                           projectToView.estado === 'pausado' ? 'Pausado' :
                           projectToView.estado === 'finalizado' ? 'Finalizado' : projectToView.estado}
                        </span>
                      </div>
                    )}
                    {projectToView.responsable && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Responsable</span>
                        <span className="text-sm font-medium text-gray-900">{projectToView.responsable}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Observaciones */}
                {projectToView.observaciones && (
                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Observaciones</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                      {projectToView.observaciones || 'Sin observaciones'}
                    </p>
                  </div>
                )}

                {/* Metadatos */}
                {(projectToView.fecha_creacion || projectToView.fecha_actualizacion || projectToView.creado_por) && (
                  <div className="pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wider">Metadatos</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectToView.fecha_creacion && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Fecha de Creación</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(projectToView.fecha_creacion).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {projectToView.fecha_actualizacion && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Última Actualización</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(projectToView.fecha_actualizacion).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      {projectToView.creado_por && (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">Creado por</span>
                          <span className="text-sm font-medium text-gray-900">
                            {projectToView.creado_por?.username || projectToView.creado_por?.email || projectToView.creado_por}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowProjectModal(false)
                  setProjectToView(null)
                }}
                variant="ghost"
                className="flex-1 text-gray-600 border border-gray-300"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  selectProject(projectToView)
                  setShowProjectModal(false)
                  setProjectToView(null)
                }}
                variant="solid"
                className="flex-1"
              >
                Seleccionar proyecto
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar perfil */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar perfil
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editUser.first_name}
                  onChange={(e) => setEditUser({...editUser, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-transparent text-sm"
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={editUser.last_name}
                  onChange={(e) => setEditUser({...editUser, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-transparent text-sm"
                />
              </div>

              {/* Email - Bloqueado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-xs text-gray-500">(No editable)</span>
                </label>
                <input
                  type="email"
                  value={editUser.email || userInfo?.email || user?.email || ''}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  El email no se puede modificar. Contacta al administrador si necesitas cambiarlo.
                </p>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  value={editUser.username}
                  onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-700 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Botones del modal */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="ghost"
                className="flex-1 text-gray-600 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                variant="solid"
                className="flex-1"
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home

