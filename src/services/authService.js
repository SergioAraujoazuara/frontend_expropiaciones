/**
 * Servicio de autenticación
 * 
 * Maneja todos los flujos de autenticación: login local, registro,
 * autenticación con Microsoft, y gestión de tokens.
 */

import api from '../utils/api';
import tokenManager from '../utils/tokenManager';

class AuthService {
  /**
   * Registro de usuario local
   * 
   * @param {Object} data - Datos del usuario
   * @param {string} data.email - Email del usuario
   * @param {string} data.password - Contraseña
   * @param {string} data.password_confirm - Confirmación de contraseña
   * @param {string} data.first_name - Nombre
   * @param {string} data.last_name - Apellido
   * @returns {Promise<Object>} Usuario y tokens
   */
  async registerLocal(data) {
    try {
      const response = await api.post('/api/auth/register/', {
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
      });

      // Verificar si se requiere verificación de email
      // El backend devuelve email_verification_required: true y tokens vacíos si se requiere verificación
      if (response.email_verification_required) {
        // NO guardar tokens si se requiere verificación de email
        // Solo guardar información del usuario para mostrar en la página de verificación
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          // Marcar que necesita verificación
          localStorage.setItem('email_verification_required', 'true');
        }
        return {
          user: response.user,
          tokens: {},
          sessionInfo: null,
          emailVerificationRequired: true,
        };
      }

      // Si no se requiere verificación, guardar tokens y usuario normalmente
      // El backend devuelve tokens en response.tokens (no directamente en response)
      if (response.tokens && response.tokens.access && response.tokens.refresh) {
        api.setTokens(response.tokens.access, response.tokens.refresh);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          // Limpiar flag de verificación si existe
          localStorage.removeItem('email_verification_required');
        }
        // Guardar información de sesión si está disponible
        // El backend devuelve session_info dentro de tokens
        if (response.tokens.session_info) {
          tokenManager.setSessionInfo(response.tokens.session_info);
        }
      }

      return {
        user: response.user,
        tokens: response.tokens || {},
        sessionInfo: response.tokens?.session_info,
        emailVerificationRequired: false,
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw new Error(error.message || 'Error al registrar usuario');
    }
  }

  /**
   * Login de usuario local
   * 
   * @param {Object} credentials - Credenciales
   * @param {string} credentials.email - Email o username
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<Object>} Usuario y tokens
   */
  async loginLocal(credentials) {
    try {
      const response = await api.post('/api/auth/login/', {
        email: credentials.email,
        password: credentials.password,
      });

      // Guardar tokens y usuario
      // El backend devuelve tokens en response.tokens (no directamente en response)
      if (response.tokens && response.tokens.access && response.tokens.refresh) {
        api.setTokens(response.tokens.access, response.tokens.refresh);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        // Guardar información de sesión si está disponible
        // El backend devuelve session_info dentro de tokens
        if (response.tokens.session_info) {
          tokenManager.setSessionInfo(response.tokens.session_info);
        }
      }

      return {
        user: response.user,
        tokens: response.tokens || {},
        sessionInfo: response.tokens?.session_info,
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Obtiene la URL de autorización de Microsoft
   * 
   * @returns {Promise<string>} URL de autorización
   */
  async getMicrosoftAuthUrl() {
    try {
      const response = await api.post('/api/auth/microsoft/url/', {});
      
      if (response.auth_url) {
        return response.auth_url;
      }
      
      throw new Error('No se recibió URL de autorización');
    } catch (error) {
      console.error('Error obteniendo URL de Microsoft:', error);
      throw new Error(error.message || 'Error al obtener URL de Microsoft');
    }
  }

  /**
   * Maneja el callback de Microsoft OAuth
   * 
   * @param {string} code - Código de autorización
   * @param {string} state - Estado para prevenir CSRF
   * @returns {Promise<Object>} Usuario y tokens
   */
  async handleMicrosoftCallback(code, state) {
    try {
      const response = await api.post('/api/auth/microsoft/callback/', {
        code,
        state,
      });

      // Guardar tokens y usuario
      // El backend devuelve tokens en response.tokens (no directamente en response)
      if (response.tokens && response.tokens.access && response.tokens.refresh) {
        api.setTokens(response.tokens.access, response.tokens.refresh);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        // Guardar información de sesión si está disponible
        // El backend devuelve session_info dentro de tokens
        if (response.tokens.session_info) {
          tokenManager.setSessionInfo(response.tokens.session_info);
        }
      }

      return {
        user: response.user,
        tokens: response.tokens || {},
        sessionInfo: response.tokens?.session_info,
      };
    } catch (error) {
      console.error('Error en callback de Microsoft:', error);
      throw new Error(error.message || 'Error al autenticar con Microsoft');
    }
  }

  /**
   * Renueva el token de acceso
   * 
   * @returns {Promise<string>} Nuevo access token
   */
  async refreshToken() {
    try {
      const newAccessToken = await api.refreshAccessToken();
      return newAccessToken;
    } catch (error) {
      console.error('Error renovando token:', error);
      throw error;
    }
  }

  /**
   * Verifica el token de acceso
   * 
   * @returns {Promise<boolean>} True si el token es válido
   */
  async verifyToken() {
    try {
      const isValid = await tokenManager.verifyToken();
      return isValid;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * 
   * @returns {Promise<Object>} Datos del usuario
   */
  async getProfile() {
    try {
      const response = await api.get('/api/auth/user/profile/');
      return response;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw new Error(error.message || 'Error al obtener perfil');
    }
  }

  /**
   * Actualiza el perfil del usuario
   * 
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateProfile(data) {
    try {
      const response = await api.put('/api/auth/user/profile/', data);
      
      // Actualizar usuario en localStorage
      if (response) {
        localStorage.setItem('user', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  }

  /**
   * Cierra sesión
   * 
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Intentar invalidar el token en el servidor
      try {
        await api.post('/api/auth/logout/', {
          refresh: api.getRefreshToken(),
        });
      } catch (error) {
        // Si falla, continuar limpiando localmente
        console.warn('Error al cerrar sesión en el servidor:', error);
      }

      // Limpiar tokens y datos locales
      api.clearTokens();
      tokenManager.clear();
    } catch (error) {
      console.error('Error en logout:', error);
      // Asegurar limpieza local aunque falle el servidor
      api.clearTokens();
      tokenManager.clear();
      throw error;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * 
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    const token = api.getAccessToken();
    const user = localStorage.getItem('user');
    
    if (!token || !user) return false;
    
    // Verificar si el token es válido
    if (!tokenManager.isTokenValid()) return false;
    
    // Verificar si la sesión absoluta ha expirado
    if (tokenManager.isSessionExpired()) return false;
    
    return true;
  }

  /**
   * Obtiene el usuario actual
   * 
   * @returns {Object|null} Usuario o null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene información de la sesión actual
   * 
   * @returns {Object|null} Información de sesión
   */
  getSessionInfo() {
    try {
      const sessionStr = localStorage.getItem('session_info');
      return sessionStr ? JSON.parse(sessionStr) : null;
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return null;
    }
  }

  /**
   * Solicita restablecimiento de contraseña
   * 
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forgot-password/', {
        email,
      });
      return response;
    } catch (error) {
      console.error('Error solicitando restablecimiento:', error);
      throw new Error(error.message || 'Error al solicitar restablecimiento de contraseña');
    }
  }

  /**
   * Restablece la contraseña con token
   * 
   * @param {string} token - Token de restablecimiento
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/auth/reset-password/', {
        token,
        new_password: newPassword,
      });
      return response;
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      throw new Error(error.message || 'Error al restablecer contraseña');
    }
  }

  /**
   * Verifica el email de un usuario con el token
   * 
   * @param {string} token - Token de verificación de email
   * @returns {Promise<Object>} Usuario verificado
   */
  async verifyEmail(token) {
    try {
      const response = await api.get(`/api/auth/verify-email/?token=${token}`);
      
      // Si el email fue verificado exitosamente, el usuario ahora está activo
      if (response.user && response.user.is_active) {
        // Limpiar flag de verificación requerida
        localStorage.removeItem('email_verification_required');
        // Actualizar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Error verificando email:', error);
      throw new Error(error.message || 'Error al verificar email');
    }
  }

  /**
   * Reenvía el email de verificación
   * 
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async resendVerificationEmail(email) {
    try {
      const response = await api.post('/api/auth/resend-verification/', {
        email,
      });
      return response;
    } catch (error) {
      console.error('Error reenviando email de verificación:', error);
      throw new Error(error.message || 'Error al reenviar email de verificación');
    }
  }
}

// Exportar instancia única
export const authService = new AuthService();
export default authService;

