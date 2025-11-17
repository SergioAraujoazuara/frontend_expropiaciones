import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import userService from '../../services/userService'
import proyectoService from '../../services/proyectoService'
import Button from '../ui/Button'
import { Link } from 'react-router-dom'

function GestionProyectos() {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [proyectos, setProyectos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchProyecto, setSearchProyecto] = useState('')
  
  // Estados para modales
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
  const [proyectoAEliminar, setProyectoAEliminar] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tramo: '',
    subtramo: '',
    clave: '',
    beneficiario: '',
    contrato: '',
    fecha_inicio: '',
    estado: 'activo',
    responsable: '',
    observaciones: ''
  })

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
        setError('No tienes permisos para acceder a esta sección. Solo los administradores pueden gestionar proyectos.')
        setLoading(false)
        return
      }

      await loadProyectos()
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
      const proyectosData = await proyectoService.listProyectos()
      setProyectos(proyectosData)
    } catch (err) {
      setError(err.message || 'Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const handleNuevoProyecto = () => {
    setProyectoSeleccionado(null)
    setIsEditing(false)
    setFormData({
      nombre: '',
      tramo: '',
      subtramo: '',
      clave: '',
      beneficiario: '',
      contrato: '',
      fecha_inicio: '',
      estado: 'activo',
      responsable: '',
      observaciones: ''
    })
    setShowModal(true)
  }

  const handleEditarProyecto = (proyecto) => {
    setProyectoSeleccionado(proyecto)
    setIsEditing(true)
    setFormData({
      nombre: proyecto.nombre || '',
      tramo: proyecto.tramo || '',
      subtramo: proyecto.subtramo || '',
      clave: proyecto.clave || '',
      beneficiario: proyecto.beneficiario || '',
      contrato: proyecto.contrato || '',
      fecha_inicio: proyecto.fecha_inicio ? proyecto.fecha_inicio.split('T')[0] : '',
      estado: proyecto.estado || 'activo',
      responsable: proyecto.responsable || '',
      observaciones: proyecto.observaciones || ''
    })
    setShowModal(true)
  }

  const handleEliminarProyecto = (proyecto) => {
    setProyectoAEliminar(proyecto)
    setShowDeleteModal(true)
  }

  const confirmarEliminarProyecto = async () => {
    if (!proyectoAEliminar) return

    try {
      setError('')
      setSuccess('')
      await proyectoService.deleteProyecto(proyectoAEliminar.id)
      setSuccess('Proyecto eliminado exitosamente')
      setShowDeleteModal(false)
      setProyectoAEliminar(null)
      await loadProyectos()
    } catch (err) {
      setError(err.message || 'Error al eliminar proyecto')
      setShowDeleteModal(false)
      setProyectoAEliminar(null)
    }
  }

  const handleGuardarProyecto = async () => {
    // Validación básica
    if (!formData.nombre || !formData.tramo || !formData.clave || !formData.beneficiario || !formData.fecha_inicio) {
      setError('Por favor, completa todos los campos obligatorios')
      return
    }

    try {
      setError('')
      setSuccess('')

      if (isEditing && proyectoSeleccionado) {
        await proyectoService.updateProyecto(proyectoSeleccionado.id, formData)
        setSuccess('Proyecto actualizado exitosamente')
      } else {
        await proyectoService.createProyecto(formData)
        setSuccess('Proyecto creado exitosamente')
      }

      setShowModal(false)
      setProyectoSeleccionado(null)
      setIsEditing(false)
      await loadProyectos()
    } catch (err) {
      setError(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} proyecto`)
    }
  }

  const getEstadoColor = (estado) => {
    const colors = {
      'activo': 'bg-green-100 text-green-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'finalizado': 'bg-gray-100 text-gray-800'
    }
    return colors[estado] || colors['activo']
  }

  const proyectosFiltrados = proyectos.filter(proyecto => {
    if (!searchProyecto.trim()) return true
    const searchLower = searchProyecto.toLowerCase()
    return (
      (proyecto.nombre && proyecto.nombre.toLowerCase().includes(searchLower)) ||
      (proyecto.tramo && proyecto.tramo.toLowerCase().includes(searchLower)) ||
      (proyecto.clave && proyecto.clave.toLowerCase().includes(searchLower)) ||
      (proyecto.beneficiario && proyecto.beneficiario.toLowerCase().includes(searchLower))
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de proyectos
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Crea, edita y elimina proyectos del sistema
                </p>
              </div>
            </div>
            <Button
              onClick={handleNuevoProyecto}
              variant="outline"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Nuevo proyecto
            </Button>
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

        {/* Lista de proyectos */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-200 px-6 py-4 flex-shrink-0 border-b border-gray-300">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Proyectos
              </h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} registrado{proyectos.length !== 1 ? 's' : ''}
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
            {proyectosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">No se encontraron proyectos</p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchProyecto.trim() ? 'Intenta con otro término de búsqueda' : 'Crea tu primer proyecto'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {proyectosFiltrados.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {proyecto.nombre || 'Proyecto sin nombre'}
                            </p>
                            {proyecto.tramo && (
                              <span className="text-xs text-gray-600">- {proyecto.tramo}</span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(proyecto.estado)}`}>
                              {proyecto.estado || 'activo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 flex-wrap">
                            {proyecto.clave && (
                              <span className="text-xs text-gray-600">
                                Clave: <span className="text-gray-800 font-semibold">{proyecto.clave}</span>
                              </span>
                            )}
                            {proyecto.beneficiario && (
                              <span className="text-xs text-gray-600">
                                Beneficiario: <span className="text-gray-800 font-semibold">{proyecto.beneficiario}</span>
                              </span>
                            )}
                            {proyecto.fecha_inicio && (
                              <span className="text-xs text-gray-600">
                                Inicio: <span className="text-gray-800 font-semibold">{proyecto.fecha_inicio.split('T')[0]}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/proyectos/${proyecto.id}/fincas`}>
                          <Button
                            variant="solid"
                            className="text-xs"
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            }
                          >
                            Ver fincas
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleEditarProyecto(proyecto)}
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
                          onClick={() => handleEliminarProyecto(proyecto)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar proyecto"
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
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear/editar proyecto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gray-200 px-6 py-4 flex items-center justify-between border-b border-gray-300">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setProyectoSeleccionado(null)
                  setIsEditing(false)
                }}
                className="text-gray-600 hover:bg-gray-300 rounded-lg p-1 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del proyecto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Nombre del proyecto"
                  />
                </div>

                {/* Tramo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tramo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tramo}
                    onChange={(e) => setFormData({ ...formData, tramo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Tramo"
                  />
                </div>

                {/* Subtramo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtramo
                  </label>
                  <input
                    type="text"
                    value={formData.subtramo}
                    onChange={(e) => setFormData({ ...formData, subtramo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Subtramo"
                  />
                </div>

                {/* Clave */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clave <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clave}
                    onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Clave"
                  />
                </div>

                {/* Beneficiario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiario <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.beneficiario}
                    onChange={(e) => setFormData({ ...formData, beneficiario: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Beneficiario"
                  />
                </div>

                {/* Contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contrato
                  </label>
                  <input
                    type="text"
                    value={formData.contrato}
                    onChange={(e) => setFormData({ ...formData, contrato: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Contrato"
                  />
                </div>

                {/* Fecha de inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Responsable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Responsable"
                  />
                </div>

                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Observaciones"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => {
                  setShowModal(false)
                  setProyectoSeleccionado(null)
                  setIsEditing(false)
                }}
                variant="ghost"
                className="flex-1 text-gray-600 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGuardarProyecto}
                variant="outline"
                className="flex-1"
              >
                {isEditing ? 'Guardar cambios' : 'Crear proyecto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar proyecto */}
      {showDeleteModal && proyectoAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Confirmar eliminación
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                ¿Estás seguro de que quieres eliminar el proyecto <span className="font-semibold text-gray-900">"{proyectoAEliminar.nombre || 'sin nombre'}"</span>?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-xs text-gray-600 mb-1">Esta acción no se puede deshacer.</p>
                {proyectoAEliminar.clave && (
                  <p className="text-xs text-gray-600">Clave: <span className="font-medium">{proyectoAEliminar.clave}</span></p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <Button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProyectoAEliminar(null)
                }}
                variant="ghost"
                className="flex-1 text-gray-600 border border-gray-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEliminarProyecto}
                variant="solid"
                className="flex-1 bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 text-white"
              >
                Eliminar proyecto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestionProyectos

