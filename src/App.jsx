// App — root component. Routes via hash. Wraps app in Theme + Admin providers.

const SEO_FALLBACK_TITLES = {
  home: 'DesarPro · Tecnología que transforma tu negocio',
  servicios: 'Servicios · DesarPro',
  proyectos: 'Proyectos · DesarPro',
  nosotros: 'Nosotros · DesarPro',
  contacto: 'Contacto · DesarPro',
  login: 'Panel administrador · DesarPro',
  '404': 'Página no encontrada · DesarPro',
};

function useSeo(route) {
  const { language } = useI18n();
  React.useEffect(() => {
    let mounted = true;
    const seoRoute = route && !['home', 'servicios', 'proyectos', 'nosotros', 'contacto', 'login'].includes(route)
      ? (route.indexOf('svc-') === 0 ? 'servicios' : '404')
      : (route || 'home');
    const apply = (seo) => {
      const entry = (seo && seo[seoRoute]) || {};
      const title = entry.title || SEO_FALLBACK_TITLES[seoRoute] || 'DesarPro';
      const desc = entry.description || '';
      document.title = title;
      const setMeta = (attr, attrName, value) => {
        if (!value) return;
        let el = document.querySelector(`meta[${attr}="${attrName}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, attrName);
          document.head.appendChild(el);
        }
        el.setAttribute('content', value);
      };
      setMeta('name', 'description', desc);
      setMeta('name', 'keywords', entry.keywords);
      setMeta('property', 'og:title', entry.ogTitle || title);
      setMeta('property', 'og:description', entry.ogDescription || desc);
      setMeta('property', 'og:image', entry.ogImage);
      setMeta('name', 'twitter:title', entry.ogTitle || title);
      setMeta('name', 'twitter:description', entry.ogDescription || desc);
    };
    // Apply fallback instantly, then upgrade with DB values when available.
    apply(null);
    fetchSeo(language).then((seo) => {
      if (mounted) apply(seo);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [route, language]);
}

function App() {
  const [route, setRouteRaw] = React.useState(() => {
    const h = (window.location.hash || '').replace(/^#\/?/, '');
    return h || 'home';
  });

  const setRoute = React.useCallback((r) => {
    setRouteRaw(r);
    window.location.hash = r;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  React.useEffect(() => {
    const onHash = () => setRouteRaw((window.location.hash || '').replace(/^#\/?/, '') || 'home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useSeo(route);

  // Full-bleed routes have no Navbar/Footer (immersive)
  const isFullBleed = route === 'login' || route === 'admin';

  const known = ['home', 'proyectos', 'nosotros', 'contacto', 'login', 'admin', 'servicios'];
  const isKnown = known.includes(route) || (route && route.startsWith && route.startsWith('svc-'));

  let Page = null;
  if (route === 'home') Page = <Home setRoute={setRoute}/>;
  else if (route === 'proyectos') Page = <Projects setRoute={setRoute}/>;
  else if (route === 'nosotros') Page = <About setRoute={setRoute}/>;
  else if (route === 'contacto') Page = <Contact setRoute={setRoute}/>;
  else if (route === 'login') Page = <Login setRoute={setRoute}/>;
  else if (route === 'admin') Page = <Admin setRoute={setRoute}/>;
  else if (route === 'servicios') Page = <ServicesHub setRoute={setRoute}/>;
  else if (route && route.startsWith && route.startsWith('svc-')) Page = <ServicePage id={route} setRoute={setRoute}/>;
  else Page = <NotFound setRoute={setRoute}/>;

  return (
    <div data-screen-label={`${route}`}>
      {!isFullBleed && <Navbar route={route} setRoute={setRoute}/>}
      {Page}
      {!isFullBleed && <Footer setRoute={setRoute}/>}
      {isKnown && <AdminFab setRoute={setRoute}/>}
    </div>
  );
}

function Root() {
  return (
    <ToastProvider>
      <I18nProvider>
        <ThemeProvider>
          <AdminProvider>
            <App/>
          </AdminProvider>
        </ThemeProvider>
      </I18nProvider>
    </ToastProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root/>);
