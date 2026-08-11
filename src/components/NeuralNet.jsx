// Neural network background — canvas with nodes that connect by proximity.
// Cursor becomes an attractor node.

import React from 'react';

function NeuralNet({ density = 90, color = '#3B82F6', accent = '#22D3EE', linkDist = 140, speed = 0.25, opacity = 0.55 }) {
  const ref = React.useRef(null);
  const mouse = React.useRef({ x: -9999, y: -9999, active: false });

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h;
    let nodes = [];

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-seed nodes proportional to area
      const target = Math.max(40, Math.round(density * (w * h) / (1280 * 720)));
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.6 + 0.6,
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - r.left;
      mouse.current.y = e.clientY - r.top;
      mouse.current.active = true;
    };
    const onLeave = () => { mouse.current.active = false; mouse.current.x = -9999; mouse.current.y = -9999; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    let raf;
    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Mouse attraction
        if (mouse.current.active) {
          const dx = mouse.current.x - n.x;
          const dy = mouse.current.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 30000) {
            const f = 0.0006;
            n.vx += dx * f;
            n.vy += dy * f;
          }
        }
        // Damping
        n.vx *= 0.98; n.vy *= 0.98;
        // Min drift
        if (Math.abs(n.vx) < 0.05) n.vx += (Math.random() - 0.5) * 0.1;
        if (Math.abs(n.vy) < 0.05) n.vy += (Math.random() - 0.5) * 0.1;
        n.pulse += 0.02;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * opacity;
            ctx.strokeStyle = color;
            ctx.globalAlpha = alpha * 0.7;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // Connect to mouse
        if (mouse.current.active) {
          const dx = nodes[i].x - mouse.current.x;
          const dy = nodes[i].y - mouse.current.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist * 1.4) {
            const alpha = (1 - d / (linkDist * 1.4)) * 0.8;
            ctx.strokeStyle = accent;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.current.x, mouse.current.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Draw nodes
      for (const n of nodes) {
        const pulse = 0.6 + Math.sin(n.pulse) * 0.4;
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        // halo
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [density, color, accent, linkDist, speed, opacity]);

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

export default NeuralNet;
