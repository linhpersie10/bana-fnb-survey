/**
 * PaymentHero — hình động nhận diện chuẩn PKT Payment cho màn Đăng nhập.
 */
const COINS = ['₫', '$', '€', '₩', '¥', '฿'];
const ORBIT = 'M590 520 A270 68 0 1 1 50 520 A270 68 0 1 1 590 520';

export function PaymentHero({ scale: scaleProp }: { scale?: number }) {
  const scale = scaleProp ?? (typeof window !== 'undefined' && window.innerWidth < 440 ? 0.36 : 0.44);
  const W = 640;
  const top = 96;
  const bottom = 604;
  return (
    <div className="ph" style={{ width: W * scale, height: (bottom - top) * scale }} aria-hidden="true">
      <style>{`
        .ph { position: relative; margin: -6px auto 6px; overflow: visible; }
        .ph-stage { position: absolute; left: 0; width: 640px; height: 640px; transform-origin: 0 0; }
        .ph-stage > svg { position: absolute; left: 0; top: 0; width: 640px; height: 640px; overflow: visible; }
        .ph .ring-p { transform-origin: 320px 520px; animation: ph-ring 2.8s cubic-bezier(.2,.9,.3,1) infinite; }
        .ph .cg circle { fill: color-mix(in srgb, var(--surface) 85%, #1f2937); stroke: color-mix(in srgb, var(--brand) 70%, transparent); stroke-width: 1.5; }
        .ph .cg text { font-family: var(--font-ui); font-size: 24px; font-weight: 600; fill: var(--brand); }
        .ph .c3wrap { position: absolute; left: 110px; top: 110px; width: 420px; height: 264px; perspective: 1100px; }
        .ph .card3d {
          position: absolute; inset: 0; border-radius: 26px; padding: 26px 30px;
          display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; color: #fff;
          background: linear-gradient(125deg, #6b7280 0%, #374151 38%, var(--brand-solid) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 40px 70px -24px rgba(0,0,0,.6), 0 0 80px color-mix(in srgb, var(--brand) 32%, transparent);
          transform-style: preserve-3d; animation: ph-tilt 9s ease-in-out infinite;
        }
        .ph .card3d::before { content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 85% 15%, rgba(255,255,255,.3), rgba(255,255,255,0) 40%), repeating-linear-gradient(115deg, rgba(255,255,255,.05) 0 2px, transparent 2px 9px); }
        .ph .shine { position: absolute; top: -40%; left: -60%; width: 40%; height: 180%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.42), rgba(255,255,255,0)); transform: rotate(18deg); animation: ph-shine 4.5s ease-in-out infinite; }
        .ph .ctop { position: relative; display: flex; justify-content: space-between; align-items: center; }
        .ph .cchip { width: 62px; height: 46px; border-radius: 9px; background: linear-gradient(135deg, #f3f4f6, #9ca3af); display: grid; grid-template-rows: repeat(3, 1fr); padding: 6px; gap: 4px; box-shadow: inset 0 0 0 1px rgba(55,65,81,.35); }
        .ph .cchip i { border-radius: 2px; border: 1px solid rgba(55,65,81,.35); }
        .ph .nfc { width: 42px; height: 42px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; }
        .ph .cnum { position: relative; align-self: center; white-space: nowrap; font-family: var(--font-code); font-size: 24px; font-weight: 600; letter-spacing: .04em; text-shadow: 0 2px 6px rgba(0,0,0,.35); }
        .ph .cbot { position: relative; display: flex; justify-content: space-between; align-items: flex-end; }
        .ph .cbot div { display: grid; row-gap: 2px; }
        .ph .cbot span { font-family: var(--font-code); font-size: 14px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
        .ph .cbot em { font-style: normal; font-size: 18px; font-weight: 600; opacity: .9; }
        .ph .cbrand { display: flex; }
        .ph .cbrand i { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.8); }
        .ph .cbrand i + i { margin-left: -14px; background: color-mix(in srgb, var(--brand) 75%, white); opacity: .9; }
        .ph .waves { position: absolute; left: 540px; top: 162px; width: 80px; height: 160px; fill: none; stroke: var(--brand); stroke-width: 4; stroke-linecap: round; }
        .ph .waves path { opacity: 0; animation: ph-wave 1.8s ease-out infinite; }
        .ph .waves path:nth-child(2) { animation-delay: .25s; }
        .ph .waves path:nth-child(3) { animation-delay: .5s; }
        .ph-pop { animation: ph-pop .7s .2s cubic-bezier(.2,.9,.3,1) backwards; }
        @keyframes ph-pop { from { opacity: 0; transform: scale(.86); } to { opacity: 1; transform: none; } }
        @keyframes ph-ring { from { transform: scale(.6); opacity: .9; } to { transform: scale(1.45); opacity: 0; } }
        @keyframes ph-tilt { 0%, 100% { transform: rotateY(-16deg) rotateX(9deg) translateY(0); } 50% { transform: rotateY(16deg) rotateX(-5deg) translateY(-14px); } }
        @keyframes ph-shine { 0%, 55% { left: -60%; } 100% { left: 130%; } }
        @keyframes ph-wave { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .ph .ring-p, .ph .card3d, .ph .shine, .ph .waves path, .ph-pop { animation: none; }
          .ph .waves path { opacity: .6; }
          .ph .card3d { transform: rotateY(-10deg) rotateX(6deg); }
        }
      `}</style>
      <div className="ph-pop" style={{ position: 'absolute', inset: 0 }}>
        <div className="ph-stage" style={{ top: -top * scale, transform: `scale(${scale})` }}>
          <svg viewBox="0 0 640 640">
            <defs>
              <radialGradient id="ph-pg">
                <stop offset="0" stopColor="var(--brand)" stopOpacity=".38" />
                <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="ph-bm" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="var(--brand)" stopOpacity=".22" />
                <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M170 516 L232 360 L408 360 L470 516 Z" fill="url(#ph-bm)" />
            <ellipse cx="320" cy="520" rx="250" ry="62" fill="url(#ph-pg)" />
            <ellipse cx="320" cy="520" rx="270" ry="68" fill="none" stroke="color-mix(in srgb, var(--fg-muted) 55%, transparent)" strokeWidth="1.5" strokeDasharray="3 7" />
            <ellipse cx="320" cy="520" rx="180" ry="44" fill="none" stroke="color-mix(in srgb, var(--brand) 55%, transparent)" strokeWidth="1.2" />
            <ellipse className="ring-p" cx="320" cy="520" rx="180" ry="44" fill="none" stroke="var(--brand)" strokeWidth="2" />
            {COINS.map((c, i) => (
              <g className="cg" key={c}>
                <circle r="23" />
                <text textAnchor="middle" dy="8">{c}</text>
                <animateMotion dur="14s" begin={`-${((14 / COINS.length) * i).toFixed(2)}s`} repeatCount="indefinite" path={ORBIT} />
              </g>
            ))}
          </svg>
          <div className="c3wrap">
            <div className="card3d">
              <i className="shine" />
              <div className="ctop">
                <span className="cchip"><i /><i /><i /></span>
                <svg className="nfc" viewBox="0 0 24 24"><path d="M8 7.5a6.5 6.5 0 0 1 0 9M11.5 5a10 10 0 0 1 0 14M15 2.8a13 13 0 0 1 0 18.4" /></svg>
              </div>
              <b className="cnum">F&amp;B&nbsp; ••••&nbsp; N600&nbsp; 2026</b>
              <div className="cbot">
                <div><span>PKT Survey</span><em>BNC System</em></div>
                <span className="cbrand"><i /><i /></span>
              </div>
            </div>
          </div>
          <svg className="waves" viewBox="0 0 80 160"><path d="M10 50a40 40 0 0 1 0 60" /><path d="M30 30a64 64 0 0 1 0 100" /><path d="M50 10a88 88 0 0 1 0 140" /></svg>
        </div>
      </div>
    </div>
  );
}
