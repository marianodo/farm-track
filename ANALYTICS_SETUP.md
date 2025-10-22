# Analytics Dashboard - Farm Track

Este documento explica cómo usar el nuevo sistema de analytics para administradores en Farm Track.

## 🎯 Características Implementadas

### Backend (NestJS)
- **Módulo Analytics**: `/backend/src/analytics/`
  - Controller: Endpoints REST para obtener métricas
  - Service: Lógica de negocio para procesar datos
  - Repository: Consultas optimizadas a la base de datos

### Frontend (Next.js)
- **Página de Analytics**: `/dashboard/analytics`
- **Botón en Sidebar**: Solo visible para usuarios ADMIN
- **Middleware**: Protección de rutas para administradores

## 📊 Métricas Disponibles

### Estadísticas Básicas
- Total de usuarios registrados
- Usuarios verificados
- Usuarios activos (que han creado campos)
- Total de campos (granjas)
- Total de corrales
- Total de mediciones
- Total de reportes
- Total de animales registrados
- Registros de productividad

### Análisis de Crecimiento
- Nuevos usuarios en el último mes
- Nuevos campos en el último mes
- Nuevas mediciones en el último mes
- Nuevos reportes en el último mes

### Evaluación de Uso
- Tasa de adopción (% usuarios activos)
- Promedio de campos por usuario
- Promedio de corrales por campo
- Promedio de mediciones por reporte
- Nivel de uso: Alto/Moderado/Bajo
- Indicadores de crecimiento y actividad

## 🚀 Cómo Acceder

### Para Administradores
1. **Iniciar sesión** con una cuenta que tenga rol `ADMIN`
2. **Navegar al dashboard** - verás el botón "Análisis de App" en el sidebar
3. **Hacer clic** en "Análisis de App" para acceder a las métricas

### Para Desarrolladores
1. **Backend**: Los endpoints están disponibles en `/analytics/*`
2. **Autenticación**: Requiere token JWT válido y rol ADMIN
3. **Endpoints disponibles**:
   - `GET /analytics/overview` - Todos los datos
   - `GET /analytics/basic-stats` - Solo estadísticas básicas
   - `GET /analytics/monthly-growth` - Solo crecimiento mensual
   - `GET /analytics/usage-summary` - Solo resumen de uso

## 🔧 Configuración

### Backend
El módulo Analytics ya está integrado en `app.module.ts`. No requiere configuración adicional.

### Frontend
- La ruta `/dashboard/analytics` está protegida por middleware
- Solo usuarios con rol `ADMIN` pueden acceder
- El botón en el sidebar aparece automáticamente para admins

## 📈 Interpretación de Resultados

### Nivel de Uso
- **🟢 Alto**: 5+ usuarios activos, crecimiento positivo, 10+ mediciones/mes
- **🟡 Moderado**: 2-4 usuarios activos, actividad regular
- **🔴 Bajo**: <2 usuarios activos, poca actividad

### Tasa de Adopción
- **>50%**: Excelente adopción
- **25-50%**: Buena adopción
- **<25%**: Baja adopción

### Indicadores de Crecimiento
- **✅ Positivo**: Nuevos usuarios en el último mes
- **⚠️ Estable**: Sin crecimiento significativo
- **❌ Declinando**: Disminución en actividad

## 🛠️ Personalización

### Agregar Nuevas Métricas
1. **Backend**: Modificar `analytics.repository.ts` para agregar consultas
2. **Frontend**: Actualizar interfaces TypeScript y componentes
3. **Visualización**: Agregar nuevas tarjetas o gráficos

### Modificar Criterios de Evaluación
Editar la función `getUsageEvaluation()` en `analytics.repository.ts`:

```typescript
// Cambiar umbrales de uso
if (basicStats.activeUsers >= 10) {  // Era 5
  usageLevel = 'high';
} else if (basicStats.activeUsers >= 5) {  // Era 2
  usageLevel = 'medium';
}
```

## 🔍 Troubleshooting

### Error: "No tienes permisos"
- Verificar que el usuario tenga rol `ADMIN`
- Revisar que el token JWT sea válido
- Confirmar que el middleware esté configurado correctamente

### Error: "Error al cargar datos"
- Verificar conexión a la base de datos
- Revisar logs del backend
- Confirmar que los endpoints estén funcionando

### Botón no aparece en sidebar
- Verificar que el usuario tenga rol `ADMIN`
- Revisar que `useAuthStore` esté funcionando
- Confirmar que el componente esté renderizando correctamente

## 📝 Próximas Mejoras

### Posibles Extensions
- **Gráficos interactivos**: Usar Chart.js o D3.js
- **Exportación de datos**: PDF/Excel reports
- **Alertas automáticas**: Notificaciones por email
- **Comparativas temporales**: Análisis de tendencias
- **Segmentación**: Analytics por región o tipo de usuario

### Integración con Script Python
El script Python que creamos anteriormente puede complementar este dashboard:
- **Análisis offline**: Para reportes profundos
- **Automatización**: Ejecutar análisis programados
- **Visualizaciones avanzadas**: Gráficos más complejos

## 🎉 ¡Listo!

El sistema de analytics está completamente implementado y funcional. Los administradores ahora pueden:

1. ✅ Ver métricas en tiempo real
2. ✅ Evaluar el uso de la aplicación
3. ✅ Identificar tendencias de crecimiento
4. ✅ Tomar decisiones basadas en datos

¡La aplicación Farm Track ahora tiene visibilidad completa de su uso y adopción!
