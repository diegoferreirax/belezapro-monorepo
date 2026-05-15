import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { router } from 'expo-router';

import { apiRequest } from '@/src/api/client';
import { decodeSessionUser, isAdminRole, isTokenExpired, type SessionUser } from '@/src/auth/decode-session';
import { setSessionMemoryToken } from '@/src/auth/session-memory';
import { clearPersistedSession, loadPersistedToken, persistSessionToken } from '@/src/auth/session-actions';
import { setUnauthorizedHandler } from '@/src/auth/on-unauthorized';

type AuthContextValue = {
  readonly user: SessionUser | null;
  readonly isReady: boolean;
  readonly isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  readonly children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const isAdmin = user !== null && isAdminRole(user.role);

  const logout = useCallback(async () => {
    await clearPersistedSession();
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearPersistedSession();
      setUser(null);
      router.replace('/(auth)/login');
    });
    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await loadPersistedToken();
        if (!token || isTokenExpired(token)) {
          if (token) {
            await clearPersistedSession();
          }
          if (!cancelled) setUser(null);
          return;
        }
        const session = decodeSessionUser(token);
        if (!isAdminRole(session.role)) {
          await clearPersistedSession();
          if (!cancelled) setUser(null);
          return;
        }
        setSessionMemoryToken(token);
        if (!cancelled) setUser(session);
      } catch {
        await clearPersistedSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    const { token } = await apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { email: trimmedEmail, password },
      auth: false,
    });
    if (!token) {
      throw new Error('Resposta de login sem token');
    }
    const session = decodeSessionUser(token);
    if (!isAdminRole(session.role)) {
      throw new Error('Acesso restrito a administradores.');
    }
    await persistSessionToken(token);
    setUser(session);
    router.replace('/(app)/(tabs)/explore');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      isAdmin,
      login,
      logout,
    }),
    [user, isReady, isAdmin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
