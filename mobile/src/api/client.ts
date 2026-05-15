import { getApiBaseUrl } from '@/src/config/env';
import { getAccessToken } from '@/src/api/access-token';
import { notifyUnauthorized } from '@/src/auth/on-unauthorized';

export class ApiHttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiHttpError';
    this.status = status;
    this.body = body;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Query string values; `undefined` / `null` keys are skipped */
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** When false, do not send Authorization (default true) */
  auth?: boolean;
}

function buildUrl(path: string, query?: ApiRequestOptions['query']): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseJsonBody<T>(response: Response): Promise<T | undefined> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiHttpError('Resposta não é JSON válido', response.status, text);
  }
}

/**
 * Typed fetch wrapper aligned with the Angular `ApiService` paths (relative to `/api/v1`).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, headers = {}, signal, auth = true } = options;

  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      mergedHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let initBody: string | undefined;
  if (body !== undefined && method !== 'GET') {
    mergedHeaders['Content-Type'] = 'application/json';
    initBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: mergedHeaders,
    body: initBody,
    signal,
  });

  if (!response.ok) {
    if (response.status === 401 && auth) {
      notifyUnauthorized();
    }
    const errText = await response.text();
    let errBody: unknown = errText;
    if (errText) {
      try {
        errBody = JSON.parse(errText) as unknown;
      } catch {
        /* keep raw string */
      }
    }
    let message = `HTTP ${response.status}`;
    if (typeof errBody === 'object' && errBody !== null && 'message' in errBody) {
      const m = (errBody as { message: unknown }).message;
      message = typeof m === 'string' ? m : JSON.stringify(m);
    }
    throw new ApiHttpError(message, response.status, errBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const parsed = await parseJsonBody<T>(response);
  return parsed as T;
}
