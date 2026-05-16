import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { useAppTheme } from '@/src/theme/app-theme';
import type { Client, CreateClientRequest } from '@/src/types/salon.models';

type Props = {
  readonly visible: boolean;
  readonly client: Client | null;
  readonly saving: boolean;
  readonly onClose: () => void;
  readonly onSave: (payload: CreateClientRequest | Client) => void | Promise<void>;
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
    inputDisabled: {
      opacity: 0.72,
      color: C.textMuted,
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

export function ClientFormModal({ visible, client, saving, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createModalStyles(C), [C]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone);
    } else {
      setName('');
      setEmail('');
      setPhone('');
    }
    setFormError(null);
  }, [visible, client]);

  function handleSave() {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2) {
      setFormError('Nome com pelo menos 2 caracteres.');
      return;
    }
    if (!client) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!looksLikeEmail(trimmedEmail)) {
        setFormError('Informe um e-mail válido.');
        return;
      }
      if (!trimmedPhone) {
        setFormError('Telefone é obrigatório.');
        return;
      }
      setFormError(null);
      const body: CreateClientRequest = {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      };
      onSave(body);
      return;
    }
    if (!trimmedPhone) {
      setFormError('Telefone é obrigatório.');
      return;
    }
    setFormError(null);
    onSave({ ...client, name: trimmedName, phone: trimmedPhone });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{client ? 'Editar cliente' : 'Novo cliente'}</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome completo"
            placeholderTextColor={C.textMuted}
            editable={!saving && !client?.isBlocked}
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, client ? styles.inputDisabled : null]}
            value={email}
            onChangeText={setEmail}
            placeholder="nome@exemplo.com"
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!saving && !client}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            placeholderTextColor={C.textMuted}
            keyboardType="phone-pad"
            editable={!saving && !client?.isBlocked}
          />

          {formError ? <Text style={styles.fieldError}>{formError}</Text> : null}

          <View style={styles.actions}>
            <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
              <Text style={styles.btnGhostLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.btnPrimary, saving && styles.btnDisabled]}
              onPress={handleSave}
              disabled={saving || client?.isBlocked}>
              {saving ? (
                <ActivityIndicator color={C.actionOnPrimary} />
              ) : (
                <Text style={styles.btnPrimaryLabel}>Salvar</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
