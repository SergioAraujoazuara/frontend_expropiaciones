import api from '../utils/api'

/**
 * Servicio para gestión de usuarios
 * 
 * Proporciona métodos para gestionar usuarios del sistema,
 * incluyendo listar, asignar roles, activar/desactivar usuarios.
 */
class UserService {
  /**
   * Lista todos los usuarios con sus roles
   * 
   * @returns {Promise<Array>} Lista de usuarios
   */
  async listUsers() {
    try {
      const response = await api.get('/api/auth/users/')
      return response.users || []
    } catch (error) {
      console.error('Error listando usuarios:', error)
      throw new Error(error.message || 'Error al listar usuarios')
    }
  }

  /**
   * Obtiene información de un usuario específico
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Información del usuario
   */
  async getUser(userId) {
    try {
      const response = await api.get(`/api/auth/users/${userId}/role/`)
      return response.user
    } catch (error) {
      console.error('Error obteniendo usuario:', error)
      throw new Error(error.message || 'Error al obtener usuario')
    }
  }

  /**
   * Asigna un rol a un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {string} role - Nombre del rol a asignar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async assignRole(userId, role) {
    try {
      const response = await api.post(`/api/auth/users/${userId}/assign-role/`, {
        role: role
      })
      return response.user
    } catch (error) {
      console.error('Error asignando rol:', error)
      throw new Error(error.message || 'Error al asignar rol')
    }
  }

  /**
   * Remueve el rol de un usuario
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  async removeRole(userId) {
    try {
      const response = await api.delete(`/api/auth/users/${userId}/remove-role/`, {
        body: {}
      })
      return response
    } catch (error) {
      console.error('Error removiendo rol:', error)
      throw new Error(error.message || 'Error al remover rol')
    }
  }

  /**
   * Activa un usuario
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  async activateUser(userId) {
    try {
      const response = await api.post(`/api/auth/users/${userId}/activate/`)
      return response.user
    } catch (error) {
      console.error('Error activando usuario:', error)
      throw new Error(error.message || 'Error al activar usuario')
    }
  }

  /**
   * Desactiva un usuario
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  async deactivateUser(userId) {
    try {
      const response = await api.post(`/api/auth/users/${userId}/deactivate/`)
      return response.user
    } catch (error) {
      console.error('Error desactivando usuario:', error)
      throw new Error(error.message || 'Error al desactivar usuario')
    }
  }

  /**
   * Lista todos los roles disponibles
   * 
   * @returns {Promise<Array>} Lista de roles
   */
  async listRoles() {
    try {
      const response = await api.get('/api/auth/roles/')
      return response.roles || []
    } catch (error) {
      console.error('Error listando roles:', error)
      throw new Error(error.message || 'Error al listar roles')
    }
  }

  /**
   * Obtiene información personal del usuario autenticado
   * 
   * @returns {Promise<Object>} Información personal
   */
  async getPersonalInfo() {
    try {
      const response = await api.get('/api/auth/personal-info/')
      return response.user
    } catch (error) {
      console.error('Error obteniendo información personal:', error)
      throw new Error(error.message || 'Error al obtener información personal')
    }
  }

  /**
   * Actualiza información personal del usuario autenticado
   * 
   * @param {Object} data - Datos a actualizar (first_name, last_name, email, username)
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updatePersonalInfo(data) {
    try {
      const response = await api.put('/api/auth/personal-info/', data)
      return response.user
    } catch (error) {
      console.error('Error actualizando información personal:', error)
      throw new Error(error.message || 'Error al actualizar información personal')
    }
  }

  /**
   * Lista proyectos asociados al usuario autenticado
   * Solo devuelve los proyectos a los que el usuario está asignado
   * 
   * @returns {Promise<Array>} Lista de proyectos asignados al usuario
   */
  async getUserProjects() {
    try {
      const response = await api.get('/api/proyectos/mis-proyectos/')
      return response.proyectos || []
    } catch (error) {
      console.error('Error obteniendo proyectos:', error)
      throw new Error(error.message || 'Error al obtener proyectos')
    }
  }

  /**
   * Obtiene todos los usuarios asignados a un proyecto
   * 
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Array>} Lista de usuarios asignados al proyecto
   */
  async getProjectUsers(proyectoId) {
    try {
      const response = await api.get(`/api/proyectos/${proyectoId}/usuarios/`)
      return response.usuarios || []
    } catch (error) {
      console.error('Error obteniendo usuarios del proyecto:', error)
      throw new Error(error.message || 'Error al obtener usuarios del proyecto')
    }
  }

  /**
   * Asigna un proyecto a un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Object>} Resultado de la operación
   */
  async assignProjectToUser(userId, proyectoId) {
    try {
      const response = await api.post(`/api/auth/users/${userId}/asignar-proyecto/`, {
        proyecto_id: proyectoId
      })
      return response
    } catch (error) {
      console.error('Error asignando proyecto:', error)
      throw new Error(error.message || 'Error al asignar proyecto')
    }
  }

  /**
   * Asigna múltiples proyectos a un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {Array<number>} proyectoIds - IDs de los proyectos
   * @returns {Promise<Object>} Resultado de la operación
   */
  async assignProjectsToUser(userId, proyectoIds) {
    try {
      const response = await api.post(`/api/auth/users/${userId}/asignar-proyectos/`, {
        proyecto_ids: proyectoIds
      })
      return response
    } catch (error) {
      console.error('Error asignando proyectos:', error)
      throw new Error(error.message || 'Error al asignar proyectos')
    }
  }

  /**
   * Remueve un proyecto de un usuario
   * 
   * @param {number} userId - ID del usuario
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeProjectFromUser(userId, proyectoId) {
    try {
      const response = await api.delete(`/api/auth/users/${userId}/remover-proyecto/`, {
        body: { proyecto_id: proyectoId }
      })
      return response
    } catch (error) {
      console.error('Error removiendo proyecto:', error)
      throw new Error(error.message || 'Error al remover proyecto')
    }
  }

  /**
   * Remueve múltiples proyectos de un usuario
   *
   * @param {number} userId - ID del usuario
   * @param {Array<number>} proyectoIds - IDs de los proyectos
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeProjectsFromUser(userId, proyectoIds) {
    try {
      const response = await api.delete(`/api/auth/users/${userId}/remover-proyectos/`, {
        body: { proyecto_ids: proyectoIds }
      })
      return response
    } catch (error) {
      console.error('Error removiendo proyectos:', error)
      throw new Error(error.message || 'Error al remover proyectos')
    }
  }

  /**
   * Lista todos los roles disponibles del sistema
   *
   * @returns {Promise<Array>} Lista de roles disponibles
   */
  async listRoles() {
    try {
      const response = await api.get('/api/auth/roles/')
      return response.roles || []
    } catch (error) {
      console.error('Error listando roles:', error)
      throw new Error(error.message || 'Error al listar roles')
    }
  }

  /**
   * Obtiene información de un rol específico
   *
   * @param {string} roleName - Nombre del rol
   * @returns {Promise<Object>} Información del rol
   */
  async getRoleInfo(roleName) {
    try {
      const response = await api.get(`/api/auth/roles/${roleName}/`)
      return response.role || null
    } catch (error) {
      console.error('Error obteniendo información del rol:', error)
      throw new Error(error.message || 'Error al obtener información del rol')
    }
  }

  /**
   * Lista todos los usuarios con sus roles asignados
   *
   * @returns {Promise<Array>} Lista de usuarios con roles
   */
  async listUsersWithRoles() {
    try {
      const response = await api.get('/api/auth/users/')
      return response.users || []
    } catch (error) {
      console.error('Error listando usuarios con roles:', error)
      throw new Error(error.message || 'Error al listar usuarios con roles')
    }
  }

  /**
   * Obtiene el rol de un usuario específico
   *
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Información del usuario con su rol
   */
  async getUserRole(userId) {
    try {
      const response = await api.get(`/api/auth/users/${userId}/role/`)
      return response.user || null
    } catch (error) {
      console.error('Error obteniendo rol del usuario:', error)
      throw new Error(error.message || 'Error al obtener rol del usuario')
    }
  }

  /**
   * Asigna un rol a un usuario
   *
   * @param {number} userId - ID del usuario
   * @param {string} roleName - Nombre del rol a asignar
   * @returns {Promise<Object>} Resultado de la operación
   */
  async assignRole(userId, roleName) {
    try {
      const response = await api.post(`/api/auth/users/${userId}/assign-role/`, {
        role: roleName
      })
      return response
    } catch (error) {
      console.error('Error asignando rol:', error)
      throw new Error(error.message || 'Error al asignar rol')
    }
  }

  /**
   * Remueve el rol de un usuario
   *
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Resultado de la operación
   */
  async removeRole(userId) {
    try {
      const response = await api.delete(`/api/auth/users/${userId}/remove-role/`, {
        body: {}
      })
      return response
    } catch (error) {
      console.error('Error removiendo rol:', error)
      throw new Error(error.message || 'Error al remover rol')
    }
  }

  /**
   * Obtiene estadísticas de roles del sistema
   *
   * @returns {Promise<Object>} Estadísticas de roles
   */
  async getRoleStats() {
    try {
      const response = await api.get('/api/auth/roles/stats/')
      return response.stats || null
    } catch (error) {
      console.error('Error obteniendo estadísticas de roles:', error)
      throw new Error(error.message || 'Error al obtener estadísticas de roles')
    }
  }
}

// Exportar instancia única
export const userService = new UserService()
export default userService

