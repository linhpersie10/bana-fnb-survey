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
  ExternalLink,
  X,
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
  actorRole?: 'superadmin' | 'admin' | 'interviewer';
  onConfigSaved: (next: SurveySystemConfig) => void;
}

type SettingsSubTab = 'questions' | 'locations' | 'format';

const SECTIONS: SurveySection[] = ['PHẦN S', 'PHẦN A', 'PHẦN B', 'PHẦN C'];

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  config,
  actorEmail,
  actorRole = 'admin',
  onConfigSaved,
}) => {
  const [subTab, setSubTab] = useState<SettingsSubTab>('questions');
  const [draft, setDraft] = useState<SurveySystemConfig>(config);
  const [sectionFilter, setSectionFilter] = useState<SurveySection | 'ALL'>('ALL');
  const [selectedQKey, setSelectedQKey] = useState<string>(
    config.questionOrder[0] || 'S1'
  );
  const [expandedOptCode, setExpandedOptCode] = useState<number | null>(null);
  const [showParentConfigBox, setShowParentConfigBox] = useState(false);

  const [newGiftInput, setNewGiftInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modal tạo câu hỏi mới / câu hỏi con
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

  const handleSaveAll = async (nextDraft = draft) => {
    setSaving(true);
    setSaveError(null);
    try {
      const synced: SurveySystemConfig = {
        ...nextDraft,
        questions: normalizeQuestionLinks(nextDraft.questions, nextDraft.questionOrder),
      };
      await saveSurveyConfigToCloud(synced, actorEmail);
      onConfigSaved(synced);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2200);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Lỗi kết nối Firestore';
      setSaveError(`Đã lưu trên máy. Chưa đồng bộ Cloud (${msg}).`);
    } finally {
      setSaving(false);
    }
  };

  const applyDraftWithSync = (
    updater: (prev: SurveySystemConfig) => SurveySystemConfig,
    autoSaveCloud = false
  ) => {
    const updated = updater(draft);
    const nextSynced: SurveySystemConfig = {
      ...updated,
      questions: normalizeQuestionLinks(updated.questions, updated.questionOrder),
    };
    setDraft(nextSynced);
    if (autoSaveCloud) {
      void handleSaveAll(nextSynced);
    }
  };

  // ==================== XỬ LÝ VỊ TRÍ KHẢO SÁT & QUÀ TẶNG ====================
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

  const hasParentLink = Boolean(activeQ?.parentInfo?.parentQuestionKey);

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
    setNewQTitle(`${suggestedKey}. Nội dung câu hỏi mới`);
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
              { code: 1, label: 'Lựa chọn 1', en: 'Option 1' },
              { code: 2, label: 'Lựa chọn 2', en: 'Option 2' },
            ],
    };

    applyDraftWithSync((prev) => {
      const nextQuestions = { ...prev.questions, [cleanKey]: createdItem };
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
    }, true);

    setSelectedQKey(cleanKey);
    setExpandedOptCode(null);
    setShowAddQModal(false);
  };

  const handleDeleteQuestion = (qKey: string) => {
    if (orderedKeys.length <= 1) {
      window.alert('Cần giữ lại ít nhất 1 câu hỏi trong phiếu khảo sát.');
      return;
    }
    const q = draft.questions[qKey];
    if (!q) return;
    if (!window.confirm(`Xóa câu hỏi "${q.title}" (${qKey})?`)) {
      return;
    }

    const currentIdx = orderedKeys.indexOf(qKey);
    const fallbackKey =
      orderedKeys[currentIdx + 1] || orderedKeys[currentIdx - 1] || orderedKeys[0];

    applyDraftWithSync((prev) => {
      const nextQuestions = { ...prev.questions };
      delete nextQuestions[qKey];

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
    }, true);

    if (fallbackKey && fallbackKey !== qKey) {
      setSelectedQKey(fallbackKey);
    }
  };

  const moveQuestionOrder = (qKey: string, direction: -1 | 1) => {
    applyDraftWithSync((prev) => {
      const list = [...prev.questionOrder];
      const idx = list.indexOf(qKey);
      const targetIdx = idx + direction;
      if (idx === -1 || targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, questionOrder: list };
    }, true);
  };

  const updateQuestionMeta = (
    patch: Partial<QuestionConfigItem>,
    autoSaveCloud = false
  ) => {
    if (!activeQ) return;
    applyDraftWithSync((prev) => {
      const current = prev.questions[activeQ.key];
      if (!current) return prev;
      const updated: QuestionConfigItem = {
        ...current,
        ...patch,
      };
      if (
        (updated.type === 'single' || updated.type === 'multi') &&
        updated.options.length === 0
      ) {
        updated.options = [
          { code: 1, label: 'Lựa chọn 1', en: 'Option 1' },
          { code: 2, label: 'Lựa chọn 2', en: 'Option 2' },
        ];
      }
      return {
        ...prev,
        questions: {
          ...prev.questions,
          [activeQ.key]: updated,
        },
      };
    }, autoSaveCloud);
  };

  const setChildParentLink = (parentKey: string | null, triggerCodes: number[]) => {
    if (!activeQ) return;
    const childKey = activeQ.key;
    applyDraftWithSync((prev) => {
      const nextQuestions = { ...prev.questions };

      Object.keys(nextQuestions).forEach((k) => {
        nextQuestions[k] = {
          ...nextQuestions[k],
          options: nextQuestions[k].options.map((opt) =>
            opt.subQuestionKey === childKey ? { ...opt, subQuestionKey: undefined } : opt
          ),
        };
      });

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
    }, true);
  };

  // ==================== XỬ LÝ CÂU TRẢ LỜI (OPTIONS) ====================
  const updateQuestionOption = (
    optIdx: number,
    patch: Partial<ConfigurableOptionItem>,
    autoSaveCloud = false
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
    }, autoSaveCloud);
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
                label: `Lựa chọn ${nextCode}`,
                en: `Option ${nextCode}`,
                hidden: false,
              },
            ],
          },
        },
      };
    }, true);
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
    }), true);
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
    }), true);
  };

  const resetEntireConfigToDefault = async () => {
    if (!window.confirm('Khôi phục toàn bộ cấu hình về mặc định ban đầu?')) return;
    const def = getDefaultSurveyConfig();
    setDraft(def);
    setSelectedQKey('S1');
    await handleSaveAll(def);
  };

  const parentCandidates = orderedKeys
    .map((k) => draft.questions[k])
    .filter(
      (q) =>
        q &&
        q.key !== activeQ?.key &&
        (q.type === 'single' || q.type === 'multi') &&
        q.options.length > 0
    );

  // Rút gọn tiêu đề hiển thị ở cột trái (bỏ phần lặp lại mã câu nếu có)
  const cleanShortTitle = (q: QuestionConfigItem) => {
    const prefixRegex = new RegExp(`^${q.key.replace('_', '\\.')}\\.?\\s*`, 'i');
    return q.title.replace(prefixRegex, '');
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Thanh điều hướng phụ & Nút Lưu Cloud */}
      <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSubTab('questions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'questions'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-[#d12f2f]" />
            Bộ câu hỏi &amp; Rẽ nhánh ({orderedKeys.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('locations')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'locations'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#d12f2f]" />
            Điểm khảo sát &amp; Quà tặng ({draft.locations.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('format')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'format'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#d12f2f]" />
            Định dạng CSV &amp; Quota
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
            Quyền {actorRole === 'superadmin' ? 'Superadmin' : 'Admin'}: Toàn quyền Thêm / Sửa / Xóa
          </span>
          <button
            type="button"
            onClick={() => void resetEntireConfigToDefault()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục mặc định
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveAll()}
            className="px-4 py-1.5 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            {savedToast ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>
              {saving ? 'Đang đồng bộ...' : savedToast ? 'Đã lưu lên Cloud!' : 'Lưu cấu hình'}
            </span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center justify-between">
          <span>{saveError}</span>
          <button
            type="button"
            onClick={() => void handleSaveAll()}
            className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold cursor-pointer"
          >
            Thử đồng bộ lại
          </button>
        </div>
      )}

      {/* ==================== TAB 1: BỘ CÂU HỎI & RẼ NHÁNH ==================== */}
      {subTab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* CỘT TRÁI (4/12): Cây danh sách câu hỏi */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-3 border-b border-slate-100 space-y-2.5 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800">
                  Danh mục câu hỏi ({filteredKeys.length})
                </span>
                <button
                  type="button"
                  onClick={() => openAddQuestionModal()}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm câu hỏi
                </button>
              </div>

              {/* Tab lọc nhanh theo Phần */}
              <div className="grid grid-cols-5 gap-1 bg-slate-200/70 p-0.5 rounded-lg">
                {(['ALL', ...SECTIONS] as const).map((sec) => {
                  const active = sectionFilter === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSectionFilter(sec)}
                      className={`py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {sec === 'ALL' ? 'Tất cả' : sec.replace('PHẦN ', 'Phần ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Danh sách câu hỏi phân cấp rõ ràng */}
            <div className="p-2 space-y-1 overflow-y-auto flex-1">
              {filteredKeys.map((qKey) => {
                const q = draft.questions[qKey];
                if (!q) return null;
                const active = activeQ?.key === qKey;
                const isSub = Boolean(q.parentInfo?.parentQuestionKey);
                return (
                  <button
                    key={qKey}
                    type="button"
                    onClick={() => {
                      setSelectedQKey(qKey);
                      setExpandedOptCode(null);
                      setShowParentConfigBox(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left transition flex items-start gap-2.5 cursor-pointer border ${
                      active
                        ? 'bg-red-50/70 border-[#d12f2f] text-slate-900'
                        : q.hidden
                        ? 'bg-slate-50 border-transparent text-slate-400 opacity-60'
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-700'
                    } ${isSub ? 'ml-4 w-[calc(100%-1rem)] border-l-2 border-l-red-200' : ''}`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 mt-0.5 ${
                        active
                          ? 'bg-[#d12f2f] text-white'
                          : isSub
                          ? 'bg-red-50 text-[#d12f2f]'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.key.replace('_', '.')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium leading-snug line-clamp-2">
                        {cleanShortTitle(q)}
                      </div>
                      {isSub && q.parentInfo && (
                        <div className="text-[10px] font-semibold text-[#d12f2f] mt-0.5 flex items-center gap-1">
                          <CornerDownRight className="w-3 h-3 shrink-0" />
                          <span>
                            Mở khi {q.parentInfo.parentQuestionKey} chọn [
                            {q.parentInfo.triggerOptionCodes.join(', ')}]
                          </span>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 mt-0.5">
                      {q.type === 'text' ? 'Tự luận' : `${q.options.length}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI (8/12): Trình biên tập Câu hỏi & Đáp án gọn, thoáng */}
          {activeQ && (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* 1. Thanh công cụ đầu câu hỏi */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#d12f2f] text-white font-mono text-xs font-bold">
                    {activeQ.key.replace('_', '.')}
                  </span>

                  {/* Chọn Phần */}
                  <select
                    value={activeQ.section}
                    onChange={(e) =>
                      updateQuestionMeta({ section: e.target.value as SurveySection }, true)
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-400"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {/* Chọn Loại câu hỏi (Segmented Control) */}
                  <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg">
                    {(
                      [
                        { id: 'single', label: 'Chọn 1' },
                        { id: 'multi', label: 'Chọn nhiều' },
                        { id: 'text', label: 'Tự luận' },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateQuestionMeta({ type: t.id }, true)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                          activeQ.type === t.id
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Nếu là Chọn nhiều -> Hiện ô Giới hạn tối đa */}
                  {activeQ.type === 'multi' && (
                    <div className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-500">Tối đa:</span>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={activeQ.maxSelect ?? 0}
                        onChange={(e) =>
                          updateQuestionMeta({ maxSelect: Number(e.target.value) || 0 })
                        }
                        onBlur={() => void handleSaveAll()}
                        className="w-10 text-center font-bold text-slate-900 focus:outline-none"
                        title="0 = Không giới hạn số đáp án được chọn"
                      />
                    </div>
                  )}

                  {/* Bắt buộc trả lời */}
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestionMeta({ required: activeQ.required === false }, true)
                    }
                    className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      activeQ.required !== false
                        ? 'bg-white text-slate-800 border-slate-300'
                        : 'bg-transparent text-slate-400 border-slate-200'
                    }`}
                  >
                    {activeQ.required !== false ? '• Bắt buộc' : 'Không bắt buộc'}
                  </button>
                </div>

                {/* Nhóm nút thao tác gọn nhẹ bên phải */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestionOrder(activeQ.key, -1)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Chuyển lên trên"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestionOrder(activeQ.key, 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Chuyển xuống dưới"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => updateQuestionMeta({ hidden: !activeQ.hidden }, true)}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      activeQ.hidden
                        ? 'bg-amber-50 text-amber-700'
                        : 'hover:bg-slate-200/70 text-slate-500 hover:text-slate-800'
                    }`}
                    title={activeQ.hidden ? 'Câu hỏi đang ẩn (Bấm để hiện)' : 'Ẩn câu hỏi này'}
                  >
                    {activeQ.hidden ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  {getDefaultSurveyConfig().questions[activeQ.key] && (
                    <button
                      type="button"
                      onClick={resetCurrentQuestionToDefault}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 cursor-pointer"
                      title="Khôi phục câu hỏi này về mặc định"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(activeQ.key)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* 2. Khung Điều kiện Câu hỏi con (Chỉ hiện khi câu này là câu con hoặc khi bấm nút gắn điều kiện) */}
                {hasParentLink || showParentConfigBox ? (
                  <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-[#d12f2f] flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Điều kiện xuất hiện (Câu hỏi con phụ thuộc đáp án)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setChildParentLink(null, []);
                          setShowParentConfigBox(false);
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Chuyển về câu hỏi độc lập
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      <span className="sm:col-span-3 text-xs font-medium text-slate-600">
                        Phụ thuộc câu hỏi cha:
                      </span>
                      <div className="sm:col-span-9">
                        <select
                          value={activeQ.parentInfo?.parentQuestionKey || ''}
                          onChange={(e) => {
                            const nextPKey = e.target.value || null;
                            setChildParentLink(nextPKey, []);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#d12f2f]"
                        >
                          <option value="">— Chọn câu hỏi cha —</option>
                          {parentCandidates.map((pq) => (
                            <option key={pq.key} value={pq.key}>
                              {pq.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {activeQ.parentInfo?.parentQuestionKey &&
                      draft.questions[activeQ.parentInfo.parentQuestionKey] && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[11px] font-medium text-slate-600 block">
                            Chỉ hiện câu <strong>{activeQ.key}</strong> khi người trả lời chọn
                            một trong các đáp án sau:
                          </span>
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
                                  {pOpt.code}. {pOpt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Câu hỏi chính hiển thị trực tiếp trong {activeQ.section}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowParentConfigBox(true)}
                      className="text-xs font-semibold text-[#d12f2f] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Đặt làm câu hỏi con (chỉ hiện khi chọn đáp án)...
                    </button>
                  </div>
                )}

                {/* 3. Tiêu đề câu hỏi (Full-width 100% để không bao giờ bị cắt chữ) */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Nội dung câu hỏi (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      value={activeQ.title}
                      onChange={(e) => updateQuestionMeta({ title: e.target.value })}
                      onBlur={() => void handleSaveAll()}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#d12f2f] text-sm font-semibold text-slate-900 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Bản dịch Tiếng Anh (English Subtitle)
                    </label>
                    <input
                      type="text"
                      value={activeQ.enTitle}
                      onChange={(e) => updateQuestionMeta({ enTitle: e.target.value })}
                      onBlur={() => void handleSaveAll()}
                      className="w-full px-3.5 py-1.5 rounded-xl bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-slate-400 text-xs text-slate-600 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* 4. Nội dung trả lời: Tự luận hoặc Danh sách đáp án gọn 1 hàng */}
                {activeQ.type === 'text' ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MessageSquareText className="w-4 h-4 text-[#d12f2f]" />
                      Câu hỏi tự luận (Đáp viên nhập chữ hoặc số trên iPad/điện thoại)
                    </div>
                    <input
                      type="text"
                      value={activeQ.placeholder || ''}
                      onChange={(e) => updateQuestionMeta({ placeholder: e.target.value })}
                      onBlur={() => void handleSaveAll()}
                      placeholder="Nhập dòng chữ gợi ý trong ô trả lời (Placeholder)..."
                      className="w-full px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#d12f2f]"
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-xs font-bold text-slate-800">
                        Các phương án trả lời ({activeQ.options.length})
                      </div>
                      <button
                        type="button"
                        onClick={addQuestionOption}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm phương án
                      </button>
                    </div>

                    {/* Bảng phương án trả lời gọn 1 dòng / phương án */}
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                      {activeQ.options.map((opt, idx) => {
                        const isBranchOpen =
                          expandedOptCode === opt.code || Boolean(opt.subQuestionKey);
                        return (
                          <div
                            key={`${opt.code}_${idx}`}
                            className={`p-2.5 transition ${
                              opt.hidden ? 'bg-slate-50 opacity-55' : 'bg-white hover:bg-slate-50/50'
                            }`}
                          >
                            {/* Dòng chính của phương án */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              {/* Mã số */}
                              <input
                                type="number"
                                value={opt.code}
                                onChange={(e) =>
                                  updateQuestionOption(idx, {
                                    code: Number(e.target.value) || 0,
                                  })
                                }
                                onBlur={() => void handleSaveAll()}
                                title="Mã số đáp án"
                                className="w-11 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold text-center shrink-0 focus:outline-none focus:border-slate-400"
                              />

                              {/* Nhãn Tiếng Việt */}
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) =>
                                  updateQuestionOption(idx, { label: e.target.value })
                                }
                                onBlur={() => void handleSaveAll()}
                                placeholder="Nội dung đáp án (Tiếng Việt)..."
                                className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#d12f2f] text-xs font-medium text-slate-900 focus:outline-none"
                              />

                              {/* Nhãn Tiếng Anh */}
                              <input
                                type="text"
                                value={opt.en}
                                onChange={(e) =>
                                  updateQuestionOption(idx, { en: e.target.value })
                                }
                                onBlur={() => void handleSaveAll()}
                                placeholder="English label..."
                                className="sm:w-52 min-w-0 px-2.5 py-1.5 rounded-lg bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-slate-400 text-xs text-slate-500 focus:outline-none"
                              />

                              {/* Các nút tác vụ gọn trên cùng 1 hàng */}
                              <div className="flex items-center gap-1 shrink-0 justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedOptCode(
                                      expandedOptCode === opt.code ? null : opt.code
                                    )
                                  }
                                  className={`px-2 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 border transition cursor-pointer ${
                                    opt.subQuestionKey
                                      ? 'bg-red-50 text-[#d12f2f] border-red-200'
                                      : expandedOptCode === opt.code
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                                  }`}
                                  title="Chọn câu hỏi con sẽ mở ra khi chọn đáp án này"
                                >
                                  <CornerDownRight className="w-3 h-3" />
                                  <span>
                                    {opt.subQuestionKey
                                      ? `Mở ${opt.subQuestionKey.replace('_', '.')}`
                                      : 'Câu con'}
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestionOption(
                                      idx,
                                      {
                                        stopInterview: !opt.stopInterview,
                                      },
                                      true
                                    )
                                  }
                                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                                    opt.stopInterview
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                                  }`}
                                  title="Dừng phỏng vấn (Screen-out) nếu khách chọn đáp án này"
                                >
                                  Dừng
                                </button>

                                {activeQ.type === 'multi' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateQuestionOption(
                                        idx,
                                        {
                                          exclusive: !opt.exclusive,
                                        },
                                        true
                                      )
                                    }
                                    className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                                      opt.exclusive
                                        ? 'bg-purple-50 text-purple-700 border-purple-300'
                                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                                    }`}
                                    title="Đáp án loại trừ các lựa chọn khác"
                                  >
                                    Loại trừ
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestionOption(
                                      idx,
                                      {
                                        hasOtherInput: !opt.hasOtherInput,
                                      },
                                      true
                                    )
                                  }
                                  className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
                                    opt.hasOtherInput
                                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                                      : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                                  }`}
                                  title="Mở thêm ô nhập chữ 'Ghi rõ...' khi chọn đáp án này"
                                >
                                  Ghi rõ
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestionOption(idx, { hidden: !opt.hidden }, true)
                                  }
                                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                  title={opt.hidden ? 'Hiện đáp án' : 'Ẩn đáp án'}
                                >
                                  {opt.hidden ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => removeQuestionOption(opt.code)}
                                  className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                  title="Xóa phương án này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Thanh chọn Câu hỏi con: Chỉ hiện khi đáp án này có gắn Câu hỏi con hoặc khi Admin bấm vào nút 'Câu con' */}
                            {isBranchOpen && (
                              <div className="mt-2 ml-6 pl-3 border-l-2 border-red-200 flex flex-wrap items-center justify-between gap-2 py-1">
                                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                  <CornerDownRight className="w-3 h-3 text-[#d12f2f]" />
                                  Khi chọn <strong>"{opt.label}"</strong> → Mở câu hỏi con:
                                </span>

                                <div className="flex items-center gap-1.5 flex-1 sm:flex-initial justify-end">
                                  <select
                                    value={opt.subQuestionKey || ''}
                                    onChange={(e) => {
                                      const val = e.target.value || undefined;
                                      updateQuestionOption(idx, { subQuestionKey: val }, true);
                                      if (!val) setExpandedOptCode(null);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 max-w-xs truncate focus:outline-none focus:border-[#d12f2f]"
                                  >
                                    <option value="">— Không mở câu hỏi con —</option>
                                    {orderedKeys
                                      .filter((k) => k !== activeQ.key)
                                      .map((k) => {
                                        const candidate = draft.questions[k];
                                        if (!candidate) return null;
                                        return (
                                          <option key={k} value={k}>
                                            {candidate.title}
                                          </option>
                                        );
                                      })}
                                  </select>

                                  {opt.subQuestionKey &&
                                    draft.questions[opt.subQuestionKey] && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedQKey(opt.subQuestionKey!);
                                          setExpandedOptCode(null);
                                        }}
                                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#d12f2f] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        Sửa câu {opt.subQuestionKey.replace('_', '.')}
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
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Tạo câu con mới
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL THÊM CÂU HỎI / CÂU HỎI CON MỚI ==================== */}
      {showAddQModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmAddQuestion}
            className="bg-white rounded-2xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {newQParentKey
                    ? `Tạo câu hỏi con cho câu ${newQParentKey}`
                    : 'Thêm câu hỏi khảo sát mới'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hỗ trợ trắc nghiệm chọn 1, chọn nhiều hoặc tự luận điền chữ/số.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddQModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addQError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {addQError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Mã câu hỏi
                </label>
                <input
                  type="text"
                  value={newQKey}
                  onChange={(e) => setNewQKey(e.target.value.toUpperCase())}
                  placeholder="VD: S10, A2_1"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#d12f2f]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
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
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
                >
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Loại câu hỏi
                </label>
                <select
                  value={newQType}
                  onChange={(e) => setNewQType(e.target.value as QuestionInputType)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none"
                >
                  <option value="single">Chọn 1 đáp án</option>
                  <option value="multi">Chọn nhiều đáp án</option>
                  <option value="text">Tự luận (Điền chữ/số)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Tiêu đề câu hỏi (Tiếng Việt)
                </label>
                <input
                  type="text"
                  value={newQTitle}
                  onChange={(e) => setNewQTitle(e.target.value)}
                  placeholder="Nhập câu hỏi tiếng Việt..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#d12f2f]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Tiêu đề tiếng Anh (EN)
                </label>
                <input
                  type="text"
                  value={newQEnTitle}
                  onChange={(e) => setNewQEnTitle(e.target.value)}
                  placeholder="English question title..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Điều kiện hiển thị (Tùy chọn làm câu hỏi con):
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
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none"
              >
                <option value="">— Là câu hỏi chính độc lập —</option>
                {orderedKeys.map((k) => {
                  const pq = draft.questions[k];
                  if (!pq || pq.type === 'text') return null;
                  return (
                    <option key={k} value={k}>
                      Phụ thuộc câu: {pq.title}
                    </option>
                  );
                })}
              </select>

              {newQParentKey && draft.questions[newQParentKey] && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Chọn đáp án kích hoạt của câu {newQParentKey}:
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer ${
                            active
                              ? 'bg-[#d12f2f] text-white border-[#d12f2f]'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {opt.code}. {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddQModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
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

      {/* ==================== TAB 2: ĐIỂM KHẢO SÁT & QUÀ TẶNG ==================== */}
      {subTab === 'locations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-2xs">
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

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {draft.locations.map((loc, idx) => (
                <div
                  key={loc.id}
                  className={`p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center ${
                    loc.active === false ? 'bg-slate-50 opacity-60' : 'bg-white'
                  }`}
                >
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Tên vị trí (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      value={loc.name}
                      onChange={(e) => updateLocation(idx, { name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#d12f2f]"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Tên tiếng Anh
                    </label>
                    <input
                      type="text"
                      value={loc.en}
                      onChange={(e) => updateLocation(idx, { en: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Mã tắt
                    </label>
                    <input
                      type="text"
                      value={loc.shortCode}
                      onChange={(e) =>
                        updateLocation(idx, { shortCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 text-center uppercase focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Chỉ tiêu mẫu
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={loc.quotaTarget}
                      onChange={(e) =>
                        updateLocation(idx, { quotaTarget: Number(e.target.value) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end gap-1 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => updateLocation(idx, { active: loc.active === false })}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title={loc.active === false ? 'Hiện điểm này' : 'Ẩn điểm này'}
                    >
                      {loc.active === false ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                    {draft.locations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLocation(loc.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Xóa điểm khảo sát"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#d12f2f]" />
              Danh mục Quà tặng khảo sát có sẵn
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
                placeholder="Nhập tên quà tặng mới (VD: Voucher ẩm thực 50.000đ)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#d12f2f]"
              />
              <button
                type="button"
                onClick={addGiftPreset}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
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
        <div className="bg-white rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-2xs">
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono font-bold uppercase focus:outline-none focus:border-[#d12f2f]"
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none"
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none"
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none"
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none"
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
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
