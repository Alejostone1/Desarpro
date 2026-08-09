// PackageCarousel — interactive selector for the 11 DesarPro packages.
// Layout: large active card on left, scrollable rail of all packages on right.

const PACKAGES = [
  { id: 'start', name: 'START', tag: 'Presencia y Validación', icon: 'Rocket', color: '#22D3EE',
    headline: 'Lanza tu idea con base sólida',
    includes: ['Consultoría inicial y levantamiento', 'Landing o app web básica', 'UX/UI estructura y prototipo', 'Configuración de base de datos', 'Despliegue básico', 'SEO técnico inicial', 'Analítica básica'],
    ideal: 'Emprendedores · MVPs · Etapas tempranas' },
  { id: 'business', name: 'BUSINESS', tag: 'Operación Digital', icon: 'Briefcase', color: '#3B82F6',
    headline: 'Digitaliza tu operación interna',
    includes: ['Análisis funcional y arquitectura', 'Aplicación web o ERP/CRM básico', 'Gestión de usuarios y roles', 'Base de datos estructurada', 'Automatización de procesos', 'Integración APIs (pagos, WhatsApp)', 'UX/UI profesional', 'CI/CD básico', 'Seguridad básica'],
    ideal: 'Empresas en crecimiento · Digitalización' },
  { id: 'growth', name: 'GROWTH', tag: 'Escalamiento y Control', icon: 'TrendingUp', color: '#10B981',
    headline: 'Escala con datos y control',
    includes: ['Arquitectura escalable', 'App web/móvil completa', 'Dashboards y KPIs', 'Integraciones avanzadas', 'Automatización avanzada', 'DevOps · Docker · despliegues', 'Seguridad intermedia OWASP', 'Optimización de BD'],
    ideal: 'Empresas que ya venden y quieren escalar' },
  { id: 'intelligence', name: 'INTELLIGENCE', tag: 'IA + Automatización', icon: 'Brain', color: '#A78BFA',
    headline: 'Decisiones inteligentes con IA',
    includes: ['Integración de IA en procesos', 'Chatbots inteligentes', 'Automatización inteligente', 'Clasificación de datos', 'Modelos predictivos básicos', 'Dashboards avanzados', 'Integración APIs de IA'],
    ideal: 'Empresas con datos · Atención automatizada' },
  { id: 'enterprise', name: 'ENTERPRISE', tag: 'Plataforma SaaS Completa', icon: 'Building', color: '#8B5CF6',
    headline: 'Construye productos robustos',
    includes: ['Arquitectura SaaS multi-tenant', 'Plataforma completa web (+móvil)', 'Panel administrativo avanzado', 'Roles y permisos complejos', 'Integraciones múltiples', 'DevOps completo · CI/CD', 'Alta disponibilidad y backups', 'Auditorías OWASP', 'Documentación y pruebas'],
    ideal: 'Startups SaaS · Plataformas digitales' },
  { id: 'security', name: 'SECURITY', tag: 'Protección y Cumplimiento', icon: 'Shield', color: '#EF4444',
    headline: 'Asegura antes de que cueste',
    includes: ['Auditoría de seguridad', 'Análisis de vulnerabilidades', 'Revisión OWASP Top 10', 'Hardening de sistemas', 'Seguridad en APIs', 'Validación de auth', 'Revisión de código', 'Informe técnico'],
    ideal: 'Sistemas en producción · Datos sensibles' },
  { id: 'infrastructure', name: 'INFRASTRUCTURE', tag: 'DevOps & Cloud', icon: 'Cloud', color: '#06B6D4',
    headline: 'Estabilidad y escalabilidad',
    includes: ['Diseño de infraestructura', 'Dockerización', 'CI/CD configurado', 'Despliegue en cloud', 'Monitoreo', 'Backups automáticos', 'Alta disponibilidad', 'Optimización de rendimiento'],
    ideal: 'Empresas con crecimiento técnico' },
  { id: 'data', name: 'DATA', tag: 'BI y Analítica', icon: 'BarChart', color: '#F59E0B',
    headline: 'Convierte datos en decisiones',
    includes: ['Modelado y limpieza', 'Dashboards Power BI/Metabase', 'KPIs empresariales', 'Reportes ejecutivos', 'Análisis de tendencias', 'Integración de fuentes'],
    ideal: 'Empresas con datos desorganizados' },
  { id: 'digital-growth', name: 'DIGITAL GROWTH', tag: 'Marketing Tecnológico', icon: 'Megaphone', color: '#EC4899',
    headline: 'Tráfico, leads y conversión',
    includes: ['Landing pages optimizadas', 'Automatización de marketing', 'Integración con CRM', 'SEO técnico', 'SEM / Meta Ads', 'Analítica de campañas', 'Tracking de eventos', 'Optimización de conversión'],
    ideal: 'Empresas que quieren crecer en ventas' },
  { id: 'consulting', name: 'CONSULTING', tag: 'Alta Estrategia', icon: 'Compass', color: '#A855F7',
    headline: 'Decide bien antes de invertir mal',
    includes: ['Diagnóstico tecnológico', 'Arquitectura de software', 'Selección de tecnologías', 'Roadmap de desarrollo', 'Evaluación de proveedores', 'Auditoría de procesos', 'Estrategia de escalabilidad'],
    ideal: 'Empresas en toma de decisiones' },
  { id: 'continuidad', name: 'CONTINUIDAD', tag: 'Soporte y Evolución', icon: 'Activity', color: '#14B8A6',
    headline: 'Sistemas vivos en el tiempo',
    includes: ['Soporte técnico', 'Mantenimiento evolutivo', 'Monitoreo y backups', 'Actualizaciones', 'Optimización continua', 'Mejoras funcionales', 'Soporte DevOps'],
    ideal: 'Clientes activos · SaaS en producción' },
];

function PackageCarousel({ onCTA }) {
  const [active, setActive] = React.useState(1); // BUSINESS by default
  const pkg = PACKAGES[active];
  const I = Icon[pkg.icon];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'stretch' }} className="pkg-grid">
      {/* Active card */}
      <div className="glass-2" style={{
        position: 'relative', borderRadius: 24, padding: 40,
        background: `linear-gradient(135deg, ${pkg.color}18 0%, rgba(255,255,255,0.03) 60%)`,
        border: `1px solid ${pkg.color}40`,
        overflow: 'hidden', minHeight: 540,
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, ${pkg.color}40, transparent 70%)`, filter: 'blur(40px)' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <span style={{
              width: 64, height: 64, borderRadius: 16,
              background: `${pkg.color}28`, color: pkg.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${pkg.color}40`,
            }}><I size={32}/></span>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', color: pkg.color, textTransform: 'uppercase', fontWeight: 700 }}>Paquete {String(active + 1).padStart(2, '0')} / 11</div>
              <h3 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: '4px 0 0', letterSpacing: '-0.02em' }}>{pkg.name}</h3>
            </div>
          </div>
          <div style={{ fontSize: 18, color: '#E5E7EB', fontWeight: 600, marginBottom: 8 }}>{pkg.tag}</div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginBottom: 24, lineHeight: 1.6 }}>{pkg.headline}</p>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Incluye</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
              {pkg.includes.map((it, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13.5, color: '#E5E7EB',
                  animation: `pkg-item-in 400ms ${i * 50}ms both var(--ease-out)` }}>
                  <Icon.Check size={14} stroke={pkg.color} sw={2.4}/> <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>IDEAL PARA</div>
            <div style={{ fontSize: 14, color: '#fff', marginBottom: 20 }}>{pkg.ideal}</div>
            <button onClick={onCTA} className="btn btn-primary" style={{ background: `linear-gradient(135deg, ${pkg.color} 0%, ${pkg.color}cc 100%)`, boxShadow: `0 8px 30px ${pkg.color}60` }}>
              Hablemos de tu proyecto <Icon.ArrowRight size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignContent: 'start' }}>
        {PACKAGES.map((p, i) => {
          const PI = Icon[p.icon];
          const isActive = i === active;
          return (
            <button key={p.id} onClick={() => setActive(i)} className="pkg-tile" style={{
              padding: 18, borderRadius: 14, textAlign: 'left',
              background: isActive ? `linear-gradient(135deg, ${p.color}22, transparent)` : 'rgba(255,255,255,0.025)',
              border: `1px solid ${isActive ? p.color + '60' : 'rgba(255,255,255,0.08)'}`,
              cursor: 'pointer', transition: 'all 220ms var(--ease-out)',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${p.color}22`, color: p.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}><PI size={16}/></span>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{p.tag}</div>
            </button>
          );
        })}
      </div>
      <style>{`
        @keyframes pkg-item-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @media (max-width: 980px) { .pkg-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

window.PackageCarousel = PackageCarousel;
window.PACKAGES = PACKAGES;
