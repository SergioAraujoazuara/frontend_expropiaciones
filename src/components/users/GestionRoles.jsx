import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService'
import Button from '../ui/Button'

function GestionRoles() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchUsuario, setSearchUsuario] = useState('')
  const [showAsignarModal, setShowAsignarModal] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [rolSeleccionado, setRolSeleccionado] = useState('')

  useEffect(() => {
    checkPermissionsAndLoad()
  }, [currentUser, navigate])

  const checkPermissionsAndLoad = async () => {
    try {
      const userInfo = await userService.getPersonalInfo()
      const isAdmin = userInfo?.is_superuser ||
                      userInfo?.role === 'administrador' ||
                      (userInfo?.groups && userInfo.groups.some(g => g.name === 'administrador'))

      if (!isAdmin) {
        setError('No tienes permisos para acceder a esta sección. Solo los administradores pueden gestionar roles.')
        setLoading(false)
        return
      }

      await loadData()
    } catch (err) {
      console.error('Error verificando permisos:', err)
      setError('Error al verificar permisos. Por favor, intenta nuevamente.')
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [usersData, rolesData] = await Promise.all([
        userService.listUsersWithRoles(),
        userService.listRoles()
      ])
      
      setUsuarios(usersData)
      setRoles(rolesData)
    } catch (err) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleAsignarRol = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setRolSeleccionado(usuario.role || '')
    setShowAsignarModal(true)
  }

  const handleGuardarRol = async () => {
    if (!usuarioSeleccionado || !rolSeleccionado) {
      setError('Debes seleccionar un rol')
      return
    }

    try {
      setError('')
      setSuccess('')

      await userService.assignRole(usuarioSeleccionado.id, rolSeleccionado)

      setSuccess(`Rol asignado exitosamente al usuario`)
      setShowAsignarModal(false)
      setUsuarioSeleccionado(null)
      setRolSeleccionado('')

      await loadData()
    } catch (err) {
      setError(err.message || 'Error al asignar rol')
    }
  }

  const getRoleDisplayName = (roleKey) => {
    const role = roles.find(r => r.key === roleKey)
    return role ? role.name : roleKey || 'Sin rol'
  }

  const getRoleColor = (roleKey) => {
    return 'bg-gray-100 text-gray-800'
  }

  const usuariosFiltrados = usuarios.filter(usuario => {
    if (!searchUsuario.trim()) return true
    const searchLower = searchUsuario.toLowerCase()
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
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
                Gestión de roles
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Asigna y gestiona roles de usuarios en el sistema
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

        {/* Lista de usuarios con roles */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-200 px-6 py-4 flex-shrink-0 border-b border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuarios y roles
              </h2>
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
            {usuarios.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-sm font-medium">No hay usuarios disponibles</p>
                <p className="text-xs text-gray-400 mt-1">Los usuarios aparecerán aquí cuando estén disponibles</p>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">No se encontraron usuarios</p>
                <p className="text-xs text-gray-400 mt-1">Intenta con otro término de búsqueda</p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {usuariosFiltrados.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1">
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
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(usuario.role)}`}>
                            {getRoleDisplayName(usuario.role)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleAsignarRol(usuario)}
                          variant="outline"
                          className="text-xs"
                          icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          }
                        >
                          {usuario.role ? 'Cambiar rol' : 'Asignar rol'}
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

      {/* Modal para asignar/cambiar rol */}
      {showAsignarModal && usuarioSeleccionado && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gray-200 px-6 py-4 flex items-center justify-between border-b border-gray-300">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {usuarioSeleccionado.role ? 'Cambiar rol' : 'Asignar rol'}
              </h3>
              <button
                onClick={() => {
                  setShowAsignarModal(false)
                  setUsuarioSeleccionado(null)
                  setRolSeleccionado('')
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
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {usuarioSeleccionado.first_name && usuarioSeleccionado.last_name
                    ? `${usuarioSeleccionado.first_name} ${usuarioSeleccionado.last_name}`
                    : usuarioSeleccionado.first_name || usuarioSeleccionado.email || 'Usuario'}
                </p>
                <p className="text-xs text-gray-600">{usuarioSeleccionado.email}</p>
                {usuarioSeleccionado.role && (
                  <p className="text-xs text-gray-500 mt-2">
                    Rol actual: <span className="font-medium">{getRoleDisplayName(usuarioSeleccionado.role)}</span>
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona un rol:
                </label>
                <div className="space-y-2">
                  {roles.map((rol) => (
                    <label
                      key={rol.key}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        rolSeleccionado === rol.key
                          ? 'border-sky-500 bg-sky-50 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-sky-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rol"
                        value={rol.key}
                        checked={rolSeleccionado === rol.key}
                        onChange={(e) => setRolSeleccionado(e.target.value)}
                        className="w-5 h-5 text-sky-600 border-gray-300 focus:ring-2 focus:ring-sky-500 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{rol.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {rol.key === 'administrador' && 'Puede administrar toda la aplicación, incluidos usuarios y permisos.'}
                          {rol.key === 'tecnico' && 'Puede crear, editar y eliminar información de proyectos y fincas.'}
                          {rol.key === 'visualizador' && 'Solo puede consultar la información, sin realizar cambios.'}
                          {!['administrador', 'tecnico', 'visualizador'].includes(rol.key) && rol.description}
                        </p>
                      </div>
                      {rolSeleccionado === rol.key && (
                        <svg className="w-5 h-5 text-sky-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => {
                  setShowAsignarModal(false)
                  setUsuarioSeleccionado(null)
                  setRolSeleccionado('')
                }}
                variant="ghost"
                className="flex-1 text-gray-600 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarRol}
                variant="outline"
                className="flex-1"
                disabled={!rolSeleccionado}
              >
                {usuarioSeleccionado?.role ? 'Cambiar rol' : 'Asignar rol'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionRoles

