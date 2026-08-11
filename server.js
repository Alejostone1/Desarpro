const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { PrismaClient } = require('@prisma/client');
const seedData = require('./src/lib/contentSeedData.js');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_TTL_MS = Math.max(0, Number(process.env.SESSION_TTL_MS)) || 7 * 24 * 60 * 60 * 1000; // 7 days by default
const CORS_ORIGINS = (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()).filter(Boolean);

const LANGUAGES = seedData.LANGUAGES;
const CONTENT_DEFAULTS = seedData.CONTENT_DEFAULTS;
const ALL_KEYS = seedData.ALL_KEYS;
const sectionFor = seedData.sectionFor;
const typeFor = seedData.typeFor;
const resolveValue = seedData.resolveValue;
const PROJECT_SEED = seedData.PROJECT_SEED || [];
const resolveProjectTranslations = seedData.resolveProjectTranslations || (() => null);
const resolveServiceSeed = seedData.resolveServiceSeed || (() => []);
const TECHNOLOGY_SEED = seedData.TECHNOLOGY_SEED || [];
const SEO_DEFAULTS = seedData.SEO_DEFAULTS || {};
const SITE_CONFIG_DEFAULTS = seedData.SITE_CONFIG_DEFAULTS || {};

// Load the real i18n translations so resets can restore every language.
function loadTranslations() {
  const file = path.join(__dirname, 'src', 'i18n', 'translations.jsx');
  const code = fs.readFileSync(file, 'utf8');
  const sandbox = {};
  vm.runInNewContext(code, sandbox, { filename: file });
  return sandbox.__i18nTranslations || {};
}
const TRANSLATIONS = loadTranslations();

app.use(bodyParser.json({ limit: '2mb' }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowAll = CORS_ORIGINS.includes('*');
  const allowed = origin && (
    allowAll
    || CORS_ORIGINS.includes(origin)
    || CORS_ORIGINS.some((entry) => entry.startsWith('*.') && origin.endsWith(entry.slice(1)))
  );
  if (allowed) {
    res.header('Access-Control-Allow-Origin', allowAll ? '*' : origin);
    if (!allowAll) res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function safeJson(value, fallback) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (e) { return fallback; }
  }
  return fallback;
}

// ---------- Session / auth ----------
async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await prisma.session.create({
    data: { token, userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) },
  });
  return token;
}

async function getToken(req) {
  return (
    req.get('x-admin-token') ||
    (req.headers.authorization && req.headers.authorization.replace(/^Bearer\s+/i, '')) ||
    null
  );
}

async function requireAuth(req, res, next) {
  try {
    const token = await getToken(req);
    if (!token) return res.status(401).json({ ok: false, error: 'Sesión no iniciada', code: 'no_session' });
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return res.status(401).json({ ok: false, error: 'Sesión expirada', code: 'expired' });
    }
    req.user = session.user;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
}

function requireAdminRole(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'No autorizado' });
  }
  next();
}

// ---------- Rate limiting ----------
// In-memory login rate limiter (per client IP). No external dependencies;
// entries expire after the window. Enough to blunt brute-force on a single
// admin API without adding stateful infrastructure.
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map();

function loginRateLimit(req, res, next) {
  const ip = ((req.headers['x-forwarded-for'] || '').split(',')[0] || '').trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now - rec.start > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { start: now, count: 1 });
    return next();
  }
  rec.count += 1;
  if (rec.count > LOGIN_MAX_ATTEMPTS) {
    return res.status(429).json({ ok: false, error: 'Demasiados intentos. Intenta de nuevo más tarde.' });
  }
  next();
}

// Periodic cleanup so the map never grows unbounded.
const loginCleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of loginAttempts) {
    if (now - rec.start > LOGIN_WINDOW_MS) loginAttempts.delete(ip);
  }
}, LOGIN_WINDOW_MS);
if (loginCleanup.unref) loginCleanup.unref();

// ---------- Auth endpoints ----------
app.post('/api/login', loginRateLimit, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });
  }
  try {
    // Single generic error for both "user not found" and "wrong password"
    // to avoid leaking which emails are registered.
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
    }
    const token = await createSession(user.id);
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

app.post('/api/auth/logout', requireAuth, async (req, res) => {
  try {
    const token = await getToken(req);
    await prisma.session.deleteMany({ where: { token } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API lista' });
});

// ---------- Public content ----------
// GET /api/content?lang=es -> { ok, lang, content: { key: value } }
app.get('/api/content', async (req, res) => {
  const lang = LANGUAGES.includes(req.query.lang) ? req.query.lang : 'es';
  try {
    const keys = await prisma.contentKey.findMany({
      include: { translations: true },
    });
    const content = {};
    for (const k of keys) {
      const byLang = {};
      for (const t of k.translations) byLang[t.lang] = t.value;
      const value = (byLang[lang] || '').trim() || byLang.es || CONTENT_DEFAULTS[k.key] || '';
      content[k.key] = value;
    }
    res.json({ ok: true, lang, content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener contenido' });
  }
});

// ---------- Admin content ----------
// GET /api/admin/content -> full multi-language view used by the admin panel
app.get('/api/admin/content', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const keys = await prisma.contentKey.findMany({
      include: { translations: true },
      orderBy: { order: 'asc' },
    });
    const content = keys.map((k) => {
      const translations = {};
      for (const t of k.translations) translations[t.lang] = t.value;
      return {
        key: k.key,
        section: k.section,
        type: k.type,
        order: k.order,
        updatedAt: k.updatedAt.toISOString(),
        translations,
      };
    });
    const counts = {};
    for (const c of content) counts[c.section] = (counts[c.section] || 0) + 1;
    res.json({ ok: true, content, counts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener contenido' });
  }
});

async function upsertContentKeyValue(key, lang, value) {
  if (!key || !LANGUAGES.includes(lang)) throw new Error('Clave o idioma inválido');
  const section = sectionFor(key);
  const type = typeFor(key);
  let ck = await prisma.contentKey.findUnique({ where: { key } });
  if (!ck) {
    ck = await prisma.contentKey.create({
      data: { key, section, type, order: ALL_KEYS.indexOf(key) === -1 ? 999 : ALL_KEYS.indexOf(key) },
    });
  }
  await prisma.contentTranslation.upsert({
    where: { contentKeyId_lang: { contentKeyId: ck.id, lang } },
    update: { value },
    create: { contentKeyId: ck.id, lang, value },
  });
  return ck;
}

// PUT /api/admin/content/:key  body: { lang, value }
app.put('/api/admin/content/:key', requireAuth, requireAdminRole, async (req, res) => {
  const key = req.params.key;
  const { lang, value } = req.body || {};
  try {
    if (!LANGUAGES.includes(lang)) {
      return res.status(400).json({ ok: false, error: 'Idioma inválido' });
    }
    const ck = await upsertContentKeyValue(key, lang, typeof value === 'string' ? value : '');
    const tr = await prisma.contentTranslation.findUnique({
      where: { contentKeyId_lang: { contentKeyId: ck.id, lang } },
    });
    res.json({ ok: true, key, lang, value: tr.value, updatedAt: tr.updatedAt.toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo guardar el contenido.' });
  }
});

// PUT /api/admin/content  body: { key, translations: { es, en, pt, fr, de } }
app.put('/api/admin/content', requireAuth, requireAdminRole, async (req, res) => {
  const { key, translations } = req.body || {};
  try {
    if (!key || !translations || typeof translations !== 'object') {
      return res.status(400).json({ ok: false, error: 'Datos inválidos' });
    }
    const ck = await upsertContentKeyValue(key, 'es', '');
    let updated = 0;
    for (const lang of LANGUAGES) {
      if (translations[lang] !== undefined) {
        await prisma.contentTranslation.upsert({
          where: { contentKeyId_lang: { contentKeyId: ck.id, lang } },
          update: { value: String(translations[lang] ?? '') },
          create: { contentKeyId: ck.id, lang, value: String(translations[lang] ?? '') },
        });
        updated += 1;
      }
    }
    res.json({ ok: true, key, updated, updatedAt: ck.updatedAt.toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo guardar el contenido.' });
  }
});

// ---------- Projects ----------
function serializeProject(p, lang, includeTranslations) {
  const base = { title: p.title, tagline: p.tagline, desc: p.desc, client: p.client };
  const tr = (p.translations || []).reduce((acc, t) => {
    acc[t.lang] = { title: t.title, tagline: t.tagline, desc: t.desc };
    return acc;
  }, {});
  const out = {
    id: p.slug,
    slug: p.slug,
    industry: p.industry,
    year: p.year,
    color: p.color,
    icon: p.icon,
    client: base.client,
    title: base.title,
    tagline: base.tagline,
    desc: base.desc,
    tags: safeJson(p.tags, []),
    metrics: safeJson(p.metrics, []),
    featured: !!p.featured,
    active: p.active !== undefined ? !!p.active : true,
    order: p.order,
  };
  if (lang && lang !== 'es' && tr[lang]) {
    if (tr[lang].title) out.title = tr[lang].title;
    if (tr[lang].tagline) out.tagline = tr[lang].tagline;
    if (tr[lang].desc) out.desc = tr[lang].desc;
  }
  if (includeTranslations) out.translations = tr;
  return out;
}

// Public: active projects only, localized.
// GET /api/projects?lang=es
app.get('/api/projects', async (req, res) => {
  const lang = LANGUAGES.includes(req.query.lang) ? req.query.lang : undefined;
  try {
    const rows = await prisma.project.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: { translations: true },
    });
    res.json({ ok: true, projects: rows.map((p) => serializeProject(p, lang, false)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener proyectos' });
  }
});

app.get('/api/projects/:slug', async (req, res) => {
  const lang = LANGUAGES.includes(req.query.lang) ? req.query.lang : undefined;
  try {
    const p = await prisma.project.findUnique({
      where: { slug: req.params.slug },
      include: { translations: true },
    });
    if (!p || p.active === false) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    res.json({ ok: true, project: serializeProject(p, lang, false) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener el proyecto' });
  }
});

// Admin: all projects (incl. inactive) with full translations.
// GET /api/admin/projects?lang=es
app.get('/api/admin/projects', requireAuth, requireAdminRole, async (req, res) => {
  const lang = LANGUAGES.includes(req.query.lang) ? req.query.lang : 'es';
  try {
    const rows = await prisma.project.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true },
    });
    res.json({ ok: true, projects: rows.map((p) => serializeProject(p, lang, true)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener proyectos' });
  }
});

function cleanProjectPayload(body) {
  return {
    industry: (body.industry || '').trim(),
    title: (body.title || '').trim(),
    client: body.client || null,
    year: body.year || String(new Date().getFullYear()),
    color: body.color || '#22D3EE',
    icon: body.icon || 'Folder',
    tagline: body.tagline || '',
    desc: body.desc || '',
    tags: JSON.stringify(body.tags || []),
    metrics: JSON.stringify(body.metrics || []),
    featured: !!body.featured,
    active: body.active !== undefined ? !!body.active : true,
    order: typeof body.order === 'number' ? body.order : 0,
  };
}

async function upsertProjectTranslations(projectId, translations) {
  if (!translations || typeof translations !== 'object') return;
  for (const lang of LANGUAGES) {
    const tr = translations[lang];
    if (!tr || typeof tr !== 'object') continue;
    const data = {
      title: typeof tr.title === 'string' ? tr.title : '',
      tagline: typeof tr.tagline === 'string' ? tr.tagline : '',
      desc: typeof tr.desc === 'string' ? tr.desc : '',
    };
    await prisma.projectTranslation.upsert({
      where: { projectId_lang: { projectId, lang } },
      update: data,
      create: { projectId, lang, ...data },
    });
  }
}

// POST /api/projects — create or update (upsert by slug).
app.post('/api/projects', requireAuth, requireAdminRole, async (req, res) => {
  const body = req.body || {};
  const slug = (body.slug || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!slug) return res.status(400).json({ ok: false, error: 'slug requerido' });
  if (!body.title || !body.industry) {
    return res.status(400).json({ ok: false, error: 'title e industry son requeridos' });
  }
  const data = cleanProjectPayload(body);
  try {
    const existing = await prisma.project.findUnique({ where: { slug } });
    let project;
    if (existing) {
      project = await prisma.project.update({ where: { slug }, data });
    } else {
      project = await prisma.project.create({ data: { slug, ...data } });
    }
    await upsertProjectTranslations(project.id, body.translations);
    const full = await prisma.project.findUnique({
      where: { id: project.id },
      include: { translations: true },
    });
    res.json({ ok: true, project: serializeProject(full, 'es', true) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al guardar el proyecto' });
  }
});

// PUT /api/projects/:slug — update an existing project.
app.put('/api/projects/:slug', requireAuth, requireAdminRole, async (req, res) => {
  const slug = req.params.slug;
  const body = req.body || {};
  try {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    const data = {
      industry: body.industry ?? existing.industry,
      title: body.title ?? existing.title,
      client: body.client !== undefined ? (body.client || null) : existing.client,
      year: body.year ?? existing.year,
      color: body.color ?? existing.color,
      icon: body.icon ?? existing.icon,
      tagline: body.tagline ?? existing.tagline,
      desc: body.desc ?? existing.desc,
      tags: JSON.stringify(body.tags ?? safeJson(existing.tags, [])),
      metrics: JSON.stringify(body.metrics ?? safeJson(existing.metrics, [])),
      featured: body.featured !== undefined ? !!body.featured : existing.featured,
      active: body.active !== undefined ? !!body.active : existing.active,
      order: typeof body.order === 'number' ? body.order : existing.order,
    };
    const project = await prisma.project.update({ where: { slug }, data });
    await upsertProjectTranslations(project.id, body.translations);
    const full = await prisma.project.findUnique({
      where: { id: project.id },
      include: { translations: true },
    });
    res.json({ ok: true, project: serializeProject(full, 'es', true) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al actualizar el proyecto' });
  }
});

// DELETE /api/projects/:slug — remove a project.
app.delete('/api/projects/:slug', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    await prisma.project.delete({ where: { slug: req.params.slug } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al eliminar el proyecto' });
  }
});

// ---------- Leads / Contact ----------
const CONTACT_WINDOW_MS = 10 * 60 * 1000;
const CONTACT_MAX_PER_IP = 5;
const contactAttempts = new Map();
function contactRateLimit(req, res, next) {
  const ip = ((req.headers['x-forwarded-for'] || '').split(',')[0] || '').trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const rec = contactAttempts.get(ip);
  if (!rec || now - rec.start > CONTACT_WINDOW_MS) {
    contactAttempts.set(ip, { start: now, count: 1 });
    return next();
  }
  rec.count += 1;
  if (rec.count > CONTACT_MAX_PER_IP) {
    return res.status(429).json({ ok: false, error: 'Demasiados mensajes. Intenta más tarde.', code: 'rate_limited' });
  }
  next();
}
const contactCleanup = setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of contactAttempts) {
    if (now - rec.start > CONTACT_WINDOW_MS) contactAttempts.delete(ip);
  }
}, CONTACT_WINDOW_MS);
if (contactCleanup.unref) contactCleanup.unref();

// POST /api/contact — public lead capture from the contact form.
app.post('/api/contact', contactRateLimit, async (req, res) => {
  const body = req.body || {};
  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const message = (body.message || '').trim();
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Nombre, email y mensaje son requeridos' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Email inválido' });
  }
  try {
    const lead = await prisma.lead.create({
      data: {
        name: name.slice(0, 200),
        email: email.slice(0, 200),
        phone: String(body.phone || '').slice(0, 60),
        company: String(body.company || '').slice(0, 200),
        service: String(body.service || '').slice(0, 60),
        budget: String(body.budget || '').slice(0, 60),
        message: message.slice(0, 5000),
        status: 'new',
      },
    });
    res.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo enviar el mensaje' });
  }
});

function serializeLead(l) {
  return {
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone || '',
    company: l.company || '',
    service: l.service || '',
    budget: l.budget || '',
    message: l.message || '',
    status: l.status || 'new',
    notes: l.notes || '',
    source: l.source || 'contact',
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  };
}

// GET /api/admin/leads?status=&q= — filterable lead inbox.
app.get('/api/admin/leads', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const status = req.query.status;
    const q = (req.query.q || '').trim();
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { company: { contains: q } },
        { message: { contains: q } },
      ];
    }
    const rows = await prisma.lead.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 200,
    });
    const byStatus = {};
    const all = await prisma.lead.findMany({ select: { status: true } });
    for (const l of all) byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    res.json({ ok: true, leads: rows.map(serializeLead), counts: byStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener leads' });
  }
});

// PUT /api/admin/leads/:id — update status/notes.
app.put('/api/admin/leads/:id', requireAuth, requireAdminRole, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'id inválido' });
  const VALID = ['new', 'contacted', 'in_progress', 'won', 'lost'];
  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Lead no encontrado' });
    const data = {};
    if (req.body.status !== undefined) {
      if (!VALID.includes(req.body.status)) return res.status(400).json({ ok: false, error: 'Estado inválido' });
      data.status = req.body.status;
    }
    if (req.body.notes !== undefined) data.notes = String(req.body.notes).slice(0, 2000);
    if (req.body.name !== undefined) data.name = String(req.body.name).slice(0, 200);
    if (req.body.company !== undefined) data.company = String(req.body.company).slice(0, 200);
    if (req.body.phone !== undefined) data.phone = String(req.body.phone).slice(0, 60);
    const lead = await prisma.lead.update({ where: { id }, data });
    res.json({ ok: true, lead: serializeLead(lead) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al actualizar el lead' });
  }
});

// DELETE /api/admin/leads/:id
app.delete('/api/admin/leads/:id', requireAuth, requireAdminRole, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'id inválido' });
  try {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Lead no encontrado' });
    await prisma.lead.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al eliminar el lead' });
  }
});

// ---------- Services ----------
function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; } catch (e) { return []; }
  }
  return [];
}

function serializeService(s, lang, includeTranslations) {
  const tr = {};
  for (const t of s.translations || []) {
    tr[t.lang] = {
      name: t.name,
      tagline: t.tagline,
      overview: t.overview,
      bullets: parseList(t.bullets),
      deliverables: parseList(t.deliverables),
      process: parseList(t.process),
    };
  }
  const localized = (lang && tr[lang]) ? tr[lang] : (tr.es || {});
  const out = {
    id: s.id,
    slug: s.slug,
    kind: s.kind,
    icon: s.icon,
    color: s.color,
    featured: !!s.featured,
    active: s.active !== undefined ? !!s.active : true,
    order: s.order,
    name: localized.name || (tr.es && tr.es.name) || '',
    tagline: localized.tagline || (tr.es && tr.es.tagline) || '',
    overview: localized.overview || (tr.es && tr.es.overview) || '',
    bullets: localized.bullets && localized.bullets.length ? localized.bullets : ((tr.es && tr.es.bullets) || []),
    deliverables: localized.deliverables && localized.deliverables.length ? localized.deliverables : ((tr.es && tr.es.deliverables) || []),
    process: localized.process && localized.process.length ? localized.process : ((tr.es && tr.es.process) || []),
  };
  if (includeTranslations) out.translations = tr;
  return out;
}

// Public: active services, localized.
// GET /api/services?lang=es
app.get('/api/services', async (req, res) => {
  const lang = LANGUAGES.includes(req.query.lang) ? req.query.lang : 'es';
  try {
    const rows = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: { translations: true },
    });
    res.json({ ok: true, services: rows.map((s) => serializeService(s, lang, false)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener servicios' });
  }
});

// Admin: all services with full translations.
app.get('/api/admin/services', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const rows = await prisma.service.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true },
    });
    res.json({ ok: true, services: rows.map((s) => serializeService(s, 'es', true)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener servicios' });
  }
});

function cleanServicePayload(body) {
  return {
    kind: (body.kind || '').trim(),
    icon: body.icon || 'Layers',
    color: body.color || '#22D3EE',
    featured: !!body.featured,
    active: body.active !== undefined ? !!body.active : true,
    order: typeof body.order === 'number' ? body.order : 0,
  };
}

async function upsertServiceTranslations(serviceId, translations) {
  if (!translations || typeof translations !== 'object') return;
  for (const lang of LANGUAGES) {
    const tr = translations[lang];
    if (!tr || typeof tr !== 'object') continue;
    const data = {
      name: typeof tr.name === 'string' ? tr.name : '',
      tagline: typeof tr.tagline === 'string' ? tr.tagline : '',
      overview: typeof tr.overview === 'string' ? tr.overview : '',
      bullets: JSON.stringify(parseList(tr.bullets)),
      deliverables: JSON.stringify(parseList(tr.deliverables)),
      process: JSON.stringify(parseList(tr.process)),
    };
    await prisma.serviceTranslation.upsert({
      where: { serviceId_lang: { serviceId, lang } },
      update: data,
      create: { serviceId, lang, ...data },
    });
  }
}

// POST /api/services — create or update (upsert by slug).
app.post('/api/services', requireAuth, requireAdminRole, async (req, res) => {
  const body = req.body || {};
  const slug = (body.slug || body.kind || '').trim().toLowerCase().replace(/\s+/g, '-');
  const kind = (body.kind || slug).trim().toLowerCase().replace(/\s+/g, '-');
  if (!slug) return res.status(400).json({ ok: false, error: 'slug requerido' });
  const data = cleanServicePayload({ ...body, kind });
  try {
    const existing = await prisma.service.findUnique({ where: { slug } });
    let service;
    if (existing) {
      service = await prisma.service.update({ where: { slug }, data });
    } else {
      service = await prisma.service.create({ data: { slug, ...data } });
    }
    await upsertServiceTranslations(service.id, body.translations);
    const full = await prisma.service.findUnique({ where: { id: service.id }, include: { translations: true } });
    res.json({ ok: true, service: serializeService(full, 'es', true) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al guardar el servicio' });
  }
});

// PUT /api/services/:slug — update an existing service.
app.put('/api/services/:slug', requireAuth, requireAdminRole, async (req, res) => {
  const slug = req.params.slug;
  const body = req.body || {};
  try {
    const existing = await prisma.service.findUnique({ where: { slug } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Servicio no encontrado' });
    const data = {
      kind: body.kind !== undefined ? String(body.kind).trim() : existing.kind,
      icon: body.icon !== undefined ? body.icon : existing.icon,
      color: body.color !== undefined ? body.color : existing.color,
      featured: body.featured !== undefined ? !!body.featured : existing.featured,
      active: body.active !== undefined ? !!body.active : existing.active,
      order: typeof body.order === 'number' ? body.order : existing.order,
    };
    const service = await prisma.service.update({ where: { slug }, data });
    await upsertServiceTranslations(service.id, body.translations);
    const full = await prisma.service.findUnique({ where: { id: service.id }, include: { translations: true } });
    res.json({ ok: true, service: serializeService(full, 'es', true) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al actualizar el servicio' });
  }
});

// DELETE /api/services/:slug
app.delete('/api/services/:slug', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const existing = await prisma.service.findUnique({ where: { slug: req.params.slug } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Servicio no encontrado' });
    await prisma.service.delete({ where: { slug: req.params.slug } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al eliminar el servicio' });
  }
});

// ---------- Technologies ----------
function serializeTechnology(t) {
  return {
    id: t.id,
    name: t.name,
    color: t.color || '#22D3EE',
    category: t.category || 'Otros',
    featured: !!t.featured,
    active: t.active !== undefined ? !!t.active : true,
    order: t.order,
  };
}

// Public: active technologies.
// GET /api/technologies
app.get('/api/technologies', async (_req, res) => {
  try {
    const rows = await prisma.technology.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    res.json({ ok: true, technologies: rows.map(serializeTechnology) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener tecnologías' });
  }
});

app.get('/api/admin/technologies', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const rows = await prisma.technology.findMany({ orderBy: { order: 'asc' } });
    res.json({ ok: true, technologies: rows.map(serializeTechnology) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener tecnologías' });
  }
});

// POST /api/technologies — create or update (upsert by name).
app.post('/api/technologies', requireAuth, requireAdminRole, async (req, res) => {
  const body = req.body || {};
  const name = (body.name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'name requerido' });
  const data = {
    color: body.color || '#22D3EE',
    category: body.category || 'Otros',
    featured: body.featured !== undefined ? !!body.featured : true,
    active: body.active !== undefined ? !!body.active : true,
    order: typeof body.order === 'number' ? body.order : 0,
  };
  try {
    const existing = await prisma.technology.findUnique({ where: { name } });
    const tech = existing
      ? await prisma.technology.update({ where: { name }, data })
      : await prisma.technology.create({ data: { name, ...data } });
    res.json({ ok: true, technology: serializeTechnology(tech) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al guardar la tecnología' });
  }
});

// DELETE /api/technologies/:id
app.delete('/api/technologies/:id', requireAuth, requireAdminRole, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ ok: false, error: 'id inválido' });
  try {
    const existing = await prisma.technology.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ ok: false, error: 'Tecnología no encontrada' });
    await prisma.technology.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al eliminar la tecnología' });
  }
});

// ---------- SEO ----------
// Public: localized SEO metadata per route.
// GET /api/seo?lang=es
app.get('/api/seo', async (req, res) => {
  const lang = LANGUAGES.includes(req.query.lang) ? req.query.lang : 'es';
  try {
    const rows = await prisma.seoEntry.findMany({ where: { lang: { in: ['es', lang] } } });
    const byRoute = {};
    for (const r of rows) {
      const target = byRoute[r.route] || (byRoute[r.route] = { route: r.route, title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '' });
      const fallback = r.lang === 'es';
      for (const f of ['title', 'description', 'keywords', 'ogTitle', 'ogDescription', 'ogImage']) {
        if (r[f] && (!target[f] || fallback)) target[f] = r[f];
      }
    }
    // Merge ES defaults for routes that have no rows.
    const seo = {};
    for (const route of Object.keys(SEO_DEFAULTS)) {
      const def = SEO_DEFAULTS[route];
      seo[route] = {
        title: (byRoute[route] && byRoute[route].title) || def.title,
        description: (byRoute[route] && byRoute[route].description) || def.description,
        keywords: (byRoute[route] && byRoute[route].keywords) || (def.keywords || ''),
        ogTitle: (byRoute[route] && byRoute[route].ogTitle) || (byRoute[route] && byRoute[route].title) || def.title,
        ogDescription: (byRoute[route] && byRoute[route].ogDescription) || (byRoute[route] && byRoute[route].description) || def.description,
        ogImage: (byRoute[route] && byRoute[route].ogImage) || '',
      };
    }
    res.json({ ok: true, seo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener SEO' });
  }
});

app.get('/api/admin/seo', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const rows = await prisma.seoEntry.findMany({ orderBy: [{ route: 'asc' }, { lang: 'asc' }] });
    res.json({ ok: true, seo: rows.map((r) => ({ id: r.id, route: r.route, lang: r.lang, title: r.title, description: r.description, keywords: r.keywords, ogTitle: r.ogTitle, ogDescription: r.ogDescription, ogImage: r.ogImage, updatedAt: r.updatedAt.toISOString() })) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener SEO' });
  }
});

// POST /api/admin/seo — upsert one (route, lang) entry.
app.post('/api/admin/seo', requireAuth, requireAdminRole, async (req, res) => {
  const body = req.body || {};
  const route = String(body.route || '').trim();
  const lang = String(body.lang || 'es');
  if (!route) return res.status(400).json({ ok: false, error: 'route requerida' });
  if (!LANGUAGES.includes(lang)) return res.status(400).json({ ok: false, error: 'Idioma inválido' });
  const data = {
    title: String(body.title || '').slice(0, 200),
    description: String(body.description || '').slice(0, 500),
    keywords: String(body.keywords || '').slice(0, 500),
    ogTitle: String(body.ogTitle || '').slice(0, 200),
    ogDescription: String(body.ogDescription || '').slice(0, 500),
    ogImage: String(body.ogImage || '').slice(0, 1000),
  };
  try {
    await prisma.seoEntry.upsert({
      where: { route_lang: { route, lang } },
      update: data,
      create: { route, lang, ...data },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al guardar SEO' });
  }
});

// DELETE /api/admin/seo/:route?lang=xx — delete one entry (lang optional).
app.delete('/api/admin/seo/:route', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const lang = req.query.lang || null;
    if (lang) {
      await prisma.seoEntry.deleteMany({ where: { route: req.params.route, lang } });
    } else {
      await prisma.seoEntry.deleteMany({ where: { route: req.params.route } });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al eliminar SEO' });
  }
});

// ---------- Site config ----------
async function loadSiteConfig() {
  const rows = await prisma.siteConfig.findMany();
  const out = {};
  for (const key of Object.keys(SITE_CONFIG_DEFAULTS)) {
    out[key] = SITE_CONFIG_DEFAULTS[key];
  }
  for (const r of rows) {
    try {
      const dflt = SITE_CONFIG_DEFAULTS[r.key];
      const parsed = JSON.parse(r.value);
      // Object defaults (sections) merge over the stored object; primitive
      // defaults (heroImage, announcement, announcementActive) pass through.
      if (dflt !== null && typeof dflt === 'object' && !Array.isArray(dflt) &&
          parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        out[r.key] = { ...dflt, ...parsed };
      } else {
        out[r.key] = parsed;
      }
    } catch (e) { /* keep default */ }
  }
  return out;
}

// Public: site config (visibility toggles, hero image, announcement, contact).
app.get('/api/site-config', async (_req, res) => {
  try {
    res.json({ ok: true, config: await loadSiteConfig() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener configuración' });
  }
});

app.get('/api/admin/site-config', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    res.json({ ok: true, config: await loadSiteConfig(), raw: await prisma.siteConfig.findMany() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener configuración' });
  }
});

// PUT /api/admin/site-config  body: { key, value }
//  - value primitivo -> se guarda bajo `key` (p. ej. heroImage: 'url').
//  - value objeto y `key` con default objeto -> se fusiona bajo `key` (sections).
//  - value objeto y `key` con default primitivo -> las claves del objeto se
//    guardan como claves de configuración de nivel superior (announcement).
app.put('/api/admin/site-config', requireAuth, requireAdminRole, async (req, res) => {
  const { key, value } = req.body || {};
  if (!key || SITE_CONFIG_DEFAULTS[key] === undefined) return res.status(400).json({ ok: false, error: 'Clave de configuración inválida' });
  if (value === undefined || value === null) return res.status(400).json({ ok: false, error: 'value requerido' });
  try {
    const dflt = SITE_CONFIG_DEFAULTS[key];
    const writes = [];
    if (typeof value === 'object') {
      if (dflt !== null && typeof dflt === 'object' && !Array.isArray(dflt)) {
        writes.push({ key, value: { ...dflt, ...value } });
      } else {
        for (const [k, v] of Object.entries(value)) {
          if (SITE_CONFIG_DEFAULTS[k] !== undefined) writes.push({ key: k, value: v });
        }
      }
    } else {
      writes.push({ key, value });
    }
    for (const w of writes) {
      await prisma.siteConfig.upsert({
        where: { key: w.key },
        update: { value: JSON.stringify(w.value) },
        create: { key: w.key, value: JSON.stringify(w.value) },
      });
    }
    res.json({ ok: true, config: await loadSiteConfig() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al guardar configuración' });
  }
});

// ---------- Dashboard ----------
// GET /api/admin/dashboard — aggregate counts for the admin overview.
app.get('/api/admin/dashboard', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const [projects, activeProjects, services, activeServices, techs, activeTechs, leads, leadStatuses, contentKeys, recentLeads, lastContentKey] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { active: true } }),
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),
      prisma.technology.count(),
      prisma.technology.count({ where: { active: true } }),
      prisma.lead.count(),
      prisma.lead.findMany({ select: { status: true } }),
      prisma.contentKey.count(),
      prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.contentKey.findFirst({ orderBy: { updatedAt: 'desc' } }),
    ]);
    const leadCounts = { new: 0, contacted: 0, in_progress: 0, won: 0, lost: 0 };
    for (const l of leadStatuses) leadCounts[l.status] = (leadCounts[l.status] || 0) + 1;
    res.json({
      ok: true,
      dashboard: {
        projects,
        activeProjects,
        services,
        activeServices,
        technologies: techs,
        activeTechnologies: activeTechs,
        leads,
        leadCounts,
        contentKeys,
        lastContentUpdate: lastContentKey ? lastContentKey.updatedAt.toISOString() : null,
        recentLeads: recentLeads.map(serializeLead),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener el dashboard' });
  }
});

// ---------- Export / Import / Reset ----------
function buildExportPayload(contentRows, projectRows, serviceRows, technologyRows) {
  const content = {};
  for (const c of contentRows) {
    const translations = {};
    for (const t of c.translations) translations[t.lang] = t.value;
    content[c.key] = translations;
  }
  const projects = projectRows.map((p) => serializeProject(p, 'es', true));
  const services = (serviceRows || []).map((s) => serializeService(s, 'es', true));
  const technologies = (technologyRows || []).map(serializeTechnology);
  return { content, projects, services, technologies };
}

// GET /api/admin/content/export
app.get('/api/admin/content/export', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const contentRows = await prisma.contentKey.findMany({
      include: { translations: true },
      orderBy: { order: 'asc' },
    });
    const projectRows = await prisma.project.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true },
    });
    const serviceRows = await prisma.service.findMany({
      orderBy: { order: 'asc' },
      include: { translations: true },
    });
    const technologyRows = await prisma.technology.findMany({ orderBy: { order: 'asc' } });
    res.json({
      ok: true,
      exportedAt: new Date().toISOString(),
      ...buildExportPayload(contentRows, projectRows, serviceRows, technologyRows),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al exportar' });
  }
});

function validateImportPayload(data) {
  if (!data || typeof data !== 'object') throw new Error('JSON inválido');
  if (data.content !== undefined) {
    if (typeof data.content !== 'object' || data.content === null) throw new Error('Contenido inválido');
    for (const key of Object.keys(data.content)) {
      const tr = data.content[key];
      if (!tr || typeof tr !== 'object') throw new Error(`Traducciones inválidas para "${key}"`);
      for (const lang of Object.keys(tr)) {
        if (!LANGUAGES.includes(lang)) throw new Error(`Idioma inválido "${lang}" en "${key}"`);
        if (typeof tr[lang] !== 'string') throw new Error(`Valor no textual en "${key}" (${lang})`);
      }
    }
  }
  if (data.projects !== undefined) {
    if (!Array.isArray(data.projects)) throw new Error('Proyectos inválidos');
    for (const p of data.projects) {
      if (!p || typeof p !== 'object' || !p.slug || !p.title || !p.industry) {
        throw new Error('Proyecto inválido (slug, title e industry requeridos)');
      }
    }
  }
  if (data.services !== undefined) {
    if (!Array.isArray(data.services)) throw new Error('Servicios inválidos');
    for (const s of data.services) {
      if (!s || typeof s !== 'object' || (!s.slug && !s.kind)) {
        throw new Error('Servicio inválido (slug o kind requeridos)');
      }
    }
  }
  if (data.technologies !== undefined) {
    if (!Array.isArray(data.technologies)) throw new Error('Tecnologías inválidas');
    for (const t of data.technologies) {
      if (!t || typeof t !== 'object' || !t.name) throw new Error('Tecnología inválida (name requerido)');
    }
  }
  return true;
}

// POST /api/admin/content/import  body: { content?, projects?, services?, technologies? }
app.post('/api/admin/content/import', requireAuth, requireAdminRole, async (req, res) => {
  const body = req.body;
  try {
    validateImportPayload(body);
    let contentCount = 0;
    let projectCount = 0;
    let serviceCount = 0;
    let technologyCount = 0;
    await prisma.$transaction(async (tx) => {
      if (body.content) {
        for (const key of Object.keys(body.content)) {
          const tr = body.content[key];
          const section = sectionFor(key);
          const type = typeFor(key);
          const ck = await tx.contentKey.upsert({
            where: { key },
            update: { section, type },
            create: { key, section, type, order: ALL_KEYS.indexOf(key) === -1 ? 999 : ALL_KEYS.indexOf(key) },
          });
          for (const lang of LANGUAGES) {
            const value = typeof tr[lang] === 'string' ? tr[lang] : '';
            await tx.contentTranslation.upsert({
              where: { contentKeyId_lang: { contentKeyId: ck.id, lang } },
              update: { value },
              create: { contentKeyId: ck.id, lang, value },
            });
          }
          contentCount += 1;
        }
      }
      if (Array.isArray(body.projects)) {
        for (const p of body.projects) {
          const slug = String(p.slug).trim().toLowerCase().replace(/\s+/g, '-');
          const data = cleanProjectPayload({ ...p, slug });
          const proj = await tx.project.upsert({
            where: { slug },
            update: data,
            create: { slug, ...data },
          });
          for (const lang of LANGUAGES) {
            const tr = p.translations && p.translations[lang];
            await tx.projectTranslation.upsert({
              where: { projectId_lang: { projectId: proj.id, lang } },
              update: {
                title: tr && typeof tr.title === 'string' ? tr.title : '',
                tagline: tr && typeof tr.tagline === 'string' ? tr.tagline : '',
                desc: tr && typeof tr.desc === 'string' ? tr.desc : '',
              },
              create: {
                projectId: proj.id,
                lang,
                title: tr && typeof tr.title === 'string' ? tr.title : '',
                tagline: tr && typeof tr.tagline === 'string' ? tr.tagline : '',
                desc: tr && typeof tr.desc === 'string' ? tr.desc : '',
              },
            });
          }
          projectCount += 1;
        }
      }
      if (Array.isArray(body.services)) {
        for (const s of body.services) {
          const slug = String(s.slug || s.kind || '').trim().toLowerCase().replace(/\s+/g, '-');
          const kind = String(s.kind || slug).trim().toLowerCase().replace(/\s+/g, '-');
          const data = cleanServicePayload({ ...s, slug, kind });
          const svc = await tx.service.upsert({
            where: { slug },
            update: data,
            create: { slug, ...data },
          });
          if (s.translations && typeof s.translations === 'object') {
            for (const lang of LANGUAGES) {
              const tr = s.translations[lang];
              if (!tr) continue;
              const trData = {
                name: typeof tr.name === 'string' ? tr.name : '',
                tagline: typeof tr.tagline === 'string' ? tr.tagline : '',
                overview: typeof tr.overview === 'string' ? tr.overview : '',
                bullets: JSON.stringify(parseList(tr.bullets)),
                deliverables: JSON.stringify(parseList(tr.deliverables)),
                process: JSON.stringify(parseList(tr.process)),
              };
              await tx.serviceTranslation.upsert({
                where: { serviceId_lang: { serviceId: svc.id, lang } },
                update: trData,
                create: { serviceId: svc.id, lang, ...trData },
              });
            }
          }
          serviceCount += 1;
        }
      }
      if (Array.isArray(body.technologies)) {
        for (const t of body.technologies) {
          const name = String(t.name || '').trim();
          if (!name) continue;
          const data = {
            color: t.color || '#22D3EE',
            category: t.category || 'Otros',
            featured: t.featured !== undefined ? !!t.featured : true,
            active: t.active !== undefined ? !!t.active : true,
            order: typeof t.order === 'number' ? t.order : 0,
          };
          await tx.technology.upsert({
            where: { name },
            update: data,
            create: { name, ...data },
          });
          technologyCount += 1;
        }
      }
    });
    res.json({ ok: true, imported: { content: contentCount, projects: projectCount, services: serviceCount, technologies: technologyCount } });
  } catch (error) {
    console.error(error);
    res.status(400).json({ ok: false, error: error.message || 'JSON inválido' });
  }
});

// POST /api/admin/content/reset — snapshot + restore seed defaults.
app.post('/api/admin/content/reset', requireAuth, requireAdminRole, async (_req, res) => {
  try {
    const contentRows = await prisma.contentKey.findMany({ include: { translations: true } });
    const projectRows = await prisma.project.findMany({ include: { translations: true } });
    const serviceRows = await prisma.service.findMany({ include: { translations: true } });
    const technologyRows = await prisma.technology.findMany({});
    const snapshot = buildExportPayload(contentRows, projectRows, serviceRows, technologyRows);

    await prisma.$transaction(async (tx) => {
      await tx.contentSnapshot.create({
        data: { kind: 'reset-before', data: JSON.stringify(snapshot) },
      });
      await tx.contentTranslation.deleteMany({});
      await tx.contentKey.deleteMany({});

      for (const key of ALL_KEYS) {
        const section = sectionFor(key);
        const type = typeFor(key);
        const ck = await tx.contentKey.create({
          data: { key, section, type, order: ALL_KEYS.indexOf(key) },
        });
        for (const lang of LANGUAGES) {
          const value = resolveValue(TRANSLATIONS, lang, key);
          await tx.contentTranslation.create({
            data: { contentKeyId: ck.id, lang, value },
          });
        }
      }

      // Restore the canonical project catalog (cascades old translations).
      await tx.project.deleteMany({});
      for (const p of PROJECT_SEED) {
        const proj = await tx.project.create({
          data: {
            slug: p.slug,
            industry: p.industry || '',
            title: p.title || '',
            client: p.client || null,
            year: p.year || String(new Date().getFullYear()),
            color: p.color || '#22D3EE',
            icon: p.icon || 'Folder',
            tagline: p.tagline || '',
            desc: p.desc || '',
            tags: JSON.stringify(p.tags || []),
            metrics: JSON.stringify(p.metrics || []),
            featured: !!p.featured,
            active: true,
            order: typeof p.order === 'number' ? p.order : 0,
          },
        });
        for (const lang of LANGUAGES) {
          const tr = lang === 'es' ? p : (resolveProjectTranslations(p.slug, lang) || p);
          await tx.projectTranslation.create({
            data: {
              projectId: proj.id,
              lang,
              title: tr.title || '',
              tagline: tr.tagline || '',
              desc: tr.desc || '',
            },
          });
        }
      }

      // Restore the canonical service catalog.
      await tx.service.deleteMany({});
      for (const s of resolveServiceSeed(TRANSLATIONS)) {
        const svc = await tx.service.create({
          data: {
            slug: s.slug,
            kind: s.kind,
            icon: s.icon,
            color: s.color,
            featured: s.featured,
            active: true,
            order: s.order,
          },
        });
        for (const lang of LANGUAGES) {
          const tr = s.translations[lang];
          await tx.serviceTranslation.create({
            data: {
              serviceId: svc.id,
              lang,
              name: tr.name,
              tagline: tr.tagline,
              overview: tr.overview,
              bullets: JSON.stringify(tr.bullets || []),
              deliverables: JSON.stringify(tr.deliverables || []),
              process: JSON.stringify(tr.process || []),
            },
          });
        }
      }

      // Restore the canonical technology catalog.
      await tx.technology.deleteMany({});
      for (let i = 0; i < TECHNOLOGY_SEED.length; i++) {
        const t = TECHNOLOGY_SEED[i];
        await tx.technology.create({
          data: {
            name: t.name,
            color: t.color,
            category: t.category,
            featured: true,
            active: true,
            order: i,
          },
        });
      }
    });

    res.json({ ok: true, message: 'Contenido, proyectos, servicios y tecnologías restablecidos a los valores iniciales', backupId: snapshot.content ? Object.keys(snapshot.content).length : 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo restablecer el contenido' });
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de auth listo en http://localhost:${PORT}`);
  console.log(`  Red local: http://<tu-ip-lan>:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra el otro proceso o cambia el puerto y vuelve a ejecutar: npm run dev`);
    process.exit(1);
  }
  throw err;
});
