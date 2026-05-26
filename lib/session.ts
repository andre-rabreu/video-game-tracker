import type { useRouter } from 'next/navigation';

export const SESSION_TIMEOUT_MS = 60 * 60 * 1000;
export const SESSION_EXPIRED_FLAG = 'sessionExpired';

const KEY_USER_ID = 'userId';
const KEY_USERNAME = 'username';
const KEY_EMAIL = 'email';
const KEY_EXPIRES_AT = 'sessionExpiresAt';

type Router = ReturnType<typeof useRouter>;

export interface Session {
  userId: string;
  username: string;
  email: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getSession(): Session | null {
  if (!isBrowser()) return null;

  const userId = localStorage.getItem(KEY_USER_ID);
  const username = localStorage.getItem(KEY_USERNAME);
  const email = localStorage.getItem(KEY_EMAIL);
  const expiresAtRaw = localStorage.getItem(KEY_EXPIRES_AT);

  if (!userId || !username || !email || !expiresAtRaw) {
    return null;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearSession();
    return null;
  }

  return { userId, username, email };
}

export function setSession(session: Session): void {
  if (!isBrowser()) return;
  localStorage.setItem(KEY_USER_ID, session.userId);
  localStorage.setItem(KEY_USERNAME, session.username);
  localStorage.setItem(KEY_EMAIL, session.email);
  localStorage.setItem(KEY_EXPIRES_AT, String(Date.now() + SESSION_TIMEOUT_MS));
}

export function touchSession(): void {
  if (!isBrowser()) return;
  const userId = localStorage.getItem(KEY_USER_ID);
  const expiresAtRaw = localStorage.getItem(KEY_EXPIRES_AT);
  if (!userId || !expiresAtRaw) return;
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return;
  localStorage.setItem(KEY_EXPIRES_AT, String(Date.now() + SESSION_TIMEOUT_MS));
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_USER_ID);
  localStorage.removeItem(KEY_USERNAME);
  localStorage.removeItem(KEY_EMAIL);
  localStorage.removeItem(KEY_EXPIRES_AT);
}

export function expireAndRedirect(router?: Router): void {
  if (!isBrowser()) return;
  clearSession();
  sessionStorage.setItem(SESSION_EXPIRED_FLAG, '1');
  if (router) {
    router.push('/');
  } else {
    window.location.href = '/';
  }
}

export function consumeExpiredFlag(): boolean {
  if (!isBrowser()) return false;
  const flag = sessionStorage.getItem(SESSION_EXPIRED_FLAG);
  if (!flag) return false;
  sessionStorage.removeItem(SESSION_EXPIRED_FLAG);
  return true;
}
