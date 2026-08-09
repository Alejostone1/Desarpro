function Footer({ setRoute }) {
  const t = useTranslations();
  const go = (r) => setRoute(r);
  return (
    <footer style={{
      position: 'relative', marginTop: 100, padding: '64px 0 32px',
      borderTop: '1px solid var(--glass-border)',
      background: 'linear-gradient(180deg, transparent, rgba(6,182,212,0.04))',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <Logo size={40}/>
            <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.65, marginTop: 18, maxWidth: 320 }}>
              {t('footer.description')}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {['Github', 'Linkedin', 'Whatsapp', 'Instagram'].map(n => {
                const I = Icon[n];
                return (
                  <a key={n} href="#" style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'var(--glass-bg-3)', border: '1px solid var(--glass-border)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-1)', textDecoration: 'none',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#22D3EE'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'; e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass-bg-3)'; }}
                  ><I size={16}/></a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-0)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 18 }}>{t('footer.nav.title')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {[['home', t('footer.nav.home')],['proyectos', t('footer.nav.projects')],['nosotros', t('footer.nav.about')],['servicios', t('footer.nav.services')],['contacto', t('footer.nav.contact')]].map(([id, label]) => (
                <li key={id}><a onClick={() => go(id)} style={{ color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.currentTarget.style.color = '#22D3EE'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-0)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 18 }}>{t('footer.services.title')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {[['svc-web',t('footer.services.web')],['svc-mobile',t('footer.services.mobile')],['svc-software',t('footer.services.software')],['svc-maintenance',t('footer.services.support')],['svc-consulting',t('footer.services.consulting')],['svc-seo',t('footer.services.seo')]].map(([id, label]) => (
                <li key={id}><a onClick={() => go(id)} style={{ color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#22D3EE'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-0)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 18 }}>{t('footer.contact.title')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)', fontSize: 14 }}><Icon.Mail size={15}/> {t('footer.contact.email')}</li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)', fontSize: 14 }}><Icon.MapPin size={15}/> {t('footer.contact.location')}</li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-2)', fontSize: 14 }}><Icon.Clock size={15}/> {t('footer.contact.hours')}</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>© 2025–{new Date().getFullYear()} DesarPro. {t('footer.rights')}</span>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{t('footer.madeWith')} <span style={{ color: '#EC4899' }}>♥</span> {t('footer.inColombia')}</span>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
