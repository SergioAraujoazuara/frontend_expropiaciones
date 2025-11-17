import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import tokenManager from '../utils/tokenManager';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar estado inicial del localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const savedUser = localStorage.getItem('user');
        
        // Si hay usuario guardado pero no hay token, intentar refrescar
        if (savedUser && !token && refreshToken) {
          try {
            const newAccessToken = await authService.refreshToken();
            setAccessToken(newAccessToken);
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error renovando token al inicializar:', error);
            authService.logout();
            setLoading(false);
            return;
          }
        }
        
        if (token && savedUser) {
          // Verificar si el token es válido
          if (tokenManager.isTokenValid()) {
            // Verificar si la sesión absoluta ha expirado
            if (!tokenManager.isSessionExpired()) {
              setAccessToken(token);
              setUser(JSON.parse(savedUser));
              setIsAuthenticated(true);
            } else {
              // Sesión expirada, intentar refrescar primero
              if (refreshToken) {
                try {
                  const newAccessToken = await authService.refreshToken();
                  // Verificar nuevamente si la sesión expiró después del refresh
                  if (!tokenManager.isSessionExpired()) {
                    setAccessToken(newAccessToken);
                    setUser(JSON.parse(savedUser));
                    setIsAuthenticated(true);
                  } else {
                    // Sesión realmente expirada, limpiar
                    authService.logout();
                  }
                } catch (error) {
                  console.error('Error renovando token:', error);
                  authService.logout();
                }
              } else {
                // No hay refresh token, limpiar
                authService.logout();
              }
            }
          } else {
            // Token expirado, intentar renovar
            if (refreshToken) {
              await handleTokenRefresh();
            } else {
              // No hay refresh token, limpiar
              authService.logout();
            }
          }
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Intentar renovar token si está expirado pero hay refresh token
  const handleTokenRefresh = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const newAccessToken = await authService.refreshToken();
      setAccessToken(newAccessToken);
      // Restaurar usuario si existe
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error renovando token:', error);
      authService.logout();
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    }
  };

  // Guardar tokens cuando cambien
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
    } else {
      localStorage.removeItem('access_token');
    }
  }, [accessToken]);

  // Guardar usuario cuando cambie
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (credentials) => {
    try {
      const result = await authService.loginLocal(credentials);
      setUser(result.user);
      setAccessToken(result.tokens.access);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const result = await authService.registerLocal(data);
      setUser(result.user);
      
      // Solo establecer tokens y autenticación si NO se requiere verificación de email
      if (!result.emailVerificationRequired && result.tokens && result.tokens.access) {
        setAccessToken(result.tokens.access);
        setIsAuthenticated(true);
      } else {
        // Si se requiere verificación, NO establecer tokens ni autenticación
        setAccessToken(null);
        setIsAuthenticated(false);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  const loginMicrosoft = async () => {
    try {
      const authUrl = await authService.getMicrosoftAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleMicrosoftCallback = async (code, state) => {
    try {
      const result = await authService.handleMicrosoftCallback(code, state);
      setUser(result.user);
      setAccessToken(result.tokens.access);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      // Asegurar limpieza aunque falle el servidor
      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      throw error;
    }
  };

  const verifyEmail = async (token) => {
    try {
      const result = await authService.verifyEmail(token);
      // Si el email fue verificado exitosamente, actualizar el usuario
      if (result.user && result.user.is_active) {
        setUser(result.user);
        // NO establecer tokens aquí, el usuario debe hacer login después
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      return await authService.resendVerificationEmail(email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated,
    login,
    register,
    loginMicrosoft,
    handleMicrosoftCallback,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    refreshToken: handleTokenRefresh,
    getSessionInfo: () => tokenManager.getSessionInfo(),
    getRemainingSessionTime: () => tokenManager.getRemainingSessionTime(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}

export default AuthContext;

