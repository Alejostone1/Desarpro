// HoloAssistant — a holographic AI avatar (geometric humanoid) rendered with animated
// SVG + canvas particle system. Stands beside the form, reacts to form state.

function HoloAssistant({
  formState = 'idle',
  assistantState = 'idle',
  activeField = null,
  mousePosition = { x: 0.5, y: 0.45 },
  typing = false,
  hudMessage = 'DESARPRO AI',
  reducedMotion = false,
}) {
  const focused = formState === 'focused' || formState === 'typing' || assistantState === 'listening' || assistantState === 'processing' || assistantState === 'typing';
  const submitting = formState === 'submitting' || assistantState === 'processing';
  const success = formState === 'success' || assistantState === 'success';
  const error = formState === 'error' || assistantState === 'error';
  const listening = assistantState === 'listening';
  const processing = assistantState === 'processing' || assistantState === 'typing';

  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let w, h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const particleCount = reducedMotion ? 28 : 56;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * (reducedMotion ? 0.00028 : 0.0006),
      vy: -Math.random() * (reducedMotion ? 0.0005 : 0.0009) - 0.0002,
      r: Math.random() * 1.4 + 0.4,
      hue: Math.random() > 0.6 ? 'violet' : 'cyan',
      life: Math.random(),
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.0024;
        if (p.y < -0.05 || p.x < -0.05 || p.x > 1.05) {
          p.x = Math.random();
          p.y = 1.05;
          p.life = 0;
        }
        const alpha = Math.sin(Math.min(1, p.life) * Math.PI) * (reducedMotion ? 0.35 : 0.7);
        ctx.fillStyle = p.hue === 'cyan' ? `rgba(34,211,238,${alpha})` : `rgba(167,139,250,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reducedMotion]);

  const headTilt = reducedMotion ? 0 : (listening ? -1.8 : (processing ? -1.2 : (focused ? -0.8 : 0)));
  const bodyShift = reducedMotion ? 0 : (mousePosition.x - 0.5) * 2.4;
  const bodyLean = reducedMotion ? 0 : ((mousePosition.y - 0.45) * 4.5);

  return (
    <div className="holo-stage" style={{
      position: 'relative', width: '100%',
      aspectRatio: '4 / 5',
      maxWidth: 520, margin: '0 auto',
      overflow: 'hidden',
      borderRadius: 24,
      background: 'linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(2,6,23,0.9) 100%), radial-gradient(circle at 50% 0%, rgba(34,211,238,0.15), transparent 60%)',
      border: '1px solid rgba(34,211,238,0.3)',
      backdropFilter: 'blur(20px)',
      transform: `translate3d(${bodyShift * 0.08}px, ${bodyLean * 0.05}px, 0)`,
      transition: 'transform 220ms ease-out, box-shadow 400ms ease-out',
      boxShadow: focused ? '0 0 60px rgba(34,211,238,0.4), inset 0 0 80px rgba(34,211,238,0.1)' : '0 0 40px rgba(34,211,238,0.2), inset 0 0 60px rgba(34,211,238,0.05)',
    }}>
      {/* Background grid floor */}
      <svg viewBox="0 0 400 500" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" style={{ position: 'absolute', inset: 0, display: 'block' }}>
        <defs>
          {/* Holographic grad for figure */}
          <linearGradient id="holo-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.95"/>
            <stop offset="55%" stopColor="#3B82F6" stopOpacity="0.85"/>
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.7"/>
          </linearGradient>
          <linearGradient id="holo-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A5F3FC"/>
            <stop offset="100%" stopColor="#67E8F9"/>
          </linearGradient>
          <radialGradient id="halo-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.55"/>
            <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="success-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#34D399" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="floor-grid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0"/>
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.4"/>
          </linearGradient>
          <filter id="figure-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Holographic floor grid */}
        <g opacity="0.4">
          {/* Horizontal lines (perspective) */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
            const y = 380 + i * 16;
            const x1 = 200 - (i + 1) * 24;
            const x2 = 200 + (i + 1) * 24;
            return <line key={`h${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke="url(#floor-grid)" strokeWidth="0.6"/>;
          })}
          {/* Vertical converging lines */}
          {Array.from({ length: 9 }).map((_, i) => {
            const offset = (i - 4) * 28;
            return <line key={`v${i}`} x1={200 + offset} y1={380} x2={200 + offset * 2.4} y2={500} stroke="url(#floor-grid)" strokeWidth="0.6"/>;
          })}
        </g>

        {/* Halo behind figure */}
        <circle cx="200" cy="200" r="160" fill="url(#halo-glow)" style={{ animation: reducedMotion ? 'none' : 'halo-pulse 4s ease-in-out infinite alternate' }}/>

        {/* Holographic ground ring (under feet) */}
        <ellipse cx="200" cy="395" rx="80" ry="14" fill="none" stroke="#22D3EE" strokeWidth="1.4" opacity="0.6">
          <animate attributeName="rx" values="80;90;80" dur="3s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="200" cy="395" rx="55" ry="9" fill="none" stroke="#22D3EE" strokeWidth="1" opacity="0.5">
          <animate attributeName="rx" values="55;48;55" dur="2.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="200" cy="395" rx="100" ry="18" fill="rgba(34, 211, 238, 0.08)"/>

        {/* === HUMANOID FIGURE === */}
        <g filter="url(#figure-glow)" style={{ animation: reducedMotion ? 'none' : 'holo-breathe 3.4s ease-in-out infinite alternate', transform: `translateX(${bodyShift * 0.6}px) translateY(${bodyLean * 0.2}px)` }}>
          {/* Body silhouette — clean geometric humanoid */}

          {/* HEAD */}
          <g style={{ transformOrigin: '200px 130px', transform: `rotate(${headTilt + (focused ? -1.2 : 0)}deg)`, transition: 'transform 600ms var(--ease-out)' }}>
            {/* Helmet outer */}
            <path d="M 178 110
                     Q 178 88 200 88
                     Q 222 88 222 110
                     L 222 142
                     Q 222 152 215 154
                     L 185 154
                     Q 178 152 178 142 Z" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1.2"/>
            {/* Visor */}
            <path d="M 184 116 Q 200 110 216 116 L 216 134 Q 200 138 184 134 Z"
                  fill="#0F172A" stroke="#A5F3FC" strokeWidth="0.8"/>
            {/* Visor reflection */}
            <path d="M 186 118 Q 200 113 214 118 L 214 124 Q 200 128 186 124 Z"
                  fill="rgba(34, 211, 238, 0.35)"/>
            {/* Glowing "eyes" */}
            {!success ? (
              <>
                <circle cx="192" cy="124" r={listening ? 1.9 : 1.6} fill="#A5F3FC">
                  <animate attributeName="opacity" values={listening ? '0.7;1;0.7' : '0.6;1;0.6'} dur={listening ? '1.4s' : '2.2s'} repeatCount="indefinite"/>
                </circle>
                <circle cx="208" cy="124" r={listening ? 1.9 : 1.6} fill="#A5F3FC">
                  <animate attributeName="opacity" values={listening ? '0.7;1;0.7' : '0.6;1;0.6'} dur={listening ? '1.4s' : '2.2s'} repeatCount="indefinite" begin="0.3s"/>
                </circle>
              </>
            ) : (
              <>
                {/* Smile-like curve when success */}
                <path d="M 188 123 Q 192 127 196 123" stroke="#34D399" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                <path d="M 204 123 Q 208 127 212 123" stroke="#34D399" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              </>
            )}
            {/* Antenna node on top */}
            <line x1="200" y1="88" x2="200" y2="76" stroke="#22D3EE" strokeWidth="1.6"/>
            <circle cx="200" cy="74" r="3.2" fill="#22D3EE">
              <animate attributeName="r" values="3;4;3" dur="1.4s" repeatCount="indefinite"/>
              <animate attributeName="fill-opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite"/>
            </circle>
            {/* Side panel "ears" */}
            <rect x="174" y="116" width="6" height="14" rx="2" fill="#22D3EE" opacity="0.7"/>
            <rect x="220" y="116" width="6" height="14" rx="2" fill="#22D3EE" opacity="0.7"/>
          </g>

          {/* NECK */}
          <rect x="194" y="154" width="12" height="10" fill="url(#holo-body)" opacity="0.85"/>

          {/* TORSO — geometric chest piece */}
          <path d="M 168 168
                   Q 200 162 232 168
                   L 234 240
                   Q 232 254 220 256
                   L 180 256
                   Q 168 254 166 240 Z"
                fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1.2"/>

          {/* Chest core indicator (pulses, indicates state) */}
          <g transform="translate(200 200)">
            <circle r="14" fill="rgba(15, 23, 42, 0.9)" stroke={success ? '#34D399' : (error ? '#F59E0B' : '#22D3EE')} strokeWidth="1.4"/>
            <circle r={success ? 9 : (submitting ? 7 : focused ? 8 : 6)}
                    fill={success ? '#34D399' : (error ? '#F59E0B' : (submitting ? '#A78BFA' : '#22D3EE'))}
                    opacity="0.85"
                    style={{ transition: 'r 320ms var(--ease-spring), fill 240ms' }}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur={submitting ? '0.6s' : '1.8s'} repeatCount="indefinite"/>
            </circle>
            {/* Inner rotating ring */}
            <g style={{ animation: 'spin-slow 6s linear infinite', transformOrigin: '0 0' }}>
              <circle r="11" fill="none" stroke={success ? '#34D399' : '#22D3EE'} strokeWidth="0.8" strokeDasharray="4 2" opacity="0.6"/>
            </g>
          </g>

          {/* Chest detail strips */}
          <line x1="178" y1="220" x2="190" y2="220" stroke="#A5F3FC" strokeWidth="1" opacity="0.7"/>
          <line x1="210" y1="220" x2="222" y2="220" stroke="#A5F3FC" strokeWidth="1" opacity="0.7"/>
          <line x1="178" y1="232" x2="186" y2="232" stroke="#A5F3FC" strokeWidth="1" opacity="0.7"/>
          <line x1="214" y1="232" x2="222" y2="232" stroke="#A5F3FC" strokeWidth="1" opacity="0.7"/>

          {/* SHOULDERS */}
          <ellipse cx="166" cy="174" rx="14" ry="10" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
          <ellipse cx="234" cy="174" rx="14" ry="10" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>

          {/* ARMS — animated subtly when focused */}
          {/* Left arm */}
          <g style={{ transformOrigin: '166px 174px', animation: reducedMotion ? 'none' : (focused ? 'arm-wave-l 1.4s ease-in-out infinite alternate' : 'arm-rest-l 4s ease-in-out infinite alternate') }}>
            <rect x="156" y="180" width="20" height="40" rx="8" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
            {/* Forearm */}
            <rect x="158" y="218" width="18" height="44" rx="7" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
            {/* Hand */}
            <circle cx="167" cy="266" r="8" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
          </g>
          {/* Right arm — gestures toward form when focused */}
          <g style={{ transformOrigin: '234px 174px', animation: reducedMotion ? 'none' : (focused ? 'arm-gesture 1.8s ease-in-out infinite alternate' : 'arm-rest-r 4s ease-in-out infinite alternate') }}>
            <rect x="224" y="180" width="20" height="40" rx="8" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
            <rect x="224" y="218" width="18" height="44" rx="7" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
            <circle cx="233" cy="266" r="8" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
            {/* Holographic light emerging from hand when focused */}
            {focused && (
              <g style={{ animation: 'hand-light 1s ease-in-out infinite alternate' }}>
                <circle cx="233" cy="266" r="14" fill="rgba(34,211,238,0.35)"/>
                <circle cx="233" cy="266" r="22" fill="rgba(34,211,238,0.15)"/>
              </g>
            )}
          </g>

          {/* LOWER BODY / WAIST */}
          <path d="M 174 256 L 226 256 L 230 290 L 170 290 Z" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
          {/* Belt indicator */}
          <line x1="174" y1="270" x2="226" y2="270" stroke="#A5F3FC" strokeWidth="1.2" opacity="0.7"/>

          {/* LEGS */}
          <path d="M 174 290 L 192 290 L 190 380 L 178 380 Z" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
          <path d="M 226 290 L 208 290 L 210 380 L 222 380 Z" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>

          {/* Knee joints */}
          <circle cx="184" cy="335" r="3.6" fill="#A5F3FC" opacity="0.85"/>
          <circle cx="216" cy="335" r="3.6" fill="#A5F3FC" opacity="0.85"/>
          {/* Feet */}
          <ellipse cx="184" cy="385" rx="11" ry="5" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
          <ellipse cx="216" cy="385" rx="11" ry="5" fill="url(#holo-body)" stroke="url(#holo-rim)" strokeWidth="1"/>
        </g>

        {/* Holographic data stream from hand to off-canvas form (right) — visible when focused */}
        {focused && (
          <g opacity="0.7">
            <line x1="245" y1="266" x2="400" y2="240" stroke="#22D3EE" strokeWidth="1" strokeDasharray="3 4">
              <animate attributeName="stroke-dashoffset" values="0;-14" dur="0.6s" repeatCount="indefinite"/>
            </line>
            <circle cx="320" cy="253" r="2.2" fill="#A5F3FC">
              <animate attributeName="cx" values="245;400;245" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="cy" values="266;240;266" dur="2s" repeatCount="indefinite"/>
            </circle>
          </g>
        )}

        {/* Success burst */}
        {success && (
          <g style={{ transformOrigin: '200px 200px' }}>
            <circle cx="200" cy="200" r="160" fill="url(#success-glow)" style={{ animation: 'success-pulse 1s ease-out' }}/>
            {/* Confetti dots */}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2;
              const cx = 200 + Math.cos(angle) * 90;
              const cy = 200 + Math.sin(angle) * 90;
              return <circle key={i} cx={cx} cy={cy} r="3" fill={i % 2 ? '#34D399' : '#22D3EE'}
                             style={{ animation: 'confetti-pop 700ms ease-out' }}/>;
            })}
          </g>
        )}
      </svg>

      {/* Particle canvas overlay (foreground motes) */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}/>

      {/* Status label */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 14,
        textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: 'rgba(2, 6, 23, 0.6)',
            border: `1px solid ${success ? 'rgba(52, 211, 153, 0.6)' : (error ? 'rgba(245, 158, 11, 0.45)' : 'rgba(34, 211, 238, 0.45)')}`,
            backdropFilter: 'blur(6px)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: success ? '#A7F3D0' : (error ? '#FDE68A' : (submitting ? '#DDD6FE' : '#A5F3FC')),
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: success ? '#34D399' : (error ? '#F59E0B' : (submitting ? '#A78BFA' : '#22D3EE')),
              boxShadow: `0 0 8px ${success ? '#34D399' : (error ? '#F59E0B' : (submitting ? '#A78BFA' : '#22D3EE'))}`,
              animation: 'pulse 2s ease-in-out infinite',
            }}/>
            {success ? 'Mensaje enviado' : (error ? 'Revisemos los datos' : (submitting ? 'Procesando...' : (focused ? 'Escuchando' : 'Asistente DesarPro · Online')))}
          </span>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(7, 11, 23, 0.72)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.78)',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
            backdropFilter: 'blur(6px)',
          }}>{hudMessage}</span>
        </div>
      </div>

      <style>{`
        @keyframes halo-pulse { from { opacity: 0.55; transform: scale(1); } to { opacity: 0.85; transform: scale(1.05); } }
        @keyframes holo-breathe { from { transform: translateY(0); } to { transform: translateY(-4px); } }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes arm-rest-l { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
        @keyframes arm-rest-r { from { transform: rotate(2deg); } to { transform: rotate(-2deg); } }
        @keyframes arm-wave-l { from { transform: rotate(-4deg); } to { transform: rotate(0deg); } }
        @keyframes arm-gesture { from { transform: rotate(-18deg) translateX(-4px); } to { transform: rotate(-26deg) translateX(-6px); } }
        @keyframes hand-light { from { opacity: 0.5; } to { opacity: 1; } }
        @keyframes success-pulse { from { transform: scale(0.4); opacity: 1; } to { transform: scale(1.4); opacity: 0; } }
        @keyframes confetti-pop {
          from { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.4); opacity: 1; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

window.HoloAssistant = HoloAssistant;
