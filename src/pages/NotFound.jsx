// NotFound — 404 page (Fase H). Reuses the site's visual language.

import React from 'react';
import { useTranslations } from '../i18n/index.jsx';
import { Reveal } from '../lib/anim.jsx';
import Icon from '../lib/icons.jsx';
import NeuralNet from '../components/NeuralNet.jsx';

function NotFound({ setRoute }) {
  const t = useTranslations();
  return (
    <div className="page" style={{ paddingTop: 110, minHeight: '100vh' }}>
      <section style={{ position: 'relative', padding: '60px 0 120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
          <NeuralNet density={40} color="#F59E0B" accent="#22D3EE" linkDist={140} opacity={0.4}/>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, transparent, rgba(5,6,10,0.85) 70%)' }}/>

        <div className="container" style={{ position: 'relative', textAlign: 'center', padding: '40px 0' }}>
          <Reveal>
            <div style={{
              fontSize: 'clamp(96px, 20vw, 220px)', lineHeight: 1,
              fontWeight: 900, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #22D3EE, #3B82F6 40%, #A78BFA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', color: 'transparent',
              filter: 'drop-shadow(0 12px 40px rgba(34,211,238,0.25))',
            }}>404</div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="section-h2" style={{ marginTop: 8, fontSize: 'clamp(28px, 4vw, 48px)' }}>
              {t('notfound.title')}
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="section-sub" style={{ margin: '16px auto 0', maxWidth: 520 }}>
              {t('notfound.subtitle')}
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
              <button onClick={() => setRoute('home')} className="btn btn-primary" style={{ minHeight: 46 }}>
                <Icon.Home size={15}/> {t('notfound.ctaHome')}
              </button>
              <button onClick={() => setRoute('servicios')} className="btn btn-ghost" style={{ minHeight: 46 }}>
                {t('notfound.ctaServices')} <Icon.ArrowRight size={14}/>
              </button>
            </div>
          </Reveal>
          <Reveal delay={420}>
            <div style={{ marginTop: 48, color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              error_code: ROUTE_NOT_FOUND · {new Date().getFullYear()}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default NotFound;
export { NotFound };
