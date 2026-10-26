import React from 'react';

const SIZE = {
  sm: { mark: 'w-8 h-8 rounded-[8px]', word: 'text-[15px]', tag: 'text-[10px]' },
  md: { mark: 'w-10 h-10 rounded-[10px]', word: 'text-[18px]', tag: 'text-[10px]' },
  lg: { mark: 'w-14 h-14 rounded-[14px]', word: 'text-[24px]', tag: 'text-[11px]' },
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
      <img
        src="/logo.png"
        alt={showWordmark ? '' : 'PKT Survey'}
        aria-hidden={showWordmark || undefined}
        className={`shrink-0 object-contain ${s.mark}`}
      />
      {showWordmark && (
        <span className="flex flex-col leading-none text-left">
          <span className={`font-semibold tracking-[-0.01em] text-[var(--fg)] ${s.word}`}>
            F&amp;B Survey
          </span>
          <span
            className={`mt-1 font-semibold uppercase tracking-[0.12em] text-[var(--brand-ink)] ${s.tag}`}
          >
            BNC System
          </span>
        </span>
      )}
    </span>
  );
}
