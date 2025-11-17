import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import VerifyEmail from './components/auth/VerifyEmail'
import Home from './components/Home'
import Callback from './components/Callback'
import LayoutLateral from './components/layout/LayoutLateral'
import GestionUsuarios from './components/users/GestionUsuarios'
import GestionUsuariosProyectos from './components/projects/GestionUsuariosProyectos'
import GestionRoles from './components/users/GestionRoles'
import GestionProyectos from './components/projects/GestionProyectos'
import ProyectoDetalle from './components/projects/ProyectoDetalle'
import Expropiaciones from './components/Expropiaciones'
import ExpropiacionesFincas from './components/ExpropiacionesFincas'
import ExpropiacionFinca from './components/ExpropiacionFinca'
import FichaCampoParcela from './components/expropiaciones/FichaCampoParcela'
import FichaCampoConstrucciones from './components/expropiaciones/FichaCampoConstrucciones'
import VerExpropiaciones from './components/VerExpropiaciones'
import VerExpropiacionesFincas from './components/VerExpropiacionesFincas'
import VerExpropiacionFinca from './components/VerExpropiacionFinca'
import VerFichaCampoParcela from './components/expropiaciones/VerFichaCampoParcela'
import VerFichaCampoConstrucciones from './components/expropiaciones/VerFichaCampoConstrucciones'
import './App.css'

// Componente de carga
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
}

function App() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return <Loading />
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/home" /> : <Register />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/home" /> : <ForgotPassword />} 
      />
      <Route 
        path="/reset-password" 
        element={isAuthenticated ? <Navigate to="/home" /> : <ResetPassword />} 
      />
      <Route 
        path="/verify-email" 
        element={<VerifyEmail />} 
      />
      <Route 
        path="/callback" 
        element={<Callback />} 
      />
      
      {/* Rutas protegidas con Layout Lateral */}
      <Route 
        path="/" 
        element={isAuthenticated ? <LayoutLateral /> : <Navigate to="/login" />}
      >
        <Route 
          path="home" 
          element={<Home />} 
        />
        <Route 
          path="expropiaciones" 
          element={<Expropiaciones />} 
        />
        <Route 
          path="expropiaciones/:proyectoId/fincas" 
          element={<ExpropiacionesFincas />} 
        />
        <Route 
          path="expropiaciones/:fincaId" 
          element={<ExpropiacionFinca />} 
        />
        <Route 
          path="expropiaciones/:fincaId/ficha-campo/parcela" 
          element={<FichaCampoParcela />} 
        />
        <Route 
          path="expropiaciones/:fincaId/ficha-campo/construcciones" 
          element={<FichaCampoConstrucciones />} 
        />
        <Route 
          path="expropiaciones/:fincaId/acta-previa" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Acta Previa</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="expropiaciones/:fincaId/acta-ocupacion" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Acta de Ocupación</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="expropiaciones/:fincaId/acta-comparecencia" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Acta de Comparecencia</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="expropiaciones/:fincaId/mutuo-acuerdo" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Mutuo Acuerdo</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="ver-expropiaciones" 
          element={<VerExpropiaciones />} 
        />
        <Route 
          path="ver-expropiaciones/:proyectoId/fincas" 
          element={<VerExpropiacionesFincas />} 
        />
        <Route 
          path="ver-expropiaciones/:fincaId" 
          element={<VerExpropiacionFinca />} 
        />
        <Route 
          path="ver-expropiaciones/:fincaId/ficha/:fichaId" 
          element={<VerFichaCampoParcela />} 
        />
        <Route 
          path="ver-expropiaciones/:fincaId/ficha-construcciones/:fichaId" 
          element={<VerFichaCampoConstrucciones />} 
        />
        <Route 
          path="proyectos" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Proyectos</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="fincas" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Fincas</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="reportes" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Reportes</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="configuracion" 
          element={<div className="p-6"><h1 className="text-2xl font-bold">Configuración</h1><p className="text-gray-600 mt-2">Módulo en desarrollo</p></div>} 
        />
        <Route 
          path="gestion-usuarios" 
          element={<GestionUsuarios />} 
        />
        <Route 
          path="gestion-usuarios-proyectos" 
          element={<GestionUsuariosProyectos />} 
        />
        <Route 
          path="gestion-roles" 
          element={<GestionRoles />} 
        />
        <Route 
          path="gestion-proyectos" 
          element={<GestionProyectos />} 
        />
        <Route 
          path="proyectos/:proyectoId/fincas" 
          element={<ProyectoDetalle />} 
        />
        <Route 
          index 
          element={<Navigate to="/home" replace />} 
        />
      </Route>
      
      {/* Ruta 404 */}
      <Route 
        path="*" 
        element={<Navigate to="/" />} 
      />
    </Routes>
  )
}

export default App
