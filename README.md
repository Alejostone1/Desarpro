# DesarPro

DesarPro es un sitio web profesional moderno, tipo landing page y portal de administración, diseñado para presentar servicios de tecnología, software a medida, IA, ciberseguridad e infraestructura con una experiencia visual premium. El proyecto combina una interfaz React + Vite con un sistema de edición visual y autenticación administrativa basada en Prisma y SQLite.

## ✨ Características principales

- Diseño editorial y cinematográfico con animaciones suaves
- Tema claro/oscuro persistente
- Ruta por hash para navegación SPA
- Panel administrativo con edición en vivo
- Autenticación de administrador con backend local
- Base de datos Prisma SQLite para usuarios del panel
- Compatibilidad con Vite para desarrollo rápido

## 🧰 Stack tecnológico

- React 18
- Vite 5
- Express.js
- Prisma + SQLite
- bcryptjs
- GSAP + ScrollTrigger
- Babel (para el modelo de componentes basado en archivos JSX cargados en la web)

## 🏗️ Estructura del proyecto

```text
.
├── index.html
├── package.json
├── server.js
├── prisma/
│   └── schema.prisma
├── src/
│   ├── App.jsx
│   ├── components/
│   ├── lib/
│   └── pages/
├── media/
└── tokens.css
```

## 🚀 Inicio rápido

### Requisitos

- Node.js 18 o superior
- npm

### Instalación

```bash
npm install
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Esto levantará:
- la interfaz Vite en http://localhost:3000
- el backend de autenticación en http://localhost:3001

## 🔐 Acceso al panel administrador

El login del panel usa autenticación real con base de datos local.

### Usuario inicial

- Email: admin@desarpro.com
- Contraseña: Administrador01

### Rutas principales

- Inicio: http://localhost:3000/#home
- Login: http://localhost:3000/#login
- Panel admin: http://localhost:3000/#admin

## 🗄️ Base de datos

El proyecto usa Prisma con SQLite para almacenar usuarios del panel administrativo.

### Generar la base de datos

```bash
npx prisma generate
npx prisma db push
node seed.js
```

## 🛠️ Scripts disponibles

```bash
npm run dev      # levanta frontend + backend
npm run build    # construye la app para producción
npm run preview  # previsualiza el build
```

## 🎨 Personalización

Puedes ajustar:
- textos y contenido desde el panel admin
- colores y variables en tokens.css
- assets visuales en media/
- componentes en src/components/

## 📌 Notas

Este proyecto está pensado como una base sólida para una agencia, estudio o consultora tecnológica que necesite mostrar servicios, procesos y un panel editorial con control administrativo.

## 👥 Fundadores y creadores

DesarPro nació de la visión y el trabajo conjunto de:

- Daniel Felipe Colorado
- Alejandro Piedrahita Muñoz

Ambos impulsan este proyecto con una mirada estratégica, creativa y técnica, orientada a construir soluciones digitales modernas, escalables y con alto impacto visual.

## ©️ Autor

DesarPro · Desarrollo de software profesional
Pereira, Colombia · 2026
