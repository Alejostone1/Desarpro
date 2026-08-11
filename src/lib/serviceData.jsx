// serviceData — data layer for services, technologies, leads, SEO, site config
// and the admin dashboard.
//
// The database (via the backend API) is the source of truth; every module keeps
// a bundled ES fallback so the site never breaks when the API is unreachable.
// Follows the same conventions as src/lib/projectData.jsx.

import React from 'react';
import { resolveApiBase } from './apiBase.js';

const TOKEN_KEY = 'desarpro:admin:token';

function readToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}

const API_BASE = resolveApiBase();

function readLang() {
  if (typeof window === 'undefined') return 'es';
  try { return localStorage.getItem('desarpro:language') || 'es'; } catch (e) { return 'es'; }
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

// ---------- Services ----------
// Bundled ES fallback catalog (mirrors the seeded DB rows).
const SERVICE_CATALOG = [
  { id: 'svc-web', slug: 'svc-web', kind: 'web', icon: 'Globe', color: '#3B82F6', featured: true, name: 'Desarrollo Web', tagline: 'Sitios, portales y plataformas modernas', overview: 'Construimos sitios y plataformas web modernas, rápidas y optimizadas para conversión. Desde landing pages hasta portales corporativos completos con CMS headless y arquitectura escalable.', bullets: ['Landing pages de alta conversión', 'Portales corporativos', 'Progressive Web Apps', 'Headless CMS'], deliverables: ['Diseño UX/UI personalizado', 'Sitio responsive y accesible', 'CMS headless', 'SEO técnico on-page', 'Integración GA4', 'Optimización Core Web Vitals'], process: ['Diagnóstico', 'Wireframes', 'Diseño UI', 'Desarrollo', 'QA & Despliegue'] },
  { id: 'svc-mobile', slug: 'svc-mobile', kind: 'mobile', icon: 'Smartphone', color: '#8B5CF6', featured: true, name: 'Aplicaciones Móviles', tagline: 'Apps nativas y multiplataforma', overview: 'Aplicaciones móviles nativas y multiplataforma con experiencia fluida, soporte offline y notificaciones push. Publicamos en App Store y Google Play.', bullets: ['iOS y Android nativo', 'React Native · Flutter', 'Push notifications', 'Offline-first'], deliverables: ['App iOS y Android', 'Diseño nativo por plataforma', 'Notificaciones push', 'Modo offline'], process: ['Concepto', 'Prototipo', 'Desarrollo', 'Beta TestFlight', 'Lanzamiento'] },
  { id: 'svc-software', slug: 'svc-software', kind: 'software', icon: 'Layers', color: '#F97316', featured: true, name: 'Software a Medida', tagline: 'ERP, CRM y plataformas SaaS', overview: 'ERPs, CRMs y plataformas SaaS multi-tenant a medida. Cuando los productos del mercado no se ajustan, construimos el sistema que tu operación necesita.', bullets: ['Multi-tenant SaaS', 'Roles y permisos', 'Reportería avanzada', 'Integraciones'], deliverables: ['Arquitectura multi-tenant', 'Panel administrativo', 'Roles y permisos', 'Integraciones API'], process: ['Análisis funcional', 'Arquitectura', 'MVP', 'Iteración', 'Producción'] },
  { id: 'svc-maintenance', slug: 'svc-maintenance', kind: 'maintenance', icon: 'Wrench', color: '#F59E0B', featured: true, name: 'Mantenimiento y Soporte', tagline: 'Sistemas vivos en el tiempo', overview: 'Mantenimiento evolutivo y correctivo para sistemas en producción. Soporte continuo con SLA real.', bullets: ['Soporte 24/7', 'Mejora continua', 'Hotfixes y patches', 'Backups gestionados'], deliverables: ['Soporte técnico mensual', 'Mantenimiento correctivo', 'Mejora continua', 'Monitoreo 24/7'], process: ['Onboarding', 'Diagnóstico', 'Plan mensual', 'Sprints continuos'] },
  { id: 'svc-consulting', slug: 'svc-consulting', kind: 'consulting', icon: 'Compass', color: '#A855F7', featured: true, name: 'Consultoría TI', tagline: 'Estrategia y arquitectura', overview: 'Consultoría tecnológica para tomar buenas decisiones antes de invertir. Auditamos stack, procesos y equipo, y entregamos un roadmap accionable.', bullets: ['Diagnóstico tecnológico', 'Roadmap', 'Selección de stack', 'Auditoría de procesos'], deliverables: ['Diagnóstico tecnológico', 'Auditoría de código', 'Roadmap a 12 meses', 'Selección de stack'], process: ['Kick-off', 'Auditoría', 'Análisis', 'Roadmap', 'Presentación'] },
  { id: 'svc-seo', slug: 'svc-seo', kind: 'seo', icon: 'Search', color: '#14B8A6', featured: true, name: 'SEO y Posicionamiento', tagline: 'Crecimiento orgánico medible', overview: 'SEO técnico y estratégico que se traduce en tráfico calificado. Métricas, plan y resultados verificables mes a mes.', bullets: ['SEO técnico', 'Content strategy', 'Core Web Vitals', 'Tracking GA4'], deliverables: ['Auditoría SEO técnico', 'Investigación de keywords', 'Optimización on-page', 'Core Web Vitals'], process: ['Auditoría', 'Plan keywords', 'Optimización', 'Contenido', 'Reporte'] },
  { id: 'svc-ai', slug: 'svc-ai', kind: 'ai', icon: 'Brain', color: '#EC4899', featured: false, name: 'IA Aplicada', tagline: 'IA integrada en tu operación', overview: 'Integramos inteligencia artificial en tu operación: chatbots, modelos predictivos, procesamiento de documentos y automatizaciones.', bullets: ['Chatbots inteligentes', 'Modelos predictivos', 'Procesamiento de documentos', 'OpenAI · Claude · Gemini'], deliverables: ['Chatbot multicanal', 'Modelos predictivos', 'OCR y documentos', 'Automatizaciones'], process: ['Caso de uso', 'POC', 'Modelo', 'Integración', 'Operación'] },
  { id: 'svc-security', slug: 'svc-security', kind: 'security', icon: 'Shield', color: '#EF4444', featured: false, name: 'Ciberseguridad', tagline: 'Auditoría y hardening', overview: 'Auditorías de seguridad, pentesting y hardening para sistemas en producción. Encontramos vulnerabilidades antes que los atacantes.', bullets: ['OWASP Top 10', 'Pentesting', 'Hardening de servidores', 'Reportes de cumplimiento'], deliverables: ['Auditoría OWASP Top 10', 'Pentest de aplicación', 'Hardening de servidores', 'Reporte ejecutivo'], process: ['Scope', 'Recon', 'Análisis', 'Reporte', 'Fix & Re-test'] },
  { id: 'svc-cloud', slug: 'svc-cloud', kind: 'cloud', icon: 'Cloud', color: '#06B6D4', featured: false, name: 'DevOps & Cloud', tagline: 'Infraestructura escalable', overview: 'DevOps y arquitectura cloud para sistemas que necesitan escalar sin caerse. Infraestructura como código, CI/CD, contenedores y monitoreo.', bullets: ['AWS · GCP · Azure', 'Docker · Kubernetes', 'CI/CD pipelines', 'Monitoreo y alertas'], deliverables: ['Arquitectura cloud', 'Infraestructura como código', 'Dockerización', 'CI/CD pipelines'], process: ['Diseño', 'IaC', 'CI/CD', 'Despliegue', 'Operación'] },
  { id: 'svc-data', slug: 'svc-data', kind: 'data', icon: 'Database', color: '#10B981', featured: false, name: 'Bases de Datos', tagline: 'Datos confiables y rápidos', overview: 'Diseño, optimización y migración de bases de datos. Modelos relacionales y NoSQL bien pensados para datos confiables y rápidos.', bullets: ['Diseño relacional', 'Modelado NoSQL', 'Optimización de queries', 'Migraciones seguras'], deliverables: ['Diseño relacional', 'Modelado NoSQL', 'Optimización de queries', 'Migraciones seguras'], process: ['Análisis', 'Diseño', 'Migración', 'Optimización'] },
  { id: 'svc-bi', slug: 'svc-bi', kind: 'bi', icon: 'BarChart', color: '#F59E0B', featured: false, name: 'Analítica y BI', tagline: 'Datos en decisiones', overview: 'Convertimos datos dispersos en dashboards ejecutivos con KPIs claros. ETL automatizados y reportes que se actualizan solos.', bullets: ['Power BI · Metabase', 'Dashboards ejecutivos', 'KPIs personalizados', 'ETL automatizados'], deliverables: ['Modelado dimensional', 'ETL automatizado', 'Dashboards ejecutivos', 'KPIs personalizados'], process: ['Discovery', 'Modelado', 'ETL', 'Dashboards', 'Operación'] },
  { id: 'svc-api', slug: 'svc-api', kind: 'api', icon: 'Plug', color: '#8B5CF6', featured: false, name: 'Integración APIs', tagline: 'Sistemas que se hablan', overview: 'Conectamos tus sistemas: pasarelas de pago, facturación electrónica DIAN, ERPs, WhatsApp Business y APIs públicas.', bullets: ['REST y GraphQL', 'Webhooks', 'Pasarelas de pago', 'Facturación electrónica DIAN'], deliverables: ['APIs REST y GraphQL', 'Webhooks', 'Pasarelas de pago', 'Facturación electrónica DIAN'], process: ['Discovery', 'Diseño', 'Implementación', 'Testing', 'Operación'] },
];

function normalizeService(s) {
  return {
    id: s.id,
    slug: s.slug,
    kind: s.kind || (s.slug || '').replace('svc-', ''),
    icon: s.icon || 'Layers',
    color: s.color || '#22D3EE',
    featured: !!s.featured,
    active: s.active !== undefined ? !!s.active : true,
    order: typeof s.order === 'number' ? s.order : 0,
    name: s.name || '',
    tagline: s.tagline || '',
    overview: s.overview || '',
    bullets: Array.isArray(s.bullets) ? s.bullets : [],
    deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
    process: Array.isArray(s.process) ? s.process : [],
    translations: s.translations || null,
  };
}

// Public localized services (DB) with bundled catalog fallback.
async function fetchServices(lang) {
  const l = (lang && ['es', 'en', 'pt', 'fr', 'de'].includes(lang)) ? lang : readLang();
  if (API_BASE == null) return SERVICE_CATALOG.map(normalizeService);
  try {
    const res = await apiReq(`/api/services?lang=${encodeURIComponent(l)}`);
    if (res.ok && res.data && Array.isArray(res.data.services) && res.data.services.length) {
      return res.data.services.map(normalizeService);
    }
    return SERVICE_CATALOG.map(normalizeService);
  } catch (e) {
    return SERVICE_CATALOG.map(normalizeService);
  }
}

async function fetchAdminServices() {
  if (API_BASE == null) return { ok: false, status: 0, services: [] };
  const res = await apiReq('/api/admin/services');
  if (res.ok && res.data && Array.isArray(res.data.services)) {
    return { ok: true, status: res.status, services: res.data.services.map(normalizeService) };
  }
  return { ok: false, status: res.status, services: [] };
}

async function saveService(service) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq('/api/services', { method: 'POST', body: service });
  if (res.ok && res.data && res.data.ok && res.data.service) {
    return { ok: true, status: res.status, service: normalizeService(res.data.service) };
  }
  return { ok: false, status: res.status, error: (res.data && res.data.error) || 'Error al guardar' };
}

async function updateService(slug, patch) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/services/${encodeURIComponent(slug)}`, { method: 'PUT', body: patch });
  if (res.ok && res.data && res.data.ok && res.data.service) {
    return { ok: true, status: res.status, service: normalizeService(res.data.service) };
  }
  return { ok: false, status: res.status, error: (res.data && res.data.error) || 'Error al actualizar' };
}

async function deleteService(slug) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/services/${encodeURIComponent(slug)}`, { method: 'DELETE' });
  return { ok: res.ok && res.data && res.data.ok, status: res.status };
}

// ---------- Technologies ----------
function normalizeTechnology(t) {
  return {
    id: t.id,
    name: t.name,
    color: t.color || '#22D3EE',
    category: t.category || 'Otros',
    featured: !!t.featured,
    active: t.active !== undefined ? !!t.active : true,
    order: typeof t.order === 'number' ? t.order : 0,
  };
}

async function fetchTechnologies() {
  if (API_BASE == null) return [];
  try {
    const res = await apiReq('/api/technologies');
    if (res.ok && res.data && Array.isArray(res.data.technologies)) {
      return res.data.technologies.map(normalizeTechnology);
    }
    return [];
  } catch (e) { return []; }
}

async function fetchAdminTechnologies() {
  if (API_BASE == null) return { ok: false, status: 0, technologies: [] };
  const res = await apiReq('/api/admin/technologies');
  if (res.ok && res.data && Array.isArray(res.data.technologies)) {
    return { ok: true, status: res.status, technologies: res.data.technologies.map(normalizeTechnology) };
  }
  return { ok: false, status: res.status, technologies: [] };
}

async function saveTechnology(tech) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq('/api/technologies', { method: 'POST', body: tech });
  if (res.ok && res.data && res.data.ok && res.data.technology) {
    return { ok: true, status: res.status, technology: normalizeTechnology(res.data.technology) };
  }
  return { ok: false, status: res.status, error: (res.data && res.data.error) || 'Error al guardar' };
}

async function deleteTechnology(id) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/technologies/${id}`, { method: 'DELETE' });
  return { ok: res.ok && res.data && res.data.ok, status: res.status };
}

// ---------- Site config ----------
const SITE_CONFIG_DEFAULTS = {
  sections: { hero: true, stats: true, services: true, tech: true, process: true, cta: true },
  heroImage: '',
  announcement: '',
  announcementActive: false,
};

async function fetchSiteConfig() {
  if (API_BASE == null) return SITE_CONFIG_DEFAULTS;
  try {
    const res = await apiReq('/api/site-config');
    if (res.ok && res.data && res.data.config) return { ...SITE_CONFIG_DEFAULTS, ...res.data.config };
    return SITE_CONFIG_DEFAULTS;
  } catch (e) { return SITE_CONFIG_DEFAULTS; }
}

async function saveSiteConfig(key, value) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq('/api/admin/site-config', { method: 'PUT', body: { key, value } });
  return { ok: res.ok && res.data && res.data.ok, status: res.status, config: res.data && res.data.config };
}

// ---------- SEO ----------
async function fetchSeo(lang) {
  const l = (lang && ['es', 'en', 'pt', 'fr', 'de'].includes(lang)) ? lang : readLang();
  if (API_BASE == null) return null;
  try {
    const res = await apiReq(`/api/seo?lang=${encodeURIComponent(l)}`);
    if (res.ok && res.data && res.data.seo) return res.data.seo;
    return null;
  } catch (e) { return null; }
}

async function fetchAdminSeo() {
  if (API_BASE == null) return { ok: false, status: 0, seo: [] };
  const res = await apiReq('/api/admin/seo');
  if (res.ok && res.data && Array.isArray(res.data.seo)) return { ok: true, status: res.status, seo: res.data.seo };
  return { ok: false, status: res.status, seo: [] };
}

async function saveSeo(entry) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq('/api/admin/seo', { method: 'POST', body: entry });
  return { ok: res.ok && res.data && res.data.ok, status: res.status };
}

async function deleteSeo(route, lang) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const q = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const res = await apiReq(`/api/admin/seo/${encodeURIComponent(route)}${q}`, { method: 'DELETE' });
  return { ok: res.ok && res.data && res.data.ok, status: res.status };
}

// ---------- Leads ----------
async function submitContact(payload) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq('/api/contact', { method: 'POST', body: payload });
  return { ok: res.ok && res.data && res.data.ok, status: res.status, data: res.data };
}

async function fetchAdminLeads(status = 'all', q = '') {
  if (API_BASE == null) return { ok: false, status: 0, leads: [], counts: {} };
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (q) params.set('q', q);
  const res = await apiReq(`/api/admin/leads?${params.toString()}`);
  if (res.ok && res.data && Array.isArray(res.data.leads)) {
    return { ok: true, status: res.status, leads: res.data.leads, counts: res.data.counts || {} };
  }
  return { ok: false, status: res.status, leads: [], counts: {} };
}

async function updateLead(id, patch) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/admin/leads/${id}`, { method: 'PUT', body: patch });
  return { ok: res.ok && res.data && res.data.ok, status: res.status, lead: res.data && res.data.lead };
}

async function deleteLead(id) {
  if (API_BASE == null) return { ok: false, status: 0 };
  const res = await apiReq(`/api/admin/leads/${id}`, { method: 'DELETE' });
  return { ok: res.ok && res.data && res.data.ok, status: res.status };
}

// ---------- Dashboard ----------
async function fetchDashboard() {
  if (API_BASE == null) return { ok: false, status: 0, dashboard: null };
  const res = await apiReq('/api/admin/dashboard');
  if (res.ok && res.data && res.data.dashboard) return { ok: true, status: res.status, dashboard: res.data.dashboard };
  return { ok: false, status: res.status, dashboard: null };
}

// ---------- React hooks ----------
function useServices(lang) {
  const [state, setState] = React.useState({ loading: true, services: [] });
  React.useEffect(() => {
    let mounted = true;
    fetchServices(lang).then((services) => {
      if (mounted) setState({ loading: false, services });
    });
    return () => { mounted = false; };
  }, [lang]);
  return state;
}

function useTechnologies() {
  const [state, setState] = React.useState({ loading: true, technologies: [] });
  React.useEffect(() => {
    let mounted = true;
    fetchTechnologies().then((technologies) => {
      if (mounted) setState({ loading: false, technologies });
    });
    return () => { mounted = false; };
  }, []);
  return state;
}

function useSiteConfig() {
  const [state, setState] = React.useState({ loading: true, config: SITE_CONFIG_DEFAULTS });
  React.useEffect(() => {
    let mounted = true;
    fetchSiteConfig().then((config) => {
      if (mounted) setState({ loading: false, config });
    });
    return () => { mounted = false; };
  }, []);
  return state;
}

// Merge DB service values over the bundled catalog so pages always have full data.
function mergeServices(catalog, dbServices) {
  const map = {};
  for (const s of dbServices || []) map[s.slug || s.id] = s;
  return (catalog || SERVICE_CATALOG).map((base) => {
    const db = map[base.slug || base.id];
    if (!db) return base;
    return {
      ...base,
      name: db.name || base.name,
      tagline: db.tagline || base.tagline,
      overview: db.overview || base.overview,
      bullets: (db.bullets && db.bullets.length ? db.bullets : base.bullets),
      deliverables: (db.deliverables && db.deliverables.length ? db.deliverables : base.deliverables),
      process: (db.process && db.process.length ? db.process : base.process),
      active: db.active,
      featured: db.featured,
      icon: db.icon || base.icon,
      color: db.color || base.color,
      order: typeof db.order === 'number' ? db.order : base.order,
    };
  });
}

export {
  API_BASE,
  SERVICE_CATALOG,
  SITE_CONFIG_DEFAULTS,
  fetchServices,
  fetchAdminServices,
  saveService,
  updateService,
  deleteService,
  fetchTechnologies,
  fetchAdminTechnologies,
  saveTechnology,
  deleteTechnology,
  fetchSiteConfig,
  saveSiteConfig,
  fetchSeo,
  fetchAdminSeo,
  saveSeo,
  deleteSeo,
  submitContact,
  fetchAdminLeads,
  updateLead,
  deleteLead,
  fetchDashboard,
  useServices,
  useTechnologies,
  useSiteConfig,
  mergeServices,
};
