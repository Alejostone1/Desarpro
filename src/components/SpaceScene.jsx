// SpaceScene — animated SVG: rotating Earth, orbiting Moon, satellite carrying DesarPro logo,
// twinkling stars, data lines connecting satellite ↔ Earth.

import React from 'react';

function SpaceScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Stars layer */}
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 1000" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="earth-grad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#60A5FA"/>
            <stop offset="50%" stopColor="#1E40AF"/>
            <stop offset="100%" stopColor="#0C1220"/>
          </radialGradient>
          <radialGradient id="moon-grad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#E5E7EB"/>
            <stop offset="100%" stopColor="#6B7280"/>
          </radialGradient>
          <radialGradient id="atmosphere" cx="50%" cy="50%">
            <stop offset="80%" stopColor="#22D3EE" stopOpacity="0"/>
            <stop offset="92%" stopColor="#22D3EE" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="city-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FCD34D"/>
            <stop offset="100%" stopColor="#F97316"/>
          </linearGradient>
        </defs>

        <rect width="1600" height="1000" fill="#03050C"/>

        {/* Stars */}
        {Array.from({ length: 220 }).map((_, i) => {
          const x = Math.random() * 1600, y = Math.random() * 1000;
          const r = Math.random() * 1.4 + 0.3;
          return <circle key={i} cx={x} cy={y} r={r} fill="white"
            style={{ animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite alternate`, animationDelay: `${Math.random() * 4}s`, opacity: Math.random() * 0.7 + 0.2 }}/>;
        })}

        {/* Comet */}
        <g style={{ animation: 'comet 14s linear infinite' }}>
          <line x1="-200" y1="100" x2="-100" y2="120" stroke="white" strokeWidth="1.5" opacity="0.8"/>
          <circle cx="-100" cy="120" r="2" fill="white"/>
        </g>

        {/* Earth — bottom left, partially visible, rotating */}
        <g transform="translate(280 720)">
          <circle r="380" fill="url(#atmosphere)"/>
          <g style={{ transformOrigin: '0 0', animation: 'earth-rotate 80s linear infinite' }}>
            <circle r="320" fill="url(#earth-grad)"/>
            {/* Continents */}
            <path d="M -200 -80 Q -160 -120 -100 -100 Q -50 -80 -30 -40 Q -20 0 -80 20 Q -150 10 -200 -80 Z" fill="#1F2937" opacity="0.8"/>
            <path d="M 50 -150 Q 100 -160 140 -120 Q 160 -80 130 -40 Q 80 -30 50 -80 Z" fill="#1F2937" opacity="0.8"/>
            <path d="M -80 80 Q -40 100 -20 140 Q -60 180 -120 160 Q -140 120 -80 80 Z" fill="#1F2937" opacity="0.8"/>
            <path d="M 120 60 Q 200 80 220 140 Q 180 200 100 180 Q 80 120 120 60 Z" fill="#1F2937" opacity="0.8"/>
            {/* City lights */}
            {Array.from({ length: 30 }).map((_, i) => {
              const a = Math.random() * Math.PI * 2;
              const r = Math.random() * 280 + 30;
              return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={Math.random() * 1.4 + 0.6} fill="url(#city-glow)"
                style={{ animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`, animationDelay: `${Math.random() * 3}s` }}/>;
            })}
          </g>
        </g>

        {/* Moon orbit */}
        <g style={{ transformOrigin: '280px 720px', animation: 'moon-orbit 50s linear infinite' }}>
          <circle cx="900" cy="360" r="60" fill="url(#moon-grad)"/>
          <circle cx="880" cy="350" r="6" fill="#4B5563"/>
          <circle cx="920" cy="370" r="4" fill="#4B5563"/>
          <circle cx="900" cy="380" r="3" fill="#4B5563"/>
        </g>

        {/* Data lines: from earth to satellite */}
        <g style={{ transformOrigin: '280px 720px', animation: 'sat-orbit 25s linear infinite' }}>
          <g transform="translate(1180 220)">
            {/* Connection beam */}
            <line x1="0" y1="0" x2="-900" y2="500" stroke="#22D3EE" strokeWidth="1" opacity="0.4" strokeDasharray="4 6">
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.5s" repeatCount="indefinite"/>
            </line>

            {/* Satellite body — DesarPro branded */}
            <g>
              {/* Solar panels */}
              <rect x="-90" y="-12" width="50" height="24" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.4"/>
              <line x1="-78" y1="-12" x2="-78" y2="12" stroke="#3B82F6" strokeWidth="0.6"/>
              <line x1="-65" y1="-12" x2="-65" y2="12" stroke="#3B82F6" strokeWidth="0.6"/>
              <line x1="-52" y1="-12" x2="-52" y2="12" stroke="#3B82F6" strokeWidth="0.6"/>
              <rect x="40" y="-12" width="50" height="24" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.4"/>
              <line x1="52" y1="-12" x2="52" y2="12" stroke="#3B82F6" strokeWidth="0.6"/>
              <line x1="65" y1="-12" x2="65" y2="12" stroke="#3B82F6" strokeWidth="0.6"/>
              <line x1="78" y1="-12" x2="78" y2="12" stroke="#3B82F6" strokeWidth="0.6"/>
              {/* Body */}
              <rect x="-30" y="-22" width="60" height="44" rx="6" fill="#0F172A" stroke="#22D3EE" strokeWidth="1.6"/>
              <rect x="-25" y="-17" width="50" height="34" rx="3" fill="#1E293B"/>
              {/* Logo on body — DesarPro mark */}
              <g transform="translate(0 0) scale(0.5)">
                <path d="M -16 -8 A 16 16 0 0 1 16 -8 M 16 8 A 16 16 0 0 1 -16 8" stroke="#22D3EE" strokeWidth="2.6" fill="none"/>
                <path d="M -10 -4 L -16 0 L -10 4" stroke="#22D3EE" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
                <path d="M 10 -4 L 16 0 L 10 4" stroke="#22D3EE" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
                <line x1="6" y1="-8" x2="-6" y2="8" stroke="#3B82F6" strokeWidth="2"/>
              </g>
              {/* Antenna */}
              <line x1="0" y1="-22" x2="0" y2="-40" stroke="#22D3EE" strokeWidth="1.2"/>
              <circle cx="0" cy="-42" r="2.5" fill="#22D3EE">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
              </circle>
            </g>
          </g>
        </g>

        {/* Foreground network nodes drifting */}
        {Array.from({ length: 20 }).map((_, i) => {
          const x = Math.random() * 1600, y = Math.random() * 700;
          return <circle key={`net-${i}`} cx={x} cy={y} r="1.4" fill="#22D3EE" opacity="0.5"
            style={{ animation: `twinkle ${3 + Math.random() * 3}s ease-in-out infinite alternate`, animationDelay: `${Math.random() * 3}s` }}/>;
        })}
      </svg>

      <style>{`
        @keyframes earth-rotate { to { transform: rotate(360deg); } }
        @keyframes moon-orbit { to { transform: rotate(360deg); } }
        @keyframes sat-orbit { to { transform: rotate(-360deg); } }
        @keyframes twinkle { from { opacity: 0.2; } to { opacity: 1; } }
        @keyframes comet { 0% { transform: translate(0,0); opacity: 0; } 5% { opacity: 1; } 100% { transform: translate(2000px, 600px); opacity: 0; } }
      `}</style>
    </div>
  );
}

export default SpaceScene;
