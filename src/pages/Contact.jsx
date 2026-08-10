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
  const t = useTranslations();
  const [state, setState] = React.useState({ name: '', email: '', company: '', service: 'svc-software', budget: '$5k–$15k', msg: '' });
  const [status, setStatus] = React.useState('idle'); // idle | focused | typing | submitting | success | error
  const [errors, setErrors] = React.useState({});
  const [assistantState, setAssistantState] = React.useState('idle');
  const [activeField, setActiveField] = React.useState(null);
  const [typing, setTyping] = React.useState(false);
  const [hudMessage, setHudMessage] = React.useState(t('assistant.name'));
  const [mousePosition, setMousePosition] = React.useState({ x: 0.5, y: 0.45 });
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const sectionRef = React.useRef(null);
  const mouseFrameRef = React.useRef(null);
  const resetTimerRef = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  React.useEffect(() => () => {
    if (mouseFrameRef.current) cancelAnimationFrame(mouseFrameRef.current);
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
  }, []);

  const validate = () => {
    const e = {};
    if (!state.name.trim()) e.name = t('contact.validation.nameRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = t('contact.validation.emailInvalid');
    if (!state.msg.trim()) e.msg = t('contact.validation.messageRequired');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFieldFocus = React.useCallback((field, nextState, message) => {
    setStatus('focused');
    setActiveField(field);
    setAssistantState(nextState);
    setHudMessage(message);
    setTyping(false);
  }, []);

  const handleBlur = React.useCallback(() => {
    if (status === 'submitting' || status === 'success' || status === 'error') return;
    setStatus('idle');
    setAssistantState('idle');
    setHudMessage('DESARPRO AI');
    setTyping(false);
    setActiveField(null);
  }, [status]);

  const handleMouseMove = React.useCallback((event) => {
    if (reducedMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const next = { x, y };
    if (mouseFrameRef.current) return;
    mouseFrameRef.current = requestAnimationFrame(() => {
      setMousePosition(next);
      mouseFrameRef.current = null;
    });
  }, [reducedMotion]);

  const resetAssistant = React.useCallback((delay = 1200) => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      setAssistantState('idle');
      setHudMessage(t('assistant.name'));
      setTyping(false);
      setActiveField(null);
      setStatus('idle');
      resetTimerRef.current = null;
    }, delay);
  }, []);

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) {
      setStatus('error');
      setAssistantState('error');
      setHudMessage(t('assistant.status.error'));
      setTyping(false);
      resetAssistant(1400);
      return;
    }
    setStatus('submitting');
    setAssistantState('processing');
    setHudMessage(t('assistant.status.analyzing'));
    setTyping(false);
    setTimeout(() => {
      setStatus('success');
      setAssistantState('success');
      setHudMessage(t('assistant.status.success'));
      resetAssistant(1400);
    }, 1400);
  };

  const update = (k, v) => {
    setState(s => ({ ...s, [k]: v }));
    setTyping(true);
    if (status !== 'submitting' && status !== 'success' && status !== 'error') {
      setStatus('typing');
    }
    if (k === 'service') {
      setAssistantState('processing');
      setHudMessage(t('assistant.status.processing'));
    } else if (k === 'budget') {
      setAssistantState('processing');
      setHudMessage(t('assistant.status.processing'));
    } else {
      setAssistantState('typing');
      setHudMessage(t('assistant.status.processing'));
    }
  };

  const interactionTiltX = reducedMotion ? 0 : (mousePosition.x - 0.5) * 7;
  const interactionTiltY = reducedMotion ? 0 : (mousePosition.y - 0.5) * -7;
  const formTiltX = reducedMotion ? 0 : (mousePosition.x - 0.5) * 4.5;
  const formTiltY = reducedMotion ? 0 : (mousePosition.y - 0.5) * -4.5;

  return (
    <div className="page" style={{ paddingTop: 110 }}>
      <section ref={sectionRef} onMouseMove={handleMouseMove} onMouseLeave={() => setMousePosition({ x: 0.5, y: 0.45 })} style={{ position: 'relative', padding: '40px 0 80px', overflow: 'hidden', background: 'linear-gradient(180deg, var(--bg-0) 0%, rgba(15,23,42,0.8) 100%)' }}>
        {/* Animated background layers */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <NeuralNet density={45} color="#22D3EE" accent="#A78BFA" linkDist={140} opacity={0.4}/>
        </div>

        {/* Animated orbital lights */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* Primary cyan orb (top-left) */}
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.25), transparent 65%)', filter: 'blur(50px)', left: '-12%', top: '-15%', animation: 'floatOrb 9s ease-in-out infinite', boxShadow: '0 0 80px rgba(34,211,238,0.4)' }}/>

          {/* Secondary violet orb (bottom-right) */}
          <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.22), transparent 65%)', filter: 'blur(45px)', right: '-8%', bottom: '-10%', animation: 'floatOrb 11s ease-in-out infinite reverse', boxShadow: '0 0 70px rgba(167,139,250,0.35)' }}/>

          {/* Accent glow (center) */}
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)', filter: 'blur(60px)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', animation: 'pulse 6s ease-in-out infinite' }}/>

          {/* Animated scan lines */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.08) 0px, rgba(34,211,238,0.08) 2px, transparent 2px, transparent 4px)', animation: 'scanlines 8s linear infinite', opacity: 0.5 }}/>

          {/* Energy waves */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <defs>
              <filter id="glow-effect">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="1" filter="url(#glow-effect)" style={{ animation: 'expand-wave 4s ease-out infinite' }}/>
            <circle cx="50%" cy="50%" r="200" fill="none" stroke="rgba(167,139,250,0.12)" strokeWidth="1" filter="url(#glow-effect)" style={{ animation: 'expand-wave 4s ease-out infinite 0.8s' }}/>
          </svg>
        </div>

        {/* Vignette overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none' }}/>

        <div className="container" style={{ position: 'relative', transform: `perspective(1200px) rotateX(${interactionTiltY * 0.18}deg) rotateY(${interactionTiltX * 0.2}deg)`, transition: 'transform 220ms ease-out' }}>
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
              <HoloAssistant
                formState={status}
                assistantState={assistantState}
                activeField={activeField}
                mousePosition={mousePosition}
                typing={typing}
                hudMessage={hudMessage}
                reducedMotion={reducedMotion}
              />
            </Reveal>

            {/* Right: Form */}
            <Reveal delay={120}>
              <div className="glass-2" style={{ borderRadius: 24, padding: 'clamp(20px, 4vw, 36px)', transform: `perspective(1000px) rotateX(${formTiltY * 0.18}deg) rotateY(${formTiltX * 0.2}deg) translateY(${status === 'success' ? 0 : 3}px)`, transition: 'transform 220ms ease-out, box-shadow 220ms ease-out', boxShadow: status === 'success' ? '0 24px 80px rgba(16,185,129,0.18)' : '0 16px 50px rgba(2,6,23,0.25)', animation: status === 'submitting' ? 'cardPulse 1.2s ease-in-out infinite' : 'none' }}>
                {status === 'success' ? (
                  <div style={{ textAlign: 'center', padding: '30px 0' }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', marginBottom: 20, animation: 'success-pop 600ms cubic-bezier(0.16,1,0.3,1)' }}>
                      <Icon.Check size={32} sw={3}/>
                    </div>
                    <h3 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 8px' }}>
                      <Editable id="contact.success.title" defaultValue="¡Mensaje recibido!"/>
                    </h3>
                    <p style={{ fontSize: 15, color: 'var(--text-2)', margin: '0 0 24px' }}>
                      <Editable id="contact.success.subtitle" defaultValue="Te respondemos en menos de 24 horas hábiles."/>
                    </p>
                    <button onClick={() => { setStatus('idle'); setAssistantState('idle'); setHudMessage(t('assistant.name')); setTyping(false); setActiveField(null); setState({ name: '', email: '', company: '', service: 'svc-software', budget: '$5k–$15k', msg: '' }); if (resetTimerRef.current) clearTimeout(resetTimerRef.current); }} className="btn btn-ghost" style={{ minHeight: 44 }}>{t('contact.form.anotherMessage')}</button>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-0)', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon.Send size={16} stroke="#22D3EE"/>
                      <Editable id="contact.form.title" defaultValue="Cuéntanos sobre tu proyecto"/>
                    </h3>
                    <div style={{ display: 'grid', gap: 14 }}>
                      <ContactFormField label={t('contact.form.name')} error={errors.name}>
                        <input type="text" value={state.name} onChange={e => update('name', e.target.value)} onFocus={() => handleFieldFocus('name', 'listening', t('assistant.status.listening'))} onBlur={handleBlur} placeholder={t('contact.form.namePlaceholder')} className="input" style={{ minHeight: 44 }}/>
                      </ContactFormField>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                        <ContactFormField label={t('contact.form.email')} error={errors.email}>
                          <input type="email" value={state.email} onChange={e => update('email', e.target.value)} onFocus={() => handleFieldFocus('email', 'listening', t('assistant.status.thinking'))} onBlur={handleBlur} placeholder={t('contact.form.emailPlaceholder')} className="input" style={{ minHeight: 44 }}/>
                        </ContactFormField>
                        <ContactFormField label={t('contact.form.company')}>
                          <input type="text" value={state.company} onChange={e => update('company', e.target.value)} onFocus={() => handleFieldFocus('company', 'processing', t('assistant.status.processing'))} onBlur={handleBlur} placeholder={t('contact.form.companyPlaceholder')} className="input" style={{ minHeight: 44 }}/>
                        </ContactFormField>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                        <ContactFormField label={t('contact.form.service')}>
                          <select value={state.service} onChange={e => update('service', e.target.value)} onFocus={() => handleFieldFocus('service', 'processing', t('assistant.status.processing'))} onBlur={handleBlur} className="input" style={{ minHeight: 44 }}>
                            <option value="svc-web">{t('services.web.name')}</option>
                            <option value="svc-mobile">{t('services.mobile.name')}</option>
                            <option value="svc-software">{t('services.software.name')}</option>
                            <option value="svc-ai">{t('services.ai.name')}</option>
                            <option value="svc-security">{t('services.security.name')}</option>
                            <option value="svc-consulting">{t('services.consulting.name')}</option>
                            <option value="svc-seo">{t('services.seo.name')}</option>
                            <option value="other">{t('common.optional')}</option>
                          </select>
                        </ContactFormField>
                        <ContactFormField label={t('contact.form.budget')}>
                          <select value={state.budget} onChange={e => update('budget', e.target.value)} onFocus={() => handleFieldFocus('budget', 'processing', t('assistant.status.processing'))} onBlur={handleBlur} className="input" style={{ minHeight: 44 }}>
                            <option>{'< $5k USD'}</option>
                            <option>$5k–$15k</option>
                            <option>$15k–$50k</option>
                            <option>{'> $50k'}</option>
                            <option>{t('contact.form.budgetUndecided')}</option>
                          </select>
                        </ContactFormField>
                      </div>
                      <ContactFormField label={t('contact.form.message')} error={errors.msg}>
                        <textarea rows={4} value={state.msg} onChange={e => update('msg', e.target.value)} onFocus={() => handleFieldFocus('message', 'listening', t('assistant.status.listening'))} onBlur={handleBlur} placeholder={t('contact.form.messagePlaceholder')} className="input" style={{ resize: 'vertical', minHeight: 100 }}/>
                      </ContactFormField>
                      <button type="submit" className="btn btn-primary" disabled={status === 'submitting'} style={{ marginTop: 8, padding: '14px 24px', justifyContent: 'center', minHeight: 48 }}>
                        {status === 'submitting' ? <><span className="spinner"/> {t('contact.form.submitting')}</> : <>{t('contact.form.submit')} <Icon.ArrowRight size={14}/></> }
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
                  <div key={i} className="glass" style={{ borderRadius: 16, padding: 24, display: 'flex', gap: 16, alignItems: 'center', transform: `perspective(900px) rotateX(${interactionTiltY * 0.12}deg) rotateY(${interactionTiltX * 0.14}deg)`, transition: 'transform 220ms ease-out' }}>
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
          @keyframes floatOrb { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(25px,-30px,0) scale(1.08); } 100% { transform: translate3d(0,0,0) scale(1); } }
          @keyframes scanlines { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
          @keyframes expand-wave { 0% { r: 20; opacity: 1; } 100% { r: 400; opacity: 0; } }
          @keyframes cardPulse { 0%, 100% { box-shadow: 0 20px 60px rgba(34,211,238,0.16); } 50% { box-shadow: 0 30px 90px rgba(34,211,238,0.28); } }
          @keyframes floatCard { 0%, 100% { transform: translateY(0px) rotateX(0deg); } 50% { transform: translateY(-12px) rotateX(1deg); } }
          @keyframes holoBreathe { 0%, 100% { filter: drop-shadow(0 0 20px rgba(34,211,238,0.6)); } 50% { filter: drop-shadow(0 0 40px rgba(34,211,238,0.9)) drop-shadow(0 0 60px rgba(167,139,250,0.6)); } }
          @keyframes formFloat { 0%, 100% { transform: translateY(0px); } 33% { transform: translateY(-8px); } 66% { transform: translateY(4px); } }
          @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .holo-stage { animation: holoBreathe 4s ease-in-out infinite !important; }
          @media (prefers-reduced-motion: no-preference) { .glass-2 { animation: formFloat 6s ease-in-out infinite; } }
          @media (max-width: 980px) { .contact-grid { grid-template-columns: 1fr !important; } .contact-info { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </div>
  );
}

window.Contact = Contact;
window.ContactFormField = ContactFormField;
