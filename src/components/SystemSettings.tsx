import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ListChecks,
  FileSpreadsheet,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Check,
  Gift,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  SurveySystemConfig,
  QuestionKey,
  ConfigurableOptionItem,
  getDefaultSurveyConfig,
  saveSurveyConfigToCloud,
} from '../services/surveyConfig';

interface SystemSettingsProps {
  config: SurveySystemConfig;
  actorEmail?: string;
  onConfigSaved: (next: SurveySystemConfig) => void;
}

type SettingsSubTab = 'locations' | 'questions' | 'format';

const QUESTION_KEYS: QuestionKey[] = [
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'S6',
  'S7',
  'S8',
  'S9',
  'A1',
  'A2',
  'A3',
  'A3_4',
  'A4',
  'A4_1',
  'A6',
  'A7',
  'A8',
  'B1',
  'B2',
  'B3_1',
  'B3_2',
  'B3_3',
  'C1',
  'C2',
  'C3',
];

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  config,
  actorEmail,
  onConfigSaved,
}) => {
  const [subTab, setSubTab] = useState<SettingsSubTab>('locations');
  const [draft, setDraft] = useState<SurveySystemConfig>(config);
  const [selectedQKey, setSelectedQKey] = useState<QuestionKey>('S5');
  const [newGiftInput, setNewGiftInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const handleSaveAll = async (nextDraft = draft) => {
    setSaving(true);
    try {
      await saveSurveyConfigToCloud(nextDraft, actorEmail);
      onConfigSaved(nextDraft);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  // ==================== XỬ LÝ VỊ TRÍ KHẢO SÁT ====================
  const updateLocation = (
    idx: number,
    patch: Partial<SurveySystemConfig['locations'][number]>
  ) => {
    setDraft((prev) => {
      const nextLocs = [...prev.locations];
      nextLocs[idx] = { ...nextLocs[idx], ...patch };
      return { ...prev, locations: nextLocs };
    });
  };

  const addLocation = () => {
    setDraft((prev) => {
      const maxId = prev.locations.reduce((m, l) => Math.max(m, l.id), 0);
      const nextId = maxId + 1;
      return {
        ...prev,
        locations: [
          ...prev.locations,
          {
            id: nextId,
            name: `${nextId}. Điểm khảo sát mới`,
            en: `${nextId}. New Survey Point`,
            shortCode: `D${nextId}`,
            quotaTarget: 120,
            active: true,
          },
        ],
      };
    });
  };

  const removeLocation = (id: number) => {
    if (draft.locations.length <= 1) return;
    setDraft((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l.id !== id),
    }));
  };

  // ==================== XỬ LÝ QUÀ TẶNG ====================
  const addGiftPreset = () => {
    const clean = newGiftInput.trim();
    if (!clean) return;
    if (!draft.giftPresets.includes(clean)) {
      setDraft((prev) => ({
        ...prev,
        giftPresets: [...prev.giftPresets, clean],
      }));
    }
    setNewGiftInput('');
  };

  const removeGiftPreset = (gift: string) => {
    if (draft.giftPresets.length <= 1) return;
    setDraft((prev) => ({
      ...prev,
      giftPresets: prev.giftPresets.filter((g) => g !== gift),
    }));
  };

  // ==================== XỬ LÝ ĐÁP ÁN CÂU HỎI ====================
  const activeQ = draft.questions[selectedQKey];

  const updateQuestionMeta = (
    patch: Partial<Pick<typeof activeQ, 'title' | 'enTitle' | 'maxSelect'>>
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [selectedQKey]: {
          ...prev.questions[selectedQKey],
          ...patch,
        },
      },
    }));
  };

  const updateQuestionOption = (
    optIdx: number,
    patch: Partial<ConfigurableOptionItem>
  ) => {
    setDraft((prev) => {
      const q = prev.questions[selectedQKey];
      const nextOpts = [...q.options];
      nextOpts[optIdx] = { ...nextOpts[optIdx], ...patch };
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [selectedQKey]: { ...q, options: nextOpts },
        },
      };
    });
  };

  const addQuestionOption = () => {
    setDraft((prev) => {
      const q = prev.questions[selectedQKey];
      const maxCode = q.options.reduce((m, o) => Math.max(m, o.code), 0);
      const nextCode = maxCode + 1;
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [selectedQKey]: {
            ...q,
            options: [
              ...q.options,
              {
                code: nextCode,
                label: `Đáp án mới (${nextCode})`,
                en: `New option (${nextCode})`,
                hidden: false,
              },
            ],
          },
        },
      };
    });
  };

  const removeQuestionOption = (code: number) => {
    const q = draft.questions[selectedQKey];
    if (q.options.length <= 2) return;
    setDraft((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [selectedQKey]: {
          ...q,
          options: q.options.filter((o) => o.code !== code),
        },
      },
    }));
  };

  const resetCurrentQuestionToDefault = () => {
    const def = getDefaultSurveyConfig();
    setDraft((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [selectedQKey]: def.questions[selectedQKey],
      },
    }));
  };

  const resetEntireConfigToDefault = async () => {
    if (!window.confirm('Khôi phục toàn bộ cấu hình về mặc định ban đầu?')) return;
    const def = getDefaultSurveyConfig();
    setDraft(def);
    await handleSaveAll(def);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Sub-Navigation & Save Button */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSubTab('locations')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'locations'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Vị trí &amp; Quà tặng ({draft.locations.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('questions')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'questions'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            Đáp án từng câu hỏi ({QUESTION_KEYS.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('format')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'format'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Định dạng dữ liệu &amp; Quota
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void resetEntireConfigToDefault()}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            title="Khôi phục mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Mặc định
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveAll()}
            className="px-4 py-2 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            {savedToast ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>
              {saving ? 'Đang lưu...' : savedToast ? 'Đã lưu Cloud!' : 'Lưu cấu hình'}
            </span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: VỊ TRÍ KHẢO SÁT & QUÀ TẶNG ==================== */}
      {subTab === 'locations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Danh sách Vị trí khảo sát hiện trường
              </h3>
              <button
                type="button"
                onClick={addLocation}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm điểm trực
              </button>
            </div>

            <div className="space-y-2.5">
              {draft.locations.map((loc, idx) => (
                <div
                  key={loc.id}
                  className={`p-3 rounded-xl border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center ${
                    loc.active === false
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Tên vị trí (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      value={loc.name}
                      onChange={(e) => updateLocation(idx, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Tên tiếng Anh
                    </label>
                    <input
                      type="text"
                      value={loc.en}
                      onChange={(e) => updateLocation(idx, { en: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Mã tắt (Phiếu)
                    </label>
                    <input
                      type="text"
                      value={loc.shortCode}
                      onChange={(e) =>
                        updateLocation(idx, { shortCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 uppercase"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Chỉ tiêu mẫu
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={loc.quotaTarget}
                      onChange={(e) =>
                        updateLocation(idx, { quotaTarget: Number(e.target.value) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end gap-1 pt-3 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => updateLocation(idx, { active: loc.active === false })}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title={loc.active === false ? 'Hiện điểm này' : 'Ẩn điểm này'}
                    >
                      {loc.active === false ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>
                    {draft.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(loc.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="Xóa điểm khảo sát"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danh sách Quà tặng khảo sát có sẵn */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#d12f2f]" />
              Danh mục Quà tặng khảo sát có sẵn (chọn nhanh cho Đáp viên)
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newGiftInput}
                onChange={(e) => setNewGiftInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGiftPreset();
                  }
                }}
                placeholder="Nhập tên quà tặng mới (VD: Voucher bia thủ công)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
              <button
                type="button"
                onClick={addGiftPreset}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm quà
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {draft.giftPresets.map((gift) => (
                <span
                  key={gift}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
                >
                  {gift}
                  {draft.giftPresets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGiftPreset(gift)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ĐÁP ÁN TỪNG CÂU HỎI ==================== */}
      {subTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cột trái: Chọn câu hỏi */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-3 border border-slate-200 space-y-2 max-h-[70vh] overflow-y-auto">
            <div className="text-xs font-bold text-slate-500 px-1">Chọn câu hỏi cần chỉnh sửa</div>
            <div className="space-y-1">
              {QUESTION_KEYS.map((qKey) => {
                const q = draft.questions[qKey];
                const active = selectedQKey === qKey;
                return (
                  <button
                    key={qKey}
                    type="button"
                    onClick={() => setSelectedQKey(qKey)}
                    className={`w-full px-3 py-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                      active
                        ? 'bg-[#d12f2f] text-white font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs truncate">{q.title}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {q.options.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Nội dung & Danh sách đáp án của câu đang chọn */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-[#d12f2f] uppercase">
                  {activeQ.section} • {activeQ.type === 'single' ? 'Chọn 1 đáp án' : 'Chọn nhiều đáp án'}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeQ.key}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetCurrentQuestionToDefault}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Khôi phục câu {activeQ.key}
                </button>
                <button
                  type="button"
                  onClick={addQuestionOption}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm đáp án
                </button>
              </div>
            </div>

            {/* Tiêu đề câu hỏi & Giới hạn chọn */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className={activeQ.type === 'multi' ? 'sm:col-span-5' : 'sm:col-span-6'}>
                <label className="text-[10px] font-semibold text-slate-400 block">
                  Tiêu đề câu hỏi (Tiếng Việt)
                </label>
                <input
                  type="text"
                  value={activeQ.title}
                  onChange={(e) => updateQuestionMeta({ title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div className={activeQ.type === 'multi' ? 'sm:col-span-5' : 'sm:col-span-6'}>
                <label className="text-[10px] font-semibold text-slate-400 block">
                  Tiêu đề tiếng Anh (EN)
                </label>
                <input
                  type="text"
                  value={activeQ.enTitle}
                  onChange={(e) => updateQuestionMeta({ enTitle: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                />
              </div>

              {activeQ.type === 'multi' && (
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Tối đa (0=Tự do)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={activeQ.maxSelect ?? 0}
                    onChange={(e) =>
                      updateQuestionMeta({ maxSelect: Number(e.target.value) || 0 })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Danh sách các đáp án của câu hỏi */}
            <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
              {activeQ.options.map((opt, idx) => (
                <div
                  key={opt.code}
                  className={`p-2.5 rounded-xl border grid grid-cols-1 sm:grid-cols-12 gap-2 items-center ${
                    opt.hidden
                      ? 'bg-slate-50 border-slate-200 opacity-55'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="sm:col-span-1 flex items-center gap-1">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                      {opt.code}
                    </span>
                  </div>

                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => updateQuestionOption(idx, { label: e.target.value })}
                      placeholder="Nội dung đáp án Tiếng Việt"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={opt.en}
                      onChange={(e) => updateQuestionOption(idx, { en: e.target.value })}
                      placeholder="Nội dung Tiếng Anh (EN)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-end gap-1">
                    {activeQ.section === 'PHẦN S' && (
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestionOption(idx, { stopInterview: !opt.stopInterview })
                        }
                        className={`px-1.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                          opt.stopInterview
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                        title="Nếu khách chọn đáp án này thì dừng phỏng vấn (Screen-out)"
                      >
                        Dừng
                      </button>
                    )}

                    {activeQ.type === 'multi' && (
                      <button
                        type="button"
                        onClick={() => updateQuestionOption(idx, { exclusive: !opt.exclusive })}
                        className={`px-1.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                          opt.exclusive
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                        title="Đáp án loại trừ các lựa chọn khác"
                      >
                        Loại trừ
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => updateQuestionOption(idx, { hidden: !opt.hidden })}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                      title={opt.hidden ? 'Hiện đáp án' : 'Ẩn đáp án'}
                    >
                      {opt.hidden ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </button>

                    {activeQ.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeQuestionOption(opt.code)}
                        className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                        title="Xóa đáp án"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: ĐỊNH DẠNG DỮ LIỆU & CHỈ TIÊU QUOTA ==================== */}
      {subTab === 'format' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tiền tố Mã phiếu khảo sát (VD: BN-2710-CT-001)
            </label>
            <input
              type="text"
              value={draft.dataFormat.surveyCodePrefix}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  dataFormat: {
                    ...prev.dataFormat,
                    surveyCodePrefix: e.target.value.toUpperCase(),
                  },
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Định dạng giá trị khi xuất file CSV
            </label>
            <select
              value={draft.dataFormat.csvValueMode}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  dataFormat: {
                    ...prev.dataFormat,
                    csvValueMode: e.target.value as SurveySystemConfig['dataFormat']['csvValueMode'],
                  },
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium"
            >
              <option value="code_and_label">Mã số + Nhãn chữ (VD: 1 - Nhà hàng buffet)</option>
              <option value="code_only">Chỉ xuất Mã số (VD: 1, 2, 3 — Chuẩn chạy SPSS)</option>
              <option value="label_only">Chỉ xuất Nhãn chữ (VD: Nhà hàng buffet)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ký tự phân cách cột CSV (Delimiter)
            </label>
            <select
              value={draft.dataFormat.csvDelimiter}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  dataFormat: {
                    ...prev.dataFormat,
                    csvDelimiter: e.target.value as ',' | ';',
                  },
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium"
            >
              <option value=",">Dấu phẩy (,) — Chuẩn quốc tế</option>
              <option value=";">Dấu chấm phẩy (;) — Chuẩn Excel Việt Nam</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ký tự ngăn cách câu chọn nhiều đáp án
            </label>
            <select
              value={draft.dataFormat.multiSelectSeparator}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  dataFormat: {
                    ...prev.dataFormat,
                    multiSelectSeparator: e.target
                      .value as SurveySystemConfig['dataFormat']['multiSelectSeparator'],
                  },
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium"
            >
              <option value="; ">Dấu chấm phẩy (; )</option>
              <option value=" | ">Dấu gạch đứng ( | )</option>
              <option value=", ">Dấu phẩy (, )</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tổng chỉ tiêu mẫu toàn chiến dịch (Quota tổng)
            </label>
            <input
              type="number"
              min={1}
              value={draft.dataFormat.totalQuotaTarget}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  dataFormat: {
                    ...prev.dataFormat,
                    totalQuotaTarget: Number(e.target.value) || 600,
                  },
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Chỉ tiêu mẫu mỗi Đáp viên / Ngày
            </label>
            <input
              type="number"
              min={1}
              value={draft.dataFormat.dailyTargetPerPvv}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  dataFormat: {
                    ...prev.dataFormat,
                    dailyTargetPerPvv: Number(e.target.value) || 20,
                  },
                }))
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold"
            />
          </div>
        </div>
      )}
    </div>
  );
};
