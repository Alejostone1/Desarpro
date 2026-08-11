// HomeCta — editorial closing statement with subtle draw-in animation.

import React from 'react';
import { Editable } from '../lib/admin.jsx';
import { Reveal } from '../lib/anim.jsx';
import Icon from '../lib/icons.jsx';

function HomeCta({ t, setRoute }) {
  const sectionRef = React.useRef(null);
  const [lineDrawn, setLineDrawn] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { setLineDrawn(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLineDrawn(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="home-cta" aria-labelledby="home-cta-heading">
      <div className={`home-cta-rule home-cta-rule--top${lineDrawn ? ' is-drawn' : ''}`} aria-hidden="true" />
      <div className="container home-cta-inner">
        <Reveal y={16}>
          <p className="home-cta-kicker">{t('home_sections.cta.kicker')}</p>
        </Reveal>
        <Reveal delay={80} y={20}>
          <h2 id="home-cta-heading" className="home-cta-title">
            <Editable id="cta.title" defaultValue={t('home_sections.cta.title')} />
          </h2>
        </Reveal>
        <Reveal delay={160} y={16}>
          <p className="home-cta-copy">
            <Editable id="cta.subtitle" multiline defaultValue={t('home_sections.cta.subtitle')} />
          </p>
        </Reveal>
        <Reveal delay={240} y={12}>
          <div className="home-cta-actions">
            <button type="button" onClick={() => setRoute('contacto')} className="home-cta-link home-cta-link--primary">
              <Editable id="cta.primary" defaultValue={t('home_sections.cta.primary')} />
              <Icon.ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setRoute('servicios')} className="home-cta-link home-cta-link--secondary">
              <Editable id="cta.secondary" defaultValue={t('home_sections.cta.secondary')} />
              <Icon.ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>
      <div className={`home-cta-rule home-cta-rule--bottom${lineDrawn ? ' is-drawn' : ''}`} aria-hidden="true" />
      <style>{`
        .home-cta {
          position: relative;
          padding: 96px 0 112px;
          background: var(--bg-0);
          overflow: hidden;
        }
        .home-cta-rule {
          height: 1px;
          background: color-mix(in srgb, var(--card-border) 90%, transparent);
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 900ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
        }
        .home-cta-rule.is-drawn { transform: scaleX(1); }
        .home-cta-rule--top { margin-bottom: 56px; }
        .home-cta-rule--bottom {
          margin-top: 64px;
          transform-origin: right center;
          transition-delay: 200ms;
        }
        .home-cta-inner {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
          max-width: 920px;
        }
        .home-cta-kicker {
          margin: 0 0 20px;
          color: var(--text-3);
          font: 600 11px/1 var(--font-mono, monospace);
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .home-cta-title {
          margin: 0;
          color: var(--text-0);
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -0.045em;
          text-wrap: balance;
          max-width: 18ch;
        }
        .home-cta-copy {
          margin: 24px 0 36px;
          max-width: 52ch;
          color: var(--text-2);
          font-size: clamp(15px, 1.5vw, 18px);
          line-height: 1.6;
        }
        .home-cta-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 28px 36px;
        }
        .home-cta-link {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0 0 8px;
          background: none;
          border: none;
          border-bottom: 1px solid var(--card-border);
          color: var(--text-0);
          cursor: pointer;
          font: 700 14px/1.2 var(--font-sans, sans-serif);
          transition: color 250ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      gap 250ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      border-color 250ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
        }
        .home-cta-link--primary {
          border-bottom-color: var(--cyan-bright);
        }
        .home-cta-link--primary:hover {
          color: var(--cyan-bright);
          gap: 16px;
        }
        .home-cta-link--secondary {
          color: var(--text-2);
        }
        .home-cta-link--secondary:hover {
          color: var(--text-0);
          border-bottom-color: var(--text-2);
          gap: 16px;
        }
        @media (max-width: 760px) {
          .home-cta { padding: 72px 0 88px; }
          .home-cta-rule--top { margin-bottom: 40px; }
          .home-cta-rule--bottom { margin-top: 48px; }
          .home-cta-title { max-width: none; }
          .home-cta-actions { flex-direction: column; align-items: flex-start; gap: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .home-cta-rule { transform: scaleX(1); transition: none; }
        }
      `}</style>
    </section>
  );
}

export default HomeCta;
