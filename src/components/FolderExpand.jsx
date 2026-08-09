// FolderExpand — single yellow folder that opens and emits sheets per industry.

const INDUSTRIES = [
  { name: 'VetTech', icon: 'Stethoscope', color: '#06B6D4', desc: 'Salud veterinaria · Laboratorios', count: 1 },
  { name: 'CoffeeTech', icon: 'Coffee', color: '#A78BFA', desc: 'Agroindustria · Trazabilidad de café', count: 1 },
  { name: 'E-commerce', icon: 'ShoppingBag', color: '#3B82F6', desc: 'Retail tecnológico', count: 1 },
  { name: 'Fashion', icon: 'Star', color: '#EC4899', desc: 'Moda · Pedidos y catálogo', count: 1 },
  { name: 'AgroTech', icon: 'Tractor', color: '#10B981', desc: 'Agro · Operación de campo', count: 1 },
];

function FolderExpand({ onPickIndustry }) {
  const [open, setOpen] = React.useState(false);
  const layout = React.useMemo(() => {
    return INDUSTRIES.map((_, i, arr) => {
      const t = i / (arr.length - 1);
      const angle = (t - 0.5) * 90; // -45..45
      const dist = 240;
      const x = Math.sin(angle * Math.PI / 180) * dist;
      const y = -Math.cos(angle * Math.PI / 180) * dist + 40;
      return { x, y, rot: angle * 0.5 };
    });
  }, []);

  return (
    <div style={{ position: 'relative', height: 520, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      {/* Sheets */}
      {INDUSTRIES.map((ind, i) => {
        const I = Icon[ind.icon];
        const pos = layout[i];
        return (
          <button key={ind.name} onClick={() => onPickIndustry?.(ind)}
            className="industry-sheet"
            style={{
              position: 'absolute', bottom: 100,
              width: 200, padding: 20,
              borderRadius: 14,
              background: 'linear-gradient(180deg, #FAFAFA 0%, #E5E7EB 100%)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: open ? '0 30px 60px rgba(0,0,0,0.5)' : '0 10px 20px rgba(0,0,0,0.5)',
              transition: 'all 800ms cubic-bezier(0.16,1,0.3,1)',
              transitionDelay: `${i * 60}ms`,
              transform: open
                ? `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg)`
                : `translate(0, 60px) rotate(${(i - 2) * 4}deg)`,
              opacity: open ? 1 : (i === 2 ? 1 : 0.85),
              zIndex: open ? 10 - i : i,
              cursor: 'pointer', textAlign: 'left',
              transformOrigin: 'bottom center',
            }}>
            <span style={{
              width: 36, height: 36, borderRadius: 8,
              background: `${ind.color}22`, color: ind.color,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}><I size={18}/></span>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0A0B14' }}>{ind.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 1.4 }}>{ind.desc}</div>
            <div style={{ marginTop: 12, fontSize: 11, fontWeight: 600, color: ind.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {ind.count} proyecto{ind.count > 1 ? 's' : ''}
            </div>
          </button>
        );
      })}

      {/* Folder */}
      <div onClick={() => setOpen(!open)} style={{
        position: 'relative', width: 320, height: 220, cursor: 'pointer',
        zIndex: 20,
        transform: open ? 'translateY(20px)' : 'translateY(0)',
        transition: 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Back tab */}
        <div style={{
          position: 'absolute', top: 0, left: 30, width: 100, height: 30,
          background: 'linear-gradient(180deg, #F59E0B, #D97706)',
          borderTopLeftRadius: 12, borderTopRightRadius: 12,
        }}/>
        {/* Body */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
          background: 'linear-gradient(180deg, #FBBF24, #F59E0B)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}/>
        {/* Front flap */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 130,
          background: 'linear-gradient(180deg, #FCD34D, #F59E0B)',
          borderRadius: 14,
          transformOrigin: 'bottom center',
          transform: open ? 'rotateX(-25deg)' : 'rotateX(0)',
          transition: 'transform 800ms cubic-bezier(0.16,1,0.3,1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
        }}/>
        {/* Hint */}
        <div style={{
          position: 'absolute', bottom: -40, left: 0, right: 0, textAlign: 'center',
          color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500, opacity: open ? 0 : 1, transition: 'opacity 300ms',
        }}>
          Haz clic para abrir
        </div>
      </div>
    </div>
  );
}

window.FolderExpand = FolderExpand;
window.INDUSTRIES = INDUSTRIES;
