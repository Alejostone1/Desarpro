// contentSeedData — canonical content registry used by BOTH:
//  - seed.js / server.js (Node via require)
//  - the browser CMS (loaded as a classic script, exposes window.__CONTENT_SEED)
//
// It holds the ES defaults for every editable content key, the admin grouping,
// and the mapping from the i18n translation tree to DB content keys so the seed
// can populate all 5 languages with the real existing translations.

(function (global, factory) {
  var out = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = out;
  } else {
    global.__CONTENT_SEED = out;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  var LANGUAGES = ['es', 'en', 'pt', 'fr', 'de'];

  // ES defaults — mirrors src/lib/admin.jsx DEFAULT_CONTENT plus the text
  // fields that today live only in translations.jsx (about, footer, projects).
  var CONTENT_DEFAULTS = {
    // ===== Home — Hero =====
    'hero.badge': 'Aceptando proyectos para 2026',
    'hero.title.line1': 'Tecnología que',
    'hero.title.highlight': 'transforma',
    'hero.title.line2': 'tu negocio',
    'hero.subtitle': 'Desarrollamos software a medida, apps móviles, plataformas SaaS y soluciones de IA, ciberseguridad e infraestructura para empresas que quieren crecer con base sólida en Colombia y Latinoamérica.',
    'hero.cta.primary': 'Cotizar mi proyecto',
    'hero.cta.secondary': 'Ver casos reales',

    // ===== Home — Stats =====
    'stats.1.value': '12',
    'stats.1.label': 'Servicios tecnológicos',
    'stats.2.value': '11',
    'stats.2.label': 'Paquetes estratégicos',
    'stats.3.value': '24h',
    'stats.3.label': 'Tiempo de respuesta',
    'stats.4.value': '100%',
    'stats.4.label': 'Soluciones a medida',

    // ===== Home — Services preview =====
    'services.eyebrow': 'Lo que hacemos',
    'services.title.pre': 'Construimos soluciones que',
    'services.title.highlight': 'funcionan',
    'services.subtitle': 'Cada servicio sigue un proceso probado: diagnóstico, diseño, desarrollo, despliegue y soporte. Sin atajos, sin promesas vacías.',

    // ===== Home — Tech =====
    'tech.eyebrow': 'Stack moderno',
    'tech.title': 'Tecnologías con las que trabajamos',

    // ===== Home — Process =====
    'process.eyebrow': 'Proceso',
    'process.title': 'Cómo trabajamos contigo',
    'process.1.title': 'Diagnóstico',
    'process.1.desc': 'Entendemos tu negocio, procesos y dolor real antes de proponer.',
    'process.2.title': 'Diseño',
    'process.2.desc': 'UX, arquitectura y prototipo. Validamos antes de codificar.',
    'process.3.title': 'Desarrollo',
    'process.3.desc': 'Sprints cortos, demos cada 2 semanas, código revisado.',
    'process.4.title': 'Continuidad',
    'process.4.desc': 'Despliegue, capacitación y soporte continuo post-lanzamiento.',

    // ===== Home — CTA =====
    'cta.title': '¿Listos para construir algo serio?',
    'cta.subtitle': 'Te respondemos en menos de 24 horas con un diagnóstico inicial gratuito.',
    'cta.primary': 'Empezar conversación',
    'cta.secondary': 'Ver paquetes',

    // ===== Contact =====
    'contact.eyebrow': 'Contacto',
    'contact.title.pre': 'Hagamos algo',
    'contact.title.highlight': 'juntos',
    'contact.subtitle': 'Escríbenos sobre tu proyecto. Te responderemos en menos de 24 horas hábiles con un primer diagnóstico.',
    'contact.form.title': 'Cuéntanos sobre tu proyecto',
    'contact.success.title': '¡Mensaje recibido!',
    'contact.success.subtitle': 'Te respondemos en menos de 24 horas hábiles.',
    'contact.info.email.title': 'Email',
    'contact.email': 'info@desarpro.com',
    'contact.info.email.sub': 'Respuesta en 24h',
    'contact.info.wa.title': 'WhatsApp',
    'contact.whatsapp': '+57 300 000 0000',
    'contact.info.wa.sub': 'Lun-Vie 8am-6pm',
    'contact.info.loc.title': 'Oficina',
    'contact.location': 'Pereira, Colombia',
    'contact.info.loc.sub': 'Trabajamos remoto LATAM',

    // ===== Login =====
    'login.title.pre': 'Bienvenido a tu',
    'login.title.highlight': 'portal cliente',
    'login.subtitle': 'Accede al estado de tus proyectos, tickets de soporte, facturación y reportes en tiempo real. Todo lo que necesitas para mantener tu operación bajo control.',
    'login.feature.1': 'Estado de proyectos en vivo',
    'login.feature.2': 'Soporte técnico 24/7',
    'login.feature.3': 'Métricas y reportes ejecutivos',

    // ===== Footer =====
    'footer.description': 'Construimos sistemas que generan operación, control y crecimiento real para empresas en Colombia y Latinoamérica.',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.madeWith': 'Hecho con',
    'footer.inColombia': 'en Pereira, Colombia',
    'footer.contact.email': 'contacto@desarpro.co',
    'footer.contact.location': 'Pereira, Colombia',
    'footer.contact.hours': 'Lun–Vie · 8am–6pm',
    'footer.tagline': 'Desarrollo de software profesional para empresas que quieren crecer.',
    'footer.copyright': '© 2026 DesarPro. Todos los derechos reservados.',

    // ===== About =====
    'about.eyebrow': 'Sobre nosotros',
    'about.title.pre': 'Construimos software con',
    'about.title.highlight': 'propósito',
    'about.subtitle': 'DesarPro nació en Pereira, Colombia, con una idea simple: las empresas no necesitan más promesas tecnológicas, necesitan sistemas que funcionen. Nos especializamos en software a medida con base sólida.',
    'about.mission': 'Construir tecnología que resuelva problemas reales de negocio para empresas en Colombia y Latinoamérica, con foco en operación, control y crecimiento medible.',
    'about.vision': 'Ser el partner tecnológico de referencia para empresas que quieren crecer sin comprometer la calidad.',

    // ===== Projects (page + carousel texts) =====
    'projects.eyebrow': 'Casos reales',
    'projects.title': 'Proyectos que',
    'projects.titleHighlight': 'resuelven',
    'projects.subtitle': 'Trabajamos con empresas en agroindustria, salud animal, retail tecnológico, moda y más. Cada proyecto es una operación, no solo un sitio web.',
    'projects.industries.eyebrow': 'Industrias',
    'projects.industries.title': 'Una carpeta por sector',
    'projects.packages.eyebrow': '11 paquetes especializados',
    'projects.packages.title.pre': 'Encuentra el',
    'projects.packages.title.highlight': 'match',
    'projects.packages.subtitle': 'Desde validar una idea hasta operar una plataforma SaaS robusta. Cada paquete tiene alcance, entregables y tiempo definidos.',
    'projects_carousel.eyebrow': 'Casos destacados',
    'projects_carousel.title': 'Operaciones digitales en producción',
  };

  // Which admin section each key belongs to.
  function sectionFor(key) {
    if (key.indexOf('stats.') === 0) return 'stats';
    if (key.indexOf('projects_carousel.') === 0) return 'projectsText';
    if (key.indexOf('projects.') === 0) return 'projectsText';
    var dot = key.indexOf('.');
    var prefix = dot === -1 ? key : key.slice(0, dot);
    return prefix; // hero, services, tech, process, cta, contact, login, footer, about
  }

  // Type used by the admin editor (textarea for long/multiline fields).
  var TEXTAREA_KEYS = {};
  [
    'hero.subtitle', 'services.subtitle', 'process.1.desc', 'process.2.desc',
    'process.3.desc', 'process.4.desc', 'cta.subtitle', 'contact.subtitle',
    'contact.success.subtitle', 'login.subtitle', 'footer.description',
    'footer.tagline', 'about.subtitle', 'about.mission', 'about.vision',
    'projects.subtitle', 'projects.packages.subtitle',
  ].forEach(function (k) { TEXTAREA_KEYS[k] = true; });

  // Mapping from the i18n translation tree to DB content keys, so the seed can
  // fill every language with the real, already-translated strings. The path is
  // relative to the language root (e.g. ['hero','title','line1']).
  var TRANSLATION_MAP = [
    { key: 'hero.badge', path: ['hero', 'badge'] },
    { key: 'hero.title.line1', path: ['hero', 'title', 'line1'] },
    { key: 'hero.title.highlight', path: ['hero', 'title', 'highlight'] },
    { key: 'hero.title.line2', path: ['hero', 'title', 'line2'] },
    { key: 'hero.subtitle', path: ['hero', 'subtitle'] },
    { key: 'hero.cta.primary', path: ['hero', 'cta', 'primary'] },
    { key: 'hero.cta.secondary', path: ['hero', 'cta', 'secondary'] },

    { key: 'stats.1.label', path: ['stats', 'services'] },
    { key: 'stats.2.label', path: ['stats', 'packages'] },
    { key: 'stats.3.label', path: ['stats', 'response'] },
    { key: 'stats.4.label', path: ['stats', 'solutions'] },

    { key: 'services.eyebrow', path: ['services_section', 'eyebrow'] },
    { key: 'services.title.pre', path: ['services_section', 'title', 'pre'] },
    { key: 'services.title.highlight', path: ['services_section', 'title', 'highlight'] },
    { key: 'services.subtitle', path: ['services_section', 'subtitle'] },

    { key: 'contact.eyebrow', path: ['contact', 'eyebrow'] },
    { key: 'contact.subtitle', path: ['contact', 'subtitle'] },
    { key: 'contact.form.title', path: ['contact', 'title'] },
    { key: 'contact.success.title', path: ['contact', 'success', 'title'] },
    { key: 'contact.success.subtitle', path: ['contact', 'success', 'message'] },
    { key: 'contact.info.email.title', path: ['contact', 'info', 'email'] },
    { key: 'contact.email', path: ['contact', 'info', 'emailValue'] },
    { key: 'contact.info.email.sub', path: ['contact', 'info', 'emailSub'] },

    { key: 'login.title.pre', path: ['login', 'title', 'pre'] },
    { key: 'login.title.highlight', path: ['login', 'title', 'highlight'] },
    { key: 'login.subtitle', path: ['login', 'subtitle'] },
    { key: 'login.feature.1', path: ['login', 'features', 'projects'] },
    { key: 'login.feature.2', path: ['login', 'features', 'support'] },
    { key: 'login.feature.3', path: ['login', 'features', 'metrics'] },

    { key: 'footer.description', path: ['footer', 'description'] },
    { key: 'footer.rights', path: ['footer', 'rights'] },
    { key: 'footer.madeWith', path: ['footer', 'madeWith'] },
    { key: 'footer.inColombia', path: ['footer', 'inColombia'] },
    { key: 'footer.contact.email', path: ['footer', 'contact', 'email'] },
    { key: 'footer.contact.location', path: ['footer', 'contact', 'location'] },
    { key: 'footer.contact.hours', path: ['footer', 'contact', 'hours'] },

    { key: 'about.eyebrow', path: ['about', 'eyebrow'] },
    { key: 'about.subtitle', path: ['about', 'intro'] },
    { key: 'about.mission', path: ['about', 'mission'] },
    { key: 'about.vision', path: ['about', 'vision'] },

    { key: 'projects.eyebrow', path: ['projects', 'eyebrow'] },
    { key: 'projects.title', path: ['projects', 'title'] },
    { key: 'projects.titleHighlight', path: ['projects', 'titleHighlight'] },
    { key: 'projects.subtitle', path: ['projects', 'subtitle'] },
    { key: 'projects.industries.eyebrow', path: ['projects', 'industries', 'eyebrow'] },
    { key: 'projects.industries.title', path: ['projects', 'industries', 'title'] },
    { key: 'projects.packages.eyebrow', path: ['projects', 'packages', 'eyebrow'] },
    { key: 'projects.packages.title.pre', path: ['projects', 'packages', 'title', 'pre'] },
    { key: 'projects.packages.title.highlight', path: ['projects', 'packages', 'title', 'highlight'] },
    { key: 'projects.packages.subtitle', path: ['projects', 'packages', 'subtitle'] },
    { key: 'projects_carousel.eyebrow', path: ['projects_carousel', 'eyebrow'] },
    { key: 'projects_carousel.title', path: ['projects_carousel', 'title'] },
  ];

  var MAP_BY_KEY = {};
  TRANSLATION_MAP.forEach(function (entry) { MAP_BY_KEY[entry.key] = entry; });

  // Look up a dotted path inside an object.
  function getPath(obj, path) {
    var cur = obj;
    for (var i = 0; i < path.length; i++) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = cur[path[i]];
    }
    return typeof cur === 'string' && cur.length ? cur : undefined;
  }

  // Build the ordered list of content keys (section order preserved).
  var ORDER = ['hero', 'stats', 'services', 'tech', 'process', 'cta', 'contact', 'login', 'footer', 'about', 'projectsText'];
  var ALL_KEYS = Object.keys(CONTENT_DEFAULTS).sort(function (a, b) {
    var sa = ORDER.indexOf(sectionFor(a));
    var sb = ORDER.indexOf(sectionFor(b));
    if (sa !== sb) return sa - sb;
    return a < b ? -1 : a > b ? 1 : 0;
  });

  function orderIndex(key) { return ALL_KEYS.indexOf(key); }

  function typeFor(key) { return TEXTAREA_KEYS[key] ? 'textarea' : 'text'; }

  // Resolve a content key's value for a given language. Uses the translation
  // map when available; otherwise falls back to the ES default (no invented
  // content). The es value is always CONTENT_DEFAULTS[key].
  function resolveValue(translations, lang, key) {
    var t = translations && translations[lang];
    if (!t) return CONTENT_DEFAULTS[key] || '';
    var entry = MAP_BY_KEY[key];
    if (entry) {
      var v = getPath(t, entry.path);
      if (v != null) return v;
    }
    if (lang === 'es') return CONTENT_DEFAULTS[key] || '';
    return CONTENT_DEFAULTS[key] || '';
  }

  // Canonical portfolio catalog (ES canonical text + metadata). Used by seed.js
  // and by the API reset flow so "restore all" is a true factory reset.
  var PROJECT_SEED = [
    { slug: 'vetai', industry: 'VetTech', color: '#06B6D4', icon: 'Stethoscope', title: 'Plataforma de diagnóstico veterinario asistido por IA', client: 'VetAI Diagnóstico', year: '2025', tagline: 'Salud veterinaria · Laboratorios', desc: 'Sistema multi-clínica con triaje inteligente, historia clínica electrónica y módulos de laboratorio. Reduce el tiempo de diagnóstico inicial en un 60%.', tags: ['React', 'Python', 'PostgreSQL', 'OpenAI API'], metrics: [{ k: '60%', v: 'menos tiempo de triaje' }, { k: '12', v: 'clínicas conectadas' }, { k: '4.8/5', v: 'NPS profesional' }], featured: true, order: 0 },
    { slug: 'trazacafe', industry: 'CoffeeTech', color: '#A78BFA', icon: 'Coffee', title: 'Trazabilidad de café desde la finca hasta la taza', client: 'TrazaCafé', year: '2025', tagline: 'Agroindustria · Trazabilidad de café', desc: 'App móvil + dashboard que rastrea cada lote desde el cafetal: cosecha, fermentación, secado, exportación. Con QR público que el comprador final escanea.', tags: ['React Native', 'Node.js', 'PostgreSQL', 'AWS S3'], metrics: [{ k: '180+', v: 'fincas activas' }, { k: '3 países', v: 'Colombia · USA · Japón' }, { k: '+22%', v: 'precio FOB promedio' }], featured: true, order: 1 },
    { slug: 'modaflow', industry: 'Fashion', color: '#EC4899', icon: 'Star', title: 'Portal B2B de pedidos para marca de moda', client: 'ModaFlow', year: '2025', tagline: 'Moda · Pedidos y catálogo', desc: 'Catálogo con showroom virtual, carrito, gestión de pedidos por temporada, integración con producción y facturación electrónica DIAN.', tags: ['Next.js', '.NET', 'SQL Server', 'Stripe'], metrics: [{ k: '+45%', v: 'pedidos online' }, { k: '320', v: 'multimarcas activas' }, { k: '−70%', v: 'errores de pedido' }], featured: true, order: 2 },
    { slug: 'ecommerce', industry: 'E-commerce', color: '#3B82F6', icon: 'ShoppingBag', title: 'Tienda online para retail tecnológico', client: 'TechRetail Store', year: '2025', tagline: 'Retail tecnológico', desc: 'E-commerce de alto rendimiento con catálogo dinámico, pasarela de pagos, búsqueda avanzada y panel de operación para el equipo de ventas.', tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'], metrics: [{ k: '+38%', v: 'conversión de visitas' }, { k: '1.2s', v: 'tiempo de carga' }, { k: '3.2x', v: 'retorno sobre inversión' }], featured: false, order: 3 },
    { slug: 'agrotech', industry: 'AgroTech', color: '#10B981', icon: 'Tractor', title: 'Operación de campo conectada', client: 'AgroCampo Group', year: '2025', tagline: 'Agro · Operación de campo', desc: 'Plataforma que digitaliza la operación de campo: programación de lotes, seguimiento en tiempo real y reportes para toma de decisiones.', tags: ['React Native', 'Python', 'PostgreSQL', 'MQTT'], metrics: [{ k: '+31%', v: 'eficiencia de cuadrillas' }, { k: '1,200', v: 'hectáreas monitoreadas' }, { k: '24/7', v: 'telemetría en vivo' }], featured: false, order: 4 },
    { slug: 'fintech', industry: 'FinTech', color: '#F59E0B', icon: 'DollarSign', title: 'Banca digital y pagos', client: 'Andes Digital Bank', year: '2025', tagline: 'Finanzas · Banca digital', desc: 'Solución financiera con cuentas digitales, transferencias y conciliación automatizada con estándares de seguridad de nivel bancario.', tags: ['Angular', 'Go', 'PostgreSQL', 'PCI-DSS'], metrics: [{ k: '+52%', v: 'usuarios activos' }, { k: '99.98%', v: 'disponibilidad' }, { k: '0', v: 'incidentes de seguridad' }], featured: false, order: 5 },
    { slug: 'healthtech', industry: 'HealthTech', color: '#EF4444', icon: 'Heart', title: 'Telemedicina y agendamiento', client: 'VitalNet Salud', year: '2025', tagline: 'Salud · Telemedicina', desc: 'Plataforma de telemedicina con videoconsultas, historia clínica digital y agendamiento inteligente para centros de salud.', tags: ['React', 'Node.js', 'MongoDB', 'WebRTC'], metrics: [{ k: '+64%', v: 'consultas virtuales' }, { k: '4.9/5', v: 'satisfacción paciente' }, { k: '−45%', v: 'tiempo de agendamiento' }], featured: false, order: 6 },
    { slug: 'edtech', industry: 'EdTech', color: '#8B5CF6', icon: 'Book', title: 'Plataforma e-learning', client: 'Aula Pro', year: '2025', tagline: 'Educación · Plataformas e-learning', desc: 'LMS a medida con cursos, certificación, seguimiento de progreso y reportes de rendimiento para instituciones educativas.', tags: ['React', 'Django', 'PostgreSQL', 'Redis'], metrics: [{ k: '15k', v: 'estudiantes activos' }, { k: '+28%', v: 'tasa de finalización' }, { k: '120', v: 'instituciones aliadas' }], featured: false, order: 7 },
    { slug: 'logistics', industry: 'Logistics', color: '#06B6D4', icon: 'Truck', title: 'Ruteo y logística inteligente', client: 'LogiExpress', year: '2025', tagline: 'Logística · Ruteo inteligente', desc: 'Sistema de ruteo inteligente con optimización de entregas, tracking en vivo y visibilidad de flota para operadores logísticos.', tags: ['Flutter', 'Node.js', 'PostgreSQL', 'Google Maps API'], metrics: [{ k: '−23%', v: 'combustible por ruta' }, { k: '98%', v: 'entregas a tiempo' }, { k: '340', v: 'vehículos en flota' }], featured: false, order: 8 },
    { slug: 'foodtech', industry: 'FoodTech', color: '#10B981', icon: 'Utensils', title: 'Gestión de restaurantes', client: 'Sabor 360', year: '2025', tagline: 'Alimentos · Gestión de restaurantes', desc: 'Suite de gestión para restaurantes: pedidos, inventario, menú digital y analítica de ventas en tiempo real.', tags: ['Vue.js', 'Node.js', 'MySQL', 'Stripe'], metrics: [{ k: '+41%', v: 'ventas por ticket' }, { k: '9', v: 'sedes integradas' }, { k: '−18%', v: 'desperdicio de inventario' }], featured: false, order: 9 },
  ];

  // Multi-language text for the portfolio projects. `es` is not needed here —
  // the canonical ES strings live in the project rows themselves. Missing
  // languages fall back to ES in the API serializer.
  var PROJECT_TRANSLATIONS = {
    vetai: {
      en: { title: "AI-powered veterinary diagnostic platform", tagline: "Veterinary health · Laboratories", desc: "Multi-clinic system with smart triage, electronic health records and laboratory modules. Cuts initial diagnosis time by 60%." },
      pt: { title: "Plataforma de diagnóstico veterinário assistido por IA", tagline: "Saúde veterinária · Laboratórios", desc: "Sistema multi-clínica com triagem inteligente, prontuário eletrônico e módulos de laboratório. Reduz o tempo de diagnóstico inicial em 60%." },
      fr: { title: "Plateforme de diagnostic vétérinaire assisté par IA", tagline: "Santé vétérinaire · Laboratoires", desc: "Système multi-clinique avec triage intelligent, dossier médical électronique et modules de laboratoire. Réduit le temps de diagnostic initial de 60%." },
      de: { title: "KI-gestützte Veterinärdiagnostik-Plattform", tagline: "Tiergesundheit · Labore", desc: "Multi-Praxis-System mit intelligentem Triage, elektronischer Patientenakte und Labor-Modulen. Reduziert die anfängliche Diagnosezeit um 60%." },
    },
    trazacafe: {
      en: { title: "Coffee traceability from farm to cup", tagline: "Agroindustry · Coffee traceability", desc: "Mobile app + dashboard tracking every batch from the farm: harvest, fermentation, drying, export. With a public QR code that end buyers scan." },
      pt: { title: "Rastreabilidade do café da fazenda à xícara", tagline: "Agroindústria · Rastreabilidade do café", desc: "App móvel + dashboard que rastreia cada lote desde o cafezal: colheita, fermentação, secagem, exportação. Com QR público que o comprador final escaneia." },
      fr: { title: "Traçabilité du café de la ferme à la tasse", tagline: "Agro-industrie · Traçabilité du café", desc: "Application mobile + tableau de bord qui suit chaque lot depuis le caféier : récolte, fermentation, séchage, exportation. Avec un QR public que l'acheteur final scanne." },
      de: { title: "Kaffee-Rückverfolgbarkeit vom Bauernhof bis zur Tasse", tagline: "Agrarindustrie · Kaffee-Rückverfolgbarkeit", desc: "Mobile App + Dashboard, die jede Charge vom Kaffeefeld verfolgt: Ernte, Fermentation, Trocknung, Export. Mit öffentlichem QR-Code für Endkäufer." },
    },
    modaflow: {
      en: { title: "B2B ordering portal for a fashion brand", tagline: "Fashion · Orders and catalog", desc: "Catalog with virtual showroom, cart, seasonal order management, production integration and electronic invoicing." },
      pt: { title: "Portal B2B de pedidos para marca de moda", tagline: "Moda · Pedidos e catálogo", desc: "Catálogo com showroom virtual, carrinho, gestão de pedidos por temporada, integração com produção e faturamento eletrônico." },
      fr: { title: "Portail B2B de commandes pour une marque de mode", tagline: "Mode · Commandes et catalogue", desc: "Catalogue avec showroom virtuel, panier, gestion des commandes par saison, intégration production et facturation électronique." },
      de: { title: "B2B-Bestellportal für eine Modemarke", tagline: "Mode · Bestellungen und Katalog", desc: "Katalog mit virtuellem Showroom, Warenkorb, saisonalem Bestellmanagement, Produktionsanbindung und E-Rechnung." },
    },
    ecommerce: {
      en: { title: "Online store for tech retail", tagline: "Tech retail", desc: "High-performance e-commerce with dynamic catalog, payment gateway, advanced search and an operations dashboard for the sales team." },
      pt: { title: "Loja online para varejo de tecnologia", tagline: "Varejo de tecnologia", desc: "E-commerce de alto desempenho com catálogo dinâmico, gateway de pagamentos, busca avançada e painel de operação para o time de vendas." },
      fr: { title: "Boutique en ligne pour le retail tech", tagline: "Retail technologique", desc: "E-commerce haute performance avec catalogue dynamique, passerelle de paiement, recherche avancée et tableau de bord opérationnel." },
      de: { title: "Online-Shop für Technik-Einzelhandel", tagline: "Technologie-Einzelhandel", desc: "Leistungsstarker E-Commerce mit dynamischem Katalog, Zahlungsgateway, erweiterter Suche und Operations-Dashboard." },
    },
    agrotech: {
      en: { title: "Connected field operations", tagline: "Agro · Field operations", desc: "Platform that digitalizes field operations: lot scheduling, real-time tracking and reports for decision-making." },
      pt: { title: "Operação de campo conectada", tagline: "Agro · Operação de campo", desc: "Plataforma que digitaliza a operação de campo: programação de lotes, acompanhamento em tempo real e relatórios para decisões." },
      fr: { title: "Opérations de terrain connectées", tagline: "Agro · Opérations de terrain", desc: "Plateforme qui digitalise les opérations terrain : planification des lots, suivi en temps réel et rapports." },
      de: { title: "Vernetzter Feldbetrieb", tagline: "Agro · Feldbetrieb", desc: "Plattform, die den Feldbetrieb digitalisiert: Losenplanung, Echtzeit-Tracking und Berichte für Entscheidungen." },
    },
    fintech: {
      en: { title: "Digital banking and payments", tagline: "Finance · Digital banking", desc: "Financial solution with digital accounts, transfers and automated reconciliation with bank-grade security standards." },
      pt: { title: "Banco digital e pagamentos", tagline: "Finanças · Banco digital", desc: "Solução financeira com contas digitais, transferências e conciliação automatizada com padrões de segurança bancária." },
      fr: { title: "Banque numérique et paiements", tagline: "Finance · Banque numérique", desc: "Solution financière avec comptes numériques, transferts et rapprochement automatisé aux standards bancaires." },
      de: { title: "Digitales Banking und Zahlungen", tagline: "Finanzen · Digitales Banking", desc: "Finanzlösung mit digitalen Konten, Überweisungen und automatisierter Abstimmung nach Bankstandard-Sicherheit." },
    },
    healthtech: {
      en: { title: "Telemedicine and scheduling", tagline: "Health · Telemedicine", desc: "Telemedicine platform with video consultations, digital health records and smart scheduling for healthcare centers." },
      pt: { title: "Telemedicina e agendamento", tagline: "Saúde · Telemedicina", desc: "Plataforma de telemedicina com videoconsultas, prontuário digital e agendamento inteligente para centros de saúde." },
      fr: { title: "Télémédecine et prise de rendez-vous", tagline: "Santé · Télémédecine", desc: "Plateforme de télémédecine avec consultations vidéo, dossier de santé numérique et agenda intelligent." },
      de: { title: "Telemedizin und Terminplanung", tagline: "Gesundheit · Telemedizin", desc: "Telemedizin-Plattform mit Video-Sprechstunden, digitaler Krankenakte und intelligenter Terminplanung." },
    },
    edtech: {
      en: { title: "E-learning platform", tagline: "Education · E-learning platforms", desc: "Custom LMS with courses, certification, progress tracking and performance reports for educational institutions." },
      pt: { title: "Plataforma e-learning", tagline: "Educação · Plataformas e-learning", desc: "LMS sob medida com cursos, certificação, acompanhamento de progresso e relatórios de desempenho." },
      fr: { title: "Plateforme e-learning", tagline: "Éducation · Plateformes e-learning", desc: "LMS sur mesure avec cours, certification, suivi de progression et rapports de performance." },
      de: { title: "E-Learning-Plattform", tagline: "Bildung · E-Learning-Plattformen", desc: "Maßgeschneidertes LMS mit Kursen, Zertifizierung, Fortschrittsverfolgung und Leistungsberichten." },
    },
    logistics: {
      en: { title: "Smart routing and logistics", tagline: "Logistics · Smart routing", desc: "Smart routing system with delivery optimization, live tracking and fleet visibility for logistics operators." },
      pt: { title: "Roteamento e logística inteligente", tagline: "Logística · Roteamento inteligente", desc: "Sistema de roteamento inteligente com otimização de entregas, rastreio ao vivo e visibilidade da frota." },
      fr: { title: "Routage et logistique intelligents", tagline: "Logistique · Routage intelligent", desc: "Système de routage intelligent avec optimisation des livraisons, suivi en direct et visibilité de la flotte." },
      de: { title: "Intelligente Routenplanung und Logistik", tagline: "Logistik · Intelligente Routenplanung", desc: "Intelligentes Routensystem mit Lieferoptimierung, Live-Tracking und Flottenübersicht." },
    },
    foodtech: {
      en: { title: "Restaurant management", tagline: "Food · Restaurant management", desc: "Management suite for restaurants: orders, inventory, digital menu and real-time sales analytics." },
      pt: { title: "Gestão de restaurantes", tagline: "Alimentos · Gestão de restaurantes", desc: "Suíte de gestão para restaurantes: pedidos, estoque, menu digital e análise de vendas em tempo real." },
      fr: { title: "Gestion de restaurants", tagline: "Alimentation · Gestion de restaurants", desc: "Suite de gestion pour restaurants : commandes, stocks, menu numérique et analytics en temps réel." },
      de: { title: "Restaurant-Management", tagline: "Food · Restaurant-Management", desc: "Management-Suite für Restaurants: Bestellungen, Lager, digitales Menü und Echtzeit-Verkaufsanalysen." },
    },
  };

  function resolveProjectTranslations(slug, lang) {
    var byLang = PROJECT_TRANSLATIONS[slug];
    if (!byLang || !byLang[lang]) return null;
    return { title: byLang[lang].title, tagline: byLang[lang].tagline, desc: byLang[lang].desc };
  }

  // ===== Services catalog =====
  // Canonical 12-service catalog (6 core/featured + 6 specialized). ES text
  // defaults mirror ALL_SERVICES + service_pages from translations.jsx.
  var SERVICE_CATALOG = [
    { kind: 'web',         slug: 'svc-web',         icon: 'Globe',     color: '#3B82F6', featured: true },
    { kind: 'mobile',      slug: 'svc-mobile',      icon: 'Smartphone', color: '#8B5CF6', featured: true },
    { kind: 'software',    slug: 'svc-software',    icon: 'Layers',     color: '#F97316', featured: true },
    { kind: 'maintenance', slug: 'svc-maintenance', icon: 'Wrench',     color: '#F59E0B', featured: true },
    { kind: 'consulting',  slug: 'svc-consulting',  icon: 'Compass',    color: '#A855F7', featured: true },
    { kind: 'seo',         slug: 'svc-seo',         icon: 'Search',     color: '#14B8A6', featured: true },
    { kind: 'ai',          slug: 'svc-ai',          icon: 'Brain',      color: '#EC4899', featured: false },
    { kind: 'security',    slug: 'svc-security',    icon: 'Shield',     color: '#EF4444', featured: false },
    { kind: 'cloud',       slug: 'svc-cloud',       icon: 'Cloud',      color: '#06B6D4', featured: false },
    { kind: 'data',        slug: 'svc-data',        icon: 'Database',   color: '#10B981', featured: false },
    { kind: 'bi',          slug: 'svc-bi',          icon: 'BarChart',   color: '#F59E0B', featured: false },
    { kind: 'api',         slug: 'svc-api',         icon: 'Plug',       color: '#8B5CF6', featured: false },
  ];

  // ES fallbacks per service (used only when a translation tree is missing).
  var SERVICE_ES_DEFAULTS = {
    web: { name: 'Desarrollo Web', tagline: 'Sitios, portales y plataformas modernas', bullets: ['Landing pages de alta conversión', 'Portales corporativos', 'Progressive Web Apps', 'Headless CMS'], overview: 'Construimos sitios y plataformas web modernas, rápidas y optimizadas para conversión. Desde landing pages hasta portales corporativos completos con CMS headless y arquitectura escalable.', deliverables: ['Diseño UX/UI personalizado', 'Sitio responsive y accesible (WCAG AA)', 'CMS headless (Strapi · Sanity)', 'SEO técnico on-page', 'Integración con analítica GA4', 'Optimización Core Web Vitals', 'Hosting y despliegue', 'Capacitación de uso'], process: ['Diagnóstico', 'Wireframes', 'Diseño UI', 'Desarrollo', 'QA & Despliegue'] },
    mobile: { name: 'Aplicaciones Móviles', tagline: 'Apps nativas y multiplataforma', bullets: ['iOS y Android nativo', 'React Native · Flutter', 'Push notifications', 'Offline-first'], overview: 'Aplicaciones móviles nativas y multiplataforma con experiencia fluida, soporte offline y notificaciones push. Publicamos en App Store y Google Play con todo el proceso técnico incluido.', deliverables: ['App iOS y Android', 'Diseño nativo por plataforma', 'Notificaciones push', 'Modo offline', 'Autenticación segura', 'Integración con backend', 'Publicación en stores', 'Analítica de uso'], process: ['Concepto', 'Prototipo', 'Desarrollo', 'Beta TestFlight', 'Lanzamiento'] },
    software: { name: 'Software a Medida', tagline: 'ERP, CRM y plataformas SaaS', bullets: ['Multi-tenant SaaS', 'Roles y permisos', 'Reportería avanzada', 'Integraciones'], overview: 'ERPs, CRMs y plataformas SaaS multi-tenant a medida. Cuando los productos del mercado no se ajustan, construimos el sistema que tu operación realmente necesita.', deliverables: ['Arquitectura multi-tenant', 'Panel administrativo', 'Roles y permisos granulares', 'Reportería avanzada', 'Integraciones API', 'Auditoría de cambios', 'Documentación técnica', 'Capacitación de equipo'], process: ['Análisis funcional', 'Arquitectura', 'MVP', 'Iteración', 'Producción'] },
    maintenance: { name: 'Mantenimiento y Soporte', tagline: 'Sistemas vivos en el tiempo', bullets: ['Soporte 24/7', 'Mejora continua', 'Hotfixes y patches', 'Backups gestionados'], overview: 'Mantenimiento evolutivo y correctivo para sistemas en producción. Tu sistema sigue mejorando, no solo "no se cae". Soporte continuo con SLA real.', deliverables: ['Soporte técnico mensual', 'Mantenimiento correctivo', 'Mejora continua', 'Backups gestionados', 'Monitoreo 24/7', 'Reportes mensuales', 'Hotfixes priorizados', 'Actualizaciones de seguridad'], process: ['Onboarding', 'Diagnóstico', 'Plan mensual', 'Sprints continuos'] },
    consulting: { name: 'Consultoría TI', tagline: 'Estrategia y arquitectura', bullets: ['Diagnóstico tecnológico', 'Roadmap', 'Selección de stack', 'Auditoría de procesos'], overview: 'Consultoría tecnológica para tomar buenas decisiones antes de invertir. Auditamos tu stack, procesos y equipo, y te entregamos un roadmap accionable.', deliverables: ['Diagnóstico tecnológico', 'Auditoría de código existente', 'Selección de stack', 'Roadmap a 12 meses', 'Evaluación de proveedores', 'Estrategia de escalabilidad', 'Análisis de costos', 'Workshop ejecutivo'], process: ['Kick-off', 'Auditoría', 'Análisis', 'Roadmap', 'Presentación'] },
    seo: { name: 'SEO y Posicionamiento', tagline: 'Crecimiento orgánico medible', bullets: ['SEO técnico', 'Content strategy', 'Core Web Vitals', 'Tracking GA4'], overview: 'SEO técnico y estratégico que se traduce en tráfico calificado. No promesas vacías: métricas, plan y resultados verificables mes a mes.', deliverables: ['Auditoría SEO técnico', 'Investigación de keywords', 'Optimización on-page', 'Estrategia de contenidos', 'Schema markup', 'Core Web Vitals', 'Reportes mensuales', 'Tracking GA4 + Search Console'], process: ['Auditoría', 'Plan keywords', 'Optimización', 'Contenido', 'Reporte'] },
    ai: { name: 'IA Aplicada', tagline: 'IA integrada en tu operación', bullets: ['Chatbots inteligentes', 'Modelos predictivos', 'Procesamiento de documentos', 'OpenAI · Claude · Gemini'], overview: 'Integramos inteligencia artificial en tu operación: chatbots inteligentes, modelos predictivos, procesamiento de documentos y automatizaciones que ahorran horas reales de trabajo.', deliverables: ['Chatbot multicanal (web · WhatsApp)', 'Modelos predictivos sobre tus datos', 'OCR y procesamiento de documentos', 'Automatizaciones inteligentes', 'Dashboards de IA', 'Integración con OpenAI · Claude', 'Pipelines de fine-tuning', 'Monitoreo de calidad'], process: ['Caso de uso', 'POC', 'Modelo', 'Integración', 'Operación'] },
    security: { name: 'Ciberseguridad', tagline: 'Auditoría y hardening', bullets: ['OWASP Top 10', 'Pentesting', 'Hardening de servidores', 'Reportes de cumplimiento'], overview: 'Auditorías de seguridad, pentesting y hardening para sistemas en producción. Encontramos vulnerabilidades antes que los atacantes y te ayudamos a cerrarlas.', deliverables: ['Auditoría OWASP Top 10', 'Pentest de aplicación', 'Hardening de servidores', 'Revisión de auth y permisos', 'Análisis de dependencias', 'Reporte ejecutivo', 'Plan de remediación', 'Re-test post-fix'], process: ['Scope', 'Recon', 'Análisis', 'Reporte', 'Fix & Re-test'] },
    cloud: { name: 'DevOps & Cloud', tagline: 'Infraestructura escalable', bullets: ['AWS · GCP · Azure', 'Docker · Kubernetes', 'CI/CD pipelines', 'Monitoreo y alertas'], overview: 'DevOps y arquitectura cloud para sistemas que necesitan escalar sin caerse. Infraestructura como código, CI/CD, contenedores y monitoreo.', deliverables: ['Diseño de arquitectura cloud', 'Infraestructura como código', 'Dockerización', 'Pipelines CI/CD', 'Despliegue en AWS · GCP · Azure', 'Monitoreo y alertas', 'Backups automáticos', 'Documentación operativa'], process: ['Diseño', 'IaC', 'CI/CD', 'Despliegue', 'Operación'] },
    data: { name: 'Bases de Datos', tagline: 'Datos confiables y rápidos', bullets: ['Diseño relacional', 'Modelado NoSQL', 'Optimización de queries', 'Migraciones seguras'], overview: 'Diseño, optimización y migración de bases de datos. Modelos relacionales y NoSQL bien pensados para que tus datos sean confiables y rápidos de consultar.', deliverables: ['Diseño relacional', 'Modelado NoSQL', 'Optimización de queries', 'Índices y particionamiento', 'Migraciones seguras', 'Backups y recuperación', 'Replicación', 'Documentación de schema'], process: ['Análisis', 'Diseño', 'Migración', 'Optimización'] },
    bi: { name: 'Analítica y BI', tagline: 'Datos en decisiones', bullets: ['Power BI · Metabase', 'Dashboards ejecutivos', 'KPIs personalizados', 'ETL automatizados'], overview: 'Convertimos datos dispersos en dashboards ejecutivos con KPIs claros. ETL automatizados, integración de fuentes y reportes que se actualizan solos.', deliverables: ['Modelado dimensional', 'ETL automatizado', 'Dashboards ejecutivos', 'KPIs personalizados', 'Reportes programados', 'Integración de fuentes', 'Capacitación', 'Soporte continuo'], process: ['Discovery', 'Modelado', 'ETL', 'Dashboards', 'Operación'] },
    api: { name: 'Integración APIs', tagline: 'Sistemas que se hablan', bullets: ['REST y GraphQL', 'Webhooks', 'Pasarelas de pago', 'Facturación electrónica DIAN'], overview: 'Conectamos tus sistemas con todo lo que necesite hablarse: pasarelas de pago, facturación electrónica DIAN, ERPs, WhatsApp Business, y APIs públicas.', deliverables: ['APIs REST y GraphQL', 'Webhooks', 'Pasarelas de pago', 'Facturación electrónica DIAN', 'WhatsApp Business API', 'Integraciones SAP · Siesa', 'Documentación OpenAPI', 'SDK cliente'], process: ['Discovery', 'Diseño', 'Implementación', 'Testing', 'Operación'] },
  };

  // Build the full multi-language service seed from the i18n tree, falling back
  // to ES defaults when a language is missing a service subtree.
  function resolveServiceSeed(translations) {
    return SERVICE_CATALOG.map(function (s, i) {
      var tr = {};
      LANGUAGES.forEach(function (lang) {
        var t = translations && translations[lang];
        var svc = t && t.services && t.services[s.kind];
        var sp = t && t.service_pages && t.service_pages[s.kind];
        var d = SERVICE_ES_DEFAULTS[s.kind];
        tr[lang] = {
          name: (svc && svc.name) || d.name,
          tagline: (svc && svc.desc) || d.tagline,
          bullets: (svc && svc.bullets) || d.bullets,
          overview: (sp && sp.overview) || d.overview,
          deliverables: (sp && sp.deliverables) || d.deliverables,
          process: (sp && sp.process) || d.process,
        };
      });
      return {
        slug: s.slug,
        kind: s.kind,
        icon: s.icon,
        color: s.color,
        featured: s.featured,
        active: true,
        order: i,
        translations: tr,
      };
    });
  }

  // ===== Technologies catalog =====
  // Mirrors src/lib/techLogos.jsx (name + color + logical category).
  var TECHNOLOGY_SEED = [
    { name: 'React',         color: '#61DAFB', category: 'Frontend' },
    { name: 'Next.js',       color: '#FFFFFF', category: 'Frontend' },
    { name: 'Vue.js',        color: '#42B883', category: 'Frontend' },
    { name: 'Angular',       color: '#DD0031', category: 'Frontend' },
    { name: 'JavaScript',    color: '#F7DF1E', category: 'Frontend' },
    { name: 'TypeScript',    color: '#3178C6', category: 'Frontend' },
    { name: 'Tailwind CSS',  color: '#06B6D4', category: 'Frontend' },
    { name: 'Figma',         color: '#F24E1E', category: 'Diseño' },
    { name: 'Node.js',       color: '#8CC84B', category: 'Backend' },
    { name: 'Python',        color: '#3776AB', category: 'Backend' },
    { name: 'GraphQL',       color: '#E10098', category: 'Backend' },
    { name: 'Firebase',      color: '#FFCA28', category: 'Backend' },
    { name: 'PostgreSQL',    color: '#336791', category: 'Data' },
    { name: 'MySQL',         color: '#00758F', category: 'Data' },
    { name: 'MongoDB',       color: '#47A248', category: 'Data' },
    { name: 'Redis',         color: '#DC382D', category: 'Data' },
    { name: 'AWS',           color: '#FF9900', category: 'Cloud' },
    { name: 'Google Cloud',  color: '#4285F4', category: 'Cloud' },
    { name: 'Docker',        color: '#2496ED', category: 'DevOps' },
    { name: 'Kubernetes',    color: '#326CE5', category: 'DevOps' },
    { name: 'Nginx',         color: '#009639', category: 'DevOps' },
    { name: 'Linux',         color: '#FCC624', category: 'DevOps' },
    { name: 'Git',           color: '#F05032', category: 'DevOps' },
    { name: 'GitHub',        color: '#FFFFFF', category: 'DevOps' },
  ];

  // ===== SEO defaults (ES) =====
  // Seeded for every route; non-es languages fall back to the ES row server-side.
  var SEO_DEFAULTS = {
    home:       { title: 'DesarPro · Tecnología que transforma tu negocio', description: 'Desarrollo de software profesional. Web, móvil, software a medida, IA, ciberseguridad e infraestructura para empresas que quieren crecer.', keywords: 'desarrollo de software, apps móviles, SaaS, IA, ciberseguridad, Colombia, LATAM' },
    servicios:  { title: 'Servicios · DesarPro', description: '12 servicios tecnológicos: desarrollo web, apps móviles, software a medida, IA, ciberseguridad, DevOps, datos y analítica.', keywords: 'servicios de software, desarrollo web, apps móviles, IA, devops' },
    proyectos:  { title: 'Proyectos · DesarPro', description: 'Casos reales de plataformas digitales en producción: agroindustria, salud, retail, moda, finanzas, educación y logística.', keywords: 'proyectos software, casos de éxito, desarrollo a medida' },
    nosotros:   { title: 'Nosotros · DesarPro', description: 'DesarPro nació en Pereira, Colombia, con una idea simple: las empresas no necesitan más promesas tecnológicas, necesitan sistemas que funcionen.', keywords: 'agencia de software, desarrollo de software Colombia, Pereira' },
    contacto:   { title: 'Contacto · DesarPro', description: 'Escríbenos sobre tu proyecto. Te respondemos en menos de 24 horas hábiles con un primer diagnóstico gratuito.', keywords: 'contacto desarrollo software, cotizar proyecto' },
    login:      { title: 'Panel administrador · DesarPro', description: 'Acceso restringido al panel de administración de DesarPro.', keywords: 'admin, login' },
    '404':      { title: 'Página no encontrada · DesarPro', description: 'La página que buscas no existe. Vuelve al inicio o explora nuestros servicios.', keywords: '404, no encontrado' },
  };

  var SITE_CONFIG_DEFAULTS = {
    sections: { hero: true, stats: true, services: true, tech: true, process: true, cta: true },
    heroImage: '',
    announcement: '',
    announcementActive: false,
  };

  return {
    LANGUAGES: LANGUAGES,
    CONTENT_DEFAULTS: CONTENT_DEFAULTS,
    TRANSLATION_MAP: TRANSLATION_MAP,
    MAP_BY_KEY: MAP_BY_KEY,
    ALL_KEYS: ALL_KEYS,
    PROJECT_SEED: PROJECT_SEED,
    PROJECT_TRANSLATIONS: PROJECT_TRANSLATIONS,
    resolveProjectTranslations: resolveProjectTranslations,
    SERVICE_CATALOG: SERVICE_CATALOG,
    SERVICE_ES_DEFAULTS: SERVICE_ES_DEFAULTS,
    resolveServiceSeed: resolveServiceSeed,
    TECHNOLOGY_SEED: TECHNOLOGY_SEED,
    SEO_DEFAULTS: SEO_DEFAULTS,
    SITE_CONFIG_DEFAULTS: SITE_CONFIG_DEFAULTS,
    sectionFor: sectionFor,
    typeFor: typeFor,
    orderIndex: orderIndex,
    resolveValue: resolveValue,
  };
});
