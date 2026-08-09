// Navbar — premium glass header with enlarged logo and theme toggle.
// Always has gray glass background (logo readable on light/dark).
// Now with full i18n support

const LANGUAGE_FLAGS = {
  es: '🇪🇸',
  en: '🇺🇸',
  pt: '🇧🇷',
  fr: '🇫🇷',
  de: '🇩🇪',
};

const LANGUAGE_LABELS = {
  es: 'ES',
  en: 'EN',
  pt: 'PT',
  fr: 'FR',
  de: 'DE',
};

function Navbar({ route, setRoute }) {
  const { language, setLanguage, t } = useI18n();
  const [scrolled, setScrolled] = React.useState(false);
  const [openServices, setOpenServices] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [langMenu, setLangMenu] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (r) => { setRoute(r); setOpenServices(false); setOpenMobile(false); };

  const coreServices = [
    { id: 'svc-web', nameKey: 'services.web.name', descKey: 'services.web.desc', icon: 'Globe', color: '#3B82F6' },
    { id: 'svc-mobile', nameKey: 'services.mobile.name', descKey: 'services.mobile.desc', icon: 'Smartphone', color: '#8B5CF6' },
    { id: 'svc-software', nameKey: 'services.software.name', descKey: 'services.software.desc', icon: 'Layers', color: '#F97316' },
    { id: 'svc-maintenance', nameKey: 'services.maintenance.name', descKey: 'services.maintenance.desc', icon: 'Wrench', color: '#F59E0B' },
    { id: 'svc-consulting', nameKey: 'services.consulting.name', descKey: 'services.consulting.desc', icon: 'Compass', color: '#A855F7' },
    { id: 'svc-seo', nameKey: 'services.seo.name', descKey: 'services.seo.desc', icon: 'Search', color: '#14B8A6' },
  ];
  const specialized = [
    { id: 'svc-ai', nameKey: 'services.ai.name', descKey: 'services.ai.desc', icon: 'Brain', color: '#EC4899' },
    { id: 'svc-security', nameKey: 'services.security.name', descKey: 'services.security.desc', icon: 'Shield', color: '#EF4444' },
    { id: 'svc-cloud', nameKey: 'services.cloud.name', descKey: 'services.cloud.desc', icon: 'Cloud', color: '#06B6D4' },
    { id: 'svc-data', nameKey: 'services.data.name', descKey: 'services.data.desc', icon: 'Database', color: '#10B981' },
    { id: 'svc-bi', nameKey: 'services.bi.name', descKey: 'services.bi.desc', icon: 'BarChart', color: '#F59E0B' },
    { id: 'svc-api', nameKey: 'services.api.name', descKey: 'services.api.desc', icon: 'Plug', color: '#8B5CF6' },
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
          {[
            { id: 'home', label: t('nav.home') },
            { id: 'proyectos', label: t('nav.projects') },
            { id: 'nosotros', label: t('nav.about') },
            { id: 'contacto', label: t('nav.contact') },
          ].map(({ id, label }) => (
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
              {t('nav.services')} <Icon.ChevronDown size={14}/>
            </button>
            {openServices && (
              <div style={{
                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                marginTop: 8, width: 720, padding: 24, borderRadius: 20,
                background: 'var(--bg-2)', backdropFilter: 'blur(40px) saturate(200%)',
                border: '1px solid var(--glass-border-3)',
                boxShadow: '0 30px 120px rgba(0,0,0,0.7), 0 0 100px rgba(34,211,238,0.15)',
                animation: 'fade-in-down 240ms var(--ease-out)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--cyan-bright)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>{t('nav_services.main')}</div>
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
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-0)' }}>{t(s.nameKey)}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{t(s.descKey)}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--violet-bright)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>{t('nav_services.specialized')}</div>
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
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{t(s.nameKey)}</span>
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
                    }}>{t('nav_services.viewAll')} <Icon.ArrowRight size={14}/></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle size={38}/>
          <div style={{ position: 'relative' }}>
            <button onMouseEnter={() => setLangMenu(true)} onMouseLeave={() => setLangMenu(false)} style={{
              background: 'var(--glass-bg-2)', border: '1px solid var(--glass-border-2)', color: 'var(--text-1)',
              padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            }}>{LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]}</button>
            {langMenu && (
              <div onMouseEnter={() => setLangMenu(true)} onMouseLeave={() => setLangMenu(false)} style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 120, borderRadius: 12,
                background: 'var(--bg-2)', border: '1px solid var(--glass-border-3)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.4)', zIndex: 1000,
              }}>
                {['es', 'en', 'pt', 'fr', 'de'].map(lang => (
                  <button key={lang} onClick={() => { setLanguage(lang); setLangMenu(false); }} style={{
                    display: 'block', width: '100%', padding: '12px 16px', textAlign: 'left',
                    background: language === lang ? 'rgba(34,211,238,0.15)' : 'transparent',
                    border: 'none', borderBottom: lang !== 'de' ? '1px solid var(--glass-border)' : 'none',
                    color: language === lang ? '#22D3EE' : 'var(--text-0)',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    {LANGUAGE_FLAGS[lang]} {LANGUAGE_LABELS[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => go('login')} className="login-link" style={{
            background: 'transparent', border: 'none', color: 'var(--text-1)',
            fontSize: 13, fontWeight: 600, padding: '10px 14px', borderRadius: 999, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>{t('nav.login')}</button>
          <button onClick={() => go('contacto')} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: 13 }}>
            {t('nav.quote')} <Icon.ArrowRight size={14}/>
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
            {[
              { id: 'home', label: t('nav.home') },
              { id: 'proyectos', label: t('nav.projects') },
              { id: 'nosotros', label: t('nav.about') },
              { id: 'servicios', label: t('nav.services') },
              { id: 'contacto', label: t('nav.contact') },
              { id: 'login', label: t('nav.login') },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => { go(id); setOpenMobile(false); }} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18, textAlign: 'left', color: 'var(--text-0)', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{label}</button>
            ))}
            <button onClick={() => go('servicios')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18, textAlign: 'left', color: 'var(--text-0)', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t('nav.services')}</button>
            <button onClick={() => go('login')} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18, textAlign: 'left', color: 'var(--text-0)', fontSize: 18, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{t('nav.login')}</button>
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
