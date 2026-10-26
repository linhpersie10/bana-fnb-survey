/**
 * SurveyHero (PaymentHero) — Hình động 3D nhận diện Ban Ẩm Thực (F&B Survey)
 * trên màn hình chờ đăng nhập:
 * Máy tính bảng khảo sát CAPI 3D nghiêng qua lại với danh sách câu hỏi,
 * 5 ngôi sao đánh giá ẩm thực (★★★★★) và các biểu tượng F&B xoay quanh bệ hologram.
 */
const ORBIT = 'M590 520 A270 68 0 1 1 50 520 A270 68 0 1 1 590 520';

// 6 biểu tượng vector Ẩm thực & Khảo sát xoay quanh bệ hologram
const ORBIT_ICONS = [
  // 1. Ngôi sao đánh giá 5 sao
  'M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z',
  // 2. Cloche / Nắp phục vụ nhà hàng
  'M4 15a8 8 0 0 1 16 0H4zm8-12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM2 17h20',
  // 3. Tách cà phê / Đồ uống
  'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zm3-5v2m4-2v2m4-2v2',
  // 4. Dấu tích khảo sát hoàn thành
  'M20 6L9 17l-5-5',
  // 5. Dao & Nĩa nhà hàng
  'M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c2.5 0 4 2.5 4 6v4h-4v8',
  // 6. Ly đồ uống / Ẩm thực Bà Nà
  'M8 22h8m-4-7v7m-6-19h12l-1.5 7.5a4.5 4.5 0 0 1-9 0L6 3z',
];

export function PaymentHero({ scale: scaleProp }: { scale?: number }) {
  const scale =
    scaleProp ?? (typeof window !== 'undefined' && window.innerWidth < 440 ? 0.36 : 0.44);
  const W = 640;
  const top = 96;
  const bottom = 604;
  return (
    <div
      className="ph"
      style={{ width: W * scale, height: (bottom - top) * scale }}
      aria-hidden="true"
    >
      <style>{`
        .ph { position: relative; margin: -6px auto 6px; overflow: visible; }
        .ph-stage { position: absolute; left: 0; width: 640px; height: 640px; transform-origin: 0 0; }
        .ph-stage > svg { position: absolute; left: 0; top: 0; width: 640px; height: 640px; overflow: visible; }
        .ph .ring-p { transform-origin: 320px 520px; animation: ph-ring 2.8s cubic-bezier(.2,.9,.3,1) infinite; }
        .ph .cg circle { fill: color-mix(in srgb, var(--surface) 88%, #1f2937); stroke: color-mix(in srgb, var(--brand) 70%, transparent); stroke-width: 1.5; }
        .ph .cg path { fill: none; stroke: var(--brand); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .ph .c3wrap { position: absolute; left: 105px; top: 104px; width: 430px; height: 274px; perspective: 1100px; }
        .ph .card3d {
          position: absolute; inset: 0; border-radius: 26px; padding: 22px 28px;
          display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; color: #fff;
          background: linear-gradient(125deg, #334155 0%, #1e293b 42%, var(--brand-solid) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 40px 70px -24px rgba(0,0,0,.6), 0 0 80px color-mix(in srgb, var(--brand) 32%, transparent);
          transform-style: preserve-3d; animation: ph-tilt 9s ease-in-out infinite;
        }
        .ph .card3d::before {
          content: ''; position: absolute; inset: 0;
          background:
            radial-gradient(circle at 85% 15%, rgba(255,255,255,.28), rgba(255,255,255,0) 40%),
            repeating-linear-gradient(115deg, rgba(255,255,255,.04) 0 2px, transparent 2px 9px);
        }
        .ph .shine {
          position: absolute; top: -40%; left: -60%; width: 40%; height: 180%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.4), rgba(255,255,255,0));
          transform: rotate(18deg); animation: ph-shine 4.5s ease-in-out infinite;
        }
        .ph .ctop { position: relative; display: flex; justify-content: space-between; align-items: center; }
        .ph .cbadge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.28);
          font-family: var(--font-code); font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
        }
        .ph .cstars { display: inline-flex; gap: 4px; color: #fbbf24; font-size: 20px; filter: drop-shadow(0 2px 6px rgba(251, 191, 36, 0.45)); }
        .ph .cmid { position: relative; align-self: center; display: grid; gap: 9px; margin: 6px 0; }
        .ph .crow {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255, 255, 255, 0.11); border-radius: 10px; padding: 7px 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
        }
        .ph .ccheck {
          width: 20px; height: 20px; border-radius: 6px; background: #10b981;
          display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800;
        }
        .ph .cbar { flex: 1; height: 7px; border-radius: 99px; background: rgba(255,255,255,0.2); overflow: hidden; }
        .ph .cbar > i { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #fde047, #ffffff); }
        .ph .cpct { font-family: var(--font-code); font-size: 12px; font-weight: 700; opacity: 0.92; }
        .ph .cbot { position: relative; display: flex; justify-content: space-between; align-items: flex-end; }
        .ph .cbot div { display: grid; row-gap: 2px; text-align: left; }
        .ph .cbot span { font-family: var(--font-code); font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #fde047; }
        .ph .cbot em { font-style: normal; font-size: 17px; font-weight: 600; opacity: .95; }
        .ph .cquota {
          padding: 5px 12px; border-radius: 10px; background: rgba(15, 23, 42, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.25); font-family: var(--font-code); font-size: 13px; font-weight: 700;
        }
        .ph .waves { position: absolute; left: 542px; top: 162px; width: 80px; height: 160px; fill: none; stroke: var(--brand); stroke-width: 4; stroke-linecap: round; }
        .ph .waves path { opacity: 0; animation: ph-wave 1.8s ease-out infinite; }
        .ph .waves path:nth-child(2) { animation-delay: .25s; }
        .ph .waves path:nth-child(3) { animation-delay: .5s; }
        .ph-pop { animation: ph-pop .7s .2s cubic-bezier(.2,.9,.3,1) backwards; }
        @keyframes ph-pop { from { opacity: 0; transform: scale(.86); } to { opacity: 1; transform: none; } }
        @keyframes ph-ring { from { transform: scale(.6); opacity: .9; } to { transform: scale(1.45); opacity: 0; } }
        @keyframes ph-tilt { 0%, 100% { transform: rotateY(-14deg) rotateX(8deg) translateY(0); } 50% { transform: rotateY(14deg) rotateX(-5deg) translateY(-12px); } }
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
            <ellipse
              cx="320"
              cy="520"
              rx="270"
              ry="68"
              fill="none"
              stroke="color-mix(in srgb, var(--fg-muted) 55%, transparent)"
              strokeWidth="1.5"
              strokeDasharray="3 7"
            />
            <ellipse
              cx="320"
              cy="520"
              rx="180"
              ry="44"
              fill="none"
              stroke="color-mix(in srgb, var(--brand) 55%, transparent)"
              strokeWidth="1.2"
            />
            <ellipse
              className="ring-p"
              cx="320"
              cy="520"
              rx="180"
              ry="44"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2"
            />
            {ORBIT_ICONS.map((dPath, i) => (
              <g className="cg" key={i}>
                <circle r="24" />
                <g transform="translate(-12, -12)">
                  <path d={dPath} />
                </g>
                <animateMotion
                  dur="14s"
                  begin={`-${((14 / ORBIT_ICONS.length) * i).toFixed(2)}s`}
                  repeatCount="indefinite"
                  path={ORBIT}
                />
              </g>
            ))}
          </svg>
          <div className="c3wrap">
            <div className="card3d">
              <i className="shine" />
              <div className="ctop">
                <span className="cbadge">CAPI • F&amp;B SURVEY</span>
                <span className="cstars">★★★★★</span>
              </div>
              <div className="cmid">
                <div className="crow">
                  <span className="ccheck">✓</span>
                  <span className="cbar">
                    <i style={{ width: '88%' }} />
                  </span>
                  <span className="cpct">S • A • B • C</span>
                </div>
                <div className="crow">
                  <span className="ccheck">✓</span>
                  <span className="cbar">
                    <i style={{ width: '72%' }} />
                  </span>
                  <span className="cpct">5 ĐIỂM TRỰC</span>
                </div>
              </div>
              <div className="cbot">
                <div>
                  <span>Ban Ẩm Thực</span>
                  <em>Sun World Ba Na Hills</em>
                </div>
                <span className="cquota">N = 600</span>
              </div>
            </div>
          </div>
          <svg className="waves" viewBox="0 0 80 160">
            <path d="M10 50a40 40 0 0 1 0 60" />
            <path d="M30 30a64 64 0 0 1 0 100" />
            <path d="M50 10a88 88 0 0 1 0 140" />
          </svg>
        </div>
      </div>
    </div>
  );
}
