import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import {
  CALENDAR_DAY_COLUMN_WIDTH,
  CALENDAR_DAY_HEADER_HEIGHT,
  CALENDAR_HOUR_HEIGHT,
  CALENDAR_SLOT_HEIGHT,
  CALENDAR_TIME_AXIS_WIDTH,
  calculateAppointmentHeight,
  calculateAppointmentTop,
  computeCalendarBounds,
  computeCalendarHeight,
  computeCalendarHours,
  computeClickableSlots,
  formatCalendarHour,
  formatWeekdayShort,
  getAppointmentsForDay,
  getUnavailableBlocksForDay,
  hourLabelTop,
  hourLineTop,
  isSameCalendarDay,
  type ScheduleLookup,
} from '@/src/features/appointments/calendar-logic';
import { useAppTheme } from '@/src/theme/app-theme';
import { AppointmentStatus, type Appointment } from '@/src/types/salon.models';

function appointmentCardColors(
  status: AppointmentStatus,
  C: BelezaproColorTokens
): { bg: string; border: string; text: string } {
  switch (status) {
    case AppointmentStatus.PENDING:
      return { bg: C.financePendingBg, border: '#fcd34d', text: '#92400e' };
    case AppointmentStatus.CONFIRMED:
      return { bg: '#eef2ff', border: '#a5b4fc', text: '#312e81' };
    case AppointmentStatus.COMPLETED:
      return { bg: C.financePaidBg, border: C.financePaidAccent, text: '#065f46' };
    default:
      return { bg: C.surfaceMuted, border: C.borderSubtle, text: C.textBody };
  }
}

export interface AppointmentWeekCalendarProps {
  calendarDays: Date[];
  currentDate: Date;
  appointments: Appointment[];
  schedule: ScheduleLookup;
  loading?: boolean;
  onAppointmentPress?: (appointment: Appointment) => void;
  onSlotPress?: (date: Date, hour: number, minutes: number) => void;
}

function createStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      overflow: 'hidden',
    },
    gridScroll: {
      flex: 1,
    },
    gridRow: {
      flexDirection: 'row',
    },
    timeAxis: {
      width: CALENDAR_TIME_AXIS_WIDTH,
      borderRightWidth: 1,
      borderRightColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
    },
    timeAxisHeader: {
      height: CALENDAR_DAY_HEADER_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: C.borderSoft,
    },
    timeLabel: {
      position: 'absolute',
      right: 6,
      fontFamily: F.sansMedium,
      fontSize: 10,
      color: C.textMuted,
    },
    daysScroll: {
      flex: 1,
    },
    dayColumn: {
      width: CALENDAR_DAY_COLUMN_WIDTH,
      borderRightWidth: 1,
      borderRightColor: C.borderSoft,
    },
    dayHeader: {
      height: CALENDAR_DAY_HEADER_HEIGHT,
      borderBottomWidth: 1,
      borderBottomColor: C.borderSoft,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surfaceMuted,
    },
    dayHeaderWeekday: {
      fontFamily: F.sansSemiBold,
      fontSize: 9,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: C.textMuted,
    },
    dayHeaderDate: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: C.textHeading,
      marginTop: 2,
    },
    dayHeaderDateToday: {
      color: '#e11d48',
    },
    dayBody: {
      position: 'relative',
    },
    hourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: C.borderSoft,
    },
    slotPressable: {
      height: CALENDAR_SLOT_HEIGHT,
    },
    unavailableBlock: {
      position: 'absolute',
      left: 0,
      right: 0,
      backgroundColor: C.surfaceSubtle,
      opacity: 0.85,
      zIndex: 10,
    },
    appointmentCard: {
      position: 'absolute',
      left: 4,
      right: 4,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 4,
      zIndex: 20,
      overflow: 'hidden',
    },
    appointmentTime: {
      fontFamily: F.sansSemiBold,
      fontSize: 9,
    },
    appointmentClient: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      marginTop: 1,
    },
    appointmentServices: {
      fontFamily: F.sansRegular,
      fontSize: 9,
      opacity: 0.75,
      marginTop: 2,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.overlayScrim,
      zIndex: 50,
    },
  });
}

export function AppointmentWeekCalendar({
  calendarDays,
  currentDate,
  appointments,
  schedule,
  loading,
  onAppointmentPress,
  onSlotPress,
}: AppointmentWeekCalendarProps) {
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const bounds = useMemo(
    () => computeCalendarBounds(calendarDays, appointments, schedule),
    [calendarDays, appointments, schedule]
  );

  const calendarHours = useMemo(() => computeCalendarHours(bounds), [bounds]);
  const calendarHeight = useMemo(() => computeCalendarHeight(bounds), [bounds]);
  const clickableSlots = useMemo(() => computeClickableSlots(bounds), [bounds]);

  const today = useMemo(() => new Date(), []);

  return (
    <View style={styles.card}>
      <ScrollView style={styles.gridScroll} nestedScrollEnabled>
        <View style={styles.gridRow}>
          <View style={styles.timeAxis}>
            <View style={styles.timeAxisHeader} />
            <View style={{ height: calendarHeight }}>
              {calendarHours.map((hour) => (
                <Text
                  key={`label-${hour}`}
                  style={[styles.timeLabel, { top: hourLabelTop(hour, bounds) }]}>
                  {formatCalendarHour(hour)}
                </Text>
              ))}
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={styles.daysScroll}
            nestedScrollEnabled>
            <View style={{ flexDirection: 'row' }}>
              {calendarDays.map((day) => {
                const dayApps = getAppointmentsForDay(day, appointments);
                const blocks = getUnavailableBlocksForDay(day, bounds, schedule);
                const isToday = isSameCalendarDay(day, today);
                const highlightToday = isSameCalendarDay(day, currentDate);

                return (
                  <View key={day.getTime()} style={styles.dayColumn}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayHeaderWeekday}>{formatWeekdayShort(day)}</Text>
                      <Text
                        style={[
                          styles.dayHeaderDate,
                          (isToday || highlightToday) && styles.dayHeaderDateToday,
                        ]}>
                        {day.getDate().toString().padStart(2, '0')}
                      </Text>
                    </View>

                    <View style={[styles.dayBody, { height: calendarHeight }]}>
                      {calendarHours.map((hour) => (
                        <View
                          key={`line-${day.getTime()}-${hour}`}
                          style={[styles.hourLine, { top: hourLineTop(hour, bounds) }]}
                        />
                      ))}

                      {onSlotPress
                        ? clickableSlots.map((slot, slotIndex) => (
                            <Pressable
                              key={`slot-${day.getTime()}-${slotIndex}`}
                              style={[
                                styles.slotPressable,
                                { position: 'absolute', top: slotIndex * CALENDAR_SLOT_HEIGHT, left: 0, right: 0 },
                              ]}
                              onPress={() => onSlotPress(day, slot.hour, slot.minutes)}
                            />
                          ))
                        : null}

                      {blocks.map((block, blockIndex) => (
                        <View
                          key={`block-${day.getTime()}-${blockIndex}`}
                          style={[
                            styles.unavailableBlock,
                            { top: block.top, height: block.height },
                          ]}
                        />
                      ))}

                      {dayApps.map((app) => {
                        const colors = appointmentCardColors(app.status, C);
                        const top = calculateAppointmentTop(app.startTime, bounds);
                        const height = Math.max(
                          calculateAppointmentHeight(app.totalDurationMinutes),
                          28
                        );
                        const services =
                          app.parsedServiceNames?.length
                            ? app.parsedServiceNames.join(', ')
                            : '';

                        return (
                          <Pressable
                            key={app.id}
                            style={[
                              styles.appointmentCard,
                              {
                                top,
                                height,
                                backgroundColor: colors.bg,
                                borderColor: colors.border,
                              },
                            ]}
                            onPress={() => onAppointmentPress?.(app)}>
                            <Text
                              style={[styles.appointmentTime, { color: colors.text }]}
                              numberOfLines={1}>
                              {app.startTime}
                            </Text>
                            <Text
                              style={[styles.appointmentClient, { color: colors.text }]}
                              numberOfLines={1}>
                              {app.clientName ?? 'Cliente'}
                            </Text>
                            {services ? (
                              <Text
                                style={[styles.appointmentServices, { color: colors.text }]}
                                numberOfLines={1}>
                                {services}
                              </Text>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={C.actionPrimary} />
        </View>
      ) : null}
    </View>
  );
}
