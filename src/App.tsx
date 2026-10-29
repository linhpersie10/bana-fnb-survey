import React, { useState, useEffect, useCallback } from 'react';
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
  Users,
  Settings,
  Lock,
  Wifi,
  WifiOff,
  LogOut,
  MapPin,
} from 'lucide-react';
import { auth, googleProvider } from './firebase';
import {
  SurveyResponseData,
  createEmptySurveyResponse,
} from './data/surveySchema';
import {
  SurveySystemConfig,
  getLocalSurveyConfig,
  subscribeToSurveyConfig,
} from './services/surveyConfig';
import {
  InterviewerProfile,
  UserRole,
  getLocalInterviewerProfile,
  saveLocalInterviewerProfile,
  fetchInterviewerProfileAndPin,
  saveInterviewerProfileAndPinToCloud,
  subscribeToCurrentUserProfile,
  submitSurveyResponse,
  syncPendingOfflineResponses,
  subscribeToSurveyResponses,
  saveDraftResponse,
  loadDraftResponse,
  clearDraftResponse,
  seedSamplePilotResponses,
  clearPilotSamples,
  deleteSurveyResponseById,
  isSuperAdminEmail,
} from './services/surveyStorage';
import {
  PinSecretRecord,
  getLocalPinSecret,
  saveLocalPinSecret,
  isPinSessionVerified,
  markPinSessionVerified,
  lockPinSession,
  clearLocalPinSecret,
} from './utils/pinCrypto';
import { AuthVault } from './components/AuthVault';
import { SurveyWizard } from './components/SurveyWizard';
import { QuotaDashboard } from './components/QuotaDashboard';
import { ResponsesTable } from './components/ResponsesTable';
import { UserManagement } from './components/UserManagement';
import { SystemSettings } from './components/SystemSettings';
import { BrandMark } from './components/BrandMark';

type ActiveTab = 'survey' | 'quota' | 'data' | 'users' | 'settings';

interface AuthUserState {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  isDemo?: boolean;
}

const ROLE_BADGE: Record<UserRole, { label: string; cls: string }> = {
  superadmin: {
    label: 'SUPERADMIN',
    cls: 'bg-red-50 text-[#d12f2f] border-red-200',
  },
  admin: {
    label: 'ADMIN',
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  interviewer: {
    label: 'ĐÁP VIÊN',
    cls: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const SAVED_AUTH_USER_KEY = 'banafi_fnb_persisted_auth_user_v1';

function getSavedAuthUser(): AuthUserState | null {
  try {
    const raw = localStorage.getItem(SAVED_AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUserState) : null;
  } catch {
    return null;
  }
}

function saveAuthUserToStorage(user: AuthUserState | null): void {
  try {
    if (user) {
      localStorage.setItem(SAVED_AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SAVED_AUTH_USER_KEY);
    }
  } catch {
    // ignore
  }
}

export const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUserState | null>(() => getSavedAuthUser());
  const [authInitializing, setAuthInitializing] = useState<boolean>(() => !getSavedAuthUser());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<InterviewerProfile | null>(() => {
    const saved = getSavedAuthUser();
    return saved ? getLocalInterviewerProfile(saved.uid) : null;
  });
  const [pinRecord, setPinRecord] = useState<PinSecretRecord | null>(() => {
    const saved = getSavedAuthUser();
    return saved ? getLocalPinSecret(saved.uid) : null;
  });
  const [pinUnlocked, setPinUnlocked] = useState<boolean>(() => {
    const saved = getSavedAuthUser();
    return saved ? isPinSessionVerified(saved.uid) : false;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('survey');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [responses, setResponses] = useState<SurveyResponseData[]>([]);
  const [surveyConfig, setSurveyConfig] = useState<SurveySystemConfig>(() =>
    getLocalSurveyConfig()
  );

  // Survey state
  const [bilingual, setBilingual] = useState<boolean>(false);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [formData, setFormData] = useState<SurveyResponseData>(() =>
    createEmptySurveyResponse('INIT', 'PVV Bà Nà', '', 1, 'Voucher ẩm thực', 1)
  );

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        let claimSuper = isSuperAdminEmail(fbUser.email);
        try {
          const tokenRes = await fbUser.getIdTokenResult();
          if (
            tokenRes.claims.rev_isSuperadmin === true ||
            tokenRes.claims.superadmin === true ||
            tokenRes.claims.fnb === 1
          ) {
            claimSuper = true;
          }
        } catch {
          // ignore
        }

        const userObj: AuthUserState = {
          uid: fbUser.uid,
          email: fbUser.email || 'pvv@sungroup.com.vn',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'PVV Bà Nà',
          photoURL: fbUser.photoURL,
          isDemo: false,
        };
        saveAuthUserToStorage(userObj);
        setAuthUser(userObj);

        // Khôi phục tức thì từ bộ nhớ đệm trên thiết bị để không phải chờ mạng khi F5 tải lại trang
        const cachedProfile = getLocalInterviewerProfile(userObj.uid);
        const cachedPin = getLocalPinSecret(userObj.uid);
        const alreadyVerified = isPinSessionVerified(userObj.uid);
        if (cachedProfile) setProfile(cachedProfile);
        if (cachedPin) setPinRecord(cachedPin);
        if (alreadyVerified) setPinUnlocked(true);
        setAuthInitializing(false);

        const { profile: p, pinRecord: pin } = await fetchInterviewerProfileAndPin(
          userObj.uid,
          userObj.email,
          userObj.displayName,
          false,
          claimSuper,
          userObj.photoURL || ''
        );
        setProfile(p);
        setPinRecord(pin);
        setPinUnlocked((prev) => prev || isPinSessionVerified(userObj.uid));
      } else {
        // Nếu người dùng đã đăng nhập trước đó trên trình duyệt này, giữ nguyên phiên khi tải lại trang
        const savedUser = getSavedAuthUser();
        if (savedUser) {
          setAuthUser(savedUser);
          const cachedProfile = getLocalInterviewerProfile(savedUser.uid);
          const cachedPin = getLocalPinSecret(savedUser.uid);
          if (cachedProfile) setProfile(cachedProfile);
          if (cachedPin) setPinRecord(cachedPin);
          setPinUnlocked(isPinSessionVerified(savedUser.uid));
        } else {
          setAuthUser(null);
          setProfile(null);
          setPinRecord(null);
          setPinUnlocked(false);
        }
      }
      setAuthInitializing(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authUser || authUser.isDemo) return;
    const unsubProfile = subscribeToCurrentUserProfile(authUser.uid, (liveProfile) => {
      setProfile(liveProfile);
    });
    return () => unsubProfile();
  }, [authUser]);

  useEffect(() => {
    if (!authUser || !pinUnlocked) return;
    const unsubResponses = subscribeToSurveyResponses(Boolean(authUser.isDemo), (list) => {
      setResponses(list);
    });
    const unsubConfig = subscribeToSurveyConfig((cfg) => {
      setSurveyConfig(cfg);
    });
    return () => {
      unsubResponses();
      unsubConfig();
    };
  }, [authUser, pinUnlocked]);

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
        myCount + 1,
        surveyConfig.dataFormat.surveyCodePrefix,
        surveyConfig.locations
      );
      setFormData(fresh);
      setStepIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, pinUnlocked]);

  useEffect(() => {
    if (!profile || !pinUnlocked) return;
    saveDraftResponse(formData, stepIndex);
  }, [formData, stepIndex, profile, pinUnlocked]);

  useEffect(() => {
    if (!timerRunning || !pinUnlocked) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, pinUnlocked]);

  useEffect(() => {
    if (!authUser || !pinUnlocked) return;
    markPinSessionVerified(authUser.uid);
  }, [authUser, pinUnlocked]);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      setAuthError(`Không thể đăng nhập Google (${code || 'Đã hủy'}). Vui lòng thử lại.`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handlePinVerified = async (
    updatedProfile: InterviewerProfile,
    newPinRecord?: PinSecretRecord
  ) => {
    // Lưu phiên mở khóa PIN đồng bộ ngay lập tức trước khi gọi Cloud để tải lại trang không bao giờ bị hỏi lại
    saveLocalInterviewerProfile(updatedProfile);
    if (newPinRecord) {
      saveLocalPinSecret(updatedProfile.uid, newPinRecord);
      setPinRecord(newPinRecord);
    }
    markPinSessionVerified(updatedProfile.uid);
    setProfile(updatedProfile);
    setPinUnlocked(true);
    await saveInterviewerProfileAndPinToCloud(updatedProfile, newPinRecord);
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
    saveAuthUserToStorage(null);
    setPinUnlocked(false);
    setProfile(null);
    setPinRecord(null);
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
      myCount + 1,
      surveyConfig.dataFormat.surveyCodePrefix,
      surveyConfig.locations
    );
    setFormData(nextForm);
    setStepIndex(0);
    setElapsedSeconds(0);
    setTimerRunning(false);
  }, [profile, responses, formData.locationId, formData.giftName, surveyConfig]);

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

  const handleDeleteResponse = async (id: string) => {
    await deleteSurveyResponseById(id);
    setResponses((prev) => prev.filter((r) => r.id !== id));
  };

  if (authInitializing) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
        <div className="w-9 h-9 rounded-full border-3 border-[#d12f2f] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-500">Đang tải cấu hình...</p>
      </div>
    );
  }

  if (!authUser || !pinUnlocked) {
    return (
      <AuthVault
        authUser={authUser}
        profile={profile}
        pinRecord={pinRecord}
        isSigningIn={isSigningIn}
        authError={authError}
        onGoogleLogin={handleGoogleLogin}
        onDemoLogin={() => {}}
        onPinVerified={handlePinVerified}
        onResetPinViaGoogle={handleResetPinViaGoogle}
        onLogout={handleLogout}
      />
    );
  }

  // Tài khoản bị khóa bởi Admin/Superadmin
  if (profile?.status === 'locked' && !profile.isSuperadmin) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Tài khoản đang tạm khóa</h2>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng liên hệ Superadmin hoặc Admin điều phối khảo sát để mở khóa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  const userRole: UserRole = profile?.role || 'interviewer';
  const isSuperadmin = userRole === 'superadmin' || Boolean(profile?.isSuperadmin);
  const isAdminOrSuper = isSuperadmin || userRole === 'admin';

  // Đáp viên chỉ nhìn thấy phiếu của chính mình; Admin/Superadmin nhìn thấy toàn bộ
  const visibleResponses = isAdminOrSuper
    ? responses
    : responses.filter((r) => r.interviewerUid === authUser.uid);

  const validCount = responses.filter((r) => r.status === 'completed').length;
  const unsyncedCount = responses.filter(
    (r) => !r.syncedToCloud && !r.id.startsWith('PILOT_SAMPLE_')
  ).length;
  const roleBadge = ROLE_BADGE[userRole];

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900 flex flex-col">
      {/* Compact Header (Ban Ẩm Thực) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <BrandMark size="sm" />
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-3 min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {profile?.displayName}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.cls}`}
              >
                {roleBadge.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 truncate">
                <MapPin className="w-3 h-3 text-[#d12f2f] shrink-0" />
                {surveyConfig.locations.find((l) => l.id === formData.locationId)?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
              {unsyncedCount > 0 && (
                <span className="px-1 bg-amber-500 text-white rounded text-[10px]">
                  {unsyncedCount}
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => {
                lockPinSession(authUser.uid);
                setPinUnlocked(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center gap-1 transition cursor-pointer"
              title="Khóa màn hình PIN"
            >
              <Lock className="w-3.5 h-3.5 text-[#d12f2f]" />
              <span>Khóa PIN</span>
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean Role-Based Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('survey')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'survey'
                ? 'border-[#d12f2f] text-[#d12f2f]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Phỏng vấn
          </button>

          {isAdminOrSuper && (
            <button
              type="button"
              onClick={() => setActiveTab('quota')}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'quota'
                  ? 'border-[#d12f2f] text-[#d12f2f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Quota ({validCount}/{surveyConfig.dataFormat.totalQuotaTarget || 600})
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'data'
                ? 'border-[#d12f2f] text-[#d12f2f]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {isAdminOrSuper
              ? `Dữ liệu & CSV (${responses.length})`
              : `Phiếu của tôi (${visibleResponses.length})`}
          </button>

          {isAdminOrSuper && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'users'
                  ? 'border-[#d12f2f] text-[#d12f2f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Phân quyền
            </button>
          )}

          {isAdminOrSuper && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#d12f2f] text-[#d12f2f]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Cấu hình
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-12">
        {activeTab === 'survey' && (
          <div className="max-w-2xl mx-auto">
            <SurveyWizard
              config={surveyConfig}
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

        {activeTab === 'quota' && isAdminOrSuper && (
          <QuotaDashboard
            responses={responses}
            config={surveyConfig}
            currentInterviewerUid={profile?.uid || authUser.uid}
            currentInterviewerName={profile?.displayName || authUser.displayName}
            isSuperadmin={isSuperadmin}
            onSeedPilotSamples={handleSeedPilot}
            onClearPilotSamples={handleClearPilot}
          />
        )}

        {activeTab === 'data' && (
          <ResponsesTable
            responses={visibleResponses}
            config={surveyConfig}
            isSyncing={isSyncing}
            canExportAll={isAdminOrSuper}
            canDelete={isAdminOrSuper}
            onSyncOffline={handleManualSync}
            onDeleteResponse={handleDeleteResponse}
          />
        )}

        {activeTab === 'users' && isAdminOrSuper && profile && (
          <UserManagement currentUserProfile={profile} config={surveyConfig} />
        )}

        {activeTab === 'settings' && isAdminOrSuper && (
          <SystemSettings
            config={surveyConfig}
            actorEmail={authUser.email}
            actorRole={userRole}
            onConfigSaved={setSurveyConfig}
          />
        )}
      </main>
    </div>
  );
};

export default App;
