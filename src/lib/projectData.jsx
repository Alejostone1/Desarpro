// projectData — single source of truth for portfolio projects.
//
// The database (via the backend API) is the source of truth:
//  - Public:  GET  /api/projects?lang=<lang> -> localized active projects.
//  - Admin:   GET  /api/admin/projects       -> all projects incl. inactive + translations.
//  - Writes:  POST /api/projects, PUT /api/projects/:slug, DELETE /api/projects/:slug
//             authenticated with the admin session token (x-admin-token header).
//
// No localStorage snapshots: static-host fallback only shows the bundled ES catalog
// when the API is unreachable (offline / no backend deployed).

import { resolveApiBase } from './apiBase.js';

const TOKEN_KEY = 'desarpro:admin:token';

function readToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}

const API_BASE = resolveApiBase();

function readLang() {
  if (typeof window === 'undefined') return 'es';
  try {
    return localStorage.getItem('desarpro:language') || 'es';
  } catch (e) { return 'es'; }
}

async function apiReq(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = readToken();
  if (token) headers['x-admin-token'] = token;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: opts.method || 'GET',
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) {}
    return { status: res.status, ok: res.ok, data };
  } catch (e) {
    return { status: 0, ok: false, data: null };
  }
}

// Local fallback catalog — mirrors the seeded backend rows (ES).
const LOCAL_PROJECTS = [
  {
    id: 'vetai', slug: 'vetai', industry: 'VetTech', color: '#06B6D4', icon: 'Stethoscope',
    title: 'Plataforma de diagnóstico veterinario asistido por IA',
    client: 'VetAI Diagnóstico', year: '2025',
    tagline: 'Salud veterinaria · Laboratorios',
    desc: 'Sistema multi-clínica con triaje inteligente, historia clínica electrónica y módulos de laboratorio. Reduce el tiempo de diagnóstico inicial en un 60%.',
    tags: ['React', 'Python', 'PostgreSQL', 'OpenAI API'],
    metrics: [
      { k: '60%', v: 'menos tiempo de triaje' },
      { k: '12', v: 'clínicas conectadas' },
      { k: '4.8/5', v: 'NPS profesional' },
    ],
    featured: true,
  },
  {
    id: 'trazacafe', slug: 'trazacafe', industry: 'CoffeeTech', color: '#A78BFA', icon: 'Coffee',
    title: 'Trazabilidad de café desde la finca hasta la taza',
    client: 'TrazaCafé', year: '2025',
    tagline: 'Agroindustria · Trazabilidad de café',
    desc: 'App móvil + dashboard que rastrea cada lote desde el cafetal: cosecha, fermentación, secado, exportación. Con QR público que el comprador final escanea.',
    tags: ['React Native', 'Node.js', 'PostgreSQL', 'AWS S3'],
    metrics: [
      { k: '180+', v: 'fincas activas' },
      { k: '3 países', v: 'Colombia · USA · Japón' },
      { k: '+22%', v: 'precio FOB promedio' },
    ],
    featured: true,
  },
  {
    id: 'modaflow', slug: 'modaflow', industry: 'Fashion', color: '#EC4899', icon: 'Star',
    title: 'Portal B2B de pedidos para marca de moda',
    client: 'ModaFlow', year: '2025',
    tagline: 'Moda · Pedidos y catálogo',
    desc: 'Catálogo con showroom virtual, carrito, gestión de pedidos por temporada, integración con producción y facturación electrónica DIAN.',
    tags: ['Next.js', '.NET', 'SQL Server', 'Stripe'],
    metrics: [
      { k: '+45%', v: 'pedidos online' },
      { k: '320', v: 'multimarcas activas' },
      { k: '−70%', v: 'errores de pedido' },
    ],
    featured: true,
  },
  {
    id: 'ecommerce', slug: 'ecommerce', industry: 'E-commerce', color: '#3B82F6', icon: 'ShoppingBag',
    title: 'Tienda online para retail tecnológico',
    client: 'TechRetail Store', year: '2025',
    tagline: 'Retail tecnológico',
    desc: 'E-commerce de alto rendimiento con catálogo dinámico, pasarela de pagos, búsqueda avanzada y panel de operación para el equipo de ventas.',
    tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    metrics: [
      { k: '+38%', v: 'conversión de visitas' },
      { k: '1.2s', v: 'tiempo de carga' },
      { k: '3.2x', v: 'retorno sobre inversión' },
    ],
    featured: false,
  },
  {
    id: 'agrotech', slug: 'agrotech', industry: 'AgroTech', color: '#10B981', icon: 'Tractor',
    title: 'Operación de campo conectada',
    client: 'AgroCampo Group', year: '2025',
    tagline: 'Agro · Operación de campo',
    desc: 'Plataforma que digitaliza la operación de campo: programación de lotes, seguimiento en tiempo real y reportes para toma de decisiones.',
    tags: ['React Native', 'Python', 'PostgreSQL', 'MQTT'],
    metrics: [
      { k: '+31%', v: 'eficiencia de cuadrillas' },
      { k: '1,200', v: 'hectáreas monitoreadas' },
      { k: '24/7', v: 'telemetría en vivo' },
    ],
    featured: false,
  },
  {
    id: 'fintech', slug: 'fintech', industry: 'FinTech', color: '#F59E0B', icon: 'DollarSign',
    title: 'Banca digital y pagos',
    client: 'Andes Digital Bank', year: '2025',
    tagline: 'Finanzas · Banca digital',
    desc: 'Solución financiera con cuentas digitales, transferencias y conciliación automatizada con estándares de seguridad de nivel bancario.',
    tags: ['Angular', 'Go', 'PostgreSQL', 'PCI-DSS'],
    metrics: [
      { k: '+52%', v: 'usuarios activos' },
      { k: '99.98%', v: 'disponibilidad' },
      { k: '0', v: 'incidentes de seguridad' },
    ],
    featured: false,
  },
  {
    id: 'healthtech', slug: 'healthtech', industry: 'HealthTech', color: '#EF4444', icon: 'Heart',
    title: 'Telemedicina y agendamiento',
    client: 'VitalNet Salud', year: '2025',
    tagline: 'Salud · Telemedicina',
    desc: 'Plataforma de telemedicina con videoconsultas, historia clínica digital y agendamiento inteligente para centros de salud.',
    tags: ['React', 'Node.js', 'MongoDB', 'WebRTC'],
    metrics: [
      { k: '+64%', v: 'consultas virtuales' },
      { k: '4.9/5', v: 'satisfacción paciente' },
      { k: '−45%', v: 'tiempo de agendamiento' },
    ],
    featured: false,
  },
  {
    id: 'edtech', slug: 'edtech', industry: 'EdTech', color: '#8B5CF6', icon: 'Book',
    title: 'Plataforma e-learning',
    client: 'Aula Pro', year: '2025',
    tagline: 'Educación · Plataformas e-learning',
    desc: 'LMS a medida con cursos, certificación, seguimiento de progreso y reportes de rendimiento para instituciones educativas.',
    tags: ['React', 'Django', 'PostgreSQL', 'Redis'],
    metrics: [
      { k: '15k', v: 'estudiantes activos' },
      { k: '+28%', v: 'tasa de finalización' },
      { k: '120', v: 'instituciones aliadas' },
    ],
    featured: false,
  },
  {
    id: 'logistics', slug: 'logistics', industry: 'Logistics', color: '#06B6D4', icon: 'Truck',
    title: 'Ruteo y logística inteligente',
    client: 'LogiExpress', year: '2025',
    tagline: 'Logística · Ruteo inteligente',
    desc: 'Sistema de ruteo inteligente con optimización de entregas, tracking en vivo y visibilidad de flota para operadores logísticos.',
    tags: ['Flutter', 'Node.js', 'PostgreSQL', 'Google Maps API'],
    metrics: [
      { k: '−23%', v: 'combustible por ruta' },
      { k: '98%', v: 'entregas a tiempo' },
      { k: '340', v: 'vehículos en flota' },
    ],
    featured: false,
  },
  {
    id: 'foodtech', slug: 'foodtech', industry: 'FoodTech', color: '#10B981', icon: 'Utensils',
    title: 'Gestión de restaurantes',
    client: 'Sabor 360', year: '2025',
    tagline: 'Alimentos · Gestión de restaurantes',
    desc: 'Suite de gestión para restaurantes: pedidos, inventario, menú digital y analítica de ventas en tiempo real.',
    tags: ['Vue.js', 'Node.js', 'MySQL', 'Stripe'],
    metrics: [
      { k: '+41%', v: 'ventas por ticket' },
      { k: '9', v: 'sedes integradas' },
      { k: '−18%', v: 'desperdicio de inventario' },
    ],
    featured: false,
  },
];

const LOCAL_FEATURED = LOCAL_PROJECTS.filter((p) => p.featured);

function normalizeProject(p) {
  return {
    id: p.slug || p.id,
    slug: p.slug,
    industry: p.industry || '',
    title: p.title || '',
    client: p.client || null,
    year: p.year || String(new Date().getFullYear()),
    color: p.color || '#22D3EE',
    icon: p.icon || 'Folder',
    tagline: p.tagline || '',
    desc: p.desc || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    metrics: Array.isArray(p.metrics) ? p.metrics : [],
    featured: !!p.featured,
    active: p.active !== undefined ? !!p.active : true,
    order: typeof p.order === 'number' ? p.order : 0,
    translations: p.translations || null,
  };
}

// Public list — localized active projects, or the bundled ES catalog when the API is down.
async function fetchProjects(lang) {
  const l = (lang && ['es', 'en', 'pt', 'fr', 'de'].includes(lang)) ? lang : readLang();
  if (API_BASE == null) return LOCAL_PROJECTS.map(normalizeProject);
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 2500) : null;
    const res = await fetch(`${API_BASE}/api/projects?lang=${encodeURIComponent(l)}`, {
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    if (!data || !data.ok || !Array.isArray(data.projects) || data.projects.length === 0) {
      throw new Error('empty payload');
    }
    return data.projects.map(normalizeProject);
  } catch (e) {
    return LOCAL_PROJECTS.map(normalizeProject);
  }
}

// Admin list — all projects (incl. inactive) with full translations.
async function fetchAdminProjects(lang) {
  if (API_BASE == null) return { ok: false, status: 0, projects: [] };
  const l = (lang && ['es', 'en', 'pt', 'fr', 'de'].includes(lang)) ? lang : 'es';
  const res = await apiReq(`/api/admin/projects?lang=${encodeURIComponent(l)}`);
  if (res.ok && res.data && Array.isArray(res.data.projects)) {
    return { ok: true, status: res.status, projects: res.data.projects.map(normalizeProject) };
  }
  return { ok: false, status: res.status, projects: [] };
}

// Create or update a project (upsert by slug). Expects a payload with base fields
// plus `translations: { es: { title, tagline, desc }, en: {...}, ... }`.
async function saveProject(project) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const payload = Object.assign({}, project);
  const res = await apiReq('/api/projects', { method: 'POST', body: payload });
  if (res.ok && res.data && res.data.ok && res.data.project) {
    return { ok: true, status: res.status, project: normalizeProject(res.data.project) };
  }
  return { ok: false, status: res.status, error: (res.data && res.data.error) || 'Error al guardar' };
}

// Partial update of an existing project.
async function updateProject(slug, patch) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/projects/${encodeURIComponent(slug)}`, { method: 'PUT', body: patch });
  if (res.ok && res.data && res.data.ok && res.data.project) {
    return { ok: true, status: res.status, project: normalizeProject(res.data.project) };
  }
  return { ok: false, status: res.status, error: (res.data && res.data.error) || 'Error al actualizar' };
}

async function deleteProject(slug) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/projects/${encodeURIComponent(slug)}`, { method: 'DELETE' });
  return { ok: res.ok && res.data && res.data.ok, status: res.status };
}

export {
  fetchProjects,
  fetchAdminProjects,
  saveProject,
  updateProject,
  deleteProject,
  LOCAL_PROJECTS,
  LOCAL_FEATURED,
};
