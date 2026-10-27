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

const LOCAL_CONFIG_KEY = 'banafi_fnb_survey_system_config_v1';

export type QuestionKey =
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'S5'
  | 'S6'
  | 'S7'
  | 'S8'
  | 'S9'
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A3_4'
  | 'A4'
  | 'A4_1'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'B1'
  | 'B2'
  | 'B3_1'
  | 'B3_2'
  | 'B3_3'
  | 'C1'
  | 'C2'
  | 'C3';

export interface ConfigurableOptionItem extends OptionItem {
  hidden?: boolean;
}

export interface QuestionConfigItem {
  key: QuestionKey;
  section: 'PHẦN S' | 'PHẦN A' | 'PHẦN B' | 'PHẦN C';
  type: 'single' | 'multi';
  title: string;
  enTitle: string;
  maxSelect?: number;
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
  questions: Record<QuestionKey, QuestionConfigItem>;
  updatedAtIso: string;
  updatedBy?: string;
}

export function getDefaultSurveyConfig(): SurveySystemConfig {
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
    questions: {
      S1: {
        key: 'S1',
        section: 'PHẦN S',
        type: 'single',
        title: 'S1. Thời gian tham quan tại Bà Nà hôm nay?',
        enTitle: 'Have you spent at least 4 hours at Ba Na Hills today?',
        options: S1_OPTIONS.map((o) => ({ ...o })),
      },
      S2: {
        key: 'S2',
        section: 'PHẦN S',
        type: 'single',
        title: 'S2. Anh/Chị có trực tiếp chi trả chi phí ăn uống hôm nay?',
        enTitle: 'Are you directly paying for F&B expenses today?',
        options: S2_OPTIONS.map((o) => ({ ...o })),
      },
      S3: {
        key: 'S3',
        section: 'PHẦN S',
        type: 'single',
        title: 'S3. Giới tính',
        enTitle: 'Gender',
        options: S3_OPTIONS.map((o) => ({ ...o })),
      },
      S4: {
        key: 'S4',
        section: 'PHẦN S',
        type: 'single',
        title: 'S4. Độ tuổi',
        enTitle: 'Age group',
        options: S4_OPTIONS.map((o) => ({ ...o })),
      },
      S5: {
        key: 'S5',
        section: 'PHẦN S',
        type: 'single',
        title: 'S5. Nơi sinh sống / Quốc tịch',
        enTitle: 'Residence / Nationality',
        options: S5_OPTIONS.map((o) => ({ ...o })),
      },
      S6: {
        key: 'S6',
        section: 'PHẦN S',
        type: 'single',
        title: 'S6. Đi cùng ai trong chuyến đi hôm nay?',
        enTitle: 'Who are you traveling with today?',
        options: S6_OPTIONS.map((o) => ({ ...o })),
      },
      S7: {
        key: 'S7',
        section: 'PHẦN S',
        type: 'single',
        title: 'S7. Hình thức chuyến đi',
        enTitle: 'Travel mode',
        options: S7_OPTIONS.map((o) => ({ ...o })),
      },
      S8: {
        key: 'S8',
        section: 'PHẦN S',
        type: 'single',
        title: 'S8. Số lần đến Sun World Ba Na Hills',
        enTitle: 'Visit frequency',
        options: S8_OPTIONS.map((o) => ({ ...o })),
      },
      S9: {
        key: 'S9',
        section: 'PHẦN S',
        type: 'single',
        title: 'S9. Loại vé / Gói sản phẩm sử dụng hôm nay',
        enTitle: 'Ticket / Combo type used today',
        options: S9_OPTIONS.map((o) => ({ ...o })),
      },
      A1: {
        key: 'A1',
        section: 'PHẦN A',
        type: 'single',
        title: 'A1. Ngân sách dự kiến chi cho ăn uống & đồ uống (1 người)?',
        enTitle: 'Planned F&B budget per person today?',
        options: A1_OPTIONS.map((o) => ({ ...o })),
      },
      A2: {
        key: 'A2',
        section: 'PHẦN A',
        type: 'multi',
        title: 'A2. Dịch vụ ăn uống đã sử dụng tại Bà Nà hôm nay?',
        enTitle: 'Which F&B services have you used today?',
        maxSelect: 0,
        options: A2_OPTIONS.map((o) => ({ ...o })),
      },
      A3: {
        key: 'A3',
        section: 'PHẦN A',
        type: 'multi',
        title: 'A3. Lý do chưa sử dụng dịch vụ ẩm thực tại Bà Nà?',
        enTitle: 'Main reasons for not using F&B services today?',
        maxSelect: 2,
        options: A3_OPTIONS.map((o) => ({ ...o })),
      },
      A3_4: {
        key: 'A3_4',
        section: 'PHẦN A',
        type: 'single',
        title: 'A3.4. Nếu khắc phục các điểm trên, Anh/Chị có sẵn sàng chi tiêu?',
        enTitle: 'Would you spend on F&B if these were improved?',
        options: A3_4_OPTIONS.map((o) => ({ ...o })),
      },
      A4: {
        key: 'A4',
        section: 'PHẦN A',
        type: 'single',
        title: 'A4. Thực tế đã chi bao nhiêu cho ăn uống hôm nay (1 người)?',
        enTitle: 'Actual F&B spending per person today?',
        options: A4_OPTIONS.map((o) => ({ ...o })),
      },
      A4_1: {
        key: 'A4_1',
        section: 'PHẦN A',
        type: 'single',
        title: 'A4.1. Chi thêm ngoài phần đã bao gồm trong vé/tour (1 người)?',
        enTitle: 'Extra F&B spending beyond package/combo per person?',
        options: A4_1_OPTIONS.map((o) => ({ ...o })),
      },
      A6: {
        key: 'A6',
        section: 'PHẦN A',
        type: 'multi',
        title: 'A6. Yếu tố ảnh hưởng nhất khi chọn nơi ăn uống hôm nay?',
        enTitle: 'Top factors influencing your F&B choice today?',
        maxSelect: 2,
        options: A6_OPTIONS.map((o) => ({ ...o })),
      },
      A7: {
        key: 'A7',
        section: 'PHẦN A',
        type: 'single',
        title: 'A7. Từ giờ đến khi rời Bà Nà, có dự định chi thêm cho F&B?',
        enTitle: 'Do you plan to spend more on F&B before leaving?',
        options: A7_OPTIONS.map((o) => ({ ...o })),
      },
      A8: {
        key: 'A8',
        section: 'PHẦN A',
        type: 'single',
        title: 'A8. Dự kiến chi thêm khoảng bao nhiêu (1 người)?',
        enTitle: 'Estimated additional spending per person?',
        options: A8_OPTIONS.map((o) => ({ ...o })),
      },
      B1: {
        key: 'B1',
        section: 'PHẦN B',
        type: 'multi',
        title: 'B1. Phong cách ẩm thực mong muốn có tại Bà Nà?',
        enTitle: 'Preferred cuisine styles at Ba Na Hills?',
        maxSelect: 3,
        options: B1_OPTIONS.map((o) => ({ ...o })),
      },
      B2: {
        key: 'B2',
        section: 'PHẦN B',
        type: 'multi',
        title: 'B2. Yêu cầu đặc biệt về chế độ ăn uống?',
        enTitle: 'Special dietary requirements?',
        maxSelect: 2,
        options: B2_OPTIONS.map((o) => ({ ...o })),
      },
      B3_1: {
        key: 'B3_1',
        section: 'PHẦN B',
        type: 'single',
        title: 'B3.1. Hình thức phục vụ ưu tiên cho bữa chính?',
        enTitle: 'Preferred service style for main meal?',
        options: B3_1_OPTIONS.map((o) => ({ ...o })),
      },
      B3_2: {
        key: 'B3_2',
        section: 'PHẦN B',
        type: 'single',
        title: 'B3.2. Mức độ sẵn sàng thử ẩm thực mới lạ / đặc trưng?',
        enTitle: 'Willingness to try new/signature dishes?',
        options: B3_2_OPTIONS.map((o) => ({ ...o })),
      },
      B3_3: {
        key: 'B3_3',
        section: 'PHẦN B',
        type: 'single',
        title: 'B3.3. Thời gian tối đa chấp nhận chờ món?',
        enTitle: 'Maximum acceptable waiting time?',
        options: B3_3_OPTIONS.map((o) => ({ ...o })),
      },
      C1: {
        key: 'C1',
        section: 'PHẦN C',
        type: 'multi',
        title: 'C1. Mong muốn cải thiện nhất về dịch vụ F&B tại Bà Nà?',
        enTitle: 'Top improvements needed for F&B services?',
        maxSelect: 2,
        options: C1_OPTIONS.map((o) => ({ ...o })),
      },
      C2: {
        key: 'C2',
        section: 'PHẦN C',
        type: 'multi',
        title: 'C2. Trải nghiệm ăn uống kết hợp giải trí sẵn sàng chi thêm?',
        enTitle: 'Dining + entertainment experiences willing to pay extra for?',
        maxSelect: 2,
        options: C2_OPTIONS.map((o) => ({ ...o })),
      },
      C3: {
        key: 'C3',
        section: 'PHẦN C',
        type: 'multi',
        title: 'C3. Sản phẩm F&B đóng gói sẵn muốn mua làm quà mang về?',
        enTitle: 'Packaged F&B souvenirs you would buy to take home?',
        maxSelect: 3,
        options: C3_OPTIONS.map((o) => ({ ...o })),
      },
    },
    updatedAtIso: new Date().toISOString(),
  };
}

export function mergeWithDefaultConfig(partial?: Partial<SurveySystemConfig> | null): SurveySystemConfig {
  const def = getDefaultSurveyConfig();
  if (!partial) return def;

  const mergedQuestions = { ...def.questions };
  if (partial.questions) {
    (Object.keys(def.questions) as QuestionKey[]).forEach((k) => {
      if (partial.questions && partial.questions[k]) {
        mergedQuestions[k] = {
          ...def.questions[k],
          ...partial.questions[k],
          options:
            Array.isArray(partial.questions[k].options) && partial.questions[k].options.length > 0
              ? partial.questions[k].options
              : def.questions[k].options,
        };
      }
    });
  }

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
    questions: mergedQuestions,
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
  const payload: SurveySystemConfig = {
    ...config,
    updatedAtIso: new Date().toISOString(),
    updatedBy: actorEmail || config.updatedBy || 'Admin',
  };
  saveLocalSurveyConfig(payload);

  await setDoc(
    doc(db, 'FNB_SURVEY_config', 'main'),
    {
      ...payload,
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
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
