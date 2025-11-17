import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyEmail, resendVerificationEmail } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const processedRef = useRef(false) // Protección contra ejecuciones múltiples

  // Obtener email del usuario si está en localStorage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setEmail(user.email || '')
      }
    } catch (error) {
      console.error('Error obteniendo email:', error)
    }
  }, [])

  // Verificar email si hay token en la URL
  useEffect(() => {
    // Protección: solo procesar una vez
    if (processedRef.current) {
      return
    }

    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl && !loading && !success) {
      processedRef.current = true // Marcar como procesado inmediatamente
      handleVerify(tokenFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar

  const handleVerify = async (token) => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const result = await verifyEmail(token)
      setSuccess(true)
      setLoading(false)
      // No redirigir automáticamente, mostrar página de éxito
    } catch (err) {
      setError(err.message || 'Error al verificar email')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('No se encontró el email del usuario')
      return
    }

    setResending(true)
    setError('')

    try {
      await resendVerificationEmail(email)
      setSuccess(true)
      setError('')
    } catch (err) {
      setError(err.message || 'Error al reenviar email de verificación')
    } finally {
      setResending(false)
    }
  }

  const token = searchParams.get('token')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl mb-4 shadow-lg shadow-amber-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-sm font-light text-gray-900 tracking-tight">
            Verificación de Email
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-light">
            {token ? 'Verificando tu email...' : 'Verifica tu email para activar tu cuenta'}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && !token && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 text-sm rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Email de verificación reenviado exitosamente</span>
              </div>
            </div>
          )}

          {success && token && (
            <div className="space-y-6">
              {/* Mensaje de éxito */}
              <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6 shadow-sm">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icono de éxito */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Mensaje */}
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-green-900">
                      ¡Email verificado exitosamente!
                    </h2>
                    <p className="text-sm text-green-700">
                      Tu cuenta ha sido activada. Ahora puedes iniciar sesión.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón para ir a login */}
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full text-center py-3 px-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white font-semibold text-sm uppercase tracking-wider hover:from-sky-700 hover:to-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg rounded-lg"
                >
                  Ir a Iniciar Sesión
                </Link>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
              </div>
              <p className="text-sm font-medium text-gray-700">Verificando tu email...</p>
              <p className="text-xs text-gray-500">Por favor espera un momento</p>
            </div>
          )}

          {!loading && !success && !token && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                <p className="text-sm text-gray-700 mb-2">
                  Se ha enviado un email de verificación a:
                </p>
                <p className="text-sm font-semibold text-gray-900">{email || 'tu email'}</p>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || !email}
                  className="w-full flex justify-center py-2.5 px-4 border-2 border-sky-600 text-sky-600 font-semibold text-sm uppercase tracking-wider hover:bg-gradient-to-r hover:from-sky-600 hover:to-sky-700 hover:text-white hover:border-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  {resending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Reenviando...
                    </span>
                  ) : (
                    'Reenviar email'
                  )}
                </button>

                <Link
                  to="/login"
                  className="block w-full text-center py-2.5 px-4 border-2 border-gray-200 text-gray-700 font-semibold text-sm uppercase tracking-wider hover:border-amber-700 hover:text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
                >
                  Volver al login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail

