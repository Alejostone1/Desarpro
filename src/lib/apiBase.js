// resolveApiBase — detect backend URL for localhost, LAN (mobile) and production.

function isLoopbackHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function readMetaApiBase() {
  if (typeof document === 'undefined') return undefined;
  const meta = document.querySelector('meta[name="desarpro:api"]');
  let base = meta?.getAttribute('content') || '';
  if (base && base.startsWith('%VITE_')) base = '';
  return base ? base.replace(/\/+$/, '') : '';
}

function resolveApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:3001';

  if (window.__DESARPRO_API_BASE !== undefined) {
    return window.__DESARPRO_API_BASE;
  }

  const fromMeta = readMetaApiBase();
  if (fromMeta) return fromMeta;

  const { protocol, hostname, port } = window.location;
  // Vite dev (PC o celular en la misma red: http://192.168.x.x:3000)
  if (port === '3000' || port === '5173' || isLoopbackHost(hostname)) {
    return `${protocol}//${hostname}:3001`;
  }

  // Producción (Vercel): mismo origen → /api/* proxy en Vercel → BACKEND_URL
  return '';
}

function hasApiBackend() {
  return resolveApiBase() != null;
}

export { resolveApiBase, hasApiBackend, isLoopbackHost };
