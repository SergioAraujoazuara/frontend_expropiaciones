import { Outlet, useLocation } from 'react-router-dom'
import NavbarLateral from './NavbarLateral'

const LayoutLateral = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/home' || location.pathname === '/'

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100 flex">
      {/* Sidebar */}
      <NavbarLateral />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className={`flex-1 ${isHomePage ? 'overflow-hidden' : 'overflow-y-auto'} bg-gray-50`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LayoutLateral

