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
      backgroundColor: C.financePendingBg,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: C.borderSoft,
    },
    title: {
      fontFamily: F.serifItalicHeading,
      fontSize: 20,
      color: C.textHeading,
    },
    subtitle: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.financePendingAccent,
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
    btnWarn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: R.pill,
      backgroundColor: C.financePendingAccent,
      alignItems: 'center',
    },
    btnWarnLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: '#fff',
    },
  });
}

export function AppointmentCompleteModal({
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
            <Text style={styles.title}>Atenção ao horário</Text>
            <Text style={styles.subtitle}>Conclusão antecipada de serviço.</Text>
          </View>
          <View style={styles.body}>
            <Text style={styles.message}>
              O agendamento de <Text style={styles.strong}>{clientName}</Text> está marcado para o
              futuro (
              <Text style={styles.strong}>
                {formatAppointmentDate(appointment.date)} às {appointment.startTime}
              </Text>
              ).
            </Text>
            <Text style={styles.hint}>
              Concluir antes do horário previsto pode afetar métricas. Tem certeza de que o serviço
              já foi finalizado?
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
                <Text style={styles.btnGhostLabel}>Manter pendente</Text>
              </Pressable>
              <Pressable
                style={[styles.btnWarn, saving && { opacity: 0.6 }]}
                onPress={onConfirm}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnWarnLabel}>Sim, já finalizei</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
