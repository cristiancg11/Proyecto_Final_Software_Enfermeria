# Manos Seguras • Plataforma de Bioseguridad y Lavado de Manos OMS

Plataforma educativa y de evaluación clínica interactiva para el entrenamiento de la técnica estandarizada de higiene de manos según la Organización Mundial de la Salud (OMS). Desarrollada como proyecto de grado para la Facultad de Enfermería de la Universidad Cooperativa de Colombia (UCC).

---

## 🛠️ Arquitectura Fullstack

### Frontend
- **Framework**: Angular (Standalone Components, Signals reactivos, `provideHttpClient(withFetch())`).
- **Diseño**: Tailwind CSS con paleta clínica institucional y glassmorphism.
- **Servicios**:
  - `AuthService`: Gestión de sesión, persistencia de token JWT y reactividad con Signals.
  - `PreguntasService`: Integración con API REST para cuestionarios diagnósticos y banco clínico.
  - `HandwashStateService`: Estado global biomecánico y de evaluación.

### Backend
- **Servidor**: Node.js + Express con TypeScript.
- **ORM**: Prisma ORM con PostgreSQL (alojado en Supabase).
- **Seguridad**: Autenticación JWT (`bcryptjs` + `jsonwebtoken`), control de acceso basado en roles (`ESTUDIANTE`, `DOCENTE`), validación de esquemas con `Zod` y CORS configurado.
- **Rutas API**:
  - `/api/auth/registro`, `/api/auth/login`, `/api/auth/me`
  - `/api/preguntas/estudiante`, `/api/preguntas/docente`, `/api/preguntas`, `/api/preguntas/diagnostico`
  - `/api/practicas/intento`, `/api/practicas/historial`

---

## 🚀 Puesta en Marcha

### 1. Backend API (http://localhost:3000/api)
```bash
cd backend
npm install
# Configurar DATABASE_URL y DIRECT_URL en backend/.env (usar .env.example como guía)
npx prisma generate
npx prisma db push
npx ts-node src/seed.ts   # Carga docente inicial y preguntas OMS
npm run dev               # Inicia servidor Express en el puerto 3000
```

### 2. Frontend Angular (http://localhost:4200)
```bash
npm install
npm start                 # Inicia ng serve en el puerto 4200
```

---

## 🧪 Pruebas y Compilación
- **Frontend Build**: `npm run build`
- **Backend Lint/TypeCheck**: `cd backend && npm run build`

