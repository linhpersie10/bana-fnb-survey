import React, { useState, useEffect } from 'react';
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
  CornerDownRight,
} from 'lucide-react';
import {
  SurveyResponseData,
  A5_ROWS,
  A5_COLUMNS,
  B4_ROWS,
  B5_ITEMS,
  OptionItem,
  getSingleAnswer,
  getMultiAnswer,
  getTextAnswer,
  getOtherInputAnswer,
  setSingleAnswer,
  setMultiAnswer,
  setTextAnswer,
  setOtherInputAnswer,
} from '../data/surveySchema';
import {
  SurveySystemConfig,
  QuestionConfigItem,
  ConfigurableOptionItem,
  getDefaultLikert5Options,
} from '../services/surveyConfig';
import {
  SurveyLanguage,
  SURVEY_LANGUAGES,
  translateVi,
  prewarmSurveyTranslations,
  subscribeToAutoTranslations,
} from '../services/autoTranslate';

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

const SAVED_LANG_KEY = 'banafi_fnb_selected_survey_lang_v1';

function getInitialLanguage(): SurveyLanguage {
  try {
    const saved = localStorage.getItem(SAVED_LANG_KEY) as SurveyLanguage | null;
    if (saved && SURVEY_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'en';
}

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
  config,
  formData,
  setFormData,
  stepIndex,
  setStepIndex,
  elapsedSeconds,
  onStartTimer,
  onSubmitSurvey,
  onStartNewSurvey,
}) => {
  const [selectedLang, setSelectedLang] = useState<SurveyLanguage>(() => getInitialLanguage());
  const [, setTranslationTick] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submittedState, setSubmittedState] = useState<{
    done: boolean;
    synced: boolean;
    isScreenout: boolean;
  } | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const isForeignLang = selectedLang !== 'vi';

  // Lắng nghe cập nhật dịch tự động cho các câu hỏi/đáp án mới do Admin thêm bằng Tiếng Việt
  useEffect(() => {
    return subscribeToAutoTranslations(() => {
      setTranslationTick((t) => t + 1);
    });
  }, []);

  // Tự động dịch trước toàn bộ câu hỏi và đáp án sang ngôn ngữ đang chọn
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_LANG_KEY, selectedLang);
    } catch {
      // ignore
    }
    if (selectedLang === 'vi') return;
    const texts: string[] = [];
    Object.values(config.questions).forEach((q) => {
      if (q.title) texts.push(q.title);
      if (q.placeholder) texts.push(q.placeholder);
      (q.options || []).forEach((o) => {
        if (o.label) texts.push(o.label);
      });
    });
    prewarmSurveyTranslations(texts, selectedLang);
  }, [config.questions, selectedLang]);

  const safeStep = Math.min(Math.max(stepIndex, 0), STEPS.length - 1);
  const activeLocations = config.locations.filter((l) => l.active !== false);

  const orderedQuestions = config.questionOrder
    .map((k) => config.questions[k])
    .filter((q): q is QuestionConfigItem => Boolean(q && !q.hidden));

  const getVisibleOpts = (q: QuestionConfigItem): ConfigurableOptionItem[] => {
    if (q.type === 'likert' && (!q.options || q.options.length === 0)) {
      return getDefaultLikert5Options();
    }
    return (q.options || []).filter((o) => !o.hidden);
  };

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Lấy danh sách mã đáp án đang được chọn của một câu hỏi bất kỳ (single, likert, multi)
  const getSelectedCodesForQuestion = (q: QuestionConfigItem): number[] => {
    if (q.type === 'single' || q.type === 'likert') {
      const val = getSingleAnswer(formData, q.key);
      return val !== null ? [val] : [];
    }
    if (q.type === 'multi') {
      return getMultiAnswer(formData, q.key);
    }
    return [];
  };

  // Tìm các câu hỏi con được kích hoạt khi người trả lời chọn đáp án của câu hỏi cha `parentQ`
  const getTriggeredSubQuestions = (
    parentQ: QuestionConfigItem,
    visited = new Set<string>()
  ): { childQ: QuestionConfigItem; triggerLabels: string[] }[] => {
    const selectedCodes = getSelectedCodesForQuestion(parentQ);
    const results: { childQ: QuestionConfigItem; triggerLabels: string[] }[] = [];
    const seenChildKeys = new Set<string>();

    orderedQuestions.forEach((candidate) => {
      if (candidate.key === parentQ.key || visited.has(candidate.key)) return;

      const matchedOpts: ConfigurableOptionItem[] = [];

      parentQ.options.forEach((opt) => {
        if (!selectedCodes.includes(opt.code)) return;
        const matchByOpt = opt.subQuestionKey === candidate.key;
        const matchByParentInfo =
          candidate.parentInfo?.parentQuestionKey === parentQ.key &&
          candidate.parentInfo.triggerOptionCodes.includes(opt.code);
        if (matchByOpt || matchByParentInfo) {
          matchedOpts.push(opt);
        }
      });

      if (
        parentQ.key === 'A4' &&
        candidate.key === 'A4_1' &&
        matchedOpts.length === 0 &&
        selectedCodes.length > 0 &&
        (formData.S9 === 2 || formData.S9 === 3 || formData.S9 === 4)
      ) {
        results.push({
          childQ: candidate,
          triggerLabels: ['Vé Combo / Tour (S9)'],
        });
        seenChildKeys.add(candidate.key);
        return;
      }

      if (matchedOpts.length > 0 && !seenChildKeys.has(candidate.key)) {
        seenChildKeys.add(candidate.key);
        results.push({
          childQ: candidate,
          triggerLabels: matchedOpts.map((o) => o.label),
        });
      }
    });

    return results;
  };

  // Kiểm tra điều kiện dừng phỏng vấn (Screen-out) động trên mọi câu hỏi đang hiển thị
  const detectScreenoutReason = (): string | null => {
    for (const q of orderedQuestions) {
      const codes = getSelectedCodesForQuestion(q);
      for (const c of codes) {
        const matched = q.options.find((o) => o.code === c);
        if (matched?.stopInterview) {
          return `${q.key}: ${matched.label}`;
        }
      }
    }
    return null;
  };

  const screenoutReason = detectScreenoutReason();

  // Kiểm tra nhánh chưa dùng F&B (A2 chọn đáp án exclusive hoặc mã 7)
  const a2Question = config.questions['A2'];
  const a2ExclusiveCodes = (a2Question?.options || [])
    .filter((o) => !o.hidden && (o.exclusive || o.code === 7))
    .map((o) => o.code);
  const a2Selected = getMultiAnswer(formData, 'A2');
  const isNotUsedFnB = a2Selected.some((c) => a2ExclusiveCodes.includes(c));

  const activeA5Rows = A5_ROWS.filter((r) => a2Selected.includes(r.a2Code));

  // Phân loại câu hỏi chính (không phải câu hỏi con) cho từng bước (Step 0 -> Step 4)
  const getTopLevelQuestionsForStep = (step: number): QuestionConfigItem[] => {
    return orderedQuestions.filter((q) => {
      if (
        q.parentInfo?.parentQuestionKey &&
        config.questions[q.parentInfo.parentQuestionKey] &&
        !config.questions[q.parentInfo.parentQuestionKey].hidden
      ) {
        return false;
      }

      if (step === 0) return q.section === 'PHẦN S';
      if (step === 1) {
        if (q.section !== 'PHẦN A') return false;
        return q.branch === 'A1_A2' || q.key === 'A1' || q.key === 'A2';
      }
      if (step === 2) {
        if (q.section !== 'PHẦN A') return false;
        if (q.branch === 'A1_A2' || q.key === 'A1' || q.key === 'A2') return false;
        if (isNotUsedFnB) {
          return (
            q.branch === 'A_NOT_USED' ||
            q.branch === 'ALL' ||
            q.key === 'A3' ||
            q.key === 'A3_4'
          );
        }
        return (
          q.branch === 'A_USED' ||
          q.branch === 'ALL' ||
          (!q.branch && q.key !== 'A3' && q.key !== 'A3_4')
        );
      }
      if (step === 3) return q.section === 'PHẦN B';
      if (step === 4) return q.section === 'PHẦN C';
      return false;
    });
  };

  const updateField = <K extends keyof SurveyResponseData>(
    key: K,
    val: SurveyResponseData[K]
  ) => {
    onStartTimer();
    setStepError(null);
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSelectSingle = (q: QuestionConfigItem, code: number) => {
    onStartTimer();
    setStepError(null);
    setFormData((prev) => setSingleAnswer(prev, q.key, code));
  };

  const handleToggleMulti = (q: QuestionConfigItem, option: OptionItem) => {
    onStartTimer();
    setStepError(null);
    const maxSelect = q.maxSelect || 0;
    setFormData((prev) => {
      const current = getMultiAnswer(prev, q.key);
      const exists = current.includes(option.code);

      if (exists) {
        return setMultiAnswer(
          prev,
          q.key,
          current.filter((c) => c !== option.code)
        );
      }

      if (option.exclusive) {
        return setMultiAnswer(prev, q.key, [option.code]);
      }

      const exclusiveCodes = (q.options || [])
        .filter((o) => o.exclusive)
        .map((o) => o.code);
      const cleaned = current.filter((c) => !exclusiveCodes.includes(c));

      if (maxSelect > 0 && cleaned.length >= maxSelect) {
        return prev;
      }

      return setMultiAnswer(prev, q.key, [...cleaned, option.code]);
    });
  };

  const handleTextChange = (q: QuestionConfigItem, val: string) => {
    onStartTimer();
    setStepError(null);
    setFormData((prev) => setTextAnswer(prev, q.key, val));
  };

  const handleOtherInputChange = (qKey: string, val: string) => {
    onStartTimer();
    setStepError(null);
    setFormData((prev) => setOtherInputAnswer(prev, qKey, val));
  };

  const isQuestionAnswered = (q: QuestionConfigItem): boolean => {
    if (q.required === false) return true;
    if (q.type === 'single' || q.type === 'likert') {
      return getSingleAnswer(formData, q.key) !== null;
    }
    if (q.type === 'multi') {
      return getMultiAnswer(formData, q.key).length > 0;
    }
    if (q.type === 'text') {
      return getTextAnswer(formData, q.key).trim().length > 0;
    }
    return true;
  };

  const validateQuestionTree = (
    q: QuestionConfigItem,
    visited = new Set<string>()
  ): string | null => {
    if (visited.has(q.key)) return null;
    visited.add(q.key);

    if (!isQuestionAnswered(q)) {
      return `Vui lòng trả lời câu "${q.title}".`;
    }

    const children = getTriggeredSubQuestions(q, visited);
    for (const { childQ } of children) {
      const childErr = validateQuestionTree(childQ, visited);
      if (childErr) return childErr;
    }
    return null;
  };

  const validateCurrentStep = (): string | null => {
    const topQuestions = getTopLevelQuestionsForStep(safeStep);
    for (const q of topQuestions) {
      const err = validateQuestionTree(q);
      if (err) return err;
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

  /**
   * Hiển thị văn bản Song ngữ:
   * - Khi chọn ngôn ngữ (Anh / Ấn / Hàn / Trung / Nga): Ngôn ngữ được chọn hiển thị chính ở trên, Tiếng Việt tham chiếu luôn hiển thị ngay bên dưới.
   * - Khi chọn Tiếng Việt: Hiển thị Tiếng Việt.
   */
  const renderBilingualQuestionTitle = (viTitle: string, fallbackEn?: string) => {
    if (!isForeignLang) {
      return <div className="text-sm font-bold text-slate-900 leading-snug">{viTitle}</div>;
    }
    const primaryTranslated = translateVi(viTitle, selectedLang, fallbackEn);
    return (
      <div className="space-y-0.5">
        <div className="text-sm font-bold text-slate-900 leading-snug">
          {primaryTranslated}
        </div>
        <div className="text-xs font-medium text-slate-500 leading-snug">
          {viTitle}
        </div>
      </div>
    );
  };

  const renderBilingualOptionText = (viLabel: string, fallbackEn?: string, active = false) => {
    if (!isForeignLang) {
      return (
        <span className="block text-[13px] font-semibold leading-snug text-slate-900">
          {viLabel}
        </span>
      );
    }
    const primaryTranslated = translateVi(viLabel, selectedLang, fallbackEn);
    return (
      <span className="min-w-0 flex-1 block space-y-0.5">
        <span
          className={`block text-[13px] font-semibold leading-snug ${
            active ? 'text-slate-950' : 'text-slate-900'
          }`}
        >
          {primaryTranslated}
        </span>
        <span
          className={`block text-[11px] leading-tight ${
            active ? 'text-slate-600 font-medium' : 'text-slate-500'
          }`}
        >
          {viLabel}
        </span>
      </span>
    );
  };

  // Render một câu hỏi bất kỳ (single / multi / likert / text) kèm theo các Câu hỏi con kích hoạt từ đáp án đã chọn
  const renderQuestionBlock = (
    q: QuestionConfigItem,
    visited = new Set<string>(),
    triggerInfo?: string[]
  ): React.ReactNode => {
    if (visited.has(q.key)) return null;
    const nextVisited = new Set(visited);
    nextVisited.add(q.key);

    const opts = getVisibleOpts(q);
    const selectedCodes = getSelectedCodesForQuestion(q);
    const hasSelectedOtherInput = opts.some(
      (o) => o.hasOtherInput && selectedCodes.includes(o.code)
    );
    const triggeredChildren = getTriggeredSubQuestions(q, nextVisited);
    const isLockedA1 = q.key === 'A1' && formData.A1_locked;

    return (
      <div key={q.key} className="space-y-2.5">
        <div
          className={`bg-white rounded-2xl p-4 border space-y-3 ${
            triggerInfo
              ? 'border-red-200/90 bg-red-50/15 shadow-2xs'
              : 'border-slate-200/90'
          }`}
        >
          {triggerInfo && triggerInfo.length > 0 && (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-[#d12f2f] border border-red-200/80 text-[11px] font-semibold">
              <CornerDownRight className="w-3 h-3 shrink-0" />
              <span className="truncate">
                Câu hỏi con khi chọn: {triggerInfo.join(', ')}
              </span>
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              {renderBilingualQuestionTitle(q.title, q.enTitle)}
            </div>
            {q.type === 'multi' && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold shrink-0">
                {q.maxSelect && q.maxSelect > 0 ? `Tối đa ${q.maxSelect}` : 'Chọn nhiều'}
              </span>
            )}
            {q.type === 'likert' && (
              <span className="px-2 py-0.5 rounded-md bg-red-50 text-[#d12f2f] border border-red-200 text-[11px] font-semibold shrink-0">
                Thang 1–5
              </span>
            )}
          </div>

          {q.type === 'text' ? (
            <div className="space-y-1">
              <input
                type="text"
                value={getTextAnswer(formData, q.key)}
                onChange={(e) => handleTextChange(q, e.target.value)}
                placeholder={
                  isForeignLang
                    ? `${translateVi(
                        q.placeholder || 'Nhập câu trả lời của du khách...',
                        selectedLang
                      )} / ${q.placeholder || 'Nhập câu trả lời...'}`
                    : q.placeholder || 'Nhập câu trả lời...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-[#d12f2f]"
              />
            </div>
          ) : q.type === 'likert' ? (
            /* Giao diện Thang đo Likert 5 mức (1 → 5) Song ngữ */
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {opts.map((opt) => {
                const active = selectedCodes.includes(opt.code);
                const primaryLabel = isForeignLang
                  ? translateVi(opt.label, selectedLang, opt.en)
                  : opt.label;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleSelectSingle(q, opt.code)}
                    className={`p-2.5 rounded-xl border text-left sm:text-center transition flex sm:flex-col items-center gap-2.5 sm:gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-red-50 border-[#d12f2f] text-slate-950 shadow-2xs ring-1 ring-[#d12f2f]'
                        : 'bg-slate-50/80 border-slate-200/90 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center shrink-0 transition ${
                        active
                          ? 'bg-[#d12f2f] text-white'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {opt.code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {primaryLabel}
                      </div>
                      {isForeignLang && (
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {opt.label}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {opts.map((opt) => {
                const active = selectedCodes.includes(opt.code);
                return (
                  <button
                    key={opt.code}
                    type="button"
                    disabled={isLockedA1}
                    onClick={() =>
                      q.type === 'single'
                        ? handleSelectSingle(q, opt.code)
                        : handleToggleMulti(q, opt)
                    }
                    className={`px-3.5 py-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer disabled:opacity-60 ${
                      active
                        ? 'bg-red-50/90 border-[#d12f2f] text-slate-900 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200/90 text-slate-700 hover:bg-slate-100/80'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 ${
                        q.type === 'single' ? 'rounded-full' : 'rounded-md'
                      } text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        active
                          ? 'bg-[#d12f2f] text-white'
                          : 'bg-white border border-slate-300 text-slate-500'
                      }`}
                    >
                      {opt.code}
                    </span>
                    {renderBilingualOptionText(opt.label, opt.en, active)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Ô nhập "Khác (ghi rõ)" nếu đáp án đang chọn có bật cờ hasOtherInput */}
          {hasSelectedOtherInput && (
            <input
              type="text"
              value={getOtherInputAnswer(formData, q.key)}
              onChange={(e) => handleOtherInputChange(q.key, e.target.value)}
              placeholder={`Ghi rõ nội dung khác cho câu ${q.key}...`}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#d12f2f]"
            />
          )}
        </div>

        {/* Hiển thị các Câu hỏi con (nếu có đáp án kích hoạt được chọn) */}
        {triggeredChildren.length > 0 && (
          <div className="ml-3 sm:ml-5 pl-3 border-l-2 border-[#d12f2f]/40 space-y-2.5">
            {triggeredChildren.map(({ childQ, triggerLabels }) =>
              renderQuestionBlock(childQ, nextVisited, triggerLabels)
            )}
          </div>
        )}

        {/* Ma trận A5 hiển thị ngay sau câu A4 / A4_1 nếu ở Bước 2 nhánh Đã dùng F&B */}
        {q.key === 'A4' && !isNotUsedFnB && activeA5Rows.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-3">
            {renderBilingualQuestionTitle(
              'A5. Mức chi theo từng loại hình đã dùng (1 người)',
              'A5. Spending breakdown by F&B category used (per person)'
            )}
            <div className="space-y-2.5">
              {activeA5Rows.map((row) => (
                <div
                  key={row.key}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div>
                    {isForeignLang ? (
                      <>
                        <div className="text-xs font-bold text-slate-900">
                          {translateVi(row.label, selectedLang, row.en)}
                        </div>
                        <div className="text-[11px] text-slate-500">{row.label}</div>
                      </>
                    ) : (
                      <div className="text-xs font-semibold text-slate-800">{row.label}</div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
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
      </div>
    );
  };

  const stepQuestions = getTopLevelQuestionsForStep(safeStep);

  return (
    <div className="space-y-3.5 pb-16">
      {/* Thanh điều khiển Điểm trực + Bộ chọn Ngôn ngữ Song ngữ (Anh / Ấn / Hàn / Trung / Nga + Tiếng Việt tham chiếu) */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 space-y-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
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

          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {formatTimer(elapsedSeconds)}
          </span>
        </div>

        {/* Bộ chọn Ngôn ngữ hiển thị chính (kèm Tiếng Việt luôn hiển thị bên dưới) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[#d12f2f]" />
            Ngôn ngữ khách (Kèm Tiếng Việt bên dưới):
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {SURVEY_LANGUAGES.map((lang) => {
              const active = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border transition cursor-pointer ${
                    active
                      ? 'bg-[#d12f2f] text-white border-[#d12f2f] shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nameVi.replace('Tiếng ', '')}</span>
                </button>
              );
            })}
          </div>
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

      {safeStep === 1 && formData.A1_locked && (
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

      {/* Danh sách câu hỏi chính + câu hỏi con tự động bung theo đáp án */}
      <div className="space-y-3">
        {stepQuestions.map((q) => renderQuestionBlock(q))}
      </div>

      {/* Bảng B4 & B5 ở Bước 3 (PHẦN B) */}
      {safeStep === 3 && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
            {renderBilingualQuestionTitle(
              'B4. Cảm nhận mức giá hiện tại (1: Đắt • 2: Hợp lý • 3: Rẻ)',
              'B4. Perception of current price levels (1: Expensive • 2: Reasonable • 3: Cheap)'
            )}
            <div className="space-y-2">
              {B4_ROWS.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div>
                    {isForeignLang ? (
                      <>
                        <div className="text-xs font-bold text-slate-900">
                          {translateVi(row.label, selectedLang, row.en)}
                        </div>
                        <div className="text-[11px] text-slate-500">{row.label}</div>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-slate-800">{row.label}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 shrink-0">
                    {[
                      { code: 1, label: '1. Đắt' },
                      { code: 2, label: '2. Hợp lý' },
                      { code: 3, label: '3. Rẻ' },
                    ].map((opt) => {
                      const active = formData.B4[row.key] === opt.code;
                      const primaryOpt = isForeignLang
                        ? translateVi(opt.label, selectedLang)
                        : opt.label;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() =>
                            updateField('B4', { ...formData.B4, [row.key]: opt.code })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            active
                              ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          <div>{primaryOpt}</div>
                          {isForeignLang && (
                            <div
                              className={`text-[10px] ${
                                active ? 'text-red-100' : 'text-slate-400'
                              }`}
                            >
                              {opt.label}
                            </div>
                          )}
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
              {renderBilingualQuestionTitle(
                'B5. Mức độ hài lòng (1: Rất tệ → 5: Rất hài lòng)',
                'B5. Satisfaction level (1: Very Dissatisfied → 5: Very Satisfied)'
              )}
              <div className="space-y-2">
                {B5_ITEMS.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="min-w-0 flex-1">
                      {isForeignLang ? (
                        <>
                          <div className="text-xs font-bold text-slate-900">
                            {translateVi(item.label, selectedLang, item.en)}
                          </div>
                          <div className="text-[11px] text-slate-500">{item.label}</div>
                        </>
                      ) : (
                        <span className="text-xs font-medium text-slate-800">{item.label}</span>
                      )}
                    </div>
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

      {/* Ghi chú mở & Chọn quà tặng ở Bước 4 (PHẦN C) */}
      {safeStep === 4 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
          {renderBilingualQuestionTitle('Ghi chú ý kiến mở & Chọn quà tặng')}
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
