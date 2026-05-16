import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { useBelezaproFonts } from '@/constants/fonts';
import { AuthProvider } from '@/src/auth/auth-context';
import { useAppTheme } from '@/src/theme/app-theme';

void SplashScreen.preventAutoHideAsync();

function navigationThemeFromApp(scheme: 'light' | 'dark', colors: BelezaproColorTokens) {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.actionPrimary,
      background: colors.surfaceCanvas,
      card: colors.surfaceElevated,
      text: colors.textHeading,
      border: colors.borderSubtle,
      notification: colors.error,
    },
  };
}

export function RootNavigationShell() {
  const [fontsLoaded, fontError] = useBelezaproFonts();
  const { scheme, colors } = useAppTheme();
  const navTheme = useMemo(
    () => navigationThemeFromApp(scheme, colors),
    [scheme, colors]
  );

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}
