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
  CornerDownRight,
  ArrowUp,
  ArrowDown,
  GitBranch,
  MessageSquareText,
} from 'lucide-react';
import {
  SurveySystemConfig,
  SurveySection,
  QuestionInputType,
  QuestionConfigItem,
  ConfigurableOptionItem,
  getDefaultSurveyConfig,
  normalizeQuestionLinks,
  saveSurveyConfigToCloud,
} from '../services/surveyConfig';

interface SystemSettingsProps {
  config: SurveySystemConfig;
  actorEmail?: string;
  onConfigSaved: (next: SurveySystemConfig) => void;
}

type SettingsSubTab = 'locations' | 'questions' | 'format';

const SECTIONS: SurveySection[] = ['PHẦN S', 'PHẦN A', 'PHẦN B', 'PHẦN C'];

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  config,
  actorEmail,
  onConfigSaved,
}) => {
  const [subTab, setSubTab] = useState<SettingsSubTab>('questions');
  const [draft, setDraft] = useState<SurveySystemConfig>(config);
  const [sectionFilter, setSectionFilter] = useState<SurveySection | 'ALL'>('ALL');
  const [selectedQKey, setSelectedQKey] = useState<string>(
    config.questionOrder[0] || 'S1'
  );
  const [newGiftInput, setNewGiftInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Modal / Form tạo câu hỏi mới
  const [showAddQModal, setShowAddQModal] = useState(false);
  const [newQKey, setNewQKey] = useState('');
  const [newQSection, setNewQSection] = useState<SurveySection>('PHẦN S');
  const [newQBranch, setNewQBranch] = useState<'A1_A2' | 'A_NOT_USED' | 'A_USED' | 'ALL'>('ALL');
  const [newQType, setNewQType] = useState<QuestionInputType>('single');
  const [newQTitle, setNewQTitle] = useState('');
  const [newQEnTitle, setNewQEnTitle] = useState('');
  const [newQParentKey, setNewQParentKey] = useState<string>('');
  const [newQTriggerCodes, setNewQTriggerCodes] = useState<number[]>([]);
  const [addQError, setAddQError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(config);
    if (!config.questions[selectedQKey] && config.questionOrder.length > 0) {
      setSelectedQKey(config.questionOrder[0]);
    }
  }, [config, selectedQKey]);

  const applyDraftWithSync = (updater: (prev: SurveySystemConfig) => SurveySystemConfig) => {
    setDraft((prev) => {
      const updated = updater(prev);
      return {
        ...updated,
        questions: normalizeQuestionLinks(updated.questions, updated.questionOrder),
      };
    });
  };

  const handleSaveAll = async (nextDraft = draft) => {
    setSaving(true);
    try {
      const synced: SurveySystemConfig = {
        ...nextDraft,
        questions: normalizeQuestionLinks(nextDraft.questions, nextDraft.questionOrder),
      };
      await saveSurveyConfigToCloud(synced, actorEmail);
      onConfigSaved(synced);
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

  // ==================== XỬ LÝ CÂU HỎI & CÂU HỎI CON ====================
  const orderedKeys = draft.questionOrder.filter((k) => Boolean(draft.questions[k]));
  const filteredKeys = orderedKeys.filter((k) => {
    if (sectionFilter === 'ALL') return true;
    return draft.questions[k]?.section === sectionFilter;
  });

  const activeQ: QuestionConfigItem | undefined =
    draft.questions[selectedQKey] || draft.questions[orderedKeys[0]];

  const suggestNextQuestionKey = (sec: SurveySection, parentKey?: string, optCode?: number) => {
    if (parentKey && optCode !== undefined) {
      let idx = 1;
      while (draft.questions[`${parentKey}_${optCode}_${idx}`]) idx++;
      return idx === 1 && !draft.questions[`${parentKey}_${optCode}`]
        ? `${parentKey}_${optCode}`
        : `${parentKey}_${optCode}_${idx}`;
    }
    const prefix =
      sec === 'PHẦN S' ? 'S' : sec === 'PHẦN A' ? 'A' : sec === 'PHẦN B' ? 'B' : 'C';
    let num = 1;
    while (draft.questions[`${prefix}${num}`]) {
      num++;
    }
    return `${prefix}${num}`;
  };

  const openAddQuestionModal = (
    presetSection?: SurveySection,
    presetParentKey?: string,
    presetOptCode?: number
  ) => {
    const sec =
      presetSection ||
      (presetParentKey ? draft.questions[presetParentKey]?.section : undefined) ||
      (sectionFilter !== 'ALL' ? sectionFilter : activeQ?.section || 'PHẦN S');
    const suggestedKey = suggestNextQuestionKey(sec, presetParentKey, presetOptCode);
    setNewQSection(sec);
    setNewQBranch(
      presetParentKey ? draft.questions[presetParentKey]?.branch || 'ALL' : 'ALL'
    );
    setNewQKey(suggestedKey);
    setNewQType('single');
    setNewQTitle(`${suggestedKey}. Câu hỏi mới`);
    setNewQEnTitle('New question');
    setNewQParentKey(presetParentKey || '');
    setNewQTriggerCodes(presetOptCode !== undefined ? [presetOptCode] : []);
    setAddQError(null);
    setShowAddQModal(true);
  };

  const handleConfirmAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = newQKey
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_');
    if (!cleanKey) {
      setAddQError('Vui lòng nhập mã câu hỏi (VD: S10, A9, A2_1).');
      return;
    }
    if (draft.questions[cleanKey]) {
      setAddQError(`Mã câu hỏi "${cleanKey}" đã tồn tại. Vui lòng chọn mã khác.`);
      return;
    }
    if (!newQTitle.trim()) {
      setAddQError('Vui lòng nhập tiêu đề câu hỏi.');
      return;
    }

    const createdItem: QuestionConfigItem = {
      key: cleanKey,
      section: newQSection,
      branch: newQSection === 'PHẦN A' ? newQBranch : undefined,
      type: newQType,
      title: newQTitle.trim(),
      enTitle: newQEnTitle.trim() || newQTitle.trim(),
      maxSelect: newQType === 'multi' ? 2 : 0,
      placeholder:
        newQType === 'text' ? 'Nhập câu trả lời của du khách...' : undefined,
      required: !newQParentKey,
      hidden: false,
      isCustom: true,
      parentInfo:
        newQParentKey && newQTriggerCodes.length > 0
          ? {
              parentQuestionKey: newQParentKey,
              triggerOptionCodes: [...newQTriggerCodes],
            }
          : null,
      options:
        newQType === 'text'
          ? []
          : [
              { code: 1, label: 'Đáp án 1', en: 'Option 1' },
              { code: 2, label: 'Đáp án 2', en: 'Option 2' },
            ],
    };

    applyDraftWithSync((prev) => {
      const nextQuestions = { ...prev.questions, [cleanKey]: createdItem };
      // Nếu có chọn câu hỏi cha và mã đáp án kích hoạt -> gắn subQuestionKey vào đáp án của câu cha
      if (newQParentKey && nextQuestions[newQParentKey] && newQTriggerCodes.length > 0) {
        const parentQ = nextQuestions[newQParentKey];
        nextQuestions[newQParentKey] = {
          ...parentQ,
          options: parentQ.options.map((opt) =>
            newQTriggerCodes.includes(opt.code)
              ? { ...opt, subQuestionKey: cleanKey }
              : opt
          ),
        };
      }

      // Chèn câu hỏi mới ngay sau câu hỏi cha (nếu có) hoặc cuối danh sách
      const nextOrder = [...prev.questionOrder];
      if (newQParentKey) {
        const parentIdx = nextOrder.indexOf(newQParentKey);
        if (parentIdx !== -1) {
          nextOrder.splice(parentIdx + 1, 0, cleanKey);
        } else {
          nextOrder.push(cleanKey);
        }
      } else {
        nextOrder.push(cleanKey);
      }

      const nextDeleted = (prev.deletedQuestionKeys || []).filter((k) => k !== cleanKey);
      return {
        ...prev,
        questionOrder: nextOrder,
        deletedQuestionKeys: nextDeleted,
        questions: nextQuestions,
      };
    });

    setSelectedQKey(cleanKey);
    setShowAddQModal(false);
  };

  const handleDeleteQuestion = (qKey: string) => {
    if (orderedKeys.length <= 1) {
      window.alert('Cần giữ lại ít nhất 1 câu hỏi trong phiếu khảo sát.');
      return;
    }
    const q = draft.questions[qKey];
    if (!q) return;
    if (
      !window.confirm(
        `Xóa câu hỏi "${q.title}" (${qKey}) khỏi bộ phiếu khảo sát?`
      )
    ) {
      return;
    }

    const currentIdx = orderedKeys.indexOf(qKey);
    const fallbackKey =
      orderedKeys[currentIdx + 1] || orderedKeys[currentIdx - 1] || orderedKeys[0];

    applyDraftWithSync((prev) => {
      const nextQuestions = { ...prev.questions };
      delete nextQuestions[qKey];

      // Gỡ các liên kết subQuestionKey hoặc parentInfo trỏ tới câu hỏi vừa xóa
      Object.keys(nextQuestions).forEach((k) => {
        const item = nextQuestions[k];
        nextQuestions[k] = {
          ...item,
          parentInfo:
            item.parentInfo?.parentQuestionKey === qKey ? null : item.parentInfo,
          options: item.options.map((o) =>
            o.subQuestionKey === qKey ? { ...o, subQuestionKey: undefined } : o
          ),
        };
      });

      const nextOrder = prev.questionOrder.filter((k) => k !== qKey);
      const nextDeleted = Array.from(
        new Set([...(prev.deletedQuestionKeys || []), qKey])
      );

      return {
        ...prev,
        questionOrder: nextOrder,
        deletedQuestionKeys: nextDeleted,
        questions: nextQuestions,
      };
    });

    if (fallbackKey && fallbackKey !== qKey) {
      setSelectedQKey(fallbackKey);
    }
  };

  const moveQuestionOrder = (qKey: string, direction: -1 | 1) => {
    setDraft((prev) => {
      const list = [...prev.questionOrder];
      const idx = list.indexOf(qKey);
      const targetIdx = idx + direction;
      if (idx === -1 || targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, questionOrder: list };
    });
  };

  const updateQuestionMeta = (patch: Partial<QuestionConfigItem>) => {
    if (!activeQ) return;
    applyDraftWithSync((prev) => {
      const current = prev.questions[activeQ.key];
      if (!current) return prev;
      const updated: QuestionConfigItem = {
        ...current,
        ...patch,
      };
      // Nếu đổi từ text sang single/multi mà chưa có đáp án nào -> tạo 2 đáp án mẫu
      if (
        (updated.type === 'single' || updated.type === 'multi') &&
        updated.options.length === 0
      ) {
        updated.options = [
          { code: 1, label: 'Đáp án 1', en: 'Option 1' },
          { code: 2, label: 'Đáp án 2', en: 'Option 2' },
        ];
      }
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [activeQ.key]: updated,
        },
      };
    });
  };

  // Cập nhật liên kết Câu hỏi con từ phía Câu hỏi con (chọn câu cha + các mã đáp án kích hoạt)
  const setChildParentLink = (parentKey: string | null, triggerCodes: number[]) => {
    if (!activeQ) return;
    const childKey = activeQ.key;
    applyDraftWithSync((prev) => {
      const nextQuestions = { ...prev.questions };

      // 1. Xóa toàn bộ subQuestionKey === childKey trên mọi câu hỏi trước
      Object.keys(nextQuestions).forEach((k) => {
        nextQuestions[k] = {
          ...nextQuestions[k],
          options: nextQuestions[k].options.map((opt) =>
            opt.subQuestionKey === childKey ? { ...opt, subQuestionKey: undefined } : opt
          ),
        };
      });

      // 2. Nếu có chọn câu cha & đáp án kích hoạt -> gán vào câu cha và parentInfo của câu con
      if (parentKey && nextQuestions[parentKey] && parentKey !== childKey) {
        const codesToSet =
          triggerCodes.length > 0
            ? triggerCodes
            : nextQuestions[parentKey].options[0]
            ? [nextQuestions[parentKey].options[0].code]
            : [];

        nextQuestions[parentKey] = {
          ...nextQuestions[parentKey],
          options: nextQuestions[parentKey].options.map((opt) =>
            codesToSet.includes(opt.code) ? { ...opt, subQuestionKey: childKey } : opt
          ),
        };

        nextQuestions[childKey] = {
          ...nextQuestions[childKey],
          parentInfo: {
            parentQuestionKey: parentKey,
            triggerOptionCodes: codesToSet,
          },
        };
      } else {
        nextQuestions[childKey] = {
          ...nextQuestions[childKey],
          parentInfo: null,
        };
      }

      return {
        ...prev,
        questions: nextQuestions,
      };
    });
  };

  // ==================== XỬ LÝ CÂU TRẢ LỜI (OPTIONS) ====================
  const updateQuestionOption = (
    optIdx: number,
    patch: Partial<ConfigurableOptionItem>
  ) => {
    if (!activeQ) return;
    applyDraftWithSync((prev) => {
      const q = prev.questions[activeQ.key];
      const nextOpts = [...q.options];
      nextOpts[optIdx] = { ...nextOpts[optIdx], ...patch };
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [activeQ.key]: { ...q, options: nextOpts },
        },
      };
    });
  };

  const addQuestionOption = () => {
    if (!activeQ) return;
    applyDraftWithSync((prev) => {
      const q = prev.questions[activeQ.key];
      const maxCode = q.options.reduce((m, o) => Math.max(m, o.code), 0);
      const nextCode = maxCode + 1;
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [activeQ.key]: {
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
    if (!activeQ) return;
    const q = draft.questions[activeQ.key];
    if (q.options.length <= 1) {
      window.alert('Câu hỏi trắc nghiệm cần ít nhất 1 đáp án.');
      return;
    }
    applyDraftWithSync((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [activeQ.key]: {
          ...q,
          options: q.options.filter((o) => o.code !== code),
        },
      },
    }));
  };

  const resetCurrentQuestionToDefault = () => {
    if (!activeQ) return;
    const def = getDefaultSurveyConfig();
    if (!def.questions[activeQ.key]) return;
    applyDraftWithSync((prev) => ({
      ...prev,
      questions: {
        ...prev.questions,
        [activeQ.key]: def.questions[activeQ.key],
      },
    }));
  };

  const resetEntireConfigToDefault = async () => {
    if (!window.confirm('Khôi phục toàn bộ cấu hình về mặc định ban đầu?')) return;
    const def = getDefaultSurveyConfig();
    setDraft(def);
    setSelectedQKey('S1');
    await handleSaveAll(def);
  };

  // Danh sách các câu hỏi có thể đóng vai trò Câu hỏi cha (có đáp án để chọn)
  const parentCandidates = orderedKeys
    .map((k) => draft.questions[k])
    .filter(
      (q) =>
        q &&
        q.key !== activeQ?.key &&
        (q.type === 'single' || q.type === 'multi') &&
        q.options.length > 0
    );

  return (
    <div className="space-y-4 pb-16">
      {/* Top Sub-Navigation & Save Button */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
            Câu hỏi, Đáp án &amp; Câu hỏi con ({orderedKeys.length})
          </button>

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

      {/* ==================== TAB: QUẢN LÝ CÂU HỎI, CÂU TRẢ LỜI & CÂU HỎI CON ==================== */}
      {subTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cột trái: Danh sách câu hỏi + Thêm câu hỏi mới */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-3 border border-slate-200 flex flex-col gap-2.5 max-h-[78vh]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Danh sách câu hỏi ({filteredKeys.length})
              </span>
              <button
                type="button"
                onClick={() => openAddQuestionModal()}
                className="px-2.5 py-1.5 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] text-white text-xs font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm câu hỏi
              </button>
            </div>

            {/* Bộ lọc theo Phần */}
            <div className="grid grid-cols-5 gap-1">
              {(['ALL', ...SECTIONS] as const).map((sec) => {
                const active = sectionFilter === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSectionFilter(sec)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sec === 'ALL' ? 'Tất cả' : sec.replace('PHẦN ', 'P.')}
                  </button>
                );
              })}
            </div>

            {/* Danh sách cuộn */}
            <div className="space-y-1 overflow-y-auto pr-1 flex-1">
              {filteredKeys.map((qKey) => {
                const q = draft.questions[qKey];
                if (!q) return null;
                const active = activeQ?.key === qKey;
                const isSub = Boolean(q.parentInfo?.parentQuestionKey);
                return (
                  <button
                    key={qKey}
                    type="button"
                    onClick={() => setSelectedQKey(qKey)}
                    className={`w-full px-2.5 py-2 rounded-xl text-left transition flex flex-col gap-0.5 cursor-pointer border ${
                      active
                        ? 'bg-red-50/90 border-[#d12f2f] text-slate-900'
                        : q.hidden
                        ? 'bg-slate-50 border-slate-200/70 text-slate-400 opacity-65'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    } ${isSub ? 'pl-5' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <span className="text-xs font-semibold truncate flex items-center gap-1">
                        {isSub && (
                          <CornerDownRight className="w-3.5 h-3.5 text-[#d12f2f] shrink-0" />
                        )}
                        <span className="truncate">{q.title}</span>
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          active
                            ? 'bg-[#d12f2f] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {q.type === 'text' ? 'Tự luận' : `${q.options.length} ĐA`}
                      </span>
                    </div>

                    {isSub && q.parentInfo && (
                      <div className="text-[10px] font-medium text-[#d12f2f] truncate">
                        Câu hỏi con của {q.parentInfo.parentQuestionKey} (Đáp án:{' '}
                        {q.parentInfo.triggerOptionCodes.join(', ')})
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Chỉnh sửa câu hỏi, Điều kiện câu hỏi con & Danh sách đáp án */}
          {activeQ && (
            <div className="lg:col-span-8 bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
              {/* Thanh tiêu đề & Thao tác trên câu hỏi */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-lg bg-red-50 text-[#d12f2f] border border-red-200 font-mono text-xs font-bold">
                    {activeQ.key}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">
                      {activeQ.section} •{' '}
                      {activeQ.type === 'single'
                        ? 'Chọn 1 đáp án'
                        : activeQ.type === 'multi'
                        ? 'Chọn nhiều đáp án'
                        : 'Câu hỏi tự luận (Nhập chữ/số)'}
                    </span>
                    {activeQ.parentInfo && (
                      <span className="text-[11px] font-semibold text-[#d12f2f] inline-flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        Câu hỏi con của {activeQ.parentInfo.parentQuestionKey} (khi chọn đáp án{' '}
                        {activeQ.parentInfo.triggerOptionCodes.join(', ')})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveQuestionOrder(activeQ.key, -1)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="Đưa câu hỏi lên trên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestionOrder(activeQ.key, 1)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="Đưa câu hỏi xuống dưới"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => updateQuestionMeta({ hidden: !activeQ.hidden })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border cursor-pointer ${
                      activeQ.hidden
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {activeQ.hidden ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        Đang ẩn
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        Đang hiện
                      </>
                    )}
                  </button>

                  {getDefaultSurveyConfig().questions[activeQ.key] && (
                    <button
                      type="button"
                      onClick={resetCurrentQuestionToDefault}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      title="Khôi phục câu hỏi này về mặc định"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Gốc
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(activeQ.key)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa câu hỏi
                  </button>
                </div>
              </div>

              {/* Thông tin chung của câu hỏi: Phần, Loại câu hỏi, Bắt buộc, Tiêu đề VI/EN */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-3">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Thuộc Phần khảo sát
                  </label>
                  <select
                    value={activeQ.section}
                    onChange={(e) =>
                      updateQuestionMeta({ section: e.target.value as SurveySection })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Loại câu hỏi
                  </label>
                  <select
                    value={activeQ.type}
                    onChange={(e) =>
                      updateQuestionMeta({ type: e.target.value as QuestionInputType })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <option value="single">Trắc nghiệm — Chọn 1 đáp án</option>
                    <option value="multi">Hộp kiểm — Chọn nhiều đáp án</option>
                    <option value="text">Tự luận — Nhập văn bản / con số</option>
                  </select>
                </div>

                {activeQ.type === 'multi' ? (
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Chọn tối đa (0=Tự do)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={activeQ.maxSelect ?? 0}
                      onChange={(e) =>
                        updateQuestionMeta({ maxSelect: Number(e.target.value) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>
                ) : (
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Bắt buộc trả lời
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestionMeta({ required: activeQ.required === false })
                      }
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        activeQ.required !== false
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {activeQ.required !== false ? 'Bắt buộc' : 'Tùy chọn'}
                    </button>
                  </div>
                )}

                {activeQ.section === 'PHẦN A' && (
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-400 block">
                      Nhánh Phần A
                    </label>
                    <select
                      value={activeQ.branch || 'ALL'}
                      onChange={(e) =>
                        updateQuestionMeta({
                          branch: e.target.value as QuestionConfigItem['branch'],
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      <option value="A1_A2">Bước A1–A2 (Dự kiến &amp; Đã dùng)</option>
                      <option value="A_NOT_USED">Nhánh Chưa dùng F&amp;B (A3)</option>
                      <option value="A_USED">Nhánh Đã dùng F&amp;B (A4–A8)</option>
                      <option value="ALL">Luôn hiển thị ở Bước A3–A8</option>
                    </select>
                  </div>
                )}

                <div className="sm:col-span-6">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Nội dung câu hỏi (Tiếng Việt)
                  </label>
                  <input
                    type="text"
                    value={activeQ.title}
                    onChange={(e) => updateQuestionMeta({ title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Nội dung câu hỏi (Tiếng Anh - EN)
                  </label>
                  <input
                    type="text"
                    value={activeQ.enTitle}
                    onChange={(e) => updateQuestionMeta({ enTitle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  />
                </div>
              </div>

              {/* Khối cấu hình CÂU HỎI CON (Điều kiện hiển thị khi chọn đáp án xác định) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-[#d12f2f]" />
                    <span>
                      Điều kiện hiển thị (Chọn làm Câu hỏi con khi chọn đáp án xác định)
                    </span>
                  </div>

                  <select
                    value={activeQ.parentInfo?.parentQuestionKey || ''}
                    onChange={(e) => {
                      const nextPKey = e.target.value || null;
                      setChildParentLink(nextPKey, []);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <option value="">— Là câu hỏi độc lập (Luôn hiển thị) —</option>
                    {parentCandidates.map((pq) => (
                      <option key={pq.key} value={pq.key}>
                        Là câu hỏi con của: {pq.title}
                      </option>
                    ))}
                  </select>
                </div>

                {activeQ.parentInfo?.parentQuestionKey &&
                  draft.questions[activeQ.parentInfo.parentQuestionKey] && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] font-medium text-slate-600">
                        Chọn (các) đáp án của câu{' '}
                        <strong>{activeQ.parentInfo.parentQuestionKey}</strong> sẽ làm xuất hiện
                        câu hỏi con <strong>{activeQ.key}</strong>:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {draft.questions[
                          activeQ.parentInfo.parentQuestionKey
                        ].options.map((pOpt) => {
                          const isTriggered =
                            activeQ.parentInfo?.triggerOptionCodes.includes(pOpt.code) ||
                            false;
                          return (
                            <button
                              key={pOpt.code}
                              type="button"
                              onClick={() => {
                                const curCodes =
                                  activeQ.parentInfo?.triggerOptionCodes || [];
                                const nextCodes = isTriggered
                                  ? curCodes.filter((c) => c !== pOpt.code)
                                  : [...curCodes, pOpt.code];
                                setChildParentLink(
                                  activeQ.parentInfo!.parentQuestionKey,
                                  nextCodes
                                );
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                                isTriggered
                                  ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              [{pOpt.code}] {pOpt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              {/* Nếu là câu hỏi tự luận (text) -> Cấu hình gợi ý nhập (placeholder) */}
              {activeQ.type === 'text' ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquareText className="w-4 h-4 text-[#d12f2f]" />
                    Cấu hình ô nhập câu trả lời tự luận
                  </div>
                  <label className="text-[10px] font-semibold text-slate-400 block">
                    Dòng chữ gợi ý trong ô nhập (Placeholder)
                  </label>
                  <input
                    type="text"
                    value={activeQ.placeholder || ''}
                    onChange={(e) => updateQuestionMeta({ placeholder: e.target.value })}
                    placeholder="VD: Nhập câu trả lời chi tiết của du khách..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              ) : (
                /* Danh sách các đáp án của câu hỏi trắc nghiệm (single / multi) */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Danh sách câu trả lời ({activeQ.options.length} đáp án)
                    </span>
                    <button
                      type="button"
                      onClick={addQuestionOption}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm câu trả lời
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[48vh] overflow-y-auto pr-1">
                    {activeQ.options.map((opt, idx) => (
                      <div
                        key={`${opt.code}_${idx}`}
                        className={`p-2.5 rounded-xl border space-y-2 ${
                          opt.hidden
                            ? 'bg-slate-50 border-slate-200 opacity-55'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Hàng 1: Mã đáp án, Nội dung VI, Nội dung EN, Các nút cờ */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                          <div className="sm:col-span-1 flex items-center">
                            <input
                              type="number"
                              value={opt.code}
                              onChange={(e) =>
                                updateQuestionOption(idx, {
                                  code: Number(e.target.value) || 0,
                                })
                              }
                              title="Mã số đáp án"
                              className="w-12 px-1.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-bold text-center"
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) =>
                                updateQuestionOption(idx, { label: e.target.value })
                              }
                              placeholder="Nội dung đáp án Tiếng Việt"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <input
                              type="text"
                              value={opt.en}
                              onChange={(e) =>
                                updateQuestionOption(idx, { en: e.target.value })
                              }
                              placeholder="Nội dung Tiếng Anh (EN)"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600"
                            />
                          </div>

                          <div className="sm:col-span-3 flex flex-wrap items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuestionOption(idx, {
                                  stopInterview: !opt.stopInterview,
                                })
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

                            {activeQ.type === 'multi' && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuestionOption(idx, {
                                    exclusive: !opt.exclusive,
                                  })
                                }
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
                              onClick={() =>
                                updateQuestionOption(idx, {
                                  hasOtherInput: !opt.hasOtherInput,
                                })
                              }
                              className={`px-1.5 py-1 rounded text-[10px] font-bold border cursor-pointer ${
                                opt.hasOtherInput
                                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}
                              title="Hiện ô nhập văn bản 'Khác (ghi rõ)...' ngay khi chọn đáp án này"
                            >
                              Nhập Khác
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuestionOption(idx, { hidden: !opt.hidden })
                              }
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                              title={opt.hidden ? 'Hiện đáp án' : 'Ẩn đáp án'}
                            >
                              {opt.hidden ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => removeQuestionOption(opt.code)}
                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                              title="Xóa đáp án"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Hàng 2: Chọn Câu hỏi con khi người trả lời chọn đáp án này */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pl-2 pt-1 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#d12f2f]" />
                            <span className="text-[11px] font-medium">
                              Khi chọn đáp án này → Mở câu hỏi con:
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
                            <select
                              value={opt.subQuestionKey || ''}
                              onChange={(e) =>
                                updateQuestionOption(idx, {
                                  subQuestionKey: e.target.value || undefined,
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold max-w-[260px] truncate ${
                                opt.subQuestionKey
                                  ? 'bg-red-50 text-[#d12f2f] border-red-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              <option value="">— Không mở câu hỏi con —</option>
                              {orderedKeys
                                .filter((k) => k !== activeQ.key)
                                .map((k) => {
                                  const candidate = draft.questions[k];
                                  if (!candidate) return null;
                                  return (
                                    <option key={k} value={k}>
                                      [{k}] {candidate.title}
                                    </option>
                                  );
                                })}
                            </select>

                            {opt.subQuestionKey && draft.questions[opt.subQuestionKey] && (
                              <button
                                type="button"
                                onClick={() => setSelectedQKey(opt.subQuestionKey!)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                                title="Chuyển tới chỉnh sửa câu hỏi con này"
                              >
                                Sửa {opt.subQuestionKey}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openAddQuestionModal(
                                  activeQ.section,
                                  activeQ.key,
                                  opt.code
                                )
                              }
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                              title="Tạo mới một câu hỏi con gắn trực tiếp vào đáp án này"
                            >
                              <Plus className="w-3 h-3" />
                              Tạo câu con
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL THÊM CÂU HỎI / CÂU HỎI CON MỚI ==================== */}
      {showAddQModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmAddQuestion}
            className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {newQParentKey
                    ? `Tạo câu hỏi con cho câu ${newQParentKey}`
                    : 'Thêm câu hỏi khảo sát mới'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ câu hỏi chọn 1, chọn nhiều hoặc tự luận, có thể gắn làm câu hỏi con.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddQModal(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {addQError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {addQError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">
                  Mã câu hỏi (Duy nhất)
                </label>
                <input
                  type="text"
                  value={newQKey}
                  onChange={(e) => setNewQKey(e.target.value.toUpperCase())}
                  placeholder="VD: S10, A2_1"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">
                  Thuộc Phần
                </label>
                <select
                  value={newQSection}
                  onChange={(e) => {
                    const sec = e.target.value as SurveySection;
                    setNewQSection(sec);
                    if (!newQParentKey) {
                      setNewQKey(suggestNextQuestionKey(sec));
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">
                  Loại câu hỏi
                </label>
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as QuestionInputType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold"
                >
                  <option value="single">Chọn 1 đáp án</option>
                  <option value="multi">Chọn nhiều đáp án</option>
                  <option value="text">Tự luận (Nhập chữ/số)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">
                  Tiêu đề câu hỏi (Tiếng Việt)
                </label>
                <input
                  type="text"
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  placeholder="Nhập câu hỏi tiếng Việt..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 block">
                  Tiêu đề tiếng Anh (EN)
                </label>
                <input
                  type="text"
                  value={newQEnTitle}
                  onChange={(e) => setNewQEnTitle(e.target.value)}
                  placeholder="English question title..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Tùy chọn gắn làm Câu hỏi con */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Gắn làm Câu hỏi con (Chỉ hiện khi chọn đáp án xác định):
              </label>
              <select
                value={newQParentKey}
                onChange={(e) => {
                  const pk = e.target.value;
                  setNewQParentKey(pk);
                  if (pk && draft.questions[pk]?.options[0]) {
                    const firstCode = draft.questions[pk].options[0].code;
                    setNewQTriggerCodes([firstCode]);
                    setNewQSection(draft.questions[pk].section);
                    setNewQKey(
                      suggestNextQuestionKey(draft.questions[pk].section, pk, firstCode)
                    );
                  } else {
                    setNewQTriggerCodes([]);
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium"
              >
                <option value="">— Không (Đây là câu hỏi chính độc lập) —</option>
                {orderedKeys.map((k) => {
                  const pq = draft.questions[k];
                  if (!pq || pq.type === 'text') return null;
                  return (
                    <option key={k} value={k}>
                      Câu hỏi cha: [{k}] {pq.title}
                    </option>
                  );
                })}
              </select>

              {newQParentKey && draft.questions[newQParentKey] && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    Tích chọn đáp án kích hoạt của câu {newQParentKey}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {draft.questions[newQParentKey].options.map((opt) => {
                      const active = newQTriggerCodes.includes(opt.code);
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          onClick={() => {
                            setNewQTriggerCodes((prev) =>
                              prev.includes(opt.code)
                                ? prev.filter((c) => c !== opt.code)
                                : [...prev, opt.code]
                            );
                          }}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border cursor-pointer ${
                            active
                              ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          [{opt.code}] {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddQModal(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tạo câu hỏi
              </button>
            </div>
          </form>
        </div>
      )}

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
              Định mức mẫu / ngày / Đáp viên
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
