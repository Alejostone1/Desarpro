// projectData — single source of truth for projects.
// Tries the backend API (GET /api/projects) with a short timeout; on any
// failure (offline, Vercel static build, server down) it falls back to the
// local catalog below so the site always renders.

// Only query the backend when the site is running locally (localhost / LAN dev).
// On deployed static hosts (Vercel) there is no backend, so skip the fetch and
// render straight from the local catalog — no artificial loading delay.
function isLocalHost() {
  if (typeof window === 'undefined') return true;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}
const API_BASE = (typeof window !== 'undefined' && window.__DESARPRO_API_BASE) || (isLocalHost() ? 'http://localhost:3001' : null);

// Local fallback catalog — mirrors the seeded backend rows.
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

async function fetchProjects() {
  if (!API_BASE) return LOCAL_PROJECTS;
  try {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 2500) : null;
    const res = await fetch(`${API_BASE}/api/projects`, {
      signal: ctrl ? ctrl.signal : undefined,
    });
    if (timer) clearTimeout(timer);
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    if (!data || !data.ok || !Array.isArray(data.projects) || data.projects.length === 0) {
      throw new Error('empty payload');
    }
    return data.projects.map((p) => ({
      id: p.slug || p.id,
      slug: p.slug,
      industry: p.industry,
      title: p.title,
      client: p.client,
      year: p.year,
      color: p.color,
      icon: p.icon,
      tagline: p.tagline,
      desc: p.desc,
      tags: p.tags || [],
      metrics: p.metrics || [],
      featured: !!p.featured,
    }));
  } catch (e) {
    return LOCAL_PROJECTS;
  }
}

Object.assign(window, { fetchProjects, LOCAL_PROJECTS, LOCAL_FEATURED });
