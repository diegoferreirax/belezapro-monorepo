import { queryClient } from '@/src/api/query-client';

import { deleteSecureToken, readSecureToken, writeSecureToken } from '@/src/auth/token-secure';
import { setSessionMemoryToken } from '@/src/auth/session-memory';

export async function persistSessionToken(token: string): Promise<void> {
  setSessionMemoryToken(token);
  await writeSecureToken(token);
}

export async function loadPersistedToken(): Promise<string | null> {
  return readSecureToken();
}

export async function clearPersistedSession(): Promise<void> {
  await deleteSecureToken();
  setSessionMemoryToken(null);
  queryClient.clear();
}
