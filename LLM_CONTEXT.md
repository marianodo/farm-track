### Farm Track — Contexto para LLM

### Propósito del negocio
- **Objetivo**: digitalizar y optimizar la gestión ganadera mediante captura ágil de datos en campo y análisis en web.
- **Captura en campo**: la app móvil registra mediciones de variables de animales e instalaciones (pH urinario, fecal score, condición corporal, higiene, score de comedero/bebedero, etc.).
- **Gestión y análisis**: el dashboard web muestra estadísticas, gráficos, reportes, variaciones y permite configurar el campo.
- **Validación**: cada variable tiene rangos óptimos/mínimos/máximos; mediciones fuera de rango se marcan como “incorrectas”.

### Arquitectura del proyecto
- `frontend/`: App móvil (Expo/React Native) para tomar mediciones en campo.
- `dashboard/`: App web (Next.js) para analítica, reportes y configuración.
- `backend/`: API (NestJS + Prisma) conectada a PostgreSQL, maneja autenticación, autorización, reglas de negocio y endpoints REST.

### Flujo de datos (alto nivel)
1. Usuario crea `Field` (campo) y `Pen` (corral) en el dashboard.
2. Define `TypeOfObject` (p. ej. Vaca, Bebedero) y `Variable` (p. ej. pH, Fecal score) y las asocia.
3. En el móvil, se crean `Subject` (animales u objetos medibles) y se registran `Measurement` usando combinaciones de `Pen + Variable + TypeOfObject`.
4. Las mediciones se agrupan en `Report` por campo; el dashboard muestra métricas, tendencias y productividad.

### Autenticación y autorización
- JWT con `Authorization: Bearer <token>`.
- Guards globales para JWT, roles y ownership de recursos.
- Roles: `USER`, `ADMIN`. Endpoints de analytics son solo `ADMIN` por defecto.

### Variables de entorno (principales)
- `DATABASE_URL`: cadena de conexión a PostgreSQL (usada por Prisma y scripts de analytics).
- `JWT_SECRET`: clave para firmar tokens.
- `OPENAI_API_KEY`: para el chatbot.
- Expiración de tokens: `TOKEN_EXPIRES` (módulo JWT) y `ACCESS_TOKEN_EXPIRES`/`REFRESH_TOKEN_EXPIRES` (emisión de tokens en login).
- Dashboard consume el backend usando `NEXT_PUBLIC_API_URL` (ideal que apunte a `http://localhost:4000/api` en local).

Ejemplo `.env` (local):
```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/farm_track_db
JWT_SECRET=supersecret
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Modelo de datos (resumen)
- **User**
  - Crea `Field`, `TypeOfObject`, `Variable`, `Productivity`.
- **Field (Campo)**
  - Pertenece a `User`.
  - Tiene `Pen` (corrales), `Report`, `Subject` (animales/entidades medibles).
- **Pen (Corral)**
  - Pertenece a un `Field`.
  - Se asocia a `TypeOfObject` y a variables específicas mediante `PenVariableTypeOfObject`.
- **TypeOfObject**
  - Categorías (p.ej. “Vaca”, “Bebedero”, “Comedero”).
  - Relación N–N con `Variable` (qué variables aplican a ese tipo).
  - Tiene `Subject`.
- **Subject (Animal/Entidad)**
  - Pertenece a un `Field` y a un `TypeOfObject` (p. ej. una vaca).
- **Variable**
  - `type`: `NUMBER` o `CATEGORICAL`.
  - Se asocia a `TypeOfObject` (qué se puede medir) y a `Pen`+`TypeOfObject` con parámetros específicos mediante `PenVariableTypeOfObject`.
- **PenVariableTypeOfObject**
  - Clave para medir: une `Pen` + `Variable` + `TypeOfObject`.
  - Tiene `custom_parameters` (JSON) para rangos óptimos/min/máx, unidades, categorías permitidas, etc.
  - Referenciada por `Measurement` para saber “qué variable, de qué tipo y en qué corral” se midió.
- **Report**
  - Agrupa mediciones por `Field` con `correlative_id`.
  - Puede tener `Productivity` asociada (totales, promedios, etc.).
- **Measurement**
  - Valor medido (`value`: string), referencia a `pen_variable_type_of_object`, `subject` y `report`.
- **Productivity**
  - Métricas agregadas asociadas a un `Report` (p. ej. producción promedio, % grasa/proteína).

Relaciones clave (simplificadas):
- Usuario 1–N Campos
- Campo 1–N Corrales | 1–N Reports | 1–N Subjects
- TipoDeObjeto N–N Variables | 1–N Subjects | N–N Corrales (vía tabla intermedia)
- Medición N–1 PenVariableTypeOfObject | N–1 Subject | N–1 Report
- Reporte 1–N Medición | 1–1 Productividad

### Validación de variables y rangos
Los rangos y parámetros por variable se guardan en `PenVariableTypeOfObject.custom_parameters` para personalizarlos por corral y tipo.

Esquemas sugeridos de `custom_parameters`:

Variables numéricas
```json
{
  "type": "NUMBER",
  "unit": "pH",
  "min": 5.5,
  "max": 8.5,
  "optimal": { "min": 6.0, "max": 7.5 },
  "warnThresholds": { "low": 5.8, "high": 8.0 }
}
```

Variables categóricas
```json
{
  "type": "CATEGORICAL",
  "allowedValues": ["1", "2", "3", "4", "5"],
  "goodValues": ["3", "4"],
  "badValues": ["1", "2", "5"]
}
```

Reglas de evaluación (alto nivel):
- Si `type=NUMBER`: `value < min` o `value > max` → incorrecto; fuera de `optimal` → advertencia.
- Si `type=CATEGORICAL`: `value` no está en `allowedValues` → incorrecto; si está en `badValues` → advertencia.

### API y acceso
- Prefijo global del backend: `/api`.
- Autenticación por JWT; `RolesGuard` y reglas de ownership restringen acceso.
- Endpoints de analytics (`/analytics/*`) requieren rol `ADMIN`.
- En dashboard, las llamadas usan `NEXT_PUBLIC_API_URL`; el chatbot se proxya con rewrite de Next (`/api/chatbot/*`).

### Conexión a base de datos
- PostgreSQL vía Prisma (`DATABASE_URL`).
- El servicio de Prisma se inicia con logs de `error` y `warn` y conexión en `onModuleInit`.

### Glosario rápido
- Campo (`Field`): establecimiento/granja.
- Corral (`Pen`): subdivisión del campo.
- Sujeto (`Subject`): animal u objeto medible.
- Tipo de objeto (`TypeOfObject`): categoría (vaca, bebedero, etc.).
- Variable: qué se mide (numérica o categórica).
- Reporte (`Report`): agrupación de mediciones.
- Productividad: métricas agregadas por reporte.

### Notas operativas
- Para desarrollo local: backend en `http://localhost:4000/api`; dashboard usa `NEXT_PUBLIC_API_URL` apuntando al backend; app móvil consume la misma API.
- Chatbot requiere `OPENAI_API_KEY`. Endpoint de salud: `/api/chatbot/health`.


