const Button = ({
  children,
  variant = 'primary',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  // Estilos base comunes
  const baseStyles = 'font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Tamaño de texto por defecto (puede ser sobrescrito con className)
  const defaultTextSize = 'text-sm'

  // Variantes de estilo
  const variants = {
    primary: 'border-2 border-sky-600 text-sky-600 hover:bg-gradient-to-r hover:from-sky-600 hover:to-sky-700 hover:text-white hover:border-sky-700 focus:ring-sky-600',
    secondary: 'border-2 border-gray-200 text-gray-700 hover:border-amber-700 hover:text-amber-700 hover:bg-amber-50 focus:ring-amber-700',
    outline: 'border-2 border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white focus:ring-sky-600',
    solid: 'bg-sky-600 text-white border-2 border-sky-600 hover:bg-sky-700 hover:border-sky-700 focus:ring-sky-600',
    ghost: 'border-0 text-gray-600 hover:bg-gray-50 hover:text-gray-700 focus:ring-gray-500 shadow-none hover:shadow-none'
  }

  // Estilos de tamaño
  const sizeStyles = fullWidth ? 'w-full' : ''
  
  // Determinar si es un botón pequeño basado en el tamaño de texto
  const isSmall = className && className.includes('text-xs')
  const paddingStyles = icon && !children 
    ? 'p-2' 
    : isSmall 
      ? 'px-3 py-1.5' 
      : 'px-4 py-2'

  // Verificar si className ya incluye un tamaño de texto
  const hasTextSize = className && (className.includes('text-xs') || className.includes('text-sm') || className.includes('text-base') || className.includes('text-lg'))
  const textSizeClass = hasTextSize ? '' : defaultTextSize
  
  // Clases finales
  const buttonClasses = `
    ${baseStyles}
    ${variants[variant] || variants.primary}
    ${textSizeClass}
    ${sizeStyles}
    ${paddingStyles}
    ${className}
    rounded-lg
    flex items-center justify-center gap-2
  `.trim().replace(/\s+/g, ' ')

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </button>
  )
}

export default Button

