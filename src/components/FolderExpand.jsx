// FolderExpand — "Una carpeta por sector". Editorial folder cards: sector name,
// real tagline, project count. No big icon chips, no tech labels — a clean,
// human, portfolio feel. Each card routes to its project in the carousel.

import React from 'react';
import Icon from '../lib/icons.jsx';

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
      color: p.color,
      tagline: p.tagline || p.desc,
      count: counts[p.industry] || 1,
    });
  }

  return (
    <div className="ind-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 14,
    }}>
      {industries.map((ind, i) => (
        <button
          key={ind.name}
          className="ind-card"
          onClick={() => onPickIndustry?.(ind.name)}
          style={{ '--ind-color': ind.color, animationDelay: `${i * 55}ms` }}
          aria-label={`${ind.name} — ${ind.tagline}`}
        >
          {/* Sector header */}
          <span className="ind-head">
            <span className="ind-dot" />
            <span className="ind-name">{ind.name}</span>
          </span>

          {/* Real tagline */}
          <span className="ind-tagline">{ind.tagline}</span>

          {/* Footer */}
          <span className="ind-foot">
            <span className="ind-count">
              {ind.count} {ind.count === 1 ? 'proyecto' : 'proyectos'}
            </span>
            <span className="ind-arrow"><Icon.ArrowRight size={13}/></span>
          </span>

          {/* Soft colored wash */}
          <span aria-hidden="true" className="ind-glow"/>
        </button>
      ))}

      <style>{`
        .ind-card {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          text-align: left;
          padding: 16px 16px 12px;
          border-radius: 16px;
          cursor: pointer;
          font-family: inherit;
          color: var(--text-0);
          background: linear-gradient(180deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--glass-border-2);
          box-shadow: 0 14px 30px -24px rgba(0,0,0,0.6);
          transition: transform 320ms var(--ease-out), border-color 320ms var(--ease-out), box-shadow 320ms var(--ease-out);
          animation: ind-in 480ms var(--ease-out) both;
        }
        .ind-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--ind-color) 45%, transparent);
          box-shadow: 0 18px 38px -22px rgba(0,0,0,0.65), 0 0 0 1px color-mix(in srgb, var(--ind-color) 16%, transparent);
        }
        .ind-card:active { transform: translateY(-1px) scale(0.99); }
        .ind-card:focus-visible { outline: 2px solid var(--cyan-bright); outline-offset: 3px; }

        .ind-head {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .ind-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: var(--ind-color);
          box-shadow: 0 0 10px color-mix(in srgb, var(--ind-color) 70%, transparent);
        }
        .ind-name {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text-0);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ind-tagline {
          font-size: 12.5px;
          line-height: 1.5;
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
        .ind-count { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-3); }
        .ind-arrow {
          width: 26px; height: 26px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--ind-color) 12%, transparent);
          color: var(--ind-color);
          border: 1px solid color-mix(in srgb, var(--ind-color) 26%, transparent);
          display: inline-flex; align-items: center; justify-content: center;
          transition: transform 320ms var(--ease-out);
        }
        .ind-card:hover .ind-arrow { transform: translateX(3px); }

        .ind-glow {
          position: absolute;
          top: -50px; right: -50px;
          width: 140px; height: 140px;
          border-radius: 50%;
          background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ind-color) 20%, transparent), transparent 70%);
          filter: blur(26px);
          opacity: 0;
          transition: opacity 320ms var(--ease-out);
          pointer-events: none;
        }
        .ind-card:hover .ind-glow { opacity: 1; }

        [data-theme="light"] .ind-card { box-shadow: 0 14px 30px -26px rgba(15,23,42,0.35); }
        [data-theme="light"] .ind-card:hover { box-shadow: 0 18px 38px -26px rgba(15,23,42,0.4), 0 0 0 1px color-mix(in srgb, var(--ind-color) 18%, transparent); }

        @keyframes ind-in {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export default FolderExpand;
