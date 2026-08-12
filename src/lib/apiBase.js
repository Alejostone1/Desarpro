// resolveApiBase — localhost, LAN (móvil en WiFi) y producción (proxy /api en Vercel).

function isLoopbackHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isPrivateLanHost(hostname) {
  return /^192\.168\./.test(hostname)
    || /^10\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

function isDevHost(hostname, port) {
  if (isLoopbackHost(hostname)) return true;
  if (port === '3000' || port === '5173') return true;
  if (isPrivateLanHost(hostname)) return true;
  return false;
}

function readMetaApiBase() {
  if (typeof document === 'undefined') return '';
  const meta = document.querySelector('meta[name="desarpro:api"]');
  let base = meta?.getAttribute('content') || '';
  if (base && base.startsWith('%VITE_')) base = '';
  return base ? base.replace(/\/+$/, '') : '';
}

function resolveApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:3001';

  const { protocol, hostname, port } = window.location;

  // Dev local o celular en la misma red (http://192.168.x.x:3000)
  if (isDevHost(hostname, port)) {
    return `${protocol}//${hostname}:3001`;
  }

  // Producción (Vercel): mismo origen → vercel.json reescribe /api/* → Railway.
  // Evita CORS cross-origin que falla en Safari móvil y redes restrictivas.
  return '';
}

function hasApiBackend() {
  return resolveApiBase() != null;
}

export { resolveApiBase, hasApiBackend, isLoopbackHost, isDevHost, isPrivateLanHost };
