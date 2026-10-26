import React from 'react';

const SIZE = {
  sm: { box: 'w-8 h-8 rounded-[9px]', icon: 17, word: 'text-[15px]', tag: 'text-[9.5px]' },
  md: { box: 'w-11 h-11 rounded-[12px]', icon: 22, word: 'text-[18px]', tag: 'text-[10px]' },
  lg: { box: 'w-14 h-14 rounded-[15px]', icon: 28, word: 'text-[23px]', tag: 'text-[11px]' },
} as const;

export function BrandMark({
  size = 'md',
  showWordmark = true,
  className = '',
}: {
  size?: keyof typeof SIZE;
  showWordmark?: boolean;
  className?: string;
}) {
  const s = SIZE[size];
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`shrink-0 inline-flex items-center justify-center text-white shadow-sm ${s.box}`}
        style={{
          background:
            'linear-gradient(135deg, #ef4444 0%, #d12f2f 55%, #991b1b 100%)',
          boxShadow:
            '0 4px 12px -2px rgba(209, 47, 47, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        }}
        aria-hidden={showWordmark || undefined}
      >
        {/* Biểu tượng Ban Ẩm Thực (Cloche + Ngôi sao khảo sát) */}
        <svg
          width={s.icon}
          height={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          <path d="M4 15a8 8 0 0 1 16 0" />
          <path d="M2 15h20" />
          <path d="M5 18h14" />
        </svg>
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none text-left">
          <span className={`font-semibold tracking-[-0.01em] text-[var(--fg)] ${s.word}`}>
            F&amp;B Survey
          </span>
          <span
            className={`mt-1 font-semibold uppercase tracking-[0.12em] text-[var(--brand-ink)] ${s.tag}`}
          >
            Ban Ẩm Thực
          </span>
        </span>
      )}
    </span>
  );
}
