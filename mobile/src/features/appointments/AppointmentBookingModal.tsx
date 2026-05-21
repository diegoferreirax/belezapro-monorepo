import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useAuth } from '@/src/auth/auth-context';
import {
  useAvailableTimesQuery,
  useCreateAppointmentMutation,
  useEnsureClientMutation,
  useUpdateAppointmentMutation,
} from '@/src/features/appointments/queries';
import { formatBrl, getTodayDateStr } from '@/src/features/appointments/format-appointment';
import { useServicesQuery } from '@/src/features/services/queries';
import { formatDurationMinutes } from '@/src/features/services/format-duration';
import { useAppTheme } from '@/src/theme/app-theme';
import {
  AppointmentStatus,
  type Appointment,
  type Service,
} from '@/src/types/salon.models';

type Props = {
  readonly visible: boolean;
  readonly editAppointment: Appointment | null;
  readonly prefillDate?: string;
  readonly prefillTime?: string;
  readonly onClose: () => void;
  readonly onSaved: () => void;
};

function createStyles(C: BelezaproColorTokens) {
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
      maxHeight: '94%',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 22,
      color: C.textHeading,
      flex: 1,
    },
    sectionLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: C.textMuted,
      marginBottom: 10,
      marginTop: 8,
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
      marginBottom: 12,
    },
    serviceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
      marginBottom: 8,
    },
    serviceCardSelected: {
      borderColor: C.actionPrimary,
      backgroundColor: C.surfaceSubtle,
    },
    serviceName: {
      fontFamily: F.sansSemiBold,
      fontSize: 14,
      color: C.textHeading,
    },
    serviceMeta: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginTop: 2,
    },
    timeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    timeChip: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
      minWidth: 72,
      alignItems: 'center',
    },
    timeChipSelected: {
      borderColor: C.actionPrimary,
      backgroundColor: C.actionPrimary,
    },
    timeChipText: {
      fontFamily: F.sansMedium,
      fontSize: 13,
      color: C.textBody,
    },
    timeChipTextSelected: {
      color: C.actionOnPrimary,
    },
    emptyTimes: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textMuted,
      fontStyle: 'italic',
      marginBottom: 12,
    },
    summaryBox: {
      borderTopWidth: 1,
      borderTopColor: C.borderSoft,
      paddingTop: 14,
      marginTop: 8,
      marginBottom: 14,
    },
    summaryLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: C.textMuted,
    },
    summaryPrice: {
      fontFamily: F.serifItalicHeading,
      fontSize: 22,
      color: C.textHeading,
      marginTop: 4,
    },
    summaryMeta: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textMuted,
      marginTop: 2,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 4,
    },
    btnGhost: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSubtle,
      alignItems: 'center',
    },
    btnPrimary: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: R.pill,
      backgroundColor: C.actionPrimary,
      alignItems: 'center',
    },
    btnGhostLabel: {
      fontFamily: F.sansSemiBold,
      color: C.textBody,
    },
    btnPrimaryLabel: {
      fontFamily: F.sansSemiBold,
      color: C.actionOnPrimary,
    },
  });
}

export function AppointmentBookingModal({
  visible,
  editAppointment,
  prefillDate,
  prefillTime,
  onClose,
  onSaved,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const { user } = useAuth();

  const { data: servicesRaw = [] } = useServicesQuery();
  const services = useMemo(
    () => servicesRaw.filter((s: Service) => s.isActive),
    [servicesRaw]
  );

  const createMut = useCreateAppointmentMutation();
  const updateMut = useUpdateAppointmentMutation();
  const ensureClientMut = useEnsureClientMutation();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(getTodayDateStr());
  const [time, setTime] = useState('');

  const professionalId = user?.id;
  const isEdit = !!editAppointment;

  const totalDuration = useMemo(
    () =>
      selectedServiceIds.reduce((acc, id) => {
        const s = services.find((srv) => srv.id === id);
        return acc + (s?.durationMinutes ?? 0);
      }, 0),
    [selectedServiceIds, services]
  );

  const totalPrice = useMemo(
    () =>
      selectedServiceIds.reduce((acc, id) => {
        const s = services.find((srv) => srv.id === id);
        return acc + (s?.price ?? 0);
      }, 0),
    [selectedServiceIds, services]
  );

  const { data: availableTimes = [], isFetching: timesLoading } = useAvailableTimesQuery(
    professionalId,
    date,
    totalDuration,
    editAppointment?.id
  );

  useEffect(() => {
    if (!visible) return;
    if (editAppointment) {
      setClientName(editAppointment.clientName ?? '');
      setClientEmail(editAppointment.clientEmail ?? '');
      setClientPhone(editAppointment.clientPhone ?? '');
      setSelectedServiceIds([...editAppointment.serviceIds]);
      setDate(editAppointment.date);
      setTime(editAppointment.startTime);
    } else {
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setSelectedServiceIds([]);
      setDate(prefillDate ?? getTodayDateStr());
      setTime(prefillTime ?? '');
    }
  }, [visible, editAppointment, prefillDate, prefillTime]);

  useEffect(() => {
    if (time && availableTimes.length > 0 && !availableTimes.includes(time)) {
      setTime('');
    }
  }, [availableTimes, time]);

  const toggleService = useCallback((id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const saving = createMut.isPending || updateMut.isPending || ensureClientMut.isPending;

  const canSubmit =
    clientName.trim().length > 0 &&
    clientEmail.trim().length > 0 &&
    clientPhone.trim().length > 0 &&
    selectedServiceIds.length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    time.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      if (isEdit && editAppointment) {
        await updateMut.mutateAsync({
          ...editAppointment,
          serviceIds: selectedServiceIds,
          date,
          startTime: time,
        });
        Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
      } else {
        const client = await ensureClientMut.mutateAsync({
          name: clientName.trim(),
          email: clientEmail.trim(),
          phone: clientPhone.trim(),
        });
        await createMut.mutateAsync({
          clientId: client.id,
          serviceIds: selectedServiceIds,
          date,
          startTime: time,
          status: AppointmentStatus.CONFIRMED,
        });
        Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
      }
      onSaved();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar agendamento.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.panel, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>
              {isEdit ? 'Editar agendamento' : 'Novo agendamento'}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={{ fontSize: 22, color: C.textMuted }}>×</Text>
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Dados do cliente</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor={C.textMuted}
              value={clientName}
              onChangeText={setClientName}
              editable={!saving}
            />
            <TextInput
              style={styles.input}
              placeholder="WhatsApp"
              placeholderTextColor={C.textMuted}
              value={clientPhone}
              onChangeText={setClientPhone}
              editable={!saving}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={C.textMuted}
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />

            <Text style={styles.sectionLabel}>Serviços</Text>
            {services.map((service) => {
              const selected = selectedServiceIds.includes(service.id);
              return (
                <Pressable
                  key={service.id}
                  style={[styles.serviceCard, selected && styles.serviceCardSelected]}
                  onPress={() => toggleService(service.id)}
                  disabled={saving}>
                  <View>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceMeta}>
                      {formatBrl(service.price)} • {formatDurationMinutes(service.durationMinutes)}
                    </Text>
                  </View>
                  <Text style={{ color: selected ? C.actionPrimary : C.textMuted }}>
                    {selected ? '✓' : '+'}
                  </Text>
                </Pressable>
              );
            })}

            <Text style={styles.sectionLabel}>Data (AAAA-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder={getTodayDateStr()}
              placeholderTextColor={C.textMuted}
              value={date}
              onChangeText={setDate}
              editable={!saving}
            />

            <Text style={styles.sectionLabel}>Horários disponíveis</Text>
            {timesLoading ? (
              <ActivityIndicator color={C.actionPrimary} style={{ marginBottom: 12 }} />
            ) : null}
            {availableTimes.length === 0 && !timesLoading ? (
              <Text style={styles.emptyTimes}>
                {selectedServiceIds.length === 0
                  ? 'Selecione pelo menos um serviço.'
                  : !/^\d{4}-\d{2}-\d{2}$/.test(date)
                    ? 'Informe uma data válida.'
                    : 'Nenhum horário disponível para esta data.'}
              </Text>
            ) : (
              <View style={styles.timeGrid}>
                {availableTimes.map((slot) => {
                  const selected = time === slot;
                  return (
                    <Pressable
                      key={slot}
                      style={[styles.timeChip, selected && styles.timeChipSelected]}
                      onPress={() => setTime(slot)}
                      disabled={saving}>
                      <Text
                        style={[
                          styles.timeChipText,
                          selected && styles.timeChipTextSelected,
                        ]}>
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total estimado</Text>
              <Text style={styles.summaryPrice}>{formatBrl(totalPrice)}</Text>
              <Text style={styles.summaryMeta}>
                Tempo total: {formatDurationMinutes(totalDuration)}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.btnGhost} onPress={onClose} disabled={saving}>
                <Text style={styles.btnGhostLabel}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.btnPrimary, (!canSubmit || saving) && { opacity: 0.5 }]}
                onPress={() => void handleSubmit()}
                disabled={!canSubmit || saving}>
                {saving ? (
                  <ActivityIndicator color={C.actionOnPrimary} size="small" />
                ) : (
                  <Text style={styles.btnPrimaryLabel}>
                    {isEdit ? 'Salvar alterações' : 'Confirmar'}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
