// Admin — full CMS panel for editing content grouped by section, in all 5
// languages (es/en/pt/fr/de), plus a multi-language ProjectsManager.
//
// Session is provided by useAdmin() (token stored in sessionStorage by the
// backend login). Every save persists to the database through the API.
// Export / Import / Reset are async and talk to the backend.

import React from 'react';
import { useAdmin } from '../lib/admin.jsx';
import { useTheme, ThemeToggle } from '../lib/theme.jsx';
import Icon from '../lib/icons.jsx';
import Logo from '../components/Logo.jsx';
import NeuralNet from '../components/NeuralNet.jsx';
import { fetchAdminProjects, saveProject, deleteProject, updateProject } from '../lib/projectData.jsx';
import { DashboardView, LeadsManager, ServicesManager, TechManager, SeoManager, ConfigManager } from './AdminViews.jsx';

const LANGS = ['es', 'en', 'pt', 'fr', 'de'];
const LANG_LABELS = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE' };

function Admin({ setRoute }) {
  const {
    isAdmin, login, logout, fullContent, serverUp, saveState, lastUpdated,
    set, setAll, reset, exportData, importData, editMode, setEditMode, authError,
  } = useAdmin();
  const { theme } = useTheme();
  const [pwd, setPwd] = React.useState('');
  const [err, setErr] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('dashboard');
  const [savedKey, setSavedKey] = React.useState(null);
  const [importText, setImportText] = React.useState('');
  const [importStatus, setImportStatus] = React.useState('');

  const sections = React.useMemo(() => ({
    dashboard:   { label: 'Dashboard',        icon: 'Activity',   prefixes: [], always: true },
    projects:    { label: 'Proyectos',        icon: 'Folder',     prefixes: [], always: true },
    leads:       { label: 'Leads',            icon: 'Mail',       prefixes: [], always: true },
    services:    { label: 'Servicios',        icon: 'Layers',     prefixes: [], always: true },
    tech:        { label: 'Tecnologías',      icon: 'Cpu',        prefixes: [], always: true },
    seo:         { label: 'SEO',              icon: 'Search',     prefixes: [], always: true },
    config:      { label: 'Configuración',    icon: 'Settings',   prefixes: [], always: true },
    hero:        { label: 'Inicio · Hero',     icon: 'Sparkle',    prefixes: ['hero.'] },
    stats:       { label: 'Inicio · Stats',    icon: 'BarChart',   prefixes: ['stats.'] },
    home_services:{ label: 'Inicio · Servicios', icon: 'Layers',   prefixes: ['services.'] },
    home_tech:   { label: 'Inicio · Tecnología', icon: 'Cpu',      prefixes: ['tech.'] },
    process:     { label: 'Inicio · Proceso',  icon: 'Compass',    prefixes: ['process.'] },
    cta:         { label: 'Inicio · CTA',      icon: 'ArrowRight', prefixes: ['cta.'] },
    contact:     { label: 'Contacto',          icon: 'Mail',       prefixes: ['contact.'] },
    login:       { label: 'Login',             icon: 'Lock',       prefixes: ['login.'] },
    about:       { label: 'Nosotros',          icon: 'Users',      prefixes: ['about.'] },
    footer:      { label: 'Footer',            icon: 'Globe',      prefixes: ['footer.'] },
    other:       { label: 'Otros',             icon: 'Settings',   prefixes: [] },
  }), []);

  const allKeys = Object.keys(fullContent || {});
  const keyOrder = fullContent || {};
  const keysByGroup = {};
  Object.entries(sections).forEach(([id, s]) => {
    keysByGroup[id] = allKeys.filter(k => s.prefixes.some(p => k.startsWith(p)));
  });
  const claimedKeys = new Set([].concat(...Object.values(keysByGroup)));
  keysByGroup.other = allKeys.filter(k => !claimedKeys.has(k));

  const sortKeys = (keys) => keys.slice().sort((a, b) => {
    const oa = typeof keyOrder[a] === 'object' && keyOrder[a].order != null ? keyOrder[a].order : 999;
    const ob = typeof keyOrder[b] === 'object' && keyOrder[b].order != null ? keyOrder[b].order : 999;
    return oa - ob;
  });

  const handleLogin = async () => {
    setErr('');
    const res = await login(pwd);
    if (!res || !res.ok) {
      setErr(res && res.error === 'server' ? 'Servidor no disponible. Verifica que la API esté activa.' : 'Contraseña incorrecta');
      setTimeout(() => setErr(''), 3500);
    }
  };

  const handleSave = async (key, translations) => {
    setSavedKey(key);
    await setAll(key, translations);
    setTimeout(() => setSavedKey(null), 1200);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      if (!data) throw new Error('empty');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `desarpro-content-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.alert('No se pudo exportar. Revisa la conexión con la API.');
    }
  };

  const handleImport = async () => {
    setImportStatus('');
    const res = await importData(importText);
    if (res && res.ok) {
      setImportStatus('success');
      setImportText('');
    } else {
      setImportStatus('error');
    }
    setTimeout(() => setImportStatus(''), 3000);
  };

  const handleReset = async () => {
    if (window.confirm('¿Restablecer TODO el contenido (textos y proyectos) a los valores originales? Esto no se puede deshacer.')) {
      const res = await reset();
      if (!res || !res.ok) {
        window.alert('No se pudo restablecer. Revisa la conexión con la API.');
      }
    }
  };

  // ----- LOGIN VIEW -----
  if (!isAdmin) {
    return (
      <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', background: 'var(--bg-0)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <NeuralNet density={50} color="#F59E0B" accent="#F97316"/>
        </div>
        <div style={{ position: 'relative', zIndex: 2, width: 440, maxWidth: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <a onClick={() => setRoute('home')} style={{ cursor: 'pointer', display: 'inline-block' }}>
              <Logo size={56} animated/>
            </a>
          </div>
          <div className="glass-2" style={{ borderRadius: 24, padding: 36, boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Shield size={22}/></span>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-0)', margin: 0 }}>Panel administrador</h2>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '4px 0 0' }}>Acceso restringido</p>
              </div>
            </div>

            {authError === 'expired' && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#FBBF24', fontSize: 13 }}>
                Tu sesión expiró. Ingresa de nuevo para continuar.
              </div>
            )}

            <div style={{ display: 'grid', gap: 14, marginTop: 24 }} onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Contraseña</span>
                <input
                  type="password"
                  value={pwd}
                  onChange={e => setPwd(e.target.value)}
                  placeholder="••••••••••••"
                  className="input"
                  autoFocus
                />
              </label>

              {err && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon.X size={14}/> {err}
                </div>
              )}

              <button onClick={handleLogin} className="btn btn-primary" style={{ padding: '14px 20px', justifyContent: 'center', background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}>
                Entrar <Icon.ArrowRight size={14}/>
              </button>

              <button onClick={() => setRoute('home')} className="btn btn-ghost" style={{ padding: '10px 20px', justifyContent: 'center', fontSize: 13 }}>
                Volver al sitio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- DASHBOARD VIEW -----
  const activeKeys = sortKeys(keysByGroup[activeSection] || []);
  const SectionIcon = Icon[sections[activeSection].icon] || Icon.Settings;
  const serverLabel = serverUp === false ? { text: 'API sin conexión · solo lectura', color: '#F87171' }
    : serverUp === null ? { text: 'Conectando…', color: '#FBBF24' }
    : { text: 'API en línea', color: '#34D399' };

  return (
    <div className="page admin-shell" style={{ minHeight: '100vh', background: 'var(--bg-0)', paddingTop: 0 }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 24px',
        background: 'var(--header-bg)', backdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <a onClick={() => setRoute('home')} style={{ cursor: 'pointer' }}>
            <Logo size={32} withWordmark/>
          </a>
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', fontWeight: 600 }}>
            <Icon.Shield size={11}/> ADMIN
          </span>
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: `1px solid ${serverLabel.color}`, color: serverLabel.color, fontWeight: 600, background: `${serverLabel.color}14` }}>
            {serverUp === false ? <Icon.X size={11}/> : <Icon.Activity size={11}/>} {serverLabel.text}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setEditMode(!editMode)} className={editMode ? 'btn btn-primary' : 'btn btn-ghost'} style={{ padding: '8px 14px', fontSize: 13, background: editMode ? 'linear-gradient(135deg, #06B6D4, #3B82F6)' : undefined }}>
            <Icon.Edit size={13}/> {editMode ? 'Edición activa' : 'Activar edición en vivo'}
          </button>
          <ThemeToggle size={36}/>
          <button onClick={() => setRoute('home')} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
            <Icon.Globe size={13}/> Ver sitio
          </button>
          <button onClick={() => { logout(); setPwd(''); }} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13, color: '#EF4444' }}>
            <Icon.X size={13}/> Salir
          </button>
        </div>
      </header>

      {/* Body — sidebar + main */}
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, padding: '4px 12px', marginBottom: 8 }}>
            Secciones
          </div>
          {Object.entries(sections).map(([id, s]) => {
            const I = Icon[s.icon] || Icon.Settings;
            const count = (keysByGroup[id] || []).length;
            if (count === 0 && !s.always) return null;
            const active = activeSection === id;
            return (
              <button key={id} onClick={() => setActiveSection(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: active ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(6,182,212,0.12))' : 'transparent',
                border: active ? '1px solid rgba(34,211,238,0.4)' : '1px solid transparent',
                color: active ? 'var(--text-0)' : 'var(--text-1)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                transition: 'all 160ms', marginBottom: 4,
              }}>
                <I size={15}/>
                <span style={{ flex: 1 }}>{s.label}</span>
                {count > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>}
              </button>
            );
          })}

          <div style={{ height: 1, background: 'var(--card-border)', margin: '20px 0' }}/>

          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, padding: '4px 12px', marginBottom: 8 }}>
            Datos
          </div>
          <button onClick={handleExport} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid transparent', color: 'var(--text-1)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>
            <Icon.Download size={14}/> Exportar JSON
          </button>
          <button onClick={() => setActiveSection('__import')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: activeSection === '__import' ? 'rgba(34,211,238,0.12)' : 'transparent', border: activeSection === '__import' ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent', color: 'var(--text-1)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>
            <Icon.Upload size={14}/> Importar JSON
          </button>
          <button onClick={handleReset} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'transparent', border: '1px solid transparent', color: '#EF4444', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}>
            <Icon.X size={14}/> Restablecer todo
          </button>
        </aside>

        {/* Main panel */}
        <main className="admin-main">
          {authError === 'expired' && (
            <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', color: '#FBBF24', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon.Lock size={15}/> Sesión expirada. Tus cambios se seguirán mostrando, pero necesitas volver a iniciar sesión para guardar.
              <button onClick={() => { logout(); }} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid rgba(245,158,11,0.4)', color: '#FBBF24', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Re-ingresar</button>
            </div>
          )}

          {activeSection === 'projects' ? (
            <ProjectsManager/>
          ) : activeSection === 'dashboard' ? (
            <DashboardView goTo={setActiveSection}/>
          ) : activeSection === 'leads' ? (
            <LeadsManager/>
          ) : activeSection === 'services' ? (
            <ServicesManager/>
          ) : activeSection === 'tech' ? (
            <TechManager/>
          ) : activeSection === 'seo' ? (
            <SeoManager/>
          ) : activeSection === 'config' ? (
            <ConfigManager/>
          ) : activeSection === '__import' ? (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon.Upload size={22} stroke="var(--cyan-bright)"/> Importar contenido
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px' }}>
                Pega un JSON previamente exportado para restaurar el contenido del sitio (textos de los 5 idiomas y proyectos).
              </p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder='{"content": { "hero.title.line1": { "es": "...", "en": "..." } }, "projects": [ ... ]}'
                rows={14}
                className="input"
                style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                <button onClick={handleImport} className="btn btn-primary" style={{ padding: '12px 20px' }} disabled={!importText.trim()}>
                  <Icon.Check size={14}/> Importar y guardar
                </button>
                {importStatus === 'success' && <span style={{ color: '#86efac', fontSize: 13 }}>✓ Importado correctamente</span>}
                {importStatus === 'error' && <span style={{ color: '#fca5a5', fontSize: 13 }}>✗ No se pudo importar (JSON inválido o servidor no disponible)</span>}
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <SectionIcon size={22} stroke="var(--cyan-bright)"/> {sections[activeSection].label}
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px' }}>
                Edita los textos en los 5 idiomas (ES · EN · PT · FR · DE). «Guardar» persiste el campo completo en la base de datos.
              </p>

              {!fullContent ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Cargando contenido…</div>
              ) : activeKeys.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 14, borderRadius: 16, background: 'var(--card-bg)', border: '1px dashed var(--card-border)' }}>
                  No hay campos en esta sección.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {activeKeys.map(key => (
                    <AdminFieldEditor
                      key={key}
                      fieldKey={key}
                      translations={(fullContent[key] && fullContent[key].translations) || {}}
                      onSave={(tr) => handleSave(key, tr)}
                      saveState={saveState[key]}
                      lastUpdated={lastUpdated[key]}
                      justSaved={savedKey === key}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        .admin-shell.page { padding-top: 0 !important; overflow-x: hidden; }
        .admin-layout {
          display: grid;
          grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
          min-height: calc(100vh - 70px);
          width: 100%;
        }
        .admin-sidebar {
          padding: 20px;
          border-right: 1px solid var(--card-border);
          background: var(--bg-1);
          overflow-y: auto;
          max-height: calc(100vh - 70px);
          position: sticky;
          top: 70px;
          align-self: start;
        }
        .admin-main {
          padding: clamp(16px, 2.5vw, 32px);
          width: 100%;
          min-width: 0;
          max-width: none;
        }
        @media (max-width: 1100px) {
          .admin-layout { grid-template-columns: minmax(200px, 240px) minmax(0, 1fr); }
        }
        @media (max-width: 880px) {
          .admin-layout { grid-template-columns: 1fr !important; }
          .admin-sidebar {
            border-right: none !important;
            border-bottom: 1px solid var(--card-border) !important;
            padding: 16px !important;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 6px;
            max-height: none;
            position: static;
          }
          .admin-main { padding: 20px !important; }
        }
        @media (max-width: 480px) {
          .admin-sidebar { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Multi-language field editor (all 5 languages per content key).
function AdminFieldEditor({ fieldKey, translations = {}, onSave, saveState, lastUpdated, justSaved }) {
  const [draft, setDraft] = React.useState(translations);
  const [tab, setTab] = React.useState('es');
  React.useEffect(() => { setDraft(translations); }, [translations, fieldKey]);

  const dirty = LANGS.some(l => (draft[l] || '') !== (translations[l] || ''));
  const val = draft[tab] || '';
  const isLong = val.length > 80 || val.includes('\n');
  const status = saveState === 'saving' ? { text: 'Guardando…', color: '#FBBF24', icon: <Icon.Activity size={12}/> }
    : saveState === 'saved' ? { text: 'Guardado', color: '#86efac', icon: <Icon.Check size={12}/> }
    : saveState === 'error' ? { text: 'Error al guardar', color: '#fca5a5', icon: <Icon.X size={12}/> }
    : null;

  return (
    <div style={{
      padding: 18, borderRadius: 14,
      background: 'var(--card-bg)',
      border: `1px solid ${saveState === 'saved' || justSaved ? 'rgba(34,197,94,0.5)' : saveState === 'error' ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'}`,
      transition: 'border-color 200ms',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
        <code style={{
          fontSize: 12, color: 'var(--cyan-bright)', fontFamily: 'monospace',
          padding: '3px 8px', borderRadius: 6, background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.15)',
        }}>{fieldKey}</code>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastUpdated && (
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Actualizado {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {status && <span style={{ fontSize: 12, color: status.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>{status.icon} {status.text}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {LANGS.map(l => (
          <button key={l} onClick={() => setTab(l)} style={{
            padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
            cursor: 'pointer',
            background: tab === l ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.04)',
            color: tab === l ? '#fff' : 'var(--text-2)',
            border: tab === l ? '1px solid transparent' : '1px solid var(--card-border)',
          }}>
            {LANG_LABELS[l]}
            {(draft[l] || '') !== (translations[l] || '') && <span style={{ marginLeft: 4, color: '#FBBF24' }}>•</span>}
          </button>
        ))}
      </div>

      {isLong ? (
        <textarea
          value={val}
          onChange={e => setDraft(d => ({ ...d, [tab]: e.target.value }))}
          rows={Math.max(3, Math.min(8, (val.match(/\n/g) || []).length + 2))}
          className="input"
          style={{ resize: 'vertical', fontSize: 14, width: '100%' }}
        />
      ) : (
        <input
          type="text"
          value={val}
          onChange={e => setDraft(d => ({ ...d, [tab]: e.target.value }))}
          className="input"
          style={{ width: '100%' }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        {dirty && (
          <button onClick={() => { setDraft(translations); }} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
            Cancelar
          </button>
        )}
        <button
          onClick={() => { onSave(draft); }}
          className="btn btn-primary"
          style={{ padding: '6px 14px', fontSize: 12, opacity: dirty ? 1 : 0.6 }}
          disabled={!dirty || saveState === 'saving'}
        >
          <Icon.Check size={12}/> {saveState === 'saving' ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

// ProjectsManager — multi-language CRUD for portfolio projects.
// All data lives in the database; writes go through the authenticated API.
function ProjectsManager() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null); // slug | 'new'
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [langTab, setLangTab] = React.useState('es');
  const [form, setForm] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminProjects('es');
    setList(res.ok ? res.projects : []);
    setLoading(false);
    if (!res.ok && res.status !== 401 && res.status !== 0) {
      setStatus('error: No se pudieron cargar los proyectos');
      setTimeout(() => setStatus(''), 3000);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const emptyTranslations = () => ({
    es: { title: '', tagline: '', desc: '' },
    en: { title: '', tagline: '', desc: '' },
    pt: { title: '', tagline: '', desc: '' },
    fr: { title: '', tagline: '', desc: '' },
    de: { title: '', tagline: '', desc: '' },
  });

  const startNew = () => {
    setForm({
      slug: '', industry: '', client: '', year: String(new Date().getFullYear()),
      color: '#22D3EE', icon: 'Folder', tags: [], metrics: [],
      featured: false, active: true, order: list.length, translations: emptyTranslations(),
    });
    setEditing('new');
    setLangTab('es');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (p) => {
    const translations = emptyTranslations();
    for (const l of LANGS) {
      const tr = p.translations && p.translations[l];
      translations[l] = {
        title: (tr && tr.title) || (l === 'es' ? (p.title || '') : ''),
        tagline: (tr && tr.tagline) || (l === 'es' ? (p.tagline || '') : ''),
        desc: (tr && tr.desc) || (l === 'es' ? (p.desc || '') : ''),
      };
    }
    setForm({
      slug: p.slug, industry: p.industry || '', client: p.client || '',
      year: p.year, color: p.color, icon: p.icon || 'Folder',
      tags: p.tags || [], metrics: p.metrics || [],
      featured: !!p.featured, active: p.active !== false, order: typeof p.order === 'number' ? p.order : 0,
      translations,
    });
    setEditing(p.slug);
    setLangTab('es');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setTranslation = (lang, field, value) => setForm((f) => ({
    ...f,
    translations: { ...f.translations, [lang]: { ...f.translations[lang], [field]: value } },
  }));
  const setTagsCsv = (csv) => setField('tags', csv.split(',').map((s) => s.trim()).filter(Boolean));
  const setMetricsLines = (txt) => {
    const lines = txt.split('\n').map((l) => l.trim()).filter(Boolean);
    setField('metrics', lines.map((l) => {
      const i = l.indexOf('|');
      if (i === -1) return { k: l, v: '' };
      return { k: l.slice(0, i).trim(), v: l.slice(i + 1).trim() };
    }));
  };
  const metricsText = (m) => (m || []).map((x) => `${x.k} | ${x.v}`).join('\n');

  const handleSave = async () => {
    const es = form.translations.es || {};
    if (!es.title || !form.industry) {
      setStatus('error: El título (ES) y la industria son obligatorios');
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug, industry: form.industry, client: form.client,
        year: form.year, color: form.color, icon: form.icon,
        tags: form.tags, metrics: form.metrics,
        featured: form.featured, active: form.active, order: form.order,
        title: es.title, tagline: es.tagline, desc: es.desc,
        translations: form.translations,
      };
      const res = await saveProject(payload);
      if (res.ok) {
        setStatus('success');
        setTimeout(() => setStatus(''), 2500);
        setEditing(null);
        await load();
      } else {
        setStatus(res.status === 401 ? 'error: Sesión expirada' : `error: ${res.error || 'No se pudo guardar'}`);
        setTimeout(() => setStatus(''), 3500);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return;
    const res = await deleteProject(p.slug);
    if (res.ok) await load();
    else {
      setStatus('error: No se pudo eliminar');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const toggleFlag = async (p, flag) => {
    await updateProject(p.slug, { [flag]: !p[flag] });
    await load();
  };

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const arr = list.slice();
    const a = arr[idx];
    arr[idx] = arr[j];
    arr[j] = a;
    arr.forEach((p, i) => { p.order = i; });
    setList(arr.slice().sort((x, y) => x.order - y.order));
    await updateProject(a.slug, { order: j });
    await updateProject(arr[idx].slug, { order: idx });
    await load();
  };

  const inputStyle = { minHeight: 42 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Folder size={22} stroke="var(--cyan-bright)"/> Proyectos
        </h1>
        <button onClick={startNew} className="btn btn-primary" style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #10B981, #06B6D4)' }}>
          <Icon.Plus size={14}/> Nuevo proyecto
        </button>
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px' }}>
        Gestiona el portafolio que se muestra en «Una carpeta por sector» y en el carrusel de casos.
        Cada texto (título, tagline, descripción) se edita en los 5 idiomas. Todo se guarda en la base de datos.
      </p>

      {status && (
        <div style={{
          padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13,
          background: status === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${status === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: status === 'success' ? '#86efac' : '#fca5a5',
        }}>
          {status === 'success' ? '✓ Proyecto guardado' : status.replace('error:', '✗ ')}
        </div>
      )}

      {editing && form && (
        <div style={{ marginBottom: 28, padding: 22, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Edit size={16}/> {editing === 'new' ? 'Nuevo proyecto' : `Editar: ${form.translations.es.title || editing}`}
          </h2>

          {/* Language tabs for the localized texts */}
          <div style={{ marginBottom: 16 }}>
            <span className="pm-label">Textos localizados</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LANGS.map(l => (
                <button key={l} onClick={() => setLangTab(l)} style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer',
                  background: langTab === l ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.04)',
                  color: langTab === l ? '#fff' : 'var(--text-2)',
                  border: langTab === l ? '1px solid transparent' : '1px solid var(--card-border)',
                }}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14, marginBottom: 16 }}>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Título ({langTab.toUpperCase()}) *</span>
              <input type="text" value={form.translations[langTab].title || ''} onChange={(e) => setTranslation(langTab, 'title', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Etiqueta corta / tagline ({langTab.toUpperCase()})</span>
              <input type="text" value={form.translations[langTab].tagline || ''} onChange={(e) => setTranslation(langTab, 'tagline', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Descripción ({langTab.toUpperCase()})</span>
              <textarea value={form.translations[langTab].desc || ''} onChange={(e) => setTranslation(langTab, 'desc', e.target.value)} rows={3} className="input" style={{ width: '100%', resize: 'vertical' }}/>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="pm-grid">
            <label style={{ display: 'block' }}>
              <span className="pm-label">Sector / industria *</span>
              <input type="text" value={form.industry || ''} onChange={(e) => setField('industry', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Cliente</span>
              <input type="text" value={form.client || ''} onChange={(e) => setField('client', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Año</span>
              <input type="text" value={form.year || ''} onChange={(e) => setField('year', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Slug (URL única, auto si vacío)</span>
              <input type="text" value={form.slug || ''} onChange={(e) => setField('slug', e.target.value)} placeholder="mi-proyecto" className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Color de marca</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.color || '') ? form.color : '#22D3EE'} onChange={(e) => setField('color', e.target.value)} style={{ width: 52, height: 42, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}/>
                <input type="text" value={form.color || ''} onChange={(e) => setField('color', e.target.value)} className="input" style={{ ...inputStyle, fontFamily: 'monospace' }}/>
              </div>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Tags (separados por coma)</span>
              <input type="text" value={(form.tags || []).join(', ')} onChange={(e) => setTagsCsv(e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setField('featured', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#F59E0B' }}/>
              <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Destacar en carrusel</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
              <input type="checkbox" checked={form.active !== false} onChange={(e) => setField('active', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#10B981' }}/>
              <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Visible en el sitio</span>
            </label>
          </div>

          <label style={{ display: 'block', marginTop: 14 }}>
            <span className="pm-label">Métricas (una por línea: «valor | descripción»)</span>
            <textarea value={metricsText(form.metrics)} onChange={(e) => setMetricsLines(e.target.value)} rows={3} className="input" style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}/>
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={() => setEditing(null)} className="btn btn-ghost" style={{ padding: '10px 16px' }} disabled={saving}>Cancelar</button>
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10B981, #06B6D4)' }} disabled={saving}>
              <Icon.Check size={14}/> {saving ? 'Guardando…' : 'Guardar proyecto'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>Cargando proyectos…</div>
      ) : list.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)', fontSize: 14, borderRadius: 16, background: 'var(--card-bg)', border: '1px dashed var(--card-border)' }}>
          Aún no hay proyectos. Crea el primero.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {list.map((p, idx) => (
            <div key={p.slug || p.id} className="pm-row" style={{
              padding: '12px 16px', borderRadius: 14,
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              opacity: p.active === false ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} title="Mover arriba" style={{ background: 'transparent', border: 'none', color: idx === 0 ? 'var(--text-3)' : 'var(--text-1)', cursor: idx === 0 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}>▲</button>
                <button onClick={() => move(idx, 1)} disabled={idx === list.length - 1} title="Mover abajo" style={{ background: 'transparent', border: 'none', color: idx === list.length - 1 ? 'var(--text-3)' : 'var(--text-1)', cursor: idx === list.length - 1 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}>▼</button>
              </div>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: p.color, flexShrink: 0 }}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.title} {p.featured && <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', letterSpacing: '0.08em' }}>★</span>}
                  {p.active === false && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginLeft: 8 }}>OCULTO</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{p.industry} {p.client ? `· ${p.client}` : ''} · {p.year} · orden {p.order}</div>
              </div>
              <div className="pm-row-actions">
                <button onClick={() => toggleFlag(p, 'featured')} title={p.featured ? 'Quitar del carrusel' : 'Destacar en carrusel'} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: p.featured ? '#F59E0B' : 'var(--text-2)' }}>
                  <Icon.Star size={12}/> {p.featured ? 'Destacado' : 'Destacar'}
                </button>
                <button onClick={() => toggleFlag(p, 'active')} title={p.active ? 'Ocultar del sitio' : 'Mostrar en el sitio'} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: p.active === false ? '#F87171' : 'var(--text-2)' }}>
                  <Icon.Eye size={12}/> {p.active === false ? 'Oculto' : 'Visible'}
                </button>
                <button onClick={() => startEdit(p)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>
                  <Icon.Edit size={12}/> Editar
                </button>
                <button onClick={() => handleDelete(p)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: '#EF4444' }}>
                  <Icon.X size={12}/> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .pm-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-3); margin-bottom: 6px; }
        .pm-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pm-row-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .pm-row { align-items: flex-start; }
          .pm-row-actions { width: 100%; }
        }
        @media (max-width: 640px) {
          .pm-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export { Admin };
export default Admin;
