import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  OptionItem,
  SurveyLocation,
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
} from '../data/surveySchema';

const LOCAL_CONFIG_KEY = 'banafi_fnb_survey_system_config_v2';

export type QuestionKey = string;

export type SurveySection = 'PHẦN S' | 'PHẦN A' | 'PHẦN B' | 'PHẦN C';
export type QuestionInputType = 'single' | 'multi' | 'likert' | 'text';

export interface LikertPreset {
  id: string;
  name: string;
  options: ConfigurableOptionItem[];
}

export const LIKERT_5_PRESETS: LikertPreset[] = [
  {
    id: 'satisfaction',
    name: 'Mức độ hài lòng (1: Rất không hài lòng → 5: Rất hài lòng)',
    options: [
      { code: 1, label: 'Rất không hài lòng', en: 'Very dissatisfied' },
      { code: 2, label: 'Không hài lòng', en: 'Dissatisfied' },
      { code: 3, label: 'Bình thường', en: 'Neutral' },
      { code: 4, label: 'Hài lòng', en: 'Satisfied' },
      { code: 5, label: 'Rất hài lòng', en: 'Very satisfied' },
    ],
  },
  {
    id: 'agreement',
    name: 'Mức độ đồng ý (1: Hoàn toàn không đồng ý → 5: Hoàn toàn đồng ý)',
    options: [
      { code: 1, label: 'Hoàn toàn không đồng ý', en: 'Strongly disagree' },
      { code: 2, label: 'Không đồng ý', en: 'Disagree' },
      { code: 3, label: 'Trung lập / Phân vân', en: 'Neutral' },
      { code: 4, label: 'Đồng ý', en: 'Agree' },
      { code: 5, label: 'Hoàn toàn đồng ý', en: 'Strongly agree' },
    ],
  },
  {
    id: 'importance',
    name: 'Mức độ quan trọng (1: Không quan trọng → 5: Rất quan trọng)',
    options: [
      { code: 1, label: 'Hoàn toàn không quan trọng', en: 'Not important at all' },
      { code: 2, label: 'Ít quan trọng', en: 'Slightly important' },
      { code: 3, label: 'Bình thường', en: 'Neutral' },
      { code: 4, label: 'Quan trọng', en: 'Important' },
      { code: 5, label: 'Rất quan trọng', en: 'Very important' },
    ],
  },
  {
    id: 'quality',
    name: 'Đánh giá chất lượng (1: Rất kém → 5: Rất tốt)',
    options: [
      { code: 1, label: 'Rất kém', en: 'Very poor' },
      { code: 2, label: 'Kém', en: 'Poor' },
      { code: 3, label: 'Trung bình', en: 'Average' },
      { code: 4, label: 'Tốt', en: 'Good' },
      { code: 5, label: 'Rất tốt', en: 'Very good' },
    ],
  },
];

export function getDefaultLikert5Options(): ConfigurableOptionItem[] {
  return LIKERT_5_PRESETS[0].options.map((o) => ({ ...o }));
}

export interface ConfigurableOptionItem extends OptionItem {
  hidden?: boolean;
  /** Mã câu hỏi con sẽ mở ra khi đáp viên chọn đáp án này */
  subQuestionKey?: string;
}

export interface ParentConditionInfo {
  parentQuestionKey: string;
  triggerOptionCodes: number[];
}

export interface QuestionConfigItem {
  key: string;
  section: SurveySection;
  /** Nhánh hiển thị trong Phần A (nếu thuộc Phần A): 'A1_A2' | 'A_NOT_USED' | 'A_USED' | 'ALL' */
  branch?: 'A1_A2' | 'A_NOT_USED' | 'A_USED' | 'ALL';
  type: QuestionInputType;
  title: string;
  enTitle: string;
  maxSelect?: number;
  placeholder?: string;
  required?: boolean;
  hidden?: boolean;
  isCustom?: boolean;
  /** Cấu hình câu hỏi con: chỉ hiện khi câu hỏi cha chọn 1 trong các đáp án xác định */
  parentInfo?: ParentConditionInfo | null;
  options: ConfigurableOptionItem[];
}

export interface ConfigurableLocation extends SurveyLocation {
  active?: boolean;
}

export interface DataFormatConfig {
  surveyCodePrefix: string;
  totalQuotaTarget: number;
  dailyTargetPerPvv: number;
  csvDelimiter: ',' | ';';
  csvValueMode: 'code_and_label' | 'code_only' | 'label_only';
  multiSelectSeparator: '; ' | ' | ' | ', ';
}

export interface SurveySystemConfig {
  locations: ConfigurableLocation[];
  giftPresets: string[];
  dataFormat: DataFormatConfig;
  questionOrder: string[];
  deletedQuestionKeys?: string[];
  questions: Record<string, QuestionConfigItem>;
  updatedAtIso: string;
  updatedBy?: string;
}

export const DEFAULT_QUESTION_ORDER: string[] = [
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
  'A3_1',
  'A3_2',
  'A3_3',
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

/**
 * Đồng bộ 2 chiều giữa `option.subQuestionKey` của câu hỏi cha và `parentInfo` của câu hỏi con
 */
export function normalizeQuestionLinks(
  questions: Record<string, QuestionConfigItem>,
  order: string[]
): Record<string, QuestionConfigItem> {
  const next: Record<string, QuestionConfigItem> = {};
  Object.keys(questions).forEach((k) => {
    const q = questions[k];
    next[k] = {
      ...q,
      options: Array.isArray(q.options) ? q.options.map((o) => ({ ...o })) : [],
    };
  });

  // 1. Từ option.subQuestionKey -> cập nhật parentInfo cho câu hỏi con
  const parentMap: Record<string, { parentQuestionKey: string; codes: Set<number> }> = {};

  order.forEach((pKey) => {
    const pQ = next[pKey];
    if (!pQ) return;
    pQ.options.forEach((opt) => {
      const targetKey = opt.subQuestionKey?.trim();
      if (targetKey && next[targetKey] && targetKey !== pKey) {
        if (!parentMap[targetKey]) {
          parentMap[targetKey] = { parentQuestionKey: pKey, codes: new Set<number>() };
        }
        if (parentMap[targetKey].parentQuestionKey === pKey) {
          parentMap[targetKey].codes.add(opt.code);
        }
      }
    });
  });

  // 2. Nếu câu hỏi con có sẵn parentInfo nhưng option của câu cha chưa gắn subQuestionKey thì gắn ngược lại
  order.forEach((cKey) => {
    const cQ = next[cKey];
    if (!cQ?.parentInfo?.parentQuestionKey) return;
    const pKey = cQ.parentInfo.parentQuestionKey;
    const pQ = next[pKey];
    if (!pQ || pKey === cKey) return;
    const codes = cQ.parentInfo.triggerOptionCodes || [];
    pQ.options = pQ.options.map((opt) => {
      if (codes.includes(opt.code) && !opt.subQuestionKey) {
        return { ...opt, subQuestionKey: cKey };
      }
      return opt;
    });
    if (codes.length > 0) {
      if (!parentMap[cKey]) {
        parentMap[cKey] = { parentQuestionKey: pKey, codes: new Set(codes) };
      } else if (parentMap[cKey].parentQuestionKey === pKey) {
        codes.forEach((c) => parentMap[cKey].codes.add(c));
      }
    }
  });

  // 3. Ghi lại parentInfo chuẩn xác cho từng câu hỏi
  Object.keys(next).forEach((k) => {
    const mapped = parentMap[k];
    if (mapped && mapped.codes.size > 0) {
      next[k].parentInfo = {
        parentQuestionKey: mapped.parentQuestionKey,
        triggerOptionCodes: Array.from(mapped.codes).sort((a, b) => a - b),
      };
    } else {
      next[k].parentInfo = null;
    }
  });

  return next;
}

export function getDefaultSurveyConfig(): SurveySystemConfig {
  const rawQuestions: Record<string, QuestionConfigItem> = {
    S1: {
      key: 'S1',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S1. Thời gian tham quan tại Bà Nà hôm nay?',
      enTitle: 'Have you spent at least 4 hours at Ba Na Hills today?',
      options: S1_OPTIONS.map((o) => ({ ...o })),
    },
    S2: {
      key: 'S2',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S2. Anh/Chị có trực tiếp chi trả chi phí ăn uống hôm nay?',
      enTitle: 'Are you directly paying for F&B expenses today?',
      options: S2_OPTIONS.map((o) => ({ ...o })),
    },
    S3: {
      key: 'S3',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S3. Giới tính',
      enTitle: 'Gender',
      options: S3_OPTIONS.map((o) => ({ ...o })),
    },
    S4: {
      key: 'S4',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S4. Độ tuổi',
      enTitle: 'Age group',
      options: S4_OPTIONS.map((o) => ({ ...o })),
    },
    S5: {
      key: 'S5',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S5. Nơi sinh sống / Quốc tịch',
      enTitle: 'Residence / Nationality',
      options: S5_OPTIONS.map((o) => ({ ...o })),
    },
    S6: {
      key: 'S6',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S6. Đi cùng ai trong chuyến đi hôm nay?',
      enTitle: 'Who are you traveling with today?',
      options: S6_OPTIONS.map((o) => ({ ...o })),
    },
    S7: {
      key: 'S7',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S7. Hình thức chuyến đi',
      enTitle: 'Travel mode',
      options: S7_OPTIONS.map((o) => ({ ...o })),
    },
    S8: {
      key: 'S8',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S8. Số lần đến Sun World Ba Na Hills',
      enTitle: 'Visit frequency',
      options: S8_OPTIONS.map((o) => ({ ...o })),
    },
    S9: {
      key: 'S9',
      section: 'PHẦN S',
      type: 'single',
      required: true,
      title: 'S9. Loại vé / Gói sản phẩm sử dụng hôm nay',
      enTitle: 'Ticket / Combo type used today',
      options: S9_OPTIONS.map((o) => ({ ...o })),
    },
    A1: {
      key: 'A1',
      section: 'PHẦN A',
      branch: 'A1_A2',
      type: 'single',
      required: true,
      title: 'A1. Ngân sách dự kiến chi cho ăn uống & đồ uống (1 người)?',
      enTitle: 'Planned F&B budget per person today?',
      options: A1_OPTIONS.map((o) => ({ ...o })),
    },
    A2: {
      key: 'A2',
      section: 'PHẦN A',
      branch: 'A1_A2',
      type: 'multi',
      required: true,
      title: 'A2. Dịch vụ ăn uống đã sử dụng tại Bà Nà hôm nay?',
      enTitle: 'Which F&B services have you used today?',
      maxSelect: 0,
      options: A2_OPTIONS.map((o) => ({ ...o })),
    },
    A3: {
      key: 'A3',
      section: 'PHẦN A',
      branch: 'A_NOT_USED',
      type: 'multi',
      required: true,
      title: 'A3. Lý do chưa sử dụng dịch vụ ẩm thực tại Bà Nà?',
      enTitle: 'Main reasons for not using F&B services today?',
      maxSelect: 2,
      options: A3_OPTIONS.map((o) => {
        if (o.code === 1) return { ...o, subQuestionKey: 'A3_1' };
        if (o.code === 3) return { ...o, subQuestionKey: 'A3_2' };
        if ([4, 5, 6, 7].includes(o.code)) return { ...o, subQuestionKey: 'A3_3' };
        return { ...o };
      }),
    },
    A3_1: {
      key: 'A3_1',
      section: 'PHẦN A',
      branch: 'A_NOT_USED',
      type: 'text',
      required: false,
      title: 'A3.1. Anh/Chị đã ăn ở đâu trước khi lên Bà Nà?',
      enTitle: 'Where did you eat before coming to Ba Na Hills?',
      placeholder: 'Nhập nơi khách đã ăn trước khi lên cáp treo...',
      parentInfo: {
        parentQuestionKey: 'A3',
        triggerOptionCodes: [1],
      },
      options: [],
    },
    A3_2: {
      key: 'A3_2',
      section: 'PHẦN A',
      branch: 'A_NOT_USED',
      type: 'text',
      required: false,
      title: 'A3.2. Mức giá hợp lý Anh/Chị sẵn sàng chi (VNĐ/người)?',
      enTitle: 'What reasonable price are you willing to pay per person (VND)?',
      placeholder: 'VD: 150.000đ/người...',
      parentInfo: {
        parentQuestionKey: 'A3',
        triggerOptionCodes: [3],
      },
      options: [],
    },
    A3_3: {
      key: 'A3_3',
      section: 'PHẦN A',
      branch: 'A_NOT_USED',
      type: 'text',
      required: false,
      title: 'A3.3. Món ăn hoặc dịch vụ ẩm thực mong muốn có thêm?',
      enTitle: 'What food or F&B services would you like to see added?',
      placeholder: 'Nhập tên món ăn hoặc loại hình dịch vụ mong muốn...',
      parentInfo: {
        parentQuestionKey: 'A3',
        triggerOptionCodes: [4, 5, 6, 7],
      },
      options: [],
    },
    A3_4: {
      key: 'A3_4',
      section: 'PHẦN A',
      branch: 'A_NOT_USED',
      type: 'single',
      required: true,
      title: 'A3.4. Nếu khắc phục các điểm trên, Anh/Chị có sẵn sàng chi tiêu?',
      enTitle: 'Would you spend on F&B if these were improved?',
      options: A3_4_OPTIONS.map((o) => ({ ...o })),
    },
    A4: {
      key: 'A4',
      section: 'PHẦN A',
      branch: 'A_USED',
      type: 'single',
      required: true,
      title: 'A4. Thực tế đã chi bao nhiêu cho ăn uống hôm nay (1 người)?',
      enTitle: 'Actual F&B spending per person today?',
      options: A4_OPTIONS.map((o) =>
        o.code === 8 ? { ...o, subQuestionKey: 'A4_1' } : { ...o }
      ),
    },
    A4_1: {
      key: 'A4_1',
      section: 'PHẦN A',
      branch: 'A_USED',
      type: 'single',
      required: false,
      title: 'A4.1. Chi thêm ngoài phần đã bao gồm trong vé/tour (1 người)?',
      enTitle: 'Extra F&B spending beyond package/combo per person?',
      parentInfo: {
        parentQuestionKey: 'A4',
        triggerOptionCodes: [8],
      },
      options: A4_1_OPTIONS.map((o) => ({ ...o })),
    },
    A6: {
      key: 'A6',
      section: 'PHẦN A',
      branch: 'A_USED',
      type: 'multi',
      required: true,
      title: 'A6. Yếu tố ảnh hưởng nhất khi chọn nơi ăn uống hôm nay?',
      enTitle: 'Top factors influencing your F&B choice today?',
      maxSelect: 2,
      options: A6_OPTIONS.map((o) => ({ ...o })),
    },
    A7: {
      key: 'A7',
      section: 'PHẦN A',
      branch: 'A_USED',
      type: 'single',
      required: true,
      title: 'A7. Từ giờ đến khi rời Bà Nà, có dự định chi thêm cho F&B?',
      enTitle: 'Do you plan to spend more on F&B before leaving?',
      options: A7_OPTIONS.map((o) =>
        o.code === 1 || o.code === 2 ? { ...o, subQuestionKey: 'A8' } : { ...o }
      ),
    },
    A8: {
      key: 'A8',
      section: 'PHẦN A',
      branch: 'A_USED',
      type: 'single',
      required: true,
      title: 'A8. Dự kiến chi thêm khoảng bao nhiêu (1 người)?',
      enTitle: 'Estimated additional spending per person?',
      parentInfo: {
        parentQuestionKey: 'A7',
        triggerOptionCodes: [1, 2],
      },
      options: A8_OPTIONS.map((o) => ({ ...o })),
    },
    B1: {
      key: 'B1',
      section: 'PHẦN B',
      type: 'multi',
      required: true,
      title: 'B1. Phong cách ẩm thực mong muốn có tại Bà Nà?',
      enTitle: 'Preferred cuisine styles at Ba Na Hills?',
      maxSelect: 3,
      options: B1_OPTIONS.map((o) => ({ ...o })),
    },
    B2: {
      key: 'B2',
      section: 'PHẦN B',
      type: 'multi',
      required: true,
      title: 'B2. Yêu cầu đặc biệt về chế độ ăn uống?',
      enTitle: 'Special dietary requirements?',
      maxSelect: 2,
      options: B2_OPTIONS.map((o) => ({ ...o })),
    },
    B3_1: {
      key: 'B3_1',
      section: 'PHẦN B',
      type: 'single',
      required: true,
      title: 'B3.1. Hình thức phục vụ ưu tiên cho bữa chính?',
      enTitle: 'Preferred service style for main meal?',
      options: B3_1_OPTIONS.map((o) => ({ ...o })),
    },
    B3_2: {
      key: 'B3_2',
      section: 'PHẦN B',
      type: 'single',
      required: true,
      title: 'B3.2. Mức độ sẵn sàng thử ẩm thực mới lạ / đặc trưng?',
      enTitle: 'Willingness to try new/signature dishes?',
      options: B3_2_OPTIONS.map((o) => ({ ...o })),
    },
    B3_3: {
      key: 'B3_3',
      section: 'PHẦN B',
      type: 'single',
      required: true,
      title: 'B3.3. Thời gian tối đa chấp nhận chờ món?',
      enTitle: 'Maximum acceptable waiting time?',
      options: B3_3_OPTIONS.map((o) => ({ ...o })),
    },
    C1: {
      key: 'C1',
      section: 'PHẦN C',
      type: 'multi',
      required: true,
      title: 'C1. Mong muốn cải thiện nhất về dịch vụ F&B tại Bà Nà?',
      enTitle: 'Top improvements needed for F&B services?',
      maxSelect: 2,
      options: C1_OPTIONS.map((o) => ({ ...o })),
    },
    C2: {
      key: 'C2',
      section: 'PHẦN C',
      type: 'multi',
      required: true,
      title: 'C2. Trải nghiệm ăn uống kết hợp giải trí sẵn sàng chi thêm?',
      enTitle: 'Dining + entertainment experiences willing to pay extra for?',
      maxSelect: 2,
      options: C2_OPTIONS.map((o) => ({ ...o })),
    },
    C3: {
      key: 'C3',
      section: 'PHẦN C',
      type: 'multi',
      required: true,
      title: 'C3. Sản phẩm F&B đóng gói sẵn muốn mua làm quà mang về?',
      enTitle: 'Packaged F&B souvenirs you would buy to take home?',
      maxSelect: 3,
      options: C3_OPTIONS.map((o) => ({ ...o })),
    },
  };

  return {
    locations: SURVEY_LOCATIONS.map((l) => ({ ...l, active: true })),
    giftPresets: [
      'Voucher ẩm thực / Quà lưu niệm Ba Na Hills',
      'Voucher ẩm thực 50.000đ',
      'Voucher đồ uống miễn phí',
      'Móc khóa / Quà lưu niệm Bà Nà',
      'Không nhận quà',
    ],
    dataFormat: {
      surveyCodePrefix: 'BN',
      totalQuotaTarget: 600,
      dailyTargetPerPvv: 20,
      csvDelimiter: ',',
      csvValueMode: 'code_and_label',
      multiSelectSeparator: '; ',
    },
    questionOrder: [...DEFAULT_QUESTION_ORDER],
    deletedQuestionKeys: [],
    questions: normalizeQuestionLinks(rawQuestions, DEFAULT_QUESTION_ORDER),
    updatedAtIso: new Date().toISOString(),
  };
}

export function mergeWithDefaultConfig(
  partial?: Partial<SurveySystemConfig> | null
): SurveySystemConfig {
  const def = getDefaultSurveyConfig();
  if (!partial) return def;

  const deletedSet = new Set<string>(partial.deletedQuestionKeys || []);
  const mergedQuestions: Record<string, QuestionConfigItem> = {};

  // 1. Nạp các câu mặc định (trừ những câu Admin đã xóa)
  Object.keys(def.questions).forEach((k) => {
    if (!deletedSet.has(k)) {
      mergedQuestions[k] = { ...def.questions[k] };
    }
  });

  // 2. Nạp tất cả các câu từ partial.questions (bao gồm cả câu Admin mới thêm hoặc đã chỉnh sửa)
  if (partial.questions) {
    Object.keys(partial.questions).forEach((k) => {
      if (deletedSet.has(k)) return;
      const incoming = partial.questions![k];
      if (!incoming) return;
      const base = def.questions[k];
      mergedQuestions[k] = {
        ...(base || {}),
        ...incoming,
        key: k,
        options: Array.isArray(incoming.options)
          ? incoming.options
          : base?.options || [],
      };
    });
  }

  // 3. Xây dựng thứ tự câu hỏi
  const rawOrder =
    Array.isArray(partial.questionOrder) && partial.questionOrder.length > 0
      ? partial.questionOrder
      : DEFAULT_QUESTION_ORDER;

  const finalOrder: string[] = [];
  rawOrder.forEach((k) => {
    if (mergedQuestions[k] && !deletedSet.has(k) && !finalOrder.includes(k)) {
      finalOrder.push(k);
    }
  });
  Object.keys(mergedQuestions).forEach((k) => {
    if (!deletedSet.has(k) && !finalOrder.includes(k)) {
      finalOrder.push(k);
    }
  });

  return {
    locations:
      Array.isArray(partial.locations) && partial.locations.length > 0
        ? partial.locations
        : def.locations,
    giftPresets:
      Array.isArray(partial.giftPresets) && partial.giftPresets.length > 0
        ? partial.giftPresets
        : def.giftPresets,
    dataFormat: {
      ...def.dataFormat,
      ...(partial.dataFormat || {}),
    },
    questionOrder: finalOrder,
    deletedQuestionKeys: Array.from(deletedSet),
    questions: normalizeQuestionLinks(mergedQuestions, finalOrder),
    updatedAtIso: partial.updatedAtIso || def.updatedAtIso,
    updatedBy: partial.updatedBy,
  };
}

export function getLocalSurveyConfig(): SurveySystemConfig {
  try {
    const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (!raw) return getDefaultSurveyConfig();
    return mergeWithDefaultConfig(JSON.parse(raw));
  } catch {
    return getDefaultSurveyConfig();
  }
}

export function saveLocalSurveyConfig(config: SurveySystemConfig): void {
  try {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function subscribeToSurveyConfig(
  onUpdate: (config: SurveySystemConfig) => void
): () => void {
  onUpdate(getLocalSurveyConfig());

  try {
    const ref = doc(db, 'FNB_SURVEY_config', 'main');
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const merged = mergeWithDefaultConfig(snap.data() as Partial<SurveySystemConfig>);
          saveLocalSurveyConfig(merged);
          onUpdate(merged);
        }
      },
      (err) => {
        console.warn('[SurveyConfig] Offline fallback:', err);
      }
    );
  } catch {
    return () => {};
  }
}

export async function saveSurveyConfigToCloud(
  config: SurveySystemConfig,
  actorEmail?: string
): Promise<void> {
  const normalizedQuestions = normalizeQuestionLinks(config.questions, config.questionOrder);
  const payload: SurveySystemConfig = {
    ...config,
    questions: normalizedQuestions,
    updatedAtIso: new Date().toISOString(),
    updatedBy: actorEmail || config.updatedBy || 'Admin',
  };
  saveLocalSurveyConfig(payload);

  // Loại bỏ toàn bộ thuộc tính undefined (VD: subQuestionKey: undefined, branch: undefined)
  // để Firestore setDoc không bao giờ báo lỗi "Unsupported field value: undefined" khi Admin thêm/sửa/xóa câu hỏi
  const sanitizedPayload = JSON.parse(JSON.stringify(payload)) as SurveySystemConfig;

  await setDoc(doc(db, 'FNB_SURVEY_config', 'main'), {
    ...sanitizedPayload,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function fetchSurveyConfigOnce(): Promise<SurveySystemConfig> {
  try {
    const snap = await getDoc(doc(db, 'FNB_SURVEY_config', 'main'));
    if (snap.exists()) {
      const merged = mergeWithDefaultConfig(snap.data() as Partial<SurveySystemConfig>);
      saveLocalSurveyConfig(merged);
      return merged;
    }
  } catch {
    // fallback to local
  }
  return getLocalSurveyConfig();
}
