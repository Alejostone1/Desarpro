// AdminViews — new admin managers: Dashboard, Leads, Services, Technologies,
// SEO and Site Config (Fases A–F). Loaded BEFORE Admin.jsx; exposes globals.

const ADMIN_LANGS = ['es', 'en', 'pt', 'fr', 'de'];
const ADMIN_LANG_LABELS = { es: 'ES', en: 'EN', pt: 'PT', fr: 'FR', de: 'DE' };
const LEAD_STATUSES = [
  { id: 'new', label: 'Nuevo', color: '#F59E0B' },
  { id: 'contacted', label: 'Contactado', color: '#3B82F6' },
  { id: 'in_progress', label: 'En proceso', color: '#A78BFA' },
  { id: 'won', label: 'Ganado', color: '#10B981' },
  { id: 'lost', label: 'Perdido', color: '#EF4444' },
];
const LEAD_STATUS_MAP = LEAD_STATUSES.reduce((a, s) => { a[s.id] = s; return a; }, {});

function AdminCard({ icon, label, value, color = '#22D3EE', sub, onClick }) {
  const I = Icon[icon] || Icon.Box;
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper onClick={onClick} style={{
      display: 'flex', gap: 14, alignItems: 'center', padding: 20, borderRadius: 16,
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
      transition: 'all 180ms', minWidth: 0,
      ...(onClick ? { ':hover': undefined } : {}),
    }} onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.borderColor = `${color}66`; e.currentTarget.style.background = 'var(--card-bg-hover)'; } }} onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.background = 'var(--card-bg)'; } }}>
      <span style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 13, background: `${color}1A`, border: `1px solid ${color}40`, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <I size={21}/>
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </Wrapper>
  );
}

// ---------------- Dashboard ----------------
function DashboardView({ goTo }) {
  const [state, setState] = React.useState({ loading: true, data: null, error: false });
  const load = React.useCallback(() => {
    setState({ loading: true, data: null, error: false });
    fetchDashboard().then((res) => {
      if (res.ok && res.dashboard) setState({ loading: false, data: res.dashboard });
      else setState({ loading: false, error: true });
    });
  }, []);
  React.useEffect(load, [load]);

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon.Activity size={22} stroke="var(--cyan-bright)"/> Dashboard
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 24px' }}>
        Resumen en vivo del sitio: contenido, portafolio, servicios, tecnologías y leads.
      </p>

      {state.loading ? <LoadingState label="Cargando dashboard…"/> : state.error ? (
        <ErrorState message="No se pudo cargar el dashboard" hint="Revisa que la API esté en línea y que la sesión siga activa." onRetry={load}/>
      ) : (
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <AdminCard icon="Folder" label="Proyectos" value={state.data.projects} sub={`${state.data.activeProjects} visibles`} color="#3B82F6" onClick={() => goTo('projects')}/>
            <AdminCard icon="Layers" label="Servicios" value={state.data.services} sub={`${state.data.activeServices} activos`} color="#F97316" onClick={() => goTo('services')}/>
            <AdminCard icon="Cpu" label="Tecnologías" value={state.data.technologies} sub={`${state.data.activeTechnologies} visibles`} color="#8B5CF6" onClick={() => goTo('tech')}/>
            <AdminCard icon="Mail" label="Leads" value={state.data.leads} sub="contactos recibidos" color="#10B981" onClick={() => goTo('leads')}/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: 18 }} className="dash-2col">
            {/* Leads funnel */}
            <div style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.TrendingUp size={15} stroke="#22D3EE"/> Embudo de leads
              </div>
              {LEAD_STATUSES.map((s) => {
                const count = state.data.leadCounts[s.id] || 0;
                const total = state.data.leads || 0;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={s.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{s.label}</span>
                      <span style={{ color: 'var(--text-2)' }}>{count} · {pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: s.color, transition: 'width 400ms ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent leads */}
            <div style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon.Mail size={15} stroke="#22D3EE"/> Últimos leads
              </div>
              {state.data.recentLeads && state.data.recentLeads.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {state.data.recentLeads.map((l) => {
                    const st = LEAD_STATUS_MAP[l.status] || LEAD_STATUSES[0];
                    return (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, flexShrink: 0 }}/>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{l.company || l.email}</div>
                        </div>
                        <span style={{ fontSize: 10, color: new Date(l.createdAt).toDateString() === new Date().toDateString() ? '#34D399' : 'var(--text-3)', flexShrink: 0 }}>
                          {new Date(l.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 0' }}>Aún no hay leads.</div>
              )}
              <button onClick={() => goTo('leads')} style={{ marginTop: 12, background: 'transparent', border: 'none', color: '#22D3EE', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Ver todos los leads <Icon.ArrowRight size={12}/>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              <Icon.Box size={12}/> <b>{state.data.contentKeys}</b> campos editables en el CMS
            </div>
            {state.data.lastContentUpdate && (
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                <Icon.Clock size={12}/> Última edición de contenido:{' '}
                {new Date(state.data.lastContentUpdate).toLocaleString()}
              </div>
            )}
            <button onClick={() => goTo('hero')} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12, marginLeft: 'auto' }}>
              <Icon.Edit size={12}/> Editar textos
            </button>
          </div>
          <style>{`
            @media (max-width: 760px) { .dash-2col { grid-template-columns: 1fr !important; } }
          `}</style>
        </div>
      )}
    </div>
  );
}

// ---------------- Leads ----------------
function LeadsManager() {
  const [leads, setLeads] = React.useState([]);
  const [counts, setCounts] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState(null);
  const [editingNotes, setEditingNotes] = React.useState(null);
  const [notesDraft, setNotesDraft] = React.useState('');

  const load = React.useCallback(async (status = filter, q = query) => {
    setLoading(true);
    const res = await fetchAdminLeads(status, q);
    setLeads(res.leads || []);
    setCounts(res.counts || {});
    setLoading(false);
  }, [filter, query]);

  React.useEffect(() => { load(); }, [load]);

  const changeStatus = async (lead, status) => {
    const res = await updateLead(lead.id, { status });
    if (res.ok && res.lead) {
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? res.lead : l)));
      desarproToast({ type: 'success', title: 'Estado actualizado', message: `${res.lead.name} → ${(LEAD_STATUS_MAP[status] || {}).label || status}` });
      load();
    } else {
      desarproToast({ type: 'error', title: 'No se pudo actualizar', message: 'Revisa la conexión con la API.' });
    }
  };

  const saveNotes = async (lead) => {
    const res = await updateLead(lead.id, { notes: notesDraft });
    setEditingNotes(null);
    if (res.ok) {
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, notes: notesDraft } : l)));
      desarproToast({ type: 'success', title: 'Notas guardadas' });
    } else {
      desarproToast({ type: 'error', title: 'No se pudieron guardar las notas' });
    }
  };

  const remove = async (lead) => {
    if (!window.confirm(`¿Eliminar el lead de "${lead.name}"?`)) return;
    const res = await deleteLead(lead.id);
    if (res.ok) {
      desarproToast({ type: 'success', title: 'Lead eliminado' });
      load();
    } else {
      desarproToast({ type: 'error', title: 'No se pudo eliminar' });
    }
  };

  const exportCsv = () => {
    const header = ['id', 'nombre', 'email', 'telefono', 'empresa', 'servicio', 'presupuesto', 'mensaje', 'estado', 'notas', 'fecha'];
    const escape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = leads.map((l) => [l.id, l.name, l.email, l.phone, l.company, l.service, l.budget, l.message, l.status, l.notes, l.createdAt].map(escape).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desarpro-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    desarproToast({ type: 'success', title: 'CSV exportado', message: `${leads.length} leads descargados.` });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Mail size={22} stroke="var(--cyan-bright)"/> Leads
        </h1>
        <button onClick={exportCsv} className="btn btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }} disabled={!leads.length}>
          <Icon.Download size={14}/> Exportar CSV
        </button>
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 20px' }}>
        Contactos recibidos desde el formulario público. Cámbiales el estado a medida que los gestionas.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
        {[{ id: 'all', label: 'Todos' }, ...LEAD_STATUSES].map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)} style={{
            padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: filter === s.id ? (s.color ? `${s.color}22` : 'rgba(34,211,238,0.18)') : 'rgba(255,255,255,0.04)',
            color: filter === s.id ? (s.color || '#22D3EE') : 'var(--text-2)',
            border: `1px solid ${filter === s.id ? (s.color ? `${s.color}66` : 'rgba(34,211,238,0.4)') : 'var(--card-border)'}`,
          }}>
            {s.label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{s.id === 'all' ? (leads.length || counts && Object.values(counts).reduce((a, b) => a + b, 0)) : (counts[s.id] || 0)}</span>
          </button>
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') load(filter, query); }}
          placeholder="Buscar por nombre, email, empresa…"
          className="input"
          style={{ minHeight: 38, fontSize: 13, flex: '1 1 200px', marginLeft: 'auto' }}
        />
      </div>

      {loading ? (
        <LoadingState label="Cargando leads…"/>
      ) : leads.length === 0 ? (
        <EmptyState
          icon="Mail"
          title={query ? 'Sin coincidencias' : 'Aún no hay leads'}
          subtitle={query ? `No hay contactos que coincidan con «${query}».` : 'Cuando alguien envíe el formulario de contacto, aparecerá aquí.'}
        />
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {leads.map((l) => {
            const st = LEAD_STATUS_MAP[l.status] || LEAD_STATUSES[0];
            const isOpen = expanded === l.id;
            return (
              <div key={l.id} style={{
                borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--card-border)', overflow: 'hidden',
                opacity: l.status === 'lost' ? 0.7 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flexWrap: 'wrap' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: st.color, flexShrink: 0, boxShadow: `0 0 8px ${st.color}` }}/>
                  <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>
                      {l.name}
                      {l.company && <span style={{ color: 'var(--text-2)', fontWeight: 500 }}> · {l.company}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>
                      {l.email}{l.phone ? ` · ${l.phone}` : ''} · {new Date(l.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: `${st.color}1A`, color: st.color, fontWeight: 700, border: `1px solid ${st.color}40` }}>{st.label}</span>
                    <select
                      value={l.status}
                      onChange={(e) => changeStatus(l, e.target.value)}
                      className="input"
                      style={{ minHeight: 34, fontSize: 12, width: 140, padding: '4px 8px' }}
                      title="Cambiar estado"
                    >
                      {LEAD_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setExpanded(isOpen ? null : l.id)} className="btn btn-ghost" style={{ padding: '7px 11px', fontSize: 12, flexShrink: 0 }}>
                    {isOpen ? 'Cerrar' : 'Detalle'} <Icon.ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 180ms' }}/>
                  </button>
                  <button onClick={() => remove(l)} className="btn btn-ghost" style={{ padding: '7px 11px', fontSize: 12, color: '#EF4444', flexShrink: 0 }} title="Eliminar">
                    <Icon.X size={12}/>
                  </button>
                </div>

                {isOpen && (
                  <div style={{ padding: '4px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 14 }}>
                      <InfoChip label="Servicio de interés" value={l.service || '—'}/>
                      <InfoChip label="Presupuesto" value={l.budget || '—'}/>
                      <InfoChip label="Fuente" value={l.source || 'contact'}/>
                      <InfoChip label="Actualizado" value={new Date(l.updatedAt).toLocaleString()}/>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div className="pm-label" style={{ fontSize: 10 }}>Mensaje</div>
                      <div style={{ fontSize: 13, color: 'var(--text-1)', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', whiteSpace: 'pre-wrap' }}>{l.message}</div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div className="pm-label" style={{ fontSize: 10 }}>Notas internas</div>
                      {editingNotes === l.id ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} rows={2} className="input" style={{ flex: 1, fontSize: 13 }} autoFocus/>
                          <button onClick={() => saveNotes(l)} className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12 }}><Icon.Check size={12}/> Guardar</button>
                          <button onClick={() => setEditingNotes(null)} className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 12 }}>Cancelar</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingNotes(l.id); setNotesDraft(l.notes || ''); }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', color: l.notes ? 'var(--text-1)' : 'var(--text-3)', fontSize: 13, cursor: 'pointer' }}>
                          {l.notes || '+ Añadir notas internas'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div>
      <div className="pm-label" style={{ fontSize: 10 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)' }}>{value}</div>
    </div>
  );
}

// ---------------- Services ----------------
function ServicesManager() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null); // slug | 'new'
  const [saving, setSaving] = React.useState(false);
  const [langTab, setLangTab] = React.useState('es');
  const [form, setForm] = React.useState(null);

  const emptyTranslations = () => {
    const tr = {};
    for (const l of ADMIN_LANGS) tr[l] = { name: '', tagline: '', overview: '', bullets: [], deliverables: [], process: [] };
    return tr;
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminServices();
    setList(res.ok ? res.services : []);
    setLoading(false);
    if (!res.ok && res.status !== 401) {
      desarproToast({ type: 'error', title: 'No se pudieron cargar los servicios' });
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({ slug: '', kind: '', icon: 'Layers', color: '#22D3EE', featured: false, active: true, order: list.length, translations: emptyTranslations() });
    setEditing('new');
    setLangTab('es');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (s) => {
    const tr = emptyTranslations();
    for (const l of ADMIN_LANGS) {
      const x = s.translations && s.translations[l];
      tr[l] = {
        name: (x && x.name) || (l === 'es' ? s.name || '' : ''),
        tagline: (x && x.tagline) || (l === 'es' ? s.tagline || '' : ''),
        overview: (x && x.overview) || (l === 'es' ? s.overview || '' : ''),
        bullets: (x && x.bullets) || [],
        deliverables: (x && x.deliverables) || [],
        process: (x && x.process) || [],
      };
    }
    setForm({
      slug: s.slug, kind: s.kind || s.slug.replace('svc-', ''), icon: s.icon, color: s.color,
      featured: !!s.featured, active: s.active !== false, order: typeof s.order === 'number' ? s.order : 0,
      translations: tr,
    });
    setEditing(s.slug);
    setLangTab('es');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setTr = (field, value) => setForm((f) => ({
    ...f,
    translations: { ...f.translations, [langTab]: { ...f.translations[langTab], [field]: value } },
  }));
  const setListField = (field, text) => setTr(field, text.split('\n').map((s) => s.trim()).filter(Boolean));
  const listText = (arr) => (arr || []).join('\n');

  const handleSave = async () => {
    const es = form.translations.es || {};
    if (!es.name) {
      desarproToast({ type: 'error', title: 'Falta el nombre', message: 'El nombre del servicio (ES) es obligatorio.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug || form.kind, kind: form.kind || form.slug,
        icon: form.icon, color: form.color, featured: form.featured, active: form.active, order: form.order,
        translations: form.translations,
      };
      const res = await saveService(payload);
      if (res.ok) {
        desarproToast({ type: 'success', title: 'Servicio guardado' });
        setEditing(null);
        await load();
      } else {
        desarproToast({ type: 'error', title: 'No se pudo guardar', message: (res.error || '').replace('error:', '') || 'Revisa la conexión.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`¿Eliminar el servicio "${s.name}"?`)) return;
    const res = await deleteService(s.slug);
    if (res.ok) {
      desarproToast({ type: 'success', title: 'Servicio eliminado' });
      await load();
    } else {
      desarproToast({ type: 'error', title: 'No se pudo eliminar' });
    }
  };

  const toggleFlag = async (s, flag) => {
    const res = await updateService(s.slug, { [flag]: !s[flag] });
    if (res.ok) {
      setList((ls) => ls.map((x) => (x.slug === s.slug ? { ...x, [flag]: !s[flag] } : x)));
    } else {
      desarproToast({ type: 'error', title: 'No se pudo actualizar' });
    }
  };

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const a = list[idx];
    const b = list[j];
    await Promise.all([updateService(a.slug, { order: j }), updateService(b.slug, { order: idx })]);
    await load();
  };

  const inputStyle = { minHeight: 42 };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Layers size={22} stroke="var(--cyan-bright)"/> Servicios
        </h1>
        <button onClick={startNew} className="btn btn-primary" style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #F97316, #F59E0B)' }}>
          <Icon.Plus size={14}/> Nuevo servicio
        </button>
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 20px' }}>
        Catálogo de los 12 servicios (6 principales + 6 especializados). Nombre, descripción, bullets, entregables y proceso en 5 idiomas.
      </p>

      {editing && form && (
        <div style={{ marginBottom: 28, padding: 22, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Edit size={16}/> {editing === 'new' ? 'Nuevo servicio' : `Editar: ${form.translations.es.name || editing}`}
          </h2>

          <div style={{ marginBottom: 16 }}>
            <span className="pm-label">Idioma</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ADMIN_LANGS.map((l) => (
                <button key={l} onClick={() => setLangTab(l)} style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer',
                  background: langTab === l ? 'linear-gradient(135deg, #F97316, #F59E0B)' : 'rgba(255,255,255,0.04)',
                  color: langTab === l ? '#fff' : 'var(--text-2)',
                  border: langTab === l ? '1px solid transparent' : '1px solid var(--card-border)',
                }}>{ADMIN_LANG_LABELS[l]}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Nombre ({langTab.toUpperCase()}) *</span>
              <input type="text" value={form.translations[langTab].name || ''} onChange={(e) => setTr('name', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Etiqueta corta / tagline ({langTab.toUpperCase()})</span>
              <input type="text" value={form.translations[langTab].tagline || ''} onChange={(e) => setTr('tagline', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Descripción general / overview ({langTab.toUpperCase()})</span>
              <textarea value={form.translations[langTab].overview || ''} onChange={(e) => setTr('overview', e.target.value)} rows={3} className="input" style={{ width: '100%', resize: 'vertical' }}/>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="svc-grid">
              <label style={{ display: 'block' }}>
                <span className="pm-label">Bullets (uno por línea)</span>
                <textarea value={listText(form.translations[langTab].bullets)} onChange={(e) => setListField('bullets', e.target.value)} rows={5} className="input" style={{ width: '100%', resize: 'vertical', fontSize: 13 }}/>
              </label>
              <label style={{ display: 'block' }}>
                <span className="pm-label">Entregables (uno por línea)</span>
                <textarea value={listText(form.translations[langTab].deliverables)} onChange={(e) => setListField('deliverables', e.target.value)} rows={5} className="input" style={{ width: '100%', resize: 'vertical', fontSize: 13 }}/>
              </label>
            </div>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Proceso (pasos, uno por línea)</span>
              <input type="text" value={listText(form.translations[langTab].process)} onChange={(e) => setListField('process', e.target.value)} className="input" style={{ ...inputStyle, fontSize: 13 }} placeholder="Diagnóstico, Diseño, Desarrollo…"/>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginTop: 16 }}>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Slug (URL)</span>
              <input type="text" value={form.slug || ''} onChange={(e) => setField('slug', e.target.value)} placeholder="svc-web" className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Kind (clave)</span>
              <input type="text" value={form.kind || ''} onChange={(e) => setField('kind', e.target.value)} placeholder="web" className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Icono (nombre)</span>
              <input type="text" value={form.icon || ''} onChange={(e) => setField('icon', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Color</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.color || '') ? form.color : '#22D3EE'} onChange={(e) => setField('color', e.target.value)} style={{ width: 52, height: 42, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}/>
                <input type="text" value={form.color || ''} onChange={(e) => setField('color', e.target.value)} className="input" style={{ ...inputStyle, fontFamily: 'monospace' }}/>
              </div>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Orden</span>
              <input type="number" value={form.order || 0} onChange={(e) => setField('order', Number(e.target.value))} className="input" style={inputStyle}/>
            </label>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', paddingBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setField('featured', e.target.checked)} style={{ width: 17, height: 17, accentColor: '#F59E0B' }}/>
                <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Principal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.active !== false} onChange={(e) => setField('active', e.target.checked)} style={{ width: 17, height: 17, accentColor: '#10B981' }}/>
                <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Activo</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={() => setEditing(null)} className="btn btn-ghost" style={{ padding: '10px 16px' }} disabled={saving}>Cancelar</button>
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #F97316, #F59E0B)' }} disabled={saving}>
              <Icon.Check size={14}/> {saving ? 'Guardando…' : 'Guardar servicio'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState label="Cargando servicios…"/>
      ) : list.length === 0 ? (
        <EmptyState icon="Layers" title="Sin servicios" subtitle="Crea el primer servicio desde el botón «Nuevo servicio»."/>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {list.map((s, idx) => (
            <div key={s.slug} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14,
              background: 'var(--card-bg)', border: '1px solid var(--card-border)', opacity: s.active === false ? 0.6 : 1,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ background: 'transparent', border: 'none', color: idx === 0 ? 'var(--text-3)' : 'var(--text-1)', cursor: idx === 0 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}>▲</button>
                <button onClick={() => move(idx, 1)} disabled={idx === list.length - 1} style={{ background: 'transparent', border: 'none', color: idx === list.length - 1 ? 'var(--text-3)' : 'var(--text-1)', cursor: idx === list.length - 1 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}>▼</button>
              </div>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: s.color, flexShrink: 0 }}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name} {s.featured && <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B' }}>★ PRINCIPAL</span>}
                  {s.active === false && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginLeft: 8 }}>OCULTO</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.tagline} · {s.slug} · orden {s.order}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                <button onClick={() => toggleFlag(s, 'active')} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: s.active === false ? '#F87171' : 'var(--text-2)' }}>
                  <Icon.Eye size={12}/> {s.active === false ? 'Oculto' : 'Visible'}
                </button>
                <button onClick={() => startEdit(s)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>
                  <Icon.Edit size={12}/> Editar
                </button>
                <button onClick={() => handleDelete(s)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: '#EF4444' }}>
                  <Icon.X size={12}/> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 640px) { .svc-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

// ---------------- Technologies ----------------
const TECH_CATEGORIES = ['Frontend', 'Backend', 'Data', 'Cloud', 'DevOps', 'Mobile', 'Diseño', 'IA', 'Otros'];

function TechManager() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null); // id | 'new'
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminTechnologies();
    setList(res.ok ? res.technologies : []);
    setLoading(false);
    if (!res.ok && res.status !== 401) {
      desarproToast({ type: 'error', title: 'No se pudieron cargar las tecnologías' });
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setForm({ name: '', color: '#22D3EE', category: 'Frontend', featured: true, active: true, order: list.length });
    setEditing('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (t) => {
    setForm({ name: t.name, color: t.color, category: t.category || 'Otros', featured: !!t.featured, active: t.active !== false, order: t.order });
    setEditing(t.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      desarproToast({ type: 'error', title: 'Falta el nombre', message: 'El nombre de la tecnología es obligatorio.' });
      return;
    }
    setSaving(true);
    try {
      const res = await saveTechnology(form);
      if (res.ok) {
        desarproToast({ type: 'success', title: 'Tecnología guardada' });
        setEditing(null);
        await load();
      } else {
        desarproToast({ type: 'error', title: 'No se pudo guardar', message: (res.error || '').replace('error:', '') || 'Revisa la conexión.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`¿Eliminar "${t.name}"?`)) return;
    const res = await deleteTechnology(t.id);
    if (res.ok) {
      desarproToast({ type: 'success', title: 'Tecnología eliminada' });
      await load();
    } else {
      desarproToast({ type: 'error', title: 'No se pudo eliminar' });
    }
  };

  const toggleFlag = async (t, flag) => {
    const res = await saveTechnology({ ...t, [flag]: !t[flag] });
    if (res.ok) setList((ls) => ls.map((x) => (x.id === t.id ? res.technology : x)));
    else desarproToast({ type: 'error', title: 'No se pudo actualizar' });
  };

  const move = async (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const arr = list.slice();
    const a = arr[idx];
    arr[idx] = arr[j];
    arr[j] = a;
    setList(arr.slice());
    await Promise.all([saveTechnology({ ...a, order: j }), saveTechnology({ ...arr[idx], order: idx })]);
    await load();
  };

  const inputStyle = { minHeight: 42 };
  const grouped = list.reduce((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon.Cpu size={22} stroke="var(--cyan-bright)"/> Tecnologías
        </h1>
        <button onClick={startNew} className="btn btn-primary" style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}>
          <Icon.Plus size={14}/> Nueva tecnología
        </button>
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 20px' }}>
        El marquee del sitio (TechLoop). Los logos se renderizan desde la librería local; aquí controlas cuáles se muestran, en qué orden y en qué categoría.
      </p>

      {editing && form && (
        <div style={{ marginBottom: 28, padding: 22, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Edit size={16}/> {editing === 'new' ? 'Nueva tecnología' : `Editar: ${form.name}`}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Nombre *</span>
              <input type="text" value={form.name || ''} onChange={(e) => setField('name', e.target.value)} className="input" style={inputStyle}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Color</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.color || '') ? form.color : '#22D3EE'} onChange={(e) => setField('color', e.target.value)} style={{ width: 52, height: 42, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}/>
                <input type="text" value={form.color || ''} onChange={(e) => setField('color', e.target.value)} className="input" style={{ ...inputStyle, fontFamily: 'monospace' }}/>
              </div>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Categoría</span>
              <select value={form.category} onChange={(e) => setField('category', e.target.value)} className="input" style={inputStyle}>
                {TECH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Orden</span>
              <input type="number" value={form.order || 0} onChange={(e) => setField('order', Number(e.target.value))} className="input" style={inputStyle}/>
            </label>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', paddingBottom: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={!!form.featured} onChange={(e) => setField('featured', e.target.checked)} style={{ width: 17, height: 17, accentColor: '#F59E0B' }}/>
                <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Destacada</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.active !== false} onChange={(e) => setField('active', e.target.checked)} style={{ width: 17, height: 17, accentColor: '#10B981' }}/>
                <span style={{ color: 'var(--text-1)', fontSize: 13, fontWeight: 600 }}>Activa</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button onClick={() => setEditing(null)} className="btn btn-ghost" style={{ padding: '10px 16px' }} disabled={saving}>Cancelar</button>
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }} disabled={saving}>
              <Icon.Check size={14}/> {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState label="Cargando tecnologías…"/>
      ) : list.length === 0 ? (
        <EmptyState icon="Cpu" title="Sin tecnologías" subtitle="Agrega tecnologías desde el botón «Nueva tecnología»."/>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 8 }}>{cat} · {items.length}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {items.map((t, idx) => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px', borderRadius: 14, background: 'var(--card-bg)', border: '1px solid var(--card-border)', opacity: t.active === false ? 0.55 : 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                      <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ background: 'transparent', border: 'none', color: idx === 0 ? 'var(--text-3)' : 'var(--text-1)', cursor: idx === 0 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}>▲</button>
                      <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} style={{ background: 'transparent', border: 'none', color: idx === items.length - 1 ? 'var(--text-3)' : 'var(--text-1)', cursor: idx === items.length - 1 ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}>▼</button>
                    </div>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: `${t.color}1A`, border: `1px solid ${t.color}35`, color: t.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 13 }}>{t.name[0]}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-0)' }}>{t.name} {t.active === false && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>OCULTA</span>}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{t.category} · orden {t.order}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                      <button onClick={() => toggleFlag(t, 'active')} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: t.active === false ? '#F87171' : 'var(--text-2)' }}>
                        <Icon.Eye size={12}/> {t.active === false ? 'Oculta' : 'Visible'}
                      </button>
                      <button onClick={() => startEdit(t)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>
                        <Icon.Edit size={12}/> Editar
                      </button>
                      <button onClick={() => handleDelete(t)} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12, color: '#EF4444' }}>
                        <Icon.X size={12}/> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- SEO ----------------
const SEO_ROUTES = [
  { route: 'home', label: 'Inicio' },
  { route: 'servicios', label: 'Servicios' },
  { route: 'proyectos', label: 'Proyectos' },
  { route: 'nosotros', label: 'Nosotros' },
  { route: 'contacto', label: 'Contacto' },
  { route: '404', label: 'Página 404' },
];

function SeoManager() {
  const [rows, setRows] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [route, setRoute] = React.useState('home');
  const [lang, setLang] = React.useState('es');
  const [form, setForm] = React.useState({ title: '', description: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '' });
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const [seoRes, svcRes] = await Promise.all([fetchAdminSeo(), fetchAdminServices()]);
    setRows(seoRes.ok ? seoRes.seo : []);
    setServices(svcRes.ok ? svcRes.services : []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const routes = React.useMemo(() => {
    const svc = services.map((s) => ({ route: s.slug, label: `Servicio · ${s.name}` }));
    return [...SEO_ROUTES, ...svc];
  }, [services]);

  React.useEffect(() => {
    const row = rows.find((r) => r.route === route && r.lang === lang);
    setForm({
      title: (row && row.title) || '',
      description: (row && row.description) || '',
      keywords: (row && row.keywords) || '',
      ogTitle: (row && row.ogTitle) || '',
      ogDescription: (row && row.ogDescription) || '',
      ogImage: (row && row.ogImage) || '',
    });
  }, [rows, route, lang]);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveSeo({ route, lang, ...form });
      if (res.ok) {
        desarproToast({ type: 'success', title: 'SEO guardado', message: `${route} · ${lang.toUpperCase()}` });
        await load();
      } else {
        desarproToast({ type: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión con la API.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = form.title || form.ogTitle || 'DesarPro';
  const previewDesc = form.description || form.ogDescription || '';

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon.Search size={22} stroke="var(--cyan-bright)"/> SEO
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 20px' }}>
        Título, descripción y Open Graph por página e idioma. Se aplican automáticamente en el navegador y para compartir en redes.
      </p>

      {loading ? <LoadingState label="Cargando SEO…"/> : (
        <div style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={route} onChange={(e) => setRoute(e.target.value)} className="input" style={{ minHeight: 42, fontSize: 13, flex: '1 1 220px' }}>
              {routes.map((r) => <option key={r.route} value={r.route}>{r.label}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 5 }}>
              {ADMIN_LANGS.map((l) => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '8px 12px', borderRadius: 9, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: lang === l ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.04)',
                  color: lang === l ? '#fff' : 'var(--text-2)',
                  border: lang === l ? '1px solid transparent' : '1px solid var(--card-border)',
                }}>{ADMIN_LANG_LABELS[l]}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Título ({form.title.length}/200)</span>
              <input type="text" value={form.title} onChange={(e) => setField('title', e.target.value)} className="input" style={{ minHeight: 42 }} maxLength={200}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Descripción ({form.description.length}/500)</span>
              <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3} className="input" style={{ width: '100%', resize: 'vertical' }} maxLength={500}/>
            </label>
            <label style={{ display: 'block' }}>
              <span className="pm-label">Palabras clave</span>
              <input type="text" value={form.keywords} onChange={(e) => setField('keywords', e.target.value)} className="input" style={{ minHeight: 42 }} maxLength={500}/>
            </label>
          </div>

          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="pm-label" style={{ marginBottom: 10 }}>Open Graph (redes sociales)</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span className="pm-label">OG Título</span>
                <input type="text" value={form.ogTitle} onChange={(e) => setField('ogTitle', e.target.value)} className="input" style={{ minHeight: 40 }} maxLength={200}/>
              </label>
              <label style={{ display: 'block' }}>
                <span className="pm-label">OG Descripción</span>
                <textarea value={form.ogDescription} onChange={(e) => setField('ogDescription', e.target.value)} rows={2} className="input" style={{ width: '100%', resize: 'vertical' }} maxLength={500}/>
              </label>
              <label style={{ display: 'block' }}>
                <span className="pm-label">OG Imagen (URL)</span>
                <input type="text" value={form.ogImage} onChange={(e) => setField('ogImage', e.target.value)} className="input" style={{ minHeight: 40 }} placeholder="https://…/og-image.png"/>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: 16, borderRadius: 14, background: '#fff', color: '#0f172a' }}>
            <div className="pm-label" style={{ color: '#64748b' }}>Vista previa de Google</div>
            <div style={{ fontSize: 14, color: '#1a0dab', fontWeight: 400, textDecoration: 'underline', marginTop: 4 }}>{previewTitle}</div>
            <div style={{ fontSize: 12, color: '#006621', marginTop: 2 }}>desarpro.co/#/{route}</div>
            <div style={{ fontSize: 13, color: '#4d5156', marginTop: 2, maxWidth: 560 }}>{previewDesc}</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '12px 24px' }} disabled={saving}>
              <Icon.Check size={14}/> {saving ? 'Guardando…' : 'Guardar SEO'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Site Config ----------------
const SECTION_LABELS = {
  hero: 'Hero',
  stats: 'Estadísticas',
  services: 'Servicios (inicio)',
  tech: 'Tecnologías (marquee)',
  process: 'Proceso',
  cta: 'CTA final',
};

function ConfigManager() {
  const [config, setConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await fetchSiteConfig();
    setConfig(res || { sections: {}, heroImage: '', announcement: '', announcementActive: false });
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const save = async (key, value, label) => {
    setSaving(true);
    const res = await saveSiteConfig(key, value);
    setSaving(false);
    if (res.ok) {
      desarproToast({ type: 'success', title: 'Configuración guardada', message: label });
      setConfig(res.config || config);
    } else {
      desarproToast({ type: 'error', title: 'No se pudo guardar', message: 'Revisa la conexión con la API.' });
    }
  };

  const toggleSection = async (k) => {
    const sections = { ...(config.sections || {}), [k]: !((config.sections || {})[k]) };
    setConfig((c) => ({ ...c, sections }));
    await save('sections', sections, 'Visibilidad de secciones');
  };

  if (loading) return <LoadingState label="Cargando configuración…"/>;

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon.Settings size={22} stroke="var(--cyan-bright)"/> Configuración
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, margin: '0 0 20px' }}>
        Visibilidad de secciones de la home, imagen del hero y anuncio global.
      </p>

      <div style={{ display: 'grid', gap: 18 }}>
        {/* Sections visibility */}
        <div style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 14 }}>Secciones de la página de inicio</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.keys(SECTION_LABELS).map((k) => {
              const on = (config.sections || {})[k] !== false;
              return (
                <button key={k} onClick={() => toggleSection(k)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '11px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: on ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${on ? 'rgba(16,185,129,0.35)' : 'var(--card-border)'}`,
                  color: on ? 'var(--text-0)' : 'var(--text-3)',
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>{SECTION_LABELS[k]}</span>
                  <span style={{
                    width: 40, height: 22, borderRadius: 999, position: 'relative', flexShrink: 0,
                    background: on ? 'linear-gradient(135deg, #10B981, #06B6D4)' : 'rgba(255,255,255,0.12)',
                    transition: 'background 200ms',
                  }}>
                    <span style={{
                      position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}/>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero image */}
        <div style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6 }}>Imagen del hero (URL)</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Deja vacío para usar el fondo animado por defecto.</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={config.heroImage || ''}
              onChange={(e) => setConfig((c) => ({ ...c, heroImage: e.target.value }))}
              className="input"
              style={{ minHeight: 42, fontSize: 13, flex: '1 1 260px' }}
              placeholder="https://…/hero.jpg"
            />
            <button onClick={() => save('heroImage', config.heroImage || '', 'Imagen del hero')} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }} disabled={saving}>
              <Icon.Check size={13}/> Guardar
            </button>
          </div>
        </div>

        {/* Announcement */}
        <div style={{ padding: 18, borderRadius: 16, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-0)', marginBottom: 6 }}>Anuncio global (barra superior)</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Texto opcional que aparece sobre el navbar en todo el sitio.</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={config.announcement || ''}
              onChange={(e) => setConfig((c) => ({ ...c, announcement: e.target.value }))}
              className="input"
              style={{ minHeight: 42, fontSize: 13, flex: '1 1 260px' }}
              placeholder="Ej: Aceptando proyectos para 2026"
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-1)', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!config.announcementActive} onChange={(e) => setConfig((c) => ({ ...c, announcementActive: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#22D3EE' }}/>
              Activo
            </label>
            <button onClick={() => save('announcement', { announcement: config.announcement || '', announcementActive: !!config.announcementActive }, 'Anuncio global')} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }} disabled={saving}>
              <Icon.Check size={13}/> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.DashboardView = DashboardView;
window.LeadsManager = LeadsManager;
window.ServicesManager = ServicesManager;
window.TechManager = TechManager;
window.SeoManager = SeoManager;
window.ConfigManager = ConfigManager;
