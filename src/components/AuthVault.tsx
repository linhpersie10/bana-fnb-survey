import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { Check, Delete, Lock, LogOut, Moon, ShieldCheck, Sun } from 'lucide-react';
import { InterviewerProfile } from '../services/surveyStorage';
import {
  PinSecretRecord,
  createPinSecret,
  verifyPinAgainstRecord,
  markPinSessionVerified,
  getLocalPinAttempts,
  recordFailedPinAttemptLocal,
  resetLocalPinAttempts,
} from '../utils/pinCrypto';
import { VaultShell } from './vault/VaultShell';
import { PaymentHero } from './vault/PaymentHero';
import { PinCells, type PinPhase } from './vault/PinCells';
import { EASE_OUT, SPRING_POP } from './vault/motionTokens';
import { BrandMark } from './BrandMark';

interface AuthVaultProps {
  authUser: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string | null;
    isDemo?: boolean;
  } | null;
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

const PIN_LENGTH = 6;
const MIN_VERIFY_MS = 750;
const SUCCESS_HOLD_MS = 1150;
const LEAVE_MS = 300;
type Step = 'enter' | 'create' | 'confirm';

const COPY: Record<Step, { title: string; desc: string }> = {
  enter: { title: 'Mở khóa F&B Survey', desc: 'Nhập mã PIN 6 số của bạn' },
  create: { title: 'Thiết lập mã PIN', desc: 'Tạo mã PIN 6 số cho lần đầu đăng nhập' },
  confirm: { title: 'Xác nhận mã PIN', desc: 'Nhập lại mã PIN vừa tạo' },
};

const stagger: Variants = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE_OUT } },
};
const swap = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
  transition: { duration: 0.24, ease: EASE_OUT },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const AuthVault: React.FC<AuthVaultProps> = ({
  authUser,
  profile,
  pinRecord,
  isSigningIn,
  authError,
  onGoogleLogin,
  onPinVerified,
  onResetPinViaGoogle,
  onLogout,
}) => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const hasConfiguredPin = Boolean(pinRecord && pinRecord.pinHash);

  const [step, setStep] = useState<Step>(hasConfiguredPin ? 'enter' : 'create');
  const [value, setValue] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<PinPhase>('typing');
  const [leaving, setLeaving] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  useEffect(() => {
    if (phase === 'success') return;
    if (hasConfiguredPin && step !== 'enter' && !firstPin) setStep('enter');
    if (!hasConfiguredPin && step === 'enter') setStep('create');
  }, [hasConfiguredPin, phase, step, firstPin]);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });
  useEffect(() => {
    if (authUser) focusInput();
  }, [step, authUser]);
  useEffect(() => () => clearTimeout(errorTimer.current), []);

  const locked = loadingReset || phase === 'verifying' || phase === 'success';

  const fail = useCallback((message: string, backToCreate = false) => {
    setError(message);
    setPhase('error');
    setShake(true);
    navigator.vibrate?.(60);
    setTimeout(() => setShake(false), 500);
    clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setPhase((p) => (p === 'error' ? 'typing' : p)), 700);
    setValue('');
    if (backToCreate) {
      setFirstPin('');
      setStep('create');
    }
    focusInput();
  }, []);

  const succeed = useCallback(
    async (updatedProfile: InterviewerProfile, newPin?: PinSecretRecord) => {
      markPinSessionVerified(updatedProfile.uid);
      setError(null);
      setPhase('success');
      await wait(SUCCESS_HOLD_MS);
      setLeaving(true);
      await wait(LEAVE_MS);
      await onPinVerified(updatedProfile, newPin);
    },
    [onPinVerified]
  );

  const submit = useCallback(
    async (pin: string) => {
      if (locked || !authUser) return;

      const attemptState = getLocalPinAttempts(authUser.uid);
      if (attemptState.lockedUntil && Date.now() < attemptState.lockedUntil) {
        const mins = Math.ceil((attemptState.lockedUntil - Date.now()) / 60000);
        fail(`Nhập sai quá 5 lần. Tạm khóa ${mins} phút.`);
        return;
      }

      if (step === 'create') {
        setFirstPin(pin);
        setValue('');
        setError(null);
        setStep('confirm');
        return;
      }

      if (step === 'confirm' && pin !== firstPin) {
        fail('Mã PIN xác nhận không khớp. Hãy tạo lại từ đầu.', true);
        return;
      }

      setPhase('verifying');
      const t0 = Date.now();
      let ok = false;
      let message =
        step === 'enter'
          ? 'Mã PIN không chính xác. Vui lòng thử lại.'
          : 'Đã xảy ra lỗi khi tạo PIN. Vui lòng thử lại.';
      let createdRecord: PinSecretRecord | undefined;

      const finalProfile: InterviewerProfile = profile || {
        uid: authUser.uid,
        email: authUser.email,
        displayName: authUser.displayName || 'PVV Bà Nà',
        role: 'interviewer',
        status: 'approved',
        interviewerCode: `PVV-${authUser.uid.slice(0, 4).toUpperCase()}`,
        defaultLocationId: 1,
        defaultGiftName: 'Voucher ẩm thực / Quà lưu niệm Ba Na Hills',
        hasPin: true,
        updatedAt: new Date().toISOString(),
        isDemoMode: Boolean(authUser.isDemo),
      };

      try {
        if (step === 'enter' && pinRecord) {
          ok = await verifyPinAgainstRecord(pin, authUser.uid, pinRecord);
          if (!ok) {
            const nextState = recordFailedPinAttemptLocal(authUser.uid);
            const left = Math.max(0, 5 - nextState.failedCount);
            message =
              left > 0
                ? `Mã PIN không chính xác (còn ${left} lần thử).`
                : 'Đã khóa tạm thời 15 phút do nhập sai 5 lần.';
          } else {
            resetLocalPinAttempts(authUser.uid);
          }
        } else {
          createdRecord = await createPinSecret(pin, authUser.uid);
          ok = true;
        }
      } catch {
        message = 'Đã xảy ra lỗi khi xác minh PIN.';
      }

      const rest = MIN_VERIFY_MS - (Date.now() - t0);
      if (rest > 0) await wait(rest);

      if (ok) {
        await succeed({ ...finalProfile, hasPin: true }, createdRecord);
      } else {
        fail(message, step === 'confirm');
      }
    },
    [locked, authUser, step, firstPin, profile, pinRecord, fail, succeed]
  );

  useEffect(() => {
    if (value.length === PIN_LENGTH && phase === 'typing') {
      const pin = value;
      const t = setTimeout(() => void submit(pin), 140);
      return () => clearTimeout(t);
    }
  }, [value, phase, submit]);

  const type = (next: (v: string) => string) => {
    setError(null);
    setPhase((p) => (p === 'error' ? 'typing' : p));
    setValue((v) => next(v).replace(/\D/g, '').slice(0, PIN_LENGTH));
  };
  const push = (digit: string) => {
    if (!locked) type((v) => v + digit);
  };
  const pop = () => {
    if (!locked) setValue((v) => v.slice(0, -1));
  };

  useEffect(() => {
    if (!authUser) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (locked || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const editable =
        t &&
        t !== inputRef.current &&
        (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName));
      if (editable) return;
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        if (e.repeat) return;
        type((v) => v + e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        setValue((v) => v.slice(0, -1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [authUser, locked]);

  const handleResetPin = async () => {
    if (!window.confirm('Đặt lại mã PIN? Bạn sẽ tạo mã PIN 6 số mới cho tài khoản này.')) return;
    setLoadingReset(true);
    setError(null);
    try {
      await onResetPinViaGoogle();
      setValue('');
      setFirstPin('');
      setStep('create');
    } finally {
      setLoadingReset(false);
    }
  };

  // ==================== MÀN 1: ĐĂNG NHẬP GOOGLE SSO (CHUẨN PKT PAYMENT) ====================
  if (!authUser) {
    return (
      <VaultShell
        maxWidth={420}
        topRight={
          <button
            type="button"
            onClick={toggleTheme}
            className="vs-ghost-btn"
            aria-label="Đổi giao diện Sáng/Tối"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        }
        footer={
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} /> Bảo mật cấp doanh nghiệp
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} /> Dữ liệu nội bộ Ban Ẩm Thực
            </span>
          </>
        }
      >
        <style>{`
          .lg-google {
            position: relative; isolation: isolate; overflow: hidden;
            margin-top: 26px; width: 100%; min-height: 56px; padding: 6px;
            display: grid; grid-template-columns: 44px minmax(0, 1fr) 28px; align-items: center;
            border-radius: 9999px; border: 1px solid color-mix(in srgb, var(--brand) 65%, transparent);
            background: linear-gradient(110deg, var(--brand) 0%, var(--brand-solid) 35%, var(--brand-solid) 65%, var(--brand) 100%);
            background-size: 220% 100%;
            color: #ffffff; font-size: 15px; font-weight: 600; font-family: var(--font-ui);
            cursor: pointer; transition: transform .25s cubic-bezier(.2,.9,.3,1.3), box-shadow .3s, filter .2s;
            box-shadow: 0 0 24px -2px color-mix(in srgb, var(--brand) 68%, transparent), 0 16px 34px -14px color-mix(in srgb, var(--brand) 75%, transparent), inset 0 1px 0 rgba(255,255,255,0.55);
            animation: lg-flow 6s ease-in-out 1.2s infinite, lg-halo 3.2s ease-in-out 1.2s infinite;
          }
          .lg-google::after {
            content: ''; position: absolute; inset: -2px auto -2px -40%; width: 34%; z-index: -1;
            background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 80%, transparent 100%);
            transform: skewX(-18deg); animation: lg-sheen 3.6s ease-in-out 1.4s infinite;
          }
          .lg-google:hover { transform: translateY(-2px) scale(1.015); filter: brightness(1.06); }
          .lg-google:active { transform: translateY(0) scale(.97); }
          .lg-google:disabled { cursor: default; animation: none; transform: none; }
          .lg-state { display: contents; }
          .lg-gicon {
            width: 44px; height: 44px; background: #fff; border-radius: 9999px;
            display: inline-flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(26,36,64,0.18), inset 0 0 0 1px rgba(26,36,64,0.06);
            transition: transform .5s cubic-bezier(.2,.9,.3,1.4);
          }
          .lg-google:hover .lg-gicon { transform: rotate(360deg) scale(1.08); }
          .lg-google-label { white-space: nowrap; font-size: 15px; text-align: center; }
          .lg-google-arrow { justify-self: center; opacity: 0; transform: translateX(-8px); transition: opacity .3s, transform .3s; font-size: 18px; }
          .lg-google:hover .lg-google-arrow { opacity: 1; transform: translateX(0); }
          .lg-brand { margin-bottom: 12px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
          .lg-error {
            margin-top: 16px; padding: 11px 14px; border-radius: 14px; text-align: left;
            font-size: 12.5px; line-height: 1.45; color: var(--danger);
            background: color-mix(in srgb, var(--danger) 8%, transparent); border: 1px solid color-mix(in srgb, var(--danger) 25%, transparent);
          }
          .lg-hint { margin-top: 16px; font-size: 12px; color: var(--fg-muted); }
          .lg-spin { width: 20px; height: 20px; border-radius: 9999px; border: 2.5px solid rgba(26,36,64,0.25); border-top-color: #1a2440; animation: lg-rotate .8s linear infinite; }
          @keyframes lg-flow { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          @keyframes lg-sheen { 0% { left: -40%; } 55%, 100% { left: 120%; } }
          @keyframes lg-halo {
            0%, 100% { box-shadow: 0 0 24px -2px color-mix(in srgb, var(--brand) 62%, transparent), inset 0 1px 0 rgba(255,255,255,0.55); }
            50% { box-shadow: 0 0 32px 2px color-mix(in srgb, var(--brand) 82%, transparent), 0 0 0 6px color-mix(in srgb, var(--brand) 18%, transparent), inset 0 1px 0 rgba(255,255,255,0.55); }
          }
          @keyframes lg-rotate { to { transform: rotate(360deg); } }
        `}</style>

        <PaymentHero />
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={rise} className="lg-brand">
            <BrandMark size="md" />
          </motion.div>

          <motion.div variants={rise}>
            <h1 className="vs-title">Khảo sát F&amp;B Bà Nà Hills</h1>
            <p className="vs-desc">Hệ thống phỏng vấn &amp; quản trị dữ liệu nội bộ</p>
          </motion.div>

          <motion.div variants={rise}>
            <button
              className={`lg-google${isSigningIn ? ' busy' : ''}`}
              onClick={() => void onGoogleLogin()}
              disabled={isSigningIn}
              type="button"
            >
              {isSigningIn ? (
                <span className="lg-state">
                  <span className="lg-gicon">
                    <span className="lg-spin" />
                  </span>
                  <span className="lg-google-label">Đang xác thực…</span>
                  <span />
                </span>
              ) : (
                <span className="lg-state">
                  <span className="lg-gicon">
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
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
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </span>
                  <span className="lg-google-label">Đăng nhập bằng Google</span>
                  <span className="lg-google-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              )}
            </button>
          </motion.div>

          {authError && (
            <div className="lg-error" role="alert">
              {authError}
            </div>
          )}

          <motion.p variants={rise} className="lg-hint">
            Bằng việc đăng nhập, bạn đồng ý với quy định bảo mật của Ban Ẩm Thực.
          </motion.p>
        </motion.div>
      </VaultShell>
    );
  }

  // ==================== MÀN 2: MÃ PIN 6 SỐ (CHUẨN PKT PAYMENT) ====================
  const name = authUser.displayName || '';
  const { title, desc } =
    phase === 'success'
      ? step === 'enter'
        ? { title: 'Đã mở khóa', desc: name ? `Chào mừng trở lại, ${name}` : 'Chào mừng trở lại' }
        : { title: 'Đã thiết lập mã PIN', desc: 'Không gian làm việc đã sẵn sàng' }
      : COPY[step];

  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let statusNode: React.ReactNode = null;
  if (error) statusNode = <span className="pv-error">{error}</span>;
  else if (phase === 'verifying')
    statusNode = (
      <span className="pv-status">
        <i className="pv-spin" />
        {step === 'enter' ? 'Đang xác minh mã PIN…' : 'Đang lưu mã PIN…'}
      </span>
    );
  else if (phase === 'success')
    statusNode = (
      <span className="pv-status ok">
        <Check size={14} strokeWidth={3} />
        Đã xác thực &amp; bảo mật
      </span>
    );
  else if (loadingReset)
    statusNode = (
      <span className="pv-status">
        <i className="pv-spin" />
        Đang đặt lại…
      </span>
    );

  const cardClass = [shake && 'shake', leaving && 'leaving'].filter(Boolean).join(' ');

  return (
    <div
      style={{ display: 'contents' }}
      onMouseDown={(e) => {
        if (!(e.target as HTMLElement).closest('button')) focusInput();
      }}
    >
      <VaultShell
        maxWidth={400}
        cardClassName={cardClass}
        topRight={
          <>
            <button
              type="button"
              onClick={toggleTheme}
              className="vs-ghost-btn"
              aria-label="Đổi giao diện Sáng/Tối"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              className="vs-ghost-btn"
              onClick={() => void onLogout()}
              type="button"
              disabled={phase === 'success'}
            >
              <LogOut size={15} />
              Đăng xuất
            </button>
          </>
        }
      >
        <style>{`
          .pv-logo { display: flex; justify-content: center; margin: 0 auto 18px; transition: filter .5s; }
          .pv-logo.ok { filter: drop-shadow(0 0 14px color-mix(in srgb, var(--success) 55%, transparent)); }
          .pv-head { min-height: 58px; }
          .pv-title { font-family: var(--font-ui); font-size: 22px; font-weight: 600; color: var(--fg); letter-spacing: -0.01em; margin: 0; }
          .pv-title .hl { color: var(--success); }
          .pv-desc { margin-top: 6px; font-size: 13.5px; color: var(--fg-muted); }
          .pv-status-line { min-height: 22px; margin-top: 10px; display: flex; justify-content: center; font-size: 12.5px; }
          .pv-error { color: var(--danger); }
          .pv-status { display: inline-flex; align-items: center; gap: 8px; color: color-mix(in srgb, var(--brand) 55%, var(--fg)); }
          .pv-status.ok { color: var(--success); font-weight: 600; }
          .pv-spin { width: 13px; height: 13px; border-radius: 9999px; border: 2px solid color-mix(in srgb, var(--brand) 28%, transparent); border-top-color: var(--brand); animation: pv-rotate .8s linear infinite; display: inline-block; }
          .pv-pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px; justify-items: center; transition: opacity .3s, filter .3s; }
          .pv-pad.dim { opacity: .35; filter: saturate(.6); }
          .pv-key {
            width: 64px; height: 64px; border-radius: 9999px; border: 1px solid color-mix(in srgb, var(--brand) 20%, transparent);
            background: var(--surface-2); color: var(--fg); font-size: 22px; font-weight: 500;
            font-family: var(--font-ui); cursor: pointer; font-variant-numeric: tabular-nums;
            transition: background .15s, transform .12s cubic-bezier(.2,.9,.3,1.4), border-color .15s, box-shadow .2s;
            display: flex; align-items: center; justify-content: center;
            -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          }
          .pv-key:hover { background: color-mix(in srgb, var(--brand) 18%, transparent); border-color: color-mix(in srgb, var(--brand) 55%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--brand) 25%, transparent); }
          .pv-key:active { transform: scale(.9); background: color-mix(in srgb, var(--brand) 32%, transparent); border-color: color-mix(in srgb, var(--brand) 85%, transparent); transition-duration: .05s; }
          .pv-key:disabled { cursor: default; }
          .pv-key.ghost { border: none; background: transparent; font-size: 12px; font-weight: 600; color: var(--fg-muted); box-shadow: none; }
          .pv-key.ghost:hover { color: var(--brand); background: transparent; }
          .pv-steps { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
          .pv-pip { width: 26px; height: 4px; border-radius: 9999px; background: color-mix(in srgb, var(--fg) 16%, transparent); transition: background .3s; }
          .pv-pip.on { background: var(--brand); box-shadow: 0 0 10px color-mix(in srgb, var(--brand) 65%, transparent); }
          .pv-hidden-input { position: absolute; opacity: 0; pointer-events: none; font-size: 16px; width: 1px; height: 1px; }
          @keyframes pv-rotate { to { transform: rotate(360deg); } }
          @media (max-height: 720px) { .pv-key { width: 56px; height: 56px; } .vs-card { padding: 30px 26px 24px !important; } }
        `}</style>

        <div className={`pv-logo${phase === 'success' ? ' ok' : ''}`}>
          <BrandMark size="md" />
        </div>

        <div className="pv-head">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={title} {...swap}>
              <h1 className="pv-title">
                {phase === 'success' ? (
                  <>
                    {title.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="hl">{title.split(' ').slice(-1)}</span>
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="pv-desc">{desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          className="pv-hidden-input"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value}
          onChange={(e) => {
            if (locked) return;
            type(() => e.target.value.replace(/\D/g, ''));
          }}
          disabled={locked}
          aria-label="Mã PIN"
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ duration: 0.26, ease: EASE_OUT }}
          >
            <PinCells length={PIN_LENGTH} filled={value.length} phase={phase} onClick={focusInput} />
          </motion.div>
        </AnimatePresence>

        <div className="pv-status-line" role="status" aria-live="polite">
          {statusNode}
        </div>

        <div className={`pv-pad${locked ? ' dim' : ''}`}>
          {keypad.map((d) => (
            <button
              key={d}
              className="pv-key"
              type="button"
              disabled={locked}
              onClick={() => push(d)}
            >
              {d}
            </button>
          ))}
          {step === 'enter' ? (
            <button
              className="pv-key ghost"
              type="button"
              disabled={locked}
              onClick={() => void handleResetPin()}
            >
              Quên PIN?
            </button>
          ) : (
            <span />
          )}
          <button className="pv-key" type="button" disabled={locked} onClick={() => push('0')}>
            0
          </button>
          <button
            className="pv-key ghost"
            type="button"
            disabled={locked}
            onClick={pop}
            aria-label="Xóa"
          >
            <Delete size={20} />
          </button>
        </div>

        {step !== 'enter' && (
          <div className="pv-steps" aria-hidden>
            <span className="pv-pip on" />
            <span className={`pv-pip${step === 'confirm' ? ' on' : ''}`} />
          </div>
        )}
      </VaultShell>
    </div>
  );
};
