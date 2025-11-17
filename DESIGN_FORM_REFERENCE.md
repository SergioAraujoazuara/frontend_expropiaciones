# Referencia de Diseño - Formularios de Expropiaciones

## Estructura General

### Layout Principal
```jsx
<div className="h-full w-full bg-gray-50 flex flex-col">
  {/* PageHeader */}
  <PageHeader />
  
  <div className="flex-1 flex flex-col min-h-0 pt-6 pb-6 pl-10 pr-16">
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0">
      {/* Tabs */}
      {/* Contenido */}
      {/* Footer */}
    </div>
  </div>
</div>
```

## Sistema de Pestañas (Tabs)

### Contenedor de Pestañas
- **Fondo**: `bg-gray-100`
- **Borde inferior**: `border-b border-gray-200`
- **Padding**: `px-6 py-2`
- **Overflow**: `overflow-x-auto` (para scroll horizontal si hay muchas pestañas)
- **Flex**: `flex space-x-1 min-w-max`

### Botón de Pestaña Activa
```jsx
className="px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 bg-sky-600 text-white"
```

### Botón de Pestaña Inactiva
```jsx
className="px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-200"
```

### Estructura de Pestaña
- **Icono SVG**: `w-4 h-4` dentro del botón
- **Texto**: `text-xs font-medium`
- **Espaciado**: `gap-2` entre icono y texto
- **Color del icono activo**: `text-white`
- **Color del icono inactivo**: `text-gray-500`

## Campos del Formulario

### Contenedor de Sección
```jsx
<div className="space-y-4">
  <h4 className="text-sm font-semibold text-gray-900 mb-4">Título de la sección</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Campos */}
  </div>
</div>
```

### Label de Campo
```jsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Nombre del campo <span className="text-red-500">*</span>
</label>
```

### Input Normal (Editable)
```jsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
  placeholder="Placeholder"
/>
```

### Input Deshabilitado (Solo lectura)
```jsx
<input
  type="text"
  disabled
  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-100 cursor-not-allowed"
/>
```

### Textarea
```jsx
<textarea
  rows={3}
  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
/>
```

### Select
```jsx
<select
  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
>
  <option value="">Seleccionar...</option>
</select>
```

### Checkbox
```jsx
<input
  type="checkbox"
  className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-2 focus:ring-sky-500"
/>
```

## Grid de Campos

### Grid Responsive
- **Móvil**: 1 columna (`grid-cols-1`)
- **Desktop**: 2 columnas (`md:grid-cols-2`)
- **Gap**: `gap-4`
- **Campos de ancho completo**: `md:col-span-2`

## Área de Contenido

### Contenedor con Scroll
```jsx
<div className="p-6 overflow-y-auto flex-1 min-h-0">
  {/* Formulario */}
</div>
```

## Footer con Botones

### Contenedor del Footer
```jsx
<div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 justify-end">
  {/* Botones */}
</div>
```

### Botones
- **Cancelar**: `variant="outline"`
- **Guardar/Crear**: `variant="outline"` con icono
- **Tamaño**: `text-sm px-4 py-2`
- **Alineación**: `justify-end` (a la derecha)

## Paleta de Colores

### Colores Principales
- **Sky-600**: `bg-sky-600` - Pestañas activas, focus rings
- **Sky-500**: `focus:ring-sky-500` - Anillos de focus
- **Gray-50**: `bg-gray-50` - Fondo principal, footer
- **Gray-100**: `bg-gray-100` - Fondo de pestañas, inputs deshabilitados
- **Gray-200**: `border-gray-200` - Bordes de cards, separadores
- **Gray-300**: `border-gray-300` - Bordes de inputs
- **Gray-500**: `text-gray-500` - Texto secundario, iconos inactivos
- **Gray-700**: `text-gray-700` - Texto de labels
- **Gray-900**: `text-gray-900` - Texto principal
- **White**: `bg-white` - Fondos de cards, pestañas inactivas
- **Red-500**: `text-red-500` - Asteriscos de campos obligatorios

## Estados de Campos

### Focus
- **Ring**: `focus:ring-2 focus:ring-sky-500`
- **Border**: `focus:border-transparent`

### Disabled
- **Background**: `bg-gray-100`
- **Text**: `text-gray-500`
- **Cursor**: `cursor-not-allowed`

### Error
```jsx
<div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
  <p className="text-sm text-red-800">{error}</p>
</div>
```

## Secciones Especiales

### Matriz de Subparcelas
- **Contenedor**: `border border-gray-200 rounded-lg p-4 bg-gray-50`
- **Título**: `text-sm font-semibold text-gray-800 mb-3`
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3`
- **Labels pequeños**: `text-xs font-medium text-gray-600 mb-1`
- **Inputs pequeños**: `text-xs` en lugar de `text-sm`

### Multimedia (Imágenes)
- **Contenedor**: `border border-gray-200 rounded-lg p-4`
- **Preview**: `w-full h-48 object-cover rounded-lg`
- **Upload area**: `border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100`
- **Botón eliminar**: `absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600`

## Espaciado y Tamaños

### Padding
- **Card principal**: `p-6`
- **Pestañas**: `px-6 py-2`
- **Footer**: `p-4`
- **Inputs**: `px-4 py-2`

### Tamaños de Texto
- **Títulos de sección**: `text-sm font-semibold`
- **Labels**: `text-sm font-medium`
- **Inputs**: `text-sm`
- **Pestañas**: `text-xs font-medium`
- **Subparcelas labels**: `text-xs font-medium`
- **Subparcelas inputs**: `text-xs`

### Bordes
- **Radius**: `rounded-lg` (8px)
- **Border width**: `border` (1px)
- **Border color**: `border-gray-300` (inputs), `border-gray-200` (cards)

## Iconos SVG

### Tamaño Estándar
- **En pestañas**: `w-4 h-4`
- **En botones**: `w-4 h-4`
- **En upload areas**: `w-8 h-8`

### Estilo
```jsx
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>
```

## Ejemplo Completo de Campo

```jsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Nombre del Campo <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={value}
    onChange={(e) => handleChange(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
    placeholder="Placeholder"
  />
</div>
```

## Notas Importantes

1. **Responsive**: Usar `md:` breakpoints para layouts de 2 columnas
2. **Scroll**: El contenido debe tener `overflow-y-auto` y `flex-1 min-h-0`
3. **Focus**: Siempre usar `focus:ring-2 focus:ring-sky-500` para accesibilidad
4. **Disabled**: Usar `bg-gray-100 text-gray-500 cursor-not-allowed` para campos deshabilitados
5. **Obligatorios**: Marcar con `<span className="text-red-500">*</span>`
6. **Espaciado**: Usar `gap-4` entre campos, `space-y-4` entre secciones

