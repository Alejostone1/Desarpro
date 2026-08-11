// Inyecta BACKEND_URL / VITE_API_URL en dist/index.html tras el build de Vercel.
const fs = require('fs');
const path = require('path');

const distHtml = path.join(__dirname, '..', 'dist', 'index.html');
const apiUrl = (process.env.VITE_API_URL || process.env.BACKEND_URL || '').replace(/\/+$/, '');

if (!apiUrl) {
  console.log('[inject-api-url] Sin VITE_API_URL/BACKEND_URL — producción usará /api proxy');
  process.exit(0);
}

if (!fs.existsSync(distHtml)) {
  console.warn('[inject-api-url] dist/index.html no encontrado, omitiendo');
  process.exit(0);
}

let html = fs.readFileSync(distHtml, 'utf8');
const metaRe = /(<meta\s+name="desarpro:api"\s+content=")([^"]*)(")/i;

if (!metaRe.test(html)) {
  console.warn('[inject-api-url] meta desarpro:api no encontrada');
  process.exit(0);
}

html = html.replace(metaRe, `$1${apiUrl}$3`);
fs.writeFileSync(distHtml, html);
console.log(`[inject-api-url] API base inyectada: ${apiUrl}`);
