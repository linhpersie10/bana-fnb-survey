import React from 'react';

/**
 * VaultShell — khung màn hình "VisionOS Spatial Glass" chuẩn PKT Payment
 * dùng cho màn Đăng nhập & Mã PIN 6 số.
 */
export function VaultShell({
  children,
  topRight,
  footer,
  maxWidth = 420,
  cardClassName = '',
}: {
  children: React.ReactNode;
  topRight?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
  cardClassName?: string;
}) {
  return (
    <div className="vs-root">
      <div className="pkt-ambient-bg" aria-hidden="true">
        <div className="pkt-ambient-grid" />
      </div>
      <style>{`
        .pkt-ambient-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; contain: strict;
          background:
            radial-gradient(1100px 580px at 82% -8%, color-mix(in srgb, var(--brand) 9%, transparent), transparent 62%),
            radial-gradient(980px 620px at 8% 108%, color-mix(in srgb, var(--brand) 6%, transparent), transparent 65%),
            var(--bg);
        }
        .pkt-ambient-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(to right, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px),
            linear-gradient(to bottom, color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px);
          background-size: 96px 96px;
          mask-image: radial-gradient(ellipse 90% 78% at 50% 42%, rgba(0, 0, 0, 0.6) 20%, transparent 92%);
          -webkit-mask-image: radial-gradient(ellipse 90% 78% at 50% 42%, rgba(0, 0, 0, 0.6) 20%, transparent 92%);
        }
        @media (prefers-reduced-motion: reduce) {
          .vs-ring, .vs-card, .vs-corner, .vs-edge::after { animation: none !important; }
        }
        .vs-root {
          position: relative; min-height: 100dvh; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 20px; font-family: var(--font-ui);
          background: transparent;
        }
        .vs-ring { position: absolute; border-radius: 9999px; border: 1px solid color-mix(in srgb, var(--brand) 16%, transparent); pointer-events: none; z-index: 1; }
        .vs-ring.r1 { width: 620px; height: 620px; top: -240px; right: -180px; animation: vs-float 14s ease-in-out infinite; }
        .vs-ring.r2 { width: 380px; height: 380px; bottom: -140px; left: -110px; border-color: color-mix(in srgb, var(--brand) 12%, transparent); animation: vs-float 18s ease-in-out infinite reverse; }
        .vs-card {
          position: relative; z-index: 2; width: 100%; text-align: center;
          border-radius: 28px; padding: 38px 32px 32px;
          background: linear-gradient(165deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface) 88%, transparent));
          border: 1.5px solid color-mix(in srgb, var(--brand) 48%, transparent);
          box-shadow:
            0 0 0 1px color-mix(in srgb, var(--brand) 22%, transparent),
            0 0 36px -6px color-mix(in srgb, var(--brand) 30%, transparent),
            var(--e3),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(28px) saturate(165%); -webkit-backdrop-filter: blur(28px) saturate(165%);
          animation: vs-rise .5s cubic-bezier(.2,.9,.3,1.2) both;
        }
        .vs-title { font-family: var(--font-ui); font-size: 22px; font-weight: 600; color: var(--fg); letter-spacing: -0.01em; margin: 0; }
        .vs-desc { margin-top: 8px; font-size: 13.5px; line-height: 1.5; color: var(--fg-muted); text-wrap: balance; }
        .vs-top-right { position: absolute; top: 18px; right: 20px; z-index: 5; display: flex; align-items: center; gap: 8px; }
        .vs-footer { position: relative; z-index: 2; margin-top: 22px; display: flex; gap: 18px; align-items: center; justify-content: center; font-size: 12px; color: var(--fg-muted); }
        .vs-ghost-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 15px;
          border-radius: 9999px; border: 1px solid color-mix(in srgb, var(--brand) 35%, transparent);
          background: color-mix(in srgb, var(--surface) 82%, transparent); color: var(--fg);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          font-size: 12.5px; font-weight: 500; cursor: pointer; transition: all .15s;
        }
        .vs-ghost-btn:hover { border-color: color-mix(in srgb, var(--brand) 75%, transparent); box-shadow: 0 0 18px color-mix(in srgb, var(--brand) 35%, transparent); }
        .vs-corner { position: absolute; width: 26px; height: 26px; pointer-events: none; animation: vs-corner-in .6s cubic-bezier(.2,.9,.3,1) .3s both; }
        .vs-corner::before, .vs-corner::after { content: ''; position: absolute; background: linear-gradient(90deg, color-mix(in srgb, var(--brand) 55%, white), var(--brand-solid)); border-radius: 2px; box-shadow: 0 0 12px color-mix(in srgb, var(--brand) 65%, transparent); }
        .vs-corner::before { height: 2px; width: 100%; }
        .vs-corner::after { width: 2px; height: 100%; }
        .vs-corner.tl { top: -7px; left: -7px; }
        .vs-corner.tr { top: -7px; right: -7px; transform: scaleX(-1); }
        .vs-corner.bl { bottom: -7px; left: -7px; transform: scaleY(-1); }
        .vs-corner.br { bottom: -7px; right: -7px; transform: scale(-1, -1); }
        .vs-corner.tl::before, .vs-corner.tr::before, .vs-corner.tl::after, .vs-corner.tr::after { top: 0; left: 0; }
        .vs-corner.bl::before, .vs-corner.br::before, .vs-corner.bl::after, .vs-corner.br::after { top: 0; left: 0; }
        .vs-edge { position: absolute; top: -1px; left: 28px; right: 28px; height: 1.5px; overflow: hidden; pointer-events: none; }
        .vs-edge::after { content: ''; position: absolute; inset: 0 auto 0 -30%; width: 35%; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--brand) 95%, transparent), transparent); animation: vs-edge 5s ease-in-out 1.2s infinite; }
        .vs-card.shake { animation: vs-rise .5s cubic-bezier(.2,.9,.3,1.2) both, vs-shake .45s ease; }
        .vs-card.leaving { animation: vs-rise .5s cubic-bezier(.2,.9,.3,1.2) both, vs-leave .32s cubic-bezier(.65,0,.35,1) both; }
        @keyframes vs-rise { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes vs-float { 50% { transform: translateY(18px); } }
        @keyframes vs-corner-in { from { opacity: 0; width: 0; height: 0; } to { opacity: 1; width: 26px; height: 26px; } }
        @keyframes vs-edge { 0% { left: -30%; } 60%, 100% { left: 110%; } }
        @keyframes vs-leave { to { opacity: 0; transform: scale(1.04); filter: blur(6px); } }
        @keyframes vs-shake {
          10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-7px); } 40%, 60% { transform: translateX(7px); }
        }
      `}</style>

      <div className="vs-ring r1" />
      <div className="vs-ring r2" />
      {topRight && <div className="vs-top-right">{topRight}</div>}
      <div className={`vs-card${cardClassName ? ` ${cardClassName}` : ''}`} style={{ maxWidth }}>
        <span className="vs-corner tl" aria-hidden />
        <span className="vs-corner tr" aria-hidden />
        <span className="vs-corner bl" aria-hidden />
        <span className="vs-corner br" aria-hidden />
        <span className="vs-edge" aria-hidden />
        {children}
      </div>
      {footer && <div className="vs-footer">{footer}</div>}
    </div>
  );
}
