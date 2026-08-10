// Projects page — folder-expand industries + featured cases + 11-package selector.

const CASES = [
  { id: 'vetai', industry: 'VetTech', client: 'VetAI Diagnóstico', year: '2025',
    color: '#06B6D4', icon: 'Stethoscope',
    title: 'Plataforma de diagnóstico veterinario asistido por IA',
    desc: 'Sistema multi-clínica con triaje inteligente, historia clínica electrónica y módulos de laboratorio. Reduce el tiempo de diagnóstico inicial en un 60%.',
    tags: ['React', 'Python', 'PostgreSQL', 'OpenAI API'],
    metrics: [{ k: '60%', v: 'menos tiempo de triaje' }, { k: '12', v: 'clínicas conectadas' }, { k: '4.8/5', v: 'NPS profesional' }] },
  { id: 'cafetech', industry: 'CoffeeTech', client: 'TrazaCafé', year: '2025',
    color: '#A78BFA', icon: 'Coffee',
    title: 'Trazabilidad de café desde la finca hasta la taza',
    desc: 'App móvil + dashboard que rastrea cada lote desde el cafetal: cosecha, fermentación, secado, exportación. Con QR público que el comprador final escanea.',
    tags: ['React Native', 'Node.js', 'PostgreSQL', 'AWS S3'],
    metrics: [{ k: '180+', v: 'fincas activas' }, { k: '3 países', v: 'Colombia · USA · Japón' }, { k: '+22%', v: 'precio FOB promedio' }] },
  { id: 'modaflow', industry: 'Fashion', client: 'ModaFlow', year: '2025',
    color: '#EC4899', icon: 'Star',
    title: 'Portal B2B de pedidos para marca de moda',
    desc: 'Catálogo con showroom virtual, carrito, gestión de pedidos por temporada, integración con producción y facturación electrónica DIAN.',
    tags: ['Next.js', '.NET', 'SQL Server', 'Stripe'],
    metrics: [{ k: '+45%', v: 'pedidos online' }, { k: '320', v: 'multimarcas activas' }, { k: '−70%', v: 'errores de pedido' }] },
];

function Projects({ setRoute }) {
  return (
    <div className="page" style={{ paddingTop: 110 }}>
      {/* HEADER */}
      <section style={{ position: 'relative', padding: '60px 0 40px' }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <Reveal><span className="section-eyebrow">Casos reales</span></Reveal>
          <Reveal delay={100}><h1 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(48px, 7vw, 88px)' }}>Proyectos que <span className="text-grad-violet">resuelven</span></h1></Reveal>
          <Reveal delay={200}><p className="section-sub" style={{ margin: '24px auto 0' }}>Trabajamos con empresas en agroindustria, salud animal, retail tecnológico, moda y más. Cada proyecto es una operación, no solo un sitio web.</p></Reveal>
        </div>
      </section>

      {/* INDUSTRIES — yellow folder */}
      <section style={{ position: 'relative', padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Reveal><span className="section-eyebrow" style={{ color: '#F59E0B' }}>Industrias</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(28px, 4vw, 44px)' }}>Una carpeta por sector</h2></Reveal>
          </div>
          <Reveal delay={200}>
            <FolderExpand onPickIndustry={(ind) => setRoute('contacto')}/>
          </Reveal>
        </div>
      </section>

      {/* FEATURED CASES */}
      <section style={{ position: 'relative', padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ marginBottom: 40 }}>
            <Reveal><span className="section-eyebrow">Casos destacados</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(32px, 4.5vw, 56px)' }}>Operaciones digitales en producción</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            {CASES.map((c, i) => {
              const I = Icon[c.icon];
              return (
                <Reveal key={c.id} delay={i * 120}>
                  <article className="glass case-card" style={{
                    borderRadius: 24, padding: 0, overflow: 'hidden',
                    display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', minHeight: 320,
                  }}>
                    <div style={{ padding: 'clamp(20px, 4vw, 40px)', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <span style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}1A`, color: c.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${c.color}40`, flexShrink: 0 }}><I size={20}/></span>
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', color: c.color, textTransform: 'uppercase' }}>{c.industry}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>· {c.year}</span>
                      </div>
                      <h3 style={{ fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 700, color: 'var(--text-0)', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{c.title}</h3>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>Cliente: {c.client}</div>
                      <p style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: 24 }}>{c.desc}</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                        {c.tags.map((t, j) => (
                          <span key={j} className="pill" style={{ fontSize: 11 }}>{t}</span>
                        ))}
                      </div>
                      <button onClick={() => setRoute('contacto')} style={{
                        background: 'transparent', border: 'none', color: c.color, fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: 0, minHeight: 44,
                      }}>Solicitar caso similar <Icon.ArrowRight size={14}/></button>
                    </div>
                    <div className="case-metrics" style={{
                      background: `linear-gradient(135deg, ${c.color}18, transparent 60%), rgba(255,255,255,0.02)`,
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      padding: 'clamp(20px, 4vw, 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24,
                    }}>
                      {c.metrics.map((m, j) => (
                        <div key={j}>
                          <div style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: 'var(--text-0)', letterSpacing: '-0.03em', lineHeight: 1 }}>{m.k}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <style>{`
            @media (max-width: 768px) {
              .case-card { grid-template-columns: 1fr !important; }
              .case-metrics { border-left: none !important; border-top: 1px solid rgba(255,255,255,0.06) !important; flex-direction: row !important; flex-wrap: wrap !important; }
            }
            @media (max-width: 480px) {
              .case-metrics { flex-direction: column !important; }
            }
            @media (max-width: 375px) {
              .case-card { minHeight: auto !important; }
            }
          `}</style>
        </div>
      </section>

      {/* PACKAGE SELECTOR */}
      <section style={{ position: 'relative', padding: '80px 0 120px' }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <Reveal><span className="section-eyebrow">11 paquetes especializados</span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                Encuentra el <span className="text-grad-blue">match</span> para tu etapa
              </h2>
            </Reveal>
            <Reveal delay={200}><p className="section-sub" style={{ marginTop: 16 }}>Desde validar una idea hasta operar una plataforma SaaS robusta. Cada paquete tiene alcance, entregables y tiempo definidos.</p></Reveal>
          </div>
          <Reveal delay={320}>
            <PackageCarousel onCTA={() => setRoute('contacto')}/>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

window.Projects = Projects;
