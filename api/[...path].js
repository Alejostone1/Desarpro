// Proxy /api/* en Vercel hacia el backend Express (Railway, Render, VPS…).
// Define BACKEND_URL en las variables de entorno del proyecto Vercel (sin barra final).

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

function pickHeaders(req) {
  const out = {};
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value || HOP_BY_HOP.has(key.toLowerCase())) continue;
    out[key] = value;
  }
  return out;
}

module.exports = async (req, res) => {
  const backend = (process.env.BACKEND_URL || process.env.VITE_API_URL || '').replace(/\/+$/, '');
  if (!backend) {
    return res.status(503).json({
      ok: false,
      error: 'Backend no configurado. Define BACKEND_URL en Vercel con la URL pública de tu API.',
    });
  }

  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join('/') : (segments || '');
  const qs = req.url && req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const target = `${backend}/api/${path}${qs}`;

  try {
    const init = {
      method: req.method,
      headers: pickHeaders(req),
    };

    if (req.method && !['GET', 'HEAD'].includes(req.method.toUpperCase())) {
      init.body = typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body ?? {});
    }

    const upstream = await fetch(target, init);
    const text = await upstream.text();

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });
    res.send(text);
  } catch (err) {
    res.status(502).json({
      ok: false,
      error: 'No se pudo conectar al backend. Revisa BACKEND_URL y que la API esté en línea.',
    });
  }
};
