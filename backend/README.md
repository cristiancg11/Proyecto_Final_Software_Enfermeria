# Backend — Plataforma Educativa "Manos Seguras"

API REST desarrollada con **Node.js**, **Express**, **TypeScript**, **PostgreSQL** y **Prisma ORM** para la autenticación de estudiantes/docentes, gestión de preguntas clínicas y registro de prácticas biomecánicas de lavado de manos clínico OMS.

---

## 🛠️ Stack Tecnológico
- **Runtime:** Node.js (v18+)
- **Lenguaje:** TypeScript
- **Framework Web:** Express
- **ORM:** Prisma v6
- **Base de Datos:** PostgreSQL
- **Seguridad:** JWT (`jsonwebtoken`), Hashing (`bcryptjs`), Validación de esquemas (`zod`), CORS configurado para Angular/Vercel.

---

## 📁 Estructura del Backend
```text
backend/
├── prisma/
│   └── schema.prisma         # Modelos relacionales PostgreSQL
├── src/
│   ├── lib/
│   │   └── prisma.ts         # Instancia Singleton de PrismaClient
│   ├── routes/
│   │   ├── auth.routes.ts    # /api/auth (register, login, me)
│   │   ├── preguntas.routes.ts # /api/preguntas (test diagnóstico, gestión docente)
│   │   └── practicas.routes.ts # /api/practicas (intentos, certificados)
│   └── index.ts              # Servidor Express, CORS y middlewares
├── .env.example              # Plantilla de variables de entorno
├── .env                      # Variables de entorno locales
├── package.json
└── tsconfig.json
```

---

## 🚀 Comandos de Inicialización

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Generar el Cliente de Prisma
```bash
npx prisma generate
```

### 3. Aplicar migraciones a la Base de Datos
*(Asegúrate de configurar `DATABASE_URL` en tu archivo `.env`)*
```bash
npx prisma migrate dev --name init
```

### 4. Iniciar en modo desarrollo con recarga en caliente
```bash
npm run dev
```

### 5. Compilar para producción
```bash
npm run build
npm start
```
