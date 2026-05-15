import { setAccessTokenReader } from '@/src/api/access-token';

let memoryToken: string | null = null;

setAccessTokenReader(() => memoryToken);

export function setSessionMemoryToken(token: string | null): void {
  memoryToken = token;
}
