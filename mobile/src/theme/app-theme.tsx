import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getBelezaproColors, type AppColorScheme, type BelezaproColorTokens } from '@/constants/belezapro-theme';

const STORAGE_KEY = 'belezapro_app_color_scheme';

type AppThemeContextValue = {
  readonly scheme: AppColorScheme;
  readonly colors: BelezaproColorTokens;
  setScheme: (next: AppColorScheme) => Promise<void>;
  toggleScheme: () => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type Props = {
  readonly children: ReactNode;
};

export function AppThemeProvider({ children }: Props) {
  const [scheme, setSchemeState] = useState<AppColorScheme>('light');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!cancelled && (stored === 'dark' || stored === 'light')) {
          setSchemeState(stored);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setScheme = useCallback(async (next: AppColorScheme) => {
    setSchemeState(next);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleScheme = useCallback(async () => {
    const next: AppColorScheme = scheme === 'light' ? 'dark' : 'light';
    await setScheme(next);
  }, [scheme, setScheme]);

  const colors = useMemo(() => getBelezaproColors(scheme), [scheme]);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      scheme,
      colors,
      setScheme,
      toggleScheme,
    }),
    [scheme, colors, setScheme, toggleScheme]
  );

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
