import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  Delete,
  LogOut,
  MapPin,
  Gift,
  UserCheck,
  KeyRound,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { SURVEY_LOCATIONS } from '../data/surveySchema';
import { InterviewerProfile } from '../services/surveyStorage';
import {
  PinSecretRecord,
  createPinSecret,
  verifyPinAgainstRecord,
  getLocalPinAttempts,
  recordFailedPinAttemptLocal,
  resetLocalPinAttempts,
} from '../utils/pinCrypto';

interface AuthVaultProps {
  authUser: { uid: string; email: string; displayName: string; photoURL?: string | null; isDemo?: boolean } | null;
  profile: InterviewerProfile | null;
  pinRecord: PinSecretRecord | null;
  isSigningIn: boolean;
  authError: string | null;
  onGoogleLogin: () => Promise<void>;
  onDemoLogin: (customName?: string) => void;
  onPinVerified: (updatedProfile: InterviewerProfile, newPinRecord?: PinSecretRecord) => Promise<void>;
  onResetPinViaGoogle: () => Promise<void>;
  onLogout: () => Promise<void>;
}

type PinStep = 'profile_setup' | 'create_pin' | 'confirm_pin' | 'enter_pin';

export const AuthVault: React.FC<AuthVaultProps> = ({
  authUser,
  profile,
  pinRecord,
  isSigningIn,
  authError,
  onGoogleLogin,
  onDemoLogin,
  onPinVerified,
  onResetPinViaGoogle,
  onLogout,
}) => {
  const [step, setStep] = useState<PinStep>('enter_pin');
  const [pinValue, setPinValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  // Shift profile fields (used during initial setup or quick change)
  const [pvvName, setPvvName] = useState('');
  const [pvvCode, setPvvCode] = useState('');
  const [locationId, setLocationId] = useState<number>(1);
  const [giftName, setGiftName] = useState('Voucher ẩm thực / Quà lưu niệm Ba Na Hills');
  const [demoNameInput, setDemoNameInput] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setPvvName(profile.displayName || authUser?.displayName || 'PVV Bà Nà');
      setPvvCode(profile.interviewerCode || `PVV-${(authUser?.uid || '001').slice(0, 4).toUpperCase()}`);
      setLocationId(profile.defaultLocationId || 1);
      setGiftName(profile.defaultGiftName || 'Voucher ẩm thực / Quà lưu niệm Ba Na Hills');
    }
  }, [profile, authUser]);

  useEffect(() => {
    if (!authUser) return;
    if (pinRecord && pinRecord.pinHash) {
      setStep('enter_pin');
    } else {
      setStep('profile_setup');
    }
    setPinValue('');
    setFirstPin('');
    setErrorMsg(null);
  }, [authUser, pinRecord]);

  const triggerError = useCallback((msg: string, resetToCreate = false) => {
    setErrorMsg(msg);
    setShake(true);
    navigator.vibrate?.(80);
    setTimeout(() => setShake(false), 500);
    setPinValue('');
    if (resetToCreate) {
      setFirstPin('');
      setStep('create_pin');
    }
  }, []);

  const handleCompletePin = useCallback(
    async (enteredPin: string) => {
      if (!authUser || verifying) return;

      if (step === 'create_pin') {
        setFirstPin(enteredPin);
        setPinValue('');
        setErrorMsg(null);
        setStep('confirm_pin');
        return;
      }

      if (step === 'confirm_pin') {
        if (enteredPin !== firstPin) {
          triggerError('Mã PIN xác nhận không khớp. Vui lòng nhập lại từ đầu.', true);
          return;
        }
        setVerifying(true);
        try {
          const newSecret = await createPinSecret(enteredPin, authUser.uid);
          const updatedProfile: InterviewerProfile = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: pvvName.trim() || authUser.displayName || 'PVV Bà Nà',
            interviewerCode: pvvCode.trim() || 'PVV-01',
            defaultLocationId: locationId,
            defaultGiftName: giftName.trim() || 'Quà lưu niệm Ba Na Hills',
            hasPin: true,
            updatedAt: new Date().toISOString(),
            isDemoMode: authUser.isDemo,
          };
          setUnlockedSuccess(true);
          setTimeout(async () => {
            await onPinVerified(updatedProfile, newSecret);
          }, 550);
        } catch (e: any) {
          triggerError(e?.message || 'Không thể lưu mã PIN. Vui lòng thử lại.');
          setVerifying(false);
        }
        return;
      }

      if (step === 'enter_pin') {
        const attemptState = getLocalPinAttempts(authUser.uid);
        if (attemptState.lockedUntil && Date.now() < attemptState.lockedUntil) {
          const mins = Math.ceil((attemptState.lockedUntil - Date.now()) / 60000);
          triggerError(`Mã PIN đang tạm khóa do nhập sai 5 lần. Thử lại sau ${mins} phút hoặc bấm "Quên PIN?".`);
          return;
        }

        if (!pinRecord) {
          setStep('profile_setup');
          return;
        }

        setVerifying(true);
        try {
          const isValid = await verifyPinAgainstRecord(enteredPin, authUser.uid, pinRecord);
          if (!isValid) {
            const nextState = recordFailedPinAttemptLocal(authUser.uid);
            const remaining = Math.max(0, 5 - nextState.failedCount);
            setVerifying(false);
            triggerError(
              remaining > 0
                ? `Mã PIN không chính xác (Còn ${remaining} lần thử).`
                : 'Đã nhập sai 5 lần. Mã PIN bị khóa 15 phút.'
            );
            return;
          }

          resetLocalPinAttempts(authUser.uid);
          const updatedProfile: InterviewerProfile = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: pvvName.trim() || profile?.displayName || authUser.displayName,
            interviewerCode: pvvCode.trim() || profile?.interviewerCode || 'PVV-01',
            defaultLocationId: locationId,
            defaultGiftName: giftName.trim() || profile?.defaultGiftName || 'Quà lưu niệm Ba Na Hills',
            hasPin: true,
            updatedAt: new Date().toISOString(),
            isDemoMode: authUser.isDemo,
          };
          setUnlockedSuccess(true);
          setTimeout(async () => {
            await onPinVerified(updatedProfile);
          }, 500);
        } catch {
          setVerifying(false);
          triggerError('Lỗi xác thực mã PIN.');
        }
      }
    },
    [
      authUser,
      verifying,
      step,
      firstPin,
      pvvName,
      pvvCode,
      locationId,
      giftName,
      pinRecord,
      profile,
      onPinVerified,
      triggerError,
    ]
  );

  // Trigger when 6 digits are entered
  useEffect(() => {
    if (pinValue.length === 6 && !verifying && step !== 'profile_setup') {
      const timer = setTimeout(() => {
        void handleCompletePin(pinValue);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [pinValue, verifying, step, handleCompletePin]);

  // Physical keyboard support (desktop / iPad Magic Keyboard)
  useEffect(() => {
    if (!authUser || step === 'profile_setup') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (verifying || unlockedSuccess) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setErrorMsg(null);
        setPinValue((prev) => (prev.length < 6 ? prev + e.key : prev));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setPinValue((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authUser, step, verifying, unlockedSuccess]);

  const pressDigit = (d: string) => {
    if (verifying || unlockedSuccess) return;
    setErrorMsg(null);
    navigator.vibrate?.(15);
    setPinValue((prev) => (prev.length < 6 ? prev + d : prev));
  };

  const pressBackspace = () => {
    if (verifying || unlockedSuccess) return;
    navigator.vibrate?.(15);
    setPinValue((prev) => prev.slice(0, -1));
  };

  // ============================================================================
  // VIEW 1: GOOGLE SSO LOGIN SCREEN
  // ============================================================================
  if (!authUser) {
    return (
      <div className="min-h-dvh w-full bg-[#07110C] text-emerald-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Emerald Glow */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(900px 500px at 80% 0%, rgba(26, 173, 105, 0.22), transparent 65%), radial-gradient(800px 500px at 15% 100%, rgba(62, 203, 135, 0.14), transparent 65%), linear-gradient(145deg, #0D2016 0%, #07110C 60%, #050A07 100%)',
          }}
        />

        {/* Top Brand Pill */}
        <div className="relative z-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/8 border border-emerald-400/30 backdrop-blur-md mb-5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-emerald-200">
            SUN WORLD BA NA HILLS · BANAFI-KPI
          </span>
        </div>

        {/* Main Glass Card */}
        <div className="relative z-10 w-full max-w-md rounded-3xl bg-[#0D1E15]/90 border border-emerald-500/40 p-7 sm:p-8 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_-10px_rgba(26,173,105,0.3)] backdrop-blur-2xl animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center mx-auto mb-5 shadow-[0_0_28px_rgba(26,173,105,0.55)]">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-white tracking-tight">
            Khảo Sát F&B Bà Nà Hills
          </h1>
          <p className="text-sm text-emerald-200/75 text-center mt-2 leading-relaxed">
            Hệ thống phỏng vấn CAPI trên Điện thoại &amp; iPad dành cho Phỏng vấn viên (PVV). Lưu trữ thời gian thực trên{' '}
            <span className="text-emerald-300 font-semibold">banafi-kpi (pkt-survey)</span>.
          </p>

          {/* Feature Checklist */}
          <div className="mt-6 space-y-3 bg-black/25 rounded-2xl p-4 border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-100/90 leading-relaxed">
                <strong className="text-white block">Bước 1: Đăng nhập Google SSO</strong>
                Định danh tự động từng Phỏng vấn viên (PVV) qua tài khoản Google.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-100/90 leading-relaxed">
                <strong className="text-white block">Bước 2: Thiết lập &amp; Mở khóa bằng Mã PIN 6 số</strong>
                Mở khóa siêu tốc trên iPad/Mobile giữa các lượt phỏng vấn, hỗ trợ cả khi mất sóng.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-100/90 leading-relaxed">
                <strong className="text-white block">Tối ưu 5 Điểm khảo sát &amp; Quota n = 600</strong>
                Cổng thành · Nhà thờ 1 &amp; 2 · Ga 12 · Vòng xuyến.
              </div>
            </div>
          </div>

          {authError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google SSO Primary Button */}
          <button
            type="button"
            onClick={() => void onGoogleLogin()}
            disabled={isSigningIn}
            className="mt-6 w-full py-3.5 px-5 rounded-full bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(0,0,0,0.4)] hover:bg-emerald-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Đang kết nối Google SSO...' : 'Đăng nhập bằng Google SSO'}</span>
          </button>

          {/* Training / Demo Mode for Quick Field Practice */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            {!showDemoModal ? (
              <button
                type="button"
                onClick={() => setShowDemoModal(true)}
                className="text-xs text-emerald-300/80 hover:text-emerald-200 underline underline-offset-4 cursor-pointer"
              >
                Chế độ Tập huấn PVV / Thử nghiệm nhanh (Không cần Popup Google)
              </button>
            ) : (
              <div className="bg-black/35 p-3.5 rounded-2xl border border-emerald-500/30 text-left space-y-2.5 animate-fade-up">
                <label className="block text-xs font-semibold text-emerald-200">
                  Nhập Họ tên PVV để vào thiết lập Mã PIN 6 số:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={demoNameInput}
                    onChange={(e) => setDemoNameInput(e.target.value)}
                    placeholder="VD: Nguyễn Văn A (PVV Điểm 1)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => onDemoLogin(demoNameInput.trim() || 'PVV Tập Huấn')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shrink-0"
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="relative z-10 mt-6 text-[11px] tracking-widest uppercase text-emerald-200/40 text-center">
          PKT CORE SECURITY · THE VAULT PIN · SUN GROUP BNC
        </p>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: FIRST-TIME SHIFT SETUP + PIN CREATION OR PIN UNLOCK ("THE VAULT")
  // ============================================================================
  return (
    <div className="min-h-dvh w-full bg-[#07110C] text-emerald-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(900px 500px at 80% 0%, rgba(26, 173, 105, 0.22), transparent 65%), radial-gradient(800px 500px at 15% 100%, rgba(62, 203, 135, 0.14), transparent 65%), linear-gradient(145deg, #0D2016 0%, #07110C 60%, #050A07 100%)',
        }}
      />

      {/* Top Bar with Account Info & Logout */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0">
            {(authUser.displayName || authUser.email || 'P')[0].toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{authUser.displayName}</div>
            <div className="text-[11px] text-emerald-300/70 truncate">{authUser.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 text-xs text-emerald-100 cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đổi TK</span>
        </button>
      </div>

      {/* Main Vault Card */}
      <div
        className={`relative z-10 w-full max-w-md rounded-3xl bg-[#0D1E15]/95 border border-emerald-500/45 p-6 sm:p-7 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85),0_0_40px_-10px_rgba(26,173,105,0.32)] backdrop-blur-2xl ${
          shake ? 'animate-shake' : 'animate-fade-up'
        }`}
      >
        {step === 'profile_setup' ? (
          <div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Thiết lập Ca Khảo Sát &amp; Mã PIN</span>
            </div>
            <h2 className="text-xl font-extrabold text-white text-center">
              Thông Tin Phỏng Vấn Viên
            </h2>
            <p className="text-xs text-emerald-200/70 text-center mt-1 mb-5">
              Xác nhận thông tin mặc định trước khi đặt mã PIN 6 số cho thiết bị này.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">
                  Họ và tên Phỏng vấn viên (Tên PVV ghi trên phiếu) *
                </label>
                <input
                  type="text"
                  value={pvvName}
                  onChange={(e) => setPvvName(e.target.value)}
                  placeholder="Nhập họ tên PVV..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/35 border border-emerald-500/35 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Điểm khảo sát hiện tại (Có thể đổi trên màn hình chính) *</span>
                </label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09150F] border border-emerald-500/35 text-white text-sm focus:outline-none focus:border-emerald-400"
                >
                  {SURVEY_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} (Chỉ tiêu: ~{loc.quotaTarget} mẫu)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tên/Giá trị quà tặng du khách (Hiển thị ở Lời giới thiệu)</span>
                </label>
                <input
                  type="text"
                  value={giftName}
                  onChange={(e) => setGiftName(e.target.value)}
                  placeholder="VD: Voucher ẩm thực 50.000đ / Móc khóa Bà Nà"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/35 border border-emerald-500/35 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!pvvName.trim()) {
                    setErrorMsg('Vui lòng nhập Họ và tên Phỏng vấn viên.');
                    return;
                  }
                  setErrorMsg(null);
                  setStep('create_pin');
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-sm shadow-[0_0_25px_rgba(26,173,105,0.45)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer mt-2"
              >
                Tiếp tục: Đặt Mã PIN 6 Số →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {/* Vault Lock Badge */}
            <div
              className={`w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center transition-all ${
                unlockedSuccess
                  ? 'bg-emerald-400 text-slate-950 shadow-[0_0_30px_#34d399]'
                  : 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-[0_0_24px_rgba(26,173,105,0.35)]'
              }`}
            >
              {unlockedSuccess ? <CheckCircle2 className="w-8 h-8" /> : <Lock className="w-6 h-6" />}
            </div>

            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-1">
              BANAFI · THE VAULT PIN
            </div>

            <h2 className="text-xl font-extrabold text-white">
              {unlockedSuccess
                ? 'Đã Mở Khóa Phiên Khảo Sát!'
                : step === 'create_pin'
                ? 'Tạo Mã PIN Bảo Mật (6 Số)'
                : step === 'confirm_pin'
                ? 'Xác Nhận Lại Mã PIN (6 Số)'
                : `Xin chào, ${pvvName.split(' ').slice(-1)[0] || 'PVV'} 👋`}
            </h2>

            <p className="text-xs text-emerald-200/75 mt-1">
              {unlockedSuccess
                ? 'Đang mở giao diện phỏng vấn du khách...'
                : step === 'create_pin'
                ? 'Đặt mã PIN 6 chữ số để mở khóa nhanh trên Điện thoại / iPad'
                : step === 'confirm_pin'
                ? 'Nhập lại chính xác 6 chữ số bạn vừa tạo'
                : 'Nhập mã PIN 6 số của bạn để tiếp tục ghi phiếu khảo sát'}
            </p>

            {/* Quick Shift Location selector right on PIN unlock screen */}
            {step === 'enter_pin' && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-emerald-500/30 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="bg-transparent text-emerald-100 font-semibold focus:outline-none cursor-pointer"
                >
                  {SURVEY_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 6 Glass PIN Cells */}
            <div className="flex justify-center gap-2.5 my-5">
              {Array.from({ length: 6 }).map((_, idx) => {
                const isFilled = idx < pinValue.length;
                const isActive = idx === pinValue.length && !verifying && !unlockedSuccess;
                return (
                  <div
                    key={idx}
                    className={`w-11 h-13 rounded-2xl flex items-center justify-center border transition-all duration-150 ${
                      unlockedSuccess
                        ? 'border-emerald-400 bg-emerald-400/25 scale-105'
                        : isActive
                        ? 'border-emerald-400 bg-white/10 scale-105 shadow-[0_0_16px_rgba(52,211,153,0.45)]'
                        : isFilled
                        ? 'border-emerald-500/60 bg-emerald-500/20'
                        : 'border-white/15 bg-white/5'
                    }`}
                  >
                    {isFilled ? (
                      <span className="w-3 h-3 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" />
                    ) : isActive ? (
                      <span className="w-0.5 h-5 bg-emerald-400 animate-pulse" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Status / Error Line */}
            <div className="min-h-[22px] text-xs mb-3 flex items-center justify-center">
              {errorMsg ? (
                <span className="text-red-300 font-medium">{errorMsg}</span>
              ) : verifying ? (
                <span className="text-emerald-300 animate-pulse">Đang xác minh bảo mật PBKDF2...</span>
              ) : (
                <span className="text-emerald-200/50">
                  Hỗ trợ bấm trên màn hình cảm ứng hoặc bàn phím cứng
                </span>
              )}
            </div>

            {/* Touch Numeric Keypad (Optimized for Phone & iPad) */}
            <div className="grid grid-cols-3 gap-3 max-w-[270px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={verifying || unlockedSuccess}
                  onClick={() => pressDigit(digit)}
                  className="h-14 rounded-2xl border border-emerald-500/25 bg-white/6 hover:bg-emerald-500/20 active:scale-90 active:bg-emerald-500/35 text-xl font-bold text-white transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  {digit}
                </button>
              ))}

              {step === 'enter_pin' ? (
                <button
                  type="button"
                  disabled={verifying || unlockedSuccess}
                  onClick={() => {
                    void onResetPinViaGoogle();
                    setStep('profile_setup');
                  }}
                  className="h-14 rounded-2xl text-[11px] font-semibold text-emerald-300/80 hover:text-emerald-200 flex items-center justify-center cursor-pointer px-1"
                >
                  Quên PIN?
                </button>
              ) : (
                <button
                  type="button"
                  disabled={verifying || unlockedSuccess}
                  onClick={() => {
                    setPinValue('');
                    setFirstPin('');
                    setStep('profile_setup');
                  }}
                  className="h-14 rounded-2xl text-[11px] font-semibold text-emerald-300/80 hover:text-emerald-200 flex items-center justify-center cursor-pointer px-1"
                >
                  ← Sửa hồ sơ
                </button>
              )}

              <button
                type="button"
                disabled={verifying || unlockedSuccess}
                onClick={() => pressDigit('0')}
                className="h-14 rounded-2xl border border-emerald-500/25 bg-white/6 hover:bg-emerald-500/20 active:scale-90 active:bg-emerald-500/35 text-xl font-bold text-white transition-all flex items-center justify-center cursor-pointer select-none"
              >
                0
              </button>

              <button
                type="button"
                disabled={verifying || unlockedSuccess || pinValue.length === 0}
                onClick={pressBackspace}
                aria-label="Xóa số"
                className="h-14 rounded-2xl text-emerald-200 hover:bg-white/10 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-30"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
