// ServicePage — generic detail page for any service id.

function ServicePage({ id, setRoute }) {
  const t = useTranslations();
  const svc = (window.ALL_SERVICES || []).find(s => s.id === id);
  if (!svc) {
    return (
      <div className="page" style={{ paddingTop: 200, textAlign: 'center' }}>
        <h2 className="section-h2">{t('common.serviceNotFound')}</h2>
        <button onClick={() => setRoute('servicios')} className="btn btn-primary" style={{ marginTop: 24 }}>{t('common.viewServices')}</button>
      </div>
    );
  }
  const I = Icon[svc.icon];
  const c = svc.color;

  // Dynamic content per service
  const detail = {
    overview: t(`service_pages.${svc.k}.overview`),
    deliverables: t(`service_pages.${svc.k}.deliverables`),
    process: t(`service_pages.${svc.k}.process`),
    tech: (SERVICE_DETAILS[id] || {}).tech || ['React', 'Node.js', 'PostgreSQL'],
  };

  return (
    <div className="page" style={{ paddingTop: 110 }}>
      {/* HERO */}
      <section style={{ position: 'relative', padding: '60px 0 40px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${c}26, transparent 60%)`, filter: 'blur(60px)' }}/>
          <div style={{ position: 'absolute', bottom: '0%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${c}1A, transparent 60%)`, filter: 'blur(60px)' }}/>
        </div>
        <div className="container" style={{ position: 'relative' }}>
          <button onClick={() => setRoute('servicios')} style={{ background: 'transparent', border: 'none', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <Icon.ChevronRight size={14} style={{ transform: 'rotate(180deg)' }}/> {t('common.allServices')}
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 60, alignItems: 'center' }} className="svp-hero">
            <div>
              <Reveal>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '6px 14px 6px 8px', borderRadius: 999,
                  background: `${c}1A`, border: `1px solid ${c}40`,
                  marginBottom: 24,
                }}>
                  <span style={{ width: 28, height: 28, borderRadius: 999, background: `${c}28`, color: c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><I size={14}/></span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('common.service')}</span>
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h1 style={{ fontSize: 'clamp(40px, 6vw, 76px)', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1, margin: '0 0 20px' }}>
                  {t(`services.${svc.k}.name`)}
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p style={{ fontSize: 18, color: 'var(--text-1)', lineHeight: 1.6, margin: '0 0 32px', maxWidth: 540 }}>
                  {detail.overview}
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => setRoute('contacto')} className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)`, boxShadow: `0 8px 30px ${c}50` }}>
                    {t('common.quoteThisService')} <Icon.ArrowRight size={14}/>
                  </button>
                  <button onClick={() => setRoute('proyectos')} className="btn btn-ghost">{t('common.viewCases')}</button>
                </div>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <div style={{
                aspectRatio: '1', borderRadius: 32,
                position: 'relative', overflow: 'hidden',
                boxShadow: `0 20px 60px ${c}40, 0 0 80px ${c}30`,
              }}>
                <img src={`./media/servicios/${svc.id}.png`} alt={t(`services.${svc.k}.name`)} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
                <div style={{ display: 'none', width: '100%', height: '100%', background: `linear-gradient(135deg, ${c}30, ${c}10)`, alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: 160, height: 160, borderRadius: 40, background: `${c}30`, color: c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${c}80`, boxShadow: `0 0 80px ${c}80, inset 0 0 60px ${c}20` }}>
                    <I size={80} sw={1.4}/>
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
        <style>{`@media (max-width: 980px) { .svp-hero { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* DELIVERABLES */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <Reveal><span className="section-eyebrow" style={{ color: c }}>{t('common.deliverables')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(32px, 4.5vw, 56px)' }}>{t('common.whatYouReceive')}</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="del-grid">
            {detail.deliverables.map((d, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="glass" style={{ borderRadius: 14, padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: `${c}1A`, color: c, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon.Check size={18} sw={2.6}/></span>
                  <span style={{ fontSize: 15, color: 'var(--text-0)', fontWeight: 500 }}>{d}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <style>{`@media (max-width: 700px) { .del-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </section>

      {/* PROCESS */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <Reveal><span className="section-eyebrow" style={{ color: c }}>{t('common.process')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(32px, 4.5vw, 56px)' }}>{t('common.howWeDoIt')}</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }} className="proc-grid">
            {detail.process.map((p, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="glass" style={{ borderRadius: 16, padding: 24, position: 'relative', height: '100%' }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: `${c}40`, lineHeight: 1, letterSpacing: '-0.04em' }}>{String(i + 1).padStart(2, '0')}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-0)', margin: '12px 0 0' }}>{p}</h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TECH */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <Reveal><span className="section-eyebrow" style={{ color: c }}>{t('common.stack')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(28px, 4vw, 44px)' }}>{t('common.typicalTech')}</h2></Reveal>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {detail.tech.map((t, i) => (
              <span key={i} className="pill" style={{ fontSize: 13, padding: '8px 16px', borderColor: `${c}30`, background: `${c}10` }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div className="glass-2" style={{
            borderRadius: 24, padding: 48, textAlign: 'center',
            background: `linear-gradient(135deg, ${c}1A, ${c}08)`, border: `1px solid ${c}40`,
          }}>
            <h3 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>{t('common.letsTalkProject')} {t(`services.${svc.k}.name`).toLowerCase()}?</h3>
            <p style={{ fontSize: 16, color: 'var(--text-1)', maxWidth: 520, margin: '0 auto 24px' }}>
              {t('common.freeDiagnostic')}
            </p>
            <button onClick={() => setRoute('contacto')} className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)`, boxShadow: `0 8px 30px ${c}50` }}>
              {t('common.startConversation')} <Icon.ArrowRight size={14}/>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const SERVICE_DETAILS = {
  'svc-web': {
    overview: 'Construimos sitios y plataformas web modernas, rápidas y optimizadas para conversión. Desde landing pages hasta portales corporativos completos con CMS headless y arquitectura escalable.',
    deliverables: ['Diseño UX/UI personalizado', 'Sitio responsive y accesible (WCAG AA)', 'CMS headless (Strapi · Sanity)', 'SEO técnico on-page', 'Integración con analítica GA4', 'Optimización Core Web Vitals', 'Hosting y despliegue', 'Capacitación de uso'],
    process: ['Diagnóstico', 'Wireframes', 'Diseño UI', 'Desarrollo', 'QA & Despliegue'],
    tech: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Strapi', 'Vercel', 'Cloudflare'],
  },
  'svc-mobile': {
    overview: 'Aplicaciones móviles nativas y multiplataforma con experiencia fluida, soporte offline y notificaciones push. Publicamos en App Store y Google Play con todo el proceso técnico incluido.',
    deliverables: ['App iOS y Android', 'Diseño nativo por plataforma', 'Notificaciones push', 'Modo offline', 'Autenticación segura', 'Integración con backend', 'Publicación en stores', 'Analítica de uso'],
    process: ['Concepto', 'Prototipo', 'Desarrollo', 'Beta TestFlight', 'Lanzamiento'],
    tech: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'Expo'],
  },
  'svc-software': {
    overview: 'ERPs, CRMs y plataformas SaaS multi-tenant a medida. Cuando los productos del mercado no se ajustan, construimos el sistema que tu operación realmente necesita.',
    deliverables: ['Arquitectura multi-tenant', 'Panel administrativo', 'Roles y permisos granulares', 'Reportería avanzada', 'Integraciones API', 'Auditoría de cambios', 'Documentación técnica', 'Capacitación de equipo'],
    process: ['Análisis funcional', 'Arquitectura', 'MVP', 'Iteración', 'Producción'],
    tech: ['React', 'Node.js', '.NET', 'PostgreSQL', 'Docker', 'AWS'],
  },
  'svc-maintenance': {
    overview: 'Mantenimiento evolutivo y correctivo para sistemas en producción. Tu sistema sigue mejorando, no solo "no se cae". Soporte continuo con SLA real.',
    deliverables: ['Soporte técnico mensual', 'Mantenimiento correctivo', 'Mejora continua', 'Backups gestionados', 'Monitoreo 24/7', 'Reportes mensuales', 'Hotfixes priorizados', 'Actualizaciones de seguridad'],
    process: ['Onboarding', 'Diagnóstico', 'Plan mensual', 'Sprints continuos'],
    tech: ['Sentry', 'Datadog', 'PagerDuty', 'GitHub Actions', 'Docker'],
  },
  'svc-consulting': {
    overview: 'Consultoría tecnológica para tomar buenas decisiones antes de invertir. Auditamos tu stack, procesos y equipo, y te entregamos un roadmap accionable.',
    deliverables: ['Diagnóstico tecnológico', 'Auditoría de código existente', 'Selección de stack', 'Roadmap a 12 meses', 'Evaluación de proveedores', 'Estrategia de escalabilidad', 'Análisis de costos', 'Workshop ejecutivo'],
    process: ['Kick-off', 'Auditoría', 'Análisis', 'Roadmap', 'Presentación'],
    tech: ['ADR', 'C4 model', 'Mermaid', 'Notion'],
  },
  'svc-seo': {
    overview: 'SEO técnico y estratégico que se traduce en tráfico calificado. No promesas vacías: métricas, plan y resultados verificables mes a mes.',
    deliverables: ['Auditoría SEO técnico', 'Investigación de keywords', 'Optimización on-page', 'Estrategia de contenidos', 'Schema markup', 'Core Web Vitals', 'Reportes mensuales', 'Tracking GA4 + Search Console'],
    process: ['Auditoría', 'Plan keywords', 'Optimización', 'Contenido', 'Reporte'],
    tech: ['GSC', 'GA4', 'Ahrefs', 'Screaming Frog', 'Lighthouse'],
  },
  'svc-ai': {
    overview: 'Integramos inteligencia artificial en tu operación: chatbots inteligentes, modelos predictivos, procesamiento de documentos y automatizaciones que ahorran horas reales de trabajo.',
    deliverables: ['Chatbot multicanal (web · WhatsApp)', 'Modelos predictivos sobre tus datos', 'OCR y procesamiento de documentos', 'Automatizaciones inteligentes', 'Dashboards de IA', 'Integración con OpenAI · Claude', 'Pipelines de fine-tuning', 'Monitoreo de calidad'],
    process: ['Caso de uso', 'POC', 'Modelo', 'Integración', 'Operación'],
    tech: ['OpenAI', 'Claude', 'LangChain', 'Python', 'Vector DB', 'HuggingFace'],
  },
  'svc-security': {
    overview: 'Auditorías de seguridad, pentesting y hardening para sistemas en producción. Encontramos vulnerabilidades antes que los atacantes y te ayudamos a cerrarlas.',
    deliverables: ['Auditoría OWASP Top 10', 'Pentest de aplicación', 'Hardening de servidores', 'Revisión de auth y permisos', 'Análisis de dependencias', 'Reporte ejecutivo', 'Plan de remediación', 'Re-test post-fix'],
    process: ['Scope', 'Recon', 'Análisis', 'Reporte', 'Fix & Re-test'],
    tech: ['Burp Suite', 'OWASP ZAP', 'Nmap', 'Snyk', 'Trivy'],
  },
  'svc-cloud': {
    overview: 'DevOps y arquitectura cloud para sistemas que necesitan escalar sin caerse. Infraestructura como código, CI/CD, contenedores y monitoreo.',
    deliverables: ['Diseño de arquitectura cloud', 'Infraestructura como código', 'Dockerización', 'Pipelines CI/CD', 'Despliegue en AWS · GCP · Azure', 'Monitoreo y alertas', 'Backups automáticos', 'Documentación operativa'],
    process: ['Diseño', 'IaC', 'CI/CD', 'Despliegue', 'Operación'],
    tech: ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
  },
  'svc-data': {
    overview: 'Diseño, optimización y migración de bases de datos. Modelos relacionales y NoSQL bien pensados para que tus datos sean confiables y rápidos de consultar.',
    deliverables: ['Diseño relacional', 'Modelado NoSQL', 'Optimización de queries', 'Índices y particionamiento', 'Migraciones seguras', 'Backups y recuperación', 'Replicación', 'Documentación de schema'],
    process: ['Análisis', 'Diseño', 'Migración', 'Optimización'],
    tech: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch'],
  },
  'svc-bi': {
    overview: 'Convertimos datos dispersos en dashboards ejecutivos con KPIs claros. ETL automatizados, integración de fuentes y reportes que se actualizan solos.',
    deliverables: ['Modelado dimensional', 'ETL automatizado', 'Dashboards ejecutivos', 'KPIs personalizados', 'Reportes programados', 'Integración de fuentes', 'Capacitación', 'Soporte continuo'],
    process: ['Discovery', 'Modelado', 'ETL', 'Dashboards', 'Operación'],
    tech: ['Power BI', 'Metabase', 'Looker', 'Airbyte', 'dbt', 'BigQuery'],
  },
  'svc-api': {
    overview: 'Conectamos tus sistemas con todo lo que necesite hablarse: pasarelas de pago, facturación electrónica DIAN, ERPs, WhatsApp Business, y APIs públicas.',
    deliverables: ['APIs REST y GraphQL', 'Webhooks', 'Pasarelas de pago', 'Facturación electrónica DIAN', 'WhatsApp Business API', 'Integraciones SAP · Siesa', 'Documentación OpenAPI', 'SDK cliente'],
    process: ['Discovery', 'Diseño', 'Implementación', 'Testing', 'Operación'],
    tech: ['REST', 'GraphQL', 'Postman', 'OpenAPI', 'Stripe', 'WompiPSE'],
  },
};

window.ServicePage = ServicePage;
window.SERVICE_DETAILS = SERVICE_DETAILS;
