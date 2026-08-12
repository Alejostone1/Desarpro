# DESARPRO — Guía de producción (SQLite + Railway + Vercel)

## Arquitectura

```
Vercel (https://desarpro.vercel.app)
  ↓ fetch directo (VITE_API_URL) o proxy /api
Railway (https://desarpro-production.up.railway.app)
  ↓ Express
Prisma
  ↓
SQLite → /data/prod.db
  ↓
Railway Volume (mount: /data) ← VERIFICAR MANUALMENTE
```

## 1. Volume Railway (PRIORIDAD #1)

**NO PUEDO VERIFICAR EL VOLUME DESDE EL CÓDIGO; DEBE CONFIRMARSE EN RAILWAY.**

### Configuración esperada

| Campo | Valor |
|-------|-------|
| Mount Path | `/data` |
| Archivo BD | `/data/prod.db` |
| DATABASE_URL | `file:/data/prod.db` |

### Cómo verificar en Railway

1. Abrir proyecto Railway → servicio backend
2. Ir a **Volumes** → confirmar volumen con mount `/data`
3. Tras un redeploy, revisar logs de arranque:
   - `[start-api] /data montado`
   - `[start-api] BD existente: /data/prod.db`
4. Opcional: Railway Shell → `ls -la /data/prod.db`

### Si NO hay volume

- Cada redeploy puede **perder todos los datos**
- El código advierte: `ADVERTENCIA: /data no existe`

## 2. Variables Railway

| Variable | Valor producción | Obligatoria | Secreta |
|----------|------------------|-------------|---------|
| DATABASE_URL | `file:/data/prod.db` | Sí | No* |
| NODE_ENV | `production` | Recomendada | No |
| CORS_ORIGIN | `https://desarpro.vercel.app` | Sí | No |
| APP_URL | `https://desarpro.vercel.app` | Recomendada | No |
| FRONTEND_URL | `https://desarpro.vercel.app` | Opcional | No |
| ADMIN_EMAIL | `admin@desarpro.com` | Seed inicial | No |
| ADMIN_PASSWORD | (tu contraseña) | Solo creación | **Sí** |
| RUN_DB_SETUP | `0` tras 1er deploy OK | Recomendada | No |
| SEED_ON_START | `0` tras 1er deploy OK | Recomendada | No |
| SMTP_* | según proveedor | Opcional | **Sí** |

*La ruta no es secreta; el archivo sí contiene datos sensibles.

**NO usar** `*.vercel.app` en CORS salvo necesidad de previews.

## 3. Variables Vercel

| Variable | Valor | Obligatoria |
|----------|-------|-------------|
| VITE_API_URL | `https://desarpro-production.up.railway.app` | Sí |

El build inyecta esta URL en `<meta name="desarpro:api">`.

`vercel.json` también tiene rewrite `/api/*` → Railway como fallback.

## 4. Seed seguro

### Cuándo se ejecuta

- `npm run start:api` → `scripts/start-api.js`
- Si `RUN_DB_SETUP≠0`: `prisma generate` + `db push` + `seed.js`
- Si `SEED_ON_START=0`: omite seed

### Comportamiento en producción (`NODE_ENV=production`)

| Acción | Default prod |
|--------|--------------|
| Crear usuarios demo si no existen | Sí |
| Sobrescribir contraseñas existentes | **No** |
| Sobrescribir CMS editado | **No** |
| Sobrescribir SiteConfig | **No** |
| Sobrescribir catálogo | **No** |
| Crear claves/traducciones faltantes | Sí |

Forzar reset: `SEED_RESET_PASSWORDS=1` (solo manual, con cuidado).

### Recomendación post-inicialización

```
RUN_DB_SETUP=0
SEED_ON_START=0
```

## 5. SQLite — limitaciones

- Un solo backend escribiendo
- Sin escalado horizontal
- Requiere volume persistente
- Adecuado para tráfico moderado
- PostgreSQL: evolución futura si crece tráfico/instancias

## 6. Health check

```
GET https://desarpro-production.up.railway.app/api/health
```

Respuesta esperada (sin secretos):

```json
{
  "ok": true,
  "message": "API lista",
  "environment": "production",
  "database": { "provider": "sqlite", "status": "ok", "path": "/data/prod.db" }
}
```

## 7. Autenticación cross-origin

- Token en `sessionStorage` → header `x-admin-token`
- Sin cookies → compatible Vercel ↔ Railway
- CORS debe incluir `PATCH` (corregido en server.js)

## 8. Checklist manual post-deploy

- [ ] Volume `/data` confirmado en Railway
- [ ] Health OK con `database.status: ok`
- [ ] Login admin en producción
- [ ] Login cliente en producción
- [ ] Redeploy → datos persisten
- [ ] CORS solo `https://desarpro.vercel.app`
- [ ] `RUN_DB_SETUP=0` tras verificar seed inicial
