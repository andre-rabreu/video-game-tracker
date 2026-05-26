import { expireAndRedirect, getSession, touchSession } from './session';
import type { useRouter } from 'next/navigation';

type Router = ReturnType<typeof useRouter>;

export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada');
    this.name = 'SessionExpiredError';
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit & { router?: Router }
): Promise<Response> {
  const { router, ...fetchInit } = init ?? {};

  if (!getSession()) {
    expireAndRedirect(router);
    throw new SessionExpiredError();
  }

  const response = await fetch(input, fetchInit);

  if (response.ok) {
    touchSession();
  }

  return response;
}
