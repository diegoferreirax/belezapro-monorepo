import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';

import { useAuth } from '@/src/auth/auth-context';

export default function Index() {
  const { isReady, isAdmin } = useAuth();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAdmin) {
    return <Redirect href="/(app)/(tabs)/explore" />;
  }

  return <Redirect href="/(auth)/login" />;
}
