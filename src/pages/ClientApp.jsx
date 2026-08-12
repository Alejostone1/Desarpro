// ClientApp — customer portal with hash routing (#/client/projects/:id)

import React from 'react';
import { useI18n } from '../i18n/index.jsx';
import { ThemeToggle, useTheme } from '../lib/theme.jsx';
import Icon from '../lib/icons.jsx';
import Logo from '../components/Logo.jsx';
import { LoadingState, EmptyState } from '../components/States.jsx';
import { ChatPanel, ProgressBar, ProjectTimeline, StatusBadge, NotificationsBell } from '../components/portal/PortalUI.jsx';
import { readUser, readToken, writeUser, clearSession, isClientUser } from '../lib/authSession.js';
import {
  fetchClientDashboard, fetchClientProjects, fetchClientProject,
  fetchConversations, fetchConversationMessages, sendMessage, markConversationRead,
  updateClientProfile, fetchMe, fetchNotifications, markNotificationRead, markAllNotificationsRead,
  fetchProjectDeliverables,
} from '../lib/portalData.jsx';
import { resolveApiBase } from '../lib/apiBase.js';

const API_BASE = resolveApiBase();

function parseClientRoute(route) {
  if (!route || route === 'client') return { page: 'dashboard', projectId: null };
  const parts = route.replace(/^client\/?/, '').split('/');
  if (parts[0] === 'projects' && parts[1]) return { page: 'project_detail', projectId: Number(parts[1]) };
  if (parts[0] === 'projects') return { page: 'projects', projectId: null };
  if (parts[0] === 'messages') return { page: 'messages', projectId: null };
  if (parts[0] === 'profile') return { page: 'profile', projectId: null };
  if (parts[0] === 'settings') return { page: 'settings', projectId: null };
  return { page: 'dashboard', projectId: null };
}

function ClientLayout({ setRoute, page, navigate, children, unread = 0 }) {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const user = readUser();
  const nav = [
    ['dashboard', 'Activity', t('portal.client.nav.dashboard'), 'client'],
    ['projects', 'Folder', t('portal.client.nav.projects'), 'client/projects'],
    ['profile', 'Users', t('portal.client.nav.profile'), 'client/profile'],
    ['settings', 'Settings', t('portal.client.nav.settings'), 'client/settings'],
    ['messages', 'Mail', t('portal.client.nav.messages'), 'client/messages'],
  ];

  const logout = async () => {
    const token = readToken();
    if (token) fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', headers: { 'x-admin-token': token } }).catch(() => {});
    clearSession();
    setRoute('login');
  };

  return (
    <div className="page client-shell" style={{ minHeight: '100vh', background: 'var(--bg-0)' }}>
      <header style={{ padding: '14px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'sticky', top: 0, zIndex: 40, background: 'var(--header-bg)', backdropFilter: 'blur(16px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="btn btn-ghost client-menu-btn" style={{ padding: 8, display: 'none' }} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">☰</button>
          <Logo size={32} withWordmark/>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t('portal.client.space')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationsBell t={t} fetchList={fetchNotifications} markRead={markNotificationRead} markAllRead={markAllNotificationsRead} onNavigate={(target) => {
            if (target.includes('projects')) navigate(`client/projects/${target.split('/').pop()}`);
            else if (target.includes('messages')) navigate('client/messages');
          }}/>
          {unread > 0 && <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>{unread} {t('portal.admin.messages.unread')}</span>}
          <ThemeToggle size={34}/>
          <button type="button" className="btn btn-ghost" onClick={() => setRoute('home')} style={{ fontSize: 13 }}><Icon.Globe size={14}/></button>
          <button type="button" className="btn btn-ghost" onClick={logout} style={{ fontSize: 13, color: '#ef4444' }}>{t('portal.client.nav.logout')}</button>
        </div>
      </header>
      <div className="client-layout" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: 'calc(100vh - 64px)' }}>
        <aside className={`client-sidebar ${menuOpen ? 'open' : ''}`} style={{ padding: 16, borderRight: '1px solid var(--card-border)', background: 'var(--bg-1)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{user?.firstName || user?.email}</div>
          {nav.map(([id, iconName, label, hash]) => {
            const I = Icon[iconName] || Icon.Activity;
            const active = page === id || (page === 'project_detail' && id === 'projects');
            return (
              <button key={id} type="button" onClick={() => { navigate(hash); setMenuOpen(false); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 4, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? 'rgba(59,130,246,0.15)' : 'transparent', color: active ? 'var(--text-0)' : 'var(--text-1)', fontSize: 14,
              }}>
                <I size={16}/> {label}
              </button>
            );
          })}
        </aside>
        <main style={{ padding: '20px clamp(16px,4vw,32px)' }}>{children}</main>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .client-layout { grid-template-columns: 1fr !important; }
          .client-menu-btn { display: inline-flex !important; }
          .client-sidebar { display: none; position: fixed; inset: 64px 0 auto 0; z-index: 30; background: var(--bg-0); max-height: calc(100vh - 64px); overflow: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
          .client-sidebar.open { display: block; animation: slideIn 200ms ease; }
          @keyframes slideIn { from { transform: translateX(-8px); opacity: 0; } to { transform: none; opacity: 1; } }
        }
      `}</style>
    </div>
  );
}

function ClientDashboard({ navigate }) {
  const { t } = useI18n();
  const user = readUser();
  const [data, setData] = React.useState(null);
  React.useEffect(() => { fetchClientDashboard().then(setData); }, []);
  if (!data) return <LoadingState/>;
  const avgProgress = data.recentProjects?.length
    ? Math.round(data.recentProjects.reduce((a, p) => a + p.progress, 0) / data.recentProjects.length) : 0;
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>{t('portal.client.hello')}, {user?.firstName || user?.email} 👋</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>{t('portal.client.welcome')}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 28 }}>
        {[
          [t('portal.client.activeProjects'), data.activeProjects, '#3B82F6'],
          [t('portal.client.completedProjects'), data.completedProjects, '#10B981'],
          [t('portal.client.overallProgress'), `${data.overallProgress ?? avgProgress}%`, '#06B6D4'],
          [t('portal.client.pendingMessages'), data.unreadMessages, '#F59E0B'],
        ].map(([label, val, color], i) => (
          <div key={i} className="glass-2" style={{ padding: 18, borderRadius: 14, borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{val}</div>
          </div>
        ))}
      </div>
      {(data.recentMessages?.length > 0) && (
        <>
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>{t('portal.client.recentMessages')}</h2>
          <div style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
            {data.recentMessages.map((m) => (
              <div key={m.id} className="glass-2" style={{ padding: 12, borderRadius: 10, fontSize: 13 }}>
                <div style={{ color: 'var(--text-2)', marginBottom: 4 }}>{m.senderName} · {new Date(m.createdAt).toLocaleString()}</div>
                <div>{m.content}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>{t('portal.client.recentProjects')}</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {(data.recentProjects || []).map((p) => (
          <button key={p.id} type="button" className="glass-2" style={{ padding: 16, borderRadius: 12, textAlign: 'left', border: '1px solid var(--card-border)', color: 'inherit', cursor: 'pointer' }} onClick={() => navigate(`client/projects/${p.id}`)}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', margin: '6px 0' }}>{t(`portal.projectStatus.${p.status}`)} · {p.progress}%</div>
            <ProgressBar value={p.progress} height={6}/>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClientProjects({ navigate }) {
  const { t } = useI18n();
  const [projects, setProjects] = React.useState([]);
  React.useEffect(() => { fetchClientProjects().then(setProjects); }, []);
  if (!projects.length) return <EmptyState title={t('portal.client.noProjects')}/>;
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 20px' }}>{t('portal.client.nav.projects')}</h1>
      <div style={{ display: 'grid', gap: 12 }}>
        {projects.map((p) => (
          <button key={p.id} type="button" className="glass-2" style={{ padding: 20, borderRadius: 14, textAlign: 'left', border: '1px solid var(--card-border)', cursor: 'pointer', color: 'inherit' }} onClick={() => navigate(`client/projects/${p.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{p.title}</div>
              <StatusBadge label={t(`portal.projectStatus.${p.status}`)}/>
            </div>
            <div style={{ marginTop: 10 }}><ProgressBar value={p.progress}/></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClientProjectDetail({ projectId, navigate }) {
  const { t } = useI18n();
  const [project, setProject] = React.useState(null);
  const [deliverables, setDeliverables] = React.useState([]);
  React.useEffect(() => {
    fetchClientProject(projectId).then(setProject);
    fetchProjectDeliverables(projectId, false).then(setDeliverables);
  }, [projectId]);
  if (!project) return <LoadingState/>;
  const list = deliverables.length ? deliverables : (project.deliverables || []);
  return (
    <div>
      <button type="button" className="btn btn-ghost" onClick={() => navigate('client/projects')} style={{ marginBottom: 16 }}>← {t('portal.client.back')}</button>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>{project.title}</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>{project.description}</p>
      <div className="glass-2" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 16, marginBottom: 16 }}>
          <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('portal.client.status')}</div><div style={{ fontWeight: 600 }}>{t(`portal.projectStatus.${project.status}`)}</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('portal.client.progress')}</div><div style={{ fontWeight: 600 }}>{project.progress}%</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('portal.client.startDate')}</div><div style={{ fontWeight: 600 }}>{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</div></div>
          <div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('portal.client.dueDate')}</div><div style={{ fontWeight: 600 }}>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '—'}</div></div>
        </div>
        <ProgressBar value={project.progress} height={10}/>
        {project.assignee && <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 14 }}>{t('portal.client.responsible')}: {project.assignee.firstName} {project.assignee.lastName}</p>}
        {project.technologies?.length > 0 && <p style={{ fontSize: 13, marginTop: 8 }}>{t('portal.client.technologies')}: {project.technologies.join(', ')}</p>}
        {list.length > 0 ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>{t('portal.client.deliverables')}</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-1)' }}>
              {list.map((d, i) => (
                <li key={d.id || i}>
                  {d.url ? <a href={d.url} target="_blank" rel="noreferrer" style={{ color: 'var(--cyan-bright)' }}>{d.title || d.name}</a> : (d.title || d.name)}
                  {d.description && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{d.description}</div>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 16 }}>{t('portal.client.noDeliverables')}</p>
        )}
      </div>
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>{t('portal.client.timeline')}</h3>
      <ProjectTimeline status={project.status} t={t}/>
    </div>
  );
}

function ClientMessages() {
  const { t } = useI18n();
  const [conversations, setConversations] = React.useState([]);
  const [activeId, setActiveId] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState('');

  React.useEffect(() => {
    fetchConversations().then((c) => { setConversations(c); if (c[0] && !activeId) setActiveId(c[0].id); });
    const iv = setInterval(() => fetchConversations().then(setConversations), 8000);
    return () => clearInterval(iv);
  }, [activeId]);

  React.useEffect(() => {
    if (!activeId) return;
    const load = () => fetchConversationMessages(activeId).then(setMessages);
    load(); markConversationRead(activeId);
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [activeId]);

  const startChat = async () => {
    const res = await fetch(`${API_BASE}/api/conversations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': readToken() },
      body: JSON.stringify({ subject: t('portal.client.newConversation'), content: t('portal.client.firstMessage') }),
    });
    const data = await res.json();
    if (data.ok) { const list = await fetchConversations(); setConversations(list); if (list[0]) setActiveId(list[0].id); }
  };

  const handleSend = async () => {
    if (!activeId || !text.trim()) return;
    await sendMessage(activeId, text.trim());
    setText('');
    setMessages(await fetchConversationMessages(activeId));
  };

  return (
    <div className="client-chat-page" style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{t('portal.client.nav.messages')}</h1>
        {!conversations.length && <button type="button" className="btn btn-primary" onClick={startChat}>{t('portal.client.newConversation')}</button>}
      </div>
      <div className="glass-2" style={{ borderRadius: 16, padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatPanel messages={messages} text={text} setText={setText} onSend={handleSend} t={t} selfRole="client"/>
      </div>
    </div>
  );
}

function ClientProfile() {
  const { t } = useI18n();
  const [form, setForm] = React.useState(() => {
    const u = readUser() || {};
    return { firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '', company: u.company || '', password: '' };
  });
  const [msg, setMsg] = React.useState('');
  const save = async () => {
    const patch = { ...form };
    if (!patch.password) delete patch.password;
    const res = await updateClientProfile(patch);
    if (res.ok) { writeUser(res.user); setMsg(t('portal.client.saved')); }
    else setMsg(res.error || 'Error');
  };
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>{t('portal.client.nav.profile')}</h1>
      <div className="glass-2" style={{ padding: 20, borderRadius: 16, maxWidth: 480, display: 'grid', gap: 12 }}>
        {['firstName', 'lastName', 'phone', 'company'].map((k) => (
          <input key={k} className="input" placeholder={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })}/>
        ))}
        <input className="input" type="password" placeholder={t('portal.admin.users.password')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/>
        <button type="button" className="btn btn-primary" onClick={save}>{t('portal.admin.users.save')}</button>
        {msg && <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{msg}</span>}
      </div>
    </div>
  );
}

function ClientSettings() {
  const { t, language, setLanguage, availableLanguages } = useI18n();
  const { theme } = useTheme();
  const LANG_LABELS = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français', de: 'Deutsch' };
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 20 }}>{t('portal.client.nav.settings')}</h1>
      <div className="glass-2" style={{ padding: 20, borderRadius: 16, maxWidth: 480, display: 'grid', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>{t('portal.client.settings.language')}</div>
          <select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}>
            {availableLanguages.map((l) => <option key={l} value={l}>{LANG_LABELS[l] || l}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{t('portal.client.settings.theme')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{theme === 'dark' ? 'Dark' : 'Light'}</div>
          </div>
          <ThemeToggle size={40}/>
        </div>
      </div>
    </div>
  );
}

function ClientApp({ setRoute, route = 'client' }) {
  const { t } = useI18n();
  const [checking, setChecking] = React.useState(true);
  const [unread, setUnread] = React.useState(0);
  const { page, projectId } = parseClientRoute(route);

  const navigate = React.useCallback((hash) => setRoute(hash), [setRoute]);

  React.useEffect(() => {
    const token = readToken();
    if (!token) { setRoute('login'); return; }
    const user = readUser();
    if (user && isClientUser(user)) { setChecking(false); return; }
    fetchMe().then((u) => {
      if (u && isClientUser(u)) { writeUser(u); setChecking(false); }
      else setRoute('login');
    });
  }, [setRoute]);

  React.useEffect(() => {
    fetchNotifications().then((d) => setUnread(d.unreadCount || 0));
    const iv = setInterval(() => fetchNotifications().then((d) => setUnread(d.unreadCount || 0)), 15000);
    return () => clearInterval(iv);
  }, []);

  if (checking) return <LoadingState label={t('common.loading')}/>;

  let content = <ClientDashboard navigate={navigate}/>;
  if (page === 'projects') content = <ClientProjects navigate={navigate}/>;
  else if (page === 'project_detail' && projectId) content = <ClientProjectDetail projectId={projectId} navigate={navigate}/>;
  else if (page === 'messages') content = <ClientMessages/>;
  else if (page === 'profile') content = <ClientProfile/>;
  else if (page === 'settings') content = <ClientSettings/>;

  return (
    <ClientLayout setRoute={setRoute} page={page} navigate={navigate} unread={unread}>{content}</ClientLayout>
  );
}

export { ClientApp };
