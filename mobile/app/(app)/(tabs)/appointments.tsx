import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppointmentWeekCalendar } from '@/src/components/appointments/AppointmentWeekCalendar';
import { Pagination } from '@/src/components/pagination/Pagination';
import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { AppointmentBookingModal } from '@/src/features/appointments/AppointmentBookingModal';
import { AppointmentCancelModal } from '@/src/features/appointments/AppointmentCancelModal';
import { AppointmentCompleteModal } from '@/src/features/appointments/AppointmentCompleteModal';
import {
  formatAppointmentDate,
  formatBrl,
  isAppointmentInFuture,
} from '@/src/features/appointments/format-appointment';
import {
  formatCalendarMonthTitle,
  getCalendarDays,
  getWeekRangeStrings,
} from '@/src/features/appointments/calendar-logic';
import {
  useAppointmentsPaginatedQuery,
  useAppointmentsRangeQuery,
  useUpdateAppointmentMutation,
} from '@/src/features/appointments/queries';
import {
  useScheduleConfigQuery,
  useScheduleOverridesQuery,
} from '@/src/features/schedule/queries';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { formatDurationMinutes } from '@/src/features/services/format-duration';
import { useAppTheme } from '@/src/theme/app-theme';
import type { PageRequest } from '@/src/types/pagination.models';
import {
  AppointmentStatus,
  AppointmentStatusLabels,
  type Appointment,
} from '@/src/types/salon.models';

type ViewMode = 'list' | 'calendar';

const rowCardShadow =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }
    : { elevation: 2 };

function statusColors(status: AppointmentStatus, C: BelezaproColorTokens) {
  switch (status) {
    case AppointmentStatus.PENDING:
      return { bg: C.financePendingBg, text: C.financePendingAccent };
    case AppointmentStatus.CONFIRMED:
      return { bg: '#eef2ff', text: '#4338ca' };
    case AppointmentStatus.COMPLETED:
      return { bg: C.financePaidBg, text: C.financePaidAccent };
    case AppointmentStatus.CANCELLED:
      return { bg: '#fff1f2', text: '#e11d48' };
    default:
      return { bg: C.surfaceMuted, text: C.textMuted };
  }
}

function createStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: C.surfaceCanvas,
    },
    header: {
      paddingHorizontal: 18,
      marginBottom: 10,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 8,
    },
    pageTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 26,
      lineHeight: 32,
      color: C.textHeading,
      flex: 1,
    },
    newBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.actionPrimary,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: R.pill,
    },
    newBtnLabel: {
      fontFamily: F.sansSemiBold,
      color: C.actionOnPrimary,
      fontSize: 14,
    },
    subtitle: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textMuted,
    },
    modeRow: {
      flexDirection: 'row',
      gap: 8,
      marginHorizontal: 18,
      marginBottom: 12,
    },
    modeChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceElevated,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    modeChipActive: {
      borderColor: C.actionPrimary,
      backgroundColor: C.surfaceSubtle,
    },
    modeChipText: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: C.textBody,
    },
    searchWrap: {
      marginHorizontal: 18,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.borderSoft,
      borderRadius: R.controlLg,
      backgroundColor: C.surfaceElevated,
      paddingHorizontal: 12,
    },
    searchInput: {
      flex: 1,
      fontFamily: F.sansRegular,
      fontSize: 15,
      color: C.textHeading,
      paddingVertical: 12,
      paddingLeft: 8,
    },
    weekBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 18,
      marginBottom: 12,
      backgroundColor: C.surfaceElevated,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      paddingVertical: 8,
      paddingHorizontal: 6,
    },
    weekChevron: { padding: 8 },
    weekCenter: { alignItems: 'center', flex: 1 },
    weekRange: {
      fontFamily: F.sansSemiBold,
      fontSize: 14,
      color: C.textHeading,
    },
    weekTodayLink: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginTop: 4,
      textDecorationLine: 'underline',
    },
    calendarWrap: {
      flex: 1,
      marginHorizontal: 12,
      marginBottom: 8,
      minHeight: 280,
    },
    listCard: {
      marginHorizontal: 18,
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      overflow: 'hidden',
      ...rowCardShadow,
    },
    row: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.borderSoft,
    },
    rowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    rowDate: {
      fontFamily: F.sansSemiBold,
      fontSize: 15,
      color: C.textHeading,
    },
    rowTime: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textMuted,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: R.pill,
    },
    statusText: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
    },
    rowClient: {
      fontFamily: F.sansSemiBold,
      fontSize: 14,
      color: C.textHeading,
      marginTop: 10,
    },
    rowServices: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textBody,
      marginTop: 4,
    },
    rowMeta: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginTop: 4,
    },
    rowActions: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 12,
    },
    actionBtn: {
      padding: 8,
      borderRadius: R.controlLg,
    },
    empty: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textMuted,
      fontStyle: 'italic',
    },
    centerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    errorText: {
      fontFamily: F.sansRegular,
      color: C.error,
      marginBottom: 12,
    },
  });
}

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 400);
  const [pageRequest, setPageRequest] = useState<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'desc',
  });

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [bookingOpen, setBookingOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [prefillTime, setPrefillTime] = useState<string | undefined>();
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Appointment | null>(null);

  const listRequest = useMemo(
    () => ({ ...pageRequest, searchTerm: debouncedSearch }),
    [pageRequest, debouncedSearch]
  );

  const calendarDays = useMemo(() => getCalendarDays(currentDate), [currentDate]);
  const { startDate, endDate } = useMemo(
    () => getWeekRangeStrings(calendarDays),
    [calendarDays]
  );

  const { data: configData, isPending: configPending, isError: configError, refetch: refetchConfig } =
    useScheduleConfigQuery();
  const { data: overridesData, isPending: overridesPending } = useScheduleOverridesQuery();

  const {
    data: paginated,
    isPending: listPending,
    isFetching: listFetching,
    isError: listError,
    refetch: refetchList,
  } = useAppointmentsPaginatedQuery(listRequest);

  const {
    data: rangeAppointments = [],
    isPending: rangePending,
    isFetching: rangeFetching,
    isError: rangeError,
    refetch: refetchRange,
  } = useAppointmentsRangeQuery(startDate, endDate);

  const updateMut = useUpdateAppointmentMutation();

  const schedule = useMemo(
    () => ({
      configs: configData ?? [],
      overrides: overridesData ?? {},
    }),
    [configData, overridesData]
  );

  const monthTitle = useMemo(() => formatCalendarMonthTitle(calendarDays), [calendarDays]);

  const scheduleReady =
    !configPending && !!configData && !overridesPending && overridesData !== undefined;

  const calendarLoading = viewMode === 'calendar' && (rangePending || !scheduleReady);
  const listLoading = viewMode === 'list' && listPending;

  const invalidateView = useCallback(() => {
    void refetchList();
    void refetchRange();
  }, [refetchList, refetchRange]);

  const openNewBooking = useCallback(() => {
    setEditingAppointment(null);
    setPrefillDate(undefined);
    setPrefillTime(undefined);
    setBookingOpen(true);
  }, []);

  const openEditBooking = useCallback((app: Appointment) => {
    setEditingAppointment(app);
    setPrefillDate(undefined);
    setPrefillTime(undefined);
    setBookingOpen(true);
  }, []);

  const openBookingAt = useCallback((date: Date, hour: number, minutes: number) => {
    setEditingAppointment(null);
    setPrefillDate(date.toLocaleDateString('en-CA'));
    setPrefillTime(
      `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    );
    setBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setBookingOpen(false);
    setEditingAppointment(null);
    setPrefillDate(undefined);
    setPrefillTime(undefined);
  }, []);

  const updateStatus = useCallback(
    async (appointment: Appointment, status: AppointmentStatus) => {
      if (status === AppointmentStatus.COMPLETED && isAppointmentInFuture(appointment)) {
        setCompleteTarget(appointment);
        return;
      }
      try {
        await updateMut.mutateAsync({ ...appointment, status });
        invalidateView();
      } catch {
        Alert.alert('Erro', 'Não foi possível atualizar o agendamento.');
      }
    },
    [invalidateView, updateMut]
  );

  const executeCancel = useCallback(async () => {
    if (!cancelTarget) return;
    try {
      await updateMut.mutateAsync({
        ...cancelTarget,
        status: AppointmentStatus.CANCELLED,
      });
      setCancelTarget(null);
      invalidateView();
    } catch {
      Alert.alert('Erro', 'Não foi possível cancelar o agendamento.');
    }
  }, [cancelTarget, invalidateView, updateMut]);

  const executeComplete = useCallback(async () => {
    if (!completeTarget) return;
    try {
      await updateMut.mutateAsync({
        ...completeTarget,
        status: AppointmentStatus.COMPLETED,
      });
      setCompleteTarget(null);
      invalidateView();
    } catch {
      Alert.alert('Erro', 'Não foi possível concluir o agendamento.');
    }
  }, [completeTarget, invalidateView, updateMut]);

  const renderListItem = useCallback(
    ({ item }: { item: Appointment }) => {
      const colors = statusColors(item.status, C);
      const services = item.parsedServiceNames?.join(', ') ?? '';
      const canAct =
        item.status === AppointmentStatus.PENDING ||
        item.status === AppointmentStatus.CONFIRMED;

      return (
        <View style={styles.row}>
          <View style={styles.rowTop}>
            <View>
              <Text style={styles.rowDate}>{formatAppointmentDate(item.date)}</Text>
              <Text style={styles.rowTime}>{item.startTime}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {AppointmentStatusLabels[item.status]}
              </Text>
            </View>
          </View>
          <Text style={styles.rowClient}>{item.clientName ?? 'Cliente desconhecido'}</Text>
          {services ? <Text style={styles.rowServices} numberOfLines={2}>{services}</Text> : null}
          <Text style={styles.rowMeta}>
            {formatBrl(item.totalPrice)} • {formatDurationMinutes(item.totalDurationMinutes)}
          </Text>
          {canAct ? (
            <View style={styles.rowActions}>
              {item.status === AppointmentStatus.PENDING ? (
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => void updateStatus(item, AppointmentStatus.CONFIRMED)}>
                  <MaterialIcons name="check-circle" size={22} color="#2563eb" />
                </Pressable>
              ) : null}
              {item.status === AppointmentStatus.CONFIRMED ? (
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => void updateStatus(item, AppointmentStatus.COMPLETED)}>
                  <MaterialIcons name="done-all" size={22} color={C.financePaidAccent} />
                </Pressable>
              ) : null}
              <Pressable style={styles.actionBtn} onPress={() => openEditBooking(item)}>
                <MaterialIcons name="edit" size={22} color={C.textBody} />
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => setCancelTarget(item)}>
                <MaterialIcons name="cancel" size={22} color="#f43f5e" />
              </Pressable>
            </View>
          ) : null}
        </View>
      );
    },
    [C, openEditBooking, styles, updateStatus]
  );

  if (configError || !configData) {
    return (
      <View style={[styles.screen, styles.centerFill, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Erro ao carregar horários do salão.</Text>
        <Pressable onPress={() => void refetchConfig()}>
          <Text style={{ color: C.textHeading }}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  if ((viewMode === 'list' && listError) || (viewMode === 'calendar' && rangeError)) {
    return (
      <View style={[styles.screen, styles.centerFill, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Erro ao carregar agendamentos.</Text>
        <Pressable onPress={() => (viewMode === 'list' ? void refetchList() : void refetchRange())}>
          <Text style={{ color: C.textHeading }}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  if (calendarLoading || listLoading) {
    return (
      <View style={[styles.screen, styles.centerFill, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={C.actionPrimary} />
      </View>
    );
  }

  const items = paginated?.items ?? [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>Agendamentos</Text>
          <Pressable style={styles.newBtn} onPress={openNewBooking}>
            <MaterialIcons name="add-task" size={20} color={C.actionOnPrimary} />
            <Text style={styles.newBtnLabel}>Novo</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Lista ou calendário semanal com horários do salão.</Text>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeChip, viewMode === 'list' && styles.modeChipActive]}
          onPress={() => setViewMode('list')}>
          <MaterialIcons
            name="list"
            size={18}
            color={viewMode === 'list' ? C.textHeading : C.textMuted}
          />
          <Text style={styles.modeChipText}>Lista</Text>
        </Pressable>
        <Pressable
          style={[styles.modeChip, viewMode === 'calendar' && styles.modeChipActive]}
          onPress={() => setViewMode('calendar')}>
          <MaterialIcons
            name="calendar-month"
            size={18}
            color={viewMode === 'calendar' ? C.textHeading : C.textMuted}
          />
          <Text style={styles.modeChipText}>Calendário</Text>
        </Pressable>
      </View>

      {viewMode === 'list' ? (
        <>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={22} color={C.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar cliente, serviço ou status..."
              placeholderTextColor={C.textMuted}
              value={searchTerm}
              onChangeText={(t) => {
                setSearchTerm(t);
                setPageRequest((r) => ({ ...r, page: 1 }));
              }}
            />
          </View>

          <View style={[styles.listCard, { flex: 1, marginBottom: 8 }]}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderListItem}
              refreshControl={
                <RefreshControl
                  refreshing={listFetching && !listPending}
                  onRefresh={() => void refetchList()}
                  tintColor={C.actionPrimary}
                />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
                </View>
              }
            />
            {paginated && paginated.totalItems > 0 ? (
              <Pagination
                currentPage={paginated.currentPage}
                totalPages={paginated.totalPages}
                totalItems={paginated.totalItems}
                pageSize={paginated.pageSize}
                onPageChange={(page) => setPageRequest((r) => ({ ...r, page }))}
                onPageSizeChange={(pageSize) =>
                  setPageRequest((r) => ({ ...r, pageSize, page: 1 }))
                }
              />
            ) : null}
          </View>
        </>
      ) : (
        <>
          <View style={styles.weekBar}>
            <Pressable
              style={styles.weekChevron}
              onPress={() =>
                setCurrentDate((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() - 7);
                  return n;
                })
              }>
              <MaterialIcons name="chevron-left" size={28} color={C.textHeading} />
            </Pressable>
            <View style={styles.weekCenter}>
              <Text style={styles.weekRange}>{monthTitle}</Text>
              <Pressable onPress={() => setCurrentDate(new Date())}>
                <Text style={styles.weekTodayLink}>Hoje</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.weekChevron}
              onPress={() =>
                setCurrentDate((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() + 7);
                  return n;
                })
              }>
              <MaterialIcons name="chevron-right" size={28} color={C.textHeading} />
            </Pressable>
          </View>
          <View style={styles.calendarWrap}>
            <AppointmentWeekCalendar
              calendarDays={calendarDays}
              currentDate={currentDate}
              appointments={rangeAppointments}
              schedule={schedule}
              loading={rangeFetching && !rangePending}
              onAppointmentPress={openEditBooking}
              onSlotPress={openBookingAt}
            />
          </View>
        </>
      )}

      <AppointmentBookingModal
        visible={bookingOpen}
        editAppointment={editingAppointment}
        prefillDate={prefillDate}
        prefillTime={prefillTime}
        onClose={closeBooking}
        onSaved={() => {
          closeBooking();
          invalidateView();
        }}
      />

      <AppointmentCancelModal
        visible={!!cancelTarget}
        appointment={cancelTarget}
        saving={updateMut.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void executeCancel()}
      />

      <AppointmentCompleteModal
        visible={!!completeTarget}
        appointment={completeTarget}
        saving={updateMut.isPending}
        onClose={() => setCompleteTarget(null)}
        onConfirm={() => void executeComplete()}
      />
    </View>
  );
}
