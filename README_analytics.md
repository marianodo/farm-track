# Farm Track Analytics Script

Este script te permite analizar el uso de la aplicación Farm Track directamente desde la base de datos PostgreSQL.

## 📊 Métricas que analiza

### Estadísticas Básicas
- **Total de usuarios registrados**
- **Usuarios verificados**
- **Usuarios activos** (que han creado al menos un campo)
- **Total de campos (granjas)**
- **Total de corrales**
- **Total de mediciones tomadas**
- **Total de reportes generados**
- **Total de animales registrados**

### Análisis de Crecimiento
- **Nuevos usuarios en el último mes**
- **Nuevos campos creados en el último mes**
- **Nuevas mediciones en el último mes**
- **Nuevos reportes en el último mes**

### Análisis de Actividad
- **Top 5 usuarios más activos**
- **Actividad por día de la semana**
- **Distribución geográfica de campos**
- **Métricas de productividad**

### Evaluación de Uso
- **Tasa de adopción** (usuarios activos / total usuarios)
- **Promedio de campos por usuario**
- **Promedio de corrales por campo**
- **Promedio de mediciones por reporte**
- **Evaluación general del uso de la aplicación**

## 🚀 Instalación y Uso

### 1. Instalar dependencias
```bash
pip install -r requirements_analytics.txt
```

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con:
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/farm_track_db
```

### 3. Ejecutar el script
```bash
python analytics_script.py
```

## 📈 Salidas del Script

### 1. Reporte en Consola
El script muestra un reporte detallado en la consola con todas las métricas.

### 2. Gráfico Visual
Genera un archivo `farm_track_analytics.png` con 4 gráficos:
- Crecimiento mensual de usuarios
- Actividad por día de la semana
- Distribución de campos por ubicación
- Resumen de métricas principales

### 3. Reporte JSON
Exporta todos los datos a un archivo JSON con timestamp para análisis posterior.

## 🔍 Interpretación de Resultados

### ¿La aplicación está siendo usada?

El script evalúa automáticamente el uso basado en:

**✅ Uso Activo:**
- 5+ usuarios activos
- Crecimiento en nuevos usuarios
- 10+ mediciones en el último mes

**⚠️ Uso Moderado:**
- 2-4 usuarios activos
- Algunas mediciones regulares

**❌ Poco Uso:**
- Menos de 2 usuarios activos
- Pocas o ninguna medición reciente

### Métricas Clave a Observar

1. **Tasa de Adopción**: % de usuarios que realmente usan la app
2. **Actividad Reciente**: Mediciones y reportes en el último mes
3. **Engagement**: Promedio de mediciones por usuario activo
4. **Crecimiento**: Tendencias mensuales de nuevos usuarios

## 🛠️ Personalización

Puedes modificar el script para:
- Cambiar los períodos de análisis
- Agregar nuevas métricas
- Modificar los criterios de evaluación de uso
- Personalizar los gráficos

## 📝 Ejemplo de Salida

```
📊 ESTADÍSTICAS BÁSICAS
==================================================
👥 Total de usuarios registrados: 25
✅ Usuarios verificados: 20
🔥 Usuarios activos: 8
🏡 Total de campos (granjas): 15
🐄 Total de corrales: 45
📈 Total de mediciones: 1,234
📋 Total de reportes: 89
🐮 Total de animales registrados: 234

📈 CRECIMIENTO MENSUAL
==================================================
👥 Nuevos usuarios (último mes): 3
🏡 Nuevos campos (último mes): 2
📈 Nuevas mediciones (último mes): 156
📋 Nuevos reportes (último mes): 12

🎯 EVALUACIÓN DE USO:
✅ La aplicación está siendo utilizada activamente
📈 Hay crecimiento en nuevos usuarios
📊 Hay actividad regular de mediciones
```

## 🔧 Troubleshooting

### Error de Conexión a la Base de Datos
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que la base de datos esté ejecutándose
- Verifica las credenciales de acceso

### Error de Dependencias
- Ejecuta: `pip install -r requirements_analytics.txt`
- Si hay problemas con matplotlib, instala: `pip install matplotlib --upgrade`

### Sin Datos
- Verifica que la base de datos tenga datos
- Revisa que las tablas existan y tengan el esquema correcto
