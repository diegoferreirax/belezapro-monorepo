import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { formatDateShort } from '@/src/features/schedule/schedule-logic';
import { useAppTheme } from '@/src/theme/app-theme';

export type ScheduleConflict = { date: string; count: number };

type Props = {
  readonly visible: boolean;
  readonly conflicts: ScheduleConflict[];
  readonly saving: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
};

function createStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: C.overlayScrim,
    },
    panel: {
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      padding: 22,
      borderWidth: 1,
      borderColor: C.borderSoft,
    },
    title: {
      fontFamily: F.serifItalicHeading,
      fontSize: 20,
      color: C.textHeading,
      marginBottom: 10,
    },
    body: {
      fontFamily: F.sansRegular,
      fontSize: 15,
      color: C.textBody,
      lineHeight: 22,
      marginBottom: 12,
    },
    conflictItem: {
      fontFamily: F.sansMedium,
      fontSize: 14,
      color: C.error,
      marginBottom: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    btnGhost: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSubtle,
      alignItems: 'center',
    },
    btnGhostLabel: {
      fontFamily: F.sansSemiBold,
      color: C.textBody,
    },
    btnDanger: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: R.pill,
      backgroundColor: C.error,
      alignItems: 'center',
      opacity: 1,
    },
    btnDangerDisabled: {
      opacity: 0.6,
    },
    btnDangerLabel: {
      fontFamily: F.sansSemiBold,
      color: C.surfaceElevated,
    },
  });
}

export function ScheduleConflictModal({
  visible,
  conflicts,
  saving,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.panel}>
          <Text style={styles.title}>Conflito de agendamentos</Text>
          <Text style={styles.body}>
            Ao fechar o dia, os agendamentos ativos serão cancelados. Deseja continuar?
          </Text>
          {conflicts.map((c) => (
            <Text key={c.date} style={styles.conflictItem}>
              {formatDateShort(c.date)} — {c.count} agendamento(s)
            </Text>
          ))}
          <View style={styles.actions}>
            <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
              <Text style={styles.btnGhostLabel}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.btnDanger, saving && styles.btnDangerDisabled]}
              onPress={onConfirm}
              disabled={saving}>
              <Text style={styles.btnDangerLabel}>
                {saving ? 'Processando…' : 'Confirmar e salvar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
