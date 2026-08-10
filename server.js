const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_KEY = process.env.ADMIN_KEY || 'Administrador01';

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Writes to projects require the admin key (same password as the admin panel).
function requireAdmin(req, res, next) {
  const key = req.get('x-admin-key');
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }
  next();
}

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Usuario no encontrado' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ ok: false, error: 'Contraseña incorrecta' });
    }

    return res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Error del servidor' });
  }
});

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email y contraseña requeridos' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ ok: false, error: 'El usuario ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: 'admin' },
    });

    return res.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: 'Error al crear el usuario' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API lista' });
});

app.get('/api/projects', async (_req, res) => {
  try {
    const rows = await prisma.project.findMany({ orderBy: { order: 'asc' } });
    const projects = rows.map((p) => ({
      id: p.slug,
      slug: p.slug,
      industry: p.industry,
      title: p.title,
      client: p.client,
      year: p.year,
      color: p.color,
      icon: p.icon,
      tagline: p.tagline,
      desc: p.desc,
      tags: safeJson(p.tags, []),
      metrics: safeJson(p.metrics, []),
      featured: p.featured,
    }));
    res.json({ ok: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener proyectos' });
  }
});

app.get('/api/projects/:slug', async (req, res) => {
  try {
    const p = await prisma.project.findUnique({ where: { slug: req.params.slug } });
    if (!p) return res.status(404).json({ ok: false, error: 'Proyecto no encontrado' });
    res.json({
      ok: true,
      project: {
        id: p.slug, slug: p.slug, industry: p.industry, title: p.title, client: p.client,
        year: p.year, color: p.color, icon: p.icon, tagline: p.tagline, desc: p.desc,
        tags: safeJson(p.tags, []), metrics: safeJson(p.metrics, []), featured: p.featured,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al obtener el proyecto' });
  }
});

function safeJson(value, fallback) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (e) { return fallback; }
  }
  return fallback;
}

// POST /api/projects — create or update (upsert by slug).
app.post('/api/projects', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const slug = (body.slug || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!slug) return res.status(400).json({ ok: false, error: 'slug requerido' });
  if (!body.title || !body.industry) {
    return res.status(400).json({ ok: false, error: 'title e industry son requeridos' });
  }

  try {
    const data = {
      industry: body.industry,
      title: body.title,
      client: body.client || null,
      year: body.year || String(new Date().getFullYear()),
      color: body.color || '#22D3EE',
      icon: body.icon || 'Folder',
      tagline: body.tagline || '',
      desc: body.desc || '',
      tags: JSON.stringify(body.tags || []),
      metrics: JSON.stringify(body.metrics || []),
      featured: !!body.featured,
      order: typeof body.order === 'number' ? body.order : 0,
    };
    const existing = await prisma.project.findUnique({ where: { slug } });
    let project;
    if (existing) {
      project = await prisma.project.update({ where: { slug }, data });
    } else {
      project = await prisma.project.create({ data: { slug, ...data } });
    }
    res.json({ ok: true, project: { ...project, id: project.slug, tags: safeJson(project.tags, []), metrics: safeJson(project.metrics, []) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al guardar el proyecto' });
  }
});

// PUT /api/projects/:slug — update an existing project.
app.put('/api/projects/:slug', requireAdmin, async (req, res) => {
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
      order: typeof body.order === 'number' ? body.order : existing.order,
    };
    const project = await prisma.project.update({ where: { slug }, data });
    res.json({ ok: true, project: { ...project, id: project.slug, tags: safeJson(project.tags, []), metrics: safeJson(project.metrics, []) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: 'Error al actualizar el proyecto' });
  }
});

// DELETE /api/projects/:slug — remove a project.
app.delete('/api/projects/:slug', requireAdmin, async (req, res) => {
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
