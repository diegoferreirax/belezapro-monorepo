import 'react-native-reanimated';

import { AppProviders } from '@/app/_providers';
import { RootNavigationShell } from '@/app/root-navigation-shell';
import { AppThemeProvider } from '@/src/theme/app-theme';

export const unstable_settings = {
  anchor: '(app)/(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <AppThemeProvider>
        <RootNavigationShell />
      </AppThemeProvider>
    </AppProviders>
  );
}
