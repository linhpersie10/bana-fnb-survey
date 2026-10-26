import React from 'react';
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'motion/react';
import { EASE_IN_OUT, EASE_OUT, SPRING, SPRING_POP } from './motionTokens';

export type PinPhase = 'typing' | 'verifying' | 'success' | 'error';

const ASPECT = 52 / 44;
const STEP = 1.2;
const RX = 1.45;
const RY = 0.62;
const ORBIT_SECONDS = 1.6;
const SAMPLES = 12;

const pct = (n: number) => `${n.toFixed(2)}%`;

function rowOffset(i: number, length: number) {
  return (i - (length - 1) / 2) * STEP;
}

function orbitFrames(i: number, length: number) {
  const base = (i / length) * Math.PI * 2 - Math.PI / 2;
  const off = rowOffset(i, length);
  const x: string[] = [];
  const y: string[] = [];
  const scale: number[] = [];
  for (let k = 0; k <= SAMPLES; k++) {
    const t = base + (k / SAMPLES) * Math.PI * 2;
    x.push(pct((RX * Math.cos(t) - off) * 100));
    y.push(pct(((RY * Math.sin(t)) / ASPECT) * 100));
    scale.push(0.62 + 0.14 * Math.sin(t));
  }
  return { x, y, scale };
}

export function PinCells({
  length,
  filled,
  phase,
  onClick,
}: {
  length: number;
  filled: number;
  phase: PinPhase;
  onClick?: () => void;
}) {
  const reduce = useReducedMotion();
  const [looping, setLooping] = React.useState(false);

  React.useEffect(() => {
    if (phase !== 'verifying') {
      setLooping(false);
      return;
    }
    const t = setTimeout(() => setLooping(true), 380);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="pc-wrap" onClick={onClick}>
      <style>{`
        .pc-wrap { position: relative; margin: 22px auto 4px; width: 100%; max-width: 308px; cursor: text; }
        .pc-row { display: flex; gap: calc(100% / 35); }
        .pc-cell {
          position: relative; flex: 0 0 calc(100% / 7); aspect-ratio: 44 / 52;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px; border: 1px solid color-mix(in srgb, var(--brand) 28%, transparent);
          background: linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 95%, transparent), color-mix(in srgb, var(--surface-2) 70%, transparent));
          box-shadow: inset 0 1px 0 color-mix(in srgb, var(--surface-2) 95%, transparent);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          transition: border-color .2s, box-shadow .25s, background .25s;
        }
        .pc-cell.active { border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 20%, transparent), 0 0 20px color-mix(in srgb, var(--brand) 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.14); }
        .pc-cell.filled { border-color: color-mix(in srgb, var(--brand) 58%, transparent); background: linear-gradient(180deg, color-mix(in srgb, var(--brand) 18%, transparent), color-mix(in srgb, var(--brand) 5%, transparent)); }
        .pc-cell.orbit { border-color: color-mix(in srgb, var(--brand) 85%, transparent); box-shadow: 0 0 18px color-mix(in srgb, var(--brand) 55%, transparent); }
        .pc-cell.err { border-color: color-mix(in srgb, var(--danger) 85%, transparent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 12%, transparent), 0 0 16px color-mix(in srgb, var(--danger) 30%, transparent); }
        .pc-cell.ok { border-color: color-mix(in srgb, var(--success) 90%, transparent); box-shadow: 0 0 18px color-mix(in srgb, var(--success) 50%, transparent); }
        .pc-dot { width: 26%; aspect-ratio: 1; border-radius: 9999px; background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--brand) 55%, white), var(--brand-solid)); box-shadow: 0 0 12px color-mix(in srgb, var(--brand) 85%, transparent); }
        .pc-caret { width: 2px; height: 40%; background: var(--brand); animation: pc-blink 1.1s steps(1) infinite; }
        .pc-badge {
          position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px;
          display: flex; align-items: center; justify-content: center; border-radius: 16px;
          border: 1.5px solid color-mix(in srgb, var(--success) 95%, transparent);
          background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--success) 28%, transparent), color-mix(in srgb, var(--surface) 85%, transparent));
          box-shadow: 0 0 26px color-mix(in srgb, var(--success) 55%, transparent), inset 0 1px 0 rgba(255,255,255,0.15);
          pointer-events: none;
        }
        .pc-ring { position: absolute; left: 50%; top: 50%; width: 58px; height: 58px; margin: -29px 0 0 -29px; border-radius: 9999px; border: 1.5px solid color-mix(in srgb, var(--success) 70%, transparent); pointer-events: none; }
        @keyframes pc-blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .pc-caret { animation: none; } }
      `}</style>

      <div className="pc-row">
        {Array.from({ length }).map((_, i) => {
          const isFilled = i < filled;
          const isActive = phase === 'typing' && i === filled;
          const off = rowOffset(i, length);
          const cls = [
            'pc-cell',
            isActive && 'active',
            isFilled && phase === 'typing' && 'filled',
            phase === 'verifying' && 'orbit',
            phase === 'error' && 'err',
            phase === 'success' && 'ok',
          ]
            .filter(Boolean)
            .join(' ');

          let animate: TargetAndTransition;
          let transition: Transition;
          if (phase === 'verifying' && !reduce && !looping) {
            const f = orbitFrames(i, length);
            animate = { x: f.x[0], y: f.y[0], scale: f.scale[0], rotate: 45, opacity: 1 };
            transition = { duration: 0.36, ease: EASE_OUT };
          } else if (phase === 'verifying' && !reduce) {
            const f = orbitFrames(i, length);
            animate = { ...f, rotate: 45, opacity: 1 };
            transition = {
              x: { duration: ORBIT_SECONDS, ease: 'linear', repeat: Infinity },
              y: { duration: ORBIT_SECONDS, ease: 'linear', repeat: Infinity },
              scale: { duration: ORBIT_SECONDS, ease: 'linear', repeat: Infinity },
              rotate: { duration: 0.35, ease: EASE_OUT },
            };
          } else if (phase === 'success') {
            animate = reduce
              ? { opacity: 0 }
              : { x: pct(-off * 100), y: '0%', scale: 0.85, rotate: 45, opacity: [1, 1, 0] };
            transition = { duration: 0.42, ease: EASE_IN_OUT, opacity: { duration: 0.5, times: [0, 0.7, 1] } };
          } else {
            animate = { x: '0%', y: '0%', scale: isActive ? 1.06 : 1, rotate: 0, opacity: 1 };
            transition = { ...SPRING, delay: phase === 'error' ? 0 : i * 0.015 };
          }

          return (
            <motion.div
              key={i}
              className={cls}
              animate={animate}
              transition={transition}
              style={{ zIndex: phase === 'verifying' ? 2 : 1 }}
            >
              {phase === 'typing' && isFilled && (
                <motion.span
                  className="pc-dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING_POP}
                />
              )}
              {isActive && <span className="pc-caret" />}
            </motion.div>
          );
        })}
      </div>

      {phase === 'success' && (
        <>
          {!reduce &&
            [0, 1, 2].map((k) => (
              <motion.span
                key={k}
                className="pc-ring"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2.6, opacity: [0, 0.8, 0] }}
                transition={{ duration: 1.1, delay: 0.38 + k * 0.18, ease: EASE_OUT }}
              />
            ))}
          <motion.div
            className="pc-badge"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: 45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ ...SPRING_POP, delay: reduce ? 0 : 0.34 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <motion.path
                d="M5 12.5l4.2 4.2L19 7"
                stroke="#eafff6"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.38, delay: reduce ? 0.05 : 0.55, ease: EASE_OUT }}
              />
            </svg>
          </motion.div>
        </>
      )}
    </div>
  );
}
