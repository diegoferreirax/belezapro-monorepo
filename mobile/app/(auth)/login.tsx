import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { ApiHttpError } from '@/src/api/client';
import { useAuth } from '@/src/auth/auth-context';
import { useAppTheme } from '@/src/theme/app-theme';

function createLoginStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    root: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: C.surfaceCanvas,
    },
    card: {
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      padding: 26,
      borderWidth: 1,
      borderColor: C.borderSoft,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 15,
        },
        android: {
          elevation: 6,
        },
        default: {},
      }),
    },
    brand: {
      fontFamily: F.serifItalicHeading,
      fontSize: 34,
      lineHeight: 40,
      color: C.textHeading,
      letterSpacing: -0.5,
      marginBottom: 12,
    },
    subtitle: {
      fontFamily: F.sansMedium,
      fontSize: 15,
      lineHeight: 22,
      color: C.textBody,
      marginBottom: 28,
    },
    fieldBlock: {
      marginBottom: 18,
    },
    label: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 2.8,
      textTransform: 'uppercase',
      color: C.textMuted,
      marginBottom: 8,
      marginLeft: 2,
    },
    input: {
      fontFamily: F.sansRegular,
      fontSize: 16,
      color: C.textHeading,
      borderWidth: 1,
      borderColor: C.borderSoft,
      borderRadius: R.controlLg,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: C.surfaceMuted,
    },
    passwordShell: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.borderSoft,
      borderRadius: R.controlLg,
      backgroundColor: C.surfaceMuted,
      paddingLeft: 4,
      paddingRight: 2,
      minHeight: 52,
    },
    passwordInput: {
      flex: 1,
      fontFamily: F.sansRegular,
      fontSize: 16,
      color: C.textHeading,
      paddingHorizontal: 12,
      paddingVertical: 14,
    },
    eyeButton: {
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    error: {
      fontFamily: F.sansRegular,
      color: C.error,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 14,
      marginTop: -4,
    },
    button: {
      marginTop: 8,
      backgroundColor: C.actionPrimary,
      borderRadius: R.pill,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    buttonPressed: {
      backgroundColor: C.actionPrimaryHover,
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    buttonLabel: {
      fontFamily: F.sansSemiBold,
      color: C.actionOnPrimary,
      fontSize: 16,
    },
  });
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createLoginStyles(C), [C]);

  const { login, isReady, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isReady) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top, backgroundColor: C.surfaceCanvas }]}>
        <ActivityIndicator size="large" color={C.actionPrimary} />
      </View>
    );
  }

  if (isAdmin) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  async function onSubmit() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Informe e-mail e senha.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setError(e.status === 401 ? 'Credenciais inválidas ou sem permissão.' : e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.brand}>BelezaPro</Text>

        <Text style={styles.subtitle}>Acesso ao painel administrador</Text>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            placeholder="maria@exemplo.com"
            placeholderTextColor={C.textMuted}
            value={email}
            onChangeText={setEmail}
            editable={!submitting}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordShell}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor={C.textMuted}
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={22}
                color={C.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && !submitting ? styles.buttonPressed : null,
            submitting ? styles.buttonDisabled : null,
          ]}
          onPress={() => void onSubmit()}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={C.actionOnPrimary} />
          ) : (
            <Text style={styles.buttonLabel}>Entrar</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
