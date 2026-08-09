// App — root component. Routes via hash. Wraps app in Theme + Admin providers.

function App() {
  const [route, setRouteRaw] = React.useState(() => {
    const h = (window.location.hash || '').replace('#', '');
    return h || 'home';
  });

  const setRoute = React.useCallback((r) => {
    setRouteRaw(r);
    window.location.hash = r;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  React.useEffect(() => {
    const onHash = () => setRouteRaw((window.location.hash || '').replace('#', '') || 'home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Full-bleed routes have no Navbar/Footer (immersive)
  const isFullBleed = route === 'login' || route === 'admin';

  let Page = null;
  if (route === 'home') Page = <Home setRoute={setRoute}/>;
  else if (route === 'proyectos') Page = <Projects setRoute={setRoute}/>;
  else if (route === 'nosotros') Page = <About setRoute={setRoute}/>;
  else if (route === 'contacto') Page = <Contact setRoute={setRoute}/>;
  else if (route === 'login') Page = <Login setRoute={setRoute}/>;
  else if (route === 'admin') Page = <Admin setRoute={setRoute}/>;
  else if (route === 'servicios') Page = <ServicesHub setRoute={setRoute}/>;
  else if (route && route.startsWith && route.startsWith('svc-')) Page = <ServicePage id={route} setRoute={setRoute}/>;
  else Page = <Home setRoute={setRoute}/>;

  return (
    <div data-screen-label={`${route}`}>
      {!isFullBleed && <Navbar route={route} setRoute={setRoute}/>}
      {Page}
      {!isFullBleed && <Footer setRoute={setRoute}/>}
      <AdminFab setRoute={setRoute}/>
    </div>
  );
}

function Root() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AdminProvider>
          <App/>
        </AdminProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root/>);
