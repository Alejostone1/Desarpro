// ProcessTimeline — connected horizontal/vertical process with scroll reveal.

import React from 'react';
import Icon from '../lib/icons.jsx';
import { Editable } from '../lib/admin.jsx';

function ProcessTimeline({ steps, titleAriaLabel }) {
  const containerRef = React.useRef(null);
  const [activeCount, setActiveCount] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (reducedMotion) {
      setActiveCount(steps.length);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        let i = 0;
        setActiveCount(0);
        const tick = () => {
          i += 1;
          setActiveCount(i);
          if (i < steps.length) setTimeout(tick, 220);
        };
        tick();
        obs.disconnect();
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [steps.length, reducedMotion]);

  return (
    <div ref={containerRef} className="process-timeline" aria-label={titleAriaLabel}>
      <div className="process-timeline-rail" aria-hidden="true">
        <div
          className="process-timeline-rail-fill"
          style={{ width: activeCount <= 1 ? '0%' : `${((activeCount - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <ol className="process-timeline-steps">
        {steps.map((step, i) => {
          const StepIcon = Icon[step.icon] || Icon.Layers;
          const isActive = i < activeCount;
          const isCurrent = i === activeCount - 1;
          return (
            <li
              key={step.n}
              className={`process-timeline-step${isActive ? ' is-visible' : ''}${isCurrent ? ' is-current' : ''}`}
              style={{ '--step-delay': `${i * 80}ms` }}
            >
              <div className="process-timeline-node-row">
                <span className="process-timeline-number">{step.n}</span>
                <span className="process-timeline-node">
                  <StepIcon size={16} />
                </span>
              </div>
              <h3 className="process-timeline-title">
                <Editable id={step.tKey} defaultValue={step.title} />
              </h3>
              <p className="process-timeline-desc">
                <Editable id={step.dKey} multiline defaultValue={step.desc} />
              </p>
              {i < steps.length - 1 && (
                <span className="process-timeline-connector" aria-hidden="true">
                  <span className={`process-timeline-connector-line${isActive && i < activeCount - 1 ? ' is-drawn' : ''}`} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <style>{`
        .process-timeline {
          position: relative;
          margin-top: 8px;
        }
        .process-timeline-rail {
          display: none;
        }
        .process-timeline-steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          position: relative;
        }
        .process-timeline-step {
          position: relative;
          padding: 28px 24px 32px;
          border-top: 1px solid color-mix(in srgb, var(--card-border) 85%, transparent);
          border-right: 1px solid color-mix(in srgb, var(--card-border) 82%, transparent);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 520ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) var(--step-delay, 0ms),
                      transform 520ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) var(--step-delay, 0ms),
                      background 300ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
        }
        .process-timeline-step:first-child {
          border-left: 1px solid color-mix(in srgb, var(--card-border) 82%, transparent);
        }
        .process-timeline-step.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .process-timeline-step:hover,
        .process-timeline-step.is-current {
          background: linear-gradient(180deg, color-mix(in srgb, var(--cyan-bright) 5%, transparent), transparent 75%);
        }
        .process-timeline-step:hover .process-timeline-number,
        .process-timeline-step.is-current .process-timeline-number {
          color: var(--cyan-bright);
        }
        .process-timeline-step:hover .process-timeline-node,
        .process-timeline-step.is-current .process-timeline-node {
          border-color: color-mix(in srgb, var(--cyan-bright) 70%, transparent);
          color: var(--cyan-bright);
        }
        .process-timeline-node-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 36px;
        }
        .process-timeline-number {
          font: 700 11px/1 var(--font-mono, monospace);
          letter-spacing: 0.14em;
          color: var(--text-3);
          transition: color 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
        }
        .process-timeline-node {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: var(--text-2);
          background: var(--bg-0);
          border: 1px solid color-mix(in srgb, var(--card-border) 90%, transparent);
          box-shadow: 0 0 0 4px var(--bg-0);
          transition: border-color 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      color 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)),
                      transform 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
        }
        .process-timeline-step:hover .process-timeline-node {
          transform: translateY(-2px);
        }
        .process-timeline-title {
          font-size: clamp(18px, 2vw, 22px);
          font-weight: 700;
          color: var(--text-0);
          margin: 0 0 10px;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .process-timeline-desc {
          color: var(--text-2);
          font-size: 14px;
          margin: 0;
          line-height: 1.65;
          max-width: 260px;
        }
        .process-timeline-connector { display: none; }

        @media (min-width: 981px) {
          .process-timeline-rail {
            display: block;
            position: absolute;
            top: 44px;
            left: 12%;
            right: 12%;
            height: 1px;
            background: color-mix(in srgb, var(--card-border) 80%, transparent);
            z-index: 0;
          }
          .process-timeline-rail-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--cyan-bright), color-mix(in srgb, var(--cyan-bright) 30%, transparent));
            transition: width 600ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
          }
          .process-timeline-step { z-index: 1; }
        }

        @media (max-width: 980px) {
          .process-timeline-steps {
            grid-template-columns: repeat(2, 1fr);
          }
          .process-timeline-step:nth-child(3) {
            border-left: 1px solid color-mix(in srgb, var(--card-border) 82%, transparent);
          }
        }

        @media (max-width: 580px) {
          .process-timeline-steps {
            grid-template-columns: 1fr;
          }
          .process-timeline-step,
          .process-timeline-step:nth-child(3) {
            border-left: 1px solid color-mix(in srgb, var(--card-border) 82%, transparent);
            border-bottom: 1px solid color-mix(in srgb, var(--card-border) 82%, transparent);
            padding: 24px 20px 28px;
          }
          .process-timeline-node-row { margin-bottom: 24px; }
          .process-timeline-desc { max-width: none; }
          .process-timeline-connector {
            display: flex;
            justify-content: center;
            position: absolute;
            left: 50%;
            bottom: -18px;
            transform: translateX(-50%);
            z-index: 2;
          }
          .process-timeline-connector-line {
            display: block;
            width: 1px;
            height: 0;
            background: var(--cyan-bright);
            transition: height 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1));
          }
          .process-timeline-connector-line.is-drawn { height: 28px; }
          .process-timeline-step:last-child .process-timeline-connector { display: none; }
        }
      `}</style>
    </div>
  );
}

export default ProcessTimeline;
