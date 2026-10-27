import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Lock,
  RotateCcw,
  Globe,
} from 'lucide-react';
import {
  SurveyResponseData,
  A5_ROWS,
  A5_COLUMNS,
  B4_ROWS,
  B5_ITEMS,
  OptionItem,
} from '../data/surveySchema';
import {
  SurveySystemConfig,
  QuestionKey,
  ConfigurableOptionItem,
} from '../services/surveyConfig';

interface SurveyWizardProps {
  config: SurveySystemConfig;
  formData: SurveyResponseData;
  setFormData: React.Dispatch<React.SetStateAction<SurveyResponseData>>;
  stepIndex: number;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  bilingual: boolean;
  setBilingual: React.Dispatch<React.SetStateAction<boolean>>;
  elapsedSeconds: number;
  onStartTimer: () => void;
  onSubmitSurvey: (finalData: SurveyResponseData) => Promise<{ synced: boolean }>;
  onStartNewSurvey: () => void;
}

const STEPS = [
  { id: 0, code: 'PHẦN S', title: 'Sàng lọc' },
  { id: 1, code: 'A1–A2', title: 'Dự kiến & Sử dụng' },
  { id: 2, code: 'A3–A8', title: 'Thực tế / Lý do' },
  { id: 3, code: 'PHẦN B', title: 'Đánh giá & Giá' },
  { id: 4, code: 'PHẦN C', title: 'Nhu cầu mới' },
];

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  config,
  formData,
  setFormData,
  stepIndex,
  setStepIndex,
  bilingual,
  setBilingual,
  elapsedSeconds,
  onStartTimer,
  onSubmitSurvey,
  onStartNewSurvey,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [submittedState, setSubmittedState] = useState<{
    done: boolean;
    synced: boolean;
    isScreenout: boolean;
  } | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const safeStep = Math.min(Math.max(stepIndex, 0), STEPS.length - 1);
  const activeLocations = config.locations.filter((l) => l.active !== false);

  const getQ = (k: QuestionKey) => config.questions[k];
  const getVisibleOpts = (k: QuestionKey): ConfigurableOptionItem[] =>
    (config.questions[k]?.options || []).filter((o) => !o.hidden);

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Kiểm tra điều kiện dừng phỏng vấn (Screen-out) động từ cấu hình Phần S
  const detectScreenoutReason = (): string | null => {
    const sKeys: QuestionKey[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];
    for (const k of sKeys) {
      const val = formData[k] as number | null;
      if (val !== null) {
        const matched = config.questions[k]?.options.find((o) => o.code === val);
        if (matched?.stopInterview) {
          return `${k}: ${matched.label}`;
        }
      }
    }
    return null;
  };

  const screenoutReason = detectScreenoutReason();

  // Kiểm tra nhánh chưa dùng F&B (A2 chọn đáp án exclusive hoặc mã 7)
  const a2ExclusiveCodes = getVisibleOpts('A2')
    .filter((o) => o.exclusive || o.code === 7)
    .map((o) => o.code);
  const isNotUsedFnB = formData.A2.some((c) => a2ExclusiveCodes.includes(c));

  const activeA5Rows = A5_ROWS.filter((r) => formData.A2.includes(r.a2Code));

  const updateField = <K extends keyof SurveyResponseData>(
    key: K,
    val: SurveyResponseData[K]
  ) => {
    onStartTimer();
    setStepError(null);
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const toggleMultiOption = (
    key: 'A2' | 'A3' | 'A6' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3',
    option: OptionItem,
    maxSelect?: number
  ) => {
    onStartTimer();
    setStepError(null);
    setFormData((prev) => {
      const current = prev[key] as number[];
      const exists = current.includes(option.code);

      if (exists) {
        return { ...prev, [key]: current.filter((c) => c !== option.code) };
      }

      if (option.exclusive) {
        return { ...prev, [key]: [option.code] };
      }

      const allOpts = config.questions[key]?.options || [];
      const exclusiveCodes = allOpts.filter((o) => o.exclusive).map((o) => o.code);
      const cleaned = current.filter((c) => !exclusiveCodes.includes(c));

      if (maxSelect && maxSelect > 0 && cleaned.length >= maxSelect) {
        return prev;
      }

      return { ...prev, [key]: [...cleaned, option.code] };
    });
  };

  const validateCurrentStep = (): string | null => {
    if (safeStep === 0) {
      if (!formData.S1 || !formData.S2 || !formData.S3 || !formData.S4) {
        return 'Vui lòng chọn đủ S1, S2, S3, S4.';
      }
      if (!formData.S5 || !formData.S6 || !formData.S7 || !formData.S8 || !formData.S9) {
        return 'Vui lòng chọn đủ S5 đến S9.';
      }
    }
    if (safeStep === 1) {
      if (!formData.A1) return 'Vui lòng chọn câu A1 (Chi dự kiến).';
      if (formData.A2.length === 0) return 'Vui lòng chọn ít nhất 1 mục tại câu A2.';
    }
    if (safeStep === 2) {
      if (isNotUsedFnB) {
        if (formData.A3.length === 0) return 'Vui lòng chọn lý do chưa dùng F&B (A3).';
        if (!formData.A3_4) return 'Vui lòng chọn khả năng sử dụng nếu khắc phục (A3.4).';
      } else {
        if (!formData.A4) return 'Vui lòng chọn mức chi thực tế (A4).';
        if (formData.A6.length === 0) return 'Vui lòng chọn yếu tố ảnh hưởng (A6).';
        if (!formData.A7) return 'Vui lòng chọn nhu cầu chi tiêu thêm (A7).';
        if ((formData.A7 === 1 || formData.A7 === 2) && !formData.A8) {
          return 'Vui lòng chọn mức dự kiến chi thêm (A8).';
        }
      }
    }
    if (safeStep === 3) {
      if (formData.B1.length === 0) return 'Vui lòng chọn loại ẩm thực yêu thích (B1).';
      if (formData.B2.length === 0) return 'Vui lòng chọn yêu cầu chế độ ăn (B2).';
      if (!formData.B3_1 || !formData.B3_2 || !formData.B3_3) {
        return 'Vui lòng chọn đủ B3.1, B3.2, B3.3.';
      }
    }
    if (safeStep === 4) {
      if (formData.C1.length === 0) return 'Vui lòng chọn mong muốn cải thiện (C1).';
      if (formData.C2.length === 0) return 'Vui lòng chọn dịch vụ ăn kèm giải trí (C2).';
      if (formData.C3.length === 0) return 'Vui lòng chọn sản phẩm mua mang về (C3).';
    }
    return null;
  };

  const handleNextStep = () => {
    const err = validateCurrentStep();
    if (err) {
      setStepError(err);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (safeStep === 1 && !formData.A1_locked) {
      setFormData((prev) => ({ ...prev, A1_locked: true }));
    }
    setStepError(null);
    setStepIndex(Math.min(safeStep + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStepError(null);
    setStepIndex(Math.max(safeStep - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async (asScreenout = false) => {
    if (!asScreenout) {
      const err = validateCurrentStep();
      if (err) {
        setStepError(err);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setSubmitting(true);
    try {
      const now = new Date();
      const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const payload: SurveyResponseData = {
        ...formData,
        endTime,
        durationSeconds: Math.max(elapsedSeconds, 10),
        status: asScreenout ? 'screenout' : 'completed',
        screenoutReason: asScreenout ? screenoutReason || 'Dừng sàng lọc' : undefined,
      };
      const res = await onSubmitSurvey(payload);
      setSubmittedState({
        done: true,
        synced: res.synced,
        isScreenout: asScreenout,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedState?.done) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs text-center space-y-4 my-4">
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
            submittedState.isScreenout
              ? 'bg-amber-50 text-amber-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {submittedState.isScreenout ? (
            <AlertOctagon className="w-7 h-7" />
          ) : (
            <CheckCircle2 className="w-7 h-7" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {submittedState.isScreenout ? 'Đã ghi nhận dừng sàng lọc' : 'Đã lưu phiếu khảo sát'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mã phiếu: <strong className="text-slate-800">{formData.surveyCode}</strong> •{' '}
            {submittedState.synced ? 'Đã đồng bộ Cloud' : 'Đã lưu trên máy (chờ đồng bộ)'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubmittedState(null);
            onStartNewSurvey();
          }}
          className="w-full py-3.5 rounded-2xl bg-[#d12f2f] hover:bg-[#b82626] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Tạo phiếu khảo sát mới
        </button>
      </div>
    );
  }

  const renderSingleQuestion = (
    qKey: QuestionKey,
    currentVal: number | null,
    onSelect: (code: number) => void,
    disabled = false
  ) => {
    const q = getQ(qKey);
    const opts = getVisibleOpts(qKey);
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
        <div>
          <div className="text-sm font-semibold text-slate-900">{q.title}</div>
          {bilingual && <div className="text-xs text-slate-400 mt-0.5">{q.enTitle}</div>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {opts.map((opt) => {
            const active = currentVal === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(opt.code)}
                className={`px-3.5 py-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer disabled:opacity-60 ${
                  active
                    ? 'bg-red-50/90 border-[#d12f2f] text-slate-900 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/90 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    active
                      ? 'bg-[#d12f2f] text-white'
                      : 'bg-white border border-slate-300 text-slate-500'
                  }`}
                >
                  {opt.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium leading-snug">{opt.label}</span>
                  {bilingual && (
                    <span className="block text-[11px] text-slate-400 leading-tight mt-0.5">
                      {opt.en}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMultiQuestion = (
    qKey: 'A2' | 'A3' | 'A6' | 'B1' | 'B2' | 'C1' | 'C2' | 'C3',
    selectedCodes: number[]
  ) => {
    const q = getQ(qKey);
    const opts = getVisibleOpts(qKey);
    const maxSel = q.maxSelect || 0;
    const badge = maxSel > 0 ? `Tối đa ${maxSel}` : 'Chọn nhiều';
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-slate-900">{q.title}</div>
            {bilingual && <div className="text-xs text-slate-400 mt-0.5">{q.enTitle}</div>}
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold shrink-0">
            {badge}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {opts.map((opt) => {
            const active = selectedCodes.includes(opt.code);
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => toggleMultiOption(qKey, opt, maxSel)}
                className={`px-3.5 py-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                  active
                    ? 'bg-red-50/90 border-[#d12f2f] text-slate-900 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200/90 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                    active
                      ? 'bg-[#d12f2f] text-white'
                      : 'bg-white border border-slate-300 text-slate-500'
                  }`}
                >
                  {opt.code}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium leading-snug">{opt.label}</span>
                  {bilingual && (
                    <span className="block text-[11px] text-slate-400 leading-tight mt-0.5">
                      {opt.en}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3.5 pb-16">
      {/* Compact Metadata Strip */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#d12f2f] shrink-0" />
          <select
            value={formData.locationId}
            onChange={(e) => updateField('locationId', Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
          >
            {activeLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          <span className="text-xs font-mono font-semibold text-slate-500 hidden sm:inline">
            #{formData.surveyCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {formatTimer(elapsedSeconds)}
          </span>
          <button
            type="button"
            onClick={() => setBilingual(!bilingual)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border transition cursor-pointer ${
              bilingual
                ? 'bg-red-50 text-[#d12f2f] border-red-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {bilingual ? 'Song ngữ VI/EN' : 'Chỉ Tiếng Việt'}
          </button>
        </div>
      </div>

      {/* Stepper Pills */}
      <div className="grid grid-cols-5 gap-1.5">
        {STEPS.map((st, idx) => {
          const active = idx === safeStep;
          const done = idx < safeStep;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                if (idx <= safeStep) {
                  setStepError(null);
                  setStepIndex(idx);
                }
              }}
              className={`py-2 px-1.5 rounded-xl border text-center transition cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : done
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider">{st.code}</div>
              <div className="text-[11px] font-medium truncate hidden sm:block">{st.title}</div>
            </button>
          );
        })}
      </div>

      {stepError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{stepError}</span>
        </div>
      )}

      {screenoutReason && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-amber-900">
            <strong className="block text-sm font-bold">Không thuộc đối tượng khảo sát</strong>
            <span>{screenoutReason} — Cảm ơn du khách và kết thúc phỏng vấn.</span>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleFinish(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            Lưu Screen-out &amp; Kết thúc
          </button>
        </div>
      )}

      {/* ==================== BƯỚC 0: PHẦN S ==================== */}
      {safeStep === 0 && (
        <div className="space-y-3">
          {renderSingleQuestion('S1', formData.S1, (c) => updateField('S1', c))}
          {renderSingleQuestion('S2', formData.S2, (c) => updateField('S2', c))}
          {renderSingleQuestion('S3', formData.S3, (c) => updateField('S3', c))}
          {renderSingleQuestion('S4', formData.S4, (c) => updateField('S4', c))}
          {renderSingleQuestion('S5', formData.S5, (c) => updateField('S5', c))}
          {formData.S5 === 10 && (
            <input
              type="text"
              value={formData.S5_other}
              onChange={(e) => updateField('S5_other', e.target.value)}
              placeholder="Ghi rõ quốc tịch khác..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
            />
          )}
          {renderSingleQuestion('S6', formData.S6, (c) => updateField('S6', c))}
          {renderSingleQuestion('S7', formData.S7, (c) => updateField('S7', c))}
          {renderSingleQuestion('S8', formData.S8, (c) => updateField('S8', c))}
          {renderSingleQuestion('S9', formData.S9, (c) => updateField('S9', c))}
        </div>
      )}

      {/* ==================== BƯỚC 1: PHẦN A1–A2 ==================== */}
      {safeStep === 1 && (
        <div className="space-y-3">
          {formData.A1_locked && (
            <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Câu A1 đã khóa để giữ phản xạ ngân sách đầu tiên
              </span>
              <button
                type="button"
                onClick={() => updateField('A1_locked', false)}
                className="text-[#d12f2f] font-semibold underline cursor-pointer"
              >
                Mở khóa sửa
              </button>
            </div>
          )}

          {renderSingleQuestion(
            'A1',
            formData.A1,
            (c) => updateField('A1', c),
            formData.A1_locked
          )}
          {renderMultiQuestion('A2', formData.A2)}
        </div>
      )}

      {/* ==================== BƯỚC 2: PHẦN A3 HOẶC A4–A8 ==================== */}
      {safeStep === 2 && (
        <div className="space-y-3">
          {isNotUsedFnB ? (
            <>
              {renderMultiQuestion('A3', formData.A3)}

              {formData.A3.includes(1) && (
                <input
                  type="text"
                  value={formData.A3_1}
                  onChange={(e) => updateField('A3_1', e.target.value)}
                  placeholder="A3.1. Anh/Chị đã ăn ở đâu trước khi lên Bà Nà?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
                />
              )}

              {formData.A3.includes(3) && (
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.A3_2}
                  onChange={(e) => updateField('A3_2', e.target.value)}
                  placeholder="A3.2. Mức giá hợp lý sẵn sàng chi (VNĐ/người)?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
                />
              )}

              {(formData.A3.includes(4) ||
                formData.A3.includes(5) ||
                formData.A3.includes(6) ||
                formData.A3.includes(7)) && (
                <input
                  type="text"
                  value={formData.A3_3}
                  onChange={(e) => updateField('A3_3', e.target.value)}
                  placeholder="A3.3. Món ăn hoặc dịch vụ mong muốn có thêm?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm"
                />
              )}

              {renderSingleQuestion('A3_4', formData.A3_4, (c) => updateField('A3_4', c))}
            </>
          ) : (
            <>
              {renderSingleQuestion('A4', formData.A4, (c) => updateField('A4', c))}

              {(formData.A4 === 8 ||
                formData.S9 === 2 ||
                formData.S9 === 3 ||
                formData.S9 === 4) &&
                renderSingleQuestion('A4_1', formData.A4_1, (c) => updateField('A4_1', c))}

              {activeA5Rows.length > 0 && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
                  <div className="text-sm font-semibold text-slate-900">
                    A5. Mức chi theo từng loại hình đã dùng (1 người)
                  </div>
                  <div className="space-y-2.5">
                    {activeA5Rows.map((row) => (
                      <div
                        key={row.key}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                      >
                        <div className="text-xs font-semibold text-slate-800">{row.label}</div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                          {A5_COLUMNS.map((col) => {
                            const active = formData.A5[row.key] === col.code;
                            return (
                              <button
                                key={col.code}
                                type="button"
                                onClick={() =>
                                  updateField('A5', { ...formData.A5, [row.key]: col.code })
                                }
                                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                                  active
                                    ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                {col.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderMultiQuestion('A6', formData.A6)}
              {renderSingleQuestion('A7', formData.A7, (c) => updateField('A7', c))}

              {(formData.A7 === 1 || formData.A7 === 2) &&
                renderSingleQuestion('A8', formData.A8, (c) => updateField('A8', c))}
            </>
          )}
        </div>
      )}

      {/* ==================== BƯỚC 3: PHẦN B ==================== */}
      {safeStep === 3 && (
        <div className="space-y-3">
          {renderMultiQuestion('B1', formData.B1)}
          {renderMultiQuestion('B2', formData.B2)}
          {renderSingleQuestion('B3_1', formData.B3_1, (c) => updateField('B3_1', c))}
          {renderSingleQuestion('B3_2', formData.B3_2, (c) => updateField('B3_2', c))}
          {renderSingleQuestion('B3_3', formData.B3_3, (c) => updateField('B3_3', c))}

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
            <div className="text-sm font-semibold text-slate-900">
              B4. Cảm nhận mức giá hiện tại (1: Đắt • 2: Hợp lý • 3: Rẻ)
            </div>
            <div className="space-y-2">
              {B4_ROWS.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <span className="text-xs font-medium text-slate-800">{row.label}</span>
                  <div className="grid grid-cols-3 gap-1.5 shrink-0">
                    {[
                      { code: 1, label: '1. Đắt' },
                      { code: 2, label: '2. Hợp lý' },
                      { code: 3, label: '3. Rẻ' },
                    ].map((opt) => {
                      const active = formData.B4[row.key] === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() =>
                            updateField('B4', { ...formData.B4, [row.key]: opt.code })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            active
                              ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isNotUsedFnB && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
              <div className="text-sm font-semibold text-slate-900">
                B5. Mức độ hài lòng (1: Rất tệ → 5: Rất hài lòng)
              </div>
              <div className="space-y-2">
                {B5_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <span className="text-xs font-medium text-slate-800">{item.label}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const active = formData.B5[item.key] === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() =>
                              updateField('B5', { ...formData.B5, [item.key]: score })
                            }
                            className={`w-9 h-8 rounded-lg text-xs font-bold border transition cursor-pointer ${
                              active
                                ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {score}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== BƯỚC 4: PHẦN C ==================== */}
      {safeStep === 4 && (
        <div className="space-y-3">
          {renderMultiQuestion('C1', formData.C1)}
          {renderMultiQuestion('C2', formData.C2)}
          {renderMultiQuestion('C3', formData.C3)}

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
            <label className="block text-sm font-semibold text-slate-900">
              Ghi chú ý kiến mở &amp; Chọn quà tặng
            </label>
            <input
              type="text"
              value={formData.C4_note}
              onChange={(e) => updateField('C4_note', e.target.value)}
              placeholder="Ghi ngắn gọn ý kiến thêm của du khách (nếu có)..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm"
            />
            <select
              value={formData.giftName}
              onChange={(e) => updateField('giftName', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
            >
              {config.giftPresets.map((g) => (
                <option key={g} value={g}>
                  Quà tặng: {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={safeStep === 0}
          className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại
        </button>

        {safeStep < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <span>Tiếp tục ({STEPS[safeStep + 1].code})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={() => void handleFinish(false)}
            className="flex-1 py-3 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{submitting ? 'Đang lưu...' : 'Hoàn thành & Lưu phiếu'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
