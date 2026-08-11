// DesarPro Logo — premium metallic SVG inspired by the brand identity.
// Cyclical arrow ring + </> code mark + branded wordmark.

import React from 'react';

function Logo({
  size = 48,
  withWordmark = true,
  animated = false,
  variant = 'default', // 'default' | 'compact' | 'mono'
  textColor,
}) {
  const id = React.useId();
  const isCompact = variant === 'compact';
  const isMono = variant === 'mono';

  const grad1 = isMono ? 'currentColor' : `url(#g-arrow-${id})`;
  const grad2 = isMono ? 'currentColor' : `url(#g-code-${id})`;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: withWordmark ? 12 : 0, lineHeight: 1 }}>
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ display: 'block', flexShrink: 0 }}>
        <defs>
          <linearGradient id={`g-arrow-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22D3EE"/>
            <stop offset="35%" stopColor="#3B82F6"/>
            <stop offset="100%" stopColor="#1E40AF"/>
          </linearGradient>
          <linearGradient id={`g-code-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5E7EB"/>
            <stop offset="100%" stopColor="#94A3B8"/>
          </linearGradient>
          <linearGradient id={`g-bar-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA"/>
            <stop offset="100%" stopColor="#3B82F6"/>
          </linearGradient>
          <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Outer cyclical arrow ring (broken with two arrow heads) */}
        <g filter={`url(#glow-${id})`}>
          {/* Top arc */}
          <path
            d="M 40 8 A 32 32 0 0 1 72 40"
            stroke={grad1} strokeWidth="5.5" strokeLinecap="round" fill="none"
            style={animated ? { strokeDasharray: 260, strokeDashoffset: 260, animation: 'logo-draw-1 1.4s cubic-bezier(0.16,1,0.3,1) forwards' } : null}
          />
          {/* Top-right arrow head pointing down */}
          <path
            d="M 64 32 L 72 40 L 64 48"
            stroke={grad1} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            style={animated ? { opacity: 0, animation: 'logo-fade 400ms 1.0s ease forwards' } : null}
          />
          {/* Bottom arc */}
          <path
            d="M 40 72 A 32 32 0 0 1 8 40"
            stroke={grad1} strokeWidth="5.5" strokeLinecap="round" fill="none"
            style={animated ? { strokeDasharray: 260, strokeDashoffset: 260, animation: 'logo-draw-1 1.4s 0.15s cubic-bezier(0.16,1,0.3,1) forwards' } : null}
          />
          {/* Bottom-left arrow head pointing up */}
          <path
            d="M 16 48 L 8 40 L 16 32"
            stroke={grad1} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
            style={animated ? { opacity: 0, animation: 'logo-fade 400ms 1.15s ease forwards' } : null}
          />
        </g>

        {/* Code mark </> at center */}
        <g style={animated ? { opacity: 0, animation: 'logo-fade 500ms 1.3s ease forwards' } : null}>
          <path d="M 30 28 L 22 40 L 30 52" stroke={grad2} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M 50 28 L 58 40 L 50 52" stroke={grad2} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <line x1="46" y1="26" x2="34" y2="54" stroke={isMono ? 'currentColor' : `url(#g-bar-${id})`} strokeWidth="4" strokeLinecap="round"/>
        </g>
      </svg>

      {withWordmark && !isCompact && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1, marginLeft: 2 }}>
          <span style={{
            fontWeight: 800,
            fontSize: size * 0.42,
            letterSpacing: '-0.015em',
            color: textColor || 'var(--text-0)',
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            display: 'inline-flex',
            alignItems: 'baseline',
            gap: 1,
          }}>
            <span>DESAR</span>
            <span className="text-grad-blue">PRO</span>
          </span>
          <span style={{
            fontSize: Math.max(8, size * 0.13),
            fontWeight: 600,
            letterSpacing: '0.22em',
            color: textColor ? textColor : 'var(--text-2)',
            opacity: 0.85,
            marginTop: 4,
          }}>
            DESARROLLO PROFESIONAL
          </span>
        </span>
      )}

      {withWordmark && isCompact && (
        <span style={{
          fontWeight: 800,
          fontSize: size * 0.45,
          letterSpacing: '-0.02em',
          color: textColor || 'var(--text-0)',
          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        }}>
          DESAR<span className="text-grad-blue">PRO</span>
        </span>
      )}

      <style>{`
        @keyframes logo-draw-1 { to { stroke-dashoffset: 0; } }
        @keyframes logo-fade { to { opacity: 1; } }
      `}</style>
    </span>
  );
}

export default Logo;
