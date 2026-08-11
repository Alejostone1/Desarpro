// EarthGlobeScene — rotating wireframe Earth globe with neural network data pulses
// connecting major continents. Used as the Login background. Pure canvas, no deps.
//
// The scene combines:
//   - rotating wireframe sphere (latitude/longitude lines)

import React from 'react';
import Logo from './Logo.jsx';
//   - continent dot-clusters that light up
//   - arc-based data pulses traveling between continents
//   - subtle neural network background nodes
//   - DesarPro logo orbiting the globe

function EarthGlobeScene() {
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef({ w: 0, h: 0, t: 0, dpr: 1 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    stateRef.current.dpr = dpr;

    // --- Geographic "city" anchors (lat/lon in degrees) for connection origins ---
    // Roughly: cities/continents to ensure connections span all continents.
    const CITIES = [
      { name: 'Bogotá',   lat:   4.7, lon: -74.1, size: 1.6, key: true },
      { name: 'New York', lat:  40.7, lon: -74.0, size: 1.8, key: true },
      { name: 'L.A.',     lat:  34.0, lon: -118.2, size: 1.3 },
      { name: 'Mexico',   lat:  19.4, lon: -99.1, size: 1.3 },
      { name: 'São Paulo',lat: -23.5, lon: -46.6, size: 1.5, key: true },
      { name: 'Buenos A.',lat: -34.6, lon: -58.4, size: 1.2 },
      { name: 'London',   lat:  51.5, lon:  -0.1, size: 1.6, key: true },
      { name: 'Paris',    lat:  48.9, lon:   2.3, size: 1.3 },
      { name: 'Madrid',   lat:  40.4, lon:  -3.7, size: 1.2 },
      { name: 'Berlin',   lat:  52.5, lon:  13.4, size: 1.2 },
      { name: 'Moscow',   lat:  55.7, lon:  37.6, size: 1.3 },
      { name: 'Istanbul', lat:  41.0, lon:  28.9, size: 1.2 },
      { name: 'Lagos',    lat:   6.5, lon:   3.4, size: 1.2 },
      { name: 'Cairo',    lat:  30.0, lon:  31.2, size: 1.2 },
      { name: 'Cape Town',lat: -33.9, lon:  18.4, size: 1.2 },
      { name: 'Dubai',    lat:  25.2, lon:  55.3, size: 1.4 },
      { name: 'Mumbai',   lat:  19.1, lon:  72.9, size: 1.4 },
      { name: 'Delhi',    lat:  28.7, lon:  77.1, size: 1.2 },
      { name: 'Beijing',  lat:  39.9, lon: 116.4, size: 1.4 },
      { name: 'Shanghai', lat:  31.2, lon: 121.5, size: 1.4 },
      { name: 'Tokyo',    lat:  35.7, lon: 139.7, size: 1.6, key: true },
      { name: 'Singapore',lat:   1.4, lon: 103.8, size: 1.3 },
      { name: 'Sydney',   lat: -33.9, lon: 151.2, size: 1.4, key: true },
      { name: 'Auckland', lat: -36.8, lon: 174.7, size: 1.1 },
    ];

    // Convert lat/lon to 3D unit-sphere coords
    const project = (lat, lon, radius, rotation) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + rotation) * (Math.PI / 180);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      return { x, y, z };
    };

    // Arcs — pairs of city indexes that pulse periodically
    const ARC_PAIRS = [
      [0, 1], [0, 4], [0, 6], [0, 20],
      [1, 6], [1, 14], [1, 18], [1, 20], [1, 22],
      [4, 6], [4, 11], [4, 14],
      [6, 10], [6, 14], [6, 15],
      [10, 15], [10, 16], [10, 18],
      [16, 17], [16, 18], [17, 18], [18, 19],
      [19, 20], [19, 22], [20, 21], [21, 22], [22, 23],
      [3, 5], [3, 12], [5, 14],
      [2, 1], [2, 3], [11, 13], [13, 14], [14, 15],
    ];

    // Pulse instances (one per arc, time-offset)
    const pulses = ARC_PAIRS.map((pair, i) => ({
      a: pair[0], b: pair[1],
      offset: Math.random(),
      speed: 0.0006 + Math.random() * 0.0006,
      hue: Math.random() > 0.5 ? 'gold' : 'cyan',
    }));

    // Background nebula stars
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.7 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));

    // Floating data nodes (foreground neural net feel)
    const nodes = Array.from({ length: 35 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      r: Math.random() * 1.6 + 0.6,
    }));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      stateRef.current.w = r.width;
      stateRef.current.h = r.height;
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf;
    const tick = () => {
      const W = stateRef.current.w;
      const H = stateRef.current.h;
      const t = stateRef.current.t;
      stateRef.current.t += 1;

      ctx.clearRect(0, 0, W, H);

      // --- Background space gradient ---
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, Math.max(W, H));
      bgGrad.addColorStop(0, '#04081A');
      bgGrad.addColorStop(0.55, '#020410');
      bgGrad.addColorStop(1, '#000003');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        s.tw += 0.02;
        const alpha = (Math.sin(s.tw) * 0.3 + 0.7) * s.a;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#9DB4D8';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Globe center & radius
      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.min(W, H) * 0.32;
      const rotation = (t * 0.12) % 360;

      // --- Atmosphere outer glow ---
      const atmGrad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.35);
      atmGrad.addColorStop(0, 'rgba(34, 211, 238, 0.45)');
      atmGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
      atmGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = atmGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // --- Globe disk (night side) ---
      const diskGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, radius * 0.1, cx, cy, radius);
      diskGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
      diskGrad.addColorStop(0.65, 'rgba(8, 12, 28, 0.92)');
      diskGrad.addColorStop(1, 'rgba(2, 4, 12, 0.98)');
      ctx.fillStyle = diskGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // --- Latitude rings ---
      ctx.strokeStyle = 'rgba(99, 161, 220, 0.18)';
      ctx.lineWidth = 0.8;
      for (let i = 1; i < 8; i++) {
        const lat = -90 + i * 22.5;
        const phi = (90 - lat) * (Math.PI / 180);
        const ry = radius * Math.cos(phi);
        const rx = radius * Math.sin(phi);
        if (rx < 1) continue;
        ctx.beginPath();
        ctx.ellipse(cx, cy + radius * Math.cos(phi) * 0 - ry * 0, rx, Math.max(0.4, ry * 0.05), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // proper lat lines:
      ctx.strokeStyle = 'rgba(120, 180, 230, 0.15)';
      for (let lat = -75; lat <= 75; lat += 15) {
        const phi = (90 - lat) * (Math.PI / 180);
        const ry = radius * Math.cos(phi);
        const yPos = cy - radius * Math.sin((lat) * Math.PI / 180);
        const rx = radius * Math.cos(lat * Math.PI / 180);
        if (rx < 1) continue;
        ctx.beginPath();
        ctx.ellipse(cx, yPos, rx, Math.max(1.5, rx * 0.04), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Longitude meridians ---
      const meridians = 12;
      for (let m = 0; m < meridians; m++) {
        const offset = (m / meridians) * 360 + rotation;
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 4) {
          const p = project(lat, offset, radius, 0);
          if (p.z < -radius * 0.02) continue; // back-face cull
          const px = cx + p.x;
          const py = cy - p.y;
          if (lat === -90 || lat === -86) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(120, 180, 230, 0.14)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // --- City dot clusters (illuminate continents) ---
      // Project each city; if visible (z > 0), draw a glow. Brighter for "key" cities.
      const cityPoints = CITIES.map((c, i) => {
        const p = project(c.lat, c.lon, radius, rotation);
        return { ...c, p, idx: i, visible: p.z > -radius * 0.02 };
      });

      // small cluster halo dots around each city to suggest density
      for (const c of cityPoints) {
        if (!c.visible) continue;
        const px = cx + c.p.x;
        const py = cy - c.p.y;
        const fade = Math.max(0.15, c.p.z / radius);
        // halo
        ctx.fillStyle = `rgba(252, 211, 77, ${0.10 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, c.size * 6, 0, Math.PI * 2);
        ctx.fill();
        // cluster minor dots
        for (let k = 0; k < 4; k++) {
          const ang = k * Math.PI * 0.5 + t * 0.005;
          const rr = c.size * (2 + k * 0.5);
          const mx = px + Math.cos(ang) * rr;
          const my = py + Math.sin(ang) * rr;
          ctx.fillStyle = `rgba(250, 204, 21, ${0.45 * fade})`;
          ctx.beginPath();
          ctx.arc(mx, my, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        // primary dot (golden city light)
        const glowAmp = c.key ? 1 : 0.7;
        const dotR = c.size * (c.key ? 2.6 : 2);
        const grad = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3);
        grad.addColorStop(0, `rgba(254, 240, 138, ${0.95 * fade * glowAmp})`);
        grad.addColorStop(0.4, `rgba(251, 191, 36, ${0.6 * fade * glowAmp})`);
        grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, dotR * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(254, 252, 232, ${0.95 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, dotR * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Arc connections + pulses ---
      ctx.lineCap = 'round';
      for (const pulse of pulses) {
        const A = cityPoints[pulse.a];
        const B = cityPoints[pulse.b];
        if (!A || !B) continue;
        // Only draw if at least one endpoint is visible
        if (!A.visible && !B.visible) continue;

        const ax = cx + A.p.x;
        const ay = cy - A.p.y;
        const bx = cx + B.p.x;
        const by = cy - B.p.y;
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        // Arc height relative to distance
        const d = Math.hypot(bx - ax, by - ay);
        const arcHeight = d * 0.25;
        // control point pushed away from the globe center
        const dxFromCenter = mx - cx;
        const dyFromCenter = my - cy;
        const lenFromCenter = Math.hypot(dxFromCenter, dyFromCenter) || 1;
        const cpx = mx + (dxFromCenter / lenFromCenter) * arcHeight;
        const cpy = my + (dyFromCenter / lenFromCenter) * arcHeight;

        // Faint full arc
        ctx.strokeStyle = pulse.hue === 'gold' ? 'rgba(252, 211, 77, 0.22)' : 'rgba(34, 211, 238, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cpx, cpy, bx, by);
        ctx.stroke();

        // Pulse particle traveling along arc
        const phase = ((t * pulse.speed * 100) + pulse.offset) % 1;
        // quadratic Bezier at phase
        const u = 1 - phase;
        const sx = u * u * ax + 2 * u * phase * cpx + phase * phase * bx;
        const sy = u * u * ay + 2 * u * phase * cpy + phase * phase * by;
        // trailing segment (shorter behind)
        const trail = 0.08;
        const u2 = 1 - Math.max(0, phase - trail);
        const ph2 = Math.max(0, phase - trail);
        const tx = u2 * u2 * ax + 2 * u2 * ph2 * cpx + ph2 * ph2 * bx;
        const ty = u2 * u2 * ay + 2 * u2 * ph2 * cpy + ph2 * ph2 * by;

        const tailGrad = ctx.createLinearGradient(tx, ty, sx, sy);
        if (pulse.hue === 'gold') {
          tailGrad.addColorStop(0, 'rgba(252, 211, 77, 0)');
          tailGrad.addColorStop(1, 'rgba(254, 240, 138, 0.95)');
        } else {
          tailGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
          tailGrad.addColorStop(1, 'rgba(165, 243, 252, 0.95)');
        }
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // Bright head
        ctx.fillStyle = pulse.hue === 'gold' ? 'rgba(254, 240, 138, 1)' : 'rgba(207, 250, 254, 1)';
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 8);
        glowGrad.addColorStop(0, pulse.hue === 'gold' ? 'rgba(254, 240, 138, 0.7)' : 'rgba(207, 250, 254, 0.7)');
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Terminator highlight (bright limb / atmosphere ring) ---
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      // inner glow
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 1, 0, Math.PI * 2);
      ctx.stroke();

      // --- Floating foreground neural net nodes ---
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
        const px = n.x * W, py = n.y * H;
        // distance to globe edge
        const dist = Math.hypot(px - cx, py - cy);
        const fade = Math.min(1, Math.max(0, (dist - radius * 1.1) / (radius * 0.6)));
        ctx.fillStyle = `rgba(34, 211, 238, ${0.5 * fade})`;
        ctx.beginPath();
        ctx.arc(px, py, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Lines between near nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const ax = a.x * W, ay = a.y * H;
          const bx = b.x * W, by = b.y * H;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 140) {
            const distA = Math.hypot(ax - cx, ay - cy);
            const distB = Math.hypot(bx - cx, by - cy);
            const fade = Math.min(1, Math.max(0, ((distA + distB) / 2 - radius * 1.1) / (radius * 0.6)));
            ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - d / 140) * 0.3 * fade})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}/>

      {/* DesarPro logo overlay — positioned to look like a satellite badge */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        animation: 'logo-pulse 4s ease-in-out infinite',
        zIndex: 2,
      }}>
        <div style={{
          padding: 18,
          background: 'rgba(2, 4, 12, 0.55)',
          backdropFilter: 'blur(8px)',
          borderRadius: '50%',
          border: '1px solid rgba(34, 211, 238, 0.35)',
          boxShadow: '0 0 60px rgba(34, 211, 238, 0.4), inset 0 0 30px rgba(34, 211, 238, 0.15)',
        }}>
          <Logo size={66} withWordmark={false} animated/>
        </div>
      </div>

      <style>{`
        @keyframes logo-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.04); }
        }
      `}</style>
    </div>
  );
}

export default EarthGlobeScene;
