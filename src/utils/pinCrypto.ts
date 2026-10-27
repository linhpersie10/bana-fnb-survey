/**
 * Bảo mật mã PIN 6 số theo chuẩn PKT Core ("The Vault")
 * Sử dụng WebCrypto PBKDF2-SHA256 (100,000 iterations) + Salt theo UID
 * Hỗ trợ xác thực cả trên Cloud Firestore (`banafi-kpi` / `pkt-survey`) và Offline Cache khi mất sóng tại đỉnh Bà Nà.
 */

const PIN_ITERATIONS = 100000;
const PIN_PEPPER = 'BANAFI_PKT_SURVEY_PEPPER_V1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 phút

export interface PinSecretRecord {
  pinHash: string;
  salt: string;
  version: string;
  updatedAt: string;
}

export interface PinAttemptState {
  failedCount: number;
  lockedUntil: number | null;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSalt(length = 16): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

export async function derivePinHash(pin: string, uid: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(`${pin}:${PIN_PEPPER}`),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const combinedSalt = enc.encode(`${uid}:${salt}:PKT_SURVEY_SALT`);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: combinedSalt,
      iterations: PIN_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufferToHex(bits);
}

export async function createPinSecret(pin: string, uid: string): Promise<PinSecretRecord> {
  const salt = generateSalt(16);
  const pinHash = await derivePinHash(pin, uid, salt);
  const record: PinSecretRecord = {
    pinHash,
    salt,
    version: 'pbkdf2-sha256-v1',
    updatedAt: new Date().toISOString(),
  };
  saveLocalPinSecret(uid, record);
  resetLocalPinAttempts(uid);
  return record;
}

export async function verifyPinAgainstRecord(
  pin: string,
  uid: string,
  record: PinSecretRecord
): Promise<boolean> {
  const candidateHash = await derivePinHash(pin, uid, record.salt);
  return candidateHash === record.pinHash;
}

// Local cache keys for offline-capable PIN verification on mobile/iPad
const getPinCacheKey = (uid: string) => `banafi_survey_pin_secret_${uid}`;
const getPinSessionKey = (uid: string) => `banafi_survey_pin_session_${uid}`;
const getPinAttemptKey = (uid: string) => `banafi_survey_pin_attempts_${uid}`;

export function saveLocalPinSecret(uid: string, record: PinSecretRecord): void {
  try {
    localStorage.setItem(getPinCacheKey(uid), JSON.stringify(record));
  } catch {
    // ignore storage quota errors
  }
}

export function getLocalPinSecret(uid: string): PinSecretRecord | null {
  try {
    const raw = localStorage.getItem(getPinCacheKey(uid));
    return raw ? (JSON.parse(raw) as PinSecretRecord) : null;
  } catch {
    return null;
  }
}

export function clearLocalPinSecret(uid: string): void {
  try {
    localStorage.removeItem(getPinCacheKey(uid));
    localStorage.removeItem(getPinSessionKey(uid));
    localStorage.removeItem(getPinAttemptKey(uid));
  } catch {
    // ignore
  }
}

export function markPinSessionVerified(
  uid: string,
  ttlMs = 365 * 24 * 60 * 60 * 1000
): void {
  try {
    localStorage.setItem(
      getPinSessionKey(uid),
      JSON.stringify({ verified: true, expiresAt: Date.now() + ttlMs })
    );
  } catch {
    // ignore
  }
}

export function isPinSessionVerified(uid: string): boolean {
  try {
    const raw = localStorage.getItem(getPinSessionKey(uid));
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data?.verified && (!data.expiresAt || Date.now() < data.expiresAt)) {
      return true;
    }
    localStorage.removeItem(getPinSessionKey(uid));
    return false;
  } catch {
    return false;
  }
}

export function lockPinSession(uid: string): void {
  try {
    localStorage.removeItem(getPinSessionKey(uid));
  } catch {
    // ignore
  }
}

export function getLocalPinAttempts(uid: string): PinAttemptState {
  try {
    const raw = localStorage.getItem(getPinAttemptKey(uid));
    if (!raw) return { failedCount: 0, lockedUntil: null };
    const state = JSON.parse(raw) as PinAttemptState;
    if (state.lockedUntil && Date.now() > state.lockedUntil) {
      localStorage.removeItem(getPinAttemptKey(uid));
      return { failedCount: 0, lockedUntil: null };
    }
    return state;
  } catch {
    return { failedCount: 0, lockedUntil: null };
  }
}

export function recordFailedPinAttemptLocal(uid: string): PinAttemptState {
  const current = getLocalPinAttempts(uid);
  const failedCount = current.failedCount + 1;
  const lockedUntil = failedCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
  const next: PinAttemptState = { failedCount, lockedUntil };
  try {
    localStorage.setItem(getPinAttemptKey(uid), JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}

export function resetLocalPinAttempts(uid: string): void {
  try {
    localStorage.removeItem(getPinAttemptKey(uid));
  } catch {
    // ignore
  }
}
