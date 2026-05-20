import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { useAppTheme } from '@/src/theme/app-theme';
import type {
  CreateSystemUserRequest,
  SystemUser,
  SystemUserRole,
  UpdateSystemUserRequest,
} from '@/src/types/system-user.models';

const ROLES: SystemUserRole[] = ['ROOT', 'ADMIN', 'CLIENT'];

type Props = {
  readonly visible: boolean;
  readonly user: SystemUser | null;
  readonly saving: boolean;
  readonly onClose: () => void;
  readonly onSave: (payload: CreateSystemUserRequest | UpdateSystemUserRequest) => void | Promise<void>;
};

function createModalStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: C.overlayScrim,
    },
    panel: {
      backgroundColor: C.surfaceElevated,
      borderTopLeftRadius: R.card,
      borderTopRightRadius: R.card,
      paddingHorizontal: 22,
      paddingTop: 22,
      maxHeight: '92%',
    },
    modalTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 22,
      color: C.textHeading,
      marginBottom: 18,
    },
    label: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 2.4,
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
      paddingVertical: 12,
      backgroundColor: C.surfaceMuted,
      marginBottom: 14,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
    },
    chipSelected: {
      borderColor: C.actionPrimary,
      backgroundColor: C.surfaceSubtle,
    },
    chipText: {
      fontFamily: F.sansMedium,
      fontSize: 13,
      color: C.textBody,
    },
    chipTextSelected: {
      color: C.textHeading,
    },
    fieldError: {
      fontFamily: F.sansRegular,
      color: C.error,
      fontSize: 13,
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    btnGhost: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    btnGhostLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 15,
      color: C.textBody,
    },
    btnPrimary: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: R.pill,
      backgroundColor: C.actionPrimary,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
    btnDisabled: {
      opacity: 0.6,
    },
    btnPrimaryLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 16,
      color: C.actionOnPrimary,
    },
  });
}

function looksLikeEmail(s: string): boolean {
  const t = s.trim();
  return t.includes('@') && t.includes('.') && t.length > 5;
}

export function UserFormModal({ visible, user, saving, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createModalStyles(C), [C]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<SystemUserRole>('CLIENT');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('CLIENT');
    }
    setFormError(null);
  }, [visible, user]);

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedName.length < 2) {
      setFormError('Nome com pelo menos 2 caracteres.');
      return;
    }
    if (!looksLikeEmail(trimmedEmail)) {
      setFormError('Informe um e-mail válido.');
      return;
    }
    if (!user) {
      if (password.length < 6) {
        setFormError('Senha obrigatória (mín. 6 caracteres).');
        return;
      }
      setFormError(null);
      onSave({ name: trimmedName, email: trimmedEmail, password, role });
      return;
    }
    setFormError(null);
    onSave({ name: trimmedName, email: trimmedEmail, role });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(e) => e.stopPropagation()}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{user ? 'Editar usuário' : 'Novo usuário'}</Text>

            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex.: João da Silva"
              placeholderTextColor={C.textMuted}
              editable={!saving}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contato@usuario.com"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!saving}
            />

            <Text style={styles.label}>Nível de acesso</Text>
            <View style={styles.chipRow}>
              {ROLES.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.chip, role === r && styles.chipSelected]}
                  onPress={() => setRole(r)}
                  disabled={saving}>
                  <Text style={[styles.chipText, role === r && styles.chipTextSelected]}>{r}</Text>
                </Pressable>
              ))}
            </View>

            {!user ? (
              <>
                <Text style={styles.label}>Senha provisória</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={C.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!saving}
                />
              </>
            ) : null}

            {formError ? <Text style={styles.fieldError}>{formError}</Text> : null}

            <View style={styles.actions}>
              <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
                <Text style={styles.btnGhostLabel}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnPrimary, saving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={C.actionOnPrimary} />
                ) : (
                  <Text style={styles.btnPrimaryLabel}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
