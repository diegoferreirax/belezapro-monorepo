import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { SERVICE_DURATION_OPTIONS, formatDurationMinutes } from '@/src/features/services/format-duration';
import { useAppTheme } from '@/src/theme/app-theme';
import type { CreateServiceRequest, Service } from '@/src/types/salon.models';

type Props = {
  readonly visible: boolean;
  readonly service: Service | null;
  readonly saving: boolean;
  readonly onClose: () => void;
  readonly onSave: (payload: CreateServiceRequest | Service) => void | Promise<void>;
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
    durationRow: {
      marginBottom: 14,
      maxHeight: 44,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
      marginRight: 8,
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
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    switchLabel: {
      fontFamily: F.sansMedium,
      fontSize: 15,
      color: C.textBody,
      flex: 1,
      marginRight: 12,
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

export function ServiceFormModal({ visible, service, saving, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createModalStyles(C), [C]);

  const [name, setName] = useState('');
  const [priceStr, setPriceStr] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (service) {
      setName(service.name);
      setPriceStr(String(service.price));
      setDurationMinutes(service.durationMinutes);
      setIsActive(service.isActive);
    } else {
      setName('');
      setPriceStr('0');
      setDurationMinutes(30);
      setIsActive(true);
    }
    setNameError(null);
  }, [visible, service]);

  function handleSave() {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('Nome com pelo menos 2 caracteres.');
      return;
    }
    const price = Number.parseFloat(priceStr.replace(',', '.'));
    if (Number.isNaN(price) || price < 0) {
      setNameError('Preço inválido.');
      return;
    }
    setNameError(null);
    if (!service) {
      const body: CreateServiceRequest = {
        name: trimmed,
        price,
        durationMinutes,
        isActive,
      };
      onSave(body);
      return;
    }
    onSave({ ...service, name: trimmed, price, durationMinutes, isActive });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{service ? 'Editar serviço' : 'Novo serviço'}</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nome do procedimento"
            placeholderTextColor={C.textMuted}
            editable={!saving}
          />

          <Text style={styles.label}>Preço (R$)</Text>
          <TextInput
            style={styles.input}
            value={priceStr}
            onChangeText={setPriceStr}
            keyboardType="decimal-pad"
            editable={!saving}
          />

          <Text style={styles.label}>Duração</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationRow}>
            {SERVICE_DURATION_OPTIONS.map((m) => (
              <Pressable
                key={m}
                style={[styles.chip, durationMinutes === m && styles.chipSelected]}
                onPress={() => setDurationMinutes(m)}
                disabled={saving}>
                <Text style={[styles.chipText, durationMinutes === m && styles.chipTextSelected]}>
                  {formatDurationMinutes(m)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Ativo para agendamento</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={saving}
              trackColor={{ false: C.surfaceSubtle, true: C.borderSubtle }}
              thumbColor={isActive ? C.actionPrimary : C.textMuted}
            />
          </View>

          {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}

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
        </Pressable>
      </Pressable>
    </Modal>
  );
}
