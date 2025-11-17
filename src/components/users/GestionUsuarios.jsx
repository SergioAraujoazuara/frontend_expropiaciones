import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService'

function GestionUsuarios() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estados para filtros
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [roleFilter, setRoleFilter] = useState('Todos')
  
  // Estados para modales
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Datos del nuevo usuario
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
    role: 'visualizador',
    status: 'Activo'
  })

  // Cargar usuarios y roles
  useEffect(() => {
    // Verificar que el usuario sea administrador
    const isAdmin = currentUser?.is_superuser || 
                    (currentUser?.groups && currentUser.groups.some(g => g.name === 'administrador'))
    
    if (!isAdmin) {
      navigate('/home')
      return
    }

    loadUsers()
    loadRoles()
  }, [currentUser, navigate])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const usersData = await userService.listUsers()
      setUsers(usersData)
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const rolesData = await userService.listRoles()
      setRoles(rolesData)
    } catch (err) {
      console.error('Error cargando roles:', err)
    }
  }

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const statusMatch = statusFilter === 'Todos' || 
      (statusFilter === 'Activo' && user.is_active) ||
      (statusFilter === 'Inactivo' && !user.is_active)
    const roleMatch = roleFilter === 'Todos' || user.role === roleFilter
    return statusMatch && roleMatch
  })

  // Cambiar estado de usuario
  const toggleUserStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId)
      if (user.is_active) {
        await userService.deactivateUser(userId)
      } else {
        await userService.activateUser(userId)
      }
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Error al cambiar estado del usuario')
    }
  }

  // Cambiar rol de usuario
  const changeUserRole = async (newRole) => {
    if (!editingUser) return
    
    try {
      await userService.assignRole(editingUser.id, newRole)
      await loadUsers()
      setShowRoleModal(false)
      setEditingUser(null)
    } catch (err) {
      setError(err.message || 'Error al cambiar rol')
    }
  }

  // Abrir modal para cambiar rol
  const openRoleModal = (user) => {
    setEditingUser(user)
    setShowRoleModal(true)
  }

  // Abrir modal para agregar usuario
  const openAddUserModal = () => {
    setNewUser({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirm: '',
      role: 'visualizador',
      status: 'Activo'
    })
    setShowAddUserModal(true)
  }

  // Agregar nuevo usuario (usando el endpoint de registro)
  const addNewUser = async () => {
    if (!newUser.first_name.trim() || !newUser.last_name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    if (newUser.password !== newUser.password_confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setError('')
      // Usar el servicio de autenticación para registrar
      const { authService } = await import('../../services/authService')
      const result = await authService.registerLocal({
        email: newUser.email,
        password: newUser.password,
        password_confirm: newUser.password_confirm,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      })

      // Si se asignó un rol, asignarlo después
      if (newUser.role && newUser.role !== 'visualizador' && result.user?.id) {
        try {
          await userService.assignRole(result.user.id, newUser.role)
        } catch (roleError) {
          console.warn('Error asignando rol al usuario recién creado:', roleError)
          // No fallar el registro si el rol falla, solo mostrar advertencia
        }
      }

      setShowAddUserModal(false)
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirm: '',
        role: 'visualizador',
        status: 'Activo'
      })
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Error al agregar usuario')
    }
  }

  // Mapear roles a nombres más legibles
  const roleNames = {
    'administrador': 'Administrador',
    'tecnico': 'Técnico',
    'visualizador': 'Visualizador',
    'sin_rol': 'Sin Rol'
  }

  // Obtener permisos por rol
  const getRolePermissions = (roleKey) => {
    const permissions = {
      'administrador': ['Ver todo', 'Editar todo', 'Eliminar usuarios', 'Gestionar roles'],
      'tecnico': ['Ver datos', 'Editar datos', 'Crear reportes'],
      'visualizador': ['Ver datos', 'Exportar reportes'],
      'sin_rol': []
    }
    return permissions[roleKey] || []
  }

  if (loading) {
    return (
      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sistema de Gestión de Usuarios */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Lista de Usuarios
                </h3>
                <button 
                  onClick={openAddUserModal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Usuario
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm rounded-r-lg">
                  {error}
                </div>
              )}

              {/* Filtros */}
              <div className="flex gap-4 mb-6">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-xs"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Activo">Activos</option>
                  <option value="Inactivo">Inactivos</option>
                </select>
                
                <select 
                  value={roleFilter} 
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-xs"
                >
                  <option value="Todos">Todos los roles</option>
                  {roles.map(role => (
                    <option key={role.key} value={role.key}>{roleNames[role.key] || role.key}</option>
                  ))}
                </select>
              </div>

              {/* Lista de Usuarios */}
              <div className="space-y-3">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No hay usuarios que coincidan con los filtros
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 font-semibold text-sm">
                            {user.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.email
                            }
                          </h4>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                          {roleNames[user.role] || user.role || 'Sin Rol'}
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleUserStatus(user.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title={user.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {user.is_active ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                          <button 
                            onClick={() => openRoleModal(user)}
                            className="p-2 text-gray-500 hover:text-green-600 transition-colors" 
                            title="Cambiar Rol"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel de Roles y Permisos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Roles y Permisos
              </h3>
              
              <div className="space-y-4">
                {roles.map(role => (
                  <div key={role.key} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {roleNames[role.key] || role.name || role.key}
                    </h4>
                    <ul className="space-y-1">
                      {getRolePermissions(role.key).map((permission, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar rol */}
      {showRoleModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                Cambiar Rol de Usuario
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setEditingUser(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2 text-xs">
                <strong>Usuario:</strong> {editingUser.first_name && editingUser.last_name 
                  ? `${editingUser.first_name} ${editingUser.last_name}`
                  : editingUser.email}
              </p>
              <p className="text-gray-600 mb-4 text-xs">
                <strong>Email:</strong> {editingUser.email}
              </p>
              <p className="text-gray-600 mb-4 text-xs">
                <strong>Rol actual:</strong> 
                <span className="ml-2 px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-medium">
                  {roleNames[editingUser.role] || editingUser.role || 'Sin Rol'}
                </span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Seleccionar nuevo rol:
              </label>
              <div className="space-y-2">
                {roles.map(role => (
                  <label key={role.key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role.key}
                      defaultChecked={role.key === editingUser.role}
                      className="mr-3 text-sky-600 focus:ring-sky-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{roleNames[role.key] || role.name || role.key}</div>
                      <div className="text-xs text-gray-600">
                        {getRolePermissions(role.key).slice(0, 2).join(', ')}
                        {getRolePermissions(role.key).length > 2 && '...'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setEditingUser(null)
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const selectedRole = document.querySelector('input[name="role"]:checked')?.value
                  if (selectedRole && selectedRole !== editingUser.role) {
                    changeUserRole(selectedRole)
                  } else {
                    setShowRoleModal(false)
                    setEditingUser(null)
                  }
                }}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-xs"
              >
                Cambiar Rol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar usuario */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">
                Agregar Nuevo Usuario
              </h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setNewUser({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    password_confirm: '',
                    role: 'visualizador',
                    status: 'Activo'
                  })
                  setError('')
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
                  placeholder="Ej: María"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
                  placeholder="Ej: García"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
                  placeholder="Ej: maria.garcia@empresa.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={newUser.password_confirm}
                  onChange={(e) => setNewUser({...newUser, password_confirm: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
                  placeholder="Repite la contraseña"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-xs"
                >
                  {roles.map(role => (
                    <option key={role.key} value={role.key}>{roleNames[role.key] || role.name || role.key}</option>
                  ))}
                </select>
              </div>

              {/* Vista previa de permisos del rol seleccionado */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Permisos del rol "{roleNames[newUser.role] || newUser.role}":
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {getRolePermissions(newUser.role).map((permission, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAddUserModal(false)
                  setNewUser({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    password_confirm: '',
                    role: 'visualizador',
                    status: 'Activo'
                  })
                  setError('')
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={addNewUser}
                disabled={!newUser.first_name.trim() || !newUser.last_name.trim() || !newUser.email.trim() || !newUser.password.trim()}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
              >
                Agregar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionUsuarios

