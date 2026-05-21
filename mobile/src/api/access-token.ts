let readToken: () => string | null = () => null;

/**
 * Registers where the API client reads the Bearer token (e.g. SecureStore in auth phase).
 */
export function setAccessTokenReader(reader: () => string | null): void {
  readToken = reader;
}

export function getAccessToken(): string | null {
  return readToken();
}
