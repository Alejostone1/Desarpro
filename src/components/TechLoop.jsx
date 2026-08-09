// TechLoop — horizontal infinite marquee with real official-style tech logos.

function TechLoop({ list = TECH_LOGOS, speed = 50, height = 72, reverse = false }) {
  const items = [...list, ...list];
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', height, width: '100%',
      maskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, black 6%, black 94%, transparent)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18,
        animation: `tech-loop-${reverse ? 'r' : 'f'} ${speed}s linear infinite`,
        whiteSpace: 'nowrap', height: '100%',
      }}>
        {items.map((t, i) => (
          <div key={i} className="tech-chip" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '12px 20px', borderRadius: 14,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            transition: 'all 280ms cubic-bezier(0.16,1,0.3,1)',
            cursor: 'default',
            minWidth: 'fit-content',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.color;
            e.currentTarget.style.boxShadow = `0 0 24px ${t.color}55, 0 0 1px ${t.color}`;
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--card-border)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = '';
          }}
          >
            <div style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {t.svg()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.01em' }}>{t.name}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes tech-loop-f { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tech-loop-r { from { transform: translateX(-50%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

// Legacy TECH_LIST shape kept for backward compat (some pages may import it).
const TECH_LIST = TECH_LOGOS;

window.TechLoop = TechLoop;
window.TECH_LIST = TECH_LIST;
