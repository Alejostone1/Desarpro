// Animation utilities — a tiny, dependency-free version of useInView and stagger
// helpers so we don't have to ship Framer Motion through CDN.

import React from 'react';

const { useEffect, useRef, useState, useCallback } = React;

// Reveal on scroll
function useInView(opts = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        if (opts.once !== false) obs.disconnect();
      } else if (opts.once === false) {
        setInView(false);
      }
    }, { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? '0px 0px -10% 0px' });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// Reveal wrapper
function Reveal({ as: Tag = 'div', delay = 0, y = 24, duration = 700, children, className = '', style = {}, ...rest }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        transform: inView ? 'translate3d(0,0,0)' : `translate3d(0,${y}px,0)`,
        opacity: inView ? 1 : 0,
        transition: `transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'transform, opacity',
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Stagger container — children get incremental delays via index
function Stagger({ as: Tag = 'div', step = 80, base = 0, y = 16, children, className = '', style = {} }) {
  const arr = React.Children.toArray(children);
  return (
    <Tag className={className} style={style}>
      {arr.map((child, i) => (
        <Reveal key={i} delay={base + i * step} y={y}>
          {child}
        </Reveal>
      ))}
    </Tag>
  );
}

// Decrypted text effect
function DecryptedText({ text, speed = 35, className = '', style = {} }) {
  const [out, setOut] = useState(text);
  const [done, setDone] = useState(false);
  const chars = '!<>-_\\/[]{}—=+*^?#';
  useEffect(() => {
    let raf, frame = 0;
    const original = text;
    const length = original.length;
    const reveal = (frame / 2) | 0;
    const tick = () => {
      frame++;
      const reveal = Math.min(length, (frame / 2) | 0);
      let s = '';
      for (let i = 0; i < length; i++) {
        if (i < reveal) s += original[i];
        else if (original[i] === ' ') s += ' ';
        else s += chars[(Math.random() * chars.length) | 0];
      }
      setOut(s);
      if (reveal >= length) { setDone(true); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return <span className={className} style={style}>{out}</span>;
}

// Animated number counter
function CountUp({ to, duration = 1400, suffix = '', className = '' }) {
  const [v, setV] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref} className={className}>{v}{suffix}</span>;
}

// Mouse-tracked tilt for cards
function useTilt(strength = 8) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateZ(0)`;
      });
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}

export { useInView, Reveal, Stagger, DecryptedText, CountUp, useTilt };
