// ContactScene — animated illustrated character at a desk with laptop.
// 100% inline SVG + state-driven CSS animations. Form is rendered on top of the laptop screen.

import React from 'react';

function ContactScene({ formState }) {
  // formState: 'idle' | 'focused' | 'submitting' | 'success'
  const focused = formState === 'focused' || formState === 'submitting';
  const success = formState === 'success';

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 980, margin: '0 auto', aspectRatio: '16 / 11' }}>
      {/* Floor reflection */}
      <svg viewBox="0 0 800 550" width="100%" height="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A0B14" stopOpacity="0"/>
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.15"/>
          </linearGradient>
          <radialGradient id="aura" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity={focused ? 0.4 : 0.15}/>
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="laptop-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F172A"/>
            <stop offset="100%" stopColor="#020617"/>
          </linearGradient>
        </defs>

        {/* Aura behind */}
        <ellipse cx="400" cy="260" rx="380" ry="200" fill="url(#aura)" style={{ transition: 'opacity 600ms' }}/>

        {/* Floor */}
        <rect x="0" y="450" width="800" height="100" fill="url(#floor)"/>

        {/* Floating decorative dots */}
        {[
          { cx: 80, cy: 120, r: 6, c: '#A78BFA', d: 0 },
          { cx: 720, cy: 100, r: 8, c: '#F59E0B', d: 1 },
          { cx: 700, cy: 360, r: 5, c: '#EC4899', d: 2 },
          { cx: 90, cy: 380, r: 7, c: '#06B6D4', d: 1.5 },
          { cx: 130, cy: 240, r: 4, c: '#3B82F6', d: 0.5 },
        ].map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.c}
            style={{ animation: `cs-bob ${3 + d.d}s ease-in-out infinite alternate`, animationDelay: `${d.d}s`, opacity: 0.8 }}/>
        ))}

        {/* Plant */}
        <g transform="translate(60 290)">
          <rect x="-25" y="100" width="50" height="60" rx="6" fill="#7C3AED"/>
          <g style={{ transformOrigin: '0 100px', animation: 'cs-sway 4s ease-in-out infinite alternate' }}>
            <path d="M 0 100 Q -30 60 -25 10 Q -15 30 -10 70 Z" fill="#10B981"/>
            <path d="M 0 100 Q 30 50 35 0 Q 20 25 15 75 Z" fill="#059669"/>
            <path d="M 0 100 Q -10 40 0 -10 Q 10 40 0 100 Z" fill="#34D399"/>
          </g>
        </g>

        {/* Coffee mug w/ steam */}
        <g transform="translate(640 380)">
          <path d="M -20 0 h 40 v 30 a 5 5 0 0 1 -5 5 h -30 a 5 5 0 0 1 -5 -5 z" fill="#F59E0B"/>
          <path d="M 20 8 a 8 8 0 0 1 0 16" stroke="#F59E0B" strokeWidth="4" fill="none"/>
          <ellipse cx="0" cy="0" rx="20" ry="4" fill="#1C1917"/>
          {/* steam */}
          {[0, 1, 2].map(i => (
            <path key={i} d={`M ${-8 + i * 8} -10 Q ${-4 + i * 8} -25 ${-8 + i * 8} -40`} stroke="#fff" strokeOpacity="0.4" strokeWidth="2.5" fill="none" strokeLinecap="round"
              style={{ animation: `cs-steam 2.4s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}/>
          ))}
        </g>

        {/* Desk */}
        <rect x="180" y="430" width="500" height="14" rx="3" fill="#1E293B"/>
        <rect x="200" y="444" width="6" height="60" fill="#0F172A"/>
        <rect x="654" y="444" width="6" height="60" fill="#0F172A"/>

        {/* CHARACTER — sitting on the floor cross-legged behind/beside the desk */}
        <g transform="translate(280 250)" style={{ animation: 'cs-breathe 3s ease-in-out infinite alternate', transformOrigin: '0 100px' }}>
          {/* Legs / pants */}
          <ellipse cx="0" cy="180" rx="80" ry="22" fill="#0F172A"/>
          <path d="M -60 160 Q -75 175 -55 188 L -10 188 L -10 160 Z" fill="#1E293B"/>
          <path d="M 60 160 Q 75 175 55 188 L 10 188 L 10 160 Z" fill="#1E293B"/>
          {/* Shoes */}
          <ellipse cx="-55" cy="190" rx="20" ry="6" fill="#78350F"/>
          <ellipse cx="55" cy="190" rx="20" ry="6" fill="#78350F"/>

          {/* Torso — green hoodie */}
          <path d="M -45 60 Q -50 100 -40 160 L 40 160 Q 50 100 45 60 Q 30 50 0 50 Q -30 50 -45 60 Z" fill="#10B981"/>
          <path d="M -20 50 Q 0 80 20 50" stroke="#059669" strokeWidth="2" fill="none"/>

          {/* Arms reaching to laptop */}
          <path d="M -40 90 Q -70 110 -75 145 Q -65 150 -50 130 Z" fill="#10B981"/>
          <path d="M 40 90 Q 70 110 75 145 Q 65 150 50 130 Z" fill="#10B981"/>
          {/* Hands */}
          <circle cx="-72" cy="148" r="9" fill="#FBBF24"/>
          <circle cx="72" cy="148" r="9" fill="#FBBF24"/>

          {/* Neck */}
          <rect x="-8" y="36" width="16" height="20" fill="#FBBF24"/>

          {/* Head */}
          <ellipse cx="0" cy="20" rx="32" ry="36" fill="#FBBF24"/>
          {/* Hair */}
          <path d="M -32 8 Q -28 -22 0 -18 Q 28 -22 32 8 Q 30 -2 20 -8 Q 10 -2 0 -6 Q -10 -2 -20 -8 Q -30 -2 -32 8 Z" fill="#1C1917"/>
          {/* Glasses */}
          <circle cx="-12" cy="22" r="8" fill="none" stroke="#1C1917" strokeWidth="2.2"/>
          <circle cx="12" cy="22" r="8" fill="none" stroke="#1C1917" strokeWidth="2.2"/>
          <line x1="-4" y1="22" x2="4" y2="22" stroke="#1C1917" strokeWidth="2.2"/>
          {/* Eyes (when looking at form) */}
          <circle cx={focused ? -12 : -13} cy="22" r="2" fill="#0F172A" style={{ transition: 'all 300ms' }}/>
          <circle cx={focused ? 12 : 11} cy="22" r="2" fill="#0F172A" style={{ transition: 'all 300ms' }}/>
          {/* Mouth — smiles when success */}
          {success ? (
            <path d="M -8 36 Q 0 44 8 36" stroke="#1C1917" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          ) : (
            <path d="M -5 36 Q 0 39 5 36" stroke="#1C1917" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          )}
          {/* Cheek blush */}
          <ellipse cx="-22" cy="32" rx="4" ry="2" fill="#F472B6" opacity="0.5"/>
          <ellipse cx="22" cy="32" rx="4" ry="2" fill="#F472B6" opacity="0.5"/>

          {/* Thumbs up gesture when success */}
          {success && (
            <g style={{ animation: 'cs-thumb 600ms cubic-bezier(0.16,1,0.3,1)' }}>
              <path d="M 80 130 L 80 95 a 6 6 0 0 1 12 0 L 92 130 z" fill="#FBBF24"/>
            </g>
          )}
        </g>

        {/* LAPTOP on desk */}
        <g transform="translate(400 380)">
          {/* Base */}
          <path d="M -160 50 L 160 50 L 175 60 L -175 60 Z" fill="#334155"/>
          <rect x="-160" y="48" width="320" height="4" fill="#1E293B"/>
          {/* Screen tilt */}
          <g style={{ transformOrigin: '0 50px', transform: focused ? 'rotateX(0deg)' : 'rotateX(-5deg)', transition: 'transform 800ms var(--ease-out)' }}>
            <rect x="-150" y="-110" width="300" height="160" rx="6" fill="#1E293B"/>
            <rect x="-142" y="-102" width="284" height="144" rx="3" fill="url(#laptop-screen)"/>
            {/* Screen content placeholder — actual form rendered via HTML overlay */}
          </g>
        </g>
      </svg>

      <style>{`
        @keyframes cs-bob { from { transform: translateY(0); } to { transform: translateY(-12px); } }
        @keyframes cs-sway { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } }
        @keyframes cs-steam { 0% { opacity: 0; transform: translateY(0); } 50% { opacity: 0.6; } 100% { opacity: 0; transform: translateY(-15px); } }
        @keyframes cs-breathe { from { transform: translateY(0); } to { transform: translateY(-2px); } }
        @keyframes cs-thumb { from { transform: translate(-10px, 10px) rotate(-30deg); opacity: 0; } to { transform: translate(0,0) rotate(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default ContactScene;
