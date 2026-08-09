// About — mission, vision, values, timeline 2025.

function About({ setRoute }) {
  return (
    <div className="page" style={{ paddingTop: 110 }}>
      <section style={{ position: 'relative', padding: '60px 0 40px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <NeuralNet density={50} color="#A78BFA" accent="#EC4899" linkDist={140} opacity={0.4}/>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, transparent, var(--bg-0) 70%)', pointerEvents: 'none' }}/>
        <div className="container" style={{ position: 'relative', textAlign: 'center' }}>
          <Reveal><span className="section-eyebrow">Sobre nosotros</span></Reveal>
          <Reveal delay={100}>
            <h1 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(48px, 7vw, 88px)' }}>
              Somos un equipo que <span className="text-grad-violet">construye</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="section-sub" style={{ margin: '24px auto 0' }}>
              DesarPro nació en Pereira, Colombia, con una idea simple: las empresas no necesitan más promesas tecnológicas, necesitan sistemas que funcionen. Nos especializamos en software a medida con base sólida.
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
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#22D3EE', margin: '20px 0 12px', position: 'relative' }}>Misión</h3>
                <p style={{ fontSize: 18, color: 'var(--text-0)', lineHeight: 1.55, margin: 0, fontWeight: 500, position: 'relative' }}>
                  Construir tecnología que resuelva problemas reales de negocio para empresas en Colombia y Latinoamérica, con foco en operación, control y crecimiento medible.
                </p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="glass-2" style={{ borderRadius: 24, padding: 40, height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.25), transparent 70%)', filter: 'blur(30px)' }}/>
                <span style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(167,139,250,0.12)', color: '#A78BFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(167,139,250,0.3)', position: 'relative' }}>
                  <Icon.Telescope size={26}/>
                </span>
                <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#A78BFA', margin: '20px 0 12px', position: 'relative' }}>Visión</h3>
                <p style={{ fontSize: 18, color: 'var(--text-0)', lineHeight: 1.55, margin: 0, fontWeight: 500, position: 'relative' }}>
                  Ser para 2030 el aliado tecnológico de referencia para PYMEs y startups en LATAM que quieran escalar con software propio, datos confiables e inteligencia aplicada.
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
            <Reveal><span className="section-eyebrow">Valores</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12 }}>Cómo decidimos cada día</h2></Reveal>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="val-grid">
            {[
              { icon: 'Lightbulb', name: 'Claridad', d: 'Decimos lo que sabemos hacer y lo que no. Sin venta inflada.', c: '#F59E0B' },
              { icon: 'Heart', name: 'Compromiso', d: 'Nos hacemos cargo de lo que entregamos, antes y después.', c: '#EC4899' },
              { icon: 'Award', name: 'Calidad', d: 'Código revisado, testeado y documentado. No "funciona en mi máquina".', c: '#22D3EE' },
              { icon: 'Handshake', name: 'Cercanía', d: 'Hablas con quien construye. No hay capas que te alejen del equipo.', c: '#10B981' },
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

      {/* TIMELINE 2025 */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Reveal><span className="section-eyebrow">Timeline 2025</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12 }}>Nuestro primer año</h2></Reveal>
          </div>
          <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: 30, top: 12, bottom: 12, width: 2, background: 'linear-gradient(180deg, #22D3EE, #A78BFA, #EC4899)', borderRadius: 2 }}/>
            {[
              { mo: 'Ene 2025', t: 'Fundación', d: 'DesarPro nace en Pereira con un equipo de 3 desarrolladores y la convicción de hacer las cosas bien.', c: '#22D3EE' },
              { mo: 'Mar 2025', t: 'Primer cliente enterprise', d: 'Lanzamos la primera plataforma SaaS multi-tenant para una marca de moda colombiana.', c: '#3B82F6' },
              { mo: 'Jun 2025', t: 'Vertical VetTech', d: 'Iniciamos especialización en salud veterinaria con la primera versión de VetAI.', c: '#A78BFA' },
              { mo: 'Sep 2025', t: 'Internacionalización', d: 'Primer cliente fuera de Colombia: trazabilidad de café para cooperativa exportadora.', c: '#EC4899' },
              { mo: 'Dic 2025', t: '11 paquetes definidos', d: 'Estructuramos nuestra oferta en 11 paquetes especializados que cubren todo el ciclo de vida.', c: '#F59E0B' },
            ].map((m, i) => (
              <Reveal key={i} delay={i * 100}>
                <div style={{ display: 'flex', gap: 24, paddingLeft: 4, paddingBottom: 36, position: 'relative' }}>
                  <div style={{
                    width: 60, height: 60, flexShrink: 0, borderRadius: '50%',
                    background: 'var(--bg-1)', border: `2px solid ${m.c}`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: m.c, fontWeight: 800, fontSize: 11, lineHeight: 1.1, textAlign: 'center', padding: 4,
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
            <h3 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 12px' }}>¿Quieres trabajar con nosotros?</h3>
            <p style={{ fontSize: 16, color: 'var(--text-1)', maxWidth: 500, margin: '0 auto 24px' }}>
              Estamos creciendo. Si te apasiona construir software con propósito, conversemos.
            </p>
            <button onClick={() => setRoute('contacto')} className="btn btn-primary">Hablemos <Icon.ArrowRight size={14}/></button>
          </div>
        </div>
      </section>
    </div>
  );
}

window.About = About;
