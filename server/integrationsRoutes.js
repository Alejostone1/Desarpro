// Admin integrations: SMTP test, webhooks CRUD, analytics config.

const { emailStatus, sendEmail, verifySmtpConnection } = require('./emailService');
const { PERMISSIONS, requirePermission } = require('./permissions');
const { dispatchWebhooks } = require('./webhookService');

function registerIntegrationsRoutes(app, deps) {
  const { prisma, requireAuth } = deps;

  function requireAdmin(req, res, next) {
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'No autorizado' });
    }
    next();
  }

  app.get('/api/admin/integrations/status', requireAuth, requireAdmin, async (_req, res) => {
    const smtp = emailStatus();
    let general = {};
    try {
      const rows = await prisma.siteConfig.findMany({
        where: { key: { in: ['integrations.analytics', 'integrations.meta'] } },
      });
      rows.forEach((r) => { general[r.key] = JSON.parse(r.value || '{}'); });
    } catch (e) {}
    res.json({
      ok: true,
      integrations: {
        smtp,
        analytics: general['integrations.analytics'] || { enabled: false, measurementId: '' },
        meta: general['integrations.meta'] || { enabled: false, pixelId: '' },
        apiUrl: process.env.VITE_API_URL || process.env.APP_URL || null,
        environment: process.env.NODE_ENV || 'development',
      },
    });
  });

  app.post('/api/admin/integrations/email/test', requireAuth, requireAdmin, requirePermission(PERMISSIONS.INTEGRATIONS_EDIT), async (req, res) => {
    const to = String(req.body?.email || req.user.email).trim();
    const verify = await verifySmtpConnection();
    if (verify.skipped) {
      return res.json({ ok: false, skipped: true, reason: 'smtp_not_configured', message: 'SMTP no configurado' });
    }
    if (!verify.ok) {
      return res.status(500).json({ ok: false, error: verify.error || 'Error de conexión SMTP' });
    }
    const result = await sendEmail({
      to,
      template: 'welcome',
      data: { name: req.user.firstName || 'Admin', url: process.env.APP_URL || '', lang: 'es' },
    });
    if (result.skipped) {
      return res.json({ ok: false, skipped: true, reason: 'smtp_not_configured', message: 'SMTP no configurado' });
    }
    if (!result.ok) return res.status(500).json({ ok: false, error: result.error || 'Error al enviar' });
    res.json({ ok: true, message: 'Correo de prueba enviado correctamente' });
  });

  app.patch('/api/admin/integrations/analytics', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), async (req, res) => {
    const value = { enabled: !!req.body.enabled, measurementId: String(req.body.measurementId || '') };
    await prisma.siteConfig.upsert({
      where: { key: 'integrations.analytics' },
      update: { value: JSON.stringify(value) },
      create: { key: 'integrations.analytics', value: JSON.stringify(value) },
    });
    res.json({ ok: true, analytics: value });
  });

  app.patch('/api/admin/integrations/meta', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), async (req, res) => {
    const value = { enabled: !!req.body.enabled, pixelId: String(req.body.pixelId || '') };
    await prisma.siteConfig.upsert({
      where: { key: 'integrations.meta' },
      update: { value: JSON.stringify(value) },
      create: { key: 'integrations.meta', value: JSON.stringify(value) },
    });
    res.json({ ok: true, meta: value });
  });

  app.get('/api/admin/webhooks', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_VIEW), async (_req, res) => {
    const hooks = await prisma.webhook.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({
      ok: true,
      webhooks: hooks.map((h) => ({
        id: h.id, name: h.name, url: h.url, event: h.event, active: h.active,
        hasSecret: !!h.secret, createdAt: h.createdAt.toISOString(), updatedAt: h.updatedAt.toISOString(),
      })),
    });
  });

  app.post('/api/admin/webhooks', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), async (req, res) => {
    const { name, url, event, active, secret } = req.body || {};
    if (!name || !url || !event) return res.status(400).json({ ok: false, error: 'name, url, event requeridos' });
    const hook = await prisma.webhook.create({
      data: { name: String(name), url: String(url), event: String(event), active: active !== false, secret: String(secret || '') },
    });
    res.status(201).json({ ok: true, webhook: { id: hook.id, name: hook.name, url: hook.url, event: hook.event, active: hook.active, hasSecret: !!hook.secret } });
  });

  app.patch('/api/admin/webhooks/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), async (req, res) => {
    const id = Number(req.params.id);
    const data = {};
    ['name', 'url', 'event'].forEach((k) => { if (req.body[k] !== undefined) data[k] = String(req.body[k]); });
    if (req.body.active !== undefined) data.active = !!req.body.active;
    if (req.body.secret !== undefined) data.secret = String(req.body.secret);
    const hook = await prisma.webhook.update({ where: { id }, data });
    res.json({ ok: true, webhook: { id: hook.id, name: hook.name, url: hook.url, event: hook.event, active: hook.active, hasSecret: !!hook.secret } });
  });

  app.delete('/api/admin/webhooks/:id', requireAuth, requireAdmin, requirePermission(PERMISSIONS.SETTINGS_EDIT), async (req, res) => {
    await prisma.webhook.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  });

  return { dispatchWebhooks };
}

module.exports = { registerIntegrationsRoutes };
