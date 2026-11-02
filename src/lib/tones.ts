export type ToneKey =
  | 'brand'
  | 'ocean'
  | 'iris'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface ToneTokens {
  hex: string;
  dot: string;
  bar: string;
  pill: string;
  surface: string;
  text: string;
  accent: string;
}

export const TONES: Record<ToneKey, ToneTokens> = {
  brand: {
    hex: '#d12f2f',
    dot: 'bg-[#d12f2f]',
    bar: 'bg-[#d12f2f]',
    pill: 'bg-red-50 text-[#d12f2f] ring-red-200/80',
    surface: 'border-red-200/80 bg-red-50/40',
    text: 'text-[#d12f2f]',
    accent: 'border-l-[#d12f2f]',
  },
  ocean: {
    hex: '#0891b2',
    dot: 'bg-cyan-600',
    bar: 'bg-cyan-600',
    pill: 'bg-cyan-50 text-cyan-800 ring-cyan-200/80',
    surface: 'border-cyan-200/80 bg-cyan-50/40',
    text: 'text-cyan-700',
    accent: 'border-l-cyan-600',
  },
  iris: {
    hex: '#6366f1',
    dot: 'bg-indigo-500',
    bar: 'bg-indigo-500',
    pill: 'bg-indigo-50 text-indigo-700 ring-indigo-200/80',
    surface: 'border-indigo-200/80 bg-indigo-50/40',
    text: 'text-indigo-700',
    accent: 'border-l-indigo-500',
  },
  success: {
    hex: '#10b981',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    surface: 'border-emerald-200/80 bg-emerald-50/40',
    text: 'text-emerald-700',
    accent: 'border-l-emerald-500',
  },
  warning: {
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    surface: 'border-amber-200/80 bg-amber-50/40',
    text: 'text-amber-700',
    accent: 'border-l-amber-500',
  },
  danger: {
    hex: '#f43f5e',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    surface: 'border-rose-200/80 bg-rose-50/40',
    text: 'text-rose-700',
    accent: 'border-l-rose-500',
  },
  info: {
    hex: '#3b82f6',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    pill: 'bg-blue-50 text-blue-700 ring-blue-200/80',
    surface: 'border-blue-200/80 bg-blue-50/40',
    text: 'text-blue-700',
    accent: 'border-l-blue-500',
  },
  neutral: {
    hex: '#94a3b8',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    surface: 'border-slate-200/80 bg-slate-50/60',
    text: 'text-slate-600',
    accent: 'border-l-slate-400',
  },
};

/**
 * Chuỗi màu phân loại trung tính (không dùng danger/warning cho các phân khúc trung tính
 * để tránh gây hiểu nhầm là cảnh báo).
 */
export const CATEGORICAL_TONES: ToneKey[] = [
  'ocean',
  'iris',
  'brand',
  'success',
  'info',
  'neutral',
];

export const CATEGORICAL_HEX: string[] = [
  '#0891b2', // cyan-600
  '#6366f1', // indigo-500
  '#d12f2f', // brand red
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#64748b', // slate-500
  '#0d9488', // teal-600
  '#8b5cf6', // violet-500
];

/**
 * Thang màu 5 mức Likert chuẩn phân tích (1: Thấp -> 5: Rất cao)
 */
export const LIKERT_TONE_HEX: [string, string, string, string, string] = [
  '#f43f5e', // 1 - rose-500
  '#f59e0b', // 2 - amber-500
  '#94a3b8', // 3 - slate-400
  '#0891b2', // 4 - cyan-600
  '#10b981', // 5 - emerald-500
];
