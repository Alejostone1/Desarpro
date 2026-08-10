// CMS / Admin system — content is keyed by string IDs, stored in localStorage.
// Admin login is gated by a password (default: Administrador01).
// <Editable id="hero.title" defaultValue="..." /> renders the latest value
// and shows inline editing when admin mode is active.

const ADMIN_PASSWORD = 'Administrador01';
const STORAGE_KEY = 'desarpro:cms:v1';
const SESSION_KEY = 'desarpro:admin:session';
// API base URL — configurable via window global; falls back to local dev server.
// In production (Vercel), the backend is not available; the login function
// gracefully falls back to the local password check below.
const API_BASE = (typeof window !== 'undefined' && window.__DESARPRO_API_BASE) || 'http://localhost:3001';

// === Default content registry ===
// All editable strings live here. Any code that wants to render
// an editable value uses <Editable id="..."/> or useContent('...').
const DEFAULT_CONTENT = {
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
  'footer.tagline': 'Desarrollo de software profesional para empresas que quieren crecer.',
  'footer.copyright': '© 2026 DesarPro. Todos los derechos reservados.',

  // ===== About =====
  'about.title.pre': 'Construimos software con',
  'about.title.highlight': 'propósito',
  'about.subtitle': 'DesarPro nació en Pereira con una idea simple: que cualquier empresa, sin importar su tamaño, pueda acceder a tecnología enterprise diseñada con criterio.',
};

const AdminContext = React.createContext({
  isAdmin: false,
  editMode: false,
  content: DEFAULT_CONTENT,
  login: () => false,
  logout: () => {},
  setEditMode: () => {},
  get: (k) => DEFAULT_CONTENT[k] || '',
  set: (k, v) => {},
  reset: () => {},
  exportData: () => '{}',
  importData: () => {},
});

function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = React.useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  });
  const [editMode, setEditMode] = React.useState(false);
  const [overrides, setOverrides] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });

  const content = React.useMemo(() => ({ ...DEFAULT_CONTENT, ...overrides }), [overrides]);

  const get = React.useCallback((key) => {
    return overrides[key] != null ? overrides[key] : (DEFAULT_CONTENT[key] || '');
  }, [overrides]);

  const set = React.useCallback((key, value) => {
    setOverrides(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  const reset = React.useCallback(() => {
    setOverrides({});
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }, []);

  const login = React.useCallback(async (password) => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@desarpro.com', password }),
      });
      const data = await res.json();
      if (data && data.ok) {
        setIsAdmin(true);
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
          localStorage.setItem('desarpro:admin:user', JSON.stringify(data.user));
        } catch (e) {}
        return true;
      }
    } catch (e) {}

    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
        localStorage.setItem('desarpro:admin:user', JSON.stringify({ email: 'admin@desarpro.com', role: 'admin' }));
      } catch (e) {}
      return true;
    }
    return false;
  }, []);

  const logout = React.useCallback(() => {
    setIsAdmin(false);
    setEditMode(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem('desarpro:admin:user');
    } catch (e) {}
  }, []);

  const exportData = React.useCallback(() => JSON.stringify(overrides, null, 2), [overrides]);

  const importData = React.useCallback((json) => {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed === 'object' && parsed) {
        setOverrides(parsed);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)); } catch (e) {}
        return true;
      }
    } catch (e) {}
    return false;
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-edit-mode', editMode ? 'true' : 'false');
  }, [editMode]);

  const value = { isAdmin, editMode, setEditMode, content, get, set, reset, login, logout, exportData, importData };
  return React.createElement(AdminContext.Provider, { value }, children);
}

function useAdmin() {
  return React.useContext(AdminContext);
}

// Editable component — renders content; when in edit mode, click to edit inline.
function Editable({ id, defaultValue, multiline = false, as: Tag = 'span', style = {}, className = '', textOnly = false }) {
  const { get, set, editMode, isAdmin } = useAdmin();
  const [editing, setEditing] = React.useState(false);
  const value = get(id) || defaultValue || '';

  if (textOnly) return value;

  if (!isAdmin || !editMode) {
    return React.createElement(Tag, { className, style }, value);
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          defaultValue={value}
          onBlur={(e) => { set(id, e.target.value); setEditing(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setEditing(false); }
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { set(id, e.target.value); setEditing(false); }
          }}
          rows={4}
          style={{
            width: '100%', minWidth: 280, padding: '10px 14px',
            background: 'rgba(34,211,238,0.08)',
            border: '1px solid rgba(34,211,238,0.5)',
            borderRadius: 8, color: 'var(--text-0)',
            font: 'inherit', resize: 'vertical', outline: 'none',
            ...style,
          }}
        />
      );
    }
    return (
      <input
        autoFocus
        defaultValue={value}
        onBlur={(e) => { set(id, e.target.value); setEditing(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setEditing(false); }
          if (e.key === 'Enter') { set(id, e.target.value); setEditing(false); }
        }}
        style={{
          minWidth: 180, padding: '6px 10px',
          background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.5)',
          borderRadius: 6, color: 'var(--text-0)',
          font: 'inherit', outline: 'none',
          ...style,
        }}
      />
    );
  }

  return React.createElement(
    Tag,
    {
      className: `editable ${className}`,
      style,
      onClick: (e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); },
      title: 'Click para editar',
    },
    value
  );
}

// Quick edit-mode floating control for admins
function AdminFab({ setRoute }) {
  const { isAdmin, editMode, setEditMode, logout } = useAdmin();
  const [open, setOpen] = React.useState(false);
  if (!isAdmin) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 250, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {open && (
        <div style={{
          background: 'rgba(10,11,20,0.96)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          borderRadius: 14, padding: 14, width: 240,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          animation: 'fab-pop 240ms var(--ease-spring)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Admin</div>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 9,
              background: editMode ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.05)',
              color: '#fff', fontWeight: 600, fontSize: 13, border: '1px solid ' + (editMode ? 'transparent' : 'rgba(255,255,255,0.1)'),
              cursor: 'pointer', marginBottom: 6, textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: editMode ? '#22D3EE' : 'rgba(255,255,255,0.3)', boxShadow: editMode ? '0 0 8px #22D3EE' : 'none' }}/>
            {editMode ? 'Edición ACTIVA' : 'Activar edición'}
          </button>
          <button
            onClick={() => { setRoute && setRoute('admin'); setOpen(false); }}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 9,
              background: 'rgba(255,255,255,0.04)',
              color: '#fff', fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', marginBottom: 6, textAlign: 'left',
            }}
          >Panel administrador</button>
          <button
            onClick={() => { logout(); setOpen(false); }}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 9,
              background: 'rgba(239,68,68,0.12)',
              color: '#FCA5A5', fontWeight: 600, fontSize: 13, border: '1px solid rgba(239,68,68,0.25)',
              cursor: 'pointer', textAlign: 'left',
            }}
          >Cerrar sesión</button>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        title="Panel admin"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 12px 40px rgba(59,130,246,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 200ms var(--ease-out)',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      </button>
      <style>{`@keyframes fab-pop { from { opacity: 0; transform: translateY(10px) scale(0.92); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
}

Object.assign(window, { AdminProvider, useAdmin, Editable, AdminFab, ADMIN_PASSWORD, DEFAULT_CONTENT });
