const DEFAULT_DEV_API_URL = 'http://localhost:8080/api/v1';

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * Base URL for the Spring API (`/api/v1`), without trailing slash.
 * Set `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`). On a physical device,
 * use your machine LAN IP instead of `localhost`.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }
  if (__DEV__) {
    console.warn(
      '[env] EXPO_PUBLIC_API_URL is not set; using default dev URL. ' +
        'Create mobile/.env with EXPO_PUBLIC_API_URL for emulators/devices.'
    );
    return trimTrailingSlash(DEFAULT_DEV_API_URL);
  }
  throw new Error(
    'EXPO_PUBLIC_API_URL must be set for production builds. Copy .env.example to .env.'
  );
}
