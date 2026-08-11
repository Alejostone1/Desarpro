// PackageCarousel — interactive selector for the 11 DesarPro packages.
// Layout: large active card on left, scrollable rail of all packages on right.

import React from 'react';
import { useTranslations } from '../i18n/index.jsx';
import Icon from '../lib/icons.jsx';

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
  const t = useTranslations();
  const [active, setActive] = React.useState(1);
  const pkg = PACKAGES[active];
  const I = Icon[pkg.icon];

  return (
    <div className="pkg-carousel">
      <div className="pkg-grid">
        <div className="pkg-card glass-2" style={{ '--pkg-color': pkg.color }}>
          <div className="pkg-card-glow" aria-hidden="true" />
          <div className="pkg-card-inner">
            <div className="pkg-card-header">
              <span className="pkg-card-icon"><I size={28}/></span>
              <div>
                <div className="pkg-card-label">{t('packages.label')} {String(active + 1).padStart(2, '0')} / 11</div>
                <h3 className="pkg-card-name">{pkg.name}</h3>
              </div>
            </div>
            <div className="pkg-card-tag">{t(`packages_data.${pkg.id}.tag`)}</div>
            <p className="pkg-card-headline">{t(`packages_data.${pkg.id}.headline`)}</p>
            <div className="pkg-card-includes">
              <div className="pkg-card-section-label">{t('packages.includes')}</div>
              <ul className="pkg-card-list">
                {t(`packages_data.${pkg.id}.includes`).map((it, i) => (
                  <li key={i} style={{ animationDelay: `${i * 50}ms` }}>
                    <Icon.Check size={14} stroke={pkg.color} sw={2.4}/> <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pkg-card-footer">
              <div className="pkg-card-section-label">{t('packages.idealFor')}</div>
              <div className="pkg-card-ideal">{t(`packages_data.${pkg.id}.ideal`)}</div>
              <button type="button" onClick={onCTA} className="btn btn-primary pkg-card-cta" style={{ '--pkg-color': pkg.color }}>
                {t('packages.talkCta')} <Icon.ArrowRight size={14}/>
              </button>
            </div>
          </div>
        </div>

        <div className="pkg-rail">
          {PACKAGES.map((p, i) => {
            const PI = Icon[p.icon];
            const isActive = i === active;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(i)}
                className={`pkg-tile${isActive ? ' is-active' : ''}`}
                style={{ '--pkg-color': p.color }}
              >
                <span className="pkg-tile-icon"><PI size={16}/></span>
                <div className="pkg-tile-name">{p.name}</div>
                <div className="pkg-tile-tag">{t(`packages_data.${p.id}.tag`)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        .pkg-carousel { width: 100%; }
        .pkg-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
          align-items: stretch;
        }
        .pkg-card {
          position: relative;
          border-radius: 24px;
          padding: clamp(20px, 4vw, 40px);
          background: linear-gradient(135deg, color-mix(in srgb, var(--pkg-color) 12%, var(--card-bg)), var(--card-bg));
          border: 1px solid color-mix(in srgb, var(--pkg-color) 35%, var(--card-border));
          overflow: hidden;
          min-height: 480px;
        }
        .pkg-card-glow {
          position: absolute;
          top: -80px;
          right: -80px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--pkg-color) 28%, transparent), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }
        .pkg-card-inner { position: relative; }
        .pkg-card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .pkg-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: color-mix(in srgb, var(--pkg-color) 16%, transparent);
          color: var(--pkg-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid color-mix(in srgb, var(--pkg-color) 30%, transparent);
          flex-shrink: 0;
        }
        .pkg-card-label {
          font-size: 11px;
          letter-spacing: 0.18em;
          color: var(--pkg-color);
          text-transform: uppercase;
          font-weight: 700;
        }
        .pkg-card-name {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          color: var(--text-0);
          margin: 4px 0 0;
          letter-spacing: -0.02em;
        }
        .pkg-card-tag {
          font-size: 17px;
          color: var(--text-1);
          font-weight: 600;
          margin-bottom: 8px;
        }
        .pkg-card-headline {
          font-size: 15px;
          color: var(--text-2);
          margin: 0 0 24px;
          line-height: 1.6;
        }
        .pkg-card-section-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .pkg-card-list {
          list-style: none;
          padding: 0;
          margin: 0 0 24px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 8px 20px;
        }
        .pkg-card-list li {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          font-size: 13.5px;
          color: var(--text-1);
          animation: pkg-item-in 400ms both var(--ease-out);
        }
        .pkg-card-footer {
          padding-top: 16px;
          border-top: 1px solid var(--card-border);
        }
        .pkg-card-ideal {
          font-size: 14px;
          color: var(--text-0);
          margin-bottom: 20px;
        }
        .pkg-card-cta {
          background: linear-gradient(135deg, var(--pkg-color) 0%, color-mix(in srgb, var(--pkg-color) 80%, #000) 100%) !important;
          box-shadow: 0 8px 24px color-mix(in srgb, var(--pkg-color) 35%, transparent) !important;
        }
        .pkg-rail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          align-content: start;
        }
        .pkg-tile {
          padding: 18px;
          border-radius: 14px;
          text-align: left;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          cursor: pointer;
          transition: transform 220ms var(--ease-out), border-color 220ms var(--ease-out), background 220ms var(--ease-out);
        }
        .pkg-tile.is-active {
          background: linear-gradient(135deg, color-mix(in srgb, var(--pkg-color) 14%, var(--card-bg)), var(--card-bg));
          border-color: color-mix(in srgb, var(--pkg-color) 45%, var(--card-border));
          transform: scale(1.02);
        }
        .pkg-tile:hover:not(.is-active) {
          border-color: var(--card-border-hover);
          background: var(--card-bg-hover);
        }
        .pkg-tile-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: color-mix(in srgb, var(--pkg-color) 14%, transparent);
          color: var(--pkg-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .pkg-tile-name {
          font-size: 13px;
          font-weight: 800;
          color: var(--text-0);
          letter-spacing: 0.02em;
        }
        .pkg-tile-tag {
          font-size: 11px;
          color: var(--text-2);
          margin-top: 2px;
          line-height: 1.35;
        }
        @keyframes pkg-item-in {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 980px) {
          .pkg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default PackageCarousel;
export { PACKAGES };
