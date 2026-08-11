// States — reusable Loading / Error / Empty / Skeleton UI states (Fase G).

import React from 'react';
import Icon from '../lib/icons.jsx';

function Spinner({ size = 20, color = '#22D3EE', sw = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spinner-rot 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.15)" strokeWidth={sw}/>
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <style>{`@keyframes spinner-rot { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function LoadingState({ label = 'Cargando…', size = 'md', inline = false }) {
  if (inline) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: '16px 0', color: 'var(--text-2)', fontSize: 13 }}>
        <Spinner size={16}/> {label}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: size === 'lg' ? '80px 20px' : '48px 20px', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(34,211,238,0.15)', borderTopColor: '#22D3EE', animation: 'spin 1s linear infinite' }}/>
        <Spinner size={24}/>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)' }}>{label}</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message = 'Algo salió mal.', hint, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '56px 20px', textAlign: 'center' }}>
      <span style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon.AlertTriangle size={26}/>
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-0)' }}>{message}</div>
        {hint && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, maxWidth: 420 }}>{hint}</div>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-ghost" style={{ minHeight: 40, fontSize: 13 }}>
          <Icon.Refresh size={14}/> Reintentar
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon = 'Inbox', title = 'Sin resultados', subtitle, action }) {
  const I = Icon[icon] || Icon.Inbox;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 20px', textAlign: 'center' }}>
      <span style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.16)', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <I size={28}/>
      </span>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-0)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, maxWidth: 420 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

function Skeleton({ width = '100%', height = 14, radius = 8, style = {} }) {
  return (
    <div style={{ width, height, borderRadius: radius, background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.4s ease-in-out infinite', ...style }}/>
  );
}

function SkeletonList({ rows = 4, height = 14 }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} height={height} style={{ opacity: 1 - i * 0.12 }}/>
      ))}
      <style>{`@keyframes skeleton-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export { LoadingState, ErrorState, EmptyState, Skeleton, SkeletonList, Spinner };
