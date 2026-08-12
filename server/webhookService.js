// Webhook dispatcher — fire-and-forget, never blocks main operation.

const crypto = require('crypto');

async function dispatchWebhooks(prisma, event, payload) {
  try {
    const hooks = await prisma.webhook.findMany({ where: { event, active: true } });
    if (!hooks.length) return;
    await Promise.allSettled(hooks.map((hook) => sendWebhook(hook, event, payload)));
  } catch (e) {
    console.warn('[webhook] dispatch error:', e.message);
  }
}

async function sendWebhook(hook, event, payload) {
  const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  const sig = hook.secret
    ? crypto.createHmac('sha256', hook.secret).update(body).digest('hex')
    : '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(hook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DesarPro-Event': event,
        ...(sig ? { 'X-DesarPro-Signature': sig } : {}),
      },
      body,
      signal: controller.signal,
    });
    if (!res.ok) console.warn(`[webhook] ${hook.name} HTTP ${res.status}`);
  } catch (e) {
    console.warn(`[webhook] ${hook.name} failed:`, e.message);
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { dispatchWebhooks };
