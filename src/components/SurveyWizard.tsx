import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  ChevronLeft,
  Clock,
  MapPin,
  Gift,
  Lock,
  Sparkles,
  RotateCcw,
  Globe,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  SurveyResponseData,
  SURVEY_LOCATIONS,
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
  OptionItem,
} from '../data/surveySchema';

interface SurveyWizardProps {
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
  { id: 0, code: 'MỞ ĐẦU', title: 'Giới thiệu & Mã phiếu' },
  { id: 1, code: 'PHẦN S', title: 'Sàng lọc & Nhân khẩu' },
  { id: 2, code: 'PHẦN A1-A2', title: 'Chi dự kiến & Sử dụng' },
  { id: 3, code: 'PHẦN A3-A8', title: 'Chi thực tế / Lý do' },
  { id: 4, code: 'PHẦN B', title: 'Thị hiếu, Giá & SERVQUAL' },
  { id: 5, code: 'PHẦN C', title: 'Nhu cầu & Đề xuất' },
];

export const SurveyWizard: React.FC<SurveyWizardProps> = ({
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedState, setSubmittedState] = useState<{
    done: boolean;
    synced: boolean;
    isScreenout: boolean;
  } | null>(null);

  useEffect(() => {
    setValidationError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Detect screen-out condition in Section S
  const getScreenoutReason = (): string | null => {
    if (formData.S1 === 2) {
      return 'S1 = 2: Khách tham quan tại Bà Nà Hills chưa đủ 4 tiếng trở lên.';
    }
    if (formData.S2 === 3) {
      return 'S2 = 3: Khách không trực tiếp chọn món / người khác chi trả hoàn toàn.';
    }
    if (formData.S4 === 1) {
      return 'S4 = 1: Đáp viên dưới 18 tuổi.';
    }
    return null;
  };

  const screenoutReason = getScreenoutReason();

  // Helper for Multi-Answer (MA) with Exclusive code & Max Limit
  const toggleMultiOption = (
    currentList: number[],
    option: OptionItem,
    allOptions: OptionItem[],
    maxSelect?: number
  ): { nextList: number[]; limitHit: boolean } => {
    const exists = currentList.includes(option.code);
    if (exists) {
      return { nextList: currentList.filter((c) => c !== option.code), limitHit: false };
    }

    if (option.exclusive) {
      return { nextList: [option.code], limitHit: false };
    }

    // Remove any exclusive option currently selected
    const exclusiveCodes = allOptions.filter((o) => o.exclusive).map((o) => o.code);
    const cleaned = currentList.filter((c) => !exclusiveCodes.includes(c));

    if (maxSelect && cleaned.length >= maxSelect) {
      return { nextList: cleaned, limitHit: true };
    }

    return { nextList: [...cleaned, option.code], limitHit: false };
  };

  // Validate current step before moving forward
  const validateCurrentStep = (): string | null => {
    if (stepIndex === 0) {
      if (!formData.surveyCode.trim()) return 'Vui lòng kiểm tra Mã phiếu khảo sát.';
      if (!formData.interviewerName.trim()) return 'Vui lòng nhập Tên Phỏng vấn viên (PVV).';
      return null;
    }

    if (stepIndex === 1) {
      if (screenoutReason) {
        return 'Đáp viên thuộc diện DỪNG PHỎNG VẤN. Vui lòng bấm nút "Lưu lượt Dừng sàng lọc" bên dưới.';
      }
      if (!formData.S1) return 'Vui lòng chọn câu S1 (Thời gian tham quan ≥ 4 tiếng).';
      if (!formData.S2) return 'Vui lòng chọn câu S2 (Trực tiếp chọn món/chi trả).';
      if (!formData.S3) return 'Vui lòng ghi nhận câu S3 (Giới tính).';
      if (!formData.S4) return 'Vui lòng chọn câu S4 (Độ tuổi).';
      if (!formData.S5) return 'Vui lòng chọn câu S5 (Quốc tịch / Khu vực sống).';
      if (formData.S5 === 10 && !formData.S5_other.trim()) {
        return 'Vui lòng ghi rõ Quốc tịch khác ở câu S5.';
      }
      if (!formData.S6) return 'Vui lòng chọn câu S6 (Nhóm đi cùng).';
      if (!formData.S7) return 'Vui lòng chọn câu S7 (Hình thức chuyến đi).';
      if (!formData.S8) return 'Vui lòng chọn câu S8 (Số lần đến Bà Nà Hills).';
      if (!formData.S9) return 'Vui lòng chọn câu S9 (Gói vé sử dụng hôm nay).';
      return null;
    }

    if (stepIndex === 2) {
      if (!formData.A1) return 'Vui lòng chọn câu A1 (Mức chi DỰ KIẾN trước chuyến đi).';
      if (formData.A2.length === 0) {
        return 'Vui lòng chọn ít nhất 1 phương án ở câu A2 (Dịch vụ ăn uống đã sử dụng).';
      }
      return null;
    }

    if (stepIndex === 3) {
      const isNonUser = formData.A2.includes(7);
      if (isNonUser) {
        if (formData.A3.length === 0) {
          return 'Vui lòng chọn lý do chưa sử dụng dịch vụ F&B ở câu A3 (tối đa 2).';
        }
        if (formData.A3.includes(1) && !formData.A3_1.trim()) {
          return 'Vui lòng điền câu A3.1 (Đã ăn ở đâu / bằng hình thức nào?).';
        }
        if (formData.A3.includes(3) && !formData.A3_2.trim()) {
          return 'Vui lòng điền câu A3.2 (Mức giá sẵn sàng chi cho 1 bữa ăn chính).';
        }
        if (formData.A3.includes(4) && !formData.A3_3.trim()) {
          return 'Vui lòng điền câu A3.3 (Loại món / ẩm thực mong muốn).';
        }
        if (!formData.A3_4) {
          return 'Vui lòng chọn câu A3.4 (Khả năng sử dụng F&B nếu cải thiện).';
        }
      } else {
        if (!formData.A4) {
          return 'Vui lòng chọn câu A4 (Mức chi THỰC TẾ bình quân 1 người).';
        }
        const needsA4_1 =
          formData.A4 === 8 || formData.S7 === 2 || [2, 3, 4].includes(formData.S9 || 0);
        if (needsA4_1 && formData.A4_1 === null) {
          return 'Vui lòng chọn câu A4.1 (Mức chi trả thêm thực tế ngoài suất ăn trong vé/tour).';
        }
        const activeA5Rows = A5_ROWS.filter((r) => formData.A2.includes(r.a2Code));
        for (const r of activeA5Rows) {
          if (!formData.A5[r.key]) {
            return `Vui lòng chọn mức chi ở bảng A5 cho nhóm: "${r.label}".`;
          }
        }
        if (formData.A6.length === 0) {
          return 'Vui lòng chọn câu A6 (Thời điểm quyết định mua đồ ăn, thức uống).';
        }
        if (!formData.A7) {
          return 'Vui lòng chọn câu A7 (Sẵn sàng chi thêm cho F&B không?).';
        }
        if ((formData.A7 === 1 || formData.A7 === 2) && !formData.A8) {
          return 'Vui lòng chọn câu A8 (Mức dự kiến chi thêm bình quân 1 người).';
        }
      }
      return null;
    }

    if (stepIndex === 4) {
      if (formData.B1.length === 0) {
        return 'Vui lòng chọn câu B1 (Nhóm sản phẩm F&B quan tâm/muốn mua thêm).';
      }
      if (formData.B2.length === 0) {
        return 'Vui lòng chọn câu B2 (Hình thức phục vụ ưu tiên).';
      }
      if (!formData.B3_1 || !formData.B3_2 || !formData.B3_3) {
        return 'Vui lòng chọn đầy đủ 3 tiêu chí khẩu vị ở câu B3 (B3.1, B3.2, B3.3).';
      }
      for (const row of B4_ROWS) {
        if (!formData.B4[row.key]) {
          return `Vui lòng chọn mức giá cảm nhận phù hợp ở B4 cho: "${row.label}".`;
        }
      }
      for (const item of B5_ITEMS) {
        if (!formData.B5[item.key]) {
          return `Vui lòng đánh giá mức độ quan trọng (1–5) ở câu ${item.code} (${item.dimension}).`;
        }
      }
      return null;
    }

    if (stepIndex === 5) {
      if (formData.C1.length === 0) {
        return 'Vui lòng chọn câu C1 (Khung giờ phát sinh nhu cầu ăn uống/nghỉ chân).';
      }
      if (formData.C2.length === 0) {
        return 'Vui lòng chọn câu C2 (Nhu cầu ăn uống đặc biệt).';
      }
      if (formData.C3.length === 0) {
        return 'Vui lòng chọn câu C3 (Mong muốn Bà Nà Hills cải thiện/bổ sung).';
      }
      return null;
    }

    return null;
  };

  const handleNextStep = () => {
    const err = validateCurrentStep();
    if (err) {
      setValidationError(err);
      navigator.vibrate?.(60);
      return;
    }

    if (stepIndex === 0) {
      onStartTimer();
    }

    // Lock A1 when advancing from Step 2 (A1-A2) to Step 3 (A3/A4)
    if (stepIndex === 2) {
      setFormData((prev) => ({ ...prev, A1_locked: true }));
    }

    setStepIndex((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handlePrevStep = () => {
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleFinishSurvey = async (isScreenout = false) => {
    if (!isScreenout) {
      const err = validateCurrentStep();
      if (err) {
        setValidationError(err);
        navigator.vibrate?.(60);
        return;
      }
    }

    setIsSubmitting(true);
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const finalPayload: SurveyResponseData = {
      ...formData,
      endTime,
      durationSeconds: elapsedSeconds,
      status: isScreenout ? 'screenout' : 'completed',
      screenoutReason: isScreenout ? screenoutReason || 'Dừng sàng lọc' : undefined,
    };

    try {
      const res = await onSubmitSurvey(finalPayload);
      setSubmittedState({
        done: true,
        synced: res.synced,
        isScreenout,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // COMPLETION / THANK YOU SCREEN
  // ============================================================================
  if (submittedState?.done) {
    return (
      <div className="max-w-2xl mx-auto my-6 bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 sm:p-9 text-center animate-fade-up">
        <div
          className={`w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center ${
            submittedState.isScreenout
              ? 'bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {submittedState.isScreenout ? (
            <AlertOctagon className="w-11 h-11" />
          ) : (
            <CheckCircle2 className="w-11 h-11" />
          )}
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-3">
          <span>Mã phiếu: {formData.surveyCode}</span>
          <span>•</span>
          <span>Thời lượng: {formatDuration(elapsedSeconds)}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {submittedState.isScreenout
            ? 'Đã Ghi Nhận Lượt Dừng Sàng Lọc (Screen-out)'
            : 'Hoàn Thành Phiếu Khảo Sát!'}
        </h2>

        {submittedState.isScreenout ? (
          <p className="text-sm text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
            Lý do dừng: <strong className="text-amber-700">{screenoutReason}</strong>. Cảm ơn Anh/Chị
            và kết thúc phỏng vấn (không tặng quà theo quy định).
          </p>
        ) : (
          <div className="mt-4 p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
            <p className="text-base font-semibold italic leading-relaxed">
              “Chân thành cảm ơn Anh/Chị đã dành thời gian đóng góp những ý kiến rất giá trị! Kính chúc
              Anh/Chị và gia đình có một chuyến tham quan trọn vẹn niềm vui tại Sun World Ba Na Hills!”
            </p>
            {bilingual && (
              <p className="text-xs text-emerald-700 mt-2 italic">
                “Thank you very much for your valuable feedback! Wishing you and your family a wonderful
                trip at Sun World Ba Na Hills!”
              </p>
            )}
            <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-center gap-2 text-sm font-bold text-emerald-800">
              <Gift className="w-4 h-4 text-emerald-600" />
              <span>Nhắc PVV trao quà tặng: {formData.giftName}</span>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-slate-500">
          Trạng thái lưu trữ:{' '}
          {submittedState.synced ? (
            <span className="text-emerald-600 font-bold">
              ✓ Đã đồng bộ trực tiếp lên Cloud Firebase (banafi-kpi / pkt-survey)
            </span>
          ) : (
            <span className="text-amber-600 font-bold">
              ⚡ Đã lưu an toàn trên thiết bị (Tự động đồng bộ lên banafi-kpi khi có mạng)
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setSubmittedState(null);
            onStartNewSurvey();
          }}
          className="mt-7 w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 inline-flex items-center justify-center gap-2.5 cursor-pointer transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Khởi Tạo Phiếu Khảo Sát Mới (Khách Tiếp Theo)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-28">
      {/* Step Progress Pill Strip (Horizontal Scrollable on Mobile, Full on iPad) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 mb-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono">
              {formData.surveyCode}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {SURVEY_LOCATIONS.find((l) => l.id === formData.locationId)?.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bilingual Toggle for International Tourists */}
            <button
              type="button"
              onClick={() => setBilingual((b) => !b)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                bilingual
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{bilingual ? 'Song ngữ VI + EN: BẬT' : 'Phụ đề EN: TẮT'}</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-emerald-300 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(elapsedSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {STEPS.map((s) => {
            const isActive = s.id === stepIndex;
            const isDone = s.id < stepIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < stepIndex) setStepIndex(s.id);
                }}
                disabled={s.id > stepIndex}
                className={`px-2.5 py-2 rounded-xl text-left border transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 cursor-pointer hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200/70 cursor-not-allowed'
                }`}
              >
                <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-85">
                  {s.code}
                </div>
                <div className="text-xs font-bold truncate mt-0.5">{s.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Banner */}
      {validationError && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start gap-3 shadow-sm animate-fade-up">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-bold">{validationError}</div>
        </div>
      )}

      {/* ====================================================================
          STEP 0: MỞ ĐẦU & METADATA PHIẾU
         ==================================================================== */}
      {stepIndex === 0 && (
        <div className="space-y-4 animate-fade-up">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Thông tin Hành chính &amp; Định danh Phiếu
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  PHIẾU KHẢO SÁT NHU CẦU &amp; HÀNH VI TIÊU DÙNG F&amp;B
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  TẠI SUN WORLD BA NA HILLS · Chiến dịch 600 mẫu (Khung giờ 13:00 – 17:00)
                </p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mã phiếu khảo sát (Tự động)
                </label>
                <input
                  type="text"
                  value={formData.surveyCode}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, surveyCode: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngày khảo sát &amp; Giờ BĐ
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.surveyDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, surveyDate: e.target.value }))
                    }
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900"
                  />
                  <input
                    type="text"
                    readOnly
                    value={formData.startTime}
                    className="w-24 px-2.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-700 text-center"
                    title="Giờ bắt đầu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tên Phỏng vấn viên (PVV)
                </label>
                <input
                  type="text"
                  value={formData.interviewerName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, interviewerName: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 5 Survey Points Selection (Touch Pills for iPad/Phone) */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Điểm khảo sát hiện tại (Chọn 1 trong 5 điểm chốt — 20% Quota / điểm ≈ 120 mẫu):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {SURVEY_LOCATIONS.map((loc) => {
                  const selected = formData.locationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        const parts = formData.surveyCode.split('-');
                        const updatedCode =
                          parts.length === 4
                            ? `${parts[0]}-${parts[1]}-${loc.shortCode}-${parts[3]}`
                            : formData.surveyCode;
                        setFormData((prev) => ({
                          ...prev,
                          locationId: loc.id,
                          surveyCode: updatedCode,
                        }));
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        selected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{loc.name}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          selected ? 'text-emerald-100' : 'text-slate-500'
                        }`}
                      >
                        Mã: {loc.shortCode} · Chỉ tiêu {loc.quotaTarget}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift Input */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Quà tặng dành cho Đáp viên (PVV nêu ngay từ đầu):
              </label>
              <input
                type="text"
                value={formData.giftName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, giftName: e.target.value }))
                }
                placeholder="Điền tên/giá trị quà tặng..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50/70 border border-amber-300 text-sm font-semibold text-amber-950 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Interviewer Script Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-700/50">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LỜI GIỚI THIỆU CHUẨN (PVV ĐỌC CHO DU KHÁCH)</span>
            </div>

            <p className="text-base sm:text-lg leading-relaxed font-medium text-emerald-50">
              “Xin chào Anh/Chị! Em là nhân viên khảo sát của{' '}
              <strong className="text-white underline decoration-emerald-400">
                Sun World Ba Na Hills
              </strong>
              . Chúng em đang tìm hiểu nhu cầu ăn uống, mức chi tiêu và mong muốn của du khách tại Bà Nà
              Hills để cải thiện sản phẩm và dịch vụ ẩm thực. Khảo sát mất khoảng{' '}
              <strong className="text-amber-300">8 – 10 phút</strong>. Mọi thông tin được bảo mật và chỉ
              dùng cho mục đích nghiên cứu.
            </p>
            <p className="text-base sm:text-lg leading-relaxed font-medium text-emerald-50 mt-3">
              Quà tặng:{' '}
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-300/40 text-amber-200 font-bold">
                {formData.giftName || '[Quà tặng lưu niệm]'}
              </span>{' '}
              dành cho Anh/Chị sau khi hoàn thành phiếu. Xin chân thành cảm ơn Anh/Chị!”
            </p>

            {bilingual && (
              <div className="mt-4 pt-4 border-t border-white/15 text-xs sm:text-sm text-emerald-200/90 italic leading-relaxed">
                <strong>[EN Script for International Guests]:</strong> “Hello! I am a survey staff member
                at Sun World Ba Na Hills. We are studying visitors’ dining needs, spending, and
                preferences at Ba Na Hills to improve our Food &amp; Beverage services. The survey takes
                about 8–10 minutes. All information is strictly confidential. We have a gift (
                <strong>{formData.giftName}</strong>) for you upon completion. Thank you very much!”
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-base shadow-[0_0_30px_rgba(52,211,153,0.4)] inline-flex items-center justify-center gap-2.5 cursor-pointer transition-all"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Bắt Đầu Phỏng Vấn — Vào Phần S (Sàng Lọc)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 1: PHẦN S — SÀNG LỌC & NHÂN KHẨU HỌC & HÀNH VI CHUYẾN ĐI (S1 - S9)
         ==================================================================== */}
      {stepIndex === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                PHẦN S · HỎI THEO THỨ TỰ
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold">
                Sàng Lọc, Nhân Khẩu Học &amp; Hành Vi Chuyến Đi (S1 – S9)
              </h2>
            </div>
            <span className="text-xs bg-white/15 px-3 py-1 rounded-full font-semibold">
              Tất cả câu đều chọn 1 (SA)
            </span>
          </div>

          {/* Screen-out Warning Box if S1=2, S2=3, or S4=1 */}
          {screenoutReason && (
            <div className="p-5 rounded-3xl bg-red-50 border-2 border-red-400 text-red-950 shadow-lg animate-fade-up">
              <div className="flex items-start gap-3.5">
                <ShieldAlert className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-red-600">
                    MÃ DỪNG PHỎNG VẤN (SCREEN-OUT)
                  </div>
                  <h3 className="text-lg font-extrabold mt-0.5">{screenoutReason}</h3>
                  <p className="text-xs text-red-800 mt-1 leading-relaxed">
                    Theo quy định: Cảm ơn đáp viên và kết thúc phỏng vấn tại đây, không tặng quà khảo
                    sát. Lưu lại lượt tiếp cận này để BAT thống kê tỷ lệ sàng lọc.
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleFinishSurvey(true)}
                    disabled={isSubmitting}
                    className="mt-4 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Lưu Lượt Dừng Sàng Lọc &amp; Kết Thúc Phiếu Này</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* S1 */}
          <SingleSelectQuestionCard
            code="S1"
            title="Hôm nay Anh/Chị đã tham quan tại Bà Nà Hills được từ 4 tiếng trở lên chưa?"
            en="Have you visited Ba Na Hills for 4 hours or more today?"
            badge="SA · Sàng lọc"
            bilingual={bilingual}
            options={S1_OPTIONS}
            selectedCode={formData.S1}
            onSelect={(code) => setFormData((prev) => ({ ...prev, S1: code }))}
          />

          {/* S2 */}
          <SingleSelectQuestionCard
            code="S2"
            title="Tại Bà Nà hôm nay, Anh/Chị có trực tiếp chọn món/chi trả tiền ăn uống không?"
            en="At Ba Na today, do you directly choose dishes or pay for food and drinks?"
            badge="SA · Sàng lọc"
            bilingual={bilingual}
            options={S2_OPTIONS}
            selectedCode={formData.S2}
            onSelect={(code) => setFormData((prev) => ({ ...prev, S2: code }))}
          />

          {/* S3 & S4 side by side on iPad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SingleSelectQuestionCard
              code="S3"
              title="Giới tính của Anh/Chị? (PVV tự ghi nhận)"
              en="Respondent's gender (Recorded by interviewer)"
              badge="SA · Quota 50/50"
              bilingual={bilingual}
              options={S3_OPTIONS}
              selectedCode={formData.S3}
              onSelect={(code) => setFormData((prev) => ({ ...prev, S3: code }))}
            />

            <SingleSelectQuestionCard
              code="S4"
              title="Anh/Chị thuộc độ tuổi nào?"
              en="Which age group do you belong to?"
              badge="SA · Sàng lọc <18"
              bilingual={bilingual}
              options={S4_OPTIONS}
              selectedCode={formData.S4}
              onSelect={(code) => setFormData((prev) => ({ ...prev, S4: code }))}
            />
          </div>

          {/* S5 */}
          <SingleSelectQuestionCard
            code="S5"
            title="Quốc tịch / Khu vực sống của Anh/Chị?"
            en="What is your nationality / region of residence?"
            badge="SA · Quota Nội địa 50% / Quốc tế 50%"
            bilingual={bilingual}
            options={S5_OPTIONS}
            selectedCode={formData.S5}
            onSelect={(code) => setFormData((prev) => ({ ...prev, S5: code }))}
            otherValue={formData.S5_other}
            onOtherChange={(val) => setFormData((prev) => ({ ...prev, S5_other: val }))}
            columns={2}
          />

          {/* S6 */}
          <SingleSelectQuestionCard
            code="S6"
            title="Anh/Chị đang đi du lịch cùng với ai?"
            en="Who are you traveling with today?"
            badge="SA · Quota Nhóm đi cùng"
            bilingual={bilingual}
            options={S6_OPTIONS}
            selectedCode={formData.S6}
            onSelect={(code) => setFormData((prev) => ({ ...prev, S6: code }))}
            columns={2}
          />

          {/* S7 & S8 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SingleSelectQuestionCard
              code="S7"
              title="Hình thức chuyến đi của Anh/Chị?"
              en="What is your travel style for this trip?"
              badge="SA · Tự túc 60% / Tour 40%"
              bilingual={bilingual}
              options={S7_OPTIONS}
              selectedCode={formData.S7}
              onSelect={(code) => setFormData((prev) => ({ ...prev, S7: code }))}
            />

            <SingleSelectQuestionCard
              code="S8"
              title="Đây là lần thứ mấy Anh/Chị đến Bà Nà Hills?"
              en="How many times have you visited Ba Na Hills?"
              badge="SA"
              bilingual={bilingual}
              options={S8_OPTIONS}
              selectedCode={formData.S8}
              onSelect={(code) => setFormData((prev) => ({ ...prev, S8: code }))}
            />
          </div>

          {/* S9 */}
          <SingleSelectQuestionCard
            code="S9"
            title="Gói vé Anh/Chị sử dụng hôm nay thuộc nhóm nào?"
            en="Which ticket package are you using today?"
            badge="SA · Theo dõi tối thiểu ~50 mẫu/gói"
            bilingual={bilingual}
            options={S9_OPTIONS}
            selectedCode={formData.S9}
            onSelect={(code) => setFormData((prev) => ({ ...prev, S9: code }))}
            columns={2}
          />
        </div>
      )}

      {/* ====================================================================
          STEP 2: PHẦN A (BƯỚC 1) — MỨC CHI DỰ KIẾN (A1) & DỊCH VỤ ĐÃ SỬ DỤNG (A2)
         ==================================================================== */}
      {stepIndex === 2 && (
        <div className="space-y-5 animate-fade-up">
          <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              PHẦN A · HÀNH VI SỬ DỤNG VÀ CHI TIÊU F&amp;B (BƯỚC 1/2)
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
              Ngân Sách Dự Kiến (A1) &amp; Dịch Vụ Đã Sử Dụng (A2)
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Quy ước: Mọi mức chi tính bình quân TRÊN 1 NGƯỜI (VNĐ). Mức chi DỰ KIẾN (A1) hỏi trước,
                sau khi sang bước tiếp theo sẽ khóa lại để không cho khách xem/sửa lại khi hỏi mức chi THỰC TẾ (A4).
              </span>
            </p>
          </div>

          {/* A1 */}
          <div className="relative">
            {formData.A1_locked && (
              <div className="mb-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>
                  Câu A1 đã được khóa theo quy ước khảo sát (Không chỉnh sửa lại sau khi đã chuyển sang
                  hỏi mức chi thực tế A4).
                </span>
              </div>
            )}
            <SingleSelectQuestionCard
              code="A1"
              title="Trước chuyến đi hôm nay, Anh/Chị DỰ KIẾN sẽ chi khoảng bao nhiêu cho ăn uống tại Bà Nà Hills (bình quân 1 người, gồm cả suất ăn trong vé/tour nếu có)?"
              en="Before today's trip, how much did you EXPECT to spend on food & drinks at Ba Na Hills per person (including any meal in your ticket/tour)?"
              badge={formData.A1_locked ? 'SA · ĐÃ KHÓA' : 'SA · Hỏi trước A4'}
              bilingual={bilingual}
              options={A1_OPTIONS}
              selectedCode={formData.A1}
              onSelect={(code) => {
                if (formData.A1_locked) return;
                setFormData((prev) => ({ ...prev, A1: code }));
              }}
              columns={2}
            />
          </div>

          {/* A2 */}
          <MultiSelectQuestionCard
            code="A2"
            title="Trong chuyến tham quan hôm nay, Anh/Chị đã sử dụng những dịch vụ ăn uống nào tại Bà Nà Hills?"
            en="During your visit today, which F&B services have you used at Ba Na Hills?"
            badge="MA · Chọn tất cả phù hợp (Mã 7 loại trừ)"
            bilingual={bilingual}
            options={A2_OPTIONS}
            selectedCodes={formData.A2}
            onToggle={(opt) => {
              const { nextList } = toggleMultiOption(formData.A2, opt, A2_OPTIONS);
              setFormData((prev) => ({ ...prev, A2: nextList }));
            }}
          />

          {/* Branching Preview Banner */}
          {formData.A2.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div className="text-xs sm:text-sm">
                <span className="text-emerald-400 font-bold uppercase tracking-wider mr-2">
                  Luồng rẽ nhánh tự động:
                </span>
                {formData.A2.includes(7) ? (
                  <span>
                    Khách <strong>CHƯA SỬ DỤNG F&amp;B (A2 = 7)</strong> → Chuyển sang hỏi{' '}
                    <strong>A3 (A3.1 – A3.4)</strong>, bỏ qua A4 – A8.
                  </span>
                ) : (
                  <span>
                    Khách <strong>ĐÃ SỬ DỤNG F&amp;B ({formData.A2.length} nhóm dịch vụ)</strong> →
                    Chuyển sang hỏi <strong>A4 – A8</strong> (bỏ qua A3).
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          STEP 3: PHẦN A (BƯỚC 2) — NHÁNH CHƯA DÙNG (A3) HOẶC ĐÃ DÙNG (A4 - A8)
         ==================================================================== */}
      {stepIndex === 3 && (
        <div className="space-y-5 animate-fade-up">
          {formData.A2.includes(7) ? (
            /* NHÁNH KHÁCH CHƯA SỬ DỤNG F&B (A2 = 7) */
            <>
              <div className="bg-amber-900 text-white rounded-2xl p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  PHẦN A · DÀNH CHO KHÁCH CHƯA SỬ DỤNG F&amp;B (A2 = 7)
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
                  Lý Do Chưa Sử Dụng &amp; Khả Năng Chuyển Đổi (A3 – A3.4)
                </h2>
              </div>

              <MultiSelectQuestionCard
                code="A3"
                title="Lý do chính khiến Anh/Chị chưa sử dụng dịch vụ F&B tại Bà Nà Hills?"
                en="What are the main reasons you have not used F&B services at Ba Na Hills today?"
                badge="MA · Chọn tối đa 2 lý do"
                maxSelect={2}
                bilingual={bilingual}
                options={A3_OPTIONS}
                selectedCodes={formData.A3}
                onToggle={(opt) => {
                  const { nextList, limitHit } = toggleMultiOption(
                    formData.A3,
                    opt,
                    A3_OPTIONS,
                    2
                  );
                  if (limitHit) {
                    setValidationError('Câu A3 chỉ được chọn tối đa 2 lý do chính.');
                    return;
                  }
                  setValidationError(null);
                  setFormData((prev) => ({ ...prev, A3: nextList }));
                }}
                otherValue={formData.A3_other}
                onOtherChange={(val) => setFormData((prev) => ({ ...prev, A3_other: val }))}
              />

              {/* Sub-questions A3.1, A3.2, A3.3 */}
              {(formData.A3.includes(1) ||
                formData.A3.includes(3) ||
                formData.A3.includes(4)) && (
                <div className="bg-amber-50/90 rounded-3xl border-2 border-amber-300 p-5 sm:p-6 space-y-4">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                    Câu hỏi đào sâu theo lý do đã chọn ở A3
                  </div>

                  {formData.A3.includes(1) && (
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">
                        A3.1 (Do chọn mã 1): Anh/Chị đã ăn ở đâu / bằng hình thức nào? *
                      </label>
                      {bilingual && (
                        <p className="text-xs text-slate-500 italic mb-2">
                          Where or how did you eat before visiting?
                        </p>
                      )}
                      <input
                        type="text"
                        value={formData.A3_1}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, A3_1: e.target.value }))
                        }
                        placeholder="VD: Ăn sáng buffet tại khách sạn ở trung tâm Đà Nẵng trước khi lên..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  )}

                  {formData.A3.includes(3) && (
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">
                        A3.2 (Do chọn mã 3): Với 1 bữa ăn chính tại Bà Nà, mức giá Anh/Chị sẵn sàng
                        chi là bao nhiêu? (VNĐ/người) *
                      </label>
                      {bilingual && (
                        <p className="text-xs text-slate-500 italic mb-2">
                          For a main meal at Ba Na, how much are you willing to pay per person (VND)?
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2.5">
                        {['100.000đ', '150.000đ', '200.000đ', '250.000đ', '300.000đ', '350.000đ'].map(
                          (preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, A3_2: preset }))
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                                formData.A3_2 === preset
                                  ? 'bg-amber-600 text-white border-amber-600'
                                  : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                              }`}
                            >
                              {preset}
                            </button>
                          )
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.A3_2}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, A3_2: e.target.value }))
                        }
                        placeholder="Nhập số tiền sẵn sàng chi (đồng/người)..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  )}

                  {formData.A3.includes(4) && (
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">
                        A3.3 (Do chọn mã 4): Anh/Chị mong muốn loại món / ẩm thực nào? *
                      </label>
                      {bilingual && (
                        <p className="text-xs text-slate-500 italic mb-2">
                          What type of dishes or cuisine would you like to have?
                        </p>
                      )}
                      <input
                        type="text"
                        value={formData.A3_3}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, A3_3: e.target.value }))
                        }
                        placeholder="VD: Món Hàn Quốc, Món Ấn chay, Halal, Bún/Mì địa phương..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-amber-300 text-sm text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* A3.4 */}
              <SingleSelectQuestionCard
                code="A3.4"
                title="Nếu các điều kiện trên được cải thiện, khả năng Anh/Chị sử dụng F&B tại Bà Nà là?"
                en="If the above conditions are improved, how likely are you to use F&B services at Ba Na?"
                badge="SA · Sau câu này chuyển thẳng sang Phần B"
                bilingual={bilingual}
                options={A3_4_OPTIONS}
                selectedCode={formData.A3_4}
                onSelect={(code) => setFormData((prev) => ({ ...prev, A3_4: code }))}
              />
            </>
          ) : (
            /* NHÁNH KHÁCH ĐÃ SỬ DỤNG F&B (A2 = 1..6) */
            <>
              <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  PHẦN A · DÀNH CHO KHÁCH ĐÃ SỬ DỤNG F&amp;B (A2 = 1 – 6)
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
                  Chi Tiêu Thực Tế, Cơ Cấu Giỏ Hàng &amp; Nhu Cầu Chi Thêm (A4 – A8)
                </h2>
              </div>

              {/* A4 */}
              <SingleSelectQuestionCard
                code="A4"
                title="Tính bình quân TRÊN 1 NGƯỜI, Anh/Chị đã THỰC TẾ CHI BAO NHIÊU cho F&B tại Bà Nà Hills hôm nay?"
                en="On average PER PERSON, how much have you ACTUALLY SPENT on F&B at Ba Na Hills today (including meal in ticket/tour + extra purchases)?"
                subtitle="Tính tổng gồm cả suất ăn trưa trong vé/tour (nếu có) + các khoản mua thêm tại chỗ. Nếu khách không biết giá suất ăn đã gồm, chọn mã 8 và hỏi A4.1."
                badge="SA · Chi thực tế"
                bilingual={bilingual}
                options={A4_OPTIONS}
                selectedCode={formData.A4}
                onSelect={(code) => setFormData((prev) => ({ ...prev, A4: code }))}
                columns={2}
              />

              {/* A4.1 (Restored question from A4 instructions & Appendix 2!) */}
              {(formData.A4 === 8 ||
                formData.S7 === 2 ||
                [2, 3, 4].includes(formData.S9 || 0)) && (
                <SingleSelectQuestionCard
                  code="A4.1"
                  title="Ngoài suất ăn đã bao gồm trong vé/tour, hôm nay Anh/Chị đã THỰC TẾ CHI THÊM bao nhiêu cho ăn uống tại chỗ (bình quân 1 người)?"
                  en="Excluding the meal included in your ticket/tour, how much EXTRA have you actually spent on F&B on-site today (per person)?"
                  subtitle="Câu hỏi bóc tách phần chi thêm thực tế đối với khách đi Tour / Combo hoặc khách chọn mã 8 ở A4 (Theo Phụ lục 2)."
                  badge="SA · Tách phần chi thêm thực tế"
                  bilingual={bilingual}
                  options={A4_1_OPTIONS}
                  selectedCode={formData.A4_1}
                  onSelect={(code) => setFormData((prev) => ({ ...prev, A4_1: code }))}
                  columns={2}
                />
              )}

              {/* A5 Dynamic Matrix */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                    A5 · SA mỗi dòng (Đã lọc tự động theo A2)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  A5. Mức chi bình quân 1 người cho từng nhóm sản phẩm Anh/Chị đã sử dụng hôm nay?
                </h3>
                {bilingual && (
                  <p className="text-xs text-slate-500 italic mt-1">
                    Average spending per person for each product category you used today:
                  </p>
                )}

                <div className="mt-4 space-y-4">
                  {A5_ROWS.filter((r) => formData.A2.includes(r.a2Code)).map((row) => (
                    <div
                      key={row.key}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90"
                    >
                      <div className="text-sm font-bold text-slate-900">{row.label}</div>
                      {bilingual && (
                        <div className="text-xs text-slate-500 italic mb-2">{row.en}</div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5">
                        {A5_COLUMNS.map((col) => {
                          const active = formData.A5[row.key] === col.code;
                          return (
                            <button
                              key={col.code}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  A5: { ...prev.A5, [row.key]: col.code },
                                }))
                              }
                              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                active
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div>{col.label}</div>
                              {bilingual && (
                                <div
                                  className={`text-[10px] ${
                                    active ? 'text-emerald-100' : 'text-slate-400'
                                  }`}
                                >
                                  {col.en}
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

              {/* A6 */}
              <MultiSelectQuestionCard
                code="A6"
                title="Anh/Chị thường quyết định mua đồ ăn, thức uống tại Bà Nà Hills vào thời điểm nào?"
                en="When do you usually decide to buy food and drinks at Ba Na Hills?"
                badge="MA · Chọn tối đa 2"
                maxSelect={2}
                bilingual={bilingual}
                options={A6_OPTIONS}
                selectedCodes={formData.A6}
                onToggle={(opt) => {
                  const { nextList, limitHit } = toggleMultiOption(
                    formData.A6,
                    opt,
                    A6_OPTIONS,
                    2
                  );
                  if (limitHit) {
                    setValidationError('Câu A6 chỉ được chọn tối đa 2 thời điểm.');
                    return;
                  }
                  setValidationError(null);
                  setFormData((prev) => ({ ...prev, A6: nextList }));
                }}
                otherValue={formData.A6_other}
                onOtherChange={(val) => setFormData((prev) => ({ ...prev, A6_other: val }))}
              />

              {/* A7 */}
              <SingleSelectQuestionCard
                code="A7"
                title="Ngoài khoản đã chi hoặc đã bao gồm trong vé/tour, Anh/Chị có sẵn sàng chi thêm cho F&B tại Bà Nà không?"
                en="Beyond what you have spent or what is included in your ticket/tour, are you willing to spend more on F&B at Ba Na?"
                badge="SA · Nếu chọn 3 sẽ bỏ qua A8"
                bilingual={bilingual}
                options={A7_OPTIONS}
                selectedCode={formData.A7}
                onSelect={(code) =>
                  setFormData((prev) => ({
                    ...prev,
                    A7: code,
                    A8: code === 3 ? null : prev.A8,
                  }))
                }
              />

              {/* A8 (Only if A7 = 1 or 2) */}
              {(formData.A7 === 1 || formData.A7 === 2) && (
                <SingleSelectQuestionCard
                  code="A8"
                  title="Anh/Chị dự kiến chi thêm khoảng bao nhiêu (bình quân 1 người)?"
                  en="How much extra do you expect to spend per person?"
                  badge="SA · Khi A7 = 1 hoặc 2"
                  bilingual={bilingual}
                  options={A8_OPTIONS}
                  selectedCode={formData.A8}
                  onSelect={(code) => setFormData((prev) => ({ ...prev, A8: code }))}
                  columns={2}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ====================================================================
          STEP 4: PHẦN B — THỊ HIẾU SẢN PHẨM, MỨC GIÁ & SERVQUAL (B1 - B5)
         ==================================================================== */}
      {stepIndex === 4 && (
        <div className="space-y-5 animate-fade-up">
          <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              PHẦN B · HỎI TẤT CẢ ĐÁP VIÊN
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
              Thị Hiếu Sản Phẩm, Mức Giá Phù Hợp &amp; Khung SERVQUAL (B1 – B5)
            </h2>
          </div>

          {/* B1 */}
          <MultiSelectQuestionCard
            code="B1"
            title="Anh/Chị quan tâm hoặc muốn mua thêm những nhóm sản phẩm F&B nào tại Bà Nà Hills?"
            en="Which F&B product categories are you interested in or would like to buy more of at Ba Na Hills?"
            badge="MA · Chọn tối đa 3"
            maxSelect={3}
            bilingual={bilingual}
            options={B1_OPTIONS}
            selectedCodes={formData.B1}
            onToggle={(opt) => {
              const { nextList, limitHit } = toggleMultiOption(formData.B1, opt, B1_OPTIONS, 3);
              if (limitHit) {
                setValidationError('Câu B1 chỉ được chọn tối đa 3 nhóm sản phẩm.');
                return;
              }
              setValidationError(null);
              setFormData((prev) => ({ ...prev, B1: nextList }));
            }}
            otherValue={formData.B1_other}
            onOtherChange={(val) => setFormData((prev) => ({ ...prev, B1_other: val }))}
            columns={2}
          />

          {/* B2 */}
          <MultiSelectQuestionCard
            code="B2"
            title="Anh/Chị ưu tiên hình thức phục vụ nào khi dùng F&B tại Bà Nà Hills?"
            en="Which service format do you prefer when dining at Ba Na Hills?"
            badge="MA · Chọn tối đa 2 (Mã 7 loại trừ)"
            maxSelect={2}
            bilingual={bilingual}
            options={B2_OPTIONS}
            selectedCodes={formData.B2}
            onToggle={(opt) => {
              const { nextList, limitHit } = toggleMultiOption(formData.B2, opt, B2_OPTIONS, 2);
              if (limitHit) {
                setValidationError('Câu B2 chỉ được chọn tối đa 2 hình thức phục vụ.');
                return;
              }
              setValidationError(null);
              setFormData((prev) => ({ ...prev, B2: nextList }));
            }}
            columns={2}
          />

          {/* B3: Taste Profile Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                B3 · SA mỗi dòng
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              B3. Về khẩu vị, Anh/Chị thường thích món ăn như thế nào?
            </h3>
            {bilingual && (
              <p className="text-xs text-slate-500 italic">
                Regarding taste preferences, how do you usually like your food?
              </p>
            )}

            <div className="space-y-3.5">
              {/* B3.1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-sm font-bold text-slate-900 mb-2">
                  B3.1. Độ cay {bilingual && <span className="text-slate-500 font-normal">(Spiciness)</span>}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {B3_1_OPTIONS.map((o) => (
                    <button
                      key={o.code}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, B3_1: o.code }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formData.B3_1 === o.code
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div>{o.label}</div>
                      {bilingual && (
                        <div className="text-[10px] opacity-80 mt-0.5">{o.en}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* B3.2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-sm font-bold text-slate-900 mb-2">
                  B3.2. Hương vị {bilingual && <span className="text-slate-500 font-normal">(Flavor intensity)</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {B3_2_OPTIONS.map((o) => (
                    <button
                      key={o.code}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, B3_2: o.code }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formData.B3_2 === o.code
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div>{o.label}</div>
                      {bilingual && (
                        <div className="text-[10px] opacity-80 mt-0.5">{o.en}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* B3.3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-sm font-bold text-slate-900 mb-2">
                  B3.3. Nhiệt độ món {bilingual && <span className="text-slate-500 font-normal">(Serving temperature)</span>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {B3_3_OPTIONS.map((o) => (
                    <button
                      key={o.code}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, B3_3: o.code }))}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formData.B3_3 === o.code
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <div>{o.label}</div>
                      {bilingual && (
                        <div className="text-[10px] opacity-80 mt-0.5">{o.en}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* B4: Acceptable Price Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              B4 · SA mỗi dòng · Cảm nhận mức giá phù hợp
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              B4. Mức giá nào Anh/Chị cảm thấy PHÙ HỢP cho các sản phẩm sau?
            </h3>
            <p className="text-xs text-slate-500">
              Đây là mức giá cảm nhận phù hợp, không phải mức giá tối đa chắc chắn sẽ mua.
            </p>

            <div className="space-y-3.5">
              {B4_ROWS.map((row) => (
                <div key={row.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-sm font-bold text-slate-900">
                    {row.label}{' '}
                    {bilingual && (
                      <span className="text-xs font-normal text-slate-500">({row.en})</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5">
                    {row.options.map((opt) => {
                      const active = formData.B4[row.key] === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              B4: { ...prev.B4, [row.key]: opt.code },
                            }))
                          }
                          className={`py-2.5 px-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                            active
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          <div>{opt.label}</div>
                          {bilingual && (
                            <div className="text-[10px] opacity-80 mt-0.5">{opt.en}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B5: SERVQUAL 1 - 5 Rating */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              B5 · Thang điểm Likert 1 – 5 (Khung SERVQUAL)
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              B5. Xin Quý khách đánh giá mức độ quan trọng của các yếu tố sau khi quyết định sử dụng
              F&amp;B tại Bà Nà Hills:
            </h3>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 bg-slate-100 p-2.5 rounded-xl">
              <span>1 = Rất không quan trọng</span>
              <span>•</span>
              <span>2 = Không quan trọng</span>
              <span>•</span>
              <span>3 = Bình thường</span>
              <span>•</span>
              <span>4 = Quan trọng</span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">5 = Cực kỳ quan trọng</span>
            </div>

            <div className="space-y-3">
              {B5_ITEMS.map((item) => {
                const currentScore = formData.B5[item.key];
                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                        {item.code} · {item.dimension}
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{item.label}</div>
                      {bilingual && (
                        <div className="text-xs text-slate-500 italic mt-0.5">{item.en}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-2 shrink-0 md:w-72">
                      {[1, 2, 3, 4, 5].map((score) => {
                        const selected = currentScore === score;
                        return (
                          <button
                            key={score}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                B5: { ...prev.B5, [item.key]: score },
                              }))
                            }
                            className={`h-12 rounded-xl border font-extrabold text-sm transition-all cursor-pointer flex flex-col items-center justify-center ${
                              selected
                                ? 'bg-emerald-600 text-white border-emerald-600 scale-105 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50'
                            }`}
                          >
                            <span>{score}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          STEP 5: PHẦN C — NHU CẦU VÀ TRẢI NGHIỆM PHỤC VỤ (C1 - C3 + GHI CHÚ)
         ==================================================================== */}
      {stepIndex === 5 && (
        <div className="space-y-5 animate-fade-up">
          <div className="bg-emerald-900 text-white rounded-2xl p-4 sm:p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              PHẦN C · PHẦN CUỐI PHIẾU KHẢO SÁT
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
              Nhu Cầu Theo Khung Giờ, Nhu Cầu Đặc Biệt &amp; Đề Xuất Cải Thiện (C1 – C3)
            </h2>
          </div>

          {/* C1 */}
          <MultiSelectQuestionCard
            code="C1"
            title="Trong hành trình tham quan, Anh/Chị thường phát sinh nhu cầu ĂN UỐNG / NGHỈ CHÂN vào khung giờ nào?"
            en="During your visit, at what times do you usually need to eat, drink, or rest?"
            badge="MA · Chọn tối đa 2 khung giờ"
            maxSelect={2}
            bilingual={bilingual}
            options={C1_OPTIONS}
            selectedCodes={formData.C1}
            onToggle={(opt) => {
              const { nextList, limitHit } = toggleMultiOption(formData.C1, opt, C1_OPTIONS, 2);
              if (limitHit) {
                setValidationError('Câu C1 chỉ được chọn tối đa 2 khung giờ.');
                return;
              }
              setValidationError(null);
              setFormData((prev) => ({ ...prev, C1: nextList }));
            }}
            columns={2}
          />

          {/* C2 */}
          <MultiSelectQuestionCard
            code="C2"
            title="Anh/Chị hoặc người đi cùng có nhu cầu ăn uống đặc biệt nào không?"
            en="Do you or your companions have any special dietary requirements?"
            badge="MA · Chọn tất cả phù hợp (Mã 7 loại trừ)"
            bilingual={bilingual}
            options={C2_OPTIONS}
            selectedCodes={formData.C2}
            onToggle={(opt) => {
              const { nextList } = toggleMultiOption(formData.C2, opt, C2_OPTIONS);
              setValidationError(null);
              setFormData((prev) => ({ ...prev, C2: nextList }));
            }}
            otherValue={formData.C2_other}
            onOtherChange={(val) => setFormData((prev) => ({ ...prev, C2_other: val }))}
            columns={2}
          />

          {/* C3 */}
          <MultiSelectQuestionCard
            code="C3"
            title="Anh/Chị mong muốn Bà Nà Hills cải thiện hoặc bổ sung điều gì để việc ăn uống thuận tiện hơn?"
            en="What would you like Ba Na Hills to improve or add to make dining more convenient?"
            badge="MA · Chọn tối đa 3 đề xuất (Mã 13 loại trừ)"
            maxSelect={3}
            bilingual={bilingual}
            options={C3_OPTIONS}
            selectedCodes={formData.C3}
            onToggle={(opt) => {
              const { nextList, limitHit } = toggleMultiOption(formData.C3, opt, C3_OPTIONS, 3);
              if (limitHit) {
                setValidationError('Câu C3 chỉ được chọn tối đa 3 mong muốn cải thiện.');
                return;
              }
              setValidationError(null);
              setFormData((prev) => ({ ...prev, C3: nextList }));
            }}
            otherValue={formData.C3_other}
            onOtherChange={(val) => setFormData((prev) => ({ ...prev, C3_other: val }))}
            columns={2}
          />

          {/* C4 Optional Open Feedback (Restored from Appendix 2 C4/C6 reference) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
              C4 (Tùy chọn) · Ghi chú / Ý kiến chi tiết của du khách
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              Ghi chú bổ sung (Tên nhà hàng/quầy cụ thể, món ăn khách khen/chê hoặc lưu ý của PVV):
            </h3>
            <textarea
              rows={3}
              value={formData.C4_note}
              onChange={(e) => setFormData((prev) => ({ ...prev, C4_note: e.target.value }))}
              placeholder="Không bắt buộc — Nhập nhanh nếu khách có chia sẻ thêm..."
              className="mt-2.5 w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          STICKY BOTTOM NAVIGATION BAR FOR MOBILE & IPAD
         ==================================================================== */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={stepIndex === 0 || isSubmitting}
            className="px-4 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="text-xs font-bold text-slate-500 hidden sm:block">
            Bước {stepIndex + 1} / {STEPS.length} — {STEPS[stepIndex].title}
          </div>

          {stepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 sm:flex-initial px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <span>Tiếp tục ({STEPS[stepIndex + 1].code})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleFinishSurvey(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-105 active:scale-[0.99] text-white font-extrabold text-sm inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isSubmitting ? 'Đang lưu phiếu...' : 'Hoàn Thành & Lưu Phiếu (banafi-kpi)'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// REUSABLE TOUCH-FRIENDLY QUESTION CARDS (SA & MA)
// ============================================================================
interface SingleSelectProps {
  code: string;
  title: string;
  en: string;
  subtitle?: string;
  badge: string;
  bilingual: boolean;
  options: OptionItem[];
  selectedCode: number | null;
  onSelect: (code: number) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  columns?: 1 | 2;
}

const SingleSelectQuestionCard: React.FC<SingleSelectProps> = ({
  code,
  title,
  en,
  subtitle,
  badge,
  bilingual,
  options,
  selectedCode,
  onSelect,
  otherValue,
  onOtherChange,
  columns = 1,
}) => {
  const selectedOpt = options.find((o) => o.code === selectedCode);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs">
          {code}
        </span>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">{title}</h3>
      {bilingual && <p className="text-xs text-slate-500 italic mt-1">{en}</p>}
      {subtitle && <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl mt-2">{subtitle}</p>}

      <div
        className={`mt-3.5 grid gap-2.5 ${
          columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {options.map((opt) => {
          const isSelected = selectedCode === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onSelect(opt.code)}
              className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                isSelected
                  ? opt.stopInterview
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50/80 hover:bg-emerald-50/50 text-slate-900 border-slate-200'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-white text-slate-900'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
              >
                {opt.code}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-snug">{opt.label}</div>
                {bilingual && (
                  <div
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-white/85' : 'text-slate-500'
                    }`}
                  >
                    {opt.en}
                  </div>
                )}
                {opt.stopInterview && (
                  <span
                    className={`inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-black/25 text-white' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    DỪNG phỏng vấn
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedOpt?.hasOtherInput && onOtherChange && (
        <div className="mt-3">
          <input
            type="text"
            value={otherValue || ''}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Ghi rõ nội dung Khác..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-emerald-500 text-sm text-slate-900 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};

interface MultiSelectProps {
  code: string;
  title: string;
  en: string;
  badge: string;
  maxSelect?: number;
  bilingual: boolean;
  options: OptionItem[];
  selectedCodes: number[];
  onToggle: (opt: OptionItem) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  columns?: 1 | 2;
}

const MultiSelectQuestionCard: React.FC<MultiSelectProps> = ({
  code,
  title,
  en,
  badge,
  maxSelect,
  bilingual,
  options,
  selectedCodes,
  onToggle,
  otherValue,
  onOtherChange,
  columns = 1,
}) => {
  const hasOtherSelected = options.some(
    (o) => o.hasOtherInput && selectedCodes.includes(o.code)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-xs">
          {code}
        </span>
        <div className="flex items-center gap-2">
          {maxSelect && (
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Đã chọn: {selectedCodes.length} / {maxSelect}
            </span>
          )}
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">{title}</h3>
      {bilingual && <p className="text-xs text-slate-500 italic mt-1">{en}</p>}

      <div
        className={`mt-3.5 grid gap-2.5 ${
          columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {options.map((opt) => {
          const isSelected = selectedCodes.includes(opt.code);
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onToggle(opt)}
              className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                isSelected
                  ? opt.exclusive
                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                    : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50/80 hover:bg-emerald-50/50 text-slate-900 border-slate-200'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-white text-slate-900'
                    : 'bg-white border border-slate-300 text-slate-600'
                }`}
              >
                {isSelected ? '✓' : opt.code}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-snug">{opt.label}</div>
                {bilingual && (
                  <div
                    className={`text-xs mt-0.5 ${
                      isSelected ? 'text-white/85' : 'text-slate-500'
                    }`}
                  >
                    {opt.en}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {hasOtherSelected && onOtherChange && (
        <div className="mt-3">
          <input
            type="text"
            value={otherValue || ''}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Ghi rõ nội dung Khác..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-emerald-500 text-sm text-slate-900 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
};
