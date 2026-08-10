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
  const [winWidth, setWinWidth] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const layout = React.useMemo(() => {
    const dist = Math.min(240, Math.max(90, (winWidth - 80) / 2.3));
    return INDUSTRIES.map((_, i, arr) => {
      const t = i / (arr.length - 1);
      const angle = (t - 0.5) * (winWidth < 480 ? 60 : 90); // Narrower fan on mobile
      const x = Math.sin(angle * Math.PI / 180) * dist;
      const y = -Math.cos(angle * Math.PI / 180) * dist + (winWidth < 480 ? 20 : 40);
      return { x, y, rot: angle * 0.4 };
    });
  }, [winWidth]);

  return (
    <div style={{ position: 'relative', height: winWidth < 480 ? 440 : 520, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Sheets */}
      {INDUSTRIES.map((ind, i) => {
        const I = Icon[ind.icon];
        const pos = layout[i];
        return (
          <button key={ind.name} onClick={() => onPickIndustry?.(ind)}
            className="industry-sheet"
            style={{
              position: 'absolute', bottom: winWidth < 480 ? 80 : 100,
              width: 'min(200px, calc(100vw - 64px))', padding: '16px 14px',
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

      {/* Folder */}
      <div onClick={() => setOpen(!open)} style={{
        position: 'relative', width: 'min(320px, calc(100vw - 48px))', height: 200, cursor: 'pointer',
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
