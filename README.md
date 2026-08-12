<div align="center">

<img src="docs/readme/banner.svg" alt="DesarPro — banner" width="100%" />

# DesarPro

**Plataforma corporativa, CMS multilingüe y portales admin/cliente para desarrollo de software profesional**

*Sitio público · Panel administrativo · Portal cliente · Chat · Entregables · Notificaciones*

<br/>

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Producción-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel)](https://vercel.com/)
[![Railway](https://img.shields.io/badge/Railway-Backend-0B0D0E?style=flat-square&logo=railway)](https://railway.app/)

<br/>

[![Estado](https://img.shields.io/badge/Estado-Producción-22c55e?style=flat-square)](https://desarpro.vercel.app)
[![Frontend](https://img.shields.io/badge/Frontend-desarpro.vercel.app-22D3EE?style=flat-square)](https://desarpro.vercel.app)
[![API](https://img.shields.io/badge/API-Railway-3B82F6?style=flat-square)](https://desarpro-production.up.railway.app/api/health)
[![i18n](https://img.shields.io/badge/i18n-5_idiomas-F59E0B?style=flat-square)](#-internacionalización)
[![Tests](https://img.shields.io/badge/Smoke-56%2F56_PASS-22c55e?style=flat-square)](#-tests-y-calidad)

<br/>

[🌐 Demo en vivo](https://desarpro.vercel.app) · [📖 Documentación producción](docs/PRODUCTION.md) · [🔐 Login portal](https://desarpro.vercel.app/#/login) · [🛡️ Admin](https://desarpro.vercel.app/#/admin)

---

</div>

## 📋 Índice

- [Resumen ejecutivo](#-resumen-ejecutivo)
- [Capturas de pantalla](#-capturas-de-pantalla)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Instalación y configuración](#-instalación-y-configuración)
- [Variables de entorno](#-variables-de-entorno)
- [Base de datos SQLite](#-base-de-datos-sqlite)
- [Autenticación y RBAC](#-autenticación-y-rbac)
- [Módulos del sistema](#-módulos-del-sistema)
- [API Reference](#-api-reference)
- [Internacionalización](#-internacionalización)
- [Manual de usuario](#-manual-de-usuario)
- [Sistema de diseño y UX](#-sistema-de-diseño-y-ux)
- [Tests y calidad](#-tests-y-calidad)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Créditos](#-créditos)

---

## 🎯 Resumen ejecutivo

**DesarPro** es la plataforma digital de **Daniel Colorado** y **Alejandro Piedrahita**: un sitio corporativo de alto impacto visual, un **CMS administrativo** completo y **portales admin/cliente** con autenticación RBAC, chat, entregables, notificaciones, webhooks e integraciones.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│   "Tecnología que transforma tu negocio — software a medida,         │
│    apps móviles, SaaS, IA e infraestructura para LATAM."             │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### ✨ Capacidades principales

| Capacidad | Descripción |
|-----------|-------------|
| 🌐 **Sitio corporativo** | Hero audiovisual, servicios, tecnologías, procesos, proyectos, contacto |
| 🌍 **5 idiomas** | ES · EN · PT · FR · DE con paridad verificada (226 claves) |
| 🎨 **CMS en vivo** | Edición de contenido, proyectos, servicios, SEO y configuración global |
| 🛡️ **Portal admin** | Dashboard, clientes, usuarios, proyectos, entregables, leads, permisos |
| 👤 **Portal cliente** | Dashboard, proyectos, chat, notificaciones, perfil y entregables |
| 🔐 **RBAC completo** | `super_admin` · `admin` · `client` con permisos granulares |
| 💬 **Mensajería** | Conversaciones admin↔cliente con historial persistente |
| 📦 **Entregables** | Subida/gestión de archivos por proyecto con notificaciones |
| 🔔 **Notificaciones** | In-app con contador, lectura individual y masiva |
| 🔗 **Webhooks** | Eventos configurables con deduplicación |
| 📧 **Email opcional** | SMTP para reset, aprobación, suspensión y alertas |
| 📱 **Mobile-first** | Login vía proxy `/api` same-origin — compatible Safari móvil |
| 🗄️ **SQLite persistente** | Railway Volume `/data/prod.db` en producción |

---

## 📸 Capturas de pantalla

> Capturas reales de [desarpro.vercel.app](https://desarpro.vercel.app) — producción.

### Home — Hero corporativo

<img src="docs/readme/home-hero.png" alt="DesarPro — Home hero" width="100%" />

### Portal de login (cliente + admin)

<img src="docs/readme/login-portal.png" alt="DesarPro — Login portal" width="100%" />

### Portafolio de proyectos

<img src="docs/readme/projects-portfolio.png" alt="DesarPro — Proyectos" width="100%" />

---

## 🔧 Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&style=flat-square&logoColor=black) | 18.3 | UI con hooks, contextos y rutas hash |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&style=flat-square&logoColor=white) | 5.4 | Build ESM, HMR en desarrollo |
| CSS nativo + `tokens.css` | — | Design tokens, temas claro/oscuro, responsive |
| Hash routing | — | `#/`, `#/admin`, `#/client` — compatible hosting estático |

### Backend & Infraestructura

| Tecnología | Versión | Rol |
|------------|---------|-----|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&style=flat-square&logoColor=white) | 20+ | Runtime Express |
| ![Express](https://img.shields.io/badge/-Express-000000?logo=express&style=flat-square&logoColor=white) | 5.2 | API REST, CORS, rate limit, sesiones |
| ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&style=flat-square&logoColor=white) | 5.22 | ORM type-safe |
| ![SQLite](https://img.shields.io/badge/-SQLite-003B57?logo=sqlite&style=flat-square&logoColor=white) | 3.x | BD en dev (`./dev.db`) y prod (`/data/prod.db`) |
| ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&style=flat-square&logoColor=white) | — | Frontend estático + proxy `/api/*` |
| ![Railway](https://img.shields.io/badge/-Railway-0B0D0E?logo=railway&style=flat-square&logoColor=white) | — | Backend Docker + Volume persistente |
| bcryptjs | 3.0 | Hash de contraseñas |
| nodemailer | 6.9 | SMTP opcional |

### DevTools & QA

| Herramienta | Uso |
|-------------|-----|
| `smoke-test.js` | 56 pruebas API (auth, RBAC, ownership, CMS) |
| `scripts/i18n-parity-check.js` | Paridad 226×5 idiomas |
| `scripts/browser-test.js` | 280 pruebas E2E con Puppeteer + Chrome |
| `scripts/admin-verify.js` | E2E del CMS admin |
| `scripts/verify-production.js` | Checklist post-deploy producción |

---

## 🏛️ Arquitectura del sistema

### Vista general — Producción

```mermaid
graph TB
    subgraph VER["🌐 Vercel — desarpro.vercel.app"]
        FE["React 18 + Vite build"]
        PROXY["Rewrite /api/* → Railway"]
    end

    subgraph MOB["📱 Browser / Móvil"]
        USER["Usuario visitante · cliente · admin"]
    end

    subgraph RW["🚂 Railway — desarpro-production"]
        EX["Express 5 API"]
        SA["start-api.js"]
        VOL[("Volume /data")]
        DB[("prod.db SQLite")]
    end

    USER --> FE
    FE -->|"Same-origin /api/login"| PROXY
    PROXY --> EX
    FE -.->|"Dev/LAN :3001"| EX
    SA --> EX
    EX --> PRISMA["Prisma 5"]
    PRISMA --> DB
    DB --- VOL
```

### Resolución de API (frontend)

```mermaid
flowchart TD
    A[resolveApiBase] --> B{¿Dev/LAN?}
    B -->|localhost · 192.168.x.x :3000/5173| C["http://hostname:3001"]
    B -->|Producción Vercel| D["'' → /api proxy same-origin"]
    D --> E[vercel.json rewrite]
    E --> F[Railway Express]
    C --> F
```

> **Importante móvil:** en producción las peticiones van a `desarpro.vercel.app/api/*`, **no** cross-origin a Railway. Esto evita bloqueos CORS en Safari iOS.

### Flujo de autenticación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend React
    participant V as Vercel /api proxy
    participant E as Express Railway
    participant P as Prisma + SQLite

    U->>F: Email + contraseña
    F->>V: POST /api/login
    V->>E: Forward request
    E->>P: findUnique + bcrypt.compare
    P-->>E: Usuario válido
    E->>P: create Session token
    E-->>F: { ok, token, user }
    F->>F: sessionStorage token
    F-->>U: Redirect #/admin o #/client
```

### RBAC — Roles y destinos

```mermaid
graph LR
    SA((super_admin)) --> AD["#/admin — permisos totales"]
    ADM((admin)) --> AD2["#/admin — permisos según rol"]
    CL((client)) --> CLP["#/client — solo sus proyectos"]

    style SA fill:#F59E0B,color:#000
    style ADM fill:#3B82F6,color:#fff
    style CL fill:#22C55E,color:#000
```

### Seed idempotente (producción)

```mermaid
stateDiagram-v2
    [*] --> Arranque
    Arranque --> UsuarioExiste: seed.js
    UsuarioExiste --> SinCambios: NO tocar password/rol/status
    Arranque --> UsuarioNuevo: email no existe
    UsuarioNuevo --> Crear: bcrypt hash demo
    SinCambios --> [*]
    Crear --> [*]

    note right of SinCambios
      SEED_RESET_PASSWORDS=1
      solo manual con autorización
    end note
```

---

## 📁 Estructura del proyecto

```
desarpro-full/
│
├── 📄 server.js                 # Express principal + CMS routes
├── 📄 seed.js                   # Seed idempotente (prod-safe)
├── 📄 smoke-test.js             # 56 pruebas de integración API
├── 📄 Dockerfile                # Imagen Railway (API + Prisma + SQLite)
├── 📄 railway.toml              # Deploy Railway: start:api + healthcheck
├── 📄 vercel.json               # Rewrite /api + security headers
├── 📄 index.html                # Meta desarpro:api + bootstrap API base
├── 📄 tokens.css                # Design tokens globales
│
├── 📁 prisma/
│   └── schema.prisma            # 20+ modelos SQLite
│
├── 📁 server/
│   ├── authUtils.js             # Sesiones, serialización, activity log
│   ├── permissions.js           # RBAC — PERMISSIONS + requirePermission
│   ├── portalRoutes.js          # Admin/cliente: users, projects, chat…
│   ├── integrationsRoutes.js    # SMTP status, webhooks
│   ├── emailService.js          # Nodemailer + templates
│   └── webhookService.js        # Dispatch eventos
│
├── 📁 scripts/
│   ├── start-api.js             # Arranque prod: /data, prisma, seed, express
│   ├── inject-api-url.js        # Inyecta VITE_API_URL en dist/
│   ├── build-local.js           # Build E2E con API localhost
│   ├── verify-production.js     # Checklist post-deploy
│   ├── browser-test.js          # 280 E2E browser
│   └── admin-verify.js          # E2E CMS admin
│
├── 📁 src/
│   ├── main.jsx                 # Entry React
│   ├── App.jsx                  # Router hash + providers
│   ├── pages/                   # Home, Admin, ClientApp, Login…
│   ├── components/              # Navbar, carruseles, globo 3D, portal UI
│   ├── lib/                     # apiBase, admin, portalData, serviceData
│   └── i18n/                    # translations.jsx + 5 idiomas
│
├── 📁 docs/
│   ├── PRODUCTION.md            # Guía Railway + Volume + variables
│   └── readme/                  # Screenshots + banner para README
│
└── 📁 dist/                     # Build Vite (generado)
```

---

## 🚀 Instalación y configuración

### Prerrequisitos

```bash
Node.js  >= 18.x
npm      >= 10.x
Git      >= 2.x
```

### 1. Clonar el repositorio

```bash
git clone https://github.com/desarpro-prog/Desarpro.git
cd Desarpro
```

### 2. Instalar dependencias

```bash
npm install
# Ejecuta postinstall → prisma generate
```

### 3. Configurar entorno local

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```

### 4. Base de datos local

```bash
npm run db:push
npm run db:seed
```

### 5. Desarrollo

```bash
npm run dev
```

| Servicio | URL |
|----------|-----|
| Frontend Vite | http://localhost:5173 |
| API Express | http://localhost:3001 |
| Health | http://localhost:3001/api/health |
| Admin CMS | http://localhost:5173/#/admin |
| Login | http://localhost:5173/#/login |

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Vite + Express en paralelo |
| `npm run build` | Build producción → `dist/` |
| `npm run build:local` | Build E2E con API en `:3001` |
| `npm run preview` | Preview del build Vite |
| `npm run start` | Solo Express (sin setup) |
| `npm run start:api` | Prod: prisma + seed + Express |
| `npm run db:push` | Sincronizar schema SQLite |
| `npm run db:seed` | Seed idempotente |
| `npm run test:smoke` | 56 pruebas API |
| `npm run i18n:check` | Paridad i18n 226×5 |
| `npm run test:e2e:browser` | 280 E2E browser |
| `npm run test:e2e:admin` | E2E CMS admin |
| `npm run verify:prod` | Verificar producción live |

---

## 🔐 Variables de entorno

Ver [`.env.example`](.env.example) y [`docs/PRODUCTION.md`](docs/PRODUCTION.md).

### Railway (backend)

| Variable | Producción | Secreta |
|----------|------------|---------|
| `DATABASE_URL` | `file:/data/prod.db` | No* |
| `NODE_ENV` | `production` | No |
| `CORS_ORIGIN` | `https://desarpro.vercel.app` | No |
| `APP_URL` | `https://desarpro.vercel.app` | No |
| `FRONTEND_URL` | `https://desarpro.vercel.app` | No |
| `SESSION_TTL_MS` | `604800000` | No |
| `ADMIN_EMAIL` | `admin@desarpro.com` | No |
| `ADMIN_PASSWORD` | *(mantener actual)* | **Sí** |
| `RUN_DB_SETUP` | `0` tras estabilizar | No |
| `SEED_ON_START` | `0` tras estabilizar | No |
| `SMTP_*` | según proveedor | **Sí** |

### Vercel (frontend)

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://desarpro-production.up.railway.app` *(opcional — proxy `/api` funciona sin ella en browser)* |

### Local (`.env`)

```env
DATABASE_URL="file:./dev.db"
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
PORT=3001
```

---

## 🗄️ Base de datos SQLite

| Entorno | Ruta | Persistencia |
|---------|------|--------------|
| Desarrollo | `file:./dev.db` | Archivo local |
| Producción | `file:/data/prod.db` | **Railway Volume** `desarpro-volume` |

### Diagrama ER (simplificado)

```mermaid
erDiagram
    User ||--o{ Session : tiene
    User ||--o{ ClientProject : posee
    User ||--o{ Notification : recibe
    User ||--o{ Conversation : participa
    ClientProject ||--o{ ProjectDeliverable : contiene
    ClientProject ||--o{ Message : via_conversation
    Conversation ||--o{ Message : contiene
    ContentKey ||--o{ ContentTranslation : traduce
    Project ||--o{ ProjectTranslation : traduce
    Service ||--o{ ServiceTranslation : traduce
    User {
        int id PK
        string email UK
        string passwordHash
        string role
        string status
    }
    Session {
        int id PK
        string token UK
        int userId FK
        datetime expiresAt
    }
    ClientProject {
        int id PK
        int clientId FK
        string title
        string status
        int progress
    }
    ContentKey {
        int id PK
        string key UK
        string section
    }
```

### Modelos Prisma (20)

`User` · `Session` · `PasswordResetToken` · `ClientProject` · `ProjectDeliverable` · `Conversation` · `Message` · `Notification` · `Webhook` · `ActivityLog` · `ContentKey` · `ContentTranslation` · `Project` · `ProjectTranslation` · `Lead` · `Service` · `ServiceTranslation` · `Technology` · `SeoEntry` · `SiteConfig` · `ContentSnapshot`

> **No migrar a PostgreSQL** sin plan explícito. La arquitectura actual está optimizada para SQLite + Volume Railway.

---

## 🔑 Autenticación y RBAC

### Roles

| Rol | Destino | Capacidades |
|-----|---------|-------------|
| `super_admin` | `#/admin` | Todos los permisos + gestión de roles |
| `admin` | `#/admin` | Según matriz de permisos asignada |
| `client` | `#/client` | Solo proyectos/datos propios (ownership) |

### Usuarios demo (desarrollo / staging)

| Email | Rol | Password | Destino |
|-------|-----|----------|---------|
| `super@desarpro.com` | super_admin | `Android.13` | `#/admin` |
| `admin@desarpro.com` | admin | `Android.13` | `#/admin` |
| `cliente@demo.com` | client | `Android.13` | `#/client` |
| `maria@demo.com` | client | `Android.13` | `#/client` |

> ⚠️ **No resetear contraseñas en producción** sin autorización. El seed es idempotente: usuarios existentes no se modifican.

### Seguridad implementada

- ✅ bcrypt para contraseñas
- ✅ Tokens de sesión aleatorios (32 bytes) con TTL configurable
- ✅ Rate limiting en login y contacto
- ✅ RBAC backend con `requirePermission`
- ✅ Ownership: cliente A **no** accede a datos de cliente B (403/404)
- ✅ CORS restringido en producción
- ✅ Secretos solo en Railway — nunca en Vercel build
- ✅ Reset tokens hasheados (no plaintext)
- ✅ Headers de seguridad en `vercel.json`

---

## 📦 Módulos del sistema

### 🏠 Sitio público

| Ruta hash | Módulo |
|-----------|--------|
| `#/` | Home — hero, servicios, tech loop, proceso, CTA |
| `#/servicios` | Hub de 12 servicios tecnológicos |
| `#/svc-*` | Detalle de servicio con entregables y proceso |
| `#/proyectos` | Portafolio, carrusel, paquetes estratégicos |
| `#/nosotros` | Misión, visión, valores, fundadores |
| `#/contacto` | Formulario → Lead en BD |
| `#/login` | Portal cliente + pestaña Admin |

### 🛡️ Portal administrativo (`#/admin`)

| Sección | Funcionalidad |
|---------|--------------|
| Dashboard | KPIs, alertas, métricas operativas |
| CMS Contenido | 84+ claves editables × 5 idiomas |
| Proyectos catálogo | CRUD portafolio público |
| Clientes | CRUD, estados, conversión leads |
| Proyectos cliente | CRUD con progreso, prioridad, entregables |
| Usuarios | CRUD + RBAC + reset password |
| Leads | Bandeja comercial con estados |
| Servicios / Tech / SEO | Catálogos editables |
| Mensajes | Chat con clientes |
| Notificaciones | Centro de alertas |
| Integraciones | SMTP, webhooks, email test |
| Configuración | Site config, settings generales |

### 👤 Portal cliente (`#/client`)

| Sección | Funcionalidad |
|---------|--------------|
| Dashboard | Resumen de proyectos activos |
| Proyectos | Lista y detalle con timeline |
| Mensajes | Chat con equipo DesarPro |
| Entregables | Descarga de archivos por proyecto |
| Notificaciones | Alertas de estado y entregas |
| Perfil / Settings | Datos personales |

---

## 🌐 API Reference

**Base producción:** `https://desarpro-production.up.railway.app`  
**Proxy Vercel:** `https://desarpro.vercel.app/api/*`

### Salud

```http
GET /api/health
```

```json
{
  "ok": true,
  "message": "API lista",
  "environment": "production",
  "database": { "connected": true, "provider": "sqlite" }
}
```

### Pública

| Método | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/api/health` | ❌ |
| `GET` | `/api/content?lang=es` | ❌ |
| `GET` | `/api/projects?lang=es` | ❌ |
| `GET` | `/api/services?lang=es` | ❌ |
| `GET` | `/api/technologies` | ❌ |
| `GET` | `/api/seo?lang=es` | ❌ |
| `GET` | `/api/site-config` | ❌ |
| `POST` | `/api/contact` | ❌ |
| `POST` | `/api/login` | ❌ |
| `POST` | `/api/auth/register` | ❌ |
| `POST` | `/api/auth/forgot-password` | ❌ |

### Autenticada (`x-admin-token`)

| Grupo | Endpoints destacados |
|-------|---------------------|
| CMS | `/api/admin/content`, `PUT /api/admin/content/:key` |
| Catálogo | `/api/projects`, `/api/services`, `/api/technologies` |
| Portal admin | `/api/admin/users`, `/api/admin/clients`, `/api/admin/client-projects` |
| Portal cliente | `/api/client/dashboard`, `/api/client/projects` |
| Chat | `/api/conversations`, `/api/conversations/:id/messages` |
| Notificaciones | `/api/notifications`, `PATCH /api/notifications/read-all` |
| Entregables | `/api/admin/deliverables`, `/api/client/deliverables` |
| Integraciones | `/api/admin/integrations/status`, `/api/admin/webhooks` |

> Lista completa en [`server.js`](server.js) + [`server/portalRoutes.js`](server/portalRoutes.js).

---

## 🌍 Internacionalización

| Idioma | Código | Estado |
|--------|--------|--------|
| 🇪🇸 Español | `es` | Default + CMS source |
| 🇺🇸 English | `en` | ✅ Paridad |
| 🇧🇷 Português | `pt` | ✅ Paridad |
| 🇫🇷 Français | `fr` | ✅ Paridad |
| 🇩🇪 Deutsch | `de` | ✅ Paridad |

```bash
npm run i18n:check
# → i18n parity OK (226 keys × 5 langs)
```

---

## 📖 Manual de usuario

### Visitante

1. Explorar servicios en `#/servicios`
2. Ver casos en `#/proyectos`
3. Contactar en `#/contacto`
4. Cambiar idioma/tema desde el header

### Cliente

1. Ir a [#/login](https://desarpro.vercel.app/#/login)
2. Pestaña **Iniciar sesión** → credenciales
3. Redirección automática a `#/client`
4. Consultar proyectos, chat y entregables

### Administrador

1. `#/login` → pestaña **Admin**
2. Email + contraseña admin
3. Panel completo en `#/admin`
4. Editar CMS, gestionar clientes y proyectos

### Desde móvil

Usar **https://desarpro.vercel.app** directamente. Las peticiones API van por proxy same-origin — no requiere configuración extra.

---

## 🎨 Sistema de diseño y UX

### Paleta DesarPro

| Token | Color | Uso |
|-------|-------|-----|
| `--bg-0` | `#05060A` | Fondo principal dark |
| `--accent-cyan` | `#22D3EE` | Highlights, gradientes hero |
| `--accent-blue` | `#3B82F6` | CTAs, links activos |
| `--accent-orange` | `#F59E0B` | Admin, badges premium |
| `--text-primary` | `#F8FAFC` | Texto principal |

### Componentes visuales destacados

- 🌍 **EarthGlobeScene** — globo 3D en login
- 🎬 **Hero video** — background cinematográfico
- 🔄 **TechLoop** — carrusel infinito de tecnologías
- 📊 **ProjectCarousel** — casos por industria
- 🌓 **Tema claro/oscuro** persistente en `localStorage`

### Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| `< 640px` | Menú hamburguesa, grids 1 col |
| `< 980px` | Login en columna única |
| `≥ 1024px` | Nav completa, layout 2 columnas |

---

## ✅ Tests y calidad

| Suite | Resultado | Comando |
|-------|-----------|---------|
| Build | ✅ PASS | `npm run build` |
| Smoke API | ✅ **56/56** | `npm run test:smoke` |
| i18n parity | ✅ **226×5** | `npm run i18n:check` |
| Browser E2E | ✅ **280/280** | `npm run build:local` + `npm run test:e2e:browser` |
| Admin E2E | ✅ **8/8** | `npm run build:local` + `npm run test:e2e:admin` |
| Prod verify | ✅ 9/10 | `npm run verify:prod` |

---

## 🚢 Despliegue

### Arquitectura producción

```
┌──────────────────────────────────────────────────────────────┐
│                      PRODUCCIÓN DESARPRO                      │
│                                                               │
│  ┌─────────────────┐         ┌──────────────────────────┐   │
│  │     Vercel      │  /api   │        Railway            │   │
│  │  React static   │ ──────► │  Express + Prisma         │   │
│  │  vercel.json    │  proxy  │  Docker + start-api.js    │   │
│  └─────────────────┘         │  Volume → /data/prod.db   │   │
│                               └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

| Servicio | URL |
|----------|-----|
| 🌐 Frontend | https://desarpro.vercel.app |
| ⚙️ API | https://desarpro-production.up.railway.app |
| ❤️ Health | https://desarpro-production.up.railway.app/api/health |

### Checklist Railway

- [x] Volume `desarpro-volume` montado en `/data`
- [x] `DATABASE_URL=file:/data/prod.db`
- [ ] `CORS_ORIGIN=https://desarpro.vercel.app` *(sin `*.vercel.app`)*
- [x] Dockerfile incluye carpeta `server/`
- [x] Health reporta `database.connected: true`

Guía completa: [`docs/PRODUCTION.md`](docs/PRODUCTION.md)

---

## 🗺️ Roadmap

```
✅ COMPLETADO
├── Sitio corporativo multilingüe (5 idiomas)
├── CMS admin completo
├── Portal cliente + admin con RBAC
├── Chat, notificaciones, entregables
├── Webhooks + integraciones SMTP
├── Despliegue Vercel + Railway + SQLite persistente
├── Login móvil vía proxy same-origin
├── Seed idempotente producción
└── 56 smoke + 280 browser E2E

🔄 EN CURSO
├── Restringir CORS a solo desarpro.vercel.app
├── RUN_DB_SETUP=0 / SEED_ON_START=0 en prod estable
└── SMTP producción (cuando haya proveedor)

🔜 PRÓXIMO
├── Dominio custom desarpro.com
├── PWA + push notifications
├── Panel analytics avanzado
└── Escalar BD si crece tráfico (evaluación futura)
```

---

## 👥 Créditos

<div align="center">

### Desarrollado por

| | |
|---|---|
| **Daniel Colorado** | Frontend · UI/UX · CMS · Animaciones |
| **Alejandro Piedrahita** | Backend · DevOps · RBAC · Arquitectura |

<br/>

**DesarPro** · Pereira, Colombia · 2026

[![GitHub](https://img.shields.io/badge/GitHub-desarpro--prog-181717?style=flat-square&logo=github)](https://github.com/desarpro-prog/Desarpro)
[![Live Demo](https://img.shields.io/badge/Demo-desarpro.vercel.app-22D3EE?style=flat-square&logo=vercel)](https://desarpro.vercel.app)

*"Tecnología que transforma tu negocio"*

</div>
