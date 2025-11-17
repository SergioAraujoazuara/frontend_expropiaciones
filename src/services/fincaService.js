import api from '../utils/api'

/**
 * Servicio para gestión de fincas
 * 
 * Proporciona métodos para gestionar fincas del sistema,
 * incluyendo crear, listar, actualizar y eliminar fincas.
 */
class FincaService {
  /**
   * Lista todas las fincas
   * 
   * @param {Object} filters - Filtros opcionales (proyecto_id, tipo_finca, etc.)
   * @returns {Promise<Array>} Lista de fincas
   */
  async listFincas(filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      const queryString = params.toString()
      const url = queryString ? `/api/fincas/?${queryString}` : '/api/fincas/'
      
      const response = await api.get(url)
      return response.results || response || []
    } catch (error) {
      console.error('Error listando fincas:', error)
      throw new Error(error.message || 'Error al listar fincas')
    }
  }

  /**
   * Obtiene una finca específica
   * 
   * @param {number} fincaId - ID de la finca
   * @returns {Promise<Object>} Información de la finca
   */
  async getFinca(fincaId) {
    try {
      const response = await api.get(`/api/fincas/${fincaId}/`)
      return response
    } catch (error) {
      console.error('Error obteniendo finca:', error)
      throw new Error(error.message || 'Error al obtener finca')
    }
  }

  /**
   * Crea una nueva finca
   * 
   * @param {Object} fincaData - Datos de la finca
   * @returns {Promise<Object>} Finca creada
   */
  async createFinca(fincaData) {
    try {
      const response = await api.post('/api/fincas/', fincaData)
      return response
    } catch (error) {
      console.error('Error creando finca:', error)
      throw new Error(error.message || 'Error al crear finca')
    }
  }

  /**
   * Actualiza una finca existente
   * 
   * @param {number} fincaId - ID de la finca
   * @param {Object} fincaData - Datos actualizados de la finca
   * @returns {Promise<Object>} Finca actualizada
   */
  async updateFinca(fincaId, fincaData) {
    try {
      const response = await api.put(`/api/fincas/${fincaId}/`, fincaData)
      return response
    } catch (error) {
      console.error('Error actualizando finca:', error)
      throw new Error(error.message || 'Error al actualizar finca')
    }
  }

  /**
   * Actualiza parcialmente una finca existente
   * 
   * @param {number} fincaId - ID de la finca
   * @param {Object} fincaData - Datos parciales de la finca
   * @returns {Promise<Object>} Finca actualizada
   */
  async patchFinca(fincaId, fincaData) {
    try {
      const response = await api.patch(`/api/fincas/${fincaId}/`, fincaData)
      return response
    } catch (error) {
      console.error('Error actualizando finca:', error)
      throw new Error(error.message || 'Error al actualizar finca')
    }
  }

  /**
   * Elimina una finca
   * 
   * @param {number} fincaId - ID de la finca
   * @returns {Promise<Object>} Resultado de la operación
   */
  async deleteFinca(fincaId) {
    try {
      const response = await api.delete(`/api/fincas/${fincaId}/`)
      return response
    } catch (error) {
      console.error('Error eliminando finca:', error)
      throw new Error(error.message || 'Error al eliminar finca')
    }
  }

  /**
   * Lista fincas de un proyecto específico
   * 
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Array>} Lista de fincas del proyecto
   */
  async listFincasByProyecto(proyectoId) {
    try {
      return await this.listFincas({ proyecto: proyectoId })
    } catch (error) {
      console.error('Error listando fincas del proyecto:', error)
      throw new Error(error.message || 'Error al listar fincas del proyecto')
    }
  }

  /**
   * Sube un archivo Excel para carga masiva de fincas
   * 
   * @param {File} file - Archivo Excel (.xlsx, .xls)
   * @param {number} proyectoId - ID del proyecto
   * @param {Object} options - Opciones adicionales (tipo_finca, tipo_afeccion, comunidad_autonoma, create)
   * @returns {Promise<Object>} Resultado de la carga masiva
   */
  async uploadExcel(file, proyectoId, options = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const params = new URLSearchParams()
      params.append('id', proyectoId)
      
      if (options.tipo_finca) {
        params.append('tipo_finca', options.tipo_finca)
      }
      if (options.tipo_afeccion) {
        params.append('tipo_afeccion', options.tipo_afeccion)
      }
      if (options.comunidad_autonoma) {
        params.append('comunidad_autonoma', options.comunidad_autonoma)
      }
      if (options.create !== undefined) {
        params.append('create', options.create ? '1' : '0')
      }

      const url = `/api/subida-excel/?${params.toString()}`
      
      // Usar fetch directamente para multipart/form-data
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${url}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const messageFromErrors = Array.isArray(data?.errors)
          ? data.errors
              .map((err) => {
                if (typeof err?.error === 'string') {
                  return err.error.replace(/^\[|\]$/g, '')
                }
                if (Array.isArray(err?.error)) {
                  return err.error.join(' ').replace(/^\[|\]$/g, '')
                }
                return ''
              })
              .filter(Boolean)
              .join(' | ')
          : ''

        const error = new Error(
          data?.detail ||
          data?.message ||
          messageFromErrors ||
          'Error al subir el archivo'
        )
        error.data = data
        error.status = response.status
        throw error
      }

      return data
    } catch (error) {
      console.error('Error subiendo Excel:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error al subir el archivo Excel')
    }
  }

  async addTitularCatastral(fincaId, data) {
    try {
      return await api.post(`/api/fincas/${fincaId}/titulares-catastrales/`, data)
    } catch (error) {
      console.error('Error agregando titular catastral:', error)
      throw new Error(error.message || 'Error al agregar titular catastral')
    }
  }

  async addTitularActual(fincaId, personaId) {
    try {
      return await api.post(`/api/fincas/${fincaId}/titulares-actuales/`, { persona_id: personaId })
    } catch (error) {
      console.error('Error agregando titular actual:', error)
      throw new Error(error.message || 'Error al agregar titular actual')
    }
  }

  async addTitularArrendatario(fincaId, personaId) {
    try {
      return await api.post(`/api/fincas/${fincaId}/arrendatarios/`, { persona_id: personaId })
    } catch (error) {
      console.error('Error agregando arrendatario:', error)
      throw new Error(error.message || 'Error al agregar arrendatario')
    }
  }

  async deleteTitularCatastral(fincaId, titularId) {
    try {
      return await api.delete(`/api/fincas/${fincaId}/titulares-catastrales/${titularId}/`)
    } catch (error) {
      console.error('Error eliminando titular catastral:', error)
      throw new Error(error.message || 'Error al eliminar titular catastral')
    }
  }

  async deleteTitularActual(fincaId, titularId) {
    try {
      return await api.delete(`/api/fincas/${fincaId}/titulares-actuales/${titularId}/`)
    } catch (error) {
      console.error('Error eliminando titular actual:', error)
      throw new Error(error.message || 'Error al eliminar titular actual')
    }
  }

  async deleteTitularArrendatario(fincaId, titularId) {
    try {
      return await api.delete(`/api/fincas/${fincaId}/arrendatarios/${titularId}/`)
    } catch (error) {
      console.error('Error eliminando arrendatario:', error)
      throw new Error(error.message || 'Error al eliminar arrendatario')
    }
  }

  /**
   * Obtiene todas las actas de una finca
   * 
   * @param {number} fincaId - ID de la finca
   * @returns {Promise<Array>} Lista de actas de la finca
   */
  async getActasByFinca(fincaId) {
    try {
      const response = await api.get(`/api/fincas/${fincaId}/actas/`)
      return response || []
    } catch (error) {
      console.error('Error obteniendo actas de la finca:', error)
      throw new Error(error.message || 'Error al obtener actas de la finca')
    }
  }
}

export default new FincaService()

