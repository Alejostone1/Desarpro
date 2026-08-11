// CMS / Admin system — the database is the source of truth.
// Admin login is gated by the backend (bcrypt user + API session token).
// <Editable id="hero.title.line1" defaultValue="..." /> renders the latest
// value for the current language and shows inline editing in admin mode.
//
// localStorage is used ONLY for session/preferences (admin session, token,
// language, theme) — never as the content source of truth.

import React from 'react';
import { useI18n } from '../i18n/index.jsx';

const SESSION_KEY = 'desarpro:admin:session';
const TOKEN_KEY = 'desarpro:admin:token';
const USER_KEY = 'desarpro:admin:user';

function getApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:3001';
  if (window.__DESARPRO_API_BASE) return window.__DESARPRO_API_BASE;
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return 'http://localhost:3001';
  return null; // deployed without a configured backend -> read-only defaults
}
const API_BASE = getApiBase();

function readToken() {
  try { return sessionStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
}
function writeToken(t) {
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, t);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}
function readAdminFlag() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
}

// ES defaults (ultimate fallback so the site never breaks offline).
const DEFAULT_CONTENT = (typeof window !== 'undefined' && window.__CONTENT_SEED && window.__CONTENT_SEED.CONTENT_DEFAULTS) || {
  'hero.badge': 'Aceptando proyectos para 2026',
  'hero.title.line1': 'Tecnología que',
  'hero.title.highlight': 'transforma',
  'hero.title.line2': 'tu negocio',
};

async function api(path, opts = {}) {
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

const AdminContext = React.createContext({
  isAdmin: false,
  editMode: false,
  content: {},
  fullContent: null,
  serverUp: null,
  loadingContent: false,
  saveState: {},
  lastUpdated: {},
  login: async () => ({ ok: false, error: 'server' }),
  logout: () => {},
  setEditMode: () => {},
  get: (k) => DEFAULT_CONTENT[k] || '',
  set: async () => {},
  setAll: async () => {},
  reset: async () => {},
  exportData: async () => '{}',
  importData: async () => ({ ok: false }),
  refreshContent: async () => {},
});

function AdminProvider({ children }) {
  const { language } = useI18n();
  const [isAdmin, setIsAdmin] = React.useState(readAdminFlag);
  const [editMode, setEditMode] = React.useState(false);
  const [content, setContent] = React.useState({}); // flat map for current language
  const [fullContent, setFullContent] = React.useState(null); // key -> { translations, type, updatedAt }
  const [serverUp, setServerUp] = React.useState(null);
  const [loadingContent, setLoadingContent] = React.useState(true);
  const [saveState, setSaveState] = React.useState({});
  const [lastUpdated, setLastUpdated] = React.useState({});
  const [authError, setAuthError] = React.useState(''); // '' | 'expired'

  // Load public content for the active language from the DB/API.
  const loadContent = React.useCallback(async (lang, silent) => {
    if (!silent) setLoadingContent(true);
    const res = await api(`/api/content?lang=${encodeURIComponent(lang)}`);
    if (res.ok && res.data && res.data.content) {
      setContent(res.data.content);
      setServerUp(true);
    } else {
      setServerUp(false);
      if (res.status === 401) {
        // Token gone bad while loading public content — ignore, public route.
      }
    }
    setLoadingContent(false);
  }, []);

  // Load the full multi-language view for the admin panel.
  const loadFullContent = React.useCallback(async () => {
    const res = await api('/api/admin/content');
    if (res.ok && res.data && Array.isArray(res.data.content)) {
      const map = {};
      const updated = {};
      for (const c of res.data.content) {
        map[c.key] = { translations: c.translations || {}, type: c.type || 'text', section: c.section, order: typeof c.order === 'number' ? c.order : 999 };
        if (c.updatedAt) updated[c.key] = c.updatedAt;
      }
      setFullContent(map);
      setLastUpdated(updated);
      setServerUp(true);
      return true;
    }
    if (res.status === 401) {
      setAuthError('expired');
      setServerUp(true);
      logout();
    } else {
      setServerUp(false);
    }
    return false;
  }, []);

  React.useEffect(() => {
    loadContent(language);
  }, [language, loadContent]);

  React.useEffect(() => {
    if (isAdmin) {
      loadFullContent();
    }
  }, [isAdmin, loadFullContent]);

  // Return only CMS content for the active language — never Spanish DEFAULT_CONTENT here.
  // Editable resolves: CMS → defaultValue (i18n) → DEFAULT_CONTENT (ES last resort).
  const get = React.useCallback((key) => {
    const v = content[key];
    if (v != null && String(v).length) return v;
    return '';
  }, [content]);

  const markSaved = React.useCallback((key) => {
    setSaveState((s) => ({ ...s, [key]: 'saved' }));
    setTimeout(() => {
      setSaveState((s) => (s[key] === 'saved' ? { ...s, [key]: undefined } : s));
    }, 1500);
  }, []);

  const handleUnauthorized = React.useCallback(() => {
    setAuthError('expired');
    logout();
  }, []);

  // Save a single translation for the CURRENT language.
  const set = React.useCallback(async (key, value) => {
    const lang = language;
    const prev = content[key];
    setSaveState((s) => ({ ...s, [key]: 'saving' }));
    // Optimistic update (do not blank the UI while waiting).
    setContent((prevContent) => ({ ...prevContent, [key]: value }));
    setFullContent((prevFull) => {
      if (!prevFull || !prevFull[key]) return prevFull;
      return {
        ...prevFull,
        [key]: { ...prevFull[key], translations: { ...prevFull[key].translations, [lang]: value } },
      };
    });
    const res = await api(`/api/admin/content/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: { lang, value },
    });
    if (res.ok && res.data && res.data.ok) {
      if (res.data.updatedAt) setLastUpdated((u) => ({ ...u, [key]: res.data.updatedAt }));
      markSaved(key);
      return { ok: true };
    }
    // Revert the optimistic value so we never show unsaved content as saved.
    setContent((prevContent) => ({ ...prevContent, [key]: prev }));
    setFullContent((prevFull) => {
      if (!prevFull || !prevFull[key]) return prevFull;
      return {
        ...prevFull,
        [key]: { ...prevFull[key], translations: { ...prevFull[key].translations, [lang]: prev } },
      };
    });
    setSaveState((s) => ({ ...s, [key]: 'error' }));
    setTimeout(() => setSaveState((s) => (s[key] === 'error' ? { ...s, [key]: undefined } : s)), 3000);
    if (res.status === 401) handleUnauthorized();
    return { ok: false, status: res.status };
  }, [language, content, markSaved, handleUnauthorized]);

  // Save several languages of one key at once (admin panel multi-language editor).
  const setAll = React.useCallback(async (key, translations) => {
    setSaveState((s) => ({ ...s, [key]: 'saving' }));
    const res = await api(`/api/admin/content`, {
      method: 'PUT',
      body: { key, translations },
    });
    if (res.ok && res.data && res.data.ok) {
      setFullContent((prevFull) => {
        if (!prevFull) return prevFull;
        const cur = prevFull[key] || { translations: {}, type: 'text' };
        return { ...prevFull, [key]: { ...cur, translations: { ...cur.translations, ...translations } } };
      });
      // Refresh the public map for the current language too.
      const lang = language;
      if (translations[lang] !== undefined) {
        setContent((c) => ({ ...c, [key]: translations[lang] }));
      }
      if (res.data.updatedAt) setLastUpdated((u) => ({ ...u, [key]: res.data.updatedAt }));
      markSaved(key);
      return { ok: true };
    }
    setSaveState((s) => ({ ...s, [key]: 'error' }));
    setTimeout(() => setSaveState((s) => (s[key] === 'error' ? { ...s, [key]: undefined } : s)), 3000);
    if (res.status === 401) handleUnauthorized();
    return { ok: false, status: res.status };
  }, [language, markSaved, handleUnauthorized]);

  const login = React.useCallback(async (password) => {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@desarpro.com', password }),
      });
      const data = await res.json();
      if (res.ok && data && data.ok && data.token) {
        writeToken(data.token);
        setIsAdmin(true);
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
          localStorage.setItem(USER_KEY, JSON.stringify(data.user || { email: 'admin@desarpro.com', role: 'admin' }));
        } catch (e) {}
        setAuthError('');
        await loadFullContent();
        return { ok: true };
      }
      return { ok: false, error: 'bad' };
    } catch (e) {
      return { ok: false, error: 'server' };
    }
  }, [loadFullContent]);

  const logout = React.useCallback(() => {
    const token = readToken();
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      }).catch(() => {});
    }
    setIsAdmin(false);
    setEditMode(false);
    setFullContent(null);
    writeToken(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {}
  }, []);

  const reset = React.useCallback(async () => {
    const res = await api('/api/admin/content/reset', { method: 'POST' });
    if (res.ok && res.data && res.data.ok) {
      await loadContent(language, true);
      if (isAdmin) await loadFullContent();
      return { ok: true };
    }
    if (res.status === 401) handleUnauthorized();
    return { ok: false, status: res.status };
  }, [language, isAdmin, loadContent, loadFullContent, handleUnauthorized]);

  const exportData = React.useCallback(async () => {
    const res = await api('/api/admin/content/export');
    if (res.ok && res.data) return JSON.stringify(res.data, null, 2);
    return null;
  }, []);

  const importData = React.useCallback(async (json) => {
    let parsed;
    try { parsed = JSON.parse(json); } catch (e) { return { ok: false, error: 'JSON inválido' }; }
    const res = await api('/api/admin/content/import', { method: 'POST', body: parsed });
    if (res.ok && res.data && res.data.ok) {
      await loadContent(language, true);
      if (isAdmin) await loadFullContent();
      return { ok: true, imported: res.data.imported };
    }
    if (res.status === 401) handleUnauthorized();
    return { ok: false, error: (res.data && res.data.error) || 'No se pudo importar' };
  }, [language, isAdmin, loadContent, loadFullContent, handleUnauthorized]);

  const refreshContent = React.useCallback(async () => {
    await loadContent(language, true);
    if (isAdmin) await loadFullContent();
  }, [language, isAdmin, loadContent, loadFullContent]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-edit-mode', editMode ? 'true' : 'false');
  }, [editMode]);

  const value = {
    isAdmin,
    editMode,
    setEditMode,
    content,
    fullContent,
    serverUp,
    loadingContent,
    saveState,
    lastUpdated,
    authError,
    login,
    logout,
    get,
    set,
    setAll,
    reset,
    exportData,
    importData,
    refreshContent,
  };
  return React.createElement(AdminContext.Provider, { value }, children);
}

function useAdmin() {
  return React.useContext(AdminContext);
}

// Editable component — renders content; when in edit mode, click to edit inline.
function Editable({ id, defaultValue, multiline = false, as: Tag = 'span', style = {}, className = '', textOnly = false }) {
  const { get, set, editMode, isAdmin } = useAdmin();
  const [editing, setEditing] = React.useState(false);
  const value = get(id) || defaultValue || DEFAULT_CONTENT[id] || '';

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

export { AdminProvider, useAdmin, Editable, AdminFab, API_BASE, DEFAULT_CONTENT };
