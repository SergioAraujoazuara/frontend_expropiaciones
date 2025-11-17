import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Callback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { handleMicrosoftCallback } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const processedRef = useRef(false) // Protección contra ejecuciones múltiples

  useEffect(() => {
    // Protección: solo procesar una vez
    if (processedRef.current) {
      return
    }

    const processCallback = async () => {
      // Marcar como procesado inmediatamente para evitar ejecuciones paralelas
      processedRef.current = true

      try {
        // Leer parámetros de la URL una sola vez
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const errorParam = searchParams.get('error')

        if (errorParam) {
          setError(`Error de Microsoft: ${errorParam}`)
          setLoading(false)
          return
        }

        if (!code) {
          setError('Código de autorización no encontrado')
          setLoading(false)
          return
        }

        // Procesar callback
        await handleMicrosoftCallback(code, state)
        
        // Redirigir a home si es exitoso
        navigate('/home')
      } catch (err) {
        console.error('Error en callback:', err)
        setError(err.message || 'Error al procesar la autenticación con Microsoft')
        setLoading(false)
        // Resetear el flag en caso de error para permitir reintento manual
        processedRef.current = false
      }
    }

    processCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar el componente (protección con useRef)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Procesando autenticación...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error de autenticación</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Callback

