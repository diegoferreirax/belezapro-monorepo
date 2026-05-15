import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/src/auth/auth-context';

export default function AppGroupLayout() {
  const { isReady, isAdmin } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
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
