import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService'
import api from '../../utils/api'
import Button from '../ui/Button'

function GestionUsuariosProyectos() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  
  const [proyectos, setProyectos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [usuariosProyecto, setUsuariosProyecto] = useState([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para modales
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([])
  
  // Estados para búsquedas
  const [searchProyecto, setSearchProyecto] = useState('')
  const [searchUsuario, setSearchUsuario] = useState('')
  const [searchUsuarioModal, setSearchUsuarioModal] = useState('')

  // Cargar proyectos y usuarios
  useEffect(() => {
    checkPermissionsAndLoad()
  }, [currentUser, navigate])

  const checkPermissionsAndLoad = async () => {
    try {
      // Obtener información completa del usuario desde el backend
      const userInfo = await userService.getPersonalInfo()
      
      // Verificar que el usuario sea administrador
      // El backend devuelve is_superuser y role en userInfo
      const isAdmin = userInfo?.is_superuser || 
                      userInfo?.role === 'administrador' ||
                      (userInfo?.groups && userInfo.groups.some(g => g.name === 'administrador'))
      
      if (!isAdmin) {
        setError('No tienes permisos para acceder a esta sección. Solo los administradores pueden gestionar usuarios en proyectos.')
        setLoading(false)
        return
      }

      // Si es administrador, cargar datos
      loadProyectos()
      loadUsuarios()
    } catch (err) {
      console.error('Error verificando permisos:', err)
      setError('Error al verificar permisos. Por favor, intenta nuevamente.')
      setLoading(false)
    }
  }

  const loadProyectos = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/api/proyectos/')
      setProyectos(response.results || response || [])
    } catch (err) {
      setError(err.message || 'Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const loadUsuarios = async () => {
    try {
      const usersData = await userService.listUsers()
      setUsuarios(usersData)
    } catch (err) {
      console.error('Error cargando usuarios:', err)
    }
  }

  const loadUsuariosProyecto = async (proyectoId) => {
    try {
      setLoadingUsuarios(true)
      setError('')
      const usuariosData = await userService.getProjectUsers(proyectoId)
      setUsuariosProyecto(usuariosData)
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios del proyecto')
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleProyectoSelect = (proyecto) => {
    setProyectoSeleccionado(proyecto)
    loadUsuariosProyecto(proyecto.id)
  }

  const handleAsignarUsuarios = async () => {
    if (!proyectoSeleccionado || usuariosSeleccionados.length === 0) {
      setError('Debes seleccionar al menos un usuario')
      return
    }

    try {
      setError('')
      setSuccess('')
      
      // Asignar proyecto a cada usuario seleccionado
      const promises = usuariosSeleccionados.map(userId => 
        userService.assignProjectToUser(userId, proyectoSeleccionado.id)
      )
      
      await Promise.all(promises)
      
      setSuccess(`Proyecto asignado exitosamente a ${usuariosSeleccionados.length} usuario(s)`)
      setShowAsignarModal(false)
      setUsuariosSeleccionados([])
      setSearchUsuarioModal('')
      
      // Recargar usuarios del proyecto
      await loadUsuariosProyecto(proyectoSeleccionado.id)
    } catch (err) {
      setError(err.message || 'Error al asignar usuarios al proyecto')
    }
  }

  const handleRemoverUsuario = async (userId) => {
    if (!proyectoSeleccionado) return
    
    if (!window.confirm('¿Estás seguro de que quieres remover este usuario del proyecto?')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      
      await userService.removeProjectFromUser(userId, proyectoSeleccionado.id)
      
      setSuccess('Usuario removido exitosamente del proyecto')
      
      // Recargar usuarios del proyecto
      await loadUsuariosProyecto(proyectoSeleccionado.id)
    } catch (err) {
      setError(err.message || 'Error al remover usuario del proyecto')
    }
  }

  // Filtrar usuarios que no están asignados al proyecto
  const usuariosDisponibles = usuarios.filter(user => 
    !usuariosProyecto.some(u => u.id === user.id)
  )

  // Filtrar proyectos por búsqueda
  const proyectosFiltrados = proyectos.filter(proyecto => {
    if (!searchProyecto.trim()) return true
    const searchLower = searchProyecto.toLowerCase()
    return (
      (proyecto.nombre && proyecto.nombre.toLowerCase().includes(searchLower)) ||
      (proyecto.tramo && proyecto.tramo.toLowerCase().includes(searchLower)) ||
      (proyecto.beneficiario && proyecto.beneficiario.toLowerCase().includes(searchLower))
    )
  })

  // Filtrar usuarios disponibles por búsqueda (para el modal)
  const usuariosDisponiblesFiltrados = usuariosDisponibles.filter(usuario => {
    if (!searchUsuarioModal.trim()) return true
    const searchLower = searchUsuarioModal.toLowerCase()
    return (
      (usuario.first_name && usuario.first_name.toLowerCase().includes(searchLower)) ||
      (usuario.last_name && usuario.last_name.toLowerCase().includes(searchLower)) ||
      (usuario.email && usuario.email.toLowerCase().includes(searchLower)) ||
      (usuario.username && usuario.username.toLowerCase().includes(searchLower))
    )
  })

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      <div className="w-full pt-8 pb-6 pl-10 pr-16">
        {/* Header de la página */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
          
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestión de usuarios
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Asigna y gestiona usuarios en los proyectos del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'calc(100vh - 300px)' }}>
          {/* Lista de Proyectos */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="bg-gray-200 px-6 py-4 flex-shrink-0 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Proyectos disponibles
              </h2>
              <p className="text-xs text-gray-600 mb-3">
                {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} disponible{proyectos.length !== 1 ? 's' : ''}
              </p>
              {/* Buscador de proyectos */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar proyecto..."
                  value={searchProyecto}
                  onChange={(e) => setSearchProyecto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
            
            {proyectos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium">No hay proyectos disponibles</p>
                <p className="text-xs text-gray-400 mt-1">Crea un proyecto para comenzar</p>
              </div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">No se encontraron proyectos</p>
                <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {proyectosFiltrados.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    onClick={() => handleProyectoSelect(proyecto)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      proyectoSeleccionado?.id === proyecto.id
                        ? 'border-sky-700 bg-sky-700/10 shadow-md'
                        : 'border-gray-200 hover:bg-sky-50 hover:border-sky-600 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {proyecto.nombre || 'Proyecto sin nombre'}
                          </h3>
                          {proyectoSeleccionado?.id === proyecto.id && (
                            <span className="px-2 py-0.5 bg-sky-600 text-white text-xs font-medium rounded-full whitespace-nowrap">
                              Seleccionado
                            </span>
                          )}
                        </div>
                        {proyecto.tramo && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <p className="text-xs text-gray-600">
                              <span className="font-medium">Tramo:</span> {proyecto.tramo}
                            </p>
                          </div>
                        )}
                        {proyecto.beneficiario && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-xs text-gray-600 truncate">
                              <span className="font-medium">Beneficiario:</span> {proyecto.beneficiario}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Usuarios del Proyecto Seleccionado */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            {!proyectoSeleccionado ? (
              <div className="p-12 text-center flex-1 flex items-center justify-center">
                <div>
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Selecciona un proyecto</p>
                  <p className="text-xs text-gray-500">Elige un proyecto de la lista para ver sus usuarios asignados</p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-200 px-6 py-4 flex-shrink-0 border-b border-gray-300">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Usuarios asignados
                    </h2>
                    <Button
                      onClick={() => setShowAsignarModal(true)}
                      variant="outline"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      Asignar usuarios
                    </Button>
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-3 border border-gray-300">
                    <p className="text-sm font-semibold text-gray-900">
                      {proyectoSeleccionado.nombre || 'Proyecto sin nombre'}
                    </p>
                    {proyectoSeleccionado.tramo && (
                      <p className="text-xs text-gray-600 mt-1">
                        Tramo: {proyectoSeleccionado.tramo}
                      </p>
                    )}
                  </div>
                  {/* Buscador de usuarios */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Buscar usuario..."
                      value={searchUsuario}
                      onChange={(e) => setSearchUsuario(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">

                {loadingUsuarios ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="mt-3 text-sm font-medium text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : usuariosProyecto.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">No hay usuarios asignados</p>
                    <p className="text-xs text-gray-500">Haz clic en "Asignar usuarios" para agregar usuarios al proyecto</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-2">
                    {usuariosProyecto
                      .filter(usuario => {
                        if (!searchUsuario.trim()) return true
                        const searchLower = searchUsuario.toLowerCase()
                        return (
                          (usuario.first_name && usuario.first_name.toLowerCase().includes(searchLower)) ||
                          (usuario.last_name && usuario.last_name.toLowerCase().includes(searchLower)) ||
                          (usuario.email && usuario.email.toLowerCase().includes(searchLower)) ||
                          (usuario.username && usuario.username.toLowerCase().includes(searchLower))
                        )
                      })
                      .map((usuario) => (
                      <div
                        key={usuario.id}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:bg-sky-50 hover:border-sky-600 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center flex-shrink-0 shadow-md">
                              <span className="text-sm font-bold text-white">
                                {(usuario.first_name || usuario.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {usuario.first_name && usuario.last_name
                                  ? `${usuario.first_name} ${usuario.last_name}`
                                  : usuario.first_name || usuario.email || 'Usuario'}
                              </p>
                              <p className="text-xs text-gray-600 truncate">{usuario.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoverUsuario(usuario.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            title="Remover usuario del proyecto"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {usuariosProyecto.filter(usuario => {
                      if (!searchUsuario.trim()) return false
                      const searchLower = searchUsuario.toLowerCase()
                      return (
                        (usuario.first_name && usuario.first_name.toLowerCase().includes(searchLower)) ||
                        (usuario.last_name && usuario.last_name.toLowerCase().includes(searchLower)) ||
                        (usuario.email && usuario.email.toLowerCase().includes(searchLower)) ||
                        (usuario.username && usuario.username.toLowerCase().includes(searchLower))
                      )
                    }).length === 0 && searchUsuario.trim() && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-10 h-10 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-sm font-medium">No se encontraron usuarios</p>
                        <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Asignar usuarios */}
      {showAsignarModal && proyectoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gray-200 px-6 py-4 flex items-center justify-between border-b border-gray-300">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Asignar usuarios al proyecto
              </h3>
              <button
                onClick={() => {
                  setShowAsignarModal(false)
                  setUsuariosSeleccionados([])
                  setSearchUsuarioModal('')
                }}
                className="text-gray-600 hover:bg-gray-300 rounded-lg p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-gray-600 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-900">
                    {proyectoSeleccionado.nombre || 'Proyecto sin nombre'}
                  </p>
                </div>
                {proyectoSeleccionado.tramo && (
                  <p className="text-xs text-gray-600 ml-6">
                    Tramo: {proyectoSeleccionado.tramo}
                  </p>
                )}
              </div>

              {/* Buscador de usuarios en el modal */}
              <div className="mb-6 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar usuario para agregar..."
                  value={searchUsuarioModal}
                  onChange={(e) => setSearchUsuarioModal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
                />
              </div>

              {usuariosDisponibles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No hay usuarios disponibles</p>
                  <p className="text-xs text-gray-500">Todos los usuarios ya están asignados a este proyecto</p>
                </div>
              ) : usuariosDisponiblesFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No se encontraron usuarios</p>
                  <p className="text-xs text-gray-500">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-4">
                    Selecciona los usuarios que deseas asignar al proyecto:
                  </p>
                  <div className="space-y-3 pr-2">
                    {usuariosDisponiblesFiltrados.map((usuario) => (
                      <label
                        key={usuario.id}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          usuariosSeleccionados.includes(usuario.id)
                            ? 'border-sky-700 bg-sky-700/10 shadow-sm'
                            : 'border-gray-200 hover:bg-sky-50 hover:border-sky-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={usuariosSeleccionados.includes(usuario.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUsuariosSeleccionados([...usuariosSeleccionados, usuario.id])
                            } else {
                              setUsuariosSeleccionados(usuariosSeleccionados.filter(id => id !== usuario.id))
                            }
                          }}
                          className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-sm font-bold text-white">
                            {(usuario.first_name || usuario.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {usuario.first_name && usuario.last_name
                              ? `${usuario.first_name} ${usuario.last_name}`
                              : usuario.first_name || usuario.email || 'Usuario'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{usuario.email}</p>
                        </div>
                        {usuariosSeleccionados.includes(usuario.id) && (
                          <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => {
                  setShowAsignarModal(false)
                  setUsuariosSeleccionados([])
                  setSearchUsuarioModal('')
                }}
                variant="ghost"
                className="flex-1 text-gray-600 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAsignarUsuarios}
                variant="outline"
                className="flex-1"
                disabled={usuariosSeleccionados.length === 0}
              >
                Asignar {usuariosSeleccionados.length > 0 ? `(${usuariosSeleccionados.length})` : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUsuariosProyectos

