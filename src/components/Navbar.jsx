// Navbar — premium glass header with enlarged logo and theme toggle.
// Always has gray glass background (logo readable on light/dark).

const ROUTES = {
  home: 'Inicio',
  proyectos: 'Proyectos',
  nosotros: 'Nosotros',
  contacto: 'Contacto',
};

function Navbar({ route, setRoute }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [openServices, setOpenServices] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [lang, setLang] = React.useState('ES');

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r) => { setRoute(r); setOpenServices(false); setOpenMobile(false); };

  const coreServices = [
    { id: 'svc-web', name: 'Desarrollo Web', icon: 'Globe', color: '#3B82F6', desc: 'Sitios y portales modernos' },
    { id: 'svc-mobile', name: 'Aplicaciones Móviles', icon: 'Smartphone', color: '#8B5CF6', desc: 'iOS, Android y cross-platform' },
    { id: 'svc-software', name: 'Software a Medida', icon: 'Layers', color: '#F97316', desc: 'ERP, CRM, plataformas SaaS' },
    { id: 'svc-maintenance', name: 'Mantenimiento y Soporte', icon: 'Wrench', color: '#F59E0B', desc: 'Soporte continuo y evolución' },
    { id: 'svc-consulting', name: 'Consultoría TI', icon: 'Compass', color: '#A855F7', desc: 'Estrategia y arquitectura' },
    { id: 'svc-seo', name: 'SEO y Posicionamiento', icon: 'Search', color: '#14B8A6', desc: 'Crecimiento orgánico medible' },
  ];
  const specialized = [
    { id: 'svc-ai', name: 'IA Aplicada', icon: 'Brain', color: '#EC4899' },
    { id: 'svc-security', name: 'Ciberseguridad', icon: 'Shield', color: '#EF4444' },
    { id: 'svc-cloud', name: 'DevOps & Cloud', icon: 'Cloud', color: '#06B6D4' },
    { id: 'svc-data', name: 'Bases de Datos', icon: 'Database', color: '#10B981' },
    { id: 'svc-bi', name: 'Analítica & BI', icon: 'BarChart', color: '#F59E0B' },
    { id: 'svc-api', name: 'Integración APIs', icon: 'Plug', color: '#8B5CF6' },
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 320ms var(--ease-out)',
      background: scrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid var(--header-border)',
      boxShadow: scrolled ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
    }}>
      <div style={{
        maxWidth: 1440, margin: '0 auto', padding: scrolled ? '12px 24px' : '16px 24px',
        display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between',
        transition: 'padding 280ms var(--ease-out)',
      }}>
        <a onClick={() => go('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Logo size={scrolled ? 50 : 58} animated />
        </a>

        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {Object.entries(ROUTES).map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="nav-link" style={{
              background: 'transparent', border: 'none',
              color: route === id ? 'var(--text-0)' : 'var(--text-2)',
              fontSize: 14, fontWeight: 600, padding: '10px 16px', borderRadius: 999,
              cursor: 'pointer', position: 'relative', transition: 'color 200ms',
              fontFamily: 'inherit',
            }}>
              {label}
              {route === id && <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 8px #22D3EE' }}/>}
            </button>
          ))}
          <div onMouseEnter={() => setOpenServices(true)} onMouseLeave={() => setOpenServices(false)} style={{ position: 'relative' }}>
            <button className="nav-link" style={{
              background: 'transparent', border: 'none',
              color: route?.startsWith('svc') || route === 'servicios' ? 'var(--text-0)' : 'var(--text-2)',
              fontSize: 14, fontWeight: 600, padding: '10px 16px', borderRadius: 999,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'inherit',
            }} onClick={() => go('servicios')}>
              Servicios <Icon.ChevronDown size={14}/>
            </button>
            {openServices && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                marginTop: 8, width: 720, padding: 24, borderRadius: 20,
                background: 'var(--glass-bg-3)', backdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid var(--glass-border-2)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                animation: 'fade-in-down 240ms var(--ease-out)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--cyan-bright)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Servicios principales</div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {coreServices.map(s => {
                        const I = Icon[s.icon];
                        return (
                          <button key={s.id} onClick={() => go(s.id)} className="svc-row" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                            borderRadius: 10, background: 'transparent', border: '1px solid transparent',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 200ms',
                            fontFamily: 'inherit', color: 'var(--text-0)',
                          }}>
                            <span style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: `${s.color}22`, color: s.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${s.color}30`,
                            }}><I size={18}/></span>
                            <span style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)' }}>{s.name}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.desc}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--violet-bright)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Especializados</div>
                    <div style={{ display: 'grid', gap: 4 }}>
                      {specialized.map(s => {
                        const I = Icon[s.icon];
                        return (
                          <button key={s.id} onClick={() => go(s.id)} className="svc-row" style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                            borderRadius: 10, background: 'transparent', border: '1px solid transparent',
                            cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                            color: 'var(--text-0)',
                          }}>
                            <span style={{
                              width: 30, height: 30, borderRadius: 8,
                              background: `${s.color}22`, color: s.color,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `1px solid ${s.color}30`,
                            }}><I size={15}/></span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => go('servicios')} style={{
                      marginTop: 16, padding: '10px 14px', width: '100%',
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(6,182,212,0.18))',
                      border: '1px solid rgba(34,211,238,0.35)', borderRadius: 10,
                      color: '#22D3EE', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontFamily: 'inherit',
                    }}>Ver todos los servicios <Icon.ArrowRight size={14}/></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle size={38}/>
          <button onClick={() => setLang(lang === 'ES' ? 'EN' : lang === 'EN' ? 'PT' : 'ES')} style={{
            background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)', color: 'var(--text-1)',
            padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          }}><Icon.Globe size={14}/> {lang}</button>
          <button onClick={() => go('login')} className="login-link" style={{
            background: 'transparent', border: 'none', color: 'var(--text-1)',
            fontSize: 13, fontWeight: 600, padding: '10px 14px', borderRadius: 999, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>Iniciar sesión</button>
          <button onClick={() => go('contacto')} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
            Cotizar Proyecto <Icon.ArrowRight size={14}/>
          </button>
          <button onClick={() => setOpenMobile(true)} className="mobile-toggle" style={{
            display: 'none', background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)',
            color: 'var(--text-0)', padding: 8, borderRadius: 10, cursor: 'pointer',
          }}><Icon.Menu size={20}/></button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-down { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .svc-row:hover { background: var(--glass-bg-2) !important; border-color: var(--glass-border-2) !important; }
        .nav-link:hover { color: var(--text-0) !important; }
        .login-link:hover { color: var(--text-0); background: var(--glass-bg); }
        @media (max-width: 1100px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
          .nav-actions .login-link { display: none; }
        }
        @media (max-width: 720px) {
          .nav-actions button:not(.mobile-toggle):not(.btn-primary) { display: none !important; }
        }
      `}</style>
      {openMobile && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-0)', opacity: 0.98, backdropFilter: 'blur(20px)', zIndex: 200, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Logo size={44}/>
            <button onClick={() => setOpenMobile(false)} style={{ background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)', padding: 10, borderRadius: 12, color: 'var(--text-0)', cursor: 'pointer' }}><Icon.X size={20}/></button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {Object.entries(ROUTES).map(([id, label]) => (
              <button key={id} onClick={() => go(id)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18, textAlign: 'left', color: 'var(--text-0)', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>
            ))}
            <button onClick={() => go('servicios')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18, textAlign: 'left', color: 'var(--text-0)', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Servicios</button>
            <button onClick={() => go('login')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18, textAlign: 'left', color: 'var(--text-0)', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Iniciar sesión</button>
            <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
              <ThemeToggle size={44}/>
              <button onClick={() => go('contacto')} className="btn btn-primary" style={{ flex: 1, padding: 16, fontSize: 15, justifyContent: 'center' }}>Cotizar Proyecto</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

window.Navbar = Navbar;
