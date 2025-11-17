import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService'

const NavbarLateral = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  
  const [dropdownUserOpen, setDropdownUserOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const [configMenuOpen, setConfigMenuOpen] = useState(false)
  const userRef = useRef(null)

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      try {
        // Obtener información completa del usuario desde el backend
        const userInfo = await userService.getPersonalInfo()
        
        // Verificar si es administrador
        const admin = userInfo?.is_superuser || 
                      userInfo?.role === 'administrador' ||
                      (userInfo?.groups && userInfo.groups.some(g => g.name === 'administrador'))
        
        setIsAdmin(admin)
      } catch (error) {
        console.error('Error verificando rol de administrador:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Obtener nombre y rol del usuario
  const userNombre = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.first_name || user?.email || 'Usuario'
  
  // Obtener rol del usuario (puedes ajustar esto según tu modelo de usuario)
  const userRol = user?.groups?.[0] || user?.role || 'Usuario'

  const closeAllDropdowns = () => {
    setDropdownUserOpen(false)
    setAdminMenuOpen(false)
    setConfigMenuOpen(false)
  }

  const isActive = (path) => {
    if (path === '/home' || path === '/') {
      return location.pathname === '/home' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLinkClick = (options = {}) => {
    const { keepAdminOpen = false, keepConfigOpen = false } = options

    if (!keepAdminOpen && !keepConfigOpen) {
      closeAllDropdowns()
      return
    }

    if (keepAdminOpen) {
      setAdminMenuOpen(true)
    } else {
      setAdminMenuOpen(false)
    }

    if (keepConfigOpen) {
      setConfigMenuOpen(true)
    } else {
      setConfigMenuOpen(false)
    }

    setDropdownUserOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      setShowLogoutConfirmation(false)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col flex-shrink-0 h-screen">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center border-b border-slate-700 px-4 py-4 flex-shrink-0">
        <img 
          src="/logo_blanco.png" 
          alt="Logo Expropiaciones" 
          className="w-auto h-14 object-contain mb-2"
        />
        <h1 className="text-md font-medium text-white px-2">App expropiaciones</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* Inicio */}
        <Link
          to="/home"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
            isActive('/home') 
              ? 'bg-slate-700 text-white' 
              : 'hover:bg-slate-700 text-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-medium">Inicio</span>
        </Link>

        {/* Expropiaciones */}
        <Link
          to="/ver-expropiaciones"
          onClick={handleLinkClick}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
            isActive('/ver-expropiaciones') 
              ? 'bg-slate-700 text-white' 
              : 'hover:bg-slate-700 text-slate-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-sm font-medium">Expropiaciones</span>
        </Link>

        {/* Configuración - Solo visible para administradores */}
        {user && isAdmin && (
          <div className="space-y-1">
            <button
              onClick={() => {
                setConfigMenuOpen(!configMenuOpen)
                setDropdownUserOpen(false)
                setAdminMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive('/gestion-proyectos')
                  ? 'bg-slate-700 text-white' 
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Configuración</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${configMenuOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Submenú de Configuración */}
            {configMenuOpen && (
              <div className="ml-4 space-y-1">
                <Link
                  to="/gestion-proyectos"
                  onClick={() => handleLinkClick({ keepConfigOpen: true })}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/gestion-proyectos') 
                      ? 'bg-slate-600 text-white' 
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">Gestión de proyectos</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Administración - Solo visible para administradores */}
        {user && isAdmin && (
          <div className="space-y-1">
            <button
              onClick={() => {
                setAdminMenuOpen(!adminMenuOpen)
                setDropdownUserOpen(false)
                setConfigMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive('/gestion-usuarios-proyectos') || isActive('/gestion-roles')
                  ? 'bg-slate-700 text-white' 
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Administración</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Submenú de Administración */}
            {adminMenuOpen && (
              <div className="ml-4 space-y-1">
                <Link
                  to="/gestion-usuarios-proyectos"
                  onClick={() => handleLinkClick({ keepAdminOpen: true })}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/gestion-usuarios-proyectos') 
                      ? 'bg-slate-600 text-white' 
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">Gestión de usuarios</span>
                </Link>
                <Link
                  to="/gestion-roles"
                  onClick={() => handleLinkClick({ keepAdminOpen: true })}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/gestion-roles') 
                      ? 'bg-slate-600 text-white' 
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-medium">Gestión de roles</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              closeAllDropdowns()
              setDropdownUserOpen(!dropdownUserOpen)
            }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors hover:bg-slate-700 text-slate-300"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-base font-semibold text-white">
                {userNombre.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium truncate">{userNombre}</div>
              <div className="text-xs text-slate-400 truncate">{userRol}</div>
            </div>
            <svg 
              className={`w-3 h-3 transition-transform flex-shrink-0 ${dropdownUserOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownUserOpen && (
            <div className="mt-2 bg-slate-700 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  setShowLogoutConfirmation(true)
                  setDropdownUserOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar cierre de sesión</h3>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirmation(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default NavbarLateral

