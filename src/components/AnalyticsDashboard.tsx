import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Filter,
  RotateCcw,
  FileSpreadsheet,
  Download,
  TrendingUp,
  Users,
  Utensils,
  Wallet,
  Star,
  MapPin,
  BarChart3,
  PieChart,
  Layers,
  MessageSquareQuote,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Table2,
  Compass,
  Award,
  Calendar,
} from 'lucide-react';
import {
  SurveyResponseData,
  OptionItem,
  A5_ROWS,
  A5_COLUMNS,
  B4_ROWS,
  B4_PERCEPTION_OPTIONS,
  B5_ITEMS,
  S1_OPTIONS,
  S2_OPTIONS,
  S3_OPTIONS,
  S4_OPTIONS,
  S5_OPTIONS,
  S6_OPTIONS,
  S7_OPTIONS,
  S8_OPTIONS,
  S9_OPTIONS,
  A1_OPTIONS,
  A2_OPTIONS,
  A3_OPTIONS,
  A3_4_OPTIONS,
  A4_OPTIONS,
  A4_1_OPTIONS,
  A6_OPTIONS,
  A7_OPTIONS,
  A8_OPTIONS,
  B1_OPTIONS,
  B2_OPTIONS,
  B3_1_OPTIONS,
  B3_2_OPTIONS,
  B3_3_OPTIONS,
  C1_OPTIONS,
  C2_OPTIONS,
  C3_OPTIONS,
  getSingleAnswer,
  getMultiAnswer,
  getTextAnswer,
  getOtherInputAnswer,
  getLikertRowAnswer,
  exportResponsesToCsv,
  exportResponsesToExcel,
  CustomQuestionCsvMeta,
  CsvExportOptions,
} from '../data/surveySchema';
import {
  SurveySystemConfig,
  getLikertScaleLabels,
} from '../services/surveyConfig';

interface AnalyticsDashboardProps {
  responses: SurveyResponseData[];
  config: SurveySystemConfig;
  canExport?: boolean;
  isSuperadmin?: boolean;
  onSeedPilotSamples?: () => void;
  onClearPilotSamples?: () => void;
}

type DashboardViewTab =
  | 'all'
  | 'overview'
  | 'spending'
  | 'preferences'
  | 'expectations'
  | 'crosstab'
  | 'explorer';

// Trọng số điểm giữa (Midpoint VNĐ) của các khoảng chi tiêu A1 & A4 để ước tính mức chi bình quân
const SPEND_TIER_MIDPOINTS: Record<number, number> = {
  1: 100000, // Dưới 150.000đ
  2: 225000, // 150.000 - <300.000đ
  3: 350000, // 300.000 - <400.000đ
  4: 450000, // 400.000 - <500.000đ
  5: 600000, // 500.000 - <700.000đ
  6: 850000, // 700.000 - <1.000.000đ
  7: 1200000, // Từ 1.000.000đ trở lên
};

const LIKERT_SCORE_COLORS = [
  'bg-rose-500', // 1
  'bg-orange-400', // 2
  'bg-slate-300', // 3
  'bg-sky-500', // 4
  'bg-emerald-600', // 5
];

const LIKERT_TEXT_COLORS = [
  'text-rose-600',
  'text-orange-600',
  'text-slate-600',
  'text-sky-600',
  'text-emerald-700',
];

const DONUT_PALETTE = [
  '#d12f2f',
  '#0284c7',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#4f46e5',
  '#0d9488',
  '#ea580c',
  '#475569',
];

interface DonutSlice {
  id: string;
  label: string;
  count: number;
  pct: number;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Biểu đồ Donut SVG tương tác có chuyển động mượt (`motion.circle`) khi lọc dữ liệu
 */
const InteractiveDonutChart: React.FC<{
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
}> = ({ slices, centerValue, centerLabel }) => {
  const size = 164;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((acc, s) => acc + s.count, 0);

  let cumulativeFraction = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            slices.map((slice) => {
              const fraction = slice.count / total;
              const dashLength = fraction * circumference;
              const dashOffset = -cumulativeFraction * circumference;
              cumulativeFraction += fraction;
              if (slice.count === 0) return null;
              return (
                <motion.circle
                  key={slice.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={slice.isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDasharray: `${dashLength} ${circumference}`,
                    strokeDashoffset: dashOffset,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                  onClick={slice.onClick}
                  className={slice.onClick ? 'cursor-pointer hover:opacity-85 transition-opacity' : ''}
                >
                  <title>{`${slice.label}: ${slice.count} phiếu (${slice.pct}%)`}</title>
                </motion.circle>
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
          <motion.span
            key={centerValue}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl font-black text-slate-900 tabular-nums leading-none"
          >
            {centerValue}
          </motion.span>
          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 leading-tight">
            {centerLabel}
          </span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-1.5">
        {slices.map((slice) => (
          <div
            key={slice.id}
            onClick={slice.onClick}
            className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition ${
              slice.onClick ? 'cursor-pointer hover:bg-slate-100/80' : ''
            } ${
              slice.isSelected
                ? 'bg-red-50/70 ring-1 ring-[#d12f2f] font-bold'
                : 'bg-slate-50/70'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-slate-800 truncate">{slice.label}</span>
            </div>
            <span className="font-bold text-slate-900 shrink-0 tabular-nums">
              {slice.count} <span className="text-slate-400 font-semibold">({slice.pct}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Biểu đồ Radar / Mạng nhện SVG động (`motion.polygon`) cho các chiều đánh giá Likert 5 mức (SERVQUAL B5)
 */
const ServqualRadarChart: React.FC<{
  rows: { displayCode: string; label: string; mean: number; top2Pct: number }[];
}> = ({ rows }) => {
  const activeRows = rows.slice(0, 8);
  if (activeRows.length < 3) return null;

  const size = 250;
  const center = size / 2;
  const maxRadius = 86;
  const count = activeRows.length;

  const getPoint = (index: number, valueOutOf5: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const r = (Math.max(0, Math.min(5, valueOutOf5)) / 5) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const polygonPoints = activeRows
    .map((r, i) => {
      const pt = getPoint(i, r.mean);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Các vòng lưới thang điểm 1..5 */}
        {[1, 2, 3, 4, 5].map((lvl) => {
          const ringPts = activeRows
            .map((_, i) => {
              const pt = getPoint(i, lvl);
              return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={ringPts}
              fill={lvl === 5 ? '#f8fafc' : 'none'}
              stroke={lvl === 5 ? '#cbd5e1' : '#e2e8f0'}
              strokeWidth={1}
              strokeDasharray={lvl < 5 ? '2 2' : undefined}
            />
          );
        })}

        {/* Các trục nối từ tâm ra đỉnh */}
        {activeRows.map((r, i) => {
          const outer = getPoint(i, 5);
          const labelPos = getPoint(i, 6.05);
          return (
            <g key={r.displayCode}>
              <line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#cbd5e1"
                strokeWidth={1}
              />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-800 text-[10px] font-bold"
              >
                {r.displayCode} ({r.mean.toFixed(2)})
              </text>
            </g>
          );
        })}

        {/* Đa giác điểm trung bình động */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, points: polygonPoints }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          points={polygonPoints}
          fill="rgba(209, 47, 47, 0.20)"
          stroke="#d12f2f"
          strokeWidth={2.5}
        />

        {/* Các nút đỉnh */}
        {activeRows.map((r, i) => {
          const pt = getPoint(i, r.mean);
          return (
            <motion.circle
              key={r.displayCode}
              initial={{ cx: center, cy: center }}
              animate={{ cx: pt.x, cy: pt.y }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              r={4.5}
              fill="#d12f2f"
              stroke="#ffffff"
              strokeWidth={1.5}
            >
              <title>{`${r.displayCode} - ${r.label}: TB ${r.mean.toFixed(2)}/5.0`}</title>
            </motion.circle>
          );
        })}
      </svg>
      <div className="text-[11px] text-slate-500 font-medium text-center mt-1">
        Biểu đồ Radar 5 bậc tự động biến đổi hình học khi lọc phân khúc khách
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  responses,
  config,
  canExport = true,
  isSuperadmin = false,
  onSeedPilotSamples,
  onClearPilotSamples,
}) => {
  // ============================================================================
  // 1. MULTI-DIMENSIONAL INTERACTIVE FILTER STATE
  // ============================================================================
  const [activeSubTab, setActiveSubTab] = useState<DashboardViewTab>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'completed' | 'all' | 'screenout'>('completed');
  const [locationFilter, setLocationFilter] = useState<number | 'all'>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all'); // 'all' | 'domestic' | 'international' | 'code:1'..
  const [travelModeFilter, setTravelModeFilter] = useState<number | 'all'>('all'); // S7
  const [ticketFilter, setTicketFilter] = useState<number | 'all'>('all'); // S9
  const [fnbUsageFilter, setFnbUsageFilter] = useState<'all' | 'used' | 'not_used'>('all'); // A2
  const [interviewerFilter, setInterviewerFilter] = useState<string>('all');
  const [explorerSectionFilter, setExplorerSectionFilter] = useState<string>('ALL');

  const qOpts = (qKey: string, fallback: OptionItem[]): OptionItem[] => {
    const cfgOpts = config.questions[qKey]?.options;
    return Array.isArray(cfgOpts) && cfgOpts.length > 0 ? cfgOpts : fallback;
  };

  // Danh sách Phỏng vấn viên duy nhất từ dữ liệu
  const interviewers = useMemo(() => {
    const map = new Map<string, string>();
    responses.forEach((r) => {
      const key = r.interviewerEmail || r.interviewerName || r.interviewerUid;
      if (key && !map.has(key)) {
        map.set(key, r.interviewerName || r.interviewerEmail || key);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [responses]);

  const resetAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setStatusFilter('completed');
    setLocationFilter('all');
    setMarketFilter('all');
    setTravelModeFilter('all');
    setTicketFilter('all');
    setFnbUsageFilter('all');
    setInterviewerFilter('all');
  };

  const applyQuickDatePreset = (preset: 'all' | 'today' | '7days') => {
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    if (preset === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === '7days') {
      const past = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      setDateFrom(past.toISOString().slice(0, 10));
      setDateTo(todayStr);
    }
  };

  // Tập dữ liệu khớp các điều kiện lọc (ngoại trừ statusFilter để tính phễu tiếp cận)
  const baseContextResponses = useMemo(() => {
    return responses.filter((r) => {
      if (dateFrom && r.surveyDate < dateFrom) return false;
      if (dateTo && r.surveyDate > dateTo) return false;
      if (locationFilter !== 'all' && r.locationId !== locationFilter) return false;
      if (interviewerFilter !== 'all') {
        const pvvKey = r.interviewerEmail || r.interviewerName || r.interviewerUid;
        if (pvvKey !== interviewerFilter) return false;
      }
      if (marketFilter !== 'all') {
        const s5 = getSingleAnswer(r, 'S5');
        if (s5 === null) return false;
        if (marketFilter === 'domestic' && !(s5 >= 1 && s5 <= 4)) return false;
        if (marketFilter === 'international' && !(s5 >= 5)) return false;
        if (marketFilter.startsWith('code:')) {
          const targetCode = Number(marketFilter.replace('code:', ''));
          if (s5 !== targetCode) return false;
        }
      }
      if (travelModeFilter !== 'all' && getSingleAnswer(r, 'S7') !== travelModeFilter) {
        return false;
      }
      if (ticketFilter !== 'all' && getSingleAnswer(r, 'S9') !== ticketFilter) {
        return false;
      }
      if (fnbUsageFilter !== 'all') {
        const a2 = getMultiAnswer(r, 'A2');
        if (!a2 || a2.length === 0) return false;
        const isNotUsed = a2.includes(7);
        if (fnbUsageFilter === 'used' && isNotUsed) return false;
        if (fnbUsageFilter === 'not_used' && !isNotUsed) return false;
      }
      return true;
    });
  }, [
    responses,
    dateFrom,
    dateTo,
    locationFilter,
    interviewerFilter,
    marketFilter,
    travelModeFilter,
    ticketFilter,
    fnbUsageFilter,
  ]);

  // Tập dữ liệu chính áp dụng đầy đủ cả statusFilter
  const filteredResponses = useMemo(() => {
    if (statusFilter === 'all') return baseContextResponses;
    return baseContextResponses.filter((r) => r.status === statusFilter);
  }, [baseContextResponses, statusFilter]);

  // Tập phiếu hợp lệ trong phạm vi lọc để phân tích chuyên sâu Phần S, A, B, C
  const validResponses = useMemo(
    () =>
      statusFilter === 'screenout'
        ? filteredResponses
        : filteredResponses.filter((r) => r.status === 'completed'),
    [filteredResponses, statusFilter]
  );

  // Danh sách các nhãn Filter đang bật
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (dateFrom) {
      chips.push({ key: 'dateFrom', label: `Từ: ${dateFrom}`, onClear: () => setDateFrom('') });
    }
    if (dateTo) {
      chips.push({ key: 'dateTo', label: `Đến: ${dateTo}`, onClear: () => setDateTo('') });
    }
    if (statusFilter !== 'completed') {
      chips.push({
        key: 'status',
        label:
          statusFilter === 'all' ? 'Trạng thái: Tất cả phiếu' : 'Trạng thái: Chỉ Screen-out',
        onClear: () => setStatusFilter('completed'),
      });
    }
    if (locationFilter !== 'all') {
      const locName =
        config.locations.find((l) => l.id === locationFilter)?.name || `Điểm #${locationFilter}`;
      chips.push({
        key: 'location',
        label: `Vị trí: ${locName}`,
        onClear: () => setLocationFilter('all'),
      });
    }
    if (marketFilter !== 'all') {
      let mLabel = marketFilter;
      if (marketFilter === 'domestic') mLabel = 'Khách Nội địa';
      else if (marketFilter === 'international') mLabel = 'Khách Quốc tế';
      else if (marketFilter.startsWith('code:')) {
        const code = Number(marketFilter.replace('code:', ''));
        mLabel = qOpts('S5', S5_OPTIONS).find((o) => o.code === code)?.label || `Mã ${code}`;
      }
      chips.push({
        key: 'market',
        label: `Thị trường: ${mLabel}`,
        onClear: () => setMarketFilter('all'),
      });
    }
    if (travelModeFilter !== 'all') {
      const tLabel =
        qOpts('S7', S7_OPTIONS).find((o) => o.code === travelModeFilter)?.label ||
        `S7=${travelModeFilter}`;
      chips.push({
        key: 'travel',
        label: `Hình thức: ${tLabel}`,
        onClear: () => setTravelModeFilter('all'),
      });
    }
    if (ticketFilter !== 'all') {
      const tkLabel =
        qOpts('S9', S9_OPTIONS).find((o) => o.code === ticketFilter)?.label ||
        `S9=${ticketFilter}`;
      chips.push({
        key: 'ticket',
        label: `Loại vé: ${tkLabel}`,
        onClear: () => setTicketFilter('all'),
      });
    }
    if (fnbUsageFilter !== 'all') {
      chips.push({
        key: 'fnb',
        label: fnbUsageFilter === 'used' ? 'Đã sử dụng F&B' : 'Chưa sử dụng F&B',
        onClear: () => setFnbUsageFilter('all'),
      });
    }
    if (interviewerFilter !== 'all') {
      const pvvName =
        interviewers.find((i) => i.id === interviewerFilter)?.name || interviewerFilter;
      chips.push({
        key: 'pvv',
        label: `PVV: ${pvvName}`,
        onClear: () => setInterviewerFilter('all'),
      });
    }
    return chips;
  }, [
    dateFrom,
    dateTo,
    statusFilter,
    locationFilter,
    marketFilter,
    travelModeFilter,
    ticketFilter,
    fnbUsageFilter,
    interviewerFilter,
    config.locations,
    interviewers,
  ]);

  // ============================================================================
  // 2. EXPORT OPTIONS FOR FILTERED DATASET
  // ============================================================================
  const exportOptions = useMemo<CsvExportOptions>(() => {
    const questionOptionsMap: Record<string, OptionItem[]> = {};
    Object.entries(config.questions).forEach(([k, v]) => {
      questionOptionsMap[k] = v.options;
    });
    const orderedKeys = [...config.questionOrder];
    Object.keys(config.questions).forEach((k) => {
      if (!orderedKeys.includes(k)) orderedKeys.push(k);
    });
    const allQuestionsInOrder: CustomQuestionCsvMeta[] = orderedKeys
      .filter((k) => Boolean(config.questions[k]))
      .map((k) => {
        const q = config.questions[k];
        return {
          key: k,
          section: q.section,
          title: q.title,
          type: q.type,
          likertScale: q.likertScale,
          hasOtherInput: q.options.some((o) => o.hasOtherInput),
          isSubQuestion: Boolean(q.parentInfo?.parentQuestionKey),
          parentQuestionKey: q.parentInfo?.parentQuestionKey,
          options: q.options,
        };
      });

    return {
      delimiter: config.dataFormat.csvDelimiter || ',',
      valueMode: 'code_and_label',
      multiSelectSeparator: config.dataFormat.multiSelectSeparator || '; ',
      locations: config.locations,
      questionOptionsMap,
      allQuestionsInOrder,
      includeQuestionTitleRow: true,
    };
  }, [config]);

  // ============================================================================
  // 3. EXECUTIVE KPI & STATISTICAL AGGREGATIONS
  // ============================================================================
  const computeSubsetMetrics = (subset: SurveyResponseData[]) => {
    const count = subset.length;
    const usedFnBList = subset.filter((r) => {
      const a2 = getMultiAnswer(r, 'A2');
      return a2.length > 0 && !a2.includes(7);
    });
    const fnbPct = count > 0 ? Math.round((usedFnBList.length / count) * 100) : 0;

    const a1Vals = subset
      .map((r) => getSingleAnswer(r, 'A1'))
      .filter((c): c is number => c !== null && Boolean(SPEND_TIER_MIDPOINTS[c]));
    const avgA1 =
      a1Vals.length > 0
        ? Math.round(a1Vals.reduce((acc, c) => acc + SPEND_TIER_MIDPOINTS[c], 0) / a1Vals.length)
        : 0;

    const a4Vals = usedFnBList
      .map((r) => getSingleAnswer(r, 'A4'))
      .filter((c): c is number => c !== null && Boolean(SPEND_TIER_MIDPOINTS[c]));
    const avgA4 =
      a4Vals.length > 0
        ? Math.round(a4Vals.reduce((acc, c) => acc + SPEND_TIER_MIDPOINTS[c], 0) / a4Vals.length)
        : 0;

    const b5Q = config.questions.B5;
    const b5RowOpts =
      b5Q?.options && b5Q.options.length > 0
        ? b5Q.options
        : B5_ITEMS.map((item, idx) => ({ code: idx + 1 }));

    let b5Sum = 0;
    let b5Count = 0;
    let b5Top2 = 0;
    subset.forEach((r) => {
      b5RowOpts.forEach((ro, idx) => {
        const sc = getLikertRowAnswer(r, 'B5', ro.code || idx + 1);
        if (sc !== null && sc >= 1 && sc <= 5) {
          b5Sum += sc;
          b5Count += 1;
          if (sc >= 4) b5Top2 += 1;
        }
      });
    });

    const b5Mean = b5Count > 0 ? Number((b5Sum / b5Count).toFixed(2)) : 0;
    const b5Top2Pct = b5Count > 0 ? Math.round((b5Top2 / b5Count) * 100) : 0;

    const buffetExpensiveCount = subset.filter((r) => r.B4?.buffet === 1).length;
    const buffetTotalRated = subset.filter((r) => r.B4?.buffet !== null && r.B4?.buffet !== undefined).length;
    const buffetExpensivePct =
      buffetTotalRated > 0 ? Math.round((buffetExpensiveCount / buffetTotalRated) * 100) : 0;

    return {
      count,
      usedFnBCount: usedFnBList.length,
      notUsedFnBCount: subset.filter((r) => getMultiAnswer(r, 'A2').includes(7)).length,
      fnbPct,
      avgA1,
      avgA4,
      b5Mean,
      b5Top2Pct,
      buffetExpensivePct,
    };
  };

  const kpiMetrics = useMemo(() => {
    const totalApproached = baseContextResponses.length;
    const completedCount = baseContextResponses.filter((r) => r.status === 'completed').length;
    const screenoutCount = baseContextResponses.filter((r) => r.status === 'screenout').length;
    const completionRate =
      totalApproached > 0 ? Math.round((completedCount / totalApproached) * 100) : 0;

    const core = computeSubsetMetrics(validResponses);

    const intlCount = validResponses.filter((r) => {
      const s5 = getSingleAnswer(r, 'S5');
      return s5 !== null && s5 >= 5;
    }).length;
    const intlPct =
      validResponses.length > 0 ? Math.round((intlCount / validResponses.length) * 100) : 0;

    const fitCount = validResponses.filter((r) => getSingleAnswer(r, 'S7') === 1).length;
    const fitPct =
      validResponses.length > 0 ? Math.round((fitCount / validResponses.length) * 100) : 0;

    return {
      totalApproached,
      completedCount,
      screenoutCount,
      completionRate,
      usedFnBCount: core.usedFnBCount,
      notUsedFnBCount: core.notUsedFnBCount,
      fnbPenetrationRate: core.fnbPct,
      avgPlannedBudget: core.avgA1,
      avgActualSpend: core.avgA4,
      b5OverallMean: core.b5Mean,
      b5Top2BoxPct: core.b5Top2Pct,
      intlCount,
      intlPct,
      fitCount,
      fitPct,
    };
  }, [baseContextResponses, validResponses, config.questions.B5]);

  // Hàm tính phân phối câu hỏi Single-select
  const computeSingleDistribution = (
    dataset: SurveyResponseData[],
    qKey: string,
    fallbackOpts: OptionItem[]
  ) => {
    const opts = qOpts(qKey, fallbackOpts).filter((o) => !(o as { hidden?: boolean }).hidden);
    const totalAnswered = dataset.filter((r) => getSingleAnswer(r, qKey) !== null).length;
    return opts.map((opt) => {
      const count = dataset.filter((r) => getSingleAnswer(r, qKey) === opt.code).length;
      const pct = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
      return {
        code: opt.code,
        label: opt.label,
        count,
        pct,
        totalAnswered,
      };
    });
  };

  // Hàm tính phân phối câu hỏi Multi-select
  const computeMultiDistribution = (
    dataset: SurveyResponseData[],
    qKey: string,
    fallbackOpts: OptionItem[]
  ) => {
    const opts = qOpts(qKey, fallbackOpts).filter((o) => !(o as { hidden?: boolean }).hidden);
    const totalRespondents = dataset.filter((r) => getMultiAnswer(r, qKey).length > 0).length;
    return opts
      .map((opt) => {
        const count = dataset.filter((r) => getMultiAnswer(r, qKey).includes(opt.code)).length;
        const pct = totalRespondents > 0 ? Math.round((count / totalRespondents) * 100) : 0;
        return {
          code: opt.code,
          label: opt.label,
          count,
          pct,
          totalAnswered: totalRespondents,
        };
      })
      .sort((a, b) => b.count - a.count);
  };

  // Hàm tính phân phối Ma trận Likert nhiều dòng (cho B5 và mọi câu Likert Admin thêm)
  const computeLikertMatrixStats = (dataset: SurveyResponseData[], qKey: string) => {
    const q = config.questions[qKey];
    const scaleLabels = q
      ? getLikertScaleLabels(q)
      : [
          'Rất không quan trọng',
          'Không quan trọng',
          'Bình thường',
          'Quan trọng',
          'Cực kỳ quan trọng',
        ];
    const rowOpts =
      q?.options && q.options.length > 0
        ? q.options.filter((o) => !o.hidden)
        : qKey === 'B5'
        ? B5_ITEMS.map((item, idx) => ({
            code: idx + 1,
            rowCode: item.code,
            label: `${item.dimension}: ${item.label}`,
            en: item.en,
          }))
        : [];

    const rows = rowOpts.map((ro, idx) => {
      const rCodeNum = ro.code || idx + 1;
      const displayCode = ro.rowCode || `${qKey.replace('_', '.')}.${rCodeNum}`;
      const counts = [0, 0, 0, 0, 0];
      let sum = 0;
      let total = 0;

      dataset.forEach((r) => {
        const sc = getLikertRowAnswer(r, qKey, rCodeNum);
        if (sc !== null && sc >= 1 && sc <= 5) {
          counts[sc - 1] += 1;
          sum += sc;
          total += 1;
        }
      });

      const pcts = counts.map((c) => (total > 0 ? Math.round((c / total) * 100) : 0));
      const mean = total > 0 ? Number((sum / total).toFixed(2)) : 0;
      const top2Pct = total > 0 ? Math.round(((counts[3] + counts[4]) / total) * 100) : 0;

      return {
        code: rCodeNum,
        displayCode,
        label: ro.label,
        counts,
        pcts,
        total,
        mean,
        top2Pct,
      };
    });

    return {
      scaleLabels,
      rows,
    };
  };

  // Danh sách toàn bộ câu hỏi đang bật trong cấu hình
  const allConfiguredQuestions = useMemo(() => {
    const keys = [...config.questionOrder];
    Object.keys(config.questions).forEach((k) => {
      if (!keys.includes(k)) keys.push(k);
    });
    return keys
      .map((k) => config.questions[k])
      .filter((q) => Boolean(q) && !q.hidden);
  }, [config]);

  // Danh sách các ý kiến mở (C4_note, A3.1..A3.3, và các ô "Khác (ghi rõ)")
  const openVerbatims = useMemo(() => {
    const items: {
      surveyCode: string;
      date: string;
      locationName: string;
      tag: string;
      text: string;
    }[] = [];

    validResponses.forEach((r) => {
      const locName =
        config.locations.find((l) => l.id === r.locationId)?.name || `Điểm #${r.locationId}`;
      if (r.C4_note?.trim()) {
        items.push({
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'C4. Ghi chú & Đề xuất mở',
          text: r.C4_note.trim(),
        });
      }
      if (r.A3_1?.trim()) {
        items.push({
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'A3.1. Đã ăn ở đâu trước khi lên Bà Nà',
          text: r.A3_1.trim(),
        });
      }
      if (r.A3_2?.trim()) {
        items.push({
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'A3.2. Mức giá hợp lý sẵn sàng chi',
          text: r.A3_2.trim(),
        });
      }
      if (r.A3_3?.trim()) {
        items.push({
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'A3.3. Món ăn / dịch vụ mong muốn',
          text: r.A3_3.trim(),
        });
      }
      Object.keys(config.questions).forEach((qk) => {
        const otherTxt = getOtherInputAnswer(r, qk)?.trim();
        if (otherTxt) {
          items.push({
            surveyCode: r.surveyCode,
            date: r.surveyDate,
            locationName: locName,
            tag: `${qk} (Khác - ghi rõ)`,
            text: otherTxt,
          });
        }
      });
    });

    return items.slice(0, 40);
  }, [validResponses, config.locations, config.questions]);

  // ============================================================================
  // 4. REUSABLE ANIMATED CHART HELPERS
  // ============================================================================
  const renderAnimatedHorizontalBars = (
    items: {
      code: number | string;
      label: string;
      count: number;
      pct: number;
      isSelected?: boolean;
      onClick?: () => void;
    }[],
    barColorClass = 'bg-[#d12f2f]'
  ) => {
    const maxPct = Math.max(...items.map((i) => i.pct), 1);
    return (
      <div className="space-y-2">
        {items.map((item) => {
          const relativeWidth = item.pct > 0 ? Math.max((item.pct / maxPct) * 100, 4) : 0;
          return (
            <div
              key={item.code}
              onClick={item.onClick}
              className={`group rounded-xl p-2 transition ${
                item.onClick ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${
                item.isSelected
                  ? 'ring-2 ring-[#d12f2f] bg-red-50/40'
                  : 'border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-1">
                <span className="font-medium text-slate-800 leading-snug">
                  <span className="inline-block font-mono text-[11px] font-bold text-slate-400 mr-1.5">
                    #{item.code}
                  </span>
                  {item.label}
                </span>
                <span className="font-bold text-slate-900 shrink-0 tabular-nums">
                  {item.count} phiếu{' '}
                  <span className="text-slate-500 font-semibold">({item.pct}%)</span>
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${relativeWidth}%` }}
                  transition={{ type: 'spring', stiffness: 240, damping: 28 }}
                  className={`h-full rounded-full ${barColorClass}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLikertMatrixChart = (
    qKey: string,
    title: string,
    subtitle?: string,
    includeRadar = false
  ) => {
    const { scaleLabels, rows } = computeLikertMatrixStats(validResponses, qKey);
    const sortedRows = [...rows].sort((a, b) => b.mean - a.mean);

    return (
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#d12f2f] font-mono text-xs font-bold border border-red-200">
                {qKey}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          {/* Chú giải 5 mức độ Likert */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {scaleLabels.map((lbl, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium"
              >
                <span className={`w-2.5 h-2.5 rounded-xs ${LIKERT_SCORE_COLORS[idx]}`} />
                <strong>{idx + 1}:</strong> {lbl}
              </span>
            ))}
          </div>
        </div>

        <div
          className={
            includeRadar && rows.length >= 3
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-center'
              : ''
          }
        >
          {includeRadar && rows.length >= 3 && (
            <div className="lg:col-span-4 bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-center">
              <ServqualRadarChart rows={rows} />
            </div>
          )}

          <div className={includeRadar && rows.length >= 3 ? 'lg:col-span-8 space-y-3' : 'space-y-3'}>
            {sortedRows.map((row) => (
              <div
                key={row.code}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-900 leading-snug max-w-2xl">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-bold mr-2">
                      {row.displayCode}
                    </span>
                    {row.label}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      Mức 4+5: {row.top2Pct}%
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black tabular-nums">
                      TB: {row.mean.toFixed(2)} / 5.0
                    </span>
                  </div>
                </div>

                {/* 100% Stacked Animated Bar */}
                <div className="h-5 w-full bg-slate-200 rounded-lg overflow-hidden flex">
                  {row.pcts.map((pct, sIdx) =>
                    pct > 0 ? (
                      <motion.div
                        key={sIdx}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                        className={`h-full ${LIKERT_SCORE_COLORS[sIdx]} flex items-center justify-center text-[10px] font-bold text-white overflow-hidden`}
                        title={`Mức ${sIdx + 1} (${scaleLabels[sIdx]}): ${row.counts[sIdx]} phiếu (${pct}%)`}
                      >
                        {pct >= 9 ? `${pct}%` : ''}
                      </motion.div>
                    ) : null
                  )}
                </div>

                {/* Chi tiết số phiếu từng mức 1..5 */}
                <div className="grid grid-cols-5 gap-1 text-[10px] text-slate-500 pt-0.5">
                  {[0, 1, 2, 3, 4].map((sIdx) => (
                    <div key={sIdx} className="truncate">
                      <span className={`font-bold ${LIKERT_TEXT_COLORS[sIdx]}`}>
                        Mức {sIdx + 1}:
                      </span>{' '}
                      {row.counts[sIdx]} ({row.pcts[sIdx]}%)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-14">
      {/* ==========================================================================
          STICKY MULTI-DIMENSIONAL INTERACTIVE FILTER BAR
         ========================================================================== */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#d12f2f]">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Phân Hệ Báo Cáo Đa Chiều &amp; Bộ Lọc Tương Tác Thời Gian Thực
              </h2>
              <p className="text-[11px] text-slate-500">
                Chọn bộ lọc bên dưới hoặc bấm trực tiếp vào biểu đồ (Donut, Cột, Thanh) để lọc chéo
                dữ liệu
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Nút chọn nhanh khoảng ngày */}
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => applyQuickDatePreset('all')}
                className={`px-2 py-1 rounded-lg cursor-pointer transition ${
                  !dateFrom && !dateTo ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tất cả ngày
              </button>
              <button
                type="button"
                onClick={() => applyQuickDatePreset('today')}
                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition"
              >
                Hôm nay
              </button>
              <button
                type="button"
                onClick={() => applyQuickDatePreset('7days')}
                className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer transition"
              >
                7 ngày
              </button>
            </div>

            {isSuperadmin && onSeedPilotSamples && (
              <button
                type="button"
                onClick={onSeedPilotSamples}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
              >
                + Tạo mẫu thử (30 phiếu)
              </button>
            )}
            {isSuperadmin &&
              onClearPilotSamples &&
              responses.some((r) => r.id.startsWith('PILOT_SAMPLE_')) && (
                <button
                  type="button"
                  onClick={onClearPilotSamples}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold cursor-pointer transition"
                >
                  Xóa mẫu thử
                </button>
              )}
            {activeFilterChips.length > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại bộ lọc ({activeFilterChips.length})
              </button>
            )}

            {canExport && (
              <>
                <button
                  type="button"
                  disabled={filteredResponses.length === 0}
                  onClick={() => exportResponsesToExcel(filteredResponses, exportOptions)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Tải Excel Có Cấu Trúc ({filteredResponses.length})
                </button>
                <button
                  type="button"
                  disabled={filteredResponses.length === 0}
                  onClick={() => exportResponsesToCsv(filteredResponses, exportOptions)}
                  className="px-3 py-1.5 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải CSV ({filteredResponses.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* 8 Điều kiện lọc đa chiều */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Điểm khảo sát
            </label>
            <select
              value={locationFilter}
              onChange={(e) =>
                setLocationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <option value="all">Tất cả điểm ({config.locations.length})</option>
              {config.locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Thị trường (S5)
            </label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <option value="all">Tất cả thị trường</option>
              <option value="domestic">Khách Nội địa (S5=1..4)</option>
              <option value="international">Khách Quốc tế (S5≥5)</option>
              <optgroup label="Chi tiết từng Quốc tịch / Vùng">
                {qOpts('S5', S5_OPTIONS).map((o) => (
                  <option key={o.code} value={`code:${o.code}`}>
                    {o.code}. {o.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Hình thức đi (S7)
            </label>
            <select
              value={travelModeFilter}
              onChange={(e) =>
                setTravelModeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <option value="all">Tất cả (FIT &amp; Tour)</option>
              {qOpts('S7', S7_OPTIONS).map((o) => (
                <option key={o.code} value={o.code}>
                  {o.code}. {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Gói vé (S9)
            </label>
            <select
              value={ticketFilter}
              onChange={(e) =>
                setTicketFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <option value="all">Tất cả gói vé</option>
              {qOpts('S9', S9_OPTIONS).map((o) => (
                <option key={o.code} value={o.code}>
                  {o.code}. {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Hành vi F&amp;B (A2)
            </label>
            <select
              value={fnbUsageFilter}
              onChange={(e) =>
                setFnbUsageFilter(e.target.value as 'all' | 'used' | 'not_used')
              }
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <option value="all">Tất cả đáp viên</option>
              <option value="used">Đã sử dụng F&amp;B (A2=1..6)</option>
              <option value="not_used">Chưa dùng F&amp;B (A2=7)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Phỏng vấn viên
            </label>
            <select
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
            >
              <option value="all">Tất cả PVV ({interviewers.length})</option>
              {interviewers.map((pvv) => (
                <option key={pvv.id} value={pvv.id}>
                  {pvv.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        <AnimatePresence>
          {activeFilterChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-1.5 pt-1"
            >
              <span className="text-[11px] font-semibold text-slate-500 mr-1">
                Đang lọc ({validResponses.length} phiếu hợp lệ):
              </span>
              {activeFilterChips.map((chip) => (
                <motion.span
                  key={chip.key}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#d12f2f] border border-red-200 text-[11px] font-bold"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.onClear}
                    className="hover:bg-red-200/60 rounded-full px-1 cursor-pointer"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==========================================================================
          EXECUTIVE KPI SUMMARY CARDS (6 REACTIVE CARDS)
         ========================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <motion.div
          layout
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>MẪU HỢP LỆ / QUOTA</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-slate-900 tabular-nums">
              {kpiMetrics.completedCount}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {' '}
              / {config.dataFormat.totalQuotaTarget}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Tiếp cận: <strong>{kpiMetrics.totalApproached}</strong> ({kpiMetrics.completionRate}%
            hợp lệ)
          </div>
        </motion.div>

        <motion.div
          layout
          onClick={() =>
            setFnbUsageFilter((prev) => (prev === 'used' ? 'all' : 'used'))
          }
          className={`bg-white rounded-2xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition ${
            fnbUsageFilter === 'used'
              ? 'border-[#d12f2f] ring-2 ring-[#d12f2f]/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>THÂM NHẬP F&amp;B (A2)</span>
            <Utensils className="w-4 h-4 text-[#d12f2f]" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-[#d12f2f] tabular-nums">
              {kpiMetrics.fnbPenetrationRate}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Đã dùng: <strong>{kpiMetrics.usedFnBCount}</strong> • Chưa dùng:{' '}
            <strong>{kpiMetrics.notUsedFnBCount}</strong>
          </div>
        </motion.div>

        <motion.div
          layout
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>NGÂN SÁCH DỰ KIẾN (A1)</span>
            <Wallet className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-black text-slate-900 tabular-nums">
              {kpiMetrics.avgPlannedBudget > 0
                ? `${kpiMetrics.avgPlannedBudget.toLocaleString('vi-VN')}đ`
                : '—'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">Bình quân ước tính / 1 khách</div>
        </motion.div>

        <motion.div
          layout
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>CHI THỰC TẾ BÌNH QUÂN (A4)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-1.5">
            <span className="text-xl font-black text-emerald-700 tabular-nums">
              {kpiMetrics.avgActualSpend > 0
                ? `${kpiMetrics.avgActualSpend.toLocaleString('vi-VN')}đ`
                : '—'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {kpiMetrics.avgPlannedBudget > 0 && kpiMetrics.avgActualSpend > 0 ? (
              <span>
                Chênh lệch A4 vs A1:{' '}
                <strong
                  className={
                    kpiMetrics.avgActualSpend >= kpiMetrics.avgPlannedBudget
                      ? 'text-emerald-700'
                      : 'text-amber-600'
                  }
                >
                  {kpiMetrics.avgActualSpend >= kpiMetrics.avgPlannedBudget ? '+' : ''}
                  {Math.round(
                    ((kpiMetrics.avgActualSpend - kpiMetrics.avgPlannedBudget) /
                      kpiMetrics.avgPlannedBudget) *
                      100
                  )}
                  %
                </strong>
              </span>
            ) : (
              'Tính trên nhóm đã dùng F&B'
            )}
          </div>
        </motion.div>

        <motion.div
          layout
          className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>ĐIỂM SERVQUAL (B5)</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-amber-600 tabular-nums">
              {kpiMetrics.b5OverallMean > 0 ? kpiMetrics.b5OverallMean.toFixed(2) : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400"> / 5.0</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Tỷ lệ Quan trọng (Mức 4+5): <strong>{kpiMetrics.b5Top2BoxPct}%</strong>
          </div>
        </motion.div>

        <motion.div
          layout
          onClick={() =>
            setMarketFilter((prev) =>
              prev === 'international' ? 'all' : 'international'
            )
          }
          className={`bg-white rounded-2xl p-3.5 border shadow-2xs flex flex-col justify-between cursor-pointer transition ${
            marketFilter === 'international'
              ? 'border-[#d12f2f] ring-2 ring-[#d12f2f]/20'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
            <span>QUỐC TẾ &amp; TỰ TÚC (FIT)</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black text-indigo-700 tabular-nums">
              {kpiMetrics.intlPct}%
            </span>
            <span className="text-xs font-semibold text-slate-400"> Quốc tế</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Khách đi tự túc (FIT): <strong>{kpiMetrics.fitPct}%</strong>
          </div>
        </motion.div>
      </div>

      {/* ==========================================================================
          SUB-NAVIGATION TABS FOR REPORT SECTIONS
         ========================================================================== */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 flex flex-wrap items-center gap-1">
        {[
          { id: 'all', label: 'Toàn cảnh Báo cáo (All-in-One)', icon: Layers },
          { id: 'overview', label: '1. Quota, PVV & Nhân khẩu học (Phần S)', icon: MapPin },
          { id: 'spending', label: '2. Chi tiêu, Ma trận A5 & Rào cản (Phần A)', icon: BarChart3 },
          {
            id: 'preferences',
            label: '3. Khẩu vị, Giá (B4) & Radar SERVQUAL (B5)',
            icon: PieChart,
          },
          {
            id: 'expectations',
            label: '4. Kỳ vọng & Đề xuất (Phần C)',
            icon: Sparkles,
          },
          {
            id: 'crosstab',
            label: '5. Ma trận Phân tích Chéo (Cross-tab)',
            icon: Table2,
          },
          {
            id: 'explorer',
            label: `6. Khám phá 100% Câu hỏi (${allConfiguredQuestions.length})`,
            icon: Compass,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as DashboardViewTab)}
              className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {validResponses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-bold text-slate-800">
            Không có phiếu khảo sát nào khớp với điều kiện lọc hiện tại
          </div>
          <p className="text-xs text-slate-500">
            Hãy nới lỏng bộ lọc hoặc nhấn nút tạo dữ liệu mẫu Pilot để kiểm thử trực quan hóa biểu
            đồ.
          </p>
          <div className="flex flex-wrap items-center gap-2 justify-center pt-1">
            {activeFilterChips.length > 0 && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-4 py-2 rounded-xl bg-[#d12f2f] text-white text-xs font-bold cursor-pointer"
              >
                Đặt lại toàn bộ bộ lọc
              </button>
            )}
            {isSuperadmin && onSeedPilotSamples && (
              <button
                type="button"
                onClick={onSeedPilotSamples}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                + Tạo 30 phiếu mẫu Pilot để trải nghiệm Dashboard &amp; Filter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ======================================================================
              SECTION 1: QUOTA PROGRESS, DONUT SEGMENTATION & DEMOGRAPHICS (PHẦN S)
             ====================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'overview') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 3 Biểu đồ Donut Tổng quan Cơ cấu Mẫu (Click-to-Filter) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">
                      Cơ cấu Thị trường: Nội địa vs Quốc tế (S5)
                    </h3>
                    <span className="text-[11px] text-slate-400">Click để lọc</span>
                  </div>
                  <InteractiveDonutChart
                    centerValue={`${validResponses.length}`}
                    centerLabel="Phiếu hợp lệ"
                    slices={[
                      {
                        id: 'dom',
                        label: 'Khách Nội địa (S5=1..4)',
                        count: validResponses.length - kpiMetrics.intlCount,
                        pct: 100 - kpiMetrics.intlPct,
                        color: '#d12f2f',
                        isSelected: marketFilter === 'domestic',
                        onClick: () =>
                          setMarketFilter((p) => (p === 'domestic' ? 'all' : 'domestic')),
                      },
                      {
                        id: 'intl',
                        label: 'Khách Quốc tế (S5≥5)',
                        count: kpiMetrics.intlCount,
                        pct: kpiMetrics.intlPct,
                        color: '#4f46e5',
                        isSelected: marketFilter === 'international',
                        onClick: () =>
                          setMarketFilter((p) =>
                            p === 'international' ? 'all' : 'international'
                          ),
                      },
                    ]}
                  />
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">
                      Hình thức Chuyến đi: Tự túc vs Tour (S7)
                    </h3>
                    <span className="text-[11px] text-slate-400">Click để lọc</span>
                  </div>
                  <InteractiveDonutChart
                    centerValue={`${kpiMetrics.fitPct}%`}
                    centerLabel="Tự túc (FIT)"
                    slices={computeSingleDistribution(validResponses, 'S7', S7_OPTIONS).map(
                      (d, idx) => ({
                        id: `s7_${d.code}`,
                        label: d.label,
                        count: d.count,
                        pct: d.pct,
                        color: idx === 0 ? '#059669' : '#d97706',
                        isSelected: travelModeFilter === d.code,
                        onClick: () =>
                          setTravelModeFilter((p) => (p === d.code ? 'all' : d.code)),
                      })
                    )}
                  />
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase">
                      Hành vi Sử dụng F&amp;B Hôm nay (A2)
                    </h3>
                    <span className="text-[11px] text-slate-400">Click để lọc</span>
                  </div>
                  <InteractiveDonutChart
                    centerValue={`${kpiMetrics.fnbPenetrationRate}%`}
                    centerLabel="Đã dùng F&B"
                    slices={[
                      {
                        id: 'used',
                        label: 'Đã sử dụng F&B (A2=1..6)',
                        count: kpiMetrics.usedFnBCount,
                        pct: kpiMetrics.fnbPenetrationRate,
                        color: '#0284c7',
                        isSelected: fnbUsageFilter === 'used',
                        onClick: () =>
                          setFnbUsageFilter((p) => (p === 'used' ? 'all' : 'used')),
                      },
                      {
                        id: 'not_used',
                        label: 'Chưa sử dụng F&B (A2=7)',
                        count: kpiMetrics.notUsedFnBCount,
                        pct:
                          validResponses.length > 0
                            ? 100 - kpiMetrics.fnbPenetrationRate
                            : 0,
                        color: '#e11d48',
                        isSelected: fnbUsageFilter === 'not_used',
                        onClick: () =>
                          setFnbUsageFilter((p) => (p === 'not_used' ? 'all' : 'not_used')),
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tiến độ Quota theo Điểm khảo sát × Nội địa / Quốc tế */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Tiến độ Quota theo Điểm Khảo Sát &amp; Phân Khúc (Click để lọc)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Theo dõi tiến độ thực tế tại 5 vị trí trực so với chỉ tiêu Quota
                      </p>
                    </div>
                    <MapPin className="w-4 h-4 text-[#d12f2f]" />
                  </div>

                  <div className="space-y-2.5">
                    {config.locations.map((loc) => {
                      const locResponses = validResponses.filter((r) => r.locationId === loc.id);
                      const locCount = locResponses.length;
                      const locDom = locResponses.filter((r) => {
                        const s5 = getSingleAnswer(r, 'S5');
                        return s5 !== null && s5 >= 1 && s5 <= 4;
                      }).length;
                      const locIntl = locCount - locDom;
                      const locScr = baseContextResponses.filter(
                        (r) => r.locationId === loc.id && r.status === 'screenout'
                      ).length;
                      const pct =
                        loc.quotaTarget > 0
                          ? Math.min(100, Math.round((locCount / loc.quotaTarget) * 100))
                          : 0;
                      const isSelected = locationFilter === loc.id;
                      return (
                        <div
                          key={loc.id}
                          onClick={() =>
                            setLocationFilter((prev) => (prev === loc.id ? 'all' : loc.id))
                          }
                          className={`p-2.5 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-red-50/50 border-[#d12f2f] ring-1 ring-[#d12f2f]'
                              : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-1.5">
                            <span className="font-bold text-slate-800">{loc.name}</span>
                            <div className="flex items-center gap-2 tabular-nums">
                              <span className="text-[11px] text-slate-500">
                                Nội địa: <strong>{locDom}</strong> • Quốc tế:{' '}
                                <strong>{locIntl}</strong>
                                {locScr > 0 ? ` • Screen-out: ${locScr}` : ''}
                              </span>
                              <span className="font-bold text-slate-900">
                                {locCount}/{loc.quotaTarget} ({pct}%)
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ type: 'spring', stiffness: 240, damping: 28 }}
                              className="h-full bg-[#d12f2f] rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cơ cấu Thị trường & Quốc tịch S5 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        S5. Chi tiết Vùng miền &amp; Quốc tịch Khách (Click để lọc)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Bấm vào từng dòng quốc tịch/vùng miền để lọc toàn bộ biểu đồ bên dưới
                      </p>
                    </div>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>

                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'S5', S5_OPTIONS).map((d) => ({
                      ...d,
                      isSelected: marketFilter === `code:${d.code}`,
                      onClick: () =>
                        setMarketFilter((prev) =>
                          prev === `code:${d.code}` ? 'all' : `code:${d.code}`
                        ),
                    })),
                    'bg-indigo-600'
                  )}
                </div>
              </div>

              {/* Hàng 2 Phần S: S3/S4, S6, S9/S8 & Bảng năng suất PVV */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    S3. Giới tính &amp; S4. Độ tuổi
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'S3', S3_OPTIONS),
                    'bg-sky-600'
                  )}
                  <div className="border-t border-slate-100 pt-2">
                    {renderAnimatedHorizontalBars(
                      computeSingleDistribution(validResponses, 'S4', S4_OPTIONS),
                      'bg-teal-600'
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    S6. Nhóm đi cùng &amp; S8. Số lần đến Bà Nà
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'S6', S6_OPTIONS),
                    'bg-violet-600'
                  )}
                  <div className="border-t border-slate-100 pt-2">
                    {renderAnimatedHorizontalBars(
                      computeSingleDistribution(validResponses, 'S8', S8_OPTIONS),
                      'bg-slate-700'
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    S9. Loại vé / Gói sản phẩm (Click để lọc)
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'S9', S9_OPTIONS).map((d) => ({
                      ...d,
                      isSelected: ticketFilter === d.code,
                      onClick: () =>
                        setTicketFilter((prev) =>
                          prev === d.code ? 'all' : (d.code as number)
                        ),
                    })),
                    'bg-emerald-600'
                  )}
                </div>
              </div>

              {/* Bảng Xếp Hạng Năng Suất Phỏng Vấn Viên (PVV Leaderboard) */}
              {interviewers.length > 0 && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Thống Kê Năng Suất Phỏng Vấn Viên (Click vào PVV để lọc phiếu)
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {interviewers.map((pvv) => {
                      const pvvValid = validResponses.filter(
                        (r) =>
                          (r.interviewerEmail || r.interviewerName || r.interviewerUid) ===
                          pvv.id
                      );
                      const pvvScr = baseContextResponses.filter(
                        (r) =>
                          (r.interviewerEmail || r.interviewerName || r.interviewerUid) ===
                            pvv.id && r.status === 'screenout'
                      );
                      const avgDur =
                        pvvValid.length > 0
                          ? Math.round(
                              pvvValid.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) /
                                pvvValid.length
                            )
                          : 0;
                      const isSel = interviewerFilter === pvv.id;
                      return (
                        <div
                          key={pvv.id}
                          onClick={() =>
                            setInterviewerFilter((prev) => (prev === pvv.id ? 'all' : pvv.id))
                          }
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            isSel
                              ? 'bg-red-50/60 border-[#d12f2f] ring-1 ring-[#d12f2f]'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900 truncate">
                            {pvv.name}
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-lg font-black text-[#d12f2f] tabular-nums">
                              {pvvValid.length} phiếu
                            </span>
                            <span className="text-[11px] text-slate-500">
                              TB: {Math.floor(avgDur / 60)}p{String(avgDur % 60).padStart(2, '0')}s
                            </span>
                          </div>
                          {pvvScr.length > 0 && (
                            <div className="text-[10px] text-rose-500 mt-0.5">
                              Screen-out: {pvvScr.length} phiếu
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================================
              SECTION 2: SPENDING BEHAVIOR, MATRIX A5 & BARRIERS (PHẦN A)
             ====================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'spending') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Biểu đồ Cột Đứng Kép (Grouped Vertical Column Chart) + Thanh Ngang: A1 vs A4 */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Biểu Đồ Cột Đối Chiếu: Ngân Sách Dự Kiến (A1) vs Chi Tiêu Thực Tế (A4)
                    </h3>
                    <p className="text-xs text-slate-500">
                      So sánh trực quan phân bổ mức dự kiến chi (A1) và thực chi (A4) trên 8 bậc
                      ngân sách
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-sky-700">
                      <span className="w-3 h-3 rounded-xs bg-sky-500" />
                      A1. Ngân sách dự kiến
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                      <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                      A4. Chi tiêu thực tế
                    </span>
                  </div>
                </div>

                {/* Vertical Grouped Columns */}
                {(() => {
                  const a1Dist = computeSingleDistribution(validResponses, 'A1', A1_OPTIONS);
                  const a4Dist = computeSingleDistribution(
                    validResponses.filter((r) => !getMultiAnswer(r, 'A2').includes(7)),
                    'A4',
                    A4_OPTIONS
                  );
                  const maxColPct = Math.max(
                    ...a1Dist.map((d) => d.pct),
                    ...a4Dist.map((d) => d.pct),
                    10
                  );

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2">
                      {qOpts('A1', A1_OPTIONS).map((tier) => {
                        const a1Item = a1Dist.find((x) => x.code === tier.code);
                        const a4Item = a4Dist.find((x) => x.code === tier.code);
                        const a1Pct = a1Item?.pct || 0;
                        const a4Pct = a4Item?.pct || 0;
                        const h1 = a1Pct > 0 ? Math.max((a1Pct / maxColPct) * 100, 6) : 0;
                        const h4 = a4Pct > 0 ? Math.max((a4Pct / maxColPct) * 100, 6) : 0;

                        return (
                          <div
                            key={tier.code}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                          >
                            <div className="h-32 flex items-end justify-center gap-2.5 pt-4 border-b border-slate-200 px-2">
                              <div className="flex flex-col items-center justify-end h-full flex-1">
                                <span className="text-[10px] font-bold text-sky-700 mb-1 tabular-nums">
                                  {a1Pct}%
                                </span>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h1}%` }}
                                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                                  className="w-full max-w-[24px] bg-sky-500 rounded-t-md"
                                  title={`A1 (${tier.label}): ${a1Item?.count || 0} phiếu (${a1Pct}%)`}
                                />
                              </div>

                              <div className="flex flex-col items-center justify-end h-full flex-1">
                                <span className="text-[10px] font-bold text-emerald-700 mb-1 tabular-nums">
                                  {a4Pct}%
                                </span>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${h4}%` }}
                                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                                  className="w-full max-w-[24px] bg-emerald-600 rounded-t-md"
                                  title={`A4 (${tier.label}): ${a4Item?.count || 0} phiếu (${a4Pct}%)`}
                                />
                              </div>
                            </div>
                            <div className="pt-2 text-center">
                              <div className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">
                                {tier.code}. {tier.label}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5 tabular-nums">
                                A1: {a1Item?.count || 0} • A4: {a4Item?.count || 0}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* A2: Tỷ lệ sử dụng từng loại hình & Ma trận A5: Mức chi theo từng loại hình */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    A2. Tỷ lệ Thâm nhập Từng Loại Hình Dịch Vụ F&amp;B
                  </h3>
                  <p className="text-xs text-slate-500">
                    Câu hỏi chọn nhiều đáp án — Tỷ lệ % tính trên tổng số đáp viên hợp lệ (
                    {validResponses.length} phiếu)
                  </p>
                  {renderAnimatedHorizontalBars(
                    computeMultiDistribution(validResponses, 'A2', A2_OPTIONS),
                    'bg-[#d12f2f]'
                  )}
                </div>

                {/* Ma trận A5 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Ma trận A5. Cơ cấu Mức Chi Theo Từng Loại Hình Đã Dùng
                      </h3>
                      <p className="text-xs text-slate-500">
                        Phân bổ 5 bậc chi tiêu bình quân 1 người cho mỗi nhóm dịch vụ
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {A5_COLUMNS.map((col, idx) => {
                      const colors = [
                        'bg-sky-400',
                        'bg-emerald-500',
                        'bg-amber-500',
                        'bg-orange-500',
                        'bg-rose-600',
                      ];
                      return (
                        <span
                          key={col.code}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                        >
                          <span className={`w-2 h-2 rounded-xs ${colors[idx]}`} />
                          {col.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-1">
                    {A5_ROWS.map((row) => {
                      const counts = A5_COLUMNS.map(
                        (col) =>
                          validResponses.filter((r) => r.A5?.[row.key] === col.code).length
                      );
                      const totalRow = counts.reduce((a, b) => a + b, 0);
                      const pcts = counts.map((c) =>
                        totalRow > 0 ? Math.round((c / totalRow) * 100) : 0
                      );
                      const colors = [
                        'bg-sky-400',
                        'bg-emerald-500',
                        'bg-amber-500',
                        'bg-orange-500',
                        'bg-rose-600',
                      ];

                      return (
                        <div
                          key={row.key}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{row.label}</span>
                            <span className="text-slate-500 font-semibold">
                              {totalRow} lượt trả lời
                            </span>
                          </div>
                          <div className="h-4 bg-slate-200 rounded-md overflow-hidden flex">
                            {pcts.map((pct, idx) =>
                              pct > 0 ? (
                                <motion.div
                                  key={idx}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                                  className={`h-full ${colors[idx]} flex items-center justify-center text-[9px] font-bold text-white`}
                                  title={`${A5_COLUMNS[idx].label}: ${counts[idx]} phiếu (${pct}%)`}
                                >
                                  {pct >= 10 ? `${pct}%` : ''}
                                </motion.div>
                              ) : null
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Nhánh Chưa dùng F&B (A3 & A3.4) + Thời điểm mua (A6) & Quà mang về (A7, A8) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        A3. Rào cản Chưa Sử Dụng F&amp;B &amp; A3.4. Khả năng Chuyển đổi
                      </h3>
                      <p className="text-xs text-slate-500">
                        Phân tích trên nhóm khách chưa sử dụng dịch vụ F&amp;B (
                        {kpiMetrics.notUsedFnBCount} phiếu)
                      </p>
                    </div>
                  </div>
                  {renderAnimatedHorizontalBars(
                    computeMultiDistribution(validResponses, 'A3', A3_OPTIONS),
                    'bg-rose-600'
                  )}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      A3.4. Khả năng sử dụng nếu các yếu tố trên được cải thiện:
                    </div>
                    {renderAnimatedHorizontalBars(
                      computeSingleDistribution(validResponses, 'A3_4', A3_4_OPTIONS),
                      'bg-emerald-600'
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    A6. Thời điểm Quyết định Mua &amp; A7/A8. Nhu cầu Quà Mang Về
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeMultiDistribution(validResponses, 'A6', A6_OPTIONS),
                    'bg-sky-600'
                  )}
                  <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2">
                        A7. Sẵn sàng mua quà F&amp;B mang về:
                      </div>
                      {renderAnimatedHorizontalBars(
                        computeSingleDistribution(validResponses, 'A7', A7_OPTIONS),
                        'bg-amber-600'
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-700 mb-2">
                        A8. Mức dự kiến chi mua quà:
                      </div>
                      {renderAnimatedHorizontalBars(
                        computeSingleDistribution(validResponses, 'A8', A8_OPTIONS),
                        'bg-purple-600'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================================
              SECTION 3: PREFERENCES, PRICE PERCEPTION (B4) & LIKERT SERVQUAL (B5)
             ====================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'preferences') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Biểu đồ Ma trận Likert 5 mức B5 (SERVQUAL) kết hợp Biểu đồ Radar */}
              {renderLikertMatrixChart(
                'B5',
                config.questions.B5?.title ||
                  'B5. Đánh giá mức độ quan trọng của các yếu tố khi quyết định sử dụng F&B (Khung SERVQUAL)',
                'Kết hợp Biểu đồ Radar 6 chiều SERVQUAL & Biểu đồ Stacked 100% xếp hạng theo Điểm Trung Bình (Mean Score)',
                true
              )}

              {/* Ma trận B4: Cảm nhận mức giá hiện tại (1: Đắt, 2: Hợp lý, 3: Rẻ) & Sở thích B1/B2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Ma trận B4. Cảm Nhận Mức Giá Hiện Tại Theo Nhóm Sản Phẩm
                      </h3>
                      <p className="text-xs text-slate-500">
                        Tỷ lệ đánh giá Đắt (1) • Hợp lý (2) • Rẻ (3) trên 5 nhóm sản phẩm cốt lõi
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold">
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> 1 - Đắt
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> 2 - Hợp lý
                      </span>
                      <span className="inline-flex items-center gap-1 text-sky-600">
                        <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" /> 3 - Rẻ
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {B4_ROWS.map((row) => {
                      const c1 = validResponses.filter((r) => r.B4?.[row.key] === 1).length;
                      const c2 = validResponses.filter((r) => r.B4?.[row.key] === 2).length;
                      const c3 = validResponses.filter((r) => r.B4?.[row.key] === 3).length;
                      const total = c1 + c2 + c3;
                      const p1 = total > 0 ? Math.round((c1 / total) * 100) : 0;
                      const p2 = total > 0 ? Math.round((c2 / total) * 100) : 0;
                      const p3 = total > 0 ? Math.round((c3 / total) * 100) : 0;

                      return (
                        <div
                          key={row.key}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{row.label}</span>
                            <span className="text-slate-500 font-semibold">
                              Đắt: <strong className="text-rose-600">{p1}%</strong> • Hợp lý:{' '}
                              <strong className="text-emerald-700">{p2}%</strong> • Rẻ:{' '}
                              <strong className="text-sky-600">{p3}%</strong>
                            </span>
                          </div>
                          <div className="h-4 bg-slate-200 rounded-md overflow-hidden flex">
                            {p1 > 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p1}%` }}
                                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                                className="h-full bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white"
                                title={`${B4_PERCEPTION_OPTIONS[0].label}: ${c1} phiếu (${p1}%)`}
                              >
                                {p1 >= 10 ? `${p1}%` : ''}
                              </motion.div>
                            )}
                            {p2 > 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p2}%` }}
                                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                                className="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white"
                                title={`${B4_PERCEPTION_OPTIONS[1].label}: ${c2} phiếu (${p2}%)`}
                              >
                                {p2 >= 10 ? `${p2}%` : ''}
                              </motion.div>
                            )}
                            {p3 > 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p3}%` }}
                                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                                className="h-full bg-sky-500 flex items-center justify-center text-[10px] font-bold text-white"
                                title={`${B4_PERCEPTION_OPTIONS[2].label}: ${c3} phiếu (${p3}%)`}
                              >
                                {p3 >= 10 ? `${p3}%` : ''}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* B1 & B2 */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    B1. Nhóm Sản Phẩm Ẩm Thực Ưu Tiên &amp; B2. Hình Thức Phục Vụ
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeMultiDistribution(validResponses, 'B1', B1_OPTIONS),
                    'bg-[#d12f2f]'
                  )}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-bold text-slate-800 mb-2">
                      B2. Hình thức phục vụ ưu tiên nhất:
                    </div>
                    {renderAnimatedHorizontalBars(
                      computeMultiDistribution(validResponses, 'B2', B2_OPTIONS),
                      'bg-indigo-600'
                    )}
                  </div>
                </div>
              </div>

              {/* Khẩu vị B3.1, B3.2, B3.3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    B3.1. Khẩu vị — Độ cay
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'B3_1', B3_1_OPTIONS),
                    'bg-orange-500'
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    B3.2. Khẩu vị — Độ đậm vị
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'B3_2', B3_2_OPTIONS),
                    'bg-amber-600'
                  )}
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    B3.3. Khẩu vị — Nhiệt độ món
                  </h3>
                  {renderAnimatedHorizontalBars(
                    computeSingleDistribution(validResponses, 'B3_3', B3_3_OPTIONS),
                    'bg-rose-500'
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ======================================================================
              SECTION 4: EXPECTATIONS, SUGGESTIONS (PHẦN C) & VERBATIMS
             ====================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'expectations') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        C1. Khung Giờ Phát Sinh Nhu Cầu Ăn Uống Cao Nhất
                      </h3>
                      <p className="text-xs text-slate-500">
                        Phân bổ nhu cầu theo các khung giờ trong ngày tại Bà Nà Hills
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                  {renderAnimatedHorizontalBars(
                    computeMultiDistribution(validResponses, 'C1', C1_OPTIONS),
                    'bg-sky-600'
                  )}

                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-xs font-bold text-slate-900 mb-2">
                      C2. Nhu Cầu Ăn Uống Đặc Biệt (Trẻ em / Chay / Halal / Dị ứng)
                    </h4>
                    {renderAnimatedHorizontalBars(
                      computeMultiDistribution(validResponses, 'C2', C2_OPTIONS),
                      'bg-teal-600'
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    C3. Top Đề Xuất Cần Ưu Tiên Cải Thiện Nhất
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xếp hạng các yếu tố đáp viên mong muốn cải thiện để nâng cao trải nghiệm F&amp;B
                  </p>
                  {renderAnimatedHorizontalBars(
                    computeMultiDistribution(validResponses, 'C3', C3_OPTIONS),
                    'bg-purple-600'
                  )}
                </div>
              </div>

              {/* Tổng hợp Ý kiến đóng góp mở (C4_note, A3.1..A3.3, và "Khác - ghi rõ") */}
              {openVerbatims.length > 0 && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquareQuote className="w-4 h-4 text-[#d12f2f]" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Tổng Hợp Ý Kiến Đóng Góp Mở, Câu Trả Lời Tự Luận &amp; &ldquo;Khác (Ghi Rõ)&rdquo; ({openVerbatims.length})
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {openVerbatims.map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono font-bold text-slate-800">
                            {v.surveyCode} • {v.locationName}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-red-50 text-[#d12f2f] font-semibold">
                            {v.tag}
                          </span>
                        </div>
                        <p className="text-slate-900 font-medium leading-snug">{v.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======================================================================
              SECTION 5: CROSS-TABULATION & MULTI-SEGMENT COMPARISON MATRIX
             ====================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'crosstab') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-[#d12f2f]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Ma Trận Phân Tích Chéo Đa Chiều (Cross-Tabulation Benchmark)
                    </h3>
                    <p className="text-xs text-slate-500">
                      So sánh trực tiếp các chỉ số cốt lõi giữa Nội địa vs Quốc tế, FIT vs Tour, và
                      5 Điểm khảo sát
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="py-2.5 px-3 rounded-tl-xl">Phân khúc / Nhóm đối sánh</th>
                      <th className="py-2.5 px-3 text-right">Cỡ mẫu (N)</th>
                      <th className="py-2.5 px-3 text-right">% Dùng F&amp;B (A2)</th>
                      <th className="py-2.5 px-3 text-right">Dự kiến TB (A1)</th>
                      <th className="py-2.5 px-3 text-right">Thực chi TB (A4)</th>
                      <th className="py-2.5 px-3 text-right">Thấy Buffet Đắt (B4)</th>
                      <th className="py-2.5 px-3 text-right rounded-tr-xl">Điểm SERVQUAL (B5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[
                      {
                        group: 'Toàn bộ mẫu đang lọc',
                        subset: validResponses,
                        highlight: true,
                      },
                      {
                        group: 'Khách Nội địa (S5 = 1..4)',
                        subset: validResponses.filter((r) => {
                          const s5 = getSingleAnswer(r, 'S5');
                          return s5 !== null && s5 >= 1 && s5 <= 4;
                        }),
                      },
                      {
                        group: 'Khách Quốc tế (S5 ≥ 5)',
                        subset: validResponses.filter((r) => {
                          const s5 = getSingleAnswer(r, 'S5');
                          return s5 !== null && s5 >= 5;
                        }),
                      },
                      {
                        group: 'Đi tự túc - FIT (S7 = 1)',
                        subset: validResponses.filter((r) => getSingleAnswer(r, 'S7') === 1),
                      },
                      {
                        group: 'Đi theo Tour trọn gói (S7 = 2)',
                        subset: validResponses.filter((r) => getSingleAnswer(r, 'S7') === 2),
                      },
                      ...config.locations.map((loc) => ({
                        group: `Vị trí: ${loc.name}`,
                        subset: validResponses.filter((r) => r.locationId === loc.id),
                      })),
                    ].map((row, idx) => {
                      const m = computeSubsetMetrics(row.subset);
                      return (
                        <tr
                          key={idx}
                          className={
                            row.highlight
                              ? 'bg-red-50/70 font-bold text-slate-900'
                              : 'hover:bg-slate-50 text-slate-700'
                          }
                        >
                          <td className="py-2.5 px-3 font-semibold">{row.group}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                            {m.count}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                              {m.fnbPct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            {m.avgA1 > 0 ? `${m.avgA1.toLocaleString('vi-VN')}đ` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-bold text-emerald-700">
                            {m.avgA4 > 0 ? `${m.avgA4.toLocaleString('vi-VN')}đ` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            <span className="text-rose-600 font-semibold">
                              {m.buffetExpensivePct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums font-black text-amber-700">
                            {m.b5Mean > 0 ? `${m.b5Mean.toFixed(2)} / 5.0` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ======================================================================
              SECTION 6: FULL QUESTION-BY-QUESTION DYNAMIC EXPLORER (100% QUESTIONS)
             ====================================================================== */}
          {(activeSubTab === 'all' || activeSubTab === 'explorer') && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#d12f2f]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Trình Khám Phá Tự Động 100% Câu Hỏi Trong Cấu Hình ({allConfiguredQuestions.length} câu)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Hiển thị biểu đồ chi tiết cho mọi câu hỏi gốc, câu hỏi con và câu hỏi mới do
                      Admin thêm vào
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {['ALL', 'PHẦN S', 'PHẦN A', 'PHẦN B', 'PHẦN C'].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setExplorerSectionFilter(sec)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        explorerSectionFilter === sec
                          ? 'bg-[#d12f2f] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sec === 'ALL' ? 'Tất cả Phần' : sec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allConfiguredQuestions
                  .filter(
                    (q) =>
                      explorerSectionFilter === 'ALL' || q.section === explorerSectionFilter
                  )
                  .map((q) => {
                    if (q.type === 'likert') {
                      return (
                        <div key={q.key} className="lg:col-span-2">
                          {renderLikertMatrixChart(
                            q.key,
                            q.title,
                            `Thuộc ${q.section} • Bảng đánh giá Likert 5 mức độ`
                          )}
                        </div>
                      );
                    }

                    if (q.type === 'single' || q.type === 'multi') {
                      const dist =
                        q.type === 'single'
                          ? computeSingleDistribution(validResponses, q.key, q.options)
                          : computeMultiDistribution(validResponses, q.key, q.options);
                      const answeredCount = dist[0]?.totalAnswered ?? 0;

                      return (
                        <div
                          key={q.key}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700 mr-1.5">
                                {q.key} • {q.section}
                              </span>
                              <span className="text-xs font-bold text-slate-900">{q.title}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                              N = {answeredCount}
                            </span>
                          </div>
                          {renderAnimatedHorizontalBars(
                            dist,
                            q.section === 'PHẦN S'
                              ? 'bg-indigo-600'
                              : q.section === 'PHẦN A'
                              ? 'bg-[#d12f2f]'
                              : q.section === 'PHẦN B'
                              ? 'bg-emerald-600'
                              : 'bg-purple-600'
                          )}
                        </div>
                      );
                    }

                    // Câu hỏi tự luận (text)
                    const texts = validResponses
                      .map((r) => ({
                        code: r.surveyCode,
                        txt: getTextAnswer(r, q.key).trim(),
                      }))
                      .filter((x) => Boolean(x.txt));

                    return (
                      <div
                        key={q.key}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono mr-1.5">
                              {q.key}
                            </span>
                            {q.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {texts.length} câu trả lời
                          </span>
                        </div>
                        {texts.length === 0 ? (
                          <div className="text-xs text-slate-400 italic py-2">
                            Chưa có câu trả lời tự luận cho câu hỏi này.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {texts.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                              >
                                <span className="font-mono font-bold text-[#d12f2f] mr-1.5">
                                  [{item.code}]
                                </span>
                                <span className="text-slate-800">{item.txt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
