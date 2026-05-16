import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/auth/auth-context';
import { useAppTheme } from '@/src/theme/app-theme';

export default function AppGroupLayout() {
  const { isReady, isAdmin } = useAuth();
  const { colors } = useAppTheme();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surfaceCanvas,
        }}>
        <ActivityIndicator size="large" color={colors.actionPrimary} />
      </View>
    );
  }

  if (!isAdmin) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
