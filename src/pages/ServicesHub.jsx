// ServicesHub — overview of all services, with grid of 12 cards (6 core + 6 specialized).

import React from 'react';
import { useTranslations, useI18n } from '../i18n/index.jsx';
import { useServices, mergeServices } from '../lib/serviceData.jsx';
import { Reveal } from '../lib/anim.jsx';
import Icon from '../lib/icons.jsx';
import NeuralNet from '../components/NeuralNet.jsx';

const ALL_SERVICES = [
  { id: 'svc-web', k: 'web', name: 'Desarrollo Web', icon: 'Globe', color: '#3B82F6', tagline: 'Sitios, portales y plataformas modernas', bullets: ['Landing pages de alta conversión', 'Portales corporativos', 'Progressive Web Apps', 'Headless CMS'] },
  { id: 'svc-mobile', k: 'mobile', name: 'Aplicaciones Móviles', icon: 'Smartphone', color: '#8B5CF6', tagline: 'Apps nativas y multiplataforma', bullets: ['iOS y Android nativo', 'React Native · Flutter', 'Push notifications', 'Offline-first'] },
  { id: 'svc-software', k: 'software', name: 'Software a Medida', icon: 'Layers', color: '#F97316', tagline: 'ERP, CRM y plataformas SaaS', bullets: ['Multi-tenant SaaS', 'Roles y permisos', 'Reportería avanzada', 'Integraciones'] },
  { id: 'svc-maintenance', k: 'maintenance', name: 'Mantenimiento y Soporte', icon: 'Wrench', color: '#F59E0B', tagline: 'Sistemas vivos en el tiempo', bullets: ['Soporte 24/7', 'Mejora continua', 'Hotfixes y patches', 'Backups gestionados'] },
  { id: 'svc-consulting', k: 'consulting', name: 'Consultoría TI', icon: 'Compass', color: '#A855F7', tagline: 'Estrategia y arquitectura', bullets: ['Diagnóstico tecnológico', 'Roadmap', 'Selección de stack', 'Auditoría de procesos'] },
  { id: 'svc-seo', k: 'seo', name: 'SEO y Posicionamiento', icon: 'Search', color: '#14B8A6', tagline: 'Crecimiento orgánico medible', bullets: ['SEO técnico', 'Content strategy', 'Core Web Vitals', 'Tracking GA4'] },
  { id: 'svc-ai', k: 'ai', name: 'IA Aplicada', icon: 'Brain', color: '#EC4899', tagline: 'IA integrada en tu operación', bullets: ['Chatbots inteligentes', 'Modelos predictivos', 'Procesamiento de documentos', 'OpenAI · Claude · Gemini'] },
  { id: 'svc-security', k: 'security', name: 'Ciberseguridad', icon: 'Shield', color: '#EF4444', tagline: 'Auditoría y hardening', bullets: ['OWASP Top 10', 'Pentesting', 'Hardening de servidores', 'Reportes de cumplimiento'] },
  { id: 'svc-cloud', k: 'cloud', name: 'DevOps & Cloud', icon: 'Cloud', color: '#06B6D4', tagline: 'Infraestructura escalable', bullets: ['AWS · GCP · Azure', 'Docker · Kubernetes', 'CI/CD pipelines', 'Monitoreo y alertas'] },
  { id: 'svc-data', k: 'data', name: 'Bases de Datos', icon: 'Database', color: '#10B981', tagline: 'Datos confiables y rápidos', bullets: ['Diseño relacional', 'Modelado NoSQL', 'Optimización de queries', 'Migraciones seguras'] },
  { id: 'svc-bi', k: 'bi', name: 'Analítica y BI', icon: 'BarChart', color: '#F59E0B', tagline: 'Datos en decisiones', bullets: ['Power BI · Metabase', 'Dashboards ejecutivos', 'KPIs personalizados', 'ETL automatizados'] },
  { id: 'svc-api', k: 'api', name: 'Integración APIs', icon: 'Plug', color: '#8B5CF6', tagline: 'Sistemas que se hablan', bullets: ['REST y GraphQL', 'Webhooks', 'Pasarelas de pago', 'Facturación electrónica DIAN'] },
];

function ServicesHub({ setRoute }) {
  const t = useTranslations();
  const { language } = useI18n();
  const { services: dbServices } = useServices(language);
  const merged = mergeServices(ALL_SERVICES, dbServices);
  const visible = merged.filter((s) => s.active !== false);
  const core = dbServices && dbServices.length ? visible.filter((s) => s.featured) : visible.slice(0, 6);
  const specialized = dbServices && dbServices.length ? visible.filter((s) => !s.featured) : visible.slice(6);
  return (
    <div className="page" style={{ paddingTop: 110 }}>
      <section className="services-hero" style={{ position: 'relative', padding: '60px 0 40px', overflow: 'hidden' }}>
        <div className="services-hero-net" style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <NeuralNet density={60} color="#3B82F6" accent="#22D3EE" linkDist={150} opacity={0.5}/>
        </div>
        <div className="services-hero-vignette"/>
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <Reveal><span className="section-eyebrow">{t('services_hub.eyebrow')}</span></Reveal>
          <Reveal delay={100}>
            <h1 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(48px, 7vw, 88px)' }}>
              {t('services_hub.title.pre')} <span className="text-grad-blue">{t('services_hub.title.highlight')}</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="section-sub" style={{ margin: '24px auto 0' }}>
              {t('services_hub.subtitle')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Core grid */}
      <section style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <Reveal><span className="section-eyebrow">{t('services_hub.coreEyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(28px, 4vw, 44px)' }}>{t('services_hub.coreTitle')}</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }} className="hub-grid">
            {core.map((s, i) => (
              <Reveal key={s.id} delay={i * 70}>
                <ServiceCard svc={s} onClick={() => setRoute(s.id)} large/>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <Reveal><span className="section-eyebrow" style={{ color: '#A78BFA' }}>{t('services_hub.specializedEyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(28px, 4vw, 44px)' }}>{t('services_hub.specializedTitle')}</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }} className="hub-grid">
            {specialized.map((s, i) => (
              <Reveal key={s.id} delay={i * 70}>
                <ServiceCard svc={s} onClick={() => setRoute(s.id)}/>
              </Reveal>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 580px) { .hub-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div className="glass-2" style={{ borderRadius: 24, padding: 48, textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(34,211,238,0.1))' }}>
            <h3 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>{t('services_hub.ctaTitle')}</h3>
            <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 540, margin: '0 auto 24px' }}>
              {t('services_hub.ctaDesc')}
            </p>
            <button onClick={() => setRoute('contacto')} className="btn btn-primary">{t('services_hub.ctaBtn')} <Icon.ArrowRight size={14}/></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ svc, onClick, large = false }) {
  const t = useTranslations();
  const I = Icon[svc.icon];
  return (
    <button onClick={onClick} className="svc-card" style={{
      width: '100%', textAlign: 'left',
      padding: large ? 28 : 24, borderRadius: 20,
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      cursor: 'pointer', position: 'relative', overflow: 'hidden',
      transition: 'all 280ms var(--ease-out)', height: '100%',
    }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-bg-hover)'; e.currentTarget.style.borderColor = 'var(--card-border-hover)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}>
      <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${svc.color}24, transparent 70%)`, filter: 'blur(20px)', opacity: 0.7 }}/>
      <span style={{
        width: large ? 52 : 44, height: large ? 52 : 44, borderRadius: 12,
        background: `${svc.color}1A`, color: svc.color, border: `1px solid ${svc.color}30`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}><I size={large ? 22 : 20}/></span>
      <h3 style={{ fontSize: large ? 22 : 18, fontWeight: 700, color: 'var(--text-0)', margin: '18px 0 6px', letterSpacing: '-0.01em', position: 'relative' }}>{svc.name || t(`services.${svc.k}.name`)}</h3>
      <p style={{ color: 'var(--text-2)', fontSize: 13.5, margin: '0 0 16px', position: 'relative' }}>{svc.tagline || t(`services.${svc.k}.desc`)}</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6, position: 'relative' }}>
        {(svc.bullets && svc.bullets.length ? svc.bullets : t(`services.${svc.k}.bullets`)).slice(0, large ? 4 : 3).map((b, j) => (
          <li key={j} style={{ color: 'var(--text-1)', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Icon.Check size={12} stroke={svc.color} sw={2.4}/> {b}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6, color: svc.color, fontSize: 13, fontWeight: 600, position: 'relative' }}>
        {t('common.viewDetail')} <Icon.ArrowRight size={13}/>
      </div>
    </button>
  );
}

export default ServicesHub;
export { ServicesHub, ALL_SERVICES };
