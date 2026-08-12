// AdminPortalViews — enterprise management modules

import React from 'react';
import { useI18n } from '../i18n/index.jsx';
import { readUser } from '../lib/authSession.js';
import { hasPermission, PERMS } from '../lib/permissions.js';
import Icon from '../lib/icons.jsx';
import { LoadingState, EmptyState } from '../components/States.jsx';
import { PortalTable, StatusBadge, ProgressBar, ProjectTimeline, ChatPanel, Modal } from '../components/portal/PortalUI.jsx';
import { ThemeToggle } from '../lib/theme.jsx';
import {
  fetchAdminUsers, fetchAdminUser, createAdminUser, updateAdminUser, deleteAdminUser, resetUserPassword,
  fetchAdminClients, fetchAdminClient, createAdminClient, updateClientStatus,
  fetchAdminClientProjects, saveAdminClientProject, updateAdminClientProject, deleteAdminClientProject,
  fetchConversations, fetchConversationMessages, sendMessage, markConversationRead,
  fetchActivityLogs, fetchIntegrationsStatus, testEmailIntegration, saveAnalyticsIntegration, saveMetaIntegration,
  fetchWebhooks, createWebhook, updateWebhook, deleteWebhook,
  fetchGeneralSettings, saveGeneralSettings,
  fetchProjectDeliverables, createProjectDeliverable, updateProjectDeliverable, deleteProjectDeliverable,
} from '../lib/portalData.jsx';

const STATUS_COLORS = { ACTIVE: '#10B981', INACTIVE: '#94A3B8', PENDING: '#F59E0B', BLOCKED: '#EF4444', REJECTED: '#EF4444', SUSPENDED: '#F97316' };
const PRIORITY_COLORS = { LOW: '#94A3B8', MEDIUM: '#3B82F6', HIGH: '#F59E0B', URGENT: '#EF4444' };

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function UsersManager({ roleFilter = '' }) {
  const { t } = useI18n();
  const me = readUser();
  const [users, setUsers] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [filterRole, setFilterRole] = React.useState(roleFilter || 'all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [modal, setModal] = React.useState(null);
  const [form, setForm] = React.useState({ email: '', password: '', firstName: '', lastName: '', role: roleFilter || 'client', status: 'ACTIVE' });
  const [err, setErr] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    const role = filterRole === 'all' ? (roleFilter === 'admin' ? 'admin' : '') : filterRole;
    const res = await fetchAdminUsers(q, role, filterStatus === 'all' ? '' : filterStatus, page);
    let list = res.users || [];
    if (roleFilter === 'admin') list = list.filter((u) => u.role === 'admin' || u.role === 'super_admin');
    else if (!roleFilter && filterRole === 'client') list = list.filter((u) => u.role === 'client');
    setUsers(list);
    setTotal(res.total || list.length);
    setLoading(false);
  }, [q, filterRole, filterStatus, page, roleFilter]);

  React.useEffect(() => { load(); }, [load]);

  const openEdit = async (u) => {
    setModal({ mode: 'edit', user: u });
    setForm({ ...u, password: '' });
  };

  const handleSave = async () => {
    setErr('');
    if (modal?.mode === 'edit') {
      const patch = { firstName: form.firstName, lastName: form.lastName, status: form.status, phone: form.phone, company: form.company, jobTitle: form.jobTitle };
      if (form.password) patch.password = form.password;
      if (me?.role === 'super_admin' && form.role) patch.role = form.role;
      const res = await updateAdminUser(modal.user.id, patch);
      if (res.ok) { setModal(null); load(); } else setErr(res.error || 'Error');
    } else {
      const res = await createAdminUser(form);
      if (res.ok) { setModal(null); setForm({ email: '', password: '', firstName: '', lastName: '', role: roleFilter || 'client', status: 'ACTIVE' }); load(); }
      else setErr(res.error || 'Error');
    }
  };

  const canCreate = hasPermission(me, PERMS.USERS_CREATE);
  const canEdit = hasPermission(me, PERMS.USERS_EDIT);
  const canDelete = hasPermission(me, PERMS.USERS_DELETE);

  const columns = [
    { key: 'name', label: t('portal.admin.users.name'), render: (u) => `${u.firstName} ${u.lastName}`.trim() || '—' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: t('portal.admin.users.role'), render: (u) => t(`portal.roles.${u.role}`) || u.role },
    { key: 'status', label: t('portal.admin.users.status'), render: (u) => <StatusBadge label={t(`portal.status.${u.status}`)} color={STATUS_COLORS[u.status]}/> },
    { key: 'createdAt', label: t('portal.admin.users.registered'), render: (u) => fmtDate(u.createdAt) },
    { key: 'lastLoginAt', label: t('portal.admin.users.lastAccess'), render: (u) => fmtDate(u.lastLoginAt) },
    {
      key: 'actions', label: t('portal.admin.users.actions'), render: (u) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
          {canEdit && <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => openEdit(u)}>{t('portal.admin.users.edit')}</button>}
          {canEdit && <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => updateAdminUser(u.id, { status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }).then(load)}>{u.status === 'ACTIVE' ? t('portal.admin.users.deactivate') : t('portal.admin.users.activate')}</button>}
          {canEdit && <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={async () => { const r = await resetUserPassword(u.id); if (r.ok) window.alert(`Temp: ${r.tempPassword}`); }}>{t('portal.admin.users.resetPassword')}</button>}
          {canDelete && u.id !== me?.id && <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px', color: '#ef4444' }} onClick={() => deleteAdminUser(u.id).then(load)}>{t('portal.admin.users.delete')}</button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
          {roleFilter === 'admin' ? t('portal.admin.nav.admins') : t('portal.admin.users.title')}
        </h1>
        {canCreate && (
          <button type="button" className="btn btn-primary" onClick={() => { setModal({ mode: 'create' }); setForm({ email: '', password: '', firstName: '', lastName: '', role: roleFilter || 'client', status: 'ACTIVE' }); }}>
            {t('portal.admin.users.create')}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <input className="input" style={{ flex: '1 1 200px', minHeight: 40 }} placeholder={t('portal.admin.users.search')} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()}/>
        {!roleFilter && ['all', 'admin', 'client'].map((f) => (
          <button key={f} type="button" className={filterRole === f ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: 12, padding: '8px 12px' }} onClick={() => setFilterRole(f)}>{t(`portal.admin.users.filter.${f}`)}</button>
        ))}
        {['all', 'ACTIVE', 'INACTIVE'].map((f) => (
          <button key={f} type="button" className={filterStatus === f ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: 12, padding: '8px 12px' }} onClick={() => setFilterStatus(f)}>{f === 'all' ? t('portal.admin.users.filter.all') : t(`portal.status.${f}`)}</button>
        ))}
      </div>
      {loading ? <LoadingState/> : users.length === 0 ? <EmptyState title={t('portal.admin.users.empty')}/> : (
        <>
          <PortalTable columns={columns} rows={users} mobileCard={(u) => (
            <><div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div><div style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.email}</div></>
          )}/>
          {total > 25 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>←</button>
              <span style={{ fontSize: 13, color: 'var(--text-2)', alignSelf: 'center' }}>{page}</span>
              <button type="button" className="btn btn-ghost" disabled={page * 25 >= total} onClick={() => setPage((p) => p + 1)}>→</button>
            </div>
          )}
        </>
      )}
      <Modal open={!!modal} title={modal?.mode === 'edit' ? t('portal.admin.users.edit') : t('portal.admin.users.create')} onClose={() => setModal(null)}>
        <div style={{ display: 'grid', gap: 10 }}>
          {['email', 'firstName', 'lastName'].map((k) => (
            <input key={k} className="input" placeholder={k} value={form[k] || ''} disabled={modal?.mode === 'edit' && k === 'email'} onChange={(e) => setForm({ ...form, [k]: e.target.value })}/>
          ))}
          <input className="input" type="password" placeholder={t('portal.admin.users.password')} value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
          {!roleFilter && modal?.mode !== 'edit' && (
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="client">CLIENT</option>
              <option value="admin">ADMIN</option>
            </select>
          )}
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED'].map((s) => <option key={s} value={s}>{t(`portal.status.${s}`)}</option>)}
          </select>
          {err && <p style={{ color: '#fca5a5', fontSize: 13 }}>{err}</p>}
          <button type="button" className="btn btn-primary" onClick={handleSave}>{t('portal.admin.users.save')}</button>
        </div>
      </Modal>
    </div>
  );
}

function PermissionsView() {
  const { t } = useI18n();
  const me = readUser();
  const perms = Object.values(PERMS);
  const [admins, setAdmins] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [draft, setDraft] = React.useState([]);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  React.useEffect(() => {
    fetchAdminUsers('', 'admin', 'ACTIVE', 1).then((res) => {
      setAdmins((res.users || []).filter((u) => u.role === 'admin'));
    });
  }, []);

  const openEditor = async (admin) => {
    const full = await fetchAdminUser(admin.id);
    setSelected(full || admin);
    setDraft(Array.isArray(full?.permissions) ? [...full.permissions] : [...(admin.permissions || perms)]);
    setMsg('');
  };

  const togglePerm = (p) => {
    setDraft((d) => (d.includes(p) ? d.filter((x) => x !== p) : [...d, p]));
  };

  const savePerms = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await updateAdminUser(selected.id, { permissions: draft });
    setSaving(false);
    setMsg(res.ok ? t('portal.client.saved') : 'Error');
    if (res.ok) setAdmins((list) => list.map((a) => (a.id === selected.id ? { ...a, permissions: draft } : a)));
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>{t('portal.admin.nav.permissions')}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>{t('portal.admin.permissions.desc')}</p>
      <div className="glass-2" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
          {perms.map((p) => (
            <div key={p} style={{ fontSize: 12, padding: '8px 12px', borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>{p}</div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>{t('portal.admin.permissions.note')}</p>
      </div>
      {me?.role === 'super_admin' && (
        <div className="glass-2" style={{ padding: 20, borderRadius: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px' }}>{t('portal.admin.nav.admins')}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {admins.map((a) => (
              <button key={a.id} type="button" className={selected?.id === a.id ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: 12 }} onClick={() => openEditor(a)}>
                {a.firstName} {a.lastName}
              </button>
            ))}
          </div>
          {selected && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 8, marginBottom: 16 }}>
                {perms.map((p) => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer', padding: '6px 8px', borderRadius: 8, background: draft.includes(p) ? 'rgba(34,211,238,0.1)' : 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                    <input type="checkbox" checked={draft.includes(p)} onChange={() => togglePerm(p)}/>
                    {p}
                  </label>
                ))}
              </div>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={savePerms}>{t('portal.admin.users.save')}</button>
              {msg && <span style={{ marginLeft: 12, fontSize: 13, color: '#34D399' }}>{msg}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LanguagesView() {
  const { t, language, setLanguage } = useI18n();
  const langs = ['es', 'en', 'pt', 'fr', 'de'];
  const labels = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français', de: 'Deutsch' };
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{t('portal.admin.nav.languages')}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>{t('portal.admin.languages.desc')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
        {langs.map((l) => (
          <button key={l} type="button" className={language === l ? 'btn btn-primary' : 'btn btn-ghost'} onClick={() => setLanguage(l)} style={{ padding: 16, borderRadius: 12 }}>
            {labels[l]} ({l.toUpperCase()})
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 20 }}>{t('portal.admin.languages.cmsNote')}</p>
    </div>
  );
}

function AppearanceView() {
  const { t } = useI18n();
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{t('portal.admin.nav.appearance')}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>{t('portal.admin.appearance.desc')}</p>
      <div className="glass-2" style={{ padding: 24, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <ThemeToggle size={44}/>
        <div>
          <div style={{ fontWeight: 600 }}>{t('portal.admin.appearance.theme')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{t('portal.admin.appearance.themeHint')}</div>
        </div>
      </div>
    </div>
  );
}

function IntegrationsView() {
  const { t } = useI18n();
  const [data, setData] = React.useState(null);
  const [webhooks, setWebhooks] = React.useState([]);
  const [msg, setMsg] = React.useState('');
  const [analytics, setAnalytics] = React.useState({ enabled: false, measurementId: '' });
  const [meta, setMeta] = React.useState({ enabled: false, pixelId: '' });
  const [whForm, setWhForm] = React.useState({ name: '', url: '', event: 'user.registered', active: true, secret: '' });

  const load = React.useCallback(async () => {
    const [integ, hooks] = await Promise.all([fetchIntegrationsStatus(), fetchWebhooks()]);
    setData(integ);
    setWebhooks(hooks);
    if (integ?.analytics) setAnalytics(integ.analytics);
    if (integ?.meta) setMeta(integ.meta);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const smtp = data?.smtp;
  const testEmail = async () => {
    setMsg('');
    const res = await testEmailIntegration();
    if (res.ok) setMsg(`✓ ${t('portal.admin.integrations.testSuccess')}`);
    else if (res.skipped) setMsg(`✗ ${t('portal.admin.integrations.inactive')}`);
    else setMsg(`✗ ${res.error || t('portal.admin.integrations.testFail')}`);
  };

  const saveGa = async () => {
    await saveAnalyticsIntegration(analytics);
    setMsg(t('portal.admin.settings.saved'));
    load();
  };

  const savePx = async () => {
    await saveMetaIntegration(meta);
    setMsg(t('portal.admin.settings.saved'));
    load();
  };

  const addWebhook = async () => {
    if (!whForm.name || !whForm.url) return;
    await createWebhook(whForm);
    setWhForm({ name: '', url: '', event: 'user.registered', active: true, secret: '' });
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{t('portal.admin.nav.integrations')}</h1>
      <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>{t('portal.admin.integrations.desc')}</p>
      {msg && <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{msg}</p>}
      {!data ? <LoadingState/> : (
        <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
          <div className="glass-2" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <Icon.Mail size={18}/>
              <span style={{ fontWeight: 700 }}>EMAIL / SMTP</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 10px', borderRadius: 99, background: smtp?.configured ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', color: smtp?.configured ? '#10B981' : 'var(--text-3)' }}>
                {smtp?.configured ? t('portal.admin.integrations.active') : t('portal.admin.integrations.inactive')}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'grid', gap: 6 }}>
              <div>{t('portal.admin.integrations.host')}: {smtp?.host || '—'}</div>
              <div>{t('portal.admin.integrations.port')}: {smtp?.port || '—'}</div>
              <div>{t('portal.admin.integrations.user')}: {smtp?.user || '—'}</div>
              <div>{t('portal.admin.integrations.from')}: {smtp?.from || '—'}</div>
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 14, fontSize: 13 }} onClick={testEmail}>{t('portal.admin.integrations.testEmail')}</button>
          </div>

          <div className="glass-2" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{t('portal.admin.integrations.analytics')}</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13 }}>
              <input type="checkbox" checked={analytics.enabled} onChange={(e) => setAnalytics({ ...analytics, enabled: e.target.checked })}/>
              {t('portal.admin.integrations.enabled')}
            </label>
            <input className="input" placeholder={t('portal.admin.integrations.measurementId')} value={analytics.measurementId} onChange={(e) => setAnalytics({ ...analytics, measurementId: e.target.value })}/>
            <button type="button" className="btn btn-primary" style={{ marginTop: 10, fontSize: 13 }} onClick={saveGa}>{t('portal.admin.users.save')}</button>
          </div>

          <div className="glass-2" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{t('portal.admin.integrations.meta')}</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13 }}>
              <input type="checkbox" checked={meta.enabled} onChange={(e) => setMeta({ ...meta, enabled: e.target.checked })}/>
              {t('portal.admin.integrations.enabled')}
            </label>
            <input className="input" placeholder={t('portal.admin.integrations.pixelId')} value={meta.pixelId} onChange={(e) => setMeta({ ...meta, pixelId: e.target.value })}/>
            <button type="button" className="btn btn-primary" style={{ marginTop: 10, fontSize: 13 }} onClick={savePx}>{t('portal.admin.users.save')}</button>
          </div>

          <div className="glass-2" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{t('portal.admin.integrations.webhooks')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 12 }}>
              <input className="input" placeholder={t('portal.admin.integrations.webhookName')} value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })}/>
              <input className="input" placeholder={t('portal.admin.integrations.webhookUrl')} value={whForm.url} onChange={(e) => setWhForm({ ...whForm, url: e.target.value })}/>
              <select className="input" value={whForm.event} onChange={(e) => setWhForm({ ...whForm, event: e.target.value })}>
                {['user.registered', 'lead.created', 'project.created', 'project.updated', 'message.created', 'project.status_changed'].map((ev) => (
                  <option key={ev} value={ev}>{ev}</option>
                ))}
              </select>
              <input className="input" placeholder={t('portal.admin.integrations.webhookSecret')} value={whForm.secret} onChange={(e) => setWhForm({ ...whForm, secret: e.target.value })}/>
              <button type="button" className="btn btn-primary" onClick={addWebhook}>{t('portal.admin.integrations.addWebhook')}</button>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {webhooks.map((h) => (
                <div key={h.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', padding: 10, borderRadius: 10, border: '1px solid var(--card-border)', fontSize: 13 }}>
                  <strong>{h.name}</strong>
                  <span style={{ color: 'var(--text-2)' }}>{h.event}</span>
                  <span style={{ color: 'var(--text-3)', flex: 1, minWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.url}</span>
                  <StatusBadge label={h.active ? t('portal.admin.integrations.webhookActive') : t('portal.admin.integrations.inactive')} color={h.active ? '#10B981' : '#94A3B8'}/>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => updateWebhook(h.id, { active: !h.active }).then(load)}>{h.active ? 'Off' : 'On'}</button>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 11, color: '#ef4444' }} onClick={() => deleteWebhook(h.id).then(load)}>{t('portal.admin.users.delete')}</button>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{t('portal.admin.integrations.hint')}</p>
        </div>
      )}
    </div>
  );
}

function GeneralSettingsView() {
  const { t } = useI18n();
  const [settings, setSettings] = React.useState(null);
  const [msg, setMsg] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetchGeneralSettings().then((s) => setSettings(s || {
      'general.identity': {}, 'general.site': {}, 'general.business': {}, 'general.clients': {}, 'general.security': {},
    }));
  }, []);

  if (!settings) return <LoadingState/>;

  const patch = (key, field, value) => {
    setSettings({ ...settings, [key]: { ...(settings[key] || {}), [field]: value } });
  };

  const save = async () => {
    setSaving(true);
    const res = await saveGeneralSettings(settings);
    setSaving(false);
    setMsg(res.ok ? t('portal.admin.settings.saved') : (res.error || 'Error'));
  };

  const id = settings['general.identity'] || {};
  const site = settings['general.site'] || {};
  const biz = settings['general.business'] || {};
  const cli = settings['general.clients'] || {};
  const sec = settings['general.security'] || {};

  const section = (title, children) => (
    <div className="glass-2" style={{ padding: 20, borderRadius: 16, marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>{children}</div>
    </div>
  );

  const field = (label, value, onChange, type = 'text') => (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{label}</span>
      <input className="input" type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)}/>
    </label>
  );

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>{t('portal.admin.nav.general')}</h1>
      {msg && <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{msg}</p>}
      {section(t('portal.admin.settings.identity'), <>
        {field(t('portal.admin.settings.companyName'), id.companyName, (v) => patch('general.identity', 'companyName', v))}
        {field(t('portal.admin.settings.tradeName'), id.tradeName, (v) => patch('general.identity', 'tradeName', v))}
        {field(t('portal.admin.settings.email'), id.email, (v) => patch('general.identity', 'email', v))}
        {field(t('portal.admin.settings.phone'), id.phone, (v) => patch('general.identity', 'phone', v))}
        {field(t('portal.admin.settings.address'), id.address, (v) => patch('general.identity', 'address', v))}
        {field(t('portal.admin.settings.logo'), id.logo, (v) => patch('general.identity', 'logo', v))}
        {field(t('portal.admin.settings.favicon'), id.favicon, (v) => patch('general.identity', 'favicon', v))}
        {field(t('portal.admin.settings.social'), id.social, (v) => patch('general.identity', 'social', v))}
      </>)}
      {section(t('portal.admin.settings.site'), <>
        {field(t('portal.admin.settings.publicUrl'), site.publicUrl, (v) => patch('general.site', 'publicUrl', v))}
        {field(t('portal.admin.settings.apiUrl'), site.apiUrl, (v) => patch('general.site', 'apiUrl', v))}
        {field(t('portal.admin.settings.defaultLang'), site.defaultLang, (v) => patch('general.site', 'defaultLang', v))}
        {field(t('portal.admin.settings.timezone'), site.timezone, (v) => patch('general.site', 'timezone', v))}
        {field(t('portal.admin.settings.country'), site.country, (v) => patch('general.site', 'country', v))}
      </>)}
      {section(t('portal.admin.settings.business'), <>
        {field(t('portal.admin.settings.hours'), biz.hours, (v) => patch('general.business', 'hours', v))}
        {field(t('portal.admin.settings.responseTime'), biz.responseTime, (v) => patch('general.business', 'responseTime', v))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, alignSelf: 'end' }}>
          <input type="checkbox" checked={!!biz.acceptProjects} onChange={(e) => patch('general.business', 'acceptProjects', e.target.checked)}/>
          {t('portal.admin.settings.acceptProjects')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, alignSelf: 'end' }}>
          <input type="checkbox" checked={!!biz.publicRegister} onChange={(e) => patch('general.business', 'publicRegister', e.target.checked)}/>
          {t('portal.admin.settings.publicRegister')}
        </label>
      </>)}
      {section(t('portal.admin.settings.clients'), <>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={cli.allowRegister !== false} onChange={(e) => patch('general.clients', 'allowRegister', e.target.checked)}/>
          {t('portal.admin.settings.allowRegister')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={!!cli.manualApproval} onChange={(e) => patch('general.clients', 'manualApproval', e.target.checked)}/>
          {t('portal.admin.settings.manualApproval')}
        </label>
      </>)}
      {section(t('portal.admin.settings.security'), <>
        {field(t('portal.admin.settings.sessionTtl'), sec.sessionTtlMs, (v) => patch('general.security', 'sessionTtlMs', v), 'number')}
        {field(t('portal.admin.settings.passwordMin'), sec.passwordMinLength, (v) => patch('general.security', 'passwordMinLength', v), 'number')}
      </>)}
      <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>{t('portal.admin.users.save')}</button>
    </div>
  );
}

function ClientsManager({ onViewClient }) {
  const { t } = useI18n();
  const [clients, setClients] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ email: '', password: '', firstName: '', lastName: '', phone: '', company: '' });

  const load = React.useCallback(async () => {
    setLoading(true);
    const list = await fetchAdminClients();
    setClients(q ? list.filter((c) => `${c.firstName} ${c.lastName} ${c.email} ${c.company}`.toLowerCase().includes(q.toLowerCase())) : list);
    setLoading(false);
  }, [q]);

  React.useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    const res = await createAdminClient(form);
    if (res.ok) { setShowForm(false); setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', company: '' }); load(); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{t('portal.admin.clients.title')}</h1>
        <button type="button" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{t('portal.admin.clients.create')}</button>
      </div>
      <input className="input" style={{ marginBottom: 16, minHeight: 40 }} placeholder={t('portal.admin.users.search')} value={q} onChange={(e) => setQ(e.target.value)}/>
      {showForm && (
        <div className="glass-2" style={{ padding: 20, borderRadius: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
          {['email', 'password', 'firstName', 'lastName', 'phone', 'company'].map((k) => (
            <input key={k} className="input" type={k === 'password' ? 'password' : 'text'} placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}/>
          ))}
          <button type="button" className="btn btn-primary" onClick={handleCreate}>{t('portal.admin.clients.create')}</button>
        </div>
      )}
      {loading ? <LoadingState/> : (
        <div style={{ display: 'grid', gap: 10 }}>
          {clients.map((c) => (
            <div key={c.id} className="glass-2" style={{ padding: 16, borderRadius: 12, border: '1px solid var(--card-border)' }}>
              <button type="button" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0 }} onClick={() => onViewClient && onViewClient(c.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.firstName} {c.lastName} {c.company && <span style={{ color: 'var(--text-2)', fontWeight: 400 }}>· {c.company}</span>}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <StatusBadge label={t(`portal.status.${c.status}`)} color={STATUS_COLORS[c.status] || '#94A3B8'}/>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.projectCount || 0} {t('portal.admin.nav.clientProjects').toLowerCase()}</span>
                  </div>
                </div>
              </button>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {c.status === 'PENDING' && <>
                  <button type="button" className="btn btn-primary" style={{ fontSize: 11, padding: '6px 10px' }} onClick={() => updateClientStatus(c.id, 'APPROVE').then(load)}>{t('portal.admin.users.approve')}</button>
                  <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 10px', color: '#ef4444' }} onClick={() => updateClientStatus(c.id, 'REJECT').then(load)}>{t('portal.admin.users.reject')}</button>
                </>}
                {c.status === 'ACTIVE' && <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 10px' }} onClick={() => updateClientStatus(c.id, 'SUSPEND').then(load)}>{t('portal.admin.users.suspend')}</button>}
                {c.status === 'SUSPENDED' && <button type="button" className="btn btn-primary" style={{ fontSize: 11, padding: '6px 10px' }} onClick={() => updateClientStatus(c.id, 'REACTIVATE').then(load)}>{t('portal.admin.users.reactivate')}</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientDetailView({ clientId, onBack }) {
  const { t } = useI18n();
  const [client, setClient] = React.useState(null);
  const load = React.useCallback(() => { if (clientId) fetchAdminClient(clientId).then(setClient); }, [clientId]);
  React.useEffect(() => { load(); }, [load]);
  if (!client) return <LoadingState/>;
  const setStatus = (action) => updateClientStatus(client.id, action).then(load);
  return (
    <div>
      <button type="button" className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 16 }}>← {t('portal.admin.clients.back')}</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{client.firstName} {client.lastName}</h1>
        <StatusBadge label={t(`portal.status.${client.status}`)} color={STATUS_COLORS[client.status]}/>
      </div>
      <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>{client.company} · {client.email}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {client.status === 'PENDING' && <>
          <button type="button" className="btn btn-primary" onClick={() => setStatus('APPROVE')}>{t('portal.admin.users.approve')}</button>
          <button type="button" className="btn btn-ghost" style={{ color: '#ef4444' }} onClick={() => setStatus('REJECT')}>{t('portal.admin.users.reject')}</button>
        </>}
        {client.status === 'ACTIVE' && <button type="button" className="btn btn-ghost" onClick={() => setStatus('SUSPEND')}>{t('portal.admin.users.suspend')}</button>}
        {client.status === 'SUSPENDED' && <button type="button" className="btn btn-primary" onClick={() => setStatus('REACTIVATE')}>{t('portal.admin.users.reactivate')}</button>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[['Email', client.email], ['Tel', client.phone || '—'], ['Estado', t(`portal.status.${client.status}`)], ['Registro', fmtDate(client.createdAt)]].map(([l, v]) => (
          <div key={l} className="glass-2" style={{ padding: 14, borderRadius: 12 }}><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{l}</div><div style={{ fontWeight: 600, marginTop: 4 }}>{v}</div></div>
        ))}
      </div>
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>{t('portal.admin.nav.clientProjects')} ({client.activeProjects} / {client.completedProjects})</h3>
      <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
        {(client.projects || []).map((p) => (
          <div key={p.id} className="glass-2" style={{ padding: 14, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>{p.title}</span><StatusBadge label={t(`portal.projectStatus.${p.status}`)}/></div>
            <ProgressBar value={p.progress} height={6}/>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>{t('portal.admin.nav.conversations')}</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {(client.conversations || []).slice(0, 5).map((c) => (
          <div key={c.id} className="glass-2" style={{ padding: 12, borderRadius: 10, fontSize: 13 }}>{c.subject || '—'} · {c.lastMessage?.content?.slice(0, 80)}</div>
        ))}
      </div>
    </div>
  );
}

function ProjectDeliverablesPanel({ projectId, t }) {
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState({ title: '', description: '', url: '', visible: true });
  const load = React.useCallback(() => fetchProjectDeliverables(projectId).then(setItems), [projectId]);
  React.useEffect(() => { load(); }, [load]);
  const add = async () => {
    if (!form.title) return;
    await createProjectDeliverable(projectId, form);
    setForm({ title: '', description: '', url: '', visible: true });
    load();
  };
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--card-border)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{t('portal.admin.deliverables.title')}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, marginBottom: 8 }}>
        <input className="input" placeholder={t('portal.admin.clientProjects.name')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
        <input className="input" placeholder={t('portal.admin.deliverables.url')} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}/>
        <button type="button" className="btn btn-primary" style={{ fontSize: 12 }} onClick={add}>{t('portal.admin.deliverables.add')}</button>
      </div>
      {items.map((d) => (
        <div key={d.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
          <span style={{ fontWeight: 600 }}>{d.title}</span>
          {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-bright)' }}>{d.url}</a>}
          <StatusBadge label={d.visible ? t('portal.admin.deliverables.visible') : t('portal.admin.integrations.inactive')} color={d.visible ? '#10B981' : '#94A3B8'}/>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => updateProjectDeliverable(d.id, { visible: !d.visible }).then(load)}>{t('portal.admin.users.edit')}</button>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 11, color: '#ef4444' }} onClick={() => deleteProjectDeliverable(d.id).then(load)}>{t('portal.admin.users.delete')}</button>
        </div>
      ))}
    </div>
  );
}

function ClientProjectsAdmin() {
  const { t } = useI18n();
  const [projects, setProjects] = React.useState([]);
  const [clients, setClients] = React.useState([]);
  const [editing, setEditing] = React.useState(null);
  const [expandedId, setExpandedId] = React.useState(null);
  const [form, setForm] = React.useState({ clientId: '', title: '', description: '', status: 'PLANNING', priority: 'MEDIUM', progress: 0, assigneeId: '' });

  const load = React.useCallback(async () => {
    setProjects(await fetchAdminClientProjects());
    setClients(await fetchAdminClients());
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.clientId || !form.title) return;
    const body = { ...form, clientId: Number(form.clientId), progress: Number(form.progress), assigneeId: form.assigneeId ? Number(form.assigneeId) : null };
    if (editing) await updateAdminClientProject(editing, body);
    else await saveAdminClientProject(body);
    setForm({ clientId: '', title: '', description: '', status: 'PLANNING', priority: 'MEDIUM', progress: 0, assigneeId: '' });
    setEditing(null);
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 20px' }}>{t('portal.admin.clientProjects.title')}</h1>
      <div className="glass-2" style={{ padding: 20, borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
          <select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">{t('portal.admin.clients.title')}</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.email}</option>)}
          </select>
          <input className="input" placeholder={t('portal.admin.clientProjects.name')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['PENDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'COMPLETED', 'PAUSED', 'CANCELLED'].map((s) => <option key={s} value={s}>{t(`portal.projectStatus.${s}`)}</option>)}
          </select>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p} value={p}>{t(`portal.priority.${p}`)}</option>)}
          </select>
          <input className="input" type="number" min={0} max={100} placeholder="%" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })}/>
          <button type="button" className="btn btn-primary" onClick={save}>{editing ? t('portal.admin.users.save') : t('portal.admin.clientProjects.assign')}</button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map((p) => (
          <div key={p.id} className="glass-2" style={{ padding: 16, borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{p.client?.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <StatusBadge label={t(`portal.projectStatus.${p.status}`)}/>
                <StatusBadge label={t(`portal.priority.${p.priority || 'MEDIUM'}`)} color={PRIORITY_COLORS[p.priority] || PRIORITY_COLORS.MEDIUM}/>
                <span style={{ fontSize: 13 }}>{p.progress}%</span>
              </div>
            </div>
            <ProgressBar value={p.progress}/>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setEditing(p.id); setForm({ clientId: String(p.clientId), title: p.title, description: p.description, status: p.status, priority: p.priority || 'MEDIUM', progress: p.progress, assigneeId: p.assigneeId || '' }); }}>{t('portal.admin.users.edit')}</button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>{t('portal.admin.deliverables.title')}</button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: 12, color: '#ef4444' }} onClick={() => deleteAdminClientProject(p.id).then(load)}>{t('portal.admin.users.delete')}</button>
            </div>
            {expandedId === p.id && <ProjectDeliverablesPanel projectId={p.id} t={t}/>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesManager() {
  const { t } = useI18n();
  const [conversations, setConversations] = React.useState([]);
  const [activeId, setActiveId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState('');

  const loadConversations = React.useCallback(async () => {
    setConversations(await fetchConversations());
  }, []);

  const loadMessages = React.useCallback(async (id) => {
    if (!id) return;
    setMessages(await fetchConversationMessages(id));
    await markConversationRead(id);
    loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    loadConversations();
    const iv = setInterval(loadConversations, 8000);
    return () => clearInterval(iv);
  }, [loadConversations]);

  React.useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const iv = setInterval(() => loadMessages(activeId), 5000);
    return () => clearInterval(iv);
  }, [activeId, loadMessages]);

  const handleSend = async () => {
    if (!activeId || !text.trim()) return;
    await sendMessage(activeId, text.trim());
    setText('');
    loadMessages(activeId);
  };

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 20px' }}>{t('portal.admin.nav.conversations')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,1fr) minmax(0,2fr)', gap: 16 }} className="admin-messages-grid">
        <div className="glass-2" style={{ borderRadius: 16, padding: 12, maxHeight: 560, overflow: 'auto' }}>
          {conversations.map((c) => (
            <button key={c.id} type="button" onClick={() => setActiveId(c.id)} style={{
              width: '100%', textAlign: 'left', padding: 12, marginBottom: 6, borderRadius: 10,
              border: activeId === c.id ? '1px solid rgba(34,211,238,0.4)' : '1px solid transparent',
              background: activeId === c.id ? 'rgba(34,211,238,0.1)' : 'transparent', cursor: 'pointer', color: 'var(--text-0)',
            }}>
              <div style={{ fontWeight: 600 }}>{c.client?.company || c.client?.firstName || c.client?.email}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.lastMessage?.content?.slice(0, 60) || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{fmtDate(c.lastMessageAt)}</div>
              {c.unreadCount > 0 && <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>{c.unreadCount} {t('portal.admin.messages.unread')}</span>}
            </button>
          ))}
        </div>
        <div className="glass-2" style={{ borderRadius: 16, padding: 16 }}>
          {active ? (
            <>
              <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ fontWeight: 700 }}>{t('portal.admin.messages.with')} {active.client?.firstName} {active.client?.lastName}</div>
                {active.project && <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{active.project.title}</div>}
              </div>
              <ChatPanel messages={messages} text={text} setText={setText} onSend={handleSend} t={t} selfRole="admin"/>
            </>
          ) : <EmptyState title={t('portal.admin.messages.select')}/>}
        </div>
      </div>
      <style>{`@media (max-width:768px){.admin-messages-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}

function ActivityView() {
  const { t } = useI18n();
  const [logs, setLogs] = React.useState([]);
  const [actionFilter, setActionFilter] = React.useState('');
  React.useEffect(() => {
    fetchActivityLogs(actionFilter).then(setLogs);
  }, [actionFilter]);
  const actions = [...new Set(logs.map((l) => l.action))];
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 20px' }}>{t('portal.admin.nav.activity')}</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button type="button" className={!actionFilter ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: 12 }} onClick={() => setActionFilter('')}>{t('portal.admin.users.filter.all')}</button>
        {['LOGIN', 'REGISTER', 'CREATE_USER', 'UPDATE_USER', 'CREATE_PROJECT', 'UPDATE_PROJECT', 'MESSAGE_SENT'].map((a) => (
          <button key={a} type="button" className={actionFilter === a ? 'btn btn-primary' : 'btn btn-ghost'} style={{ fontSize: 12 }} onClick={() => setActionFilter(a)}>{a}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {logs.map((l) => (
          <div key={l.id} className="glass-2" style={{ padding: 12, borderRadius: 10, fontSize: 13, display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 12, alignItems: 'center' }}>
            <span style={{ color: 'var(--text-3)' }}>{fmtDate(l.createdAt)}</span>
            <span><strong>{l.action}</strong> · {l.entity} {l.entityId} · {l.user?.email || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  UsersManager, PermissionsView, ClientsManager, ClientDetailView,
  ClientProjectsAdmin, MessagesManager, ActivityView,
  LanguagesView, AppearanceView, IntegrationsView, GeneralSettingsView,
};
