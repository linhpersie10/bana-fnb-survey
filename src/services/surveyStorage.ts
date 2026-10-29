import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
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

export const SUPERADMIN_EMAIL = 'linh.persie.10@gmail.com';
export type UserRole = 'superadmin' | 'admin' | 'interviewer';
export type UserAccountStatus = 'approved' | 'locked';

export interface InterviewerProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserAccountStatus;
  isSuperadmin?: boolean;
  interviewerCode: string;
  defaultLocationId: number;
  defaultGiftName: string;
  hasPin: boolean;
  updatedAt: string;
  isDemoMode?: boolean;
}

export function isSuperAdminEmail(email?: string | null): boolean {
  return (email || '').trim().toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
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
  isDemoMode = false,
  claimIsSuperadmin = false,
  photoURL = ''
): Promise<{ profile: InterviewerProfile; pinRecord: PinSecretRecord | null }> {
  const localProfile = getLocalInterviewerProfile(uid);
  const localPin = getLocalPinSecret(uid);
  const superAdmin = isSuperAdminEmail(email) || claimIsSuperadmin;

  const fallbackProfile: InterviewerProfile = localProfile || {
    uid,
    email,
    displayName: displayName || email.split('@')[0] || 'PVV Bà Nà',
    photoURL,
    role: superAdmin ? 'superadmin' : 'interviewer',
    status: 'approved',
    isSuperadmin: superAdmin,
    interviewerCode: superAdmin ? 'SA-001' : `PVV-${uid.slice(0, 4).toUpperCase()}`,
    defaultLocationId: 1,
    defaultGiftName: 'Voucher ẩm thực / Quà lưu niệm Ba Na Hills',
    hasPin: Boolean(localPin),
    updatedAt: new Date().toISOString(),
    isDemoMode,
  };

  if (superAdmin) {
    fallbackProfile.role = 'superadmin';
    fallbackProfile.isSuperadmin = true;
    fallbackProfile.status = 'approved';
  }

  if (isDemoMode) {
    return { profile: fallbackProfile, pinRecord: localPin };
  }

  try {
    const emailLower = email.trim().toLowerCase();
    const [userSnap, pinSnap, inviteSnap] = await Promise.all([
      getDoc(doc(db, 'FNB_SURVEY_users', uid)),
      getDoc(doc(db, 'FNB_SURVEY_users', uid, 'private', 'pin')),
      emailLower ? getDoc(doc(db, 'FNB_SURVEY_role_invites', emailLower)) : Promise.resolve(null),
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

    const inviteData = inviteSnap && inviteSnap.exists() ? inviteSnap.data() : null;
    const roleRank: Record<UserRole, number> = {
      superadmin: 3,
      admin: 2,
      interviewer: 1,
    };

    let profile: InterviewerProfile = fallbackProfile;
    if (userSnap.exists()) {
      const d = userSnap.data();
      const dbRole = (d.role as UserRole) || 'interviewer';
      const inviteRole = (inviteData?.role as UserRole) || 'interviewer';
      const resolvedRole: UserRole = superAdmin
        ? 'superadmin'
        : roleRank[inviteRole] > roleRank[dbRole]
        ? inviteRole
        : dbRole;
      profile = {
        uid,
        email: d.email || email,
        displayName: d.displayName || fallbackProfile.displayName,
        photoURL: d.photoURL || photoURL,
        role: resolvedRole,
        status: superAdmin ? 'approved' : (d.status as UserAccountStatus) || 'approved',
        isSuperadmin: superAdmin || resolvedRole === 'superadmin' || Boolean(d.isSuperadmin),
        interviewerCode: d.interviewerCode || fallbackProfile.interviewerCode,
        defaultLocationId:
          Number(d.defaultLocationId) ||
          Number(inviteData?.defaultLocationId) ||
          fallbackProfile.defaultLocationId,
        defaultGiftName: d.defaultGiftName || fallbackProfile.defaultGiftName,
        hasPin: Boolean(pinRecord || d.hasPin),
        updatedAt: d.updatedAtIso || new Date().toISOString(),
      };
      // Đồng bộ ngay quyền lên FNB_SURVEY_users/{uid} nếu quyền mới cao hơn quyền cũ (VD: vừa được nâng lên admin)
      if (
        (superAdmin && (d.role !== 'superadmin' || !d.isSuperadmin)) ||
        d.role !== resolvedRole
      ) {
        await setDoc(
          doc(db, 'FNB_SURVEY_users', uid),
          {
            role: resolvedRole,
            isSuperadmin: superAdmin || resolvedRole === 'superadmin',
            status: superAdmin ? 'approved' : profile.status,
            updatedAtIso: new Date().toISOString(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
      saveLocalInterviewerProfile(profile);
    } else {
      const initialRole: UserRole = superAdmin
        ? 'superadmin'
        : (inviteData?.role as UserRole) || 'interviewer';
      const initialLoc = Number(inviteData?.defaultLocationId) || 1;
      profile = {
        ...fallbackProfile,
        role: initialRole,
        isSuperadmin: superAdmin || initialRole === 'superadmin',
        defaultLocationId: initialLoc,
      };
      await setDoc(
        doc(db, 'FNB_SURVEY_users', uid),
        {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      saveLocalInterviewerProfile(profile);
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
    const roleRank: Record<UserRole, number> = {
      superadmin: 3,
      admin: 2,
      interviewer: 1,
    };
    let effectiveRole: UserRole = isSuperAdminEmail(profile.email) ? 'superadmin' : profile.role;
    const existingSnap = await getDoc(doc(db, 'FNB_SURVEY_users', profile.uid)).catch(() => null);
    if (existingSnap && existingSnap.exists()) {
      const cloudRole = (existingSnap.data().role as UserRole) || 'interviewer';
      if (roleRank[cloudRole] > roleRank[effectiveRole]) {
        effectiveRole = cloudRole;
      }
    }

    const updatedProfile: InterviewerProfile = {
      ...profile,
      role: effectiveRole,
      isSuperadmin: Boolean(profile.isSuperadmin || effectiveRole === 'superadmin'),
    };
    saveLocalInterviewerProfile(updatedProfile);

    await setDoc(
      doc(db, 'FNB_SURVEY_users', profile.uid),
      {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL || '',
        role: effectiveRole,
        status: profile.status,
        isSuperadmin: Boolean(profile.isSuperadmin || effectiveRole === 'superadmin'),
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

// ==================== QUẢN LÝ PHÂN QUYỀN USER (SUPERADMIN / ADMIN / ĐÁP VIÊN) ====================

export function subscribeToAllUsers(
  onUpdate: (users: InterviewerProfile[]) => void
): () => void {
  try {
    const q = query(collection(db, 'FNB_SURVEY_users'));
    return onSnapshot(
      q,
      (snap) => {
        const list: InterviewerProfile[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          const superAdmin = isSuperAdminEmail(d.email) || Boolean(d.isSuperadmin);
          list.push({
            uid: docSnap.id,
            email: d.email || '',
            displayName: d.displayName || d.email || 'Người dùng',
            photoURL: d.photoURL || '',
            role: superAdmin ? 'superadmin' : (d.role as UserRole) || 'interviewer',
            status: superAdmin ? 'approved' : (d.status as UserAccountStatus) || 'approved',
            isSuperadmin: superAdmin,
            interviewerCode: d.interviewerCode || `PVV-${docSnap.id.slice(0, 4).toUpperCase()}`,
            defaultLocationId: Number(d.defaultLocationId) || 1,
            defaultGiftName: d.defaultGiftName || 'Voucher ẩm thực',
            hasPin: Boolean(d.hasPin),
            updatedAt: d.updatedAtIso || '',
          });
        });
        list.sort((a, b) => {
          const order: Record<UserRole, number> = { superadmin: 0, admin: 1, interviewer: 2 };
          return order[a.role] - order[b.role] || a.displayName.localeCompare(b.displayName, 'vi');
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[SurveyStorage] Users listener error:', err);
      }
    );
  } catch {
    return () => {};
  }
}

export async function updateUserRoleAndSettings(
  targetUid: string,
  updates: Partial<Pick<InterviewerProfile, 'role' | 'status' | 'defaultLocationId' | 'displayName'>>
): Promise<void> {
  await setDoc(
    doc(db, 'FNB_SURVEY_users', targetUid),
    {
      ...updates,
      isSuperadmin: updates.role === 'superadmin',
      updatedAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function resetUserPinByAdmin(targetUid: string): Promise<void> {
  await deleteDoc(doc(db, 'FNB_SURVEY_users', targetUid, 'private', 'pin')).catch(() => {});
  await setDoc(
    doc(db, 'FNB_SURVEY_users', targetUid),
    {
      hasPin: false,
      updatedAtIso: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeToCurrentUserProfile(
  uid: string,
  onUpdate: (profile: InterviewerProfile) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, 'FNB_SURVEY_users', uid),
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        const superAdmin = isSuperAdminEmail(d.email) || Boolean(d.isSuperadmin);
        const liveProfile: InterviewerProfile = {
          uid: snap.id,
          email: d.email || '',
          displayName: d.displayName || d.email || 'Người dùng',
          photoURL: d.photoURL || '',
          role: superAdmin ? 'superadmin' : (d.role as UserRole) || 'interviewer',
          status: superAdmin ? 'approved' : (d.status as UserAccountStatus) || 'approved',
          isSuperadmin: superAdmin,
          interviewerCode: d.interviewerCode || `PVV-${snap.id.slice(0, 4).toUpperCase()}`,
          defaultLocationId: Number(d.defaultLocationId) || 1,
          defaultGiftName: d.defaultGiftName || 'Voucher ẩm thực / Quà lưu niệm Ba Na Hills',
          hasPin: Boolean(d.hasPin),
          updatedAt: d.updatedAtIso || new Date().toISOString(),
        };
        saveLocalInterviewerProfile(liveProfile);
        onUpdate(liveProfile);
      },
      () => {}
    );
  } catch {
    return () => {};
  }
}

export async function preAssignRoleByEmail(
  email: string,
  role: UserRole,
  defaultLocationId: number,
  displayName?: string
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return;
  await setDoc(
    doc(db, 'FNB_SURVEY_role_invites', cleanEmail),
    {
      email: cleanEmail,
      role,
      defaultLocationId,
      displayName: displayName?.trim() || cleanEmail.split('@')[0],
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Nếu email này đã từng đăng nhập trong FNB_SURVEY_users thì cập nhật trực tiếp quyền (VD: admin) ngay lập tức
  try {
    const snap = await getDocs(query(collection(db, 'FNB_SURVEY_users')));
    const updates: Promise<void>[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if ((d.email || '').trim().toLowerCase() === cleanEmail) {
        updates.push(
          setDoc(
            doc(db, 'FNB_SURVEY_users', docSnap.id),
            {
              role,
              isSuperadmin: role === 'superadmin' || isSuperAdminEmail(cleanEmail),
              defaultLocationId,
              updatedAtIso: new Date().toISOString(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          )
        );
      }
    });
    if (updates.length > 0) {
      await Promise.all(updates);
    }
  } catch {
    // ignore
  }
}

export async function deleteSurveyResponseById(id: string): Promise<void> {
  const remaining = getLocalResponses().filter((r) => r.id !== id);
  saveLocalResponses(remaining);
  await deleteDoc(doc(db, 'FNB_SURVEY_responses', id)).catch(() => {});
}

// ==================== LƯU TRỮ & ĐỒNG BỘ PHIẾU KHẢO SÁT ====================

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
  const pending = allLocal.filter((r) => !r.syncedToCloud && !r.id.startsWith('PILOT_SAMPLE_'));
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
    const usedFnB = i % 6 !== 0;
    const isTour = i % 5 === 0 || i % 5 === 3;

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
      S9: isTour ? 4 : (i % 3) + 1,
      A1: (i % 5) + 2,
      A1_locked: true,
      A2: usedFnB ? (i % 2 === 0 ? [1, 5] : [3, 4, 5]) : [7],
      A3: usedFnB ? [] : [3, 4],
      A3_2: usedFnB ? '' : '250000',
      A3_3: usedFnB ? '' : 'Món Hàn Quốc / Halal / Đồ ăn nhanh',
      A3_4: usedFnB ? null : 1,
      A4: usedFnB ? (i % 5) + 2 : null,
      A4_1: usedFnB ? (i % 4) + 1 : null,
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
      A8: usedFnB && i % 3 !== 0 ? (i % 3) + 2 : null,
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
      C4_note: 'Mẫu khảo sát thử nghiệm (Pilot)',
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
