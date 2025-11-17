/**
 * Cliente API usando Fetch API nativa
 * 
 * Proporciona métodos para hacer peticiones HTTP con manejo automático
 * de tokens, interceptores y manejo de errores.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
    this.refreshPromise = null;
  }

  /**
   * Obtiene el token de acceso del localStorage
   */
  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtiene el refresh token del localStorage
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Guarda tokens en localStorage
   */
  setTokens(accessToken, refreshToken) {
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Limpia tokens del localStorage
   */
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Renueva el token de acceso usando el refresh token
   */
  async refreshAccessToken() {
    // Evitar múltiples llamadas simultáneas de refresh
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    const baseURL = this.baseURL?.replace(/\/+$/, ''); // Remover trailing slash
    this.refreshPromise = fetch(`${baseURL}/api/auth/refresh-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          // Si el refresh falla, limpiar tokens y redirigir
          this.clearTokens();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        return response.json();
      })
      .then((data) => {
        if (data.access) {
          // Guardar el nuevo access token y el refresh token si viene en la respuesta
          // Simple JWT puede retornar un nuevo refresh token si ROTATE_REFRESH_TOKENS está habilitado
          const newRefreshToken = data.refresh || refreshToken; // Usar el nuevo si existe, sino mantener el anterior
          this.setTokens(data.access, newRefreshToken);
          
          // Actualizar session_info si viene en la respuesta
          if (data.session_info) {
            localStorage.setItem('session_info', JSON.stringify(data.session_info));
          }
          
          return data.access;
        }
        throw new Error('No se recibió access token');
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  /**
   * Maneja respuesta HTTP y errores
   */
  async handleResponse(response) {
    // Si la respuesta es exitosa, retornar JSON
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    }

    // Manejar errores HTTP
    let errorMessage = 'Error desconocido';
    let errorData = null;

    try {
      errorData = await response.json();
      
      // Manejar diferentes formatos de error
      if (errorData.error) {
        // Error simple: {error: "mensaje"}
        errorMessage = errorData.error;
      } else if (errorData.message) {
        // Error con mensaje: {message: "mensaje"}
        errorMessage = errorData.message;
      } else if (errorData.details) {
        // Si hay detalles de errores del serializer, mostrarlos
        if (typeof errorData.details === 'object') {
          const errorFields = Object.keys(errorData.details);
          if (errorFields.length > 0) {
            const allErrors = [];
            errorFields.forEach(field => {
              const errors = errorData.details[field];
              if (Array.isArray(errors)) {
                errors.forEach(err => allErrors.push(`${field}: ${err}`));
              } else if (typeof errors === 'string') {
                allErrors.push(`${field}: ${errors}`);
              }
            });
            errorMessage = allErrors.length > 0 ? allErrors.join('. ') : errorMessage;
          }
        } else if (typeof errorData.details === 'string') {
          errorMessage = errorData.details;
        }
      } else if (typeof errorData === 'object') {
        // Errores del serializer de DRF: {campo: ["mensaje1", "mensaje2"], ...}
        // Extraer el primer mensaje de error de cualquier campo
        const errorFields = Object.keys(errorData);
        if (errorFields.length > 0) {
          const allErrors = [];
          errorFields.forEach(field => {
            const errors = errorData[field];
            if (Array.isArray(errors)) {
              errors.forEach(err => allErrors.push(`${field}: ${err}`));
            } else if (typeof errors === 'string') {
              allErrors.push(`${field}: ${errors}`);
            }
          });
          if (allErrors.length > 0) {
            errorMessage = allErrors.join('. ');
          } else {
            // Si no hay errores en formato de array/string, usar el primer campo
            const firstField = errorFields[0];
            const fieldErrors = errorData[firstField];
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              errorMessage = fieldErrors[0];
            } else if (typeof fieldErrors === 'string') {
              errorMessage = fieldErrors;
            }
          }
        }
      }
    } catch (e) {
      errorMessage = `HTTP error! status: ${response.status}`;
    }

    // Si es 401 (no autorizado), intentar renovar token
    if (response.status === 401) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !response.url.includes('/token/refresh/')) {
        try {
          const newAccessToken = await this.refreshAccessToken();
          // Retornar error para que el llamador pueda reintentar
          throw { isRetryable: true, newAccessToken, originalError: errorMessage };
        } catch (refreshError) {
          // Si el refresh falla, limpiar y lanzar error
          this.clearTokens();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      }
    }

    throw new Error(errorMessage);
  }

  /**
   * Realiza una petición HTTP
   */
  async request(endpoint, options = {}) {
    // Normalizar URLs: eliminar dobles slashes y asegurar formato correcto
    const baseURL = this.baseURL?.replace(/\/+$/, ''); // Remover trailing slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseURL}${normalizedEndpoint}`;
    let token = this.getAccessToken();

    // Si no hay token, intentar obtenerlo del localStorage directamente
    if (!token) {
      token = localStorage.getItem('access_token');
    }

    // Guardar el body original antes de cualquier conversión
    const originalBody = options.body;

    // Preparar el body: si es objeto, convertirlo a JSON
    let bodyToSend = originalBody;
    const isFormData = originalBody instanceof FormData;
    if (originalBody && typeof originalBody === 'object' && !isFormData) {
      bodyToSend = JSON.stringify(originalBody);
    }

    // Preparar headers: no establecer Content-Type para FormData (el navegador lo hace automáticamente)
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    // Solo establecer Content-Type si no es FormData y no se ha establecido manualmente
    if (!isFormData && !headers['Content-Type'] && !headers['content-type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      method: options.method || 'GET',
      body: bodyToSend,
      headers,
    };

    try {
      let response = await fetch(url, config);

      // Si es 401 y tenemos refresh token, intentar renovar
      if (response.status === 401 && this.getRefreshToken() && !endpoint.includes('/refresh-token/') && !endpoint.includes('/token/refresh/')) {
        try {
          const newAccessToken = await this.refreshAccessToken();
          // Reintentar la petición original con el nuevo token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };
          // Asegurar que el body se mantenga
          retryConfig.body = bodyToSend;
          response = await fetch(url, retryConfig);
        } catch (refreshError) {
          // Si el refresh falla, limpiar tokens
          this.clearTokens();
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
      }

      return await this.handleResponse(response);
    } catch (error) {
      // Si es un error de retry, reintentar
      if (error.isRetryable) {
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${error.newAccessToken}`,
          },
        };
        retryConfig.body = bodyToSend;
        const retryResponse = await fetch(url, retryConfig);
        return await this.handleResponse(retryResponse);
      }

      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    // Asegurar que el body se maneje correctamente
    const config = {
      ...options,
      method: 'PUT',
    };
    
    // Si data es un objeto, lo convertiremos a JSON en el método request
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      config.body = data;
    } else if (data) {
      config.body = data;
    }
    
    return this.request(endpoint, config);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    // Si options tiene body, convertirlo a JSON si es objeto
    const config = {
      method: 'DELETE',
      ...options,
    };
    
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
      config.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }
    
    return this.request(endpoint, config);
  }
}

// Exportar instancia única
export const api = new ApiClient();
export default api;

