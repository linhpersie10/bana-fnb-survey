export const EASE_OUT = [0.2, 0.9, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const SPRING = { type: 'spring', stiffness: 380, damping: 30 } as const;
export const SPRING_SOFT = { type: 'spring', stiffness: 220, damping: 26 } as const;
export const SPRING_POP = { type: 'spring', stiffness: 520, damping: 22 } as const;

export const DURATION = {
  fast: 0.16,
  base: 0.28,
  slow: 0.5,
} as const;
