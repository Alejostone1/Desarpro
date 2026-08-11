// EvilEye effect — favorite of the client. Concentric pulsing eye/iris pattern.

import React from 'react';

function EvilEye({ color = '#14B8A6', intensity = 0.7 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 800" style={{ overflow: 'hidden' }}>
        <defs>
          <radialGradient id="ee-iris" cx="50%" cy="50%">
            <stop offset="0%" stopColor={color} stopOpacity={intensity * 0.9}/>
            <stop offset="40%" stopColor={color} stopOpacity={intensity * 0.3}/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </radialGradient>
          <filter id="ee-blur"><feGaussianBlur stdDeviation="20"/></filter>
        </defs>
        <ellipse cx="600" cy="400" rx="500" ry="350" fill="url(#ee-iris)" filter="url(#ee-blur)"/>
        {Array.from({ length: 16 }).map((_, i) => (
          <ellipse key={i} cx="600" cy="400"
            rx={60 + i * 30} ry={45 + i * 22}
            fill="none" stroke={color} strokeWidth="0.6"
            opacity={(1 - i / 16) * intensity * 0.4}
            style={{ animation: `ee-pulse ${5 + i * 0.4}s ease-in-out infinite`, transformOrigin: 'center' }}/>
        ))}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const r1 = 100, r2 = 280 + Math.random() * 60;
          return <line key={i} x1={600 + Math.cos(a) * r1} y1={400 + Math.sin(a) * r1}
            x2={600 + Math.cos(a) * r2} y2={400 + Math.sin(a) * r2}
            stroke={color} strokeWidth="0.4" opacity={Math.random() * 0.4 + 0.1}/>;
        })}
        <circle cx="600" cy="400" r="60" fill={color} opacity={intensity * 0.4} filter="url(#ee-blur)"/>
        <circle cx="600" cy="400" r="20" fill="#000" opacity="0.8"/>
      </svg>
      <style>{`@keyframes ee-pulse { 0%,100% { transform: scale(1); opacity: var(--o,0.3); } 50% { transform: scale(1.04); } }`}</style>
    </div>
  );
}

// Light rays
function LightRays({ color = '#3B82F6' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1200 800" style={{ opacity: 0.4, overflow: 'hidden' }}>
        <defs>
          <linearGradient id="ray" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {Array.from({ length: 12 }).map((_, i) => (
          <polygon key={i}
            points={`${600 + (i - 6) * 20},0 ${500 + (i - 6) * 80},800 ${700 + (i - 6) * 80},800`}
            fill="url(#ray)" opacity={Math.random() * 0.5 + 0.2}
            style={{ animation: `ray-flicker ${3 + i * 0.3}s ease-in-out infinite alternate` }}/>
        ))}
      </svg>
      <style>{`@keyframes ray-flicker { from { opacity: 0.15; } to { opacity: 0.5; } }`}</style>
    </div>
  );
}

// Grid scan — horizontal scan line over a tech grid
function GridScan({ color = '#3B82F6' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      backgroundImage: `linear-gradient(${color}1A 1px, transparent 1px), linear-gradient(90deg, ${color}1A 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
      maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 200,
        background: `linear-gradient(180deg, transparent, ${color}40, transparent)`,
        animation: 'scan-line 6s linear infinite',
      }}/>
      <style>{`@keyframes scan-line { from { top: -200px; } to { top: 100%; } }`}</style>
    </div>
  );
}

// Radar — concentric pulsing circles + sweeping line
function Radar({ color = '#A855F7' }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="100%" height="100%" viewBox="0 0 900 900" style={{ opacity: 0.5, maxWidth: 'clamp(300px, 50vw, 900px)', maxHeight: 'clamp(300px, 50vw, 900px)' }}>
        <defs>
          <linearGradient id="sweep" x1="0%" x2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[60, 140, 220, 300, 380].map((r, i) => (
          <circle key={i} cx="450" cy="450" r={r} fill="none" stroke={color} strokeWidth="0.6" opacity="0.4"/>
        ))}
        <line x1="0" y1="450" x2="900" y2="450" stroke={color} strokeWidth="0.4" opacity="0.3"/>
        <line x1="450" y1="0" x2="450" y2="900" stroke={color} strokeWidth="0.4" opacity="0.3"/>
        <g style={{ transformOrigin: '450px 450px', animation: 'radar-rotate 8s linear infinite' }}>
          <path d="M 450 450 L 850 450 A 400 400 0 0 0 720 168 Z" fill="url(#sweep)"/>
        </g>
        {[0, 1, 2].map(i => (
          <circle key={i} cx="450" cy="450" r="60" fill="none" stroke={color} strokeWidth="1"
            style={{ animation: `radar-ping 3s ease-out ${i}s infinite`, transformOrigin: 'center' }}/>
        ))}
      </svg>
      <style>{`
        @keyframes radar-rotate { to { transform: rotate(360deg); } }
        @keyframes radar-ping { 0% { r: 60; opacity: 1; } 100% { r: 380; opacity: 0; } }
      `}</style>
    </div>
  );
}

// Code rain — vertical falling chars
function CodeRain({ color = '#3B82F6' }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    let w, h, cols;
    const fontSize = 14;
    let drops = [];
    const chars = '01<>{}[]/*-+=;:_$#@!?ABCDEF';
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = w; c.height = h;
      cols = Math.ceil(w / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);
    let raf;
    const tick = () => {
      ctx.fillStyle = 'rgba(5,6,10,0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = color;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.globalAlpha = 0.4;
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [color]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.5 }}/>;
}

export { EvilEye, LightRays, GridScan, Radar, CodeRain };
