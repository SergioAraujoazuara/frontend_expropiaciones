import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../ui/Button'

function Login() {
  const navigate = useNavigate()
  const { login, loginMicrosoft, resendVerificationEmail } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailNotVerified, setEmailNotVerified] = useState(false)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailNotVerified(false)
    setResendSuccess(false)

    try {
      await login(formData)
      navigate('/home')
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesión'
      setError(errorMessage)
      
      // Detectar si el error es por email no verificado
      if (errorMessage.toLowerCase().includes('no ha sido verificada') || 
          errorMessage.toLowerCase().includes('verifica tu email') ||
          errorMessage.toLowerCase().includes('email no verificado')) {
        setEmailNotVerified(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Por favor ingresa tu email primero')
      return
    }

    setResendingVerification(true)
    setError('')
    setResendSuccess(false)

    try {
      await resendVerificationEmail(formData.email)
      setResendSuccess(true)
      setError('')
    } catch (err) {
      setError(err.message || 'Error al reenviar email de verificación')
    } finally {
      setResendingVerification(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setLoading(true)
    setError('')

    try {
      await loginMicrosoft()
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión con Microsoft')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-600 to-sky-700 rounded-2xl mb-4 shadow-lg shadow-sky-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-sm font-light text-gray-900 tracking-tight">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm text-gray-500 font-light">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {error && !emailNotVerified && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {emailNotVerified && (
            <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 px-4 py-4 text-sm rounded-r-lg shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Email no verificado</p>
                    <p className="text-xs text-amber-700 mb-2">
                      {error || 'Tu cuenta no ha sido verificada. Por favor verifica tu email para poder iniciar sesión.'}
                    </p>
                    {resendSuccess ? (
                      <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
                        <p className="text-xs text-green-700 flex items-center">
                          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Email de verificación reenviado. Por favor revisa tu bandeja de entrada.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={resendingVerification}
                        className="mt-2 text-xs text-amber-700 hover:text-amber-800 underline font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {resendingVerification ? 'Reenviando...' : '¿No recibiste el email? Reenviar verificación'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="group">
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-sky-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-sm border-0 border-b-2 border-gray-200 focus:border-sky-600 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-300 bg-transparent focus:bg-sky-50/50 rounded-t"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-sky-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm border-0 border-b-2 border-gray-200 focus:border-sky-600 focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-300 bg-transparent focus:bg-sky-50/50 rounded-t"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-sky-600 transition-colors duration-200"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-amber-700 hover:text-amber-800 hover:underline transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </Button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-gradient-to-br from-sky-50 via-white to-amber-50 text-gray-500 uppercase tracking-wider font-medium">O</span>
            </div>
          </div>

          {/* Microsoft Button */}
          <Button
            type="button"
            onClick={handleMicrosoftLogin}
            variant="secondary"
            fullWidth
            disabled={loading}
            icon={
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="10" height="10" x="0" y="0" fill="#F25022"/>
                <rect width="10" height="10" x="11" y="0" fill="#7FBA00"/>
                <rect width="10" height="10" x="0" y="11" fill="#00A4EF"/>
                <rect width="10" height="10" x="11" y="11" fill="#FFB900"/>
              </svg>
            }
          >
            Microsoft 365
          </Button>

          {/* Register Link */}
          <div className="text-center pt-6">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <Link
                to="/register"
                className="text-amber-700 font-semibold hover:text-amber-800 hover:underline transition-colors duration-200 inline-flex items-center"
              >
                Regístrate
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
