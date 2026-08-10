// FolderExpand — single yellow folder that opens and emits sheets per industry.
// Now with infinite horizontal scroll and project details.

const INDUSTRIES = [
  { name: 'VetTech', icon: 'Stethoscope', color: '#06B6D4', desc: 'Salud veterinaria · Laboratorios', count: 1 },
  { name: 'CoffeeTech', icon: 'Coffee', color: '#A78BFA', desc: 'Agroindustria · Trazabilidad de café', count: 1 },
  { name: 'E-commerce', icon: 'ShoppingBag', color: '#3B82F6', desc: 'Retail tecnológico', count: 1 },
  { name: 'Fashion', icon: 'Star', color: '#EC4899', desc: 'Moda · Pedidos y catálogo', count: 1 },
  { name: 'AgroTech', icon: 'Tractor', color: '#10B981', desc: 'Agro · Operación de campo', count: 1 },
  { name: 'FinTech', icon: 'DollarSign', color: '#F59E0B', desc: 'Finanzas · Banca digital', count: 1 },
  { name: 'HealthTech', icon: 'Heart', color: '#EF4444', desc: 'Salud · Telemedicina', count: 1 },
  { name: 'EdTech', icon: 'Book', color: '#8B5CF6', desc: 'Educación · Plataformas e-learning', count: 1 },
  { name: 'Logistics', icon: 'Truck', color: '#06B6D4', desc: 'Logística · Ruteo inteligente', count: 1 },
  { name: 'FoodTech', icon: 'Utensils', color: '#10B981', desc: 'Alimentos · Gestión de restaurantes', count: 1 },
];

function FolderExpand({ onPickIndustry }) {
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [winWidth, setWinWidth] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div style={{ position: 'relative', height: winWidth < 480 ? 440 : 520, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
      {/* Horizontal scroll container */}
      <div style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        display: 'flex',
        gap: 16,
        padding: '20px',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        marginBottom: 20,
      }}>
        {INDUSTRIES.map((ind, i) => {
          const I = Icon[ind.icon];
          return (
            <button key={ind.name} onClick={() => setSelectedProject(ind)}
              className="industry-card"
              style={{
                flex: '0 0 auto',
                width: 'min(200px, calc(100vw - 64px))',
                padding: '16px 14px',
                borderRadius: 14,
                background: 'linear-gradient(180deg, #FAFAFA 0%, #E5E7EB 100%)',
                border: `2px solid ${selectedProject?.name === ind.name ? ind.color : 'rgba(0,0,0,0.08)'}`,
                boxShadow: selectedProject?.name === ind.name ? `0 20px 40px ${ind.color}40` : '0 10px 20px rgba(0,0,0,0.5)',
                transition: 'all 300ms cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer', textAlign: 'left',
                transform: selectedProject?.name === ind.name ? 'scale(1.05)' : 'scale(1)',
              }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${ind.color}22`, color: ind.color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
              }}><I size={16}/></span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0A0B14' }}>{ind.name}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 1.3 }}>{ind.desc}</div>
              <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color: ind.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {ind.count} proyecto{ind.count > 1 ? 's' : ''}
              </div>
            </button>
          );
        })}
      </div>

      {/* Project Details Panel */}
      {selectedProject && (
        <div style={{
          width: '100%',
          maxWidth: 800,
          padding: 24,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${selectedProject.color}15, transparent)`,
          border: `2px solid ${selectedProject.color}30`,
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${selectedProject.color}22`, color: selectedProject.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {React.createElement(Icon[selectedProject.icon], { size: 24 })}
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0A0B14', margin: 0 }}>{selectedProject.name}</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{selectedProject.desc}</p>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
            Proyecto especializado en {selectedProject.desc.toLowerCase()} con soluciones tecnológicas avanzadas.
            Sistema completo integrado con las mejores prácticas de la industria.
          </div>
          <button onClick={() => onPickIndustry?.(selectedProject)} style={{
            marginTop: 16, padding: '12px 24px', borderRadius: 10,
            background: selectedProject.color, color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Cotizar proyecto {selectedProject.name} <Icon.ArrowRight size={16}/>
          </button>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

window.FolderExpand = FolderExpand;
window.INDUSTRIES = INDUSTRIES;
