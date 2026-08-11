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
  if (origin && (allowAll || CORS_ORIGINS.includes(origin))) {
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

// ---------- Export / Import / Reset ----------
function buildExportPayload(contentRows, projectRows) {
  const content = {};
  for (const c of contentRows) {
    const translations = {};
    for (const t of c.translations) translations[t.lang] = t.value;
    content[c.key] = translations;
  }
  const projects = projectRows.map((p) => serializeProject(p, 'es', true));
  return { content, projects };
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
    res.json({
      ok: true,
      exportedAt: new Date().toISOString(),
      ...buildExportPayload(contentRows, projectRows),
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
  return true;
}

// POST /api/admin/content/import  body: { content?, projects? }
app.post('/api/admin/content/import', requireAuth, requireAdminRole, async (req, res) => {
  const body = req.body;
  try {
    validateImportPayload(body);
    let contentCount = 0;
    let projectCount = 0;
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
    });
    res.json({ ok: true, imported: { content: contentCount, projects: projectCount } });
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
    const snapshot = buildExportPayload(contentRows, projectRows);

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
    });

    res.json({ ok: true, message: 'Contenido y proyectos restablecidos a los valores iniciales', backupId: snapshot.content ? Object.keys(snapshot.content).length : 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'No se pudo restablecer el contenido' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Servidor de auth listo en http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso. Cierra el otro proceso o cambia el puerto y vuelve a ejecutar: npm run dev`);
    process.exit(1);
  }
  throw err;
});
