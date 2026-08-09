// Contact — holographic AI assistant scene + native form with Editable fields.

function ContactFormField({ label, error, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '0.02em' }}>
        <span>{label}</span>
        {error && <span style={{ color: '#EF4444' }}>{error}</span>}
      </span>
      {children}
    </label>
  );
}

function Contact() {
  const [state, setState] = React.useState({ name: '', email: '', company: '', service: 'svc-software', budget: '$5k–$15k', msg: '' });
  const [status, setStatus] = React.useState('idle'); // idle | focused | typing | submitting | success
  const [errors, setErrors] = React.useState({});

  const validate = () => {
    const e = {};
    if (!state.name.trim()) e.name = 'Tu nombre';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = 'Email válido';
    if (!state.msg.trim()) e.msg = 'Cuéntanos algo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setTimeout(() => setStatus('success'), 1400);
  };

  const update = (k, v) => {
    setState(s => ({ ...s, [k]: v }));
    if (status === 'focused') setStatus('typing');
  };

  return (
    <div className="page" style={{ paddingTop: 110 }}>
      <section style={{ position: 'relative', padding: '40px 0 80px', overflow: 'hidden', background: 'var(--bg-0)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
          <NeuralNet density={45} color="#22D3EE" accent="#A78BFA" linkDist={140} opacity={0.4}/>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, transparent, var(--bg-0) 75%)', pointerEvents: 'none' }}/>

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Reveal><span className="section-eyebrow"><Editable id="contact.eyebrow" defaultValue="Contacto"/></span></Reveal>
            <Reveal delay={100}>
              <h1 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(40px, 6vw, 76px)' }}>
                <Editable id="contact.title.pre" defaultValue="Hagamos algo"/>{' '}
                <span className="text-grad-blue"><Editable id="contact.title.highlight" defaultValue="juntos"/></span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="section-sub" style={{ margin: '20px auto 0' }}>
                <Editable id="contact.subtitle" multiline defaultValue="Escríbenos sobre tu proyecto. Te responderemos en menos de 24 horas hábiles con un primer diagnóstico."/>
              </p>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 40, alignItems: 'center', marginTop: 40 }} className="contact-grid">
            {/* Left: Holographic AI assistant */}
            <Reveal>
              <HoloAssistant formState={status}/>
            </Reveal>

            {/* Right: Form */}
            <Reveal delay={120}>
              <div className="glass-2" style={{ borderRadius: 24, padding: 36 }}>
                {status === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: 20, animation: 'success-pop 600ms cubic-bezier(0.16,1,0.3,1)' }}>
                      <Icon.Check size={32} sw={3}/>
                    </div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px' }}>
                      <Editable id="contact.success.title" defaultValue="¡Mensaje recibido!"/>
                    </h3>
                    <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 24px' }}>
                      <Editable id="contact.success.subtitle" defaultValue="Te respondemos en menos de 24 horas hábiles."/>
                    </p>
                    <button onClick={() => { setStatus('idle'); setState({ name: '', email: '', company: '', service: 'svc-software', budget: '$5k–$15k', msg: '' }); }} className="btn btn-ghost">Enviar otro</button>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon.Send size={16} stroke="#22D3EE"/>
                      <Editable id="contact.form.title" defaultValue="Cuéntanos sobre tu proyecto"/>
                    </h3>
                    <div style={{ display: 'grid', gap: 14 }}>
                      <ContactFormField label="Nombre" error={errors.name}>
                        <input type="text" value={state.name} onChange={e => update('name', e.target.value)} onFocus={() => setStatus('focused')} onBlur={() => setStatus('idle')} placeholder="Tu nombre" className="input"/>
                      </ContactFormField>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <ContactFormField label="Email" error={errors.email}>
                          <input type="email" value={state.email} onChange={e => update('email', e.target.value)} onFocus={() => setStatus('focused')} onBlur={() => setStatus('idle')} placeholder="tu@empresa.com" className="input"/>
                        </ContactFormField>
                        <ContactFormField label="Empresa">
                          <input type="text" value={state.company} onChange={e => update('company', e.target.value)} onFocus={() => setStatus('focused')} onBlur={() => setStatus('idle')} placeholder="Opcional" className="input"/>
                        </ContactFormField>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <ContactFormField label="Servicio">
                          <select value={state.service} onChange={e => update('service', e.target.value)} className="input">
                            <option value="svc-web">Desarrollo Web</option>
                            <option value="svc-mobile">App Móvil</option>
                            <option value="svc-software">Software a Medida</option>
                            <option value="svc-ai">IA / Machine Learning</option>
                            <option value="svc-security">Ciberseguridad</option>
                            <option value="svc-consulting">Consultoría</option>
                            <option value="svc-seo">SEO</option>
                            <option value="other">Otro</option>
                          </select>
                        </ContactFormField>
                        <ContactFormField label="Presupuesto">
                          <select value={state.budget} onChange={e => update('budget', e.target.value)} className="input">
                            <option>{'< $5k USD'}</option>
                            <option>$5k–$15k</option>
                            <option>$15k–$50k</option>
                            <option>{'> $50k'}</option>
                            <option>Aún no definido</option>
                          </select>
                        </ContactFormField>
                      </div>
                      <ContactFormField label="Mensaje" error={errors.msg}>
                        <textarea rows={4} value={state.msg} onChange={e => update('msg', e.target.value)} onFocus={() => setStatus('focused')} onBlur={() => setStatus('idle')} placeholder="Cuéntanos sobre tu idea, contexto y resultado esperado..." className="input" style={{ resize: 'vertical', minHeight: 100 }}/>
                      </ContactFormField>
                      <button type="submit" className="btn btn-primary" disabled={status === 'submitting'} style={{ marginTop: 8, padding: '14px 24px', justifyContent: 'center' }}>
                        {status === 'submitting' ? <><span className="spinner"/> Enviando...</> : <>Enviar mensaje <Icon.ArrowRight size={14}/></>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Reveal>
          </div>

          {/* CONTACT INFO STRIP */}
          <Reveal delay={300}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 60 }} className="contact-info">
              {[
                { icon: 'Mail', titleK: 'contact.info.email.title', titleD: 'Email', valK: 'contact.email', valD: 'info@desarpro.com', subK: 'contact.info.email.sub', subD: 'Respuesta en 24h' },
                { icon: 'Whatsapp', titleK: 'contact.info.wa.title', titleD: 'WhatsApp', valK: 'contact.whatsapp', valD: '+57 300 000 0000', subK: 'contact.info.wa.sub', subD: 'Lun-Vie 8am-6pm' },
                { icon: 'MapPin', titleK: 'contact.info.loc.title', titleD: 'Oficina', valK: 'contact.location', valD: 'Pereira, Colombia', subK: 'contact.info.loc.sub', subD: 'Trabajamos remoto LATAM' },
              ].map((c, i) => {
                const I = Icon[c.icon];
                return (
                  <div key={i} className="glass" style={{ borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'rgba(34,211,238,0.15)', color: '#22D3EE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34,211,238,0.3)' }}><I size={20}/></span>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                        <Editable id={c.titleK} defaultValue={c.titleD}/>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-0)', marginTop: 2 }}>
                        <Editable id={c.valK} defaultValue={c.valD}/>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                        <Editable id={c.subK} defaultValue={c.subD}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        <style>{`
          @keyframes success-pop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @media (max-width: 980px) { .contact-grid { grid-template-columns: 1fr !important; } .contact-info { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </div>
  );
}

window.Contact = Contact;
window.ContactFormField = ContactFormField;
