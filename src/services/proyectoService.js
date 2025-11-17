import api from '../utils/api'

/**
 * Servicio para gestión de proyectos
 * 
 * Proporciona métodos para gestionar proyectos del sistema,
 * incluyendo crear, listar, actualizar y eliminar proyectos.
 */
class ProyectoService {
  /**
   * Lista todos los proyectos
   * 
   * @returns {Promise<Array>} Lista de proyectos
   */
  async listProyectos() {
    try {
      const response = await api.get('/api/proyectos/')
      return response.results || response || []
    } catch (error) {
      console.error('Error listando proyectos:', error)
      throw new Error(error.message || 'Error al listar proyectos')
    }
  }

  /**
   * Obtiene un proyecto específico
   * 
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Object>} Información del proyecto
   */
  async getProyecto(proyectoId) {
    try {
      const response = await api.get(`/api/proyectos/${proyectoId}/`)
      return response
    } catch (error) {
      console.error('Error obteniendo proyecto:', error)
      throw new Error(error.message || 'Error al obtener proyecto')
    }
  }

  /**
   * Crea un nuevo proyecto
   * 
   * @param {Object} proyectoData - Datos del proyecto
   * @returns {Promise<Object>} Proyecto creado
   */
  async createProyecto(proyectoData) {
    try {
      const response = await api.post('/api/proyectos/', proyectoData)
      return response
    } catch (error) {
      console.error('Error creando proyecto:', error)
      throw new Error(error.message || 'Error al crear proyecto')
    }
  }

  /**
   * Actualiza un proyecto existente
   * 
   * @param {number} proyectoId - ID del proyecto
   * @param {Object} proyectoData - Datos actualizados del proyecto
   * @returns {Promise<Object>} Proyecto actualizado
   */
  async updateProyecto(proyectoId, proyectoData) {
    try {
      const response = await api.put(`/api/proyectos/${proyectoId}/`, proyectoData)
      return response
    } catch (error) {
      console.error('Error actualizando proyecto:', error)
      throw new Error(error.message || 'Error al actualizar proyecto')
    }
  }

  /**
   * Actualiza parcialmente un proyecto existente
   * 
   * @param {number} proyectoId - ID del proyecto
   * @param {Object} proyectoData - Datos parciales del proyecto
   * @returns {Promise<Object>} Proyecto actualizado
   */
  async patchProyecto(proyectoId, proyectoData) {
    try {
      const response = await api.patch(`/api/proyectos/${proyectoId}/`, proyectoData)
      return response
    } catch (error) {
      console.error('Error actualizando proyecto:', error)
      throw new Error(error.message || 'Error al actualizar proyecto')
    }
  }

  /**
   * Elimina un proyecto
   * 
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteProyecto(proyectoId) {
    try {
      const response = await api.delete(`/api/proyectos/${proyectoId}/`)
      return response
    } catch (error) {
      console.error('Error eliminando proyecto:', error)
      throw new Error(error.message || 'Error al eliminar proyecto')
    }
  }
}

export default new ProyectoService()

