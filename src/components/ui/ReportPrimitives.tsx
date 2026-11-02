import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { TONES, ToneKey, CATEGORICAL_HEX } from '../../lib/tones';

/* ============================================================================
 * 1. PAGE HEADER (Chuẩn DESIGN.md §6b D1 — Không icon trang trí, không mô tả thừa)
 * ============================================================================ */
export interface PageHeaderProps {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, meta, actions }) => {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 truncate">
          {title}
        </h1>
        {meta && (
          <div className="mt-0.5 text-xs text-slate-500 tabular-nums">{meta}</div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
};

/* ============================================================================
 * 2. STAT CARD (Chuẩn StatCard.tsx & KpiCard.tsx — Thanh màu mảnh, không icon hộp)
 * ============================================================================ */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  note?: React.ReactNode;
  tone?: ToneKey;
  valueTone?: ToneKey;
  badge?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  note,
  tone = 'ocean',
  valueTone,
  badge,
  active = false,
  onClick,
}) => {
  const barCls = TONES[tone].bar;
  const valCls = valueTone ? TONES[valueTone].text : 'text-slate-900';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-white p-3.5 transition-colors ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      } ${
        active
          ? 'border-[#d12f2f] ring-2 ring-[#d12f2f]/15 bg-red-50/15'
          : 'border-slate-200/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-3.5 w-1 shrink-0 rounded-full ${barCls}`} />
          <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className={`text-2xl font-semibold tracking-tight tabular-nums ${valCls}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-normal text-slate-400 tabular-nums">
            {subValue}
          </span>
        )}
      </div>

      {note && (
        <div className="mt-1 text-xs text-slate-500 truncate tabular-nums">{note}</div>
      )}
    </div>
  );
};

/* ============================================================================
 * 3. SECTION CARD (Chuẩn SectionCard.tsx — Header mảnh bg-slate-100/80, thanh màu 4px)
 * ============================================================================ */
export interface SectionCardProps {
  title: string;
  code?: string;
  meta?: React.ReactNode;
  tone?: ToneKey;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  code,
  meta,
  tone = 'ocean',
  actions,
  footer,
  children,
  className = '',
  bodyClassName = 'p-4',
}) => {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-100/80 px-4 py-2 min-h-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`h-4 w-1 shrink-0 rounded-full ${TONES[tone].bar}`} />
          {code && (
            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 border border-slate-200/80 shrink-0">
              {code}
            </span>
          )}
          <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
          {meta && (
            <span className="text-xs text-slate-500 tabular-nums shrink-0">· {meta}</span>
          )}
        </div>
        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      </div>

      <div className={`flex-1 ${bodyClassName}`}>{children}</div>

      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-2 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </section>
  );
};

/* ============================================================================
 * 4. SEGMENTED TOGGLE (Chuẩn chartParts.tsx)
 * ============================================================================ */
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedToggleProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
}

export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: SegmentedToggleProps<T>) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-6 px-2.5 text-xs rounded-md transition-colors cursor-pointer ${
              active
                ? 'bg-slate-900 font-medium text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
 * 5. ACTIVE FILTER CHIPS (Chuẩn ActiveFilterChips.tsx)
 * ============================================================================ */
export interface FilterChipItem {
  key: string;
  label: string;
  onClear: () => void;
}

export interface ActiveFilterChipsProps {
  chips: FilterChipItem[];
  onClearAll: () => void;
  summaryText?: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  chips,
  onClearAll,
  summaryText,
}) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-slate-500 font-medium">
        {summaryText || `Đang lọc (${chips.length}):`}
      </span>
      {chips.map((c) => (
        <span
          key={c.key}
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 pl-2 pr-1 py-0.5 text-xs font-medium text-slate-700"
        >
          {c.label}
          <button
            type="button"
            onClick={c.onClear}
            className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            title={`Bỏ lọc: ${c.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-xs font-medium text-slate-500 hover:text-slate-900 underline-offset-2 hover:underline cursor-pointer"
      >
        Xóa tất cả
      </button>
    </div>
  );
};

/* ============================================================================
 * 6. PROPORTION BREAKDOWN (Chuẩn AssetClassDistribution.tsx — Thanh tỷ trọng 100% + Bảng)
 * ============================================================================ */
export interface BreakdownItem {
  code: number | string;
  label: string;
  count: number;
  pct: number;
  colorHex?: string;
  active?: boolean;
  onClick?: () => void;
  onInspect?: () => void;
}

export interface ProportionBreakdownProps {
  items: BreakdownItem[];
  emptyText?: string;
  unitLabel?: string;
  showCodePrefix?: boolean;
}

export const ProportionBreakdown: React.FC<ProportionBreakdownProps> = ({
  items,
  emptyText = 'Chưa có dữ liệu',
  unitLabel = 'phiếu',
  showCodePrefix = false,
}) => {
  const totalCount = items.reduce((s, i) => s + i.count, 0);

  if (items.length === 0 || totalCount === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">{emptyText}</div>
    );
  }

  return (
    <div className="flex flex-col justify-between gap-3">
      {/* 100% Stacked Proportion Bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
        {items.map((item, idx) => {
          const share = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
          if (share <= 0) return null;
          const hex = item.colorHex || CATEGORICAL_HEX[idx % CATEGORICAL_HEX.length];
          return (
            <motion.div
              key={item.code}
              initial={{ width: 0 }}
              animate={{ width: `${share}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ backgroundColor: hex }}
              onClick={item.onClick}
              className={`h-full border-r-2 border-white last:border-r-0 ${
                item.onClick ? 'cursor-pointer hover:opacity-85' : ''
              }`}
              title={`${item.label}: ${item.count.toLocaleString('vi-VN')} ${unitLabel} (${share.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Aligned Breakdown Table */}
      <table className="w-full divide-y divide-slate-100 text-xs">
        <tbody className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const hex = item.colorHex || CATEGORICAL_HEX[idx % CATEGORICAL_HEX.length];
            const share = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
            return (
              <tr
                key={item.code}
                onClick={item.onClick}
                className={`transition-colors ${
                  item.onClick ? 'cursor-pointer hover:bg-slate-50' : ''
                } ${item.active ? 'bg-red-50/50 font-semibold' : ''}`}
              >
                <td className="py-1.5 pr-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: hex }}
                    />
                    {showCodePrefix && (
                      <span className="font-mono text-[11px] text-slate-400 shrink-0">
                        {item.code}.
                      </span>
                    )}
                    <span
                      className={`truncate ${
                        item.active
                          ? 'font-semibold text-[#d12f2f]'
                          : 'font-medium text-slate-700'
                      }`}
                      title={item.label}
                    >
                      {item.label}
                    </span>
                  </div>
                </td>
                <td className="py-1.5 px-2 text-right font-semibold tabular-nums text-slate-900 whitespace-nowrap">
                  {item.onInspect ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onInspect?.();
                      }}
                      className="hover:text-[#d12f2f] hover:underline underline-offset-2 cursor-pointer"
                      title="Xem danh sách phiếu thuộc nhóm này"
                    >
                      {item.count.toLocaleString('vi-VN')} {unitLabel}
                    </button>
                  ) : (
                    <>
                      {item.count.toLocaleString('vi-VN')} {unitLabel}
                    </>
                  )}
                </td>
                <td className="py-1.5 pl-2 w-14 text-right tabular-nums text-slate-500 whitespace-nowrap">
                  {share.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ============================================================================
 * 7. RANKED BAR LIST (Chuẩn AssetDepartmentChart.tsx — Thanh ngang h-1.5 mảnh, rõ số liệu)
 * ============================================================================ */
export interface RankedBarListProps {
  items: BreakdownItem[];
  barHex?: string;
  useCategoricalColors?: boolean;
  unitLabel?: string;
  showCodePrefix?: boolean;
  emptyText?: string;
}

export const RankedBarList: React.FC<RankedBarListProps> = ({
  items,
  barHex = '#0891b2',
  useCategoricalColors = false,
  unitLabel = 'phiếu',
  showCodePrefix = true,
  emptyText = 'Chưa có dữ liệu',
}) => {
  const maxPct = Math.max(...items.map((i) => i.pct), 1);

  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400">{emptyText}</div>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, idx) => {
        const widthPct = item.pct > 0 ? Math.max((item.pct / maxPct) * 100, 3) : 0;
        const fillHex =
          item.colorHex ||
          (useCategoricalColors
            ? CATEGORICAL_HEX[idx % CATEGORICAL_HEX.length]
            : barHex);

        return (
          <div
            key={item.code}
            onClick={item.onClick}
            className={`group rounded-lg px-2 py-1.5 -mx-2 transition-colors ${
              item.onClick ? 'cursor-pointer hover:bg-slate-50' : ''
            } ${
              item.active
                ? 'bg-red-50/50 ring-1 ring-[#d12f2f]/30'
                : ''
            }`}
          >
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {showCodePrefix ? (
                  <span className="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">
                    {item.code}.
                  </span>
                ) : (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: fillHex }}
                  />
                )}
                <span
                  className={`truncate ${
                    item.active
                      ? 'font-semibold text-[#d12f2f]'
                      : 'font-medium text-slate-800'
                  }`}
                  title={item.label}
                >
                  {item.label}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums">
                {item.onInspect ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onInspect?.();
                    }}
                    className="font-semibold text-slate-900 hover:text-[#d12f2f] hover:underline underline-offset-2 cursor-pointer"
                    title="Xem danh sách phiếu"
                  >
                    {item.count.toLocaleString('vi-VN')} {unitLabel}
                  </button>
                ) : (
                  <span className="font-semibold text-slate-900">
                    {item.count.toLocaleString('vi-VN')} {unitLabel}
                  </span>
                )}
                <span className="w-11 text-right text-slate-400">
                  ({item.pct}%)
                </span>
              </div>
            </div>

            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ backgroundColor: item.active ? '#d12f2f' : fillHex }}
                className="h-full rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
