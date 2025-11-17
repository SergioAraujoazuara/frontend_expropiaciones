/**
 * Componente de header general para páginas
 * Muestra el título de la página, un subtítulo opcional y un botón de volver opcional
 * Incluye una línea inferior que coincide con el navbar (border-slate-700)
 * @param {string} title - Título de la página
 * @param {string} subtitle - Subtítulo opcional
 * @param {function} onBack - Función para el botón de volver
 * @param {boolean} showBackButton - Mostrar botón de volver
 * @param {ReactNode} icon - Icono opcional a mostrar a la izquierda del título
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  onBack, 
  showBackButton = false,
  icon = null
}) => {
  return (
    <div className="w-full border-b-2 border-gray-300 bg-white">
      <div className="w-full pt-8 pb-7 pl-10 pr-16">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center"
                title="Volver"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {icon && (
              <div className="text-gray-600 flex items-center justify-center w-9 h-9">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PageHeader

