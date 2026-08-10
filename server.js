const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

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

app.listen(PORT, () => {
  console.log(`Servidor de auth listo en http://localhost:${PORT}`);
});
