import api from '../utils/api'

/**
 * Servicio para gestión de fichas de campo
 * Proporciona métodos para gestionar fichas de campo de parcelas y construcciones
 */
class FichaCampoService {
  /**
   * Lista todas las fichas de campo de parcela
   * 
   * @param {Object} filters - Filtros opcionales (proyecto, finca, search, etc.)
   * @returns {Promise<Array>} Lista de fichas de campo
   */
  async listFichasCampoParcela(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.proyecto) params.append('proyecto_id', filters.proyecto)
      if (filters.finca) params.append('finca_id', filters.finca)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page)
      if (filters.page_size) params.append('page_size', filters.page_size)

      const queryString = params.toString()
      const url = `/api/fichas-campo-parcela/${queryString ? `?${queryString}` : ''}`
      const response = await api.get(url)
      return response.data || response.results || response || []
    } catch (error) {
      console.error('Error listando fichas de campo parcela:', error)
      throw new Error(error.message || 'Error al listar fichas de campo')
    }
  }

  /**
   * Obtiene una ficha de campo de parcela específica
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @returns {Promise<Object>} Información de la ficha
   */
  async getFichaCampoParcela(fichaId) {
    try {
      const response = await api.get(`/api/fichas-campo-parcela/${fichaId}/`)
      return response
    } catch (error) {
      console.error('Error obteniendo ficha de campo parcela:', error)
      throw new Error(error.message || 'Error al obtener ficha de campo')
    }
  }

  /**
   * Crea una nueva ficha de campo de parcela
   * 
   * @param {Object} fichaData - Datos de la ficha
   * @returns {Promise<Object>} Ficha creada
   */
  async createFichaCampoParcela(fichaData) {
    try {
      // El backend tiene un endpoint específico para crear
      const response = await api.post('/api/fichas-campo-parcela/crear/', fichaData)
      return response
    } catch (error) {
      console.error('Error creando ficha de campo parcela:', error)
      throw new Error(error.message || 'Error al crear ficha de campo')
    }
  }

  /**
   * Actualiza una ficha de campo de parcela
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @param {Object} fichaData - Datos actualizados
   * @returns {Promise<Object>} Ficha actualizada
   */
  async updateFichaCampoParcela(fichaId, fichaData) {
    try {
      const response = await api.put(`/api/fichas-campo-parcela/${fichaId}/actualizar/`, fichaData)
      return response
    } catch (error) {
      console.error('Error actualizando ficha de campo parcela:', error)
      throw new Error(error.message || 'Error al actualizar ficha de campo')
    }
  }

  /**
   * Actualiza parcialmente una ficha de campo de parcela
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @param {Object} fichaData - Datos parciales
   * @returns {Promise<Object>} Ficha actualizada
   */
  async patchFichaCampoParcela(fichaId, fichaData) {
    try {
      const response = await api.patch(`/api/fichas-campo-parcela/${fichaId}/`, fichaData)
      return response
    } catch (error) {
      console.error('Error actualizando ficha de campo parcela:', error)
      throw new Error(error.message || 'Error al actualizar ficha de campo')
    }
  }

  /**
   * Elimina una ficha de campo de parcela
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteFichaCampoParcela(fichaId) {
    try {
      const response = await api.delete(`/api/fichas-campo-parcela/${fichaId}/`)
      return response
    } catch (error) {
      console.error('Error eliminando ficha de campo parcela:', error)
      throw new Error(error.message || 'Error al eliminar ficha de campo')
    }
  }

  /**
   * Lista fichas de campo de parcela por finca
   * 
   * @param {number|string} fincaId - ID de la finca
   * @returns {Promise<Array>} Lista de fichas de campo
   */
  async listFichasCampoParcelaByFinca(fincaId) {
    try {
      const response = await api.get(`/api/fichas-campo-parcela/por-finca/${fincaId}/`)
      return response.results || response || []
    } catch (error) {
      console.error('Error listando fichas de campo parcela por finca:', error)
      throw new Error(error.message || 'Error al listar fichas de campo')
    }
  }

  /**
   * Sube una imagen a una ficha de campo de parcela
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @param {string} tipoImagen - Tipo de imagen ('foto_1', 'foto_2', 'foto_3', 'croquis')
   * @param {File} archivo - Archivo de imagen
   * @returns {Promise<Object>} Ficha actualizada
   */
  async subirImagenFichaCampoParcela(fichaId, tipoImagen, archivo) {
    try {
      const formData = new FormData()
      formData.append('tipo_imagen', tipoImagen)
      formData.append('archivo', archivo)

      // No establecer Content-Type manualmente, el navegador lo hace automáticamente con FormData
      const response = await api.post(`/api/fichas-campo-parcela/${fichaId}/subir-imagen/`, formData)
      return response.data || response
    } catch (error) {
      console.error('Error subiendo imagen a ficha de campo parcela:', error)
      throw new Error(error.message || 'Error al subir imagen')
    }
  }

  /**
   * Lista todas las fichas de campo de construcciones
   * 
   * @param {Object} filters - Filtros opcionales (proyecto, finca, search, etc.)
   * @returns {Promise<Array>} Lista de fichas de campo
   */
  async listFichasCampoConstrucciones(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.proyecto) params.append('proyecto_id', filters.proyecto)
      if (filters.finca) params.append('finca_id', filters.finca)
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page)
      if (filters.page_size) params.append('page_size', filters.page_size)

      const queryString = params.toString()
      const url = `/api/fichas-campo-construcciones/${queryString ? `?${queryString}` : ''}`
      const response = await api.get(url)
      return response.data || response.results || response || []
    } catch (error) {
      console.error('Error listando fichas de campo construcciones:', error)
      throw new Error(error.message || 'Error al listar fichas de campo')
    }
  }

  /**
   * Obtiene una ficha de campo de construcciones específica
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @returns {Promise<Object>} Información de la ficha
   */
  async getFichaCampoConstrucciones(fichaId) {
    try {
      const response = await api.get(`/api/fichas-campo-construcciones/${fichaId}/`)
      return response
    } catch (error) {
      console.error('Error obteniendo ficha de campo construcciones:', error)
      throw new Error(error.message || 'Error al obtener ficha de campo')
    }
  }

  /**
   * Crea una nueva ficha de campo de construcciones
   * 
   * @param {Object} fichaData - Datos de la ficha
   * @returns {Promise<Object>} Ficha creada
   */
  async createFichaCampoConstrucciones(fichaData) {
    try {
      // El backend tiene un endpoint específico para crear
      const response = await api.post('/api/fichas-campo-construcciones/crear/', fichaData)
      return response
    } catch (error) {
      console.error('Error creando ficha de campo construcciones:', error)
      throw new Error(error.message || 'Error al crear ficha de campo')
    }
  }

  /**
   * Sube una imagen a una ficha de campo de construcciones
   * 
   * @param {number|string} fichaId - ID de la ficha
   * @param {string} tipoImagen - Tipo de imagen ('foto_1', 'foto_2', 'foto_3', 'croquis_1', 'croquis_2')
   * @param {File} archivo - Archivo de imagen
   * @returns {Promise<Object>} Ficha actualizada
   */
  async subirImagenFichaCampoConstrucciones(fichaId, tipoImagen, archivo) {
    try {
      const formData = new FormData()
      formData.append('tipo_imagen', tipoImagen)
      formData.append('archivo', archivo)

      // No establecer Content-Type manualmente, el navegador lo hace automáticamente con FormData
      const response = await api.post(`/api/fichas-campo-construcciones/${fichaId}/subir-imagen/`, formData)
      return response.data || response
    } catch (error) {
      console.error('Error subiendo imagen a ficha de campo construcciones:', error)
      throw new Error(error.message || 'Error al subir imagen')
    }
  }
}

export default new FichaCampoService()

