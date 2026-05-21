import { Platform } from 'react-native';
import {
  deleteItemAsync,
  getItemAsync,
  isAvailableAsync,
  setItemAsync,
} from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'belezapro_auth_token';

let warnedNativeUnavailable = false;

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await isAvailableAsync();
  } catch {
    return false;
  }
}

function warnIfNativeMissing(): void {
  if (Platform.OS === 'web' || warnedNativeUnavailable) {
    return;
  }
  warnedNativeUnavailable = true;
  console.warn(
    '[auth] expo-secure-store indisponível neste binário. O login funciona na sessão atual, mas o token pode não persistir após fechar o app. ' +
      'Gere um build nativo atualizado (ex.: `npx expo run:android`) após adicionar o pacote.'
  );
}

export async function readSecureToken(): Promise<string | null> {
  if (!(await canUseSecureStore())) {
    return null;
  }
  try {
    return await getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function writeSecureToken(token: string): Promise<void> {
  if (!(await canUseSecureStore())) {
    warnIfNativeMissing();
    return;
  }
  await setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function deleteSecureToken(): Promise<void> {
  if (!(await canUseSecureStore())) {
    return;
  }
  try {
    await deleteItemAsync(AUTH_TOKEN_KEY);
  } catch {
    /* já removido ou keystore inválido */
  }
}
