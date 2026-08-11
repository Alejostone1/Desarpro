// Projects page — folder-expand industries + featured cases + 11-package selector.
// Projects are fetched from the backend API with a local fallback (see projectData).

function Projects({ setRoute }) {
  const { language } = useI18n();
  const t = useTranslations();
  const [projects, setProjects] = React.useState(LOCAL_PROJECTS || []);
  const [selectedId, setSelectedId] = React.useState(null);
  const carouselRef = React.useRef(null);

  // Load from backend (localized by language; falls back to the local catalog).
  React.useEffect(() => {
    let live = true;
    window.fetchProjects(language).then((data) => {
      if (!live) return;
      const list = Array.isArray(data) && data.length ? data : (LOCAL_PROJECTS || []);
      setProjects(list);
      const firstFeatured = list.find((p) => p.featured) || list[0];
      if (firstFeatured) setSelectedId(firstFeatured.id);
    });
    return () => { live = false; };
  }, [language]);

  const handlePickIndustry = React.useCallback((industry) => {
    const match = projects.find((p) => p.industry === industry);
    if (match) {
      setSelectedId(match.id);
      // Wait a frame so the carousel can select the project before scrolling.
      window.requestAnimationFrame(() => {
        if (carouselRef.current) {
          carouselRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      setRoute('contacto');
    }
  }, [projects, setRoute]);

  return (
    <div className="page" style={{ paddingTop: 110 }}>
      {/* HEADER */}
      <section style={{ position: 'relative', padding: '60px 0 40px' }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <Reveal><span className="section-eyebrow">{t('projects.eyebrow')}</span></Reveal>
          <Reveal delay={100}><h1 className="section-h2" style={{ marginTop: 16, fontSize: 'clamp(48px, 7vw, 88px)' }}>{t('projects.title')} <span className="text-grad-violet">{t('projects.titleHighlight')}</span></h1></Reveal>
          <Reveal delay={200}><p className="section-sub" style={{ margin: '24px auto 0' }}>{t('projects.subtitle')}</p></Reveal>
        </div>
      </section>

      {/* INDUSTRIES — folder cards */}
      <section style={{ position: 'relative', padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Reveal><span className="section-eyebrow" style={{ color: '#F59E0B' }}>{t('projects.industries.eyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(28px, 4vw, 44px)' }}>{t('projects.industries.title')}</h2></Reveal>          </div>
          <Reveal delay={200}>
            <FolderExpand projects={projects} onPickIndustry={handlePickIndustry}/>
          </Reveal>
        </div>
      </section>

      {/* PROJECT CAROUSEL — every industry routes to its project */}
      <section ref={carouselRef} style={{ position: 'relative', padding: '40px 0 80px', scrollMarginTop: 110 }}>
        <div className="container">
          <div style={{ marginBottom: 40 }}>
            <Reveal><span className="section-eyebrow">{t('projects_carousel.eyebrow')}</span></Reveal>
            <Reveal delay={100}><h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(32px, 4.5vw, 56px)' }}>{t('projects_carousel.title')}</h2></Reveal>
          </div>
          <Reveal delay={160}>
            <ProjectCarousel projects={projects} onCTA={() => setRoute('contacto')} activeId={selectedId} onChange={setSelectedId}/>
          </Reveal>
        </div>
      </section>

      {/* PACKAGE SELECTOR */}
      <section style={{ position: 'relative', padding: '80px 0 120px' }}>
        <div className="container">
          <div style={{ marginBottom: 48 }}>
            <Reveal><span className="section-eyebrow">{t('projects.packages.eyebrow')}</span></Reveal>
            <Reveal delay={100}>
              <h2 className="section-h2" style={{ marginTop: 12, fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
                {t('projects.packages.title.pre')} <span className="text-grad-blue">{t('projects.packages.title.highlight')}</span>
              </h2>
            </Reveal>
            <Reveal delay={200}><p className="section-sub" style={{ marginTop: 16 }}>{t('projects.packages.subtitle')}</p></Reveal>          </div>
          <Reveal delay={320}>
            <PackageCarousel onCTA={() => setRoute('contacto')}/>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

window.Projects = Projects;
