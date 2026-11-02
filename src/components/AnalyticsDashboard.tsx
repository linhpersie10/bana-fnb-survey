import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  FileSpreadsheet,
  SlidersHorizontal,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  SurveyResponseData,
  OptionItem,
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
  A5_ROWS,
  A5_COLUMNS,
  A6_OPTIONS,
  A7_OPTIONS,
  A8_OPTIONS,
  B1_OPTIONS,
  B2_OPTIONS,
  B3_1_OPTIONS,
  B3_2_OPTIONS,
  B3_3_OPTIONS,
  B4_ROWS,
  B5_ITEMS,
  C1_OPTIONS,
  C2_OPTIONS,
  C3_OPTIONS,
  CustomQuestionCsvMeta,
  CsvExportOptions,
  exportResponsesToCsv,
  exportResponsesToExcel,
  getSingleAnswer,
  getMultiAnswer,
  getTextAnswer,
  getOtherInputAnswer,
  getLikertRowAnswer,
} from '../data/surveySchema';
import { SurveySystemConfig, getLikertScaleLabels } from '../services/surveyConfig';
import { TONES, CATEGORICAL_HEX, LIKERT_TONE_HEX } from '../lib/tones';
import {
  PageHeader,
  StatCard,
  SectionCard,
  SegmentedToggle,
  ActiveFilterChips,
  FilterChipItem,
  ProportionBreakdown,
  RankedBarList,
  BreakdownItem,
} from './ui/ReportPrimitives';

interface AnalyticsDashboardProps {
  responses: SurveyResponseData[];
  config: SurveySystemConfig;
  canExport?: boolean;
  isSuperadmin?: boolean;
  onSeedPilotSamples?: () => void;
  onClearPilotSamples?: () => void;
}

type ReportSectionTab =
  | 'overview'
  | 'spending'
  | 'preferences'
  | 'expectations'
  | 'crosstab';

type CrossTabDimension = 'market_group' | 's5_detail' | 's7_mode' | 's9_ticket' | 's4_age' | 'location';

const SPEND_TIER_MIDPOINTS: Record<number, number> = {
  1: 100,
  2: 200,
  3: 300,
  4: 450,
  5: 625,
  6: 875,
  7: 1200,
};

interface DrilldownState {
  title: string;
  subtitle?: string;
  items: SurveyResponseData[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  responses,
  config,
  canExport = true,
  isSuperadmin = false,
  onSeedPilotSamples,
  onClearPilotSamples,
}) => {
  // ============================================================================
  // 1. MULTI-DIMENSIONAL FILTER STATE
  // ============================================================================
  const [activeSubTab, setActiveSubTab] = useState<ReportSectionTab>('overview');
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(true);

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | '7days'>('all');
  const [statusFilter, setStatusFilter] = useState<'completed' | 'all' | 'screenout'>('completed');
  const [locationFilter, setLocationFilter] = useState<number | 'all'>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all'); // 'all' | 'domestic' | 'international' | 'code:1'..
  const [travelModeFilter, setTravelModeFilter] = useState<number | 'all'>('all');
  const [ticketFilter, setTicketFilter] = useState<number | 'all'>('all');
  const [fnbUsageFilter, setFnbUsageFilter] = useState<'all' | 'used' | 'not_used'>('all');
  const [interviewerFilter, setInterviewerFilter] = useState<string>('all');

  // Cross-filter bổ sung khi bấm trực tiếp vào bất kỳ biểu đồ nào
  const [chartCrossFilter, setChartCrossFilter] = useState<{
    questionKey: string;
    questionLabel: string;
    code: number;
    optionLabel: string;
    isMulti?: boolean;
  } | null>(null);

  // Điều khiển hiển thị trên từng thẻ phân tích
  const [a5DisplayMode, setA5DisplayMode] = useState<'pct' | 'count'>('pct');
  const [b3TierTab, setB3TierTab] = useState<'B3_1' | 'B3_2' | 'B3_3'>('B3_1');
  const [b5SortMode, setB5SortMode] = useState<'mean' | 'code'>('mean');
  const [crossTabDim, setCrossTabDim] = useState<CrossTabDimension>('market_group');
  const [explorerSearch, setExplorerSearch] = useState<string>('');
  const [explorerSection, setExplorerSection] = useState<'ALL' | 'S' | 'A' | 'B' | 'C'>('ALL');
  const [verbatimFilterTag, setVerbatimFilterTag] = useState<string>('ALL');

  // Drilldown Modal state (chuẩn Reports.tsx)
  const [drilldown, setDrilldown] = useState<DrilldownState | null>(null);

  const qOpts = (key: string, fallback: OptionItem[]): OptionItem[] => {
    const q = config.questions[key];
    return q && q.options && q.options.length > 0 ? q.options : fallback;
  };

  const interviewers = useMemo(() => {
    const map = new Map<string, string>();
    responses.forEach((r) => {
      if (r.interviewerUid && r.interviewerName) {
        map.set(r.interviewerUid, r.interviewerName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [responses]);

  const applyQuickDatePreset = (preset: 'all' | 'today' | '7days') => {
    setDatePreset(preset);
    const today = new Date();
    const toIso = (d: Date) => d.toISOString().slice(0, 10);
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'today') {
      const t = toIso(today);
      setDateFrom(t);
      setDateTo(t);
    } else if (preset === '7days') {
      const past = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      setDateFrom(toIso(past));
      setDateTo(toIso(today));
    }
  };

  const resetAllFilters = () => {
    setDateFrom('');
    setDateTo('');
    setDatePreset('all');
    setStatusFilter('completed');
    setLocationFilter('all');
    setMarketFilter('all');
    setTravelModeFilter('all');
    setTicketFilter('all');
    setFnbUsageFilter('all');
    setInterviewerFilter('all');
    setChartCrossFilter(null);
  };

  const toggleChartCrossFilter = (
    questionKey: string,
    questionLabel: string,
    code: number,
    optionLabel: string,
    isMulti = false
  ) => {
    setChartCrossFilter((prev) => {
      if (prev && prev.questionKey === questionKey && prev.code === code) {
        return null;
      }
      return { questionKey, questionLabel, code, optionLabel, isMulti };
    });
  };

  // ============================================================================
  // 2. REACTIVE FILTERED DATASETS
  // ============================================================================
  const matchesContextFilters = (r: SurveyResponseData): boolean => {
    if (dateFrom && r.surveyDate < dateFrom) return false;
    if (dateTo && r.surveyDate > dateTo) return false;
    if (locationFilter !== 'all' && r.locationId !== locationFilter) return false;
    if (interviewerFilter !== 'all' && r.interviewerUid !== interviewerFilter) return false;

    if (marketFilter !== 'all') {
      const s5 = getSingleAnswer(r, 'S5');
      if (marketFilter === 'domestic') {
        if (s5 === null || s5 < 1 || s5 > 4) return false;
      } else if (marketFilter === 'international') {
        if (s5 === null || s5 < 5) return false;
      } else if (marketFilter.startsWith('code:')) {
        const targetCode = Number(marketFilter.replace('code:', ''));
        if (s5 !== targetCode) return false;
      }
    }

    if (travelModeFilter !== 'all') {
      if (getSingleAnswer(r, 'S7') !== travelModeFilter) return false;
    }

    if (ticketFilter !== 'all') {
      if (getSingleAnswer(r, 'S9') !== ticketFilter) return false;
    }

    if (fnbUsageFilter !== 'all') {
      const a2 = getMultiAnswer(r, 'A2');
      const notUsed = a2.includes(7);
      const usedAny = a2.length > 0 && !notUsed;
      if (fnbUsageFilter === 'used' && !usedAny) return false;
      if (fnbUsageFilter === 'not_used' && !notUsed) return false;
    }

    if (chartCrossFilter) {
      if (chartCrossFilter.isMulti) {
        const arr = getMultiAnswer(r, chartCrossFilter.questionKey);
        if (!arr.includes(chartCrossFilter.code)) return false;
      } else {
        const val = getSingleAnswer(r, chartCrossFilter.questionKey);
        if (val !== chartCrossFilter.code) return false;
      }
    }

    return true;
  };

  const baseContextResponses = useMemo(
    () => responses.filter(matchesContextFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      responses,
      dateFrom,
      dateTo,
      locationFilter,
      marketFilter,
      travelModeFilter,
      ticketFilter,
      fnbUsageFilter,
      interviewerFilter,
      chartCrossFilter,
    ]
  );

  const filteredResponses = useMemo(() => {
    return baseContextResponses.filter((r) => {
      if (statusFilter === 'completed') return r.status === 'completed';
      if (statusFilter === 'screenout') return r.status === 'screenout';
      return true;
    });
  }, [baseContextResponses, statusFilter]);

  const validResponses = useMemo(
    () => baseContextResponses.filter((r) => r.status === 'completed'),
    [baseContextResponses]
  );

  // Active Filter Chips (Chuẩn ActiveFilterChips.tsx)
  const activeFilterChips = useMemo<FilterChipItem[]>(() => {
    const chips: FilterChipItem[] = [];
    if (dateFrom || dateTo) {
      chips.push({
        key: 'date',
        label: `Ngày: ${dateFrom || '...'} → ${dateTo || '...'}`,
        onClear: () => {
          setDateFrom('');
          setDateTo('');
          setDatePreset('all');
        },
      });
    }
    if (statusFilter !== 'completed') {
      chips.push({
        key: 'status',
        label: `Trạng thái: ${statusFilter === 'all' ? 'Tất cả phiếu' : 'Screen-out'}`,
        onClear: () => setStatusFilter('completed'),
      });
    }
    if (locationFilter !== 'all') {
      const locName =
        config.locations.find((l) => l.id === locationFilter)?.name || `Điểm #${locationFilter}`;
      chips.push({
        key: 'location',
        label: `Điểm: ${locName}`,
        onClear: () => setLocationFilter('all'),
      });
    }
    if (marketFilter !== 'all') {
      let label = 'Thị trường';
      if (marketFilter === 'domestic') label = 'Khách Nội địa (S5=1..4)';
      else if (marketFilter === 'international') label = 'Khách Quốc tế (S5≥5)';
      else if (marketFilter.startsWith('code:')) {
        const c = Number(marketFilter.replace('code:', ''));
        const opt = qOpts('S5', S5_OPTIONS).find((o) => o.code === c);
        label = `S5: ${opt?.label || c}`;
      }
      chips.push({
        key: 'market',
        label,
        onClear: () => setMarketFilter('all'),
      });
    }
    if (travelModeFilter !== 'all') {
      const opt = qOpts('S7', S7_OPTIONS).find((o) => o.code === travelModeFilter);
      chips.push({
        key: 's7',
        label: `S7: ${opt?.label || travelModeFilter}`,
        onClear: () => setTravelModeFilter('all'),
      });
    }
    if (ticketFilter !== 'all') {
      const opt = qOpts('S9', S9_OPTIONS).find((o) => o.code === ticketFilter);
      chips.push({
        key: 's9',
        label: `S9: ${opt?.label || ticketFilter}`,
        onClear: () => setTicketFilter('all'),
      });
    }
    if (fnbUsageFilter !== 'all') {
      chips.push({
        key: 'fnb',
        label: fnbUsageFilter === 'used' ? 'Đã dùng F&B (A2)' : 'Chưa dùng F&B (A2=7)',
        onClear: () => setFnbUsageFilter('all'),
      });
    }
    if (interviewerFilter !== 'all') {
      const pvv = interviewers.find((i) => i.id === interviewerFilter);
      chips.push({
        key: 'pvv',
        label: `PVV: ${pvv?.name || interviewerFilter}`,
        onClear: () => setInterviewerFilter('all'),
      });
    }
    if (chartCrossFilter) {
      chips.push({
        key: 'cross',
        label: `${chartCrossFilter.questionKey}: ${chartCrossFilter.optionLabel}`,
        onClear: () => setChartCrossFilter(null),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    chartCrossFilter,
    config.locations,
    interviewers,
  ]);

  // Cấu hình xuất CSV / Excel đầy đủ
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
  // 3. STATISTICAL AGGREGATION ENGINE
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
    const buffetTotalRated = subset.filter(
      (r) => r.B4?.buffet !== null && r.B4?.buffet !== undefined
    ).length;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseContextResponses, validResponses, config.questions.B5]);

  // Hàm tính phân phối Single-select kèm Drilldown
  const buildSingleBreakdown = (
    dataset: SurveyResponseData[],
    qKey: string,
    qLabel: string,
    fallbackOpts: OptionItem[],
    sortByCount = false
  ): BreakdownItem[] => {
    const opts = qOpts(qKey, fallbackOpts).filter((o) => !(o as { hidden?: boolean }).hidden);
    const totalAnswered = dataset.filter((r) => getSingleAnswer(r, qKey) !== null).length;
    const list: BreakdownItem[] = opts.map((opt, idx) => {
      const matched = dataset.filter((r) => getSingleAnswer(r, qKey) === opt.code);
      const count = matched.length;
      const pct = totalAnswered > 0 ? Math.round((count / totalAnswered) * 100) : 0;
      const isSelected =
        chartCrossFilter?.questionKey === qKey && chartCrossFilter?.code === opt.code;
      return {
        code: opt.code,
        label: opt.label,
        count,
        pct,
        colorHex: CATEGORICAL_HEX[idx % CATEGORICAL_HEX.length],
        active: isSelected,
        onClick: () => toggleChartCrossFilter(qKey, qLabel, opt.code, opt.label, false),
        onInspect:
          count > 0
            ? () =>
                setDrilldown({
                  title: `${qKey}: ${opt.label}`,
                  subtitle: `${count} phiếu hợp lệ khớp lựa chọn`,
                  items: matched,
                })
            : undefined,
      };
    });
    return sortByCount ? [...list].sort((a, b) => b.count - a.count) : list;
  };

  // Hàm tính phân phối Multi-select kèm Drilldown
  const buildMultiBreakdown = (
    dataset: SurveyResponseData[],
    qKey: string,
    qLabel: string,
    fallbackOpts: OptionItem[],
    sortByCount = true
  ): BreakdownItem[] => {
    const opts = qOpts(qKey, fallbackOpts).filter((o) => !(o as { hidden?: boolean }).hidden);
    const totalRespondents = dataset.filter((r) => getMultiAnswer(r, qKey).length > 0).length;
    const list: BreakdownItem[] = opts.map((opt, idx) => {
      const matched = dataset.filter((r) => getMultiAnswer(r, qKey).includes(opt.code));
      const count = matched.length;
      const pct = totalRespondents > 0 ? Math.round((count / totalRespondents) * 100) : 0;
      const isSelected =
        chartCrossFilter?.questionKey === qKey && chartCrossFilter?.code === opt.code;
      return {
        code: opt.code,
        label: opt.label,
        count,
        pct,
        colorHex: CATEGORICAL_HEX[idx % CATEGORICAL_HEX.length],
        active: isSelected,
        onClick: () => toggleChartCrossFilter(qKey, qLabel, opt.code, opt.label, true),
        onInspect:
          count > 0
            ? () =>
                setDrilldown({
                  title: `${qKey}: ${opt.label}`,
                  subtitle: `${count} phiếu có chọn phương án này`,
                  items: matched,
                })
            : undefined,
      };
    });
    return sortByCount ? [...list].sort((a, b) => b.count - a.count) : list;
  };

  // Hàm tính phân phối Ma trận Likert 5 mức (cho B5 và câu Likert Admin thêm)
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

  const allConfiguredQuestions = useMemo(() => {
    const keys = [...config.questionOrder];
    Object.keys(config.questions).forEach((k) => {
      if (!keys.includes(k)) keys.push(k);
    });
    return keys
      .map((k) => config.questions[k])
      .filter((q) => Boolean(q) && !q.hidden);
  }, [config]);

  const openVerbatims = useMemo(() => {
    const items: {
      response: SurveyResponseData;
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
          response: r,
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'C4. Đề xuất chung',
          text: r.C4_note.trim(),
        });
      }
      if (r.A3_1?.trim()) {
        items.push({
          response: r,
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'A3.1. Nơi đã ăn trước',
          text: r.A3_1.trim(),
        });
      }
      if (r.A3_2?.trim()) {
        items.push({
          response: r,
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'A3.2. Mức giá hợp lý',
          text: r.A3_2.trim(),
        });
      }
      if (r.A3_3?.trim()) {
        items.push({
          response: r,
          surveyCode: r.surveyCode,
          date: r.surveyDate,
          locationName: locName,
          tag: 'A3.3. Món mong muốn',
          text: r.A3_3.trim(),
        });
      }
      Object.keys(config.questions).forEach((qk) => {
        const otherTxt = getOtherInputAnswer(r, qk)?.trim();
        if (otherTxt) {
          items.push({
            response: r,
            surveyCode: r.surveyCode,
            date: r.surveyDate,
            locationName: locName,
            tag: `${qk} (Khác)`,
            text: otherTxt,
          });
        }
      });
    });

    return items;
  }, [validResponses, config.locations, config.questions]);

  // ============================================================================
  // 4. RENDER LIKERT MATRIX TABLE (Chuẩn IAS Table + Stacked Proportion Bar)
  // ============================================================================
  const renderLikertTableSection = (
    qKey: string,
    title: string,
    enableSorting = false
  ) => {
    const { scaleLabels, rows } = computeLikertMatrixStats(validResponses, qKey);
    const displayRows =
      enableSorting && b5SortMode === 'code'
        ? [...rows].sort((a, b) => a.code - b.code)
        : [...rows].sort((a, b) => b.mean - a.mean);

    return (
      <SectionCard
        key={qKey}
        code={qKey}
        title={title}
        meta={`${rows.length} tiêu chí · n = ${validResponses.length}`}
        tone="warning"
        actions={
          enableSorting ? (
            <SegmentedToggle
              value={b5SortMode}
              onChange={setB5SortMode}
              options={[
                { value: 'mean', label: 'Xếp theo Điểm TB' },
                { value: 'code', label: 'Xếp theo Mã' },
              ]}
            />
          ) : undefined
        }
        bodyClassName="p-0"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              {scaleLabels.map((lbl, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: LIKERT_TONE_HEX[idx] }}
                  />
                  <span className="font-medium text-slate-700">{idx + 1}:</span>
                  <span>{lbl}</span>
                </span>
              ))}
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              Thang điểm 1.00 – 5.00
            </span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-2.5 px-4 w-16">Mã</th>
                <th className="py-2.5 px-3 min-w-[220px]">Tiêu chí đánh giá</th>
                <th className="py-2.5 px-3 w-64">Phân bổ tỷ trọng 5 mức (1 → 5)</th>
                <th className="py-2.5 px-2 text-right w-14 tabular-nums">Mức 1-2</th>
                <th className="py-2.5 px-2 text-right w-14 tabular-nums">Mức 3</th>
                <th className="py-2.5 px-3 text-right w-20 tabular-nums">Mức 4+5</th>
                <th className="py-2.5 px-4 text-right w-24 tabular-nums">Điểm TB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRows.map((row) => {
                const low2Pct = row.pcts[0] + row.pcts[1];
                return (
                  <tr key={row.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[11px] font-medium text-slate-500 whitespace-nowrap">
                      {row.displayCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        {row.pcts.map((pct, sIdx) =>
                          pct > 0 ? (
                            <motion.div
                              key={sIdx}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.25, ease: 'easeOut' }}
                              style={{ backgroundColor: LIKERT_TONE_HEX[sIdx] }}
                              className="h-full border-r border-white last:border-r-0"
                              title={`Mức ${sIdx + 1} (${scaleLabels[sIdx]}): ${row.counts[sIdx]} phiếu (${pct}%)`}
                            />
                          ) : null
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-rose-600">
                      {low2Pct}%
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums text-slate-500">
                      {row.pcts[2]}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-emerald-700">
                      {row.top2Pct}%
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 font-semibold tabular-nums">
                        {row.mean.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    );
  };

  const spendDelta = kpiMetrics.avgActualSpend - kpiMetrics.avgPlannedBudget;
  const hasPilotSamples = responses.some((r) => r.id.startsWith('PILOT_SAMPLE_'));

  return (
    <div className="space-y-4 pb-12">
      {/* ==========================================================================
          ROW 1: CLEAN PAGE HEADER (Chuẩn DESIGN.md §6b D1 & PageHeader.tsx)
         ========================================================================== */}
      <PageHeader
        title="Báo cáo khảo sát F&B"
        meta={
          <>
            <span className="font-semibold text-slate-700">{kpiMetrics.completedCount}</span>{' '}
            phiếu hợp lệ / {config.dataFormat.totalQuotaTarget} chỉ tiêu ·{' '}
            <span>{kpiMetrics.screenoutCount} dừng sàng lọc</span> ·{' '}
            <span>{config.locations.length} điểm khảo sát</span>
          </>
        }
        actions={
          <>
            <SegmentedToggle
              value={datePreset}
              onChange={applyQuickDatePreset}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'today', label: 'Hôm nay' },
                { value: '7days', label: '7 ngày' },
              ]}
            />

            <button
              type="button"
              onClick={() => setShowFilterPanel((v) => !v)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFilterPanel || activeFilterChips.length > 0
                  ? 'border-slate-300 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Bộ lọc</span>
              {activeFilterChips.length > 0 && (
                <span className="rounded bg-white/20 px-1.5 py-0.2 text-[11px] font-semibold tabular-nums">
                  {activeFilterChips.length}
                </span>
              )}
            </button>

            {isSuperadmin && onSeedPilotSamples && !hasPilotSamples && (
              <button
                type="button"
                onClick={onSeedPilotSamples}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
              >
                + Nạp 30 mẫu thử
              </button>
            )}
            {isSuperadmin && onClearPilotSamples && hasPilotSamples && (
              <button
                type="button"
                onClick={onClearPilotSamples}
                className="h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium cursor-pointer transition-colors"
              >
                Xóa mẫu thử
              </button>
            )}

            {canExport && (
              <>
                <button
                  type="button"
                  disabled={filteredResponses.length === 0}
                  onClick={() => exportResponsesToCsv(filteredResponses, exportOptions)}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Xuất CSV ({filteredResponses.length})</span>
                </button>
                <button
                  type="button"
                  disabled={filteredResponses.length === 0}
                  onClick={() => exportResponsesToExcel(filteredResponses, exportOptions)}
                  className="h-8 px-3 rounded-lg bg-[#d12f2f] hover:bg-[#b82626] disabled:opacity-50 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Xuất Excel ({filteredResponses.length})</span>
                </button>
              </>
            )}
          </>
        }
      />

      {/* ==========================================================================
          ROW 2: COMPACT INLINE FILTER BAR + ACTIVE FILTER CHIPS
         ========================================================================== */}
      {showFilterPanel && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-2.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setDatePreset('all');
                }}
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setDatePreset('all');
                }}
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Điểm khảo sát
              </label>
              <select
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Thị trường (S5)
              </label>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="all">Tất cả thị trường</option>
                <option value="domestic">Khách Nội địa (S5=1..4)</option>
                <option value="international">Khách Quốc tế (S5≥5)</option>
                <optgroup label="Theo quốc tịch / vùng">
                  {qOpts('S5', S5_OPTIONS).map((o) => (
                    <option key={o.code} value={`code:${o.code}`}>
                      {o.code}. {o.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Hình thức đi (S7)
              </label>
              <select
                value={travelModeFilter}
                onChange={(e) =>
                  setTravelModeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Gói vé (S9)
              </label>
              <select
                value={ticketFilter}
                onChange={(e) =>
                  setTicketFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Sử dụng F&amp;B (A2)
              </label>
              <select
                value={fnbUsageFilter}
                onChange={(e) =>
                  setFnbUsageFilter(e.target.value as 'all' | 'used' | 'not_used')
                }
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="all">Tất cả đáp viên</option>
                <option value="used">Đã dùng F&amp;B (A2=1..6)</option>
                <option value="not_used">Chưa dùng F&amp;B (A2=7)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Phỏng vấn viên
              </label>
              <select
                value={interviewerFilter}
                onChange={(e) => setInterviewerFilter(e.target.value)}
                className="h-8 w-full px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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

          {activeFilterChips.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <ActiveFilterChips
                chips={activeFilterChips}
                onClearAll={resetAllFilters}
                summaryText={`Đang lọc (${validResponses.length} phiếu hợp lệ):`}
              />
            </div>
          )}
        </div>
      )}

      {!showFilterPanel && activeFilterChips.length > 0 && (
        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2">
          <ActiveFilterChips
            chips={activeFilterChips}
            onClearAll={resetAllFilters}
            summaryText={`Đang lọc (${validResponses.length} phiếu hợp lệ):`}
          />
        </div>
      )}

      {/* ==========================================================================
          ROW 3: 6 STAT CARDS (Chuẩn StatCard.tsx — Không icon trang trí)
         ========================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Mẫu hợp lệ"
          tone="ocean"
          value={kpiMetrics.completedCount.toLocaleString('vi-VN')}
          subValue={`/ ${config.dataFormat.totalQuotaTarget}`}
          note={`Tiếp cận ${kpiMetrics.totalApproached} · đạt ${kpiMetrics.completionRate}%`}
          onClick={() =>
            setDrilldown({
              title: 'Danh sách phiếu khảo sát hợp lệ',
              subtitle: `${validResponses.length} phiếu hoàn thành theo bộ lọc hiện tại`,
              items: validResponses,
            })
          }
        />

        <StatCard
          label="Tỷ lệ dùng F&B (A2)"
          tone="success"
          value={`${kpiMetrics.fnbPenetrationRate}%`}
          active={fnbUsageFilter === 'used'}
          onClick={() => setFnbUsageFilter((prev) => (prev === 'used' ? 'all' : 'used'))}
          note={`${kpiMetrics.usedFnBCount} dùng · ${kpiMetrics.notUsedFnBCount} chưa dùng`}
        />

        <StatCard
          label="Khách Quốc tế (S5)"
          tone="iris"
          value={`${kpiMetrics.intlPct}%`}
          active={marketFilter === 'international'}
          onClick={() =>
            setMarketFilter((prev) => (prev === 'international' ? 'all' : 'international'))
          }
          note={`${kpiMetrics.intlCount} Quốc tế · ${
            kpiMetrics.completedCount - kpiMetrics.intlCount
          } Nội địa`}
        />

        <StatCard
          label="Ngân sách dự kiến (A1)"
          tone="info"
          value={
            kpiMetrics.avgPlannedBudget > 0 ? `~${kpiMetrics.avgPlannedBudget}k` : '—'
          }
          subValue="đ/người"
          active={travelModeFilter === 1}
          onClick={() => setTravelModeFilter((prev) => (prev === 1 ? 'all' : 1))}
          note={`Tự túc (FIT): ${kpiMetrics.fitPct}% (${kpiMetrics.fitCount} phiếu)`}
        />

        <StatCard
          label="Chi tiêu thực tế (A4)"
          tone="brand"
          value={kpiMetrics.avgActualSpend > 0 ? `~${kpiMetrics.avgActualSpend}k` : '—'}
          subValue="đ/người"
          note={
            kpiMetrics.avgPlannedBudget > 0 && kpiMetrics.avgActualSpend > 0
              ? `Chênh lệch so với A1: ${spendDelta >= 0 ? '+' : ''}${spendDelta}k`
              : `Tính trên ${kpiMetrics.usedFnBCount} khách đã dùng F&B`
          }
        />

        <StatCard
          label="Điểm SERVQUAL (B5)"
          tone="warning"
          value={kpiMetrics.b5OverallMean > 0 ? kpiMetrics.b5OverallMean.toFixed(2) : '—'}
          subValue="/ 5.00"
          note={`Quan trọng (mức 4+5): ${kpiMetrics.b5Top2BoxPct}%`}
        />
      </div>

      {/* ==========================================================================
          ROW 4: SEGMENTED MODULE TABS (Chuẩn IAS Segmented Navigation)
         ========================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/80">
          {(
            [
              { id: 'overview', label: '1. Tổng quan & Phân khúc (Phần S)' },
              { id: 'spending', label: '2. Hành vi & Chi tiêu (Phần A)' },
              { id: 'preferences', label: '3. Thị hiếu & Khẩu vị (Phần B)' },
              { id: 'expectations', label: '4. SERVQUAL & Kỳ vọng (B5 & Phần C)' },
              {
                id: 'crosstab',
                label: `5. Phân tách đa chiều & Câu hỏi (${allConfiguredQuestions.length})`,
              },
            ] as { id: ReportSectionTab; label: string }[]
          ).map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-slate-950 font-semibold shadow-2xs'
                    : 'text-slate-600 font-medium hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {chartCrossFilter && (
          <button
            type="button"
            onClick={() => setChartCrossFilter(null)}
            className="text-xs font-medium text-[#d12f2f] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Bỏ lọc biểu đồ ({chartCrossFilter.questionKey}: {chartCrossFilter.optionLabel})
          </button>
        )}
      </div>

      {/* ==========================================================================
          TAB 1: TỔNG QUAN & PHÂN KHÚC KHÁCH HÀNG (PHẦN S)
         ========================================================================== */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* Luồng chuyển đổi mẫu khảo sát (Funnel) & S2/S1 */}
          <SectionCard
            title="Phễu chuyển đổi mẫu khảo sát & hành vi tiêu dùng F&B"
            meta={`Tiếp cận ${kpiMetrics.totalApproached} lượt`}
            tone="ocean"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  step: '01',
                  label: 'Tổng lượt tiếp cận',
                  count: kpiMetrics.totalApproached,
                  pct: 100,
                  sub: '100% mẫu ghi nhận',
                  tone: 'neutral' as const,
                  onClick: () =>
                    setDrilldown({
                      title: 'Tổng lượt tiếp cận',
                      subtitle: `${baseContextResponses.length} bản ghi`,
                      items: baseContextResponses,
                    }),
                },
                {
                  step: '02',
                  label: 'Mẫu hợp lệ (Qua S2)',
                  count: kpiMetrics.completedCount,
                  pct: kpiMetrics.completionRate,
                  sub: `${kpiMetrics.screenoutCount} dừng sàng lọc (S2=3)`,
                  tone: 'ocean' as const,
                  onClick: () =>
                    setDrilldown({
                      title: 'Mẫu hợp lệ (Qua sàng lọc S2)',
                      subtitle: `${validResponses.length} phiếu hoàn thành`,
                      items: validResponses,
                    }),
                },
                {
                  step: '03',
                  label: 'Đã sử dụng F&B (A2=1..6)',
                  count: kpiMetrics.usedFnBCount,
                  pct: kpiMetrics.fnbPenetrationRate,
                  sub: 'Trả lời chi tiết A4 → A8',
                  tone: 'success' as const,
                  onClick: () => setFnbUsageFilter((p) => (p === 'used' ? 'all' : 'used')),
                },
                {
                  step: '04',
                  label: 'Chưa dùng F&B (A2=7)',
                  count: kpiMetrics.notUsedFnBCount,
                  pct:
                    kpiMetrics.completedCount > 0
                      ? 100 - kpiMetrics.fnbPenetrationRate
                      : 0,
                  sub: 'Phân tích rào cản tại A3',
                  tone: 'warning' as const,
                  onClick: () =>
                    setFnbUsageFilter((p) => (p === 'not_used' ? 'all' : 'not_used')),
                },
              ].map((st) => (
                <div
                  key={st.step}
                  onClick={st.onClick}
                  className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 hover:border-slate-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-slate-400">{st.step}</span>
                    <span className="font-semibold tabular-nums text-slate-600">{st.pct}%</span>
                  </div>
                  <div className="mt-1 text-xs font-medium text-slate-600">{st.label}</div>
                  <div className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums text-slate-900">
                    {st.count.toLocaleString('vi-VN')}{' '}
                    <span className="text-xs font-normal text-slate-400">phiếu</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/70 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${st.pct}%` }}
                      transition={{ duration: 0.25 }}
                      className={`h-full rounded-full ${TONES[st.tone].bar}`}
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-500 truncate">{st.sub}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 3 Khối tỷ trọng cốt lõi: S5 (Chi tiết), S7 (Hình thức đi), S9 (Loại vé) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard
              code="S5"
              title="Thị trường & quốc tịch khách"
              meta={`n = ${validResponses.length}`}
              tone="ocean"
            >
              <RankedBarList
                items={buildSingleBreakdown(
                  validResponses,
                  'S5',
                  'S5. Quốc tịch',
                  S5_OPTIONS,
                  true
                )}
                useCategoricalColors
              />
            </SectionCard>

            <SectionCard
              code="S7"
              title="Hình thức chuyến đi (FIT / Tour)"
              meta={`n = ${validResponses.length}`}
              tone="iris"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'S7',
                  'S7. Hình thức đi',
                  S7_OPTIONS
                )}
                showCodePrefix
              />

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  S8. Tần suất đến Bà Nà Hills
                </div>
                <ProportionBreakdown
                  items={buildSingleBreakdown(
                    validResponses,
                    'S8',
                    'S8. Số lần đến',
                    S8_OPTIONS
                  )}
                  showCodePrefix
                />
              </div>
            </SectionCard>

            <SectionCard
              code="S9"
              title="Gói vé / sản phẩm sử dụng"
              meta={`n = ${validResponses.length}`}
              tone="brand"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'S9',
                  'S9. Gói vé',
                  S9_OPTIONS
                )}
                showCodePrefix
              />
            </SectionCard>
          </div>

          {/* 3 Khối nhân khẩu học tiếp theo: S6 (Đi cùng ai), S4 (Độ tuổi), S1 & S3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard
              code="S6"
              title="Đặc điểm nhóm đi cùng"
              meta={`n = ${validResponses.length}`}
              tone="success"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'S6',
                  'S6. Đi cùng ai',
                  S6_OPTIONS
                )}
                showCodePrefix
              />
            </SectionCard>

            <SectionCard
              code="S4"
              title="Cơ cấu độ tuổi đáp viên"
              meta={`n = ${validResponses.length}`}
              tone="info"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'S4',
                  'S4. Độ tuổi',
                  S4_OPTIONS
                )}
                showCodePrefix
              />
            </SectionCard>

            <SectionCard
              code="S1 · S3"
              title="Khung giờ tham quan & giới tính"
              meta={`n = ${validResponses.length}`}
              tone="neutral"
            >
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    S1. Thời gian tham quan trong ngày
                  </div>
                  <ProportionBreakdown
                    items={buildSingleBreakdown(
                      validResponses,
                      'S1',
                      'S1. Thời gian',
                      S1_OPTIONS
                    )}
                    showCodePrefix
                  />
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    S3. Giới tính đáp viên
                  </div>
                  <ProportionBreakdown
                    items={buildSingleBreakdown(
                      validResponses,
                      'S3',
                      'S3. Giới tính',
                      S3_OPTIONS
                    )}
                    showCodePrefix
                  />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Bảng Tiến độ Điểm khảo sát & Phỏng vấn viên (Chuẩn OverviewMetricTable trong Reports.tsx) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <SectionCard
              title="Tiến độ mẫu theo điểm khảo sát"
              meta={`${config.locations.length} điểm trực`}
              tone="brand"
              className="lg:col-span-7"
              bodyClassName="p-0"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-medium">
                      <th className="py-2.5 px-4">Điểm khảo sát</th>
                      <th className="py-2.5 px-3 text-right tabular-nums">Hợp lệ</th>
                      <th className="py-2.5 px-3 text-right tabular-nums">Chỉ tiêu</th>
                      <th className="py-2.5 px-3 w-36">Tiến độ</th>
                      <th className="py-2.5 px-4 text-right tabular-nums">Tỷ lệ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config.locations.map((loc) => {
                      const locValid = validResponses.filter((r) => r.locationId === loc.id);
                      const count = locValid.length;
                      const pct =
                        loc.quotaTarget > 0
                          ? Math.min(100, Math.round((count / loc.quotaTarget) * 100))
                          : 0;
                      const isSelected = locationFilter === loc.id;
                      return (
                        <tr
                          key={loc.id}
                          onClick={() =>
                            setLocationFilter((prev) => (prev === loc.id ? 'all' : loc.id))
                          }
                          className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                            isSelected ? 'bg-red-50/50 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-4 font-medium text-slate-800">
                            {loc.name}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-slate-900">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrilldown({
                                  title: `Điểm khảo sát: ${loc.name}`,
                                  subtitle: `${count} phiếu hợp lệ`,
                                  items: locValid,
                                });
                              }}
                              className="hover:text-[#d12f2f] hover:underline cursor-pointer"
                            >
                              {count}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                            {loc.quotaTarget}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.25 }}
                                className={`h-full rounded-full ${
                                  pct >= 100 ? 'bg-emerald-500' : 'bg-[#d12f2f]'
                                }`}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium tabular-nums text-slate-600">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              title="Năng suất phỏng vấn viên (PVV)"
              meta={`${interviewers.length} nhân sự`}
              tone="ocean"
              className="lg:col-span-5"
              bodyClassName="p-0"
            >
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Phỏng vấn viên</th>
                      <th className="py-2.5 px-2 text-right tabular-nums">Hợp lệ</th>
                      <th className="py-2.5 px-2 text-right tabular-nums">Dừng</th>
                      <th className="py-2.5 px-4 text-right tabular-nums">TG TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {interviewers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          Chưa có dữ liệu PVV
                        </td>
                      </tr>
                    ) : (
                      interviewers.map((pvv) => {
                        const pvvAll = baseContextResponses.filter(
                          (r) => r.interviewerUid === pvv.id
                        );
                        const pvvValid = pvvAll.filter((r) => r.status === 'completed');
                        const pvvStop = pvvAll.filter((r) => r.status === 'screenout').length;
                        const avgDur =
                          pvvValid.length > 0
                            ? Math.round(
                                pvvValid.reduce((s, r) => s + (r.durationSeconds || 0), 0) /
                                  pvvValid.length
                              )
                            : 0;
                        const isSelected = interviewerFilter === pvv.id;
                        return (
                          <tr
                            key={pvv.id}
                            onClick={() =>
                              setInterviewerFilter((prev) =>
                                prev === pvv.id ? 'all' : pvv.id
                              )
                            }
                            className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                              isSelected ? 'bg-red-50/50 font-semibold' : ''
                            }`}
                          >
                            <td className="py-2 px-4 font-medium text-slate-800 truncate max-w-[160px]">
                              {pvv.name}
                            </td>
                            <td className="py-2 px-2 text-right font-semibold tabular-nums text-emerald-700">
                              {pvvValid.length}
                            </td>
                            <td className="py-2 px-2 text-right tabular-nums text-slate-500">
                              {pvvStop}
                            </td>
                            <td className="py-2 px-4 text-right tabular-nums text-slate-500">
                              {avgDur}s
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ==========================================================================
          TAB 2: HÀNH VI & CHI TIÊU F&B (PHẦN A)
         ========================================================================== */}
      {activeSubTab === 'spending' && (
        <div className="space-y-4">
          {/* A2 vs A3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard
              code="A2"
              title="Loại hình dịch vụ ăn uống đã sử dụng"
              meta={`Chọn nhiều · n = ${validResponses.length}`}
              tone="success"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'A2',
                  'A2. Dịch vụ đã dùng',
                  A2_OPTIONS
                )}
                barHex="#10b981"
              />
            </SectionCard>

            <SectionCard
              code="A3"
              title="Lý do chưa sử dụng dịch vụ F&B tại Bà Nà"
              meta={`Nhóm A2=7 · n = ${kpiMetrics.notUsedFnBCount}`}
              tone="danger"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses.filter((r) => getMultiAnswer(r, 'A2').includes(7)),
                  'A3',
                  'A3. Rào cản chưa dùng F&B',
                  A3_OPTIONS
                )}
                barHex="#f43f5e"
                emptyText="Không có đáp viên nào thuộc nhóm chưa dùng F&B (A2=7)"
              />
            </SectionCard>
          </div>

          {/* Đối chiếu Ngân sách dự kiến (A1) vs Chi tiêu thực tế (A4) & A4.1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <SectionCard
              code="A1 · A4"
              title="Đối chiếu ngân sách dự kiến (A1) và chi tiêu thực tế bình quân/người (A4)"
              meta={`TB A1: ~${kpiMetrics.avgPlannedBudget}k · TB A4: ~${kpiMetrics.avgActualSpend}k`}
              tone="ocean"
              className="lg:col-span-7"
              bodyClassName="p-0"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-medium">
                      <th className="py-2.5 px-4">Mức chi tiêu / người</th>
                      <th className="py-2.5 px-3 text-right tabular-nums">Dự kiến (A1)</th>
                      <th className="py-2.5 px-3 text-right tabular-nums">Thực tế (A4)</th>
                      <th className="py-2.5 px-4 w-48">So sánh tỷ trọng (A1 vs A4)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {qOpts('A1', A1_OPTIONS).map((opt) => {
                      const a1Count = validResponses.filter(
                        (r) => getSingleAnswer(r, 'A1') === opt.code
                      ).length;
                      const a1Pct =
                        validResponses.length > 0
                          ? Math.round((a1Count / validResponses.length) * 100)
                          : 0;

                      const usedList = validResponses.filter((r) => {
                        const a2 = getMultiAnswer(r, 'A2');
                        return a2.length > 0 && !a2.includes(7);
                      });
                      const a4Count = usedList.filter(
                        (r) => getSingleAnswer(r, 'A4') === opt.code
                      ).length;
                      const a4Pct =
                        usedList.length > 0
                          ? Math.round((a4Count / usedList.length) * 100)
                          : 0;

                      return (
                        <tr key={opt.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-4 font-medium text-slate-800">
                            <span className="font-mono text-[11px] text-slate-400 mr-1.5">
                              {opt.code}.
                            </span>
                            {opt.label}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-cyan-700 font-medium">
                            {a1Count} <span className="text-slate-400">({a1Pct}%)</span>
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-[#d12f2f] font-semibold">
                            {a4Count} <span className="text-slate-400 font-normal">({a4Pct}%)</span>
                          </td>
                          <td className="py-2 px-4">
                            <div className="space-y-1">
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${a1Pct}%` }}
                                  className="h-full rounded-full bg-cyan-600"
                                />
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${a4Pct}%` }}
                                  className="h-full rounded-full bg-[#d12f2f]"
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              code="A4.1"
              title="Nguyên nhân chi tiêu thực tế chênh lệch dự kiến"
              meta="Khi A4 ≠ A1"
              tone="warning"
              className="lg:col-span-5"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'A4_1',
                  'A4.1. Lý do chênh lệch chi tiêu',
                  A4_1_OPTIONS
                )}
                barHex="#f59e0b"
              />
            </SectionCard>
          </div>

          {/* A5: Ma trận Loại hình dịch vụ × Mức chi tiêu */}
          <SectionCard
            code="A5"
            title="Ma trận mức chi tiêu bình quân/người theo từng loại hình dịch vụ F&B"
            meta={`n = ${kpiMetrics.usedFnBCount} phiếu có dùng F&B`}
            tone="iris"
            actions={
              <SegmentedToggle
                value={a5DisplayMode}
                onChange={setA5DisplayMode}
                options={[
                  { value: 'pct', label: 'Tỷ lệ (%)' },
                  { value: 'count', label: 'Số phiếu' },
                ]}
              />
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-medium">
                    <th className="py-2.5 px-4">Loại hình dịch vụ (A5)</th>
                    {A5_COLUMNS.map((col) => (
                      <th key={col.code} className="py-2.5 px-3 text-right tabular-nums">
                        {col.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-4 text-right tabular-nums">Tổng phiếu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {A5_ROWS.map((row) => {
                    const rowKey = row.key as keyof SurveyResponseData['A5'];
                    const counts = A5_COLUMNS.map((col) => {
                      const matched = validResponses.filter(
                        (r) => r.A5?.[rowKey] === col.code
                      );
                      return {
                        colCode: col.code,
                        colLabel: col.label,
                        matched,
                        count: matched.length,
                      };
                    });
                    const rowTotal = counts.reduce((s, c) => s + c.count, 0);
                    return (
                      <tr key={row.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-slate-800">{row.label}</td>
                        {counts.map((cell) => {
                          const pct =
                            rowTotal > 0 ? Math.round((cell.count / rowTotal) * 100) : 0;
                          const intensity =
                            pct >= 30
                              ? 'bg-indigo-50 text-indigo-900 font-semibold'
                              : pct >= 12
                              ? 'bg-slate-50 text-slate-800 font-medium'
                              : 'text-slate-400';
                          return (
                            <td
                              key={cell.colCode}
                              className={`py-2.5 px-3 text-right tabular-nums ${intensity}`}
                            >
                              {cell.count > 0 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDrilldown({
                                      title: `A5: ${row.label} — ${cell.colLabel}`,
                                      subtitle: `${cell.count} phiếu ghi nhận`,
                                      items: cell.matched,
                                    })
                                  }
                                  className="hover:text-[#d12f2f] hover:underline cursor-pointer"
                                >
                                  {a5DisplayMode === 'pct' ? `${pct}%` : cell.count}
                                </button>
                              ) : (
                                '—'
                              )}
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-4 text-right font-semibold tabular-nums text-slate-900">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* A6, A7, A8 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard
              code="A6"
              title="Độ phủ thực đơn đáp ứng nhu cầu"
              meta={`n = ${kpiMetrics.usedFnBCount}`}
              tone="ocean"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'A6',
                  'A6. Đánh giá thực đơn',
                  A6_OPTIONS
                )}
                showCodePrefix
              />
            </SectionCard>

            <SectionCard
              code="A7"
              title="Thời gian chờ & tốc độ phục vụ"
              meta={`n = ${kpiMetrics.usedFnBCount}`}
              tone="success"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'A7',
                  'A7. Tốc độ phục vụ',
                  A7_OPTIONS
                )}
                showCodePrefix
              />
            </SectionCard>

            <SectionCard
              code="A8"
              title="Khung giờ phát sinh nhu cầu ăn uống"
              meta="Chọn nhiều"
              tone="iris"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'A8',
                  'A8. Khung giờ ăn uống',
                  A8_OPTIONS
                )}
                barHex="#6366f1"
              />
            </SectionCard>
          </div>
        </div>
      )}

      {/* ==========================================================================
          TAB 3: THỊ HIẾU & KHẨU VỊ ẨM THỰC (PHẦN B)
         ========================================================================== */}
      {activeSubTab === 'preferences' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard
              code="B1"
              title="Nhóm ẩm thực ưu tiên tại khu du lịch"
              meta={`Tối đa 2 lựa chọn · n = ${validResponses.length}`}
              tone="brand"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'B1',
                  'B1. Nhóm ẩm thực',
                  B1_OPTIONS
                )}
                barHex="#d12f2f"
              />
            </SectionCard>

            <SectionCard
              code="B2"
              title="Phong cách chế biến món ăn ưa chuộng"
              meta={`Tối đa 2 lựa chọn · n = ${validResponses.length}`}
              tone="ocean"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'B2',
                  'B2. Cách chế biến',
                  B2_OPTIONS
                )}
                barHex="#0891b2"
              />
            </SectionCard>
          </div>

          {/* B3.1, B3.2, B3.3: Khẩu vị chế biến (Độ cay, Độ đậm vị, Nhiệt độ món) */}
          <SectionCard
            code="B3.1 · B3.2 · B3.3"
            title="Khẩu vị chế biến món ăn ưu tiên (Độ cay · Độ đậm vị · Nhiệt độ)"
            meta={`n = ${validResponses.length}`}
            tone="iris"
            actions={
              <SegmentedToggle
                value={b3TierTab}
                onChange={setB3TierTab}
                options={[
                  { value: 'B3_1', label: 'B3.1. Độ cay' },
                  { value: 'B3_2', label: 'B3.2. Độ đậm vị' },
                  { value: 'B3_3', label: 'B3.3. Nhiệt độ món' },
                ]}
              />
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {(
                [
                  {
                    key: 'B3_1' as const,
                    code: 'B3.1',
                    title: 'Khẩu vị độ cay',
                    opts: B3_1_OPTIONS,
                  },
                  {
                    key: 'B3_2' as const,
                    code: 'B3.2',
                    title: 'Khẩu vị độ đậm nhạt',
                    opts: B3_2_OPTIONS,
                  },
                  {
                    key: 'B3_3' as const,
                    code: 'B3.3',
                    title: 'Nhiệt độ món ăn ưu tiên',
                    opts: B3_3_OPTIONS,
                  },
                ]
              ).map((tier) => {
                const isFocused = b3TierTab === tier.key;
                return (
                  <div
                    key={tier.key}
                    className={`rounded-lg border p-3 transition-colors ${
                      isFocused
                        ? 'border-slate-300 bg-slate-50/70'
                        : 'border-slate-200/70 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-semibold text-slate-900">
                        {tier.code} · {tier.title}
                      </span>
                    </div>
                    <ProportionBreakdown
                      items={buildSingleBreakdown(
                        validResponses,
                        tier.key,
                        tier.title,
                        tier.opts
                      )}
                      showCodePrefix
                    />
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* B4: Mức giá hợp lý sẵn sàng chi trả theo 5 nhóm sản phẩm */}
          <SectionCard
            code="B4"
            title="Mức giá hợp lý du khách sẵn sàng chi trả theo từng nhóm sản phẩm F&B"
            meta={`n = ${validResponses.length}`}
            tone="warning"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {B4_ROWS.map((row) => {
                const total = validResponses.filter(
                  (r) => r.B4?.[row.key] !== null && r.B4?.[row.key] !== undefined
                ).length;
                const items: BreakdownItem[] = row.options.map((opt, idx) => {
                  const matched = validResponses.filter((r) => r.B4?.[row.key] === opt.code);
                  const count = matched.length;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return {
                    code: opt.code,
                    label: opt.label,
                    count,
                    pct,
                    colorHex: CATEGORICAL_HEX[idx % CATEGORICAL_HEX.length],
                    onInspect:
                      count > 0
                        ? () =>
                            setDrilldown({
                              title: `B4 (${row.label}): ${opt.label}`,
                              subtitle: `${count} phiếu lựa chọn`,
                              items: matched,
                            })
                        : undefined,
                  };
                });

                return (
                  <div
                    key={row.key}
                    className="rounded-lg border border-slate-200/80 bg-white p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-semibold text-slate-900">{row.label}</span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        n = {total}
                      </span>
                    </div>
                    <ProportionBreakdown items={items} showCodePrefix />
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ==========================================================================
          TAB 4: ĐÁNH GIÁ SERVQUAL (B5) & KỲ VỌNG CẢI THIỆN (PHẦN C)
         ========================================================================== */}
      {activeSubTab === 'expectations' && (
        <div className="space-y-4">
          {/* B5: Ma trận Likert 5 mức chuẩn IAS */}
          {renderLikertTableSection(
            'B5',
            config.questions.B5?.title ||
              'Đánh giá tầm quan trọng của các yếu tố dịch vụ F&B (Khung SERVQUAL)',
            true
          )}

          {/* Các câu hỏi Likert do Admin thêm mới (ngoài B5) */}
          {allConfiguredQuestions
            .filter((q) => q.type === 'likert' && q.key !== 'B5')
            .map((q) => renderLikertTableSection(q.key, q.title, false))}

          {/* C1, C2, C3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard
              code="C1"
              title="Yếu tố kỳ vọng cải thiện nhất"
              meta="Chọn tối đa 2"
              tone="brand"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'C1',
                  'C1. Kỳ vọng cải thiện',
                  C1_OPTIONS
                )}
                barHex="#d12f2f"
              />
            </SectionCard>

            <SectionCard
              code="C2"
              title="Dịch vụ ẩm thực mong muốn bổ sung"
              meta="Chọn nhiều"
              tone="ocean"
            >
              <RankedBarList
                items={buildMultiBreakdown(
                  validResponses,
                  'C2',
                  'C2. Dịch vụ muốn bổ sung',
                  C2_OPTIONS
                )}
                barHex="#0891b2"
              />
            </SectionCard>

            <SectionCard
              code="C3"
              title="Mức sẵn sàng chi trả thêm (WTP)"
              meta={`n = ${validResponses.length}`}
              tone="success"
            >
              <ProportionBreakdown
                items={buildSingleBreakdown(
                  validResponses,
                  'C3',
                  'C3. Sẵn sàng chi trả thêm',
                  C3_OPTIONS
                )}
                showCodePrefix
              />
            </SectionCard>
          </div>

          {/* Ý kiến mở (C4 & tự luận) dạng bảng gọn chuẩn IAS */}
          <SectionCard
            code="C4 · Tự luận"
            title="Tổng hợp ý kiến đóng góp & câu trả lời tự luận của du khách"
            meta={`${openVerbatims.length} ghi nhận`}
            tone="neutral"
            actions={
              <select
                value={verbatimFilterTag}
                onChange={(e) => setVerbatimFilterTag(e.target.value)}
                className="h-7 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-700"
              >
                <option value="ALL">Tất cả nhóm ý kiến ({openVerbatims.length})</option>
                <option value="C4. Đề xuất chung">C4. Đề xuất chung</option>
                <option value="A3.1. Nơi đã ăn trước">A3.1. Nơi đã ăn trước</option>
                <option value="A3.2. Mức giá hợp lý">A3.2. Mức giá hợp lý</option>
                <option value="A3.3. Món mong muốn">A3.3. Món mong muốn</option>
              </select>
            }
            bodyClassName="p-0"
          >
            {openVerbatims.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có ý kiến đóng góp tự luận nào trong tập dữ liệu đang lọc.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2 px-4 w-28">Mã phiếu</th>
                      <th className="py-2 px-3 w-28">Ngày</th>
                      <th className="py-2 px-3 w-40">Điểm khảo sát</th>
                      <th className="py-2 px-3 w-44">Câu hỏi</th>
                      <th className="py-2 px-4">Nội dung phản hồi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {openVerbatims
                      .filter(
                        (v) => verbatimFilterTag === 'ALL' || v.tag === verbatimFilterTag
                      )
                      .slice(0, 60)
                      .map((item, idx) => (
                        <tr
                          key={`${item.surveyCode}-${idx}`}
                          onClick={() =>
                            setDrilldown({
                              title: `Phiếu ${item.surveyCode}`,
                              subtitle: `${item.locationName} · ${item.date}`,
                              items: [item.response],
                            })
                          }
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-2 px-4 font-mono text-[11px] font-semibold text-slate-800 whitespace-nowrap">
                            {item.surveyCode}
                          </td>
                          <td className="py-2 px-3 tabular-nums text-slate-500 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[160px]">
                            {item.locationName}
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/80">
                              {item.tag}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-slate-800">{item.text}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ==========================================================================
          TAB 5: PHÂN TÁCH ĐA CHIỀU (CROSS-TABULATION) & TRA CỨU TOÀN BỘ CÂU HỎI
         ========================================================================== */}
      {activeSubTab === 'crosstab' && (
        <div className="space-y-4">
          {/* Bảng Cross-Tabulation chuẩn AssetBreakdown.tsx */}
          <SectionCard
            title="Bảng phân tách chỉ số F&B theo chiều phân khúc"
            meta={`n = ${validResponses.length} phiếu hợp lệ`}
            tone="ocean"
            actions={
              <SegmentedToggle
                value={crossTabDim}
                onChange={setCrossTabDim}
                options={[
                  { value: 'market_group', label: 'Nội địa / Quốc tế' },
                  { value: 's5_detail', label: 'Quốc tịch (S5)' },
                  { value: 's7_mode', label: 'FIT / Tour (S7)' },
                  { value: 's9_ticket', label: 'Gói vé (S9)' },
                  { value: 's4_age', label: 'Độ tuổi (S4)' },
                  { value: 'location', label: 'Điểm khảo sát' },
                ]}
              />
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-medium">
                    <th className="py-2.5 px-4">Nhóm phân khúc</th>
                    <th className="py-2.5 px-3 text-right tabular-nums">Số phiếu (n)</th>
                    <th className="py-2.5 px-3 text-right tabular-nums">Tỷ lệ dùng F&amp;B</th>
                    <th className="py-2.5 px-3 text-right tabular-nums">Dự kiến TB (A1)</th>
                    <th className="py-2.5 px-3 text-right tabular-nums">Thực tế TB (A4)</th>
                    <th className="py-2.5 px-3 text-right tabular-nums">SERVQUAL TB (B5)</th>
                    <th className="py-2.5 px-4 text-right tabular-nums">Buffet cao (B4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    let groups: { label: string; subset: SurveyResponseData[] }[] = [];
                    if (crossTabDim === 'market_group') {
                      groups = [
                        {
                          label: 'Khách Nội địa (S5 = 1..4)',
                          subset: validResponses.filter((r) => {
                            const s5 = getSingleAnswer(r, 'S5');
                            return s5 !== null && s5 >= 1 && s5 <= 4;
                          }),
                        },
                        {
                          label: 'Khách Quốc tế (S5 ≥ 5)',
                          subset: validResponses.filter((r) => {
                            const s5 = getSingleAnswer(r, 'S5');
                            return s5 !== null && s5 >= 5;
                          }),
                        },
                      ];
                    } else if (crossTabDim === 's5_detail') {
                      groups = qOpts('S5', S5_OPTIONS).map((o) => ({
                        label: `${o.code}. ${o.label}`,
                        subset: validResponses.filter((r) => getSingleAnswer(r, 'S5') === o.code),
                      }));
                    } else if (crossTabDim === 's7_mode') {
                      groups = qOpts('S7', S7_OPTIONS).map((o) => ({
                        label: `${o.code}. ${o.label}`,
                        subset: validResponses.filter((r) => getSingleAnswer(r, 'S7') === o.code),
                      }));
                    } else if (crossTabDim === 's9_ticket') {
                      groups = qOpts('S9', S9_OPTIONS).map((o) => ({
                        label: `${o.code}. ${o.label}`,
                        subset: validResponses.filter((r) => getSingleAnswer(r, 'S9') === o.code),
                      }));
                    } else if (crossTabDim === 's4_age') {
                      groups = qOpts('S4', S4_OPTIONS).map((o) => ({
                        label: `${o.code}. ${o.label}`,
                        subset: validResponses.filter((r) => getSingleAnswer(r, 'S4') === o.code),
                      }));
                    } else if (crossTabDim === 'location') {
                      groups = config.locations.map((loc) => ({
                        label: loc.name,
                        subset: validResponses.filter((r) => r.locationId === loc.id),
                      }));
                    }

                    return groups.map((g, idx) => {
                      const m = computeSubsetMetrics(g.subset);
                      const sharePct =
                        validResponses.length > 0
                          ? Math.round((m.count / validResponses.length) * 100)
                          : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-4 font-medium text-slate-800">{g.label}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            {m.count > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setDrilldown({
                                    title: `Phân khúc: ${g.label}`,
                                    subtitle: `${m.count} phiếu hợp lệ`,
                                    items: g.subset,
                                  })
                                }
                                className="font-semibold text-slate-900 hover:text-[#d12f2f] hover:underline cursor-pointer"
                              >
                                {m.count}
                              </button>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}{' '}
                            <span className="text-slate-400">({sharePct}%)</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-emerald-700">
                            {m.count > 0 ? `${m.fnbPct}%` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                            {m.avgA1 > 0 ? `~${m.avgA1}k` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-[#d12f2f]">
                            {m.avgA4 > 0 ? `~${m.avgA4}k` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-slate-900">
                            {m.b5Mean > 0 ? m.b5Mean.toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-4 text-right tabular-nums text-rose-600">
                            {m.count > 0 ? `${m.buffetExpensivePct}%` : '—'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Tra cứu toàn bộ câu hỏi khảo sát (kể cả câu hỏi mới do Admin thêm) */}
          <SectionCard
            title="Danh mục thống kê chi tiết toàn bộ câu hỏi khảo sát"
            meta={`${allConfiguredQuestions.length} câu hỏi`}
            tone="iris"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    placeholder="Tìm mã hoặc nội dung câu hỏi..."
                    className="h-7 pl-8 pr-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <SegmentedToggle
                  value={explorerSection}
                  onChange={setExplorerSection}
                  options={[
                    { value: 'ALL', label: 'Tất cả' },
                    { value: 'S', label: 'Phần S' },
                    { value: 'A', label: 'Phần A' },
                    { value: 'B', label: 'Phần B' },
                    { value: 'C', label: 'Phần C' },
                  ]}
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allConfiguredQuestions
                .filter((q) => {
                  if (
                    explorerSection !== 'ALL' &&
                    q.section !== (`PHẦN ${explorerSection}` as const)
                  ) {
                    return false;
                  }
                  if (explorerSearch.trim()) {
                    const kw = explorerSearch.toLowerCase();
                    if (
                      !q.key.toLowerCase().includes(kw) &&
                      !q.title.toLowerCase().includes(kw)
                    ) {
                      return false;
                    }
                  }
                  return true;
                })
                .map((q) => {
                  if (q.type === 'likert') {
                    const { rows } = computeLikertMatrixStats(validResponses, q.key);
                    return (
                      <div
                        key={q.key}
                        className="lg:col-span-2 rounded-lg border border-slate-200/80 p-3.5 bg-slate-50/40"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700 border border-slate-200">
                              {q.key}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {q.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500">
                            Thang Likert 5 mức ({rows.length} dòng)
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {rows.map((r) => (
                            <div
                              key={r.code}
                              className="rounded-lg border border-slate-200/80 bg-white p-2.5 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-mono text-[11px] text-slate-400 mr-1">
                                  {r.displayCode}
                                </span>
                                <span className="font-medium text-slate-700 truncate block">
                                  {r.label}
                                </span>
                              </div>
                              <div className="text-right shrink-0 tabular-nums">
                                <div className="font-semibold text-slate-900">
                                  TB: {r.mean.toFixed(2)}
                                </div>
                                <div className="text-[11px] text-emerald-700">
                                  Mức 4+5: {r.top2Pct}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  if (q.type === 'text') {
                    const texts = validResponses
                      .map((r) => ({
                        code: r.surveyCode,
                        txt: getTextAnswer(r, q.key).trim(),
                      }))
                      .filter((x) => Boolean(x.txt));
                    return (
                      <div
                        key={q.key}
                        className="rounded-lg border border-slate-200/80 p-3.5 bg-white"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700">
                              {q.key}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 truncate">
                              {q.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 shrink-0 tabular-nums">
                            {texts.length} phản hồi
                          </span>
                        </div>
                        {texts.length === 0 ? (
                          <div className="text-xs text-slate-400 py-3">
                            Chưa có câu trả lời tự luận
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                            {texts.slice(0, 12).map((item, i) => (
                              <div
                                key={i}
                                className="flex items-baseline gap-2 py-1 border-b border-slate-100 last:border-b-0"
                              >
                                <span className="font-mono text-[11px] text-slate-400 shrink-0">
                                  {item.code}:
                                </span>
                                <span className="text-slate-700">{item.txt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (q.key === 'A5' || q.key === 'B4') {
                    return null;
                  }

                  const items =
                    q.type === 'multi'
                      ? buildMultiBreakdown(validResponses, q.key, q.title, q.options, true)
                      : buildSingleBreakdown(validResponses, q.key, q.title, q.options, false);

                  return (
                    <div
                      key={q.key}
                      className="rounded-lg border border-slate-200/80 p-3.5 bg-white"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-700 shrink-0">
                            {q.key}
                          </span>
                          <span
                            className="text-xs font-semibold text-slate-900 truncate"
                            title={q.title}
                          >
                            {q.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {q.type === 'multi' ? 'Chọn nhiều' : 'Chọn 1'}
                        </span>
                      </div>
                      <ProportionBreakdown items={items} showCodePrefix />
                    </div>
                  );
                })}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ==========================================================================
          DRILLDOWN MODAL (Chuẩn Reports.tsx trong PKT_Payment)
         ========================================================================== */}
      <AnimatePresence>
        {drilldown && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4"
            onClick={() => setDrilldown(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-4xl w-full max-h-[82vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-100/80 px-4 py-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {drilldown.title}
                  </h3>
                  {drilldown.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      {drilldown.subtitle}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canExport && drilldown.items.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => exportResponsesToCsv(drilldown.items, exportOptions)}
                        className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        CSV ({drilldown.items.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => exportResponsesToExcel(drilldown.items, exportOptions)}
                        className="h-7 px-2.5 rounded-lg bg-[#d12f2f] hover:bg-[#b82626] text-xs font-medium text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FileSpreadsheet className="h-3 w-3" />
                        Excel ({drilldown.items.length})
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setDrilldown(null)}
                    className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Mã phiếu</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                      <th className="py-2.5 px-3">Điểm khảo sát &amp; PVV</th>
                      <th className="py-2.5 px-3">Thị trường (S5)</th>
                      <th className="py-2.5 px-3">Hình thức (S7)</th>
                      <th className="py-2.5 px-4 text-right">Dự kiến (A1) / Thực tế (A4)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {drilldown.items.map((r) => {
                      const locName =
                        config.locations.find((l) => l.id === r.locationId)?.name ||
                        `Điểm #${r.locationId}`;
                      const s5Label =
                        qOpts('S5', S5_OPTIONS).find((o) => o.code === r.S5)?.label || '—';
                      const s7Label =
                        qOpts('S7', S7_OPTIONS).find((o) => o.code === r.S7)?.label || '—';
                      const a1Label =
                        qOpts('A1', A1_OPTIONS).find((o) => o.code === r.A1)?.label || '—';
                      const a4Label = r.A2.includes(7)
                        ? 'Chưa dùng F&B'
                        : qOpts('A4', A4_OPTIONS).find((o) => o.code === r.A4)?.label || '—';

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80">
                          <td className="py-2 px-4 font-mono text-[11px] font-semibold text-slate-900 whitespace-nowrap">
                            {r.surveyCode}
                          </td>
                          <td className="py-2 px-3 tabular-nums text-slate-500 whitespace-nowrap">
                            {r.surveyDate} · {r.startTime?.slice(0, 5)}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-medium text-slate-800">{locName}</div>
                            <div className="text-[11px] text-slate-400">{r.interviewerName}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-700">{s5Label}</td>
                          <td className="py-2 px-3 text-slate-600">{s7Label}</td>
                          <td className="py-2 px-4 text-right tabular-nums">
                            <div className="text-slate-600">A1: {a1Label}</div>
                            <div className="font-medium text-slate-900">A4: {a4Label}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
