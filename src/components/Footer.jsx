function Footer({ setRoute }) {
  const go = (r) => setRoute(r);
  return (
    <footer style={{
      position: 'relative', marginTop: 100, padding: '64px 0 32px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      background: 'linear-gradient(180deg, transparent, rgba(6,182,212,0.04))',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
          <div>
            <Logo size={40}/>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.65, marginTop: 18, maxWidth: 320 }}>
              Construimos sistemas que generan operación, control y crecimiento real para empresas en Colombia y Latinoamérica.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {['Github', 'Linkedin', 'Whatsapp', 'Instagram'].map(n => {
                const I = Icon[n];
                return (
                  <a key={n} href="#" style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
                    transition: 'all 200ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#22D3EE'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'; e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  ><I size={16}/></a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 18 }}>Navegación</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {[['home','Inicio'],['proyectos','Proyectos'],['nosotros','Nosotros'],['servicios','Servicios'],['contacto','Contacto']].map(([id, label]) => (
                <li key={id}><a onClick={() => go(id)} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, textDecoration: 'none', transition: 'color 200ms' }} onMouseEnter={e => e.currentTarget.style.color = '#22D3EE'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 18 }}>Servicios</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {[['svc-web','Desarrollo Web'],['svc-mobile','Apps Móviles'],['svc-software','Software a Medida'],['svc-maintenance','Soporte'],['svc-consulting','Consultoría'],['svc-seo','SEO']].map(([id, label]) => (
                <li key={id}><a onClick={() => go(id)} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.color = '#22D3EE'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>{label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 0, marginBottom: 18 }}>Contacto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}><Icon.Mail size={15}/> contacto@desarpro.co</li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}><Icon.MapPin size={15}/> Pereira, Colombia</li>
              <li style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}><Icon.Clock size={15}/> Lun–Vie · 8am–6pm</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2025–2026 DesarPro. Todos los derechos reservados.</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Hecho con <span style={{ color: '#EC4899' }}>♥</span> en Pereira, Colombia</span>
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
