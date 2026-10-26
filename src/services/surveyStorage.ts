import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { SurveyResponseData, createEmptySurveyResponse } from '../data/surveySchema';
import {
  PinSecretRecord,
  saveLocalPinSecret,
  getLocalPinSecret,
} from '../utils/pinCrypto';

const LOCAL_RESPONSES_KEY = 'banafi_fnb_survey_responses_v1';
const LOCAL_DRAFT_KEY = 'banafi_fnb_survey_active_draft_v1';
const LOCAL_PROFILE_PREFIX = 'banafi_fnb_interviewer_profile_';

export interface InterviewerProfile {
  uid: string;
  email: string;
  displayName: string;
  interviewerCode: string;
  defaultLocationId: number;
  defaultGiftName: string;
  hasPin: boolean;
  updatedAt: string;
  isDemoMode?: boolean;
}

export function getLocalInterviewerProfile(uid: string): InterviewerProfile | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_PREFIX}${uid}`);
    return raw ? (JSON.parse(raw) as InterviewerProfile) : null;
  } catch {
    return null;
  }
}

export function saveLocalInterviewerProfile(profile: InterviewerProfile): void {
  try {
    localStorage.setItem(`${LOCAL_PROFILE_PREFIX}${profile.uid}`, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export async function fetchInterviewerProfileAndPin(
  uid: string,
  email: string,
  displayName: string,
  isDemoMode = false
): Promise<{ profile: InterviewerProfile; pinRecord: PinSecretRecord | null }> {
  const localProfile = getLocalInterviewerProfile(uid);
  const localPin = getLocalPinSecret(uid);

  const fallbackProfile: InterviewerProfile = localProfile || {
    uid,
    email,
    displayName: displayName || email.split('@')[0] || 'PVV Bà Nà',
    interviewerCode: `PVV-${uid.slice(0, 4).toUpperCase()}`,
    defaultLocationId: 1,
    defaultGiftName: 'Voucher ẩm thực / Quà lưu niệm Ba Na Hills',
    hasPin: Boolean(localPin),
    updatedAt: new Date().toISOString(),
    isDemoMode,
  };

  if (isDemoMode) {
    return { profile: fallbackProfile, pinRecord: localPin };
  }

  try {
    const [userSnap, pinSnap] = await Promise.all([
      getDoc(doc(db, 'FNB_SURVEY_users', uid)),
      getDoc(doc(db, 'FNB_SURVEY_users', uid, 'private', 'pin')),
    ]);

    let pinRecord: PinSecretRecord | null = localPin;
    if (pinSnap.exists()) {
      const data = pinSnap.data();
      if (data.pinHash && data.salt) {
        pinRecord = {
          pinHash: data.pinHash,
          salt: data.salt,
          version: data.version || 'pbkdf2-sha256-v1',
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
        saveLocalPinSecret(uid, pinRecord);
      }
    }

    let profile: InterviewerProfile = fallbackProfile;
    if (userSnap.exists()) {
      const d = userSnap.data();
      profile = {
        uid,
        email: d.email || email,
        displayName: d.displayName || fallbackProfile.displayName,
        interviewerCode: d.interviewerCode || fallbackProfile.interviewerCode,
        defaultLocationId: Number(d.defaultLocationId) || fallbackProfile.defaultLocationId,
        defaultGiftName: d.defaultGiftName || fallbackProfile.defaultGiftName,
        hasPin: Boolean(pinRecord || d.hasPin),
        updatedAt: d.updatedAtIso || new Date().toISOString(),
      };
      saveLocalInterviewerProfile(profile);
    } else {
      await setDoc(
        doc(db, 'FNB_SURVEY_users', uid),
        {
          ...fallbackProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      saveLocalInterviewerProfile(fallbackProfile);
    }

    return { profile, pinRecord };
  } catch (err) {
    console.warn('[SurveyStorage] Offline or Firestore read fallback:', err);
    return { profile: fallbackProfile, pinRecord: localPin };
  }
}

export async function saveInterviewerProfileAndPinToCloud(
  profile: InterviewerProfile,
  pinRecord?: PinSecretRecord
): Promise<void> {
  saveLocalInterviewerProfile(profile);
  if (pinRecord) {
    saveLocalPinSecret(profile.uid, pinRecord);
  }
  if (profile.isDemoMode) return;

  try {
    await setDoc(
      doc(db, 'FNB_SURVEY_users', profile.uid),
      {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        interviewerCode: profile.interviewerCode,
        defaultLocationId: profile.defaultLocationId,
        defaultGiftName: profile.defaultGiftName,
        hasPin: profile.hasPin,
        updatedAtIso: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (pinRecord) {
      await setDoc(
        doc(db, 'FNB_SURVEY_users', profile.uid, 'private', 'pin'),
        {
          pinHash: pinRecord.pinHash,
          salt: pinRecord.salt,
          version: pinRecord.version,
          updatedAt: pinRecord.updatedAt,
          serverUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    await addDoc(collection(db, 'FNB_SURVEY_audit_logs'), {
      uid: profile.uid,
      email: profile.email,
      action: pinRecord ? 'SET_PIN_AND_PROFILE' : 'UPDATE_PROFILE',
      timestamp: serverTimestamp(),
    }).catch(() => {});
  } catch (err) {
    console.warn('[SurveyStorage] Saved locally; will sync when online:', err);
  }
}

export function getLocalResponses(): SurveyResponseData[] {
  try {
    const raw = localStorage.getItem(LOCAL_RESPONSES_KEY);
    return raw ? (JSON.parse(raw) as SurveyResponseData[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalResponses(list: SurveyResponseData[]): void {
  try {
    localStorage.setItem(LOCAL_RESPONSES_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export async function submitSurveyResponse(
  response: SurveyResponseData,
  isDemoMode = false
): Promise<{ synced: boolean }> {
  const existing = getLocalResponses().filter((r) => r.id !== response.id);

  if (isDemoMode || !navigator.onLine) {
    const offlineRecord: SurveyResponseData = { ...response, syncedToCloud: false };
    saveLocalResponses([offlineRecord, ...existing]);
    clearDraftResponse();
    return { synced: false };
  }

  try {
    const cloudRecord: SurveyResponseData = { ...response, syncedToCloud: true };
    await setDoc(doc(db, 'FNB_SURVEY_responses', response.id), {
      ...cloudRecord,
      submittedServerAt: serverTimestamp(),
    });
    saveLocalResponses([cloudRecord, ...existing]);
    clearDraftResponse();
    return { synced: true };
  } catch (err) {
    console.warn('[SurveyStorage] Cloud write failed, queued locally:', err);
    const queuedRecord: SurveyResponseData = { ...response, syncedToCloud: false };
    saveLocalResponses([queuedRecord, ...existing]);
    clearDraftResponse();
    return { synced: false };
  }
}

export async function syncPendingOfflineResponses(isDemoMode = false): Promise<number> {
  if (isDemoMode || !navigator.onLine) return 0;
  const allLocal = getLocalResponses();
  const pending = allLocal.filter((r) => !r.syncedToCloud);
  if (pending.length === 0) return 0;

  let syncedCount = 0;
  const updatedList = [...allLocal];

  for (const item of pending) {
    try {
      await setDoc(doc(db, 'FNB_SURVEY_responses', item.id), {
        ...item,
        syncedToCloud: true,
        submittedServerAt: serverTimestamp(),
      });
      const idx = updatedList.findIndex((r) => r.id === item.id);
      if (idx !== -1) {
        updatedList[idx] = { ...updatedList[idx], syncedToCloud: true };
      }
      syncedCount++;
    } catch (e) {
      console.warn('[SurveyStorage] Could not sync response', item.id, e);
    }
  }

  if (syncedCount > 0) {
    saveLocalResponses(updatedList);
  }
  return syncedCount;
}

export function subscribeToSurveyResponses(
  isDemoMode: boolean,
  onUpdate: (responses: SurveyResponseData[]) => void
): () => void {
  // Always emit local responses immediately
  onUpdate(getLocalResponses());

  if (isDemoMode) {
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'FNB_SURVEY_responses'),
      orderBy('createdAtIso', 'desc'),
      limit(1000)
    );
    return onSnapshot(
      q,
      (snap) => {
        const cloudDocs: SurveyResponseData[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as SurveyResponseData;
          cloudDocs.push({ ...data, id: docSnap.id, syncedToCloud: true });
        });

        // Merge with any unsynced local responses
        const localAll = getLocalResponses();
        const cloudIds = new Set(cloudDocs.map((c) => c.id));
        const unsyncedLocal = localAll.filter((l) => !cloudIds.has(l.id));
        const merged = [...unsyncedLocal, ...cloudDocs].sort((a, b) =>
          b.createdAtIso.localeCompare(a.createdAtIso)
        );
        saveLocalResponses(merged);
        onUpdate(merged);
      },
      (err) => {
        console.warn('[SurveyStorage] Firestore snapshot fallback to local:', err);
        onUpdate(getLocalResponses());
      }
    );
  } catch {
    return () => {};
  }
}

export function saveDraftResponse(draft: SurveyResponseData, stepIndex: number): void {
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({ draft, stepIndex }));
  } catch {
    // ignore
  }
}

export function loadDraftResponse(): { draft: SurveyResponseData; stepIndex: number } | null {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraftResponse(): void {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // ignore
  }
}

/**
 * Tạo dữ liệu mẫu khảo sát thử (30 mẫu) theo đúng phân bổ Quota của BAT để kiểm thử bảng Quota & Xuất CSV
 */
export function seedSamplePilotResponses(
  interviewerUid: string,
  interviewerName: string,
  interviewerEmail: string
): SurveyResponseData[] {
  const existing = getLocalResponses().filter((r) => !r.id.startsWith('PILOT_SAMPLE_'));
  const samples: SurveyResponseData[] = [];

  const s5Choices = [1, 2, 3, 4, 2, 4, 5, 5, 6, 7, 8, 9, 11, 5, 7];
  const s6Choices = [2, 3, 4, 5, 1, 2, 4, 4, 5, 3];
  const s4Choices = [2, 3, 3, 4, 5, 6, 2, 3, 4, 5];

  for (let i = 1; i <= 30; i++) {
    const locId = ((i - 1) % 5) + 1;
    const base = createEmptySurveyResponse(
      interviewerUid,
      interviewerName,
      interviewerEmail,
      locId,
      'Voucher ẩm thực 50.000đ',
      i
    );
    const usedFnB = i % 6 !== 0; // ~83% đã dùng F&B, ~17% chưa dùng F&B
    const isTour = i % 5 === 0 || i % 5 === 3; // 40% tour, 60% tự túc

    const sample: SurveyResponseData = {
      ...base,
      id: `PILOT_SAMPLE_${String(i).padStart(3, '0')}`,
      surveyCode: `PILOT-${String(i).padStart(3, '0')}`,
      startTime: '13:15:00',
      endTime: '13:24:10',
      durationSeconds: 480 + (i % 5) * 35,
      status: 'completed',
      syncedToCloud: false,
      S1: 1,
      S2: (i % 2) + 1,
      S3: (i % 2) + 1,
      S4: s4Choices[i % s4Choices.length],
      S5: s5Choices[i % s5Choices.length],
      S6: s6Choices[i % s6Choices.length],
      S7: isTour ? 2 : 1,
      S8: (i % 3) + 1,
      S9: isTour ? 4 : ((i % 3) + 1),
      A1: ((i % 5) + 2),
      A1_locked: true,
      A2: usedFnB ? (i % 2 === 0 ? [1, 5] : [3, 4, 5]) : [7],
      A3: usedFnB ? [] : [3, 4],
      A3_2: usedFnB ? '' : '250000',
      A3_3: usedFnB ? '' : 'Món Hàn Quốc / Halal / Đồ ăn nhanh giá hợp lý',
      A3_4: usedFnB ? null : 1,
      A4: usedFnB ? ((i % 5) + 2) : null,
      A4_1: usedFnB ? ((i % 4) + 1) : null,
      A5: {
        buffet: usedFnB && i % 2 === 0 ? 4 : null,
        alacarte: null,
        fastfood: usedFnB && i % 2 !== 0 ? 2 : null,
        pastry: usedFnB && i % 2 !== 0 ? 1 : null,
        beverage: usedFnB ? 1 : null,
        souvenir: null,
      },
      A6: usedFnB ? [3, 4] : [],
      A7: usedFnB ? (i % 3 === 0 ? 3 : 1) : null,
      A8: usedFnB && i % 3 !== 0 ? ((i % 3) + 2) : null,
      B1: [1, 7, 9],
      B2: [1, 4],
      B3_1: (i % 3) + 1,
      B3_2: (i % 2) + 1,
      B3_3: 1,
      B4: {
        buffet: 2,
        alacarte: 2,
        fastfood: 2,
        beverage: 2,
        pastry: 2,
      },
      B5: {
        B5_1: 5,
        B5_2: 5,
        B5_3: 5,
        B5_4: 4,
        B5_5: 4,
        B5_6: 5,
      },
      C1: [2, 3],
      C2: i % 4 === 0 ? [1, 2] : [7],
      C3: [1, 3, 6],
      C4_note: 'Mẫu khảo sát thử nghiệm (Pilot 23-24/10/2026)',
    };
    samples.push(sample);
  }

  const combined = [...samples, ...existing];
  saveLocalResponses(combined);
  return combined;
}

export function clearPilotSamples(): SurveyResponseData[] {
  const remaining = getLocalResponses().filter((r) => !r.id.startsWith('PILOT_SAMPLE_'));
  saveLocalResponses(remaining);
  return remaining;
}
