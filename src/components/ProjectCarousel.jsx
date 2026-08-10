// ProjectCarousel — 3D infinite ribbon showcase for featured projects.
// Center project is the protagonist; side projects recede with depth (scale,
// perspective, opacity). Infinite loop is purely visual (rendered duplicates).
// Autoplay pauses on hover/touch and respects prefers-reduced-motion.

function ProjectCarousel({ projects, onCTA, activeId, onChange }) {
  const t = useTranslations();
  const n = projects && projects.length ? projects.length : 0;
  const viewportRef = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [cardW, setCardW] = React.useState(460);
  const [cardH, setCardH] = React.useState(280);
  const [reduced, setReduced] = React.useState(false);

  const go = React.useCallback((dir) => {
    if (n < 2) return;
    setActive((a) => (a + dir + n) % n);
  }, [n]);

  const select = React.useCallback((i) => {
    setActive((a) => (i % n + n) % n);
  }, [n]);

  // Controlled mode: when the parent changes `activeId` (e.g. an industry card
  // was clicked), move the ribbon to that project.
  React.useEffect(() => {
    if (activeId == null || n === 0) return;
    const idx = projects.findIndex((p) => p.id === activeId);
    if (idx >= 0 && idx !== active) setActive(idx);
  }, [activeId, projects, active, n]);

  // Notify the parent whenever the selected project changes (arrows, autoplay,
  // dots, swipe) so the industries section and parent stay in sync.
  React.useEffect(() => {
    if (!onChange || n === 0) return;
    const currentId = projects[active] && projects[active].id;
    if (currentId != null && currentId !== activeId) onChange(currentId);
  }, [active, projects, onChange, activeId, n]);

  // Measure viewport → card size + gap (responsive from 320px → 1920px)
  React.useEffect(() => {
    const measure = () => {
      const el = viewportRef.current;
      if (!el) return;
      const w = el.clientWidth || 400;
      setCardW(Math.min(520, Math.max(250, w - 24)));
      setCardH(Math.min(320, Math.max(220, Math.round(Math.min(w, 520) * 0.58))));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // prefers-reduced-motion
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Autoplay — slow, elegant; restarts after every advance/interaction
  React.useEffect(() => {
    if (reduced || paused || n < 2) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % n);
    }, 5200);
    return () => window.clearInterval(id);
  }, [reduced, paused, n, active]);

  // Swipe (native, non-passive so we can cancel horizontal drags)
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || n < 2) return;
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
    const onStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX; startY = touch.clientY; dx = 0; dy = 0; dragging = true;
      setPaused(true);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      dx = touch.clientX - startX;
      dy = touch.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) e.preventDefault();
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) go(1); else go(-1);
      }
      setPaused(false);
      dx = 0; dy = 0;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [n, go]);

  if (n === 0) return null;

  const COPIES = 7;          // visual duplicates only — data is untouched
  const HALF = 4;            // slides rendered on each side
  const N = n * COPIES;
  const baseStart = Math.floor((COPIES - 1) / 2) * n;
  const baseIndex = baseStart + active;
  const gap = Math.round(cardW * 0.6);

  const scaleOf = (d) => { const a = Math.abs(d); return a === 0 ? 1 : a === 1 ? 0.82 : a === 2 ? 0.66 : a === 3 ? 0.54 : 0.44; };
  const opacityOf = (d) => { const a = Math.abs(d); return a === 0 ? 1 : a === 1 ? 0.94 : a === 2 ? 0.62 : a === 3 ? 0.32 : 0.16; };
  const zOf = (d) => -Math.abs(d) * 70;
  const rotOf = (d) => d * -30;

  const slides = [];
  for (let d = -HALF; d <= HALF; d++) {
    const idx = baseIndex + d;
    if (idx < 0 || idx >= N) continue;
    const projIdx = ((idx % n) + n) % n;
    slides.push({ d, idx, p: projects[projIdx], projIdx });
  }

  const activeProject = projects[active];

  return (
    <div className="pc-root" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Ribbon */}
      <div
        ref={viewportRef}
        className="pc-viewport"
        role="region"
        aria-roledescription="carrusel"
        aria-label={t('projects_carousel.eyebrow')}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        }}
        tabIndex={0}
        style={{
          position: 'relative', height: cardH + 96,
          perspective: '1500px', overflow: 'hidden',
          WebkitTapHighlightColor: 'transparent', outline: 'none',
        }}
      >
        {/* Ambient stage glow */}
        <div aria-hidden="true" style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: cardW * 1.4, height: cardH * 1.5, pointerEvents: 'none',
          background: 'radial-gradient(circle, var(--pc-glow, rgba(34,211,238,0.16)), transparent 65%)',
          filter: 'blur(34px)', transition: 'background 500ms var(--ease-out)',
        }}/>
        {/* Floor */}
        <div aria-hidden="true" className="pc-floor" style={{
          position: 'absolute', left: '50%', bottom: 8, transform: 'translateX(-50%)',
          width: cardW * 1.6, height: 26, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.18), transparent 70%)',
          filter: 'blur(10px)',
        }}/>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d' }}>
          {slides.map(({ d, idx, p }) => {
            const isCenter = d === 0;
            const I = Icon[p.icon] || Icon.Folder;
            return (
              <div
                key={idx}
                className={`pc-slide${isCenter ? ' is-center' : ''}`}
                style={{
                  position: 'absolute', top: 40, left: '50%',
                  width: cardW, height: cardH,
                  transform: `translate(-50%, 0) translate3d(${d * gap}px, 0, ${zOf(d)}px) rotateY(${rotOf(d)}deg) scale(${scaleOf(d)})`,
                  opacity: opacityOf(d),
                  zIndex: isCenter ? 50 : 40 - Math.abs(d) * 6,
                  transition: 'transform 640ms var(--ease-out), opacity 640ms var(--ease-out), box-shadow 400ms var(--ease-out)',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                }}
              >
                {isCenter ? (
                  <div className="pc-card pc-card--center" aria-current="true" style={{
                    width: '100%', height: '100%', borderRadius: 20,
                    background: 'linear-gradient(160deg, var(--bg-3), var(--bg-2))',
                    border: `1px solid ${p.color}66`,
                    boxShadow: `0 30px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 46px ${p.color}35`,
                    display: 'flex', flexDirection: 'column',
                    padding: 'clamp(18px, 3vw, 28px)',
                    overflow: 'hidden', position: 'relative',
                  }}>
                    <div aria-hidden="true" style={{
                      position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%',
                      background: `radial-gradient(circle, ${p.color}45, transparent 70%)`, filter: 'blur(30px)',
                    }}/>
                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        <span style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: `${p.color}26`, color: p.color, flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          border: `1px solid ${p.color}50`,
                        }}><I size={22}/></span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: p.color, textTransform: 'uppercase',
                        }}>{p.industry}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· {p.year}</span>
                        {p.featured && (
                        <span className="pc-featured" style={{
                          marginLeft: 'auto', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
                          textTransform: 'uppercase', color: '#fff', padding: '5px 10px', borderRadius: 999,
                          background: `linear-gradient(135deg, ${p.color}, ${p.color}bb)`,
                          boxShadow: `0 4px 18px ${p.color}66`,
                        }}>{t('projects_carousel.featured')}</span>
                        )}
                      </div>
                      <h3 style={{
                        fontSize: 'clamp(19px, 2.6vw, 25px)', fontWeight: 800, color: 'var(--text-0)',
                        letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0, fontFamily: 'var(--font-display)',
                      }}>{p.title}</h3>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>{t('projects_carousel.client')}: {p.client}</div>
                      <p style={{
                        fontSize: 14, color: 'var(--text-1)', lineHeight: 1.55, margin: '12px 0 0',
                        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{p.desc}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => select(projIdx)}
                    className="pc-card pc-card--side"
                    aria-label={`${p.industry} — ${p.title}`}
                    style={{
                      width: '100%', height: '100%', borderRadius: 18,
                      background: 'linear-gradient(160deg, var(--bg-2), var(--bg-1))',
                      border: `1px solid var(--glass-border-2)`,
                      color: 'var(--text-0)', cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left',
                      padding: 'clamp(16px, 2.6vw, 24px)', overflow: 'hidden', position: 'relative',
                    }}
                  >
                    <span style={{
                      width: 40, height: 40, borderRadius: 11, marginBottom: 12,
                      background: `${p.color}24`, color: p.color,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      border: `1px solid ${p.color}40`, flexShrink: 0,
                    }}><I size={19}/></span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: p.color, textTransform: 'uppercase' }}>{p.industry}</span>
                    <span style={{
                      fontSize: 16, fontWeight: 700, color: 'var(--text-0)', lineHeight: 1.2, letterSpacing: '-0.01em', marginTop: 6,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{p.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 'auto', paddingTop: 8 }}>{p.year}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="pc-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 10 }}>
        <button
          className="pc-arrow"
          onClick={() => go(-1)}
          aria-label={t('projects_carousel.prev')}
          style={{
            width: 46, height: 46, borderRadius: '50%', cursor: 'pointer',
            background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)',
            color: 'var(--text-0)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 220ms var(--ease-out)', fontFamily: 'inherit', fontSize: 20, lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-3)'; e.currentTarget.style.color = 'var(--cyan-bright)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-2)'; e.currentTarget.style.color = 'var(--text-0)'; }}
        >‹</button>
        <div className="pc-dots" role="tablist" aria-label={t('projects_carousel.eyebrow')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => select(i)}
              aria-label={`${p.industry} — ${p.title}`}
              aria-current={i === active}
              style={{
                width: i === active ? 28 : 9, height: 9, borderRadius: 999, cursor: 'pointer',
                padding: 0, border: 'none',
                background: i === active ? `linear-gradient(90deg, ${p.color}, ${p.color}cc)` : 'var(--glass-border-2)',
                boxShadow: i === active ? `0 0 12px ${p.color}88` : 'none',
                transition: 'all 360ms var(--ease-out)',
              }}
            />
          ))}
        </div>
        <button
          className="pc-arrow"
          onClick={() => go(1)}
          aria-label={t('projects_carousel.next')}
          style={{
            width: 46, height: 46, borderRadius: '50%', cursor: 'pointer',
            background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)',
            color: 'var(--text-0)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 220ms var(--ease-out)', fontFamily: 'inherit', fontSize: 20, lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-3)'; e.currentTarget.style.color = 'var(--cyan-bright)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-2)'; e.currentTarget.style.color = 'var(--text-0)'; }}
        >›</button>
        <span aria-hidden="true" className="pc-position" style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)',
        }}>{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
      </div>

      {/* Details panel — updates with the selected project */}
      <div key={activeProject.id} className="pc-details" style={{ animation: 'pc-detail-in 460ms var(--ease-out)' }}>
        <div className="pc-details-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', color: activeProject.color, textTransform: 'uppercase' }}>{activeProject.industry}</span>
              <span className="pill" style={{ fontSize: 11 }}>{activeProject.year}</span>
            </div>
            <h3 style={{
              fontSize: 'clamp(24px, 3.4vw, 36px)', fontWeight: 800, color: 'var(--text-0)',
              letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 14px', fontFamily: 'var(--font-display)',
            }}>{activeProject.title}</h3>
            <p style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.65, margin: '0 0 20px', maxWidth: 640 }}>{activeProject.desc}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeProject.tags.map((tg, j) => (
                <span key={j} className="pill" style={{ fontSize: 11 }}>{tg}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="pc-metrics">
              {activeProject.metrics.map((m, j) => (
                <div key={j} className="glass" style={{ padding: '18px 20px', borderRadius: 16 }}>
                  <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: activeProject.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.k}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.35 }}>{m.v}</div>
                </div>
              ))}
            </div>
            <button onClick={onCTA} className="btn btn-primary" style={{ justifySelf: 'start', background: `linear-gradient(135deg, ${activeProject.color}, ${activeProject.color}bb)`, boxShadow: `0 8px 30px ${activeProject.color}55` }}>
              {t('projects_carousel.similar')} <Icon.ArrowRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pc-detail-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .pc-card--side { transition: transform 300ms var(--ease-out), box-shadow 300ms var(--ease-out), border-color 300ms !important; }
        .pc-card--side:hover { transform: translateY(-6px) !important; border-color: var(--glass-border-3) !important; box-shadow: 0 24px 60px -24px rgba(0,0,0,0.5); }
        .pc-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .pc-metrics .glass { background: var(--bg-3); border-color: var(--glass-border-2); backdrop-filter: none; -webkit-backdrop-filter: none; }
        .pc-details { margin-top: 34px; background: var(--bg-2); border: 1px solid var(--glass-border-2); border-radius: 22px; padding: clamp(22px, 4vw, 36px); }
        .pc-details-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px; align-items: start; }
        .pc-controls:focus-visible { outline: 2px solid var(--cyan-bright); outline-offset: 4px; border-radius: 999px; }
        .pc-viewport:focus-visible { outline: 2px solid var(--cyan-bright); outline-offset: 6px; border-radius: 24px; }
        .pc-arrow:hover { box-shadow: 0 0 24px rgba(34,211,238,0.35); }
        @media (max-width: 860px) {
          .pc-details-grid { grid-template-columns: 1fr; gap: 24px; }
        }
        @media (max-width: 520px) {
          .pc-arrow { display: none !important; }
        }
        @media (max-width: 420px) {
          .pc-metrics { grid-template-columns: 1fr; gap: 10px; }
        }
        [data-theme="light"] .pc-floor { background: radial-gradient(ellipse at center, rgba(15,23,42,0.14), transparent 70%) !important; }
        [data-theme="light"] .pc-card--center { box-shadow: 0 24px 60px -24px rgba(15,23,42,0.35), 0 0 0 1px rgba(15,23,42,0.05) inset, 0 0 40px rgba(6,182,212,0.18) !important; }
        [data-theme="light"] .pc-card--center { background: linear-gradient(160deg, #FFFFFF, #F1F4FA) !important; }
        [data-theme="light"] .pc-card--side { background: linear-gradient(160deg, #F1F4FA, #FFFFFF) !important; }
        [data-theme="light"] .pc-details { background: var(--bg-1); }
        [data-theme="light"] .pc-metrics .glass { background: #FFFFFF; }
        @media (prefers-reduced-motion: reduce) {
          .pc-slide { transition-duration: 0.01ms !important; }
          .pc-details { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

window.ProjectCarousel = ProjectCarousel;
