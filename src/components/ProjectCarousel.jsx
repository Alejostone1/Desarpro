// ProjectCarousel — editorial case-study panel. Shows one real project at a
// time with its client, sector, description and outcomes; a horizontal list of
// thumbnails below navigates between projects. No 3D, no icon gimmicks, no
// tech-stack tags. Autoplay pauses on hover/touch and respects reduced motion.

function ProjectCarousel({ projects, onCTA, activeId, onChange }) {
  const t = useTranslations();
  const n = projects && projects.length ? projects.length : 0;
  const viewportRef = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  const go = React.useCallback((dir) => {
    if (n < 2) return;
    setActive((a) => (a + dir + n) % n);
  }, [n]);

  const select = React.useCallback((i) => {
    setActive(((i % n) + n) % n);
  }, [n]);

  // Controlled mode: parent changes activeId (e.g. industry card clicked) →
  // move the panel to that project.
  React.useEffect(() => {
    if (activeId == null || n === 0) return;
    const idx = projects.findIndex((p) => p.id === activeId);
    if (idx >= 0 && idx !== active) setActive(idx);
  }, [activeId, projects, active, n]);

  // Notify parent whenever the selected project changes.
  React.useEffect(() => {
    if (!onChange || n === 0) return;
    const currentId = projects[active] && projects[active].id;
    if (currentId != null && currentId !== activeId) onChange(currentId);
  }, [active, projects, onChange, activeId, n]);

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

  // Autoplay — slow, stops on hover/touch; restarts after every advance.
  React.useEffect(() => {
    if (reduced || paused || n < 2) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % n);
    }, 6500);
    return () => window.clearInterval(id);
  }, [reduced, paused, n, active]);

  // Swipe on the main panel (touch-action: pan-y keeps vertical scrolling native).
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || n < 2) return;
    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
    const onStart = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      startX = touch.clientX; startY = touch.clientY; dx = 0; dy = 0; dragging = true;
      setPaused(true);
    };
    const onMove = (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      if (!touch) return;
      dx = touch.clientX - startX;
      dy = touch.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8 && e.cancelable) e.preventDefault();
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
    el.addEventListener('touchmove', onMove, { passive: true });
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

  const activeProject = projects[active];

  return (
    <div className="pc-root" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Main editorial panel */}
      <div
        ref={viewportRef}
        className="pc-panel"
        role="region"
        aria-roledescription="carrusel"
        aria-label={t('projects_carousel.eyebrow')}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
        }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 22,
          background: 'var(--bg-2)', border: '1px solid var(--glass-border-2)',
          boxShadow: '0 30px 80px -40px rgba(0,0,0,0.6)',
          touchAction: 'pan-y', WebkitTapHighlightColor: 'transparent', outline: 'none',
        }}
      >
        {/* Soft colored wash, purely decorative */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: -120, right: -80, width: 340, height: 340, borderRadius: '50%',
          background: `radial-gradient(circle, ${activeProject.color}26, transparent 70%)`,
          filter: 'blur(46px)', pointerEvents: 'none', transition: 'background 600ms var(--ease-out)',
        }}/>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: -140, left: -100, width: 320, height: 320, borderRadius: '50%',
          background: `radial-gradient(circle, ${activeProject.color}18, transparent 70%)`,
          filter: 'blur(50px)', pointerEvents: 'none', transition: 'background 600ms var(--ease-out)',
        }}/>

        <div key={activeProject.id} className="pc-inner" style={{
          position: 'relative', padding: 'clamp(24px, 4vw, 44px)',
          animation: 'pc-fade 420ms var(--ease-out)',
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)', gap: 'clamp(20px, 3vw, 40px)',
          alignItems: 'start',
        }}>
          {/* Left — the story */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{
                width: 10, height: 10, borderRadius: '50%', background: activeProject.color, flexShrink: 0,
                boxShadow: `0 0 12px ${activeProject.color}`,
              }}/>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: activeProject.color, textTransform: 'uppercase' }}>
                {activeProject.industry}
              </span>
              <span className="pill" style={{ fontSize: 11 }}>{activeProject.year}</span>
              {activeProject.featured && (
                <span className="pill" style={{ fontSize: 10, background: `${activeProject.color}22`, color: activeProject.color, borderColor: `${activeProject.color}44` }}>
                  {t('projects_carousel.featured')}
                </span>
              )}
            </div>

            {activeProject.client ? (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, letterSpacing: '0.04em' }}>
                {t('projects_carousel.client')}: <span style={{ color: 'var(--text-1)', fontWeight: 600 }}>{activeProject.client}</span>
              </div>
            ) : null}

            <h3 style={{
              fontSize: 'clamp(24px, 3.6vw, 40px)', fontWeight: 800, color: 'var(--text-0)',
              letterSpacing: '-0.025em', lineHeight: 1.12, margin: '0 0 16px', fontFamily: 'var(--font-display)',
            }}>{activeProject.title}</h3>

            <p style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.7, margin: '0 0 20px', maxWidth: 640 }}>
              {activeProject.desc}
            </p>

            {activeProject.tags && activeProject.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {activeProject.tags.map((tg, j) => (
                  <span key={j} className="pill" style={{ fontSize: 11 }}>{tg}</span>
                ))}
              </div>
            )}
          </div>

          {/* Right — outcomes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              Resultados
            </div>
            {activeProject.metrics && activeProject.metrics.length > 0 ? (
              <div className="pc-metrics" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {activeProject.metrics.map((m, j) => (
                  <div key={j} className="glass" style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--bg-3)', borderColor: 'var(--glass-border-2)', backdropFilter: 'none' }}>
                    <div style={{ fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 800, color: activeProject.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{m.k}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.4 }}>{m.v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass" style={{ padding: '16px 18px', borderRadius: 14, background: 'var(--bg-3)', borderColor: 'var(--glass-border-2)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Estudio de caso en curso.</div>
              </div>
            )}
            <button onClick={onCTA} className="btn btn-primary" style={{
              justifySelf: 'start', marginTop: 6,
              background: `linear-gradient(135deg, ${activeProject.color}, ${activeProject.color}bb)`,
              boxShadow: `0 8px 30px ${activeProject.color}44`,
            }}>
              {t('projects_carousel.similar')} <Icon.ArrowRight size={14}/>
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pc-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @media (max-width: 860px) {
            .pc-inner { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      {/* Controls */}
      <div className="pc-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18 }}>
        <button
          className="pc-arrow"
          onClick={() => go(-1)}
          aria-label={t('projects_carousel.prev')}
          style={{
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)',
            color: 'var(--text-0)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 220ms var(--ease-out)', fontFamily: 'inherit', fontSize: 20, lineHeight: 1,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg-3)'; e.currentTarget.style.color = 'var(--cyan-bright)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-bg-2)'; e.currentTarget.style.color = 'var(--text-0)'; }}
        >‹</button>

        <div className="pc-dots" role="tablist" aria-label={t('projects_carousel.eyebrow')} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          {projects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => select(i)}
              aria-label={`${p.industry} — ${p.title}`}
              aria-current={i === active}
              style={{
                width: i === active ? 26 : 8, height: 8, borderRadius: 999, cursor: 'pointer',
                padding: 0, border: 'none',
                background: i === active ? `linear-gradient(90deg, ${p.color}, ${p.color}cc)` : 'var(--glass-border-2)',
                boxShadow: i === active ? `0 0 10px ${p.color}88` : 'none',
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
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
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

      {/* Thumbnail strip — human, clickable */}
      <div className="pc-strip" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, marginTop: 18 }}>
        {projects.map((p, i) => (
          <button
            key={p.id}
            onClick={() => select(i)}
            aria-label={`${p.industry} — ${p.title}`}
            aria-current={i === active}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', cursor: 'pointer',
              padding: '12px 14px', borderRadius: 14, fontFamily: 'inherit', color: 'var(--text-0)',
              background: i === active ? 'var(--bg-3)' : 'transparent',
              border: `1px solid ${i === active ? `${p.color}55` : 'var(--glass-border)'}`,
              boxShadow: i === active ? `0 0 0 1px ${p.color}22, 0 10px 24px -18px rgba(0,0,0,0.5)` : 'none',
              transition: 'all 240ms var(--ease-out)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = `${p.color}55`; }}
            onMouseLeave={e => {
              e.currentTarget.style.background = i === active ? 'var(--bg-3)' : 'transparent';
              e.currentTarget.style.borderColor = i === active ? `${p.color}55` : 'var(--glass-border)';
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: p.color, flexShrink: 0, marginTop: 4, boxShadow: `0 0 8px ${p.color}66` }}/>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', color: p.color, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.industry} · {p.year}
              </span>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-0)', lineHeight: 1.3, marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.title}
              </span>
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .pc-panel:focus-visible { outline: 2px solid var(--cyan-bright); outline-offset: 4px; }
        .pc-controls:focus-visible { outline: 2px solid var(--cyan-bright); outline-offset: 4px; border-radius: 999px; }
        .pc-arrow:hover { box-shadow: 0 0 24px rgba(34,211,238,0.35); }
        @media (max-width: 520px) {
          .pc-arrow { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pc-inner { animation-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}

window.ProjectCarousel = ProjectCarousel;
