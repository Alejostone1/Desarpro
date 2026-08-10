// FolderExpand — "Una carpeta por sector". Modern folder cards, theme-aware,
// animated. Each industry has a project, so every card routes to its project
// in the carousel.

function FolderExpand({ projects = [], onPickIndustry }) {
  const counts = projects.reduce((acc, p) => {
    acc[p.industry] = (acc[p.industry] || 0) + 1;
    return acc;
  }, {});

  const industries = [];
  for (const p of projects) {
    if (industries.some((i) => i.name === p.industry)) continue;
    industries.push({
      name: p.industry,
      icon: p.icon,
      color: p.color,
      tagline: p.tagline || p.desc,
      count: counts[p.industry] || 1,
    });
  }

  return (
    <div className="ind-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
      gap: 16,
    }}>
      {industries.map((ind, i) => {
        const I = Icon[ind.icon] || Icon.Folder;
        return (
          <button
            key={ind.name}
            className="ind-card"
            onClick={() => onPickIndustry?.(ind.name)}
            style={{ '--ind-color': ind.color, animationDelay: `${i * 55}ms` }}
            aria-label={`${ind.name} — ${ind.tagline}`}
          >
            {/* Folder tab */}
            <span className="ind-tab">
              <span className="ind-dot" />
              <span className="ind-name">{ind.name}</span>
            </span>

            {/* Icon */}
            <span className="ind-icon"><I size={22}/></span>

            {/* Description */}
            <span className="ind-tagline">{ind.tagline}</span>

            {/* Footer */}
            <span className="ind-foot">
              <span className="ind-count">{ind.count} proyecto{ind.count > 1 ? 's' : ''}</span>
              <span className="ind-arrow"><Icon.ArrowRight size={13}/></span>
            </span>

            {/* Glow */}
            <span aria-hidden="true" className="ind-glow"/>
          </button>
        );
      })}

      <style>{`
        .ind-card {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          padding: 18px 16px 14px;
          border-radius: 18px;
          cursor: pointer;
          font-family: inherit;
          color: var(--text-0);
          background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--glass-border-2);
          box-shadow: 0 14px 30px -22px rgba(0,0,0,0.6);
          transition: transform 320ms var(--ease-out), border-color 320ms var(--ease-out), box-shadow 320ms var(--ease-out);
          animation: ind-in 480ms var(--ease-out) both;
        }
        .ind-card:hover {
          transform: translateY(-6px);
          border-color: color-mix(in srgb, var(--ind-color) 45%, transparent);
          box-shadow: 0 22px 44px -22px rgba(0,0,0,0.65), 0 0 0 1px color-mix(in srgb, var(--ind-color) 16%, transparent), 0 0 28px color-mix(in srgb, var(--ind-color) 18%, transparent);
        }
        .ind-card:active { transform: translateY(-2px) scale(0.99); }
        .ind-card:focus-visible { outline: 2px solid var(--cyan-bright); outline-offset: 3px; }

        .ind-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--ind-color) 22%, transparent);
          background: color-mix(in srgb, var(--ind-color) 9%, transparent);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ind-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
          background: var(--ind-color);
          box-shadow: 0 0 10px var(--ind-color);
        }
        .ind-name { color: var(--ind-color); white-space: nowrap; }

        .ind-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: color-mix(in srgb, var(--ind-color) 14%, transparent);
          color: var(--ind-color);
          border: 1px solid color-mix(in srgb, var(--ind-color) 28%, transparent);
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: transform 320ms var(--ease-out);
        }
        .ind-card:hover .ind-icon { transform: translateY(-3px) scale(1.08) rotate(-4deg); }

        .ind-tagline {
          font-size: 13px;
          line-height: 1.45;
          color: var(--text-2);
          min-height: 38px;
        }

        .ind-foot {
          width: 100%;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .ind-count { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ind-color); }
        .ind-arrow {
          width: 28px; height: 28px;
          border-radius: 9px;
          background: color-mix(in srgb, var(--ind-color) 12%, transparent);
          color: var(--ind-color);
          border: 1px solid color-mix(in srgb, var(--ind-color) 26%, transparent);
          display: inline-flex; align-items: center; justify-content: center;
          transition: transform 320ms var(--ease-out);
        }
        .ind-card:hover .ind-arrow { transform: translateX(3px); }

        .ind-glow {
          position: absolute;
          top: -40px; right: -40px;
          width: 130px; height: 130px;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ind-color) 24%, transparent), transparent 70%);
          filter: blur(24px);
          opacity: 0;
          transition: opacity 320ms var(--ease-out);
          pointer-events: none;
        }
        .ind-card:hover .ind-glow { opacity: 1; }

        [data-theme="light"] .ind-card { box-shadow: 0 14px 30px -24px rgba(15,23,42,0.35); }
        [data-theme="light"] .ind-card:hover { box-shadow: 0 22px 44px -24px rgba(15,23,42,0.4), 0 0 0 1px color-mix(in srgb, var(--ind-color) 18%, transparent); }

        @keyframes ind-in {
          from { opacity: 0; transform: translateY(18px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

window.FolderExpand = FolderExpand;
