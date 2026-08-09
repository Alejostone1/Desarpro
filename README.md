# DesarPro · Sitio web profesional

**Stack:** Vanilla HTML + React 18 vía Babel CDN (sin build, sin Vite, sin Node).
**Tema:** Oscuro/claro con toggle global persistente (`localStorage`).
**i18n preparado:** ES (default) · EN · PT — se completa desde el panel admin.

---

## 🚀 Cómo abrir el proyecto

El sitio carga un video MP4 local (`media/earth-night.mp4`) como fondo del hero,
por lo que **no se puede abrir con doble clic** (`file://`) — los navegadores
bloquean la reproducción de archivos locales por seguridad.

### Opción 1 — VS Code Live Server (recomendado)
1. Instala la extensión "Live Server" de Ritwick Dey.
2. Click derecho sobre `index.html` → **Open with Live Server**.

### Opción 2 — Python (rápido, sin instalar nada)
```bash
cd desarpro
python3 -m http.server 8080
```
Abrir: <http://localhost:8080>

### Opción 3 — Node
```bash
cd desarpro
npx serve .
```

---

## 🔐 Panel administrador

- **URL:** `/#admin` o usa el tab "Admin" en `/#login`
- **Contraseña:** `Administrador01`
- **Funcionalidad:**
  - Editar TODO el contenido del sitio (hero, servicios, contacto, etc.)
  - Activar "edición en vivo" → click directo sobre cualquier texto del sitio
  - Exportar/Importar contenido en JSON
  - Restablecer a los valores originales
  - Cambios persisten en `localStorage` del navegador
- Para editar el sitio **en producción**, exporta el JSON desde el admin y
  reemplaza los `defaultValue` en `src/lib/admin.jsx` (`DEFAULT_CONTENT`).

---

## 🎨 Tema oscuro/claro

- Toggle en la barra de navegación (icono sol/luna).
- Persiste entre sesiones vía `localStorage.desarpro:theme`.
- Las animaciones del hero (video Earth) y del login (globo rotativo) siempre
  permanecen oscuras — son superficies inmersivas.

---

## 📂 Estructura

```
index.html                Punto de entrada
tokens.css                Variables CSS (tema, colores, spacing, animaciones)
media/                    Assets binarios
  earth-night.mp4         Video branded del Hero (incluye logo + arcos)
  earth-night.gif         Fallback animado para autoplay bloqueado
  earth-still.jpg         Poster (primer frame del video)
src/
  lib/
    icons.jsx             Inline SVG icons (~50)
    anim.jsx              useInView, Reveal, Stagger, CountUp
    theme.jsx             ThemeProvider, useTheme, ThemeToggle
    admin.jsx             AdminProvider, useAdmin, Editable, AdminFab
    techLogos.jsx         24 logos oficiales de marca (React, Python, Docker…)
  components/
    HeroVideoBg.jsx       Video MP4 fullscreen con fallbacks
    EarthGlobeScene.jsx   Globo terráqueo rotativo (Login)
    HoloAssistant.jsx     Avatar holográfico AI (Contacto)
    Logo.jsx              Logo DesarPro con variantes y animación
    Navbar.jsx            Barra de navegación con mega-menú
    Footer.jsx, NeuralNet.jsx, TechLoop.jsx, …
  pages/
    Home.jsx              Hero (video Earth) + servicios + tech + proceso
    Login.jsx             Login con globo terráqueo + tab admin
    Contact.jsx           Formulario + asistente holográfico
    Admin.jsx             Panel CMS completo
    Projects.jsx, About.jsx, ServicesHub.jsx, ServicePage.jsx
  App.jsx                 Root + routing por hash
```

---

## 🛠️ Personalización rápida

| Quiero cambiar... | Edita |
|---|---|
| Texto del hero, stats, servicios, contacto | Panel admin → exporta JSON |
| Video de fondo del Hero | `media/earth-night.mp4` |
| Colores de marca | `tokens.css` → `--blue, --cyan, --violet…` |
| Tecnologías mostradas en el loop | `src/lib/techLogos.jsx` |
| Logo (SVG) | `src/components/Logo.jsx` |
| Contraseña de admin | `src/lib/admin.jsx` → `ADMIN_PASSWORD` |

---

## ⚙️ Stack técnico

- React 18.3.1 (UMD CDN)
- ReactDOM 18.3.1 (UMD CDN)
- @babel/standalone 7.29.0 (compilación in-browser)
- Inter + Space Grotesk + JetBrains Mono (Google Fonts)
- Sin dependencias npm. Sin build step. Sin transpilación previa.

---

© 2026 DesarPro · Desarrollo de Software Profesional · Pereira, Colombia
