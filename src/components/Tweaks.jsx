// Tweaks panel — quick visual tweaks for hero background and accent.

function Tweaks({ tweaks, setTweak }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode') setOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  };

  const bgs = [
    { id: 'neural', label: 'Red neuronal' },
    { id: 'evileye', label: 'Evil Eye' },
    { id: 'rays', label: 'Rayos' },
    { id: 'grid', label: 'Grid scan' },
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 300, width: 320,
      background: 'rgba(10,11,20,0.95)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 16, padding: 20,
      boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      animation: 'tweaks-in 320ms cubic-bezier(0.16,1,0.3,1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.02em' }}>Tweaks</h4>
        <button onClick={dismiss} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 4, color: '#fff', cursor: 'pointer' }}><Icon.X size={14}/></button>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Fondo Hero</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {bgs.map(b => (
            <button key={b.id} onClick={() => setTweak('heroBg', b.id)} style={{
              padding: '9px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: tweaks.heroBg === b.id ? 'linear-gradient(135deg, #3B82F6, #06B6D4)' : 'rgba(255,255,255,0.04)',
              color: tweaks.heroBg === b.id ? '#fff' : 'rgba(255,255,255,0.7)',
              border: '1px solid ' + (tweaks.heroBg === b.id ? 'transparent' : 'rgba(255,255,255,0.08)'),
              cursor: 'pointer', transition: 'all 200ms',
            }}>{b.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Modo</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[['compact', 'Compacto'], ['comfortable', 'Cómodo']].map(([id, label]) => (
            <button key={id} onClick={() => setTweak('density', id)} style={{
              padding: '9px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: tweaks.density === id ? 'linear-gradient(135deg, #A78BFA, #EC4899)' : 'rgba(255,255,255,0.04)',
              color: tweaks.density === id ? '#fff' : 'rgba(255,255,255,0.7)',
              border: '1px solid ' + (tweaks.density === id ? 'transparent' : 'rgba(255,255,255,0.08)'),
              cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '14px 0 0', lineHeight: 1.5 }}>
        Cambios se aplican en vivo. Sirven para explorar variantes visuales del sitio.
      </p>

      <style>{`@keyframes tweaks-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

window.Tweaks = Tweaks;
