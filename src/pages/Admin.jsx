// Admin — full CMS panel for editing all editable content keys grouped by section.
// Password gate uses useAdmin().login(pwd). Once authenticated, shows grouped editors
// with save, reset, edit-mode toggle, export/import JSON, and logout.

function Admin({ setRoute }) {
  const { isAdmin, login, logout, content, set, reset, exportData, importData, editMode, setEditMode } = useAdmin();
  const { theme } = useTheme();
  const [pwd, setPwd] = React.useState('');
  const [err, setErr] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('hero');
  const [savedKey, setSavedKey] = React.useState(null);
  const [importText, setImportText] = React.useState('');
  const [importStatus, setImportStatus] = React.useState('');

  // Group content keys by prefix for the sidebar nav
  const sections = React.useMemo(() => ({
    projects: { label: 'Proyectos', icon: 'Folder', prefixes: [], always: true },
    hero:    { label: 'Inicio · Hero',     icon: 'Sparkle',   prefixes: ['hero.'] },
    stats:   { label: 'Inicio · Stats',    icon: 'BarChart',  prefixes: ['stats.'] },
    services:{ label: 'Inicio · Servicios',icon: 'Layers',    prefixes: ['services.'] },
    tech:    { label: 'Inicio · Tecnología',icon: 'Cpu',      prefixes: ['tech.'] },
    process: { label: 'Inicio · Proceso',  icon: 'Compass',   prefixes: ['process.'] },
    cta:     { label: 'Inicio · CTA',      icon: 'ArrowRight',prefixes: ['cta.'] },
    contact: { label: 'Contacto',          icon: 'Mail',      prefixes: ['contact.'] },
    login:   { label: 'Login',             icon: 'Lock',      prefixes: ['login.'] },
    about:   { label: 'Nosotros',          icon: 'Users',     prefixes: ['about.'] },
    footer:  { label: 'Footer',            icon: 'Globe',     prefixes: ['footer.'] },
    other:   { label: 'Otros',             icon: 'Settings',  prefixes: [] },
  }), []);

  const allKeys = Object.keys(content || {});
  const keysByGroup = {};
  Object.entries(sections).forEach(([id, s]) => {
    keysByGroup[id] = allKeys.filter(k => s.prefixes.some(p => k.startsWith(p)));
  });
  const claimedKeys = new Set([].concat(...Object.values(keysByGroup)));
  keysByGroup.other = allKeys.filter(k => !claimedKeys.has(k));

  const handleLogin = async () => {
    setErr('');
    const ok = await login(pwd);
    if (!ok) {
      setErr('Contraseña incorrecta');
      setTimeout(() => setErr(''), 2500);
    }
  };

  const handleSave = (key, value) => {
    set(key, value);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 1200);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desarpro-content-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportStatus('');
    try {
      const ok = importData(importText);
      if (ok) {
        setImportStatus('success');
        setImportText('');
      } else {
        setImportStatus('error');
      }
      setTimeout(() => setImportStatus(''), 3000);
    } catch (e) {
      setImportStatus('error');
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Restablecer todo el contenido a los valores originales? Esto no se puede deshacer.')) {
      reset();
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
  const activeKeys = keysByGroup[activeSection] || [];
  const SectionIcon = Icon[sections[activeSection].icon] || Icon.Settings;

  return (
    <div className="page" style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        padding: '14px 24px',
        background: 'var(--header-bg)', backdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: '1px solid var(--card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a onClick={() => setRoute('home')} style={{ cursor: 'pointer' }}>
            <Logo size={32} withWordmark/>
          </a>
          <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', fontWeight: 600 }}>
            <Icon.Shield size={11}/> ADMIN
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 260px) minmax(0, 1fr)', minHeight: 'calc(100vh - 70px)' }} className="admin-layout">
        {/* Sidebar */}
        <aside style={{
          padding: 20,
          borderRight: '1px solid var(--card-border)',
          background: 'var(--bg-1)',
        }} className="admin-sidebar">
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
        <main style={{ padding: 32, maxWidth: 980, width: '100%' }} className="admin-main">
          {activeSection === 'projects' ? (
            <ProjectsManager/>
          ) : activeSection === '__import' ? (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon.Upload size={22} stroke="var(--cyan-bright)"/> Importar contenido
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px' }}>
                Pega un JSON previamente exportado para restaurar el contenido del sitio.
              </p>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder='{"hero.title.line1": "...", ...}'
                rows={14}
                className="input"
                style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
                <button onClick={handleImport} className="btn btn-primary" style={{ padding: '12px 20px' }} disabled={!importText.trim()}>
                  <Icon.Check size={14}/> Importar y guardar
                </button>
                {importStatus === 'success' && <span style={{ color: '#86efac', fontSize: 13 }}>✓ Importado correctamente</span>}
                {importStatus === 'error' && <span style={{ color: '#fca5a5', fontSize: 13 }}>✗ JSON inválido</span>}
              </div>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <SectionIcon size={22} stroke="var(--cyan-bright)"/> {sections[activeSection].label}
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px' }}>
                Edita los textos de esta sección. Los cambios se guardan automáticamente en tu navegador y se reflejan en el sitio al instante.
              </p>

              <div style={{ display: 'grid', gap: 14 }}>
                {activeKeys.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)', fontSize: 14, borderRadius: 16, background: 'var(--card-bg)', border: '1px dashed var(--card-border)' }}>
                    No hay campos en esta sección.
                  </div>
                ) : (
                  activeKeys.map(key => (
                    <AdminFieldEditor
                      key={key}
                      fieldKey={key}
                      value={content[key] || ''}
                      saved={savedKey === key}
                      onSave={(v) => handleSave(key, v)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .admin-layout { grid-template-columns: 1fr !important; }
          .admin-sidebar { border-right: none !important; border-bottom: 1px solid var(--card-border) !important; padding: 16px !important; display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 6px; }
          .admin-main { padding: 20px !important; }
        }
        @media (max-width: 480px) {
          .admin-sidebar { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function AdminFieldEditor({ fieldKey, value, saved, onSave }) {
  const [draft, setDraft] = React.useState(value);
  const [dirty, setDirty] = React.useState(false);
  React.useEffect(() => { setDraft(value); setDirty(false); }, [value, fieldKey]);

  const isLong = (draft || '').length > 80 || (draft || '').includes('\n');

  return (
    <div style={{
      padding: 18, borderRadius: 14,
      background: 'var(--card-bg)',
      border: `1px solid ${saved ? 'rgba(34,197,94,0.5)' : 'var(--card-border)'}`,
      transition: 'border-color 200ms',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <code style={{
          fontSize: 12, color: 'var(--cyan-bright)', fontFamily: 'monospace',
          padding: '3px 8px', borderRadius: 6, background: 'rgba(34,211,238,0.08)',
          border: '1px solid rgba(34,211,238,0.15)',
        }}>{fieldKey}</code>
        {saved && <span style={{ fontSize: 12, color: '#86efac', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon.Check size={12}/> Guardado
        </span>}
      </div>
      {isLong ? (
        <textarea
          value={draft}
          onChange={e => { setDraft(e.target.value); setDirty(e.target.value !== value); }}
          rows={Math.max(3, Math.min(8, (draft.match(/\n/g) || []).length + 2))}
          className="input"
          style={{ resize: 'vertical', fontSize: 14 }}
        />
      ) : (
        <input
          type="text"
          value={draft}
          onChange={e => { setDraft(e.target.value); setDirty(e.target.value !== value); }}
          className="input"
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
        {dirty && (
          <button onClick={() => { setDraft(value); setDirty(false); }} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
            Cancelar
          </button>
        )}
        <button
          onClick={() => { onSave(draft); setDirty(false); }}
          className="btn btn-primary"
          style={{ padding: '6px 14px', fontSize: 12, opacity: dirty ? 1 : 0.6 }}
          disabled={!dirty}
        >
          <Icon.Check size={12}/> Guardar
        </button>
      </div>
    </div>
  );
}

// ProjectsManager — create, edit and delete portfolio projects.
// Uses the backend API when available (localhost) and keeps a localStorage
// snapshot so the same edits work on static hosts.
function ProjectsManager() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null); // project object | 'new'
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [form, setForm] = React.useState({});

  const load = React.useCallback(() => {
    setLoading(true);
    window.fetchProjects().then((data) => {
      setList(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  React.useEffect(load, [load]);

  const startNew = () => {
    setForm({
      slug: '', industry: '', title: '', client: '', year: String(new Date().getFullYear()),
      color: '#22D3EE', icon: 'Folder', tagline: '', desc: '',
      tags: [], metrics: [], featured: false, order: list.length,
    });
    setEditing('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (p) => {
    setForm({
      slug: p.slug, industry: p.industry, title: p.title, client: p.client || '',
      year: p.year, color: p.color, icon: p.icon || 'Folder', tagline: p.tagline || '',
      desc: p.desc || '', tags: p.tags || [], metrics: p.metrics || [],
      featured: !!p.featured, order: p.order != null ? p.order : 0,
    });
    setEditing(p.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    if (!form.title || !form.industry) {
      setStatus('error: title e industry son obligatorios');
      setTimeout(() => setStatus(''), 3000);
      return;
    }
    setSaving(true);
    try {
      await window.saveProject(form);
      setStatus('success');
      setTimeout(() => setStatus(''), 2500);
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.title}"? Esta acción no se puede deshacer.`)) return;
    await window.deleteProject(p.slug);
    load();
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
        En localhost se guarda en la base de datos; en sitios estáticos se guarda una copia local del navegador.
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

      {editing && (
        <div style={{ marginBottom: 28, padding: 22, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Edit size={16}/> {editing === 'new' ? 'Nuevo proyecto' : `Editar: ${form.title || editing}`}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="pm-grid">
            <label style={{ display: 'block' }}>
              <span className="pm-label">Título *</span>
              <input type="text" value={form.title || ''} onChange={(e) => setField('title', e.target.value)} className="input" style={inputStyle}/>
            </label>
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
              <span className="pm-label">Etiqueta corta (tagline)</span>
              <input type="text" value={form.tagline || ''} onChange={(e) => setField('tagline', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Orden</span>
              <input type="number" value={form.order != null ? form.order : 0} onChange={(e) => setField('order', parseInt(e.target.value, 10) || 0)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Tags (separados por coma)</span>
              <input type="text" value={(form.tags || []).join(', ')} onChange={(e) => setTagsCsv(e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
              <input type="checkbox" checked={!!form.featured} onChange={(e) => setField('featured', e.target.checked)} style={{ width: 18, height: 18, accentColor: '#F59E0B' }}/>
              <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Destacar en carrusel</span>
            </label>
          </div>
          <label style={{ display: 'block', marginTop: 14 }}>
            <span className="pm-label">Descripción</span>
            <textarea value={form.desc || ''} onChange={(e) => setField('desc', e.target.value)} rows={4} className="input" style={{ width: '100%', resize: 'vertical' }}/>
          </label>
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
          {list.map((p) => (
            <div key={p.slug || p.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14,
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: p.color, flexShrink: 0 }}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.title} {p.featured && <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', letterSpacing: '0.08em' }}>★</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{p.industry} {p.client ? `· ${p.client}` : ''} · {p.year}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
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
        @media (max-width: 640px) {
          .pm-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

window.Admin = Admin;
