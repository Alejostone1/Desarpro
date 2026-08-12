// Shared portal UI — tables, chat, modals, timeline.

import React from 'react';
import Icon from '../../lib/icons.jsx';

function PortalTable({ columns, rows, onRowClick, mobileCard }) {
  return (
    <>
      <div className="portal-table-wrap" style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        <table className="portal-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
          <thead>
            <tr style={{ background: 'var(--bg-1)', color: 'var(--text-3)', textAlign: 'left' }}>
              {columns.map((c) => (
                <th key={c.key} style={{ padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ borderTop: '1px solid var(--card-border)', cursor: onRowClick ? 'pointer' : 'default' }}
                className="portal-table-row"
              >
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: '10px 12px', color: 'var(--text-0)' }}>
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mobileCard && (
        <div className="portal-mobile-cards" style={{ display: 'none', gap: 10 }}>
          {rows.map((row) => (
            <button key={row.id} type="button" className="glass-2" style={{ padding: 14, borderRadius: 12, textAlign: 'left', border: '1px solid var(--card-border)', width: '100%', color: 'inherit' }} onClick={() => onRowClick && onRowClick(row)}>
              {mobileCard(row)}
            </button>
          ))}
        </div>
      )}
      <style>{`
        .portal-table-row:hover { background: var(--card-bg-hover, rgba(255,255,255,0.03)); }
        @media (max-width: 768px) {
          .portal-table-wrap { display: none !important; }
          .portal-mobile-cards { display: grid !important; }
        }
      `}</style>
    </>
  );
}

function StatusBadge({ label, color = '#22D3EE' }) {
  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: `${color}18`, color, border: `1px solid ${color}44`, fontWeight: 600 }}>
      {label}
    </span>
  );
}

function ProgressBar({ value, height = 8 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div style={{ height, background: 'var(--card-border)', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${v}%`, height: '100%', background: 'linear-gradient(90deg,#3B82F6,#06B6D4)', borderRadius: 99, transition: 'width 400ms ease' }}/>
    </div>
  );
}

const PROJECT_TIMELINE = ['PENDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'COMPLETED'];

function ProjectTimeline({ status, t }) {
  const idx = PROJECT_TIMELINE.indexOf(status);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 16 }}>
      {PROJECT_TIMELINE.map((s, i) => {
        const done = idx >= i;
        const active = s === status;
        return (
          <div key={s} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                background: done ? '#22D3EE' : 'var(--card-border)',
                boxShadow: active ? '0 0 0 3px rgba(34,211,238,0.25)' : 'none',
              }}/>
              {i < PROJECT_TIMELINE.length - 1 && (
                <span style={{ width: 2, flex: 1, minHeight: 24, background: done ? 'rgba(34,211,238,0.35)' : 'var(--card-border)' }}/>
              )}
            </div>
            <div style={{ paddingBottom: 16, fontSize: 13, color: done ? 'var(--text-0)' : 'var(--text-3)', fontWeight: active ? 700 : 400 }}>
              {t ? t(`portal.projectStatus.${s}`) : s}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChatPanel({ messages, text, setText, onSend, t, selfRole = 'client' }) {
  const endRef = React.useRef(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-panel" style={{ display: 'flex', flexDirection: 'column', height: 'min(70vh, 520px)', minHeight: 320 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 2px 12px' }}>
        {messages.map((m) => {
          const isSelf = m.sender?.role === selfRole;
          const time = new Date(m.createdAt).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
          return (
            <div key={m.id} style={{ marginBottom: 12, display: 'flex', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textAlign: isSelf ? 'right' : 'left' }}>
                  {isSelf ? (t?.('portal.chat.you') || 'Tú') : (m.sender?.firstName || t?.('portal.chat.admin') || 'Administrador')} · {time}
                  {m.readAt && <span style={{ marginLeft: 6, opacity: 0.7 }}>✓</span>}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: isSelf ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isSelf ? 'rgba(59,130,246,0.18)' : 'var(--card-bg)',
                  border: '1px solid var(--card-border)', whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5,
                }}>
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>
      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--card-border)' }}>
        <textarea
          className="input"
          rows={2}
          style={{ flex: 1, resize: 'none', minHeight: 44 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t?.('portal.client.sendMessage') || 'Escribe un mensaje…'}
        />
        <button type="button" className="btn btn-primary" onClick={onSend} style={{ alignSelf: 'flex-end', padding: '10px 16px' }}>
          <Icon.ArrowRight size={16}/>
        </button>
      </div>
    </div>
  );
}

function Modal({ open, title, onClose, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="glass-2" style={{ width: 'min(100%, ' + width + 'px)', borderRadius: 16, padding: 24, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ padding: 6 }}><Icon.X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NotificationsBell({ t, onNavigate, markRead, markAllRead, fetchList }) {
  const [data, setData] = React.useState({ notifications: [], unreadCount: 0 });
  const [open, setOpen] = React.useState(false);
  const load = React.useCallback(() => (fetchList ? fetchList() : Promise.resolve({ notifications: [], unreadCount: 0 })).then(setData), [fetchList]);
  React.useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [load]);

  const handleClick = async (n) => {
    if (markRead) await markRead(n.id);
    setOpen(false);
    load();
    if (!onNavigate || !n.meta) return;
    const meta = typeof n.meta === 'string' ? (() => { try { return JSON.parse(n.meta); } catch (e) { return {}; } })() : (n.meta || {});
    if (meta.projectId) onNavigate(`client/projects/${meta.projectId}`);
    else if (meta.conversationId) onNavigate('client/messages');
    else if (meta.userId) onNavigate('clients');
    else if (meta.leadId) onNavigate('leads');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(!open)} style={{ padding: '8px 12px', position: 'relative' }} aria-label={t('portal.admin.notifications.title')}>
        <Icon.Activity size={16}/>
        {data.unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, borderRadius: 99, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{data.unreadCount > 99 ? '99+' : data.unreadCount}</span>
        )}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 55 }} onClick={() => setOpen(false)}/>
          <div className="glass-2 notifications-dropdown" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 'min(360px, calc(100vw - 24px))', maxHeight: 420, overflow: 'auto', borderRadius: 12, padding: 8, zIndex: 60, border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 4px' }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{t('portal.admin.notifications.title')}</div>
              {data.unreadCount > 0 && markAllRead && (
                <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => markAllRead().then(load)}>{t('portal.admin.notifications.markAll')}</button>
              )}
            </div>
            {data.notifications.length === 0 ? (
              <div style={{ padding: 12, fontSize: 13, color: 'var(--text-3)' }}>{t('portal.admin.notifications.empty')}</div>
            ) : data.notifications.map((n) => (
              <button key={n.id} type="button" style={{ width: '100%', textAlign: 'left', padding: 10, borderRadius: 8, border: 'none', background: n.readAt ? 'transparent' : 'rgba(59,130,246,0.08)', cursor: 'pointer', color: 'var(--text-0)', marginBottom: 4 }} onClick={() => handleClick(n)}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{n.body}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { PortalTable, StatusBadge, ProgressBar, ProjectTimeline, ChatPanel, Modal, NotificationsBell, PROJECT_TIMELINE };
