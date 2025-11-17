/**
 * Gestor de tokens JWT
 * 
 * Maneja la validación, expiración y renovación de tokens JWT.
 */

class TokenManager {
  /**
   * Verifica si el token de acceso existe y no ha expirado
   */
  isTokenValid() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      // Decodificar el token JWT (sin verificar firma, solo para ver expiración)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      // Verificar si el token ha expirado
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return false;
    }
  }

  /**
   * Obtiene información del token (payload)
   */
  getTokenInfo() {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.user_id,
        username: payload.username,
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
      };
    } catch (error) {
      console.error('Error obteniendo info del token:', error);
      return null;
    }
  }

  /**
   * Verifica si la sesión absoluta ha expirado (según roles)
   */
  isSessionExpired() {
    const sessionInfo = localStorage.getItem('session_info');
    if (!sessionInfo) return false;

    try {
      const session = JSON.parse(sessionInfo);
      if (!session.absolute_expiry) return false;

      const expiryDate = new Date(session.absolute_expiry);
      const now = new Date();

      return expiryDate < now;
    } catch (error) {
      console.error('Error verificando sesión:', error);
      return false;
    }
  }

  /**
   * Obtiene el tiempo restante de la sesión
   */
  getRemainingSessionTime() {
    const sessionInfo = localStorage.getItem('session_info');
    if (!sessionInfo) return null;

    try {
      const session = JSON.parse(sessionInfo);
      if (!session.absolute_expiry) return null;

      const expiryDate = new Date(session.absolute_expiry);
      const now = new Date();
      const diff = expiryDate - now;

      if (diff <= 0) return null;

      // Convertir a horas, minutos, segundos
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        total: diff,
        hours,
        minutes,
        seconds,
        formatted: `${hours}h ${minutes}m ${seconds}s`,
      };
    } catch (error) {
      console.error('Error obteniendo tiempo de sesión:', error);
      return null;
    }
  }

  /**
   * Obtiene información de sesión
   */
  getSessionInfo() {
    const sessionInfo = localStorage.getItem('session_info');
    if (!sessionInfo) return null;

    try {
      return JSON.parse(sessionInfo);
    } catch (error) {
      console.error('Error obteniendo info de sesión:', error);
      return null;
    }
  }

  /**
   * Guarda información de sesión
   */
  setSessionInfo(sessionInfo) {
    if (sessionInfo) {
      localStorage.setItem('session_info', JSON.stringify(sessionInfo));
    }
  }

  /**
   * Limpia toda la información de sesión
   */
  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('session_info');
  }

  /**
   * Verifica y valida el token con el servidor
   */
  async verifyToken() {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/auth/token/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.valid === true;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }
}

// Exportar instancia única
export const tokenManager = new TokenManager();
export default tokenManager;

