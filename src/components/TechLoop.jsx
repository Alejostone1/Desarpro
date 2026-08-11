// TechLoop — infinite horizontal technology stream with smooth motion,
// hover pause, touch support and prefers-reduced-motion.

import React from 'react';
import { TECH_LOGOS } from '../lib/techLogos.jsx';

function TechLoop({ list = TECH_LOGOS, speed = 50, reverse = false, ariaLabel = 'Technologies' }) {
  const trackRef = React.useRef(null);
  const [paused, setPaused] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const touchRef = React.useRef(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const items = [...list, ...list];
  const animName = reverse ? 'tech-stream-r' : 'tech-stream-f';
  const duration = reducedMotion ? 0 : speed;

  const handlePointerDown = () => {
    touchRef.current = true;
    setPaused(true);
  };
  const handlePointerUp = () => {
    touchRef.current = false;
    setPaused(false);
  };

  return (
    <div
      className="tech-stream"
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { if (!touchRef.current) setPaused(false); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        ref={trackRef}
        className={`tech-stream-track${reverse ? ' tech-stream-track--reverse' : ''}${paused ? ' tech-stream-track--paused' : ''}${reducedMotion ? ' tech-stream-track--static' : ''}`}
        style={{ '--tech-duration': `${duration}s` }}
      >
        {items.map((t, i) => (
          <div key={`${t.name}-${i}`} className="tech-chip" style={{ '--tech-accent': t.color }}>
            <div className="tech-chip-icon">
              {t.svg()}
            </div>
            <span className="tech-chip-label">{t.name}</span>
          </div>
        ))}
      </div>
      <style>{`
        .tech-stream {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 68px;
          mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
          touch-action: pan-y;
        }
        .tech-stream-track {
          display: flex;
          align-items: center;
          gap: 14px;
          height: 100%;
          width: max-content;
          white-space: nowrap;
          animation: tech-stream-f var(--tech-duration, 50s) linear infinite;
          will-change: transform;
        }
        .tech-stream-track--reverse { animation-name: tech-stream-r; }
        .tech-stream-track--paused { animation-play-state: paused; }
        .tech-stream-track--static {
          animation: none;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
          height: auto;
          gap: 10px;
          padding: 4px 0;
        }
        .tech-stream--static-wrap { height: auto; min-height: 68px; }
        .tech-chip {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          border-radius: 12px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          transition: transform 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      border-color 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      background 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      box-shadow 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
          cursor: default;
          flex-shrink: 0;
        }
        .tech-chip:hover {
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--tech-accent, var(--cyan-bright)) 45%, var(--card-border));
          background: color-mix(in srgb, var(--tech-accent, var(--cyan-bright)) 6%, var(--card-bg));
          box-shadow: 0 4px 16px color-mix(in srgb, var(--tech-accent, var(--cyan-bright)) 12%, transparent);
        }
        .tech-chip-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
        }
        .tech-chip:hover .tech-chip-icon { transform: scale(1.08); }
        .tech-chip-label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-1);
          letter-spacing: -0.01em;
        }
        @keyframes tech-stream-f {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes tech-stream-r {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @media (max-width: 640px) {
          .tech-stream { height: 60px; }
          .tech-chip { padding: 8px 14px; gap: 8px; }
          .tech-chip-label { font-size: 12.5px; }
          .tech-chip-icon { width: 22px; height: 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tech-stream { height: auto; min-height: 60px; mask-image: none; -webkit-mask-image: none; }
        }
      `}</style>
    </div>
  );
}

const TECH_LIST = TECH_LOGOS;

export default TechLoop;
export { TECH_LIST };
