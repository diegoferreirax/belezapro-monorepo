import { useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { formatAppointmentDate } from '@/src/features/appointments/format-appointment';
import { useAppTheme } from '@/src/theme/app-theme';
import type { Appointment } from '@/src/types/salon.models';

type Props = {
  readonly visible: boolean;
  readonly appointment: Appointment | null;
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
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: C.borderSoft,
    },
    header: {
      backgroundColor: '#fff1f2',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#fecdd3',
    },
    title: {
      fontFamily: F.serifItalicHeading,
      fontSize: 20,
      color: '#9f1239',
    },
    subtitle: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: '#be123c',
      marginTop: 4,
    },
    body: {
      padding: 20,
    },
    message: {
      fontFamily: F.sansRegular,
      fontSize: 15,
      color: C.textBody,
      lineHeight: 22,
      marginBottom: 14,
    },
    strong: {
      fontFamily: F.sansSemiBold,
      color: C.textHeading,
    },
    hint: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textMuted,
      lineHeight: 20,
      marginBottom: 18,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    btnGhost: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSubtle,
      alignItems: 'center',
    },
    btnGhostLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: C.textBody,
    },
    btnDanger: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: R.pill,
      backgroundColor: '#f43f5e',
      alignItems: 'center',
    },
    btnDangerLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: '#fff',
    },
  });
}

export function AppointmentCancelModal({
  visible,
  appointment,
  saving,
  onClose,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  if (!appointment) return null;

  const clientName = appointment.clientName ?? 'Cliente';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { paddingBottom: insets.bottom }]}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Cancelar agendamento</Text>
            <Text style={styles.subtitle}>Ação irreversível.</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.message}>
              Você está prestes a cancelar o agendamento de{' '}
              <Text style={styles.strong}>{clientName}</Text> marcado para{' '}
              <Text style={styles.strong}>
                {formatAppointmentDate(appointment.date)} às {appointment.startTime}
              </Text>
              .
            </Text>
            <Text style={styles.hint}>
              O horário voltará a ficar disponível. Esta ação não pode ser desfeita.
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
                <Text style={styles.btnGhostLabel}>Manter</Text>
              </Pressable>
              <Pressable
                style={[styles.btnDanger, saving && { opacity: 0.6 }]}
                onPress={onConfirm}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnDangerLabel}>Sim, cancelar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
