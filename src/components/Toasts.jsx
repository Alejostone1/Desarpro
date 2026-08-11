// Toasts — global notification system (Fase I). Works inside React (useToast)
// and outside it (window.desarproToast) so any code can notify the user.

const TOAST_EVENT = 'desarpro:toast';

function makeId() {
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Programmatic API usable from anywhere (admin managers, save flows…).
function desarproToast(opts) {
  const detail = typeof opts === 'string' ? { type: 'info', message: opts } : opts;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail }));
}

const TOAST_ICONS = {
  success: <Icon.CheckCircle size={18}/>,
  error: <Icon.AlertTriangle size={18}/>,
  info: <Icon.Info size={18}/>,
  warning: <Icon.AlertTriangle size={18}/>,
};

const TOAST_COLORS = {
  success: '#10B981',
  error: '#EF4444',
  info: '#22D3EE',
  warning: '#F59E0B',
};

function ToastItem({ toast, onDismiss }) {
  const color = TOAST_COLORS[toast.type] || TOAST_COLORS.info;
  return (
    <div role="status" style={{
      display: 'flex', gap: 12, alignItems: 'flex-start',
      background: 'rgba(10,12,22,0.97)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderLeft: `3px solid ${color}`,
      borderRadius: 12, padding: '12px 14px',
      width: 340, maxWidth: 'calc(100vw - 32px)',
      boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
      backdropFilter: 'blur(18px)',
      animation: 'toast-in 280ms cubic-bezier(0.16,1,0.3,1)',
    }}>
      <span style={{ color, flexShrink: 0, marginTop: 1 }}>{TOAST_ICONS[toast.type] || TOAST_ICONS.info}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-0)', marginBottom: 2 }}>{toast.title}</div>}
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45, wordBreak: 'break-word' }}>{toast.message}</div>
      </div>
      <button onClick={onDismiss} aria-label="Cerrar" style={{
        background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 2, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon.X size={14}/></button>
    </div>
  );
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback((opts) => {
    const toast = {
      id: opts.id || makeId(),
      type: opts.type || 'info',
      title: opts.title || '',
      message: opts.message || '',
      duration: opts.duration != null ? opts.duration : 4200,
    };
    setToasts((ts) => [...ts.slice(-3), toast]);
    if (toast.duration > 0) {
      setTimeout(() => dismiss(toast.id), toast.duration);
    }
  }, [dismiss]);

  React.useEffect(() => {
    const handler = (e) => { if (e && e.detail) push(e.detail); };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [push]);

  const value = React.useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{
        position: 'fixed', top: 18, right: 18, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }} onClick={(e) => { if (e.target.closest('button')) dismiss(t.id); }}>
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)}/>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in { from { opacity: 0; transform: translateX(24px) scale(0.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .toast-item { animation: none !important; } }
      `}</style>
    </ToastContext.Provider>
  );
}

const ToastContext = React.createContext({ push: desarproToast, dismiss: () => {} });

function useToast() {
  return React.useContext(ToastContext);
}

window.ToastProvider = ToastProvider;
window.useToast = useToast;
window.desarproToast = desarproToast;
