# DesarPro

**Tecnología que transforma tu negocio.**

DesarPro es un sitio web profesional moderno para una agencia de desarrollo de software. Presenta servicios de tecnología, software a medida, IA, ciberseguridad e infraestructura con una experiencia visual premium.

---

## ✨ Características

- Diseño editorial y cinematográfico con animaciones avanzadas
- Tema claro/oscuro persistente
- Soporte multiidioma (ES · EN · PT · FR · DE)
- Navegación SPA por hash
- Panel administrativo con edición en vivo (CMS local)
- Autenticación de administrador con backend local
- Robot holográfico interactivo en la página de contacto
- Globo terráqueo animado en la página de login
- Formulario de contacto con validación

## 🧰 Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| Frontend | React 18 (CDN) |
| Transpilación | Babel Standalone (in-browser) |
| Dev Server | Vite 5 |
| CSS | Vanilla CSS con Design Tokens |
| Backend (local) | Express.js 5 |
| Base de datos (local) | Prisma + SQLite |
| Fuentes | Inter · Space Grotesk · JetBrains Mono |

## 🏗️ Estructura del Proyecto

```text
.
├── index.html           # Punto de entrada principal
├── tokens.css           # Sistema de diseño (variables CSS)
├── package.json         # Dependencias y scripts
├── vercel.json          # Configuración de Vercel (headers, cache)
├── robots.txt           # Directivas para crawlers
├── .env.example         # Plantilla de variables de entorno
├── .gitignore           # Archivos excluidos de Git
├── server.js            # API de autenticación (solo desarrollo local)
├── seed.js              # Script para crear usuario admin inicial
├── prisma/
│   └── schema.prisma    # Schema de base de datos
├── media/
│   ├── earth-night.mp4  # Video de fondo del hero
│   ├── earth-night.gif  # Fallback GIF
│   ├── earth-still.jpg  # Fallback imagen estática
│   └── servicios/       # Imágenes de servicios
├── src/
│   ├── App.jsx          # Componente raíz + routing
│   ├── components/      # Componentes visuales (Navbar, Footer, etc.)
│   ├── pages/           # Páginas (Home, Projects, Contact, etc.)
│   ├── lib/             # Utilidades (icons, theme, admin CMS, animations)
│   └── i18n/            # Sistema de internacionalización
```

## 🚀 Inicio Rápido

### Requisitos

- **Node.js** 18 o superior
- **npm**

### Instalación

```bash
npm install
```

### Variables de Entorno

Copia el archivo de ejemplo y ajusta si es necesario:

```bash
cp .env.example .env
```

### Desarrollo

```bash
npm run dev
```

Esto levanta:
- La interfaz Vite en **http://localhost:3000**
- El backend de autenticación en **http://localhost:3001**

### Build

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

## 🗄️ Base de Datos (Desarrollo Local)

El proyecto usa Prisma con SQLite para almacenar usuarios del panel administrativo.

```bash
npx prisma generate
npx prisma db push
node seed.js
```

## 🔐 Panel Administrador

El sistema incluye un panel administrativo para edición de contenido en vivo.

- Accede desde: `/#login` → pestaña **Admin**
- Funcionalidad: edición inline de textos, gestión de contenido
- Datos almacenados en localStorage del navegador

> **Nota**: En producción (Vercel), la autenticación funciona localmente sin backend.

## 🌐 Deploy en Vercel

### Configuración

| Campo | Valor |
|---|---|
| **Framework Preset** | `Other` |
| **Root Directory** | *(vacío)* |
| **Build Command** | *(vacío — override)* |
| **Output Directory** | `.` |
| **Node Version** | `18.x` |

### Pasos

1. Push a la rama `main` en GitHub
2. Importar repositorio en [Vercel](https://vercel.com)
3. Configurar según la tabla anterior
4. Deploy

### Flujo de Despliegue

```
main → Production (automático)
PR / branch → Preview (automático)
```

### Variables de Entorno en Vercel

No se requieren variables de entorno para el despliegue en Vercel. El sitio funciona como contenido estático.

## 🌍 Dominio Personalizado (Futuro)

El proyecto está preparado para conectar un dominio personalizado sin modificar el código:

1. Ir a **Vercel** → Project → **Settings** → **Domains**
2. Agregar el dominio (ej: `desarpro.com`)
3. Agregar `www.desarpro.com` si se desea
4. Configurar DNS según instrucciones de Vercel
5. Vercel genera el certificado SSL automáticamente
6. Seleccionar el dominio principal (redirección www ↔ root)

**No se necesita modificar el código** — todas las rutas son relativas y la navegación es por hash.

## 🎨 Personalización

- **Contenido**: Panel admin (`/#admin`) permite editar textos en vivo
- **Colores y variables**: `tokens.css`
- **Assets visuales**: `media/`
- **Componentes**: `src/components/`
- **Traducciones**: `src/i18n/translations.jsx`

## 👥 Fundadores

DesarPro nació de la visión y el trabajo conjunto de:

- **Daniel Felipe Colorado**
- **Alejandro Piedrahita Muñoz**

Ambos impulsan este proyecto con una mirada estratégica, creativa y técnica, orientada a construir soluciones digitales modernas, escalables y con alto impacto visual.

## ©️ Licencia

DesarPro · Desarrollo de software profesional
Pereira, Colombia · 2026
