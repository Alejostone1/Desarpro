// Home page — hero with branded Earth video, services preview, tech loop, process, CTA.
// All user-facing text is wrapped in <Editable id="..."/> so the admin panel can rewrite it.

function Home({ setRoute }) {
  const { content } = useAdmin();
  const { language } = useI18n();
  const { services: dbServices } = useServices(language);
  const { config: siteConfig } = useSiteConfig();
  const sec = siteConfig.sections || {};

  const services = [
    { id: 'svc-web', name: 'Desarrollo Web', icon: 'Globe', color: '#3B82F6',
      tagline: 'Sitios y plataformas modernas',
      bullets: ['Landing pages', 'Portales corporativos', 'PWAs', 'Headless CMS'] },
    { id: 'svc-mobile', name: 'Aplicaciones Móviles', icon: 'Smartphone', color: '#8B5CF6',
      tagline: 'Apps que se sienten nativas',
      bullets: ['iOS y Android', 'React Native · Flutter', 'Notificaciones push', 'Offline-first'] },
    { id: 'svc-software', name: 'Software a Medida', icon: 'Layers', color: '#F97316',
      tagline: 'ERP, CRM y plataformas SaaS',
      bullets: ['Multi-tenant', 'Roles y permisos', 'Reportería avanzada', 'Integraciones'] },
    { id: 'svc-maintenance', name: 'Mantenimiento', icon: 'Wrench', color: '#F59E0B',
      tagline: 'Soporte continuo y evolución',
      bullets: ['Mejora continua', 'Monitoreo 24/7', 'Backups y seguridad', 'Hotfixes'] },
    { id: 'svc-consulting', name: 'Consultoría TI', icon: 'Compass', color: '#A855F7',
      tagline: 'Estrategia y arquitectura',
      bullets: ['Roadmap tecnológico', 'Auditoría de procesos', 'Selección de stack', 'Due diligence'] },
    { id: 'svc-seo', name: 'SEO & Posicionamiento', icon: 'Search', color: '#14B8A6',
      tagline: 'Crecimiento orgánico medible',
      bullets: ['SEO técnico', 'Content strategy', 'Tracking y analítica', 'Core Web Vitals'] },
  ];
  const serviceList = window.mergeServices(services, dbServices).filter((s) => s.active !== false).slice(0, 6);

  return (
    <div className="page">
      {/* HERO with branded Earth video */}
      {sec.hero !== false && (
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 80 }}>
        {typeof siteConfig.heroImage === 'string' && siteConfig.heroImage ? (
          <div style={{ position: 'absolute', inset: 0, background: `#020308 url("${siteConfig.heroImage}") center/cover no-repeat` }}/>
        ) : (
          <HeroVideoBg/>
        )}

        {/* Floating orbs for added depth */}
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: 'clamp(200px, 30vw, 400px)', height: 'clamp(200px, 30vw, 400px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent 60%)', filter: 'blur(40px)', zIndex: 1, animation: 'orb-drift 18s ease-in-out infinite alternate', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 'clamp(250px, 35vw, 500px)', height: 'clamp(250px, 35vw, 500px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 60%)', filter: 'blur(40px)', zIndex: 1, animation: 'orb-drift 22s ease-in-out infinite alternate-reverse', pointerEvents: 'none' }}/>

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingTop: 60, paddingBottom: 80 }}>
          <Reveal y={20}>
            <span className="pill on-dark-bg" style={{ marginBottom: 28 }}>
              <span className="dot"/> <Editable id="hero.badge" defaultValue="Aceptando proyectos para 2026"/>
            </span>
          </Reveal>
          <Reveal delay={120} y={28}>
            <h1 style={{
              fontSize: 'clamp(48px, 8vw, 112px)', fontWeight: 800, letterSpacing: '-0.045em',
              lineHeight: 0.95, margin: '0 auto 28px', maxWidth: 1100, color: '#fff', textWrap: 'balance',
              textShadow: '0 4px 24px rgba(0,0,0,0.6)',
            }}>
              <Editable id="hero.title.line1" defaultValue="Tecnología que"/> <br/>
              <span className="text-grad-blue"><Editable id="hero.title.highlight" defaultValue="transforma"/></span>{' '}
              <Editable id="hero.title.line2" defaultValue="tu negocio"/>
            </h1>
          </Reveal>
          <Reveal delay={240} y={20}>
            <p style={{ fontSize: 'clamp(16px, 1.5vw, 20px)', color: 'rgba(255,255,255,0.82)', maxWidth: 720, margin: '0 auto 40px', lineHeight: 1.6, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              <Editable id="hero.subtitle" multiline defaultValue="Desarrollamos software a medida, apps móviles, plataformas SaaS y soluciones de IA, ciberseguridad e infraestructura para empresas que quieren crecer con base sólida en Colombia y Latinoamérica."/>
            </p>
          </Reveal>
          <Reveal delay={360} y={16}>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setRoute('contacto')} className="btn btn-primary" style={{ padding: '16px 28px', fontSize: 15 }}>
                <Editable id="hero.cta.primary" defaultValue="Cotizar mi proyecto"/> <Icon.ArrowRight size={16}/>
              </button>
              <button onClick={() => setRoute('proyectos')} className="btn btn-ghost on-dark-bg" style={{ padding: '16px 28px', fontSize: 15 }}>
                <Editable id="hero.cta.secondary" defaultValue="Ver casos reales"/>
              </button>
            </div>
          </Reveal>

          {/* Stats strip — values now editable; tuned for a young company (no project counts) */}
          {sec.stats !== false && (
          <Reveal delay={520} y={20}>
            <div style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20, maxWidth: 900, margin: '80px auto 0' }} className="stats-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="glass" style={{ borderRadius: 16, padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
                    <Editable id={`stats.${i}.value`} defaultValue={['12', '11', '24h', '100%'][i-1]}/>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', wordBreak: 'break-word' }}>
                    <Editable id={`stats.${i}.label`} defaultValue={['Servicios tecnológicos', 'Paquetes estratégicos', 'Tiempo de respuesta', 'Soluciones a medida'][i-1]}/>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 2, color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fade-pulse 2s ease-in-out infinite alternate' }}>
          Scroll
          <div style={{ width: 1, height: 30, background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)' }}/>
        </div>
      </section>
      )}

      {/* SERVICES PREVIEW */}
      {sec.services !== false && (
      <section style={{ position: 'relative', padding: '120px 0', background: 'var(--bg-0)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Reveal><span className="section-eyebrow"><Editable id="services.eyebrow" defaultValue="Lo que hacemos"/></span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-h2" style={{ marginTop: 16 }}>
                <Editable id="services.title.pre" defaultValue="Construimos soluciones que"/>{' '}
                <span className="text-grad-blue"><Editable id="services.title.highlight" defaultValue="funcionan"/></span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="section-sub" style={{ margin: '20px auto 0' }}>
                <Editable id="services.subtitle" multiline defaultValue="Cada servicio sigue un proceso probado: diagnóstico, diseño, desarrollo, despliegue y soporte. Sin atajos, sin promesas vacías."/>
              </p>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="svc-grid">
            {serviceList.map((s, i) => {
              const I = Icon[s.icon];
              return (
                <Reveal key={s.id} delay={i * 80}>
                  <button onClick={() => setRoute(s.id)} className="svc-card" style={{
                    width: '100%', textAlign: 'left', padding: 28, borderRadius: 20,
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    cursor: 'pointer', position: 'relative', overflow: 'hidden',
                    transition: 'all 320ms var(--ease-out)',
                    color: 'var(--text-0)',
                  }}>
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${s.color}24, transparent 70%)`, filter: 'blur(20px)', opacity: 0.7 }}/>
                    <span style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: `${s.color}1A`, color: s.color, border: `1px solid ${s.color}30`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    }}><I size={24}/></span>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-0)', margin: '20px 0 6px', letterSpacing: '-0.01em', position: 'relative' }}>{s.name}</h3>
                    <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0, position: 'relative' }}>{s.tagline}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0', display: 'grid', gap: 8, position: 'relative' }}>
                      {s.bullets.slice(0, 3).map((b, j) => (
                        <li key={j} style={{ color: 'var(--text-1)', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Icon.Check size={13} stroke={s.color} sw={2.4}/> {b}
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 6, color: s.color, fontSize: 13, fontWeight: 600, position: 'relative' }}>
                      Conocer más <Icon.ArrowRight size={14}/>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
        <style>{`
          .svc-card:hover { transform: translateY(-6px); border-color: var(--card-border-hover) !important; background: var(--card-bg-hover) !important; }
          @media (max-width: 980px) { .svc-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 640px) { .svc-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 440px) { .stats-grid { grid-template-columns: 1fr !important; gap: 12px !important; } }
          @keyframes orb-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(40px, -30px) scale(1.1); } }
          @keyframes fade-pulse { from { opacity: 0.3; } to { opacity: 1; } }
        `}</style>
      </section>
      )}

      {/* TECH LOOP */}
      {sec.tech !== false && (
      <section style={{ position: 'relative', padding: '60px 0 120px', background: 'var(--bg-0)' }}>
        <div className="container" style={{ marginBottom: 40, textAlign: 'center' }}>
          <Reveal><span className="section-eyebrow"><Editable id="tech.eyebrow" defaultValue="Stack moderno"/></span></Reveal>
          <Reveal delay={100}>
            <h2 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(28px, 4vw, 48px)' }}>
              <Editable id="tech.title" defaultValue="Tecnologías con las que trabajamos"/>
            </h2>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <TechLoop list={TECH_LOGOS.slice(0, 12)} speed={50}/>
        </Reveal>
        <Reveal delay={300}>
          <div style={{ marginTop: 16 }}>
            <TechLoop list={TECH_LOGOS.slice(12)} speed={60} reverse/>
          </div>
        </Reveal>
      </section>
      )}

      {/* PROCESS */}
      {sec.process !== false && (
      <section style={{ position: 'relative', padding: '80px 0', background: 'var(--bg-0)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Reveal><span className="section-eyebrow"><Editable id="process.eyebrow" defaultValue="Proceso"/></span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-h2" style={{ marginTop: 16 }}>
                <Editable id="process.title" defaultValue="Cómo trabajamos contigo"/>
              </h2>
            </Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="process-grid">
            {[
              { n: '01', tKey: 'process.1.title', dKey: 'process.1.desc', t: 'Diagnóstico', d: 'Entendemos tu negocio, procesos y dolor real antes de proponer.' },
              { n: '02', tKey: 'process.2.title', dKey: 'process.2.desc', t: 'Diseño', d: 'UX, arquitectura y prototipo. Validamos antes de codificar.' },
              { n: '03', tKey: 'process.3.title', dKey: 'process.3.desc', t: 'Desarrollo', d: 'Sprints cortos, demos cada 2 semanas, código revisado.' },
              { n: '04', tKey: 'process.4.title', dKey: 'process.4.desc', t: 'Continuidad', d: 'Despliegue, capacitación y soporte continuo post-lanzamiento.' },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="glass" style={{ borderRadius: 16, padding: 28, height: '100%', position: 'relative' }}>
                  <div style={{ fontSize: 64, fontWeight: 800, color: 'rgba(34,211,238,0.28)', lineHeight: 1, letterSpacing: '-0.04em' }}>{p.n}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-0)', margin: '12px 0 8px' }}>
                    <Editable id={p.tKey} defaultValue={p.t}/>
                  </h3>
                  <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0, lineHeight: 1.55 }}>
                    <Editable id={p.dKey} multiline defaultValue={p.d}/>
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <style>{`@media (max-width: 980px) { .process-grid { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 580px) { .process-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>
      )}

      {/* CTA */}
      {sec.cta !== false && (
      <section style={{ position: 'relative', padding: '120px 0', background: 'var(--bg-0)' }}>
        <div className="container">
          <div className="glass-2" style={{
            position: 'relative', borderRadius: 32, padding: 'clamp(40px, 6vw, 80px)',
            overflow: 'hidden', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.12) 60%, rgba(34,211,238,0.18))',
            border: '1px solid rgba(34,211,238,0.3)',
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
              <NeuralNet density={40} color="#22D3EE" accent="#A78BFA" linkDist={120} opacity={0.4}/>
            </div>
            <div style={{ position: 'relative' }}>
              <Icon.Sparkle size={32} stroke="#22D3EE" style={{ marginBottom: 16 }}/>
              <h2 className="section-h2" style={{ fontSize: 'clamp(36px, 5vw, 56px)', color: '#fff' }}>
                <Editable id="cta.title" defaultValue="¿Listos para construir algo serio?"/>
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '20px auto 32px' }}>
                <Editable id="cta.subtitle" multiline defaultValue="Te respondemos en menos de 24 horas con un diagnóstico inicial gratuito."/>
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setRoute('contacto')} className="btn btn-primary" style={{ padding: '16px 28px' }}>
                  <Editable id="cta.primary" defaultValue="Empezar conversación"/> <Icon.ArrowRight size={16}/>
                </button>
                <button onClick={() => setRoute('servicios')} className="btn btn-ghost on-dark-bg" style={{ padding: '16px 28px' }}>
                  <Editable id="cta.secondary" defaultValue="Ver paquetes"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
}

window.Home = Home;
