// About — mission, vision, values, timeline 2025.

import React from 'react';
import { useTranslations } from '../i18n/index.jsx';
import { Reveal } from '../lib/anim.jsx';
import Icon from '../lib/icons.jsx';
import NeuralNet from '../components/NeuralNet.jsx';

function About({ setRoute }) {
  const t = useTranslations();
  return (
    <div className="page" style={{ paddingTop: 110 }}>
      <section style={{ position: 'relative', padding: '60px 0 40px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <NeuralNet density={50} color="#A78BFA" accent="#EC4899" linkDist={140} opacity={0.4}/>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, transparent, var(--bg-0) 70%)', pointerEvents: 'none' }}/>
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <Reveal><span className="section-eyebrow">{t('about.eyebrow')}</span></Reveal>
          <Reveal delay={100}>
            <h1 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(48px, 7vw, 88px)' }}>
              {t('about.titlePre')} <span className="text-grad-blue">{t('about.titleHighlight')}</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="section-sub" style={{ margin: '24px auto 0' }}>
              {t('about.intro')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="mv-grid">
            <Reveal>
              <div className="glass-2" style={{ borderRadius: 24, padding: 40, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.25), transparent 70%)', filter: 'blur(30px)' }}/>
                <span style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(34,211,238,0.12)', color: '#22D3EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,211,238,0.3)', position: 'relative' }}>
                  <Icon.Target size={26}/>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#22D3EE', margin: '20px 0 12px', position: 'relative' }}>{t('about.missionLabel')}</h3>
                <p style={{ fontSize: 18, color: 'var(--text-0)', lineHeight: 1.55, margin: 0, fontWeight: 500, position: 'relative' }}>
                  {t('about.mission')}
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="glass-2" style={{ borderRadius: 24, padding: 40, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.25), transparent 70%)', filter: 'blur(30px)' }}/>
                <span style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(167,139,250,0.12)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(167,139,250,0.3)', position: 'relative' }}>
                  <Icon.Telescope size={26}/>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A78BFA', margin: '20px 0 12px', position: 'relative' }}>{t('about.visionLabel')}</h3>
                <p style={{ fontSize: 18, color: 'var(--text-0)', lineHeight: 1.55, margin: 0, fontWeight: 500, position: 'relative' }}>
                  {t('about.vision')}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
        <style>{`@media (max-width: 900px) { .mv-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* VALUES */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Reveal><span className="section-eyebrow">{t('about.valuesEyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12 }}>{t('about.valuesTitle')}</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="val-grid">
            {[
              { icon: 'Lightbulb', name: t('about.values.1.name'), d: t('about.values.1.desc'), c: '#F59E0B' },
              { icon: 'Heart', name: t('about.values.2.name'), d: t('about.values.2.desc'), c: '#EC4899' },
              { icon: 'Award', name: t('about.values.3.name'), d: t('about.values.3.desc'), c: '#22D3EE' },
              { icon: 'Handshake', name: t('about.values.4.name'), d: t('about.values.4.desc'), c: '#10B981' },
            ].map((v, i) => {
              const I = Icon[v.icon];
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="glass" style={{ borderRadius: 16, padding: 28, height: '100%' }}>
                    <span style={{ width: 44, height: 44, borderRadius: 12, background: `${v.c}1A`, color: v.c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><I size={22}/></span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px' }}>{v.name}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>{v.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
        <style>{`@media (max-width: 980px) { .val-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 580px) { .val-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* FOUNDERS */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Reveal><span className="section-eyebrow" style={{ color: '#F59E0B' }}>{t('about.foundersEyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12 }}>{t('about.foundersTitle')}</h2></Reveal>
            <Reveal delay={150}>
              <p className="section-sub" style={{ margin: '16px auto 0', maxWidth: 680 }}>{t('about.foundersDesc')}</p>
            </Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 820, margin: '0 auto' }} className="fd-grid">
            {['1', '2'].map((k, i) => (
              <Reveal key={k} delay={i * 100}>
                <div className="glass" style={{ borderRadius: 16, padding: 28, textAlign: 'center', height: '100%' }}>
                  <span style={{
                    width: 56, height: 56, borderRadius: 999, marginBottom: 14,
                    background: i === 0 ? 'rgba(59,130,246,0.12)' : 'rgba(167,139,250,0.12)',
                    color: i === 0 ? '#3B82F6' : '#A78BFA', border: `1px solid ${i === 0 ? '#3B82F6' : '#A78BFA'}40`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i === 0 ? <Icon.Code size={24}/> : <Icon.Users size={24}/>}
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-0)', margin: 0 }}>{t(`about.founders.${k}.name`)}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 640px) { .fd-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* TIMELINE 2025 */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Reveal><span className="section-eyebrow">{t('about.timeline.eyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12 }}>{t('about.timeline.title')}</h2></Reveal>
          </div>
          <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: 'clamp(20px, 4vw, 30px)', top: 12, bottom: 12, width: 2, background: 'linear-gradient(180deg, #22D3EE, #A78BFA, #EC4899)', borderRadius: 2 }}/>
            {[
              { mo: t('about.timeline.items.1.mo'), t: t('about.timeline.items.1.t'), d: t('about.timeline.items.1.d'), c: '#22D3EE' },
              { mo: t('about.timeline.items.2.mo'), t: t('about.timeline.items.2.t'), d: t('about.timeline.items.2.d'), c: '#3B82F6' },
              { mo: t('about.timeline.items.3.mo'), t: t('about.timeline.items.3.t'), d: t('about.timeline.items.3.d'), c: '#A78BFA' },
              { mo: t('about.timeline.items.4.mo'), t: t('about.timeline.items.4.t'), d: t('about.timeline.items.4.d'), c: '#EC4899' },
              { mo: t('about.timeline.items.5.mo'), t: t('about.timeline.items.5.t'), d: t('about.timeline.items.5.d'), c: '#F59E0B' },
              { mo: t('about.timeline.items.6.mo'), t: t('about.timeline.items.6.t'), d: t('about.timeline.items.6.d'), c: '#22D3EE' },
            ].map((m, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 24px)', paddingLeft: 4, paddingBottom: 36, position: 'relative' }}>
                  <div style={{
                    width: 'clamp(48px, 7vw, 60px)', height: 'clamp(48px, 7vw, 60px)', flexShrink: 0, borderRadius: '50%',
                    background: 'var(--bg-1)', border: `2px solid ${m.c}`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: m.c, fontWeight: 800, fontSize: 'clamp(9px, 2vw, 11px)', lineHeight: 1.1, textAlign: 'center', padding: 4,
                    boxShadow: `0 0 30px ${m.c}40`, zIndex: 2,
                  }}>{m.mo.split(' ')[0]}</div>
                  <div className="glass" style={{ flex: 1, borderRadius: 16, padding: 24 }}>
                    <div style={{ fontSize: 12, color: m.c, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{m.mo}</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px' }}>{m.t}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0, lineHeight: 1.55 }}>{m.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM CTA */}
      <section style={{ padding: '60px 0 120px' }}>
        <div className="container">
          <div className="glass-2" style={{ borderRadius: 24, padding: 48, textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(167,139,250,0.12))' }}>
            <Icon.Users size={32} stroke="#22D3EE" style={{ marginBottom: 12 }}/>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 12px' }}>{t('about.teamCtaTitle')}</h3>
            <p style={{ fontSize: 16, color: 'var(--text-1)', maxWidth: 500, margin: '0 auto 24px' }}>
              {t('about.teamCtaDesc')}
            </p>
            <button onClick={() => setRoute('contacto')} className="btn btn-primary">{t('about.teamCtaBtn')} <Icon.ArrowRight size={14}/></button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
export { About };
