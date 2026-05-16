import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { FontFamilies as F } from '@/constants/belezapro-theme';
import { useAuth } from '@/src/auth/auth-context';
import { useAppTheme } from '@/src/theme/app-theme';

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const { scheme, colors, setScheme } = useAppTheme();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Olá{user?.name ? `, ${user.name}` : ''}</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <View style={styles.accountBar}>
          <View style={styles.themeGroup} accessibilityRole="radiogroup" accessibilityLabel="Tema do app">
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: scheme === 'light' }}
              onPress={() => void setScheme('light')}
              style={[
                styles.themeChip,
                {
                  borderColor: colors.borderSubtle,
                  backgroundColor: scheme === 'light' ? colors.actionPrimary : colors.surfaceMuted,
                },
              ]}>
              <Text
                style={[
                  styles.themeChipLabel,
                  {
                    color: scheme === 'light' ? colors.actionOnPrimary : colors.textBody,
                  },
                ]}>
                Claro
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: scheme === 'dark' }}
              onPress={() => void setScheme('dark')}
              style={[
                styles.themeChip,
                {
                  borderColor: colors.borderSubtle,
                  backgroundColor: scheme === 'dark' ? colors.actionPrimary : colors.surfaceMuted,
                },
              ]}>
              <Text
                style={[
                  styles.themeChipLabel,
                  {
                    color: scheme === 'dark' ? colors.actionOnPrimary : colors.textBody,
                  },
                ]}>
                Escuro
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={[
              styles.logoutBtn,
              {
                backgroundColor: colors.surfaceMuted,
                borderColor: colors.borderSoft,
              },
            ]}
            onPress={() => void logout()}
            accessibilityRole="button">
            <Text style={[styles.logoutLabel, { color: colors.textHeading }]}>Sair da conta</Text>
          </Pressable>
        </View>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(app)/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/(app)/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  accountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  themeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  themeChipLabel: {
    fontFamily: F.sansSemiBold,
    fontSize: 14,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  logoutBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutLabel: {
    fontFamily: F.sansSemiBold,
    fontSize: 15,
  },
});
