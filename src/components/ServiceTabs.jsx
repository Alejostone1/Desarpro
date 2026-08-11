// ServiceTabs — accordion / tabs for service offerings.

import React from 'react';
import Icon from '../lib/icons.jsx';

function ServiceTabs({ items, color = '#3B82F6' }) {
  const [open, setOpen] = React.useState(0);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map((it, i) => {
        const I = Icon[it.icon];
        const isOpen = open === i;
        return (
          <div key={i} className="glass" style={{
            borderRadius: 16, padding: 0, overflow: 'hidden',
            borderColor: isOpen ? `${color}50` : 'rgba(255,255,255,0.08)',
            transition: 'border-color 240ms',
          }}>
            <button onClick={() => setOpen(isOpen ? -1 : i)} style={{
              width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18,
              background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}1A`, color: color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}><I size={20}/></span>
              <span style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>{it.name}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{it.tagline}</div>
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.5)', transition: 'transform 240ms',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
              }}><Icon.ChevronRight size={18}/></span>
            </button>
            <div style={{
              maxHeight: isOpen ? 320 : 0, overflow: 'hidden',
              transition: 'max-height 360ms cubic-bezier(0.16,1,0.3,1)',
            }}>
              <div style={{ padding: '0 24px 22px 86px' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                  {it.bullets.map((b, j) => (
                    <li key={j} style={{ fontSize: 13.5, color: '#D1D5DB', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <Icon.Check size={14} stroke={color} sw={2.4}/> <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ServiceTabs;
