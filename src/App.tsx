import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import {
  ClipboardList,
  BarChart3,
  Database,
  BookOpenCheck,
  Lock,
  Wifi,
  WifiOff,
  LogOut,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { auth, googleProvider } from './firebase';
import {
  SurveyResponseData,
  SURVEY_LOCATIONS,
  createEmptySurveyResponse,
} from './data/surveySchema';
import {
  InterviewerProfile,
  fetchInterviewerProfileAndPin,
  saveInterviewerProfileAndPinToCloud,
  submitSurveyResponse,
  syncPendingOfflineResponses,
  subscribeToSurveyResponses,
  saveDraftResponse,
  loadDraftResponse,
  clearDraftResponse,
  seedSamplePilotResponses,
  clearPilotSamples,
} from './services/surveyStorage';
import {
  PinSecretRecord,
  isPinSessionVerified,
  markPinSessionVerified,
  lockPinSession,
  clearLocalPinSecret,
} from './utils/pinCrypto';
import { AuthVault } from './components/AuthVault';
import { SurveyWizard } from './components/SurveyWizard';
import { QuotaDashboard } from './components/QuotaDashboard';
import { ResponsesTable } from './components/ResponsesTable';

type ActiveTab = 'survey' | 'quota' | 'data' | 'analysis';

interface AuthUserState {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  isDemo?: boolean;
}

const DEMO_SESSION_KEY = 'banafi_fnb_demo_auth_user_v1';

export const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUserState | null>(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<InterviewerProfile | null>(null);
  const [pinRecord, setPinRecord] = useState<PinSecretRecord | null>(null);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('survey');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [responses, setResponses] = useState<SurveyResponseData[]>([]);

  // Active Survey Wizard state
  const [bilingual, setBilingual] = useState<boolean>(true);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [formData, setFormData] = useState<SurveyResponseData>(() =>
    createEmptySurveyResponse('INIT', 'PVV Bà Nà', '', 1, 'Voucher ẩm thực / Quà lưu niệm Ba Na Hills', 1)
  );

  const lastActivityRef = useRef<number>(Date.now());

  // Network online/offline listener + auto-sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (authUser && !authUser.isDemo) {
        syncPendingOfflineResponses(false).catch(() => {});
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [authUser]);

  // Listen to Firebase Auth state or Demo user session
  useEffect(() => {
    const savedDemo = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo) as AuthUserState;
        setAuthUser(parsed);
        fetchInterviewerProfileAndPin(parsed.uid, parsed.email, parsed.displayName, true).then(
          ({ profile: p, pinRecord: pin }) => {
            setProfile(p);
            setPinRecord(pin);
            setPinUnlocked(Boolean(pin && isPinSessionVerified(parsed.uid)));
            setAuthInitializing(false);
          }
        );
        return;
      } catch {
        sessionStorage.removeItem(DEMO_SESSION_KEY);
      }
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj: AuthUserState = {
          uid: fbUser.uid,
          email: fbUser.email || 'pvv@sungroup.com.vn',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'PVV Bà Nà',
          photoURL: fbUser.photoURL,
          isDemo: false,
        };
        setAuthUser(userObj);
        const { profile: p, pinRecord: pin } = await fetchInterviewerProfileAndPin(
          userObj.uid,
          userObj.email,
          userObj.displayName,
          false
        );
        setProfile(p);
        setPinRecord(pin);
        setPinUnlocked(Boolean(pin && isPinSessionVerified(userObj.uid)));
      } else {
        setAuthUser(null);
        setProfile(null);
        setPinRecord(null);
        setPinUnlocked(false);
      }
      setAuthInitializing(false);
    });

    return () => unsub();
  }, []);

  // Subscribe to Firestore / Local responses when unlocked
  useEffect(() => {
    if (!authUser || !pinUnlocked) return;
    const unsub = subscribeToSurveyResponses(Boolean(authUser.isDemo), (list) => {
      setResponses(list);
    });
    return () => unsub();
  }, [authUser, pinUnlocked]);

  // Initialize or restore draft when profile is ready
  useEffect(() => {
    if (!profile || !pinUnlocked) return;
    const existingDraft = loadDraftResponse();
    if (existingDraft && existingDraft.draft.interviewerUid === profile.uid) {
      setFormData(existingDraft.draft);
      setStepIndex(existingDraft.stepIndex || 0);
    } else {
      const myCount = responses.filter((r) => r.interviewerUid === profile.uid).length;
      const fresh = createEmptySurveyResponse(
        profile.uid,
        profile.displayName,
        profile.email,
        profile.defaultLocationId,
        profile.defaultGiftName,
        myCount + 1
      );
      setFormData(fresh);
      setStepIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, pinUnlocked]);

  // Save draft on formData or stepIndex change
  useEffect(() => {
    if (!profile || !pinUnlocked) return;
    saveDraftResponse(formData, stepIndex);
  }, [formData, stepIndex, profile, pinUnlocked]);

  // Interview live stopwatch timer
  useEffect(() => {
    if (!timerRunning || !pinUnlocked) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, pinUnlocked]);

  // 15-minute inactivity auto-lock for tablet protection
  useEffect(() => {
    if (!authUser || !pinUnlocked) return;
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      markPinSessionVerified(authUser.uid);
    };
    window.addEventListener('pointerdown', updateActivity);
    window.addEventListener('keydown', updateActivity);

    const checkInterval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 15 * 60 * 1000) {
        lockPinSession(authUser.uid);
        setPinUnlocked(false);
      }
    }, 30000);

    return () => {
      window.removeEventListener('pointerdown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      clearInterval(checkInterval);
    };
  }, [authUser, pinUnlocked]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          'Tên miền hiện tại chưa được thêm vào Authorized Domains trên Firebase Console (banafi-kpi). Bạn có thể bấm "Chế độ Tập huấn / Demo PVV" bên dưới để sử dụng ngay lập tức với đầy đủ tính năng mã PIN!'
        );
      } else {
        setAuthError(
          `Không thể đăng nhập Google SSO (${code || 'Lỗi kết nối'}). Bạn có thể chọn "Chế độ Tập huấn / Demo PVV" bên dưới để trải nghiệm ngay.`
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoLogin = (customName?: string) => {
    const cleanName = customName?.trim() || 'Nguyễn Văn An (PVV Bà Nà)';
    const demoUser: AuthUserState = {
      uid: 'DEMO_PVV_BANA_01',
      email: 'pvv.bana@sungroup.com.vn',
      displayName: cleanName,
      isDemo: true,
    };
    sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    setAuthUser(demoUser);
    fetchInterviewerProfileAndPin(demoUser.uid, demoUser.email, demoUser.displayName, true).then(
      ({ profile: p, pinRecord: pin }) => {
        const updatedProfile = { ...p, displayName: cleanName };
        setProfile(updatedProfile);
        setPinRecord(pin);
        setPinUnlocked(false);
      }
    );
  };

  const handlePinVerified = async (
    updatedProfile: InterviewerProfile,
    newPinRecord?: PinSecretRecord
  ) => {
    setProfile(updatedProfile);
    if (newPinRecord) {
      setPinRecord(newPinRecord);
    }
    await saveInterviewerProfileAndPinToCloud(updatedProfile, newPinRecord);
    markPinSessionVerified(updatedProfile.uid);
    setPinUnlocked(true);
  };

  const handleResetPinViaGoogle = async () => {
    if (!authUser) return;
    clearLocalPinSecret(authUser.uid);
    setPinRecord(null);
    lockPinSession(authUser.uid);
    setPinUnlocked(false);
  };

  const handleLogout = async () => {
    if (authUser) {
      lockPinSession(authUser.uid);
    }
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    setPinUnlocked(false);
    if (authUser && !authUser.isDemo) {
      await signOut(auth).catch(() => {});
    }
    setAuthUser(null);
  };

  const handleStartNewSurvey = useCallback(() => {
    if (!profile) return;
    clearDraftResponse();
    const myCount = responses.filter((r) => r.interviewerUid === profile.uid).length;
    const nextForm = createEmptySurveyResponse(
      profile.uid,
      profile.displayName,
      profile.email,
      formData.locationId || profile.defaultLocationId,
      formData.giftName || profile.defaultGiftName,
      myCount + 1
    );
    setFormData(nextForm);
    setStepIndex(0);
    setElapsedSeconds(0);
    setTimerRunning(false);
  }, [profile, responses, formData.locationId, formData.giftName]);

  const handleSubmitSurvey = async (finalData: SurveyResponseData) => {
    setTimerRunning(false);
    const res = await submitSurveyResponse(finalData, Boolean(authUser?.isDemo));
    const latestLocal = subscribeToSurveyResponses(Boolean(authUser?.isDemo), (list) => {
      setResponses(list);
    });
    latestLocal();
    return res;
  };

  const handleManualSync = async () => {
    if (!authUser) return;
    setIsSyncing(true);
    try {
      await syncPendingOfflineResponses(Boolean(authUser.isDemo));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSeedPilot = () => {
    if (!profile) return;
    const updated = seedSamplePilotResponses(profile.uid, profile.displayName, profile.email);
    setResponses(updated);
  };

  const handleClearPilot = () => {
    const updated = clearPilotSamples();
    setResponses(updated);
  };

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 rounded-2xl border-4 border-amber-400 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">
          Đang kết nối hệ thống khảo sát Sun World Ba Na Hills (banafi-kpi)...
        </p>
      </div>
    );
  }

  // Gate 1 & Gate 2: Google SSO + 6-digit PIN Vault
  if (!authUser || !pinUnlocked) {
    return (
      <AuthVault
        authUser={authUser}
        profile={profile}
        pinRecord={pinRecord}
        isSigningIn={isSigningIn}
        authError={authError}
        onGoogleLogin={handleGoogleLogin}
        onDemoLogin={handleDemoLogin}
        onPinVerified={handlePinVerified}
        onResetPinViaGoogle={handleResetPinViaGoogle}
        onLogout={handleLogout}
      />
    );
  }

  const validCount = responses.filter((r) => r.status === 'completed').length;
  const unsyncedCount = responses.filter(
    (r) => !r.syncedToCloud && !r.id.startsWith('PILOT_SAMPLE_')
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Sticky CAPI Bar for iPad & Mobile */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
          {/* Brand & Location */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow">
              SW
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-black tracking-tight truncate">
                  KHẢO SÁT F&B BA NA HILLS
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold">
                  <ShieldCheck className="w-3 h-3" />
                  PIN ĐÃ MỞ KHÓA
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                <span className="font-bold text-slate-200 truncate">{profile?.displayName}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {SURVEY_LOCATIONS.find((l) => l.id === formData.locationId)?.name ||
                    '1. Cổng thành'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Status & Quick PIN Lock */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Network & Cloud pill */}
            <div
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
              title={
                isOnline
                  ? 'Thiết bị đang kết nối mạng — Tự động đồng bộ Firestore (banafi-kpi)'
                  : 'Chế độ Offline — Phiếu được lưu an toàn trên máy và tự đồng bộ khi có sóng'
              }
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
              {unsyncedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                  {unsyncedCount}
                </span>
              )}
            </div>

            {/* Instant Lock PIN button (for PVV putting phone/iPad in pocket) */}
            <button
              type="button"
              onClick={() => {
                lockPinSession(authUser.uid);
                setPinUnlocked(false);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Khóa màn hình bằng mã PIN 6 số"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Khóa PIN</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 transition cursor-pointer"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/70 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto px-2 sm:px-5 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('survey')}
              className={`px-3.5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'survey'
                  ? 'border-amber-400 text-amber-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Phỏng vấn du khách
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('quota')}
              className={`px-3.5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'quota'
                  ? 'border-amber-400 text-amber-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Bảng Quota ({validCount}/600)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={`px-3.5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'data'
                  ? 'border-amber-400 text-amber-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              Dữ liệu & Xuất CSV ({responses.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analysis')}
              className={`px-3.5 py-2.5 text-xs font-extrabold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'analysis'
                  ? 'border-amber-400 text-amber-300 bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpenCheck className="w-4 h-4" />
              Phân tích Thiết kế & Lưu ý BAT
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-5 pt-4 pb-10">
        {activeTab === 'survey' && (
          <div className="max-w-3xl mx-auto">
            <SurveyWizard
              formData={formData}
              setFormData={setFormData}
              stepIndex={stepIndex}
              setStepIndex={setStepIndex}
              bilingual={bilingual}
              setBilingual={setBilingual}
              elapsedSeconds={elapsedSeconds}
              onStartTimer={() => setTimerRunning(true)}
              onSubmitSurvey={handleSubmitSurvey}
              onStartNewSurvey={handleStartNewSurvey}
            />
          </div>
        )}

        {activeTab === 'quota' && (
          <QuotaDashboard
            responses={responses}
            currentInterviewerUid={profile?.uid || authUser.uid}
            currentInterviewerName={profile?.displayName || authUser.displayName}
            onSeedPilotSamples={handleSeedPilot}
            onClearPilotSamples={handleClearPilot}
          />
        )}

        {activeTab === 'data' && (
          <ResponsesTable
            responses={responses}
            isSyncing={isSyncing}
            onSyncOffline={handleManualSync}
          />
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6 pb-16">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/90">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Báo cáo phân tích thiết kế bảng hỏi (BAT — T10/2026)
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                6 Điểm Nghẽn Logic Trong Bản Word Gốc & Cách Ứng Dụng CAPI Tự Động Khắc Phục
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Khi chuyển đổi từ phiếu giấy sang ứng dụng phỏng vấn trên điện thoại/iPad cho 600 mẫu tại 5 điểm khảo sát (Cổng thành, Nhà thờ 1 & 2, Ga 12, Vòng xuyến), hệ thống đã chuẩn hóa các điểm lệch giữa Mặt phiếu, Phụ lục 1 (Quota) và Phụ lục 2 (Khung phân tích):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                {[
                  {
                    badge: 'Điểm nghẽn #1 — Câu A4.1 bị khuyết mặt phiếu',
                    issue:
                      'Tại câu A4 có ghi chú "[Nếu chọn mã 8, hỏi tiếp A4.1]" và Phụ lục 2 yêu cầu so sánh "A4.1 (chi thêm thực tế) vs A8 (dự kiến chi thêm)", nhưng mặt phiếu Word bị thiếu vùng in câu A4.1.',
                    fix: 'Đã khôi phục đầy đủ câu A4.1 (Khoản chi tiêu F&B phát sinh thêm ngoài vé trọn gói/combo) ngay dưới câu A4 trên ứng dụng.',
                  },
                  {
                    badge: 'Điểm nghẽn #2 — Bảng A5 thiếu dòng "Nhà hàng Buffet"',
                    issue:
                      'Câu A2 có Mã 1 = Nhà hàng buffet, nhưng bảng ma trận A5 chỉ có 5 dòng (A la carte, Quầy ăn nhanh, Bánh ngọt, Đồ uống, Quà lưu niệm), khiến khách chỉ ăn Buffet không thể đánh giá A5.',
                    fix: 'Bổ sung đầy đủ 6 dòng trong A5 và tự động lọc động (Dynamic Matrix Filtering): khách chọn loại hình nào ở A2 thì chỉ hiện đúng dòng đó ở A5.',
                  },
                  {
                    badge: 'Điểm nghẽn #3 — Lệch mã tham chiếu S9/S10 & C1-C3/C4-C6',
                    issue:
                      'Phụ lục 1 ghi "Loại vé (S10)" trong khi Phần S chỉ đến S9. Phụ lục 2 ghi "C4, C6" trong khi Phần C chỉ có C1, C2, C3.',
                    fix: 'Ánh xạ chuẩn S9 cho Quota loại vé/combo và bổ sung ô C4_note để PVV ghi nhận nhanh ý kiến mở của du khách.',
                  },
                  {
                    badge: 'Điểm nghẽn #4 — Quota Nga (~30 mẫu) nhưng S5 thiếu mã riêng',
                    issue:
                      'Bảng Quota Phụ lục 1 yêu cầu theo dõi nhóm khách Nga (~30 mẫu), nhưng câu S5 chỉ có mã 9 (Châu Âu/Bắc Mỹ/Úc) và mã 10 (Khác).',
                    fix: 'Tách riêng Mã 11: "Nga / Russia" trong câu S5 và kết nối trực tiếp vào bộ đếm Quota thời gian thực.',
                  },
                  {
                    badge: 'Điểm nghẽn #5 — Ràng buộc chọn tối đa & Mã loại trừ',
                    issue:
                      'Trên giấy, PVV rất dễ tích nhầm quá số lượng (A3, A6, B2, C1, C2 tối đa 2; B1, C3 tối đa 3) hoặc vừa tích dịch vụ vừa tích "Không sử dụng / Không có nhu cầu".',
                    fix: 'Tự động khóa chọn quá số lượng và tự động bỏ các mã khác khi chọn mã loại trừ (A2=7, B2=7, C2=7, C3=13).',
                  },
                  {
                    badge: 'Điểm nghẽn #6 — Chống sửa lùi câu A1 sau khi hỏi A4',
                    issue:
                      'Ghi chú A1 yêu cầu "Ghi nhận phản xạ đầu tiên, không chỉnh sửa lại sau khi khách trả lời A4" để đo lường chính xác chênh lệch ngân sách.',
                    fix: 'Tự động khóa cứng (Lock) câu A1 ngay khi PVV bấm chuyển sang bước A3–A8, kèm nút mở khóa có xác nhận nếu bấm nhầm.',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2"
                  >
                    <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {item.badge}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Vấn đề trên phiếu gốc:</strong> {item.issue}
                    </p>
                    <p className="text-xs text-emerald-800 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200 leading-relaxed flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Giải pháp trên App:</strong> {item.fix}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
