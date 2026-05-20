import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimeSelect } from '@/src/components/schedule/TimeSelect';
import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import {
  cancelAppointmentsByDate,
  fetchActiveAppointmentsByDate,
} from '@/src/features/appointments/schedule-queries';
import {
  ScheduleConflictModal,
  type ScheduleConflict,
} from '@/src/features/schedule/ScheduleConflictModal';
import {
  addBreakToConfig,
  buildDefaultDayConfigs,
  buildOverridesPayload,
  buildWeekDayConfigs,
  canGoToPrevWeek,
  clampStartsForToday,
  formatWeekRange,
  getAvailableEndTimes,
  getAvailableStartTimes,
  getStartOfWeek,
  isPastConfig,
  onBreakStartTimeChange,
  onStartTimeChange,
  TIME_OPTIONS,
  WEEK_DAY_LABELS,
  formatDateShort,
} from '@/src/features/schedule/schedule-logic';
import {
  useSaveScheduleConfigMutation,
  useSaveScheduleOverridesMutation,
  useScheduleConfigQuery,
  useScheduleOverridesQuery,
} from '@/src/features/schedule/queries';
import { useAppTheme } from '@/src/theme/app-theme';
import type { DayScheduleConfig } from '@/src/types/salon.models';

type ScheduleMode = 'default' | 'specific';

function cloneConfig(c: DayScheduleConfig): DayScheduleConfig {
  return {
    ...c,
    breaks: c.breaks ? c.breaks.map((b) => ({ ...b })) : [],
  };
}

function createStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: C.surfaceCanvas,
    },
    content: {
      paddingHorizontal: 18,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 10,
    },
    pageTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 26,
      lineHeight: 32,
      color: C.textHeading,
      flex: 1,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.actionPrimary,
      paddingHorizontal: 16,
      paddingVertical: 11,
      borderRadius: R.pill,
    },
    saveBtnLabel: {
      fontFamily: F.sansSemiBold,
      color: C.actionOnPrimary,
      fontSize: 14,
    },
    subtitle: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textMuted,
      marginBottom: 14,
    },
    modeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    modeChip: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceElevated,
      alignItems: 'center',
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
    modeChipTextActive: {
      color: C.textHeading,
    },
    weekBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: C.surfaceElevated,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      paddingVertical: 8,
      paddingHorizontal: 6,
      marginBottom: 16,
    },
    weekChevron: { padding: 8 },
    weekCenter: { alignItems: 'center' },
    weekRange: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: C.textHeading,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    weekTodayLink: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginTop: 4,
      textDecorationLine: 'underline',
    },
    dayCard: {
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      padding: 16,
      marginBottom: 14,
    },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 10,
    },
    dayBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayBadgeOpen: {
      backgroundColor: C.financePaidBg,
    },
    dayBadgeClosed: {
      backgroundColor: C.surfaceMuted,
    },
    dayBadgeLetter: {
      fontFamily: F.serifItalicHeading,
      fontSize: 22,
      color: C.textHeading,
    },
    dayTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 16,
      color: C.textHeading,
    },
    dayDate: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginTop: 2,
    },
    closedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    closedLabel: {
      fontFamily: F.sansMedium,
      fontSize: 12,
      color: C.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    hoursRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
      opacity: 1,
    },
    hoursRowDisabled: {
      opacity: 0.55,
    },
    breaksSection: {
      borderTopWidth: 1,
      borderTopColor: C.borderSoft,
      paddingTop: 12,
    },
    breaksTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    breaksTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: C.textMuted,
    },
    addBreakBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    addBreakLabel: {
      fontFamily: F.sansMedium,
      fontSize: 12,
      color: C.textBody,
    },
    breakCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: C.surfaceMuted,
      borderRadius: R.controlLg,
      padding: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: C.borderSoft,
    },
    breakArrow: {
      fontFamily: F.sansRegular,
      color: C.textMuted,
    },
    emptyBreaks: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textMuted,
      fontStyle: 'italic',
    },
    centerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
  });
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const { data: configData, isPending: configPending, isError: configError, refetch } =
    useScheduleConfigQuery();
  const { data: overridesData, isPending: overridesPending } = useScheduleOverridesQuery();

  const saveConfigMut = useSaveScheduleConfigMutation();
  const saveOverridesMut = useSaveScheduleOverridesMutation();

  const [mode, setMode] = useState<ScheduleMode>('specific');
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [dayConfigs, setDayConfigs] = useState<DayScheduleConfig[]>([]);

  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [pendingConfigs, setPendingConfigs] = useState<DayScheduleConfig[]>([]);
  const [conflictSaving, setConflictSaving] = useState(false);

  const loading = (configPending && !configData) || (overridesPending && overridesData === undefined);
  const saving = saveConfigMut.isPending || saveOverridesMut.isPending || conflictSaving;

  const reloadLocalConfigs = useCallback(() => {
    if (!configData) return;
    const overrides = overridesData ?? {};
    let configs: DayScheduleConfig[];
    if (mode === 'default') {
      configs = buildDefaultDayConfigs(configData);
    } else {
      configs = buildWeekDayConfigs(weekStart, configData, overrides);
    }
    clampStartsForToday(configs, mode);
    setDayConfigs(configs);
  }, [configData, mode, overridesData, weekStart]);

  useEffect(() => {
    reloadLocalConfigs();
  }, [reloadLocalConfigs]);

  const updateConfigAt = useCallback(
    (index: number, updater: (config: DayScheduleConfig) => void) => {
      setDayConfigs((prev) => {
        const next = prev.map((c, i) => (i === index ? cloneConfig(c) : c));
        updater(next[index]);
        return next;
      });
    },
    []
  );

  const executeSave = useCallback(
    async (configs: DayScheduleConfig[]) => {
      try {
        if (mode === 'default') {
          await saveConfigMut.mutateAsync(configs);
          Alert.alert('Sucesso', 'Horários padrão salvos com sucesso!');
        } else {
          if (!configData) return;
          const overrides = buildOverridesPayload(
            configs,
            configData,
            overridesData ?? {}
          );
          if (Object.keys(overrides).length === 0) {
            Alert.alert('Aviso', 'Nenhuma alteração detectada em relação ao horário padrão.');
            return;
          }
          await saveOverridesMut.mutateAsync(overrides);
          Alert.alert('Sucesso', 'Exceções de horário salvas com sucesso!');
        }
        reloadLocalConfigs();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro ao salvar.';
        Alert.alert('Erro', msg);
      }
    },
    [configData, mode, overridesData, reloadLocalConfigs, saveConfigMut, saveOverridesMut]
  );

  const handleSave = useCallback(async () => {
    const snapshot = dayConfigs.map(cloneConfig);

    if (mode === 'specific') {
      const closedDates = snapshot
        .filter((c) => c.isClosed && c.date)
        .map((c) => c.date!);

      if (closedDates.length > 0) {
        try {
          const results = await Promise.all(
            closedDates.map(async (date) => {
              const apps = await fetchActiveAppointmentsByDate(date);
              return { date, count: apps.length };
            })
          );
          const conflictList = results.filter((r) => r.count > 0);
          if (conflictList.length > 0) {
            setConflicts(conflictList);
            setPendingConfigs(snapshot);
            setConflictOpen(true);
            return;
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Erro ao verificar conflitos.';
          Alert.alert('Erro', msg);
          return;
        }
      }
    }

    await executeSave(snapshot);
  }, [dayConfigs, executeSave, mode]);

  const confirmConflictSave = useCallback(async () => {
    if (conflicts.length === 0) return;
    setConflictSaving(true);
    try {
      await Promise.all(conflicts.map((c) => cancelAppointmentsByDate(c.date)));
      await executeSave(pendingConfigs);
      setConflictOpen(false);
      setConflicts([]);
      setPendingConfigs([]);
    } catch {
      Alert.alert('Erro', 'Erro ao cancelar agendamentos conflitantes no servidor.');
    } finally {
      setConflictSaving(false);
    }
  }, [conflicts, executeSave, pendingConfigs]);

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerFill, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={C.actionPrimary} />
      </View>
    );
  }

  if (configError || !configData) {
    return (
      <View style={[styles.screen, styles.centerFill, { paddingTop: insets.top }]}>
        <Text style={{ color: C.error, marginBottom: 12 }}>Erro ao carregar horários.</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={{ color: C.textHeading }}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Horários</Text>
          <Pressable
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={() => void handleSave()}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color={C.actionOnPrimary} size="small" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color={C.actionOnPrimary} />
                <Text style={styles.saveBtnLabel}>Salvar</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Início, fim, intervalos e fechado. No dia de hoje, horários de início já passados não
          aparecem.
        </Text>

        {/* <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeChip, mode === 'specific' && styles.modeChipActive]}
            onPress={() => setMode('specific')}>
            <Text
              style={[
                styles.modeChipText,
                mode === 'specific' && styles.modeChipTextActive,
              ]}>
              Semana específica
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeChip, mode === 'default' && styles.modeChipActive]}
            onPress={() => setMode('default')}>
            <Text
              style={[styles.modeChipText, mode === 'default' && styles.modeChipTextActive]}>
              Padrão semanal
            </Text>
          </Pressable>
        </View> */}

        {mode === 'specific' ? (
          <View style={styles.weekBar}>
            <Pressable
              style={styles.weekChevron}
              onPress={() => setWeekStart((w) => {
                const n = new Date(w);
                n.setDate(n.getDate() - 7);
                return n;
              })}
              disabled={!canGoToPrevWeek(weekStart)}>
              <MaterialIcons
                name="chevron-left"
                size={28}
                color={canGoToPrevWeek(weekStart) ? C.textHeading : C.textMuted}
              />
            </Pressable>
            <View style={styles.weekCenter}>
              <Text style={styles.weekRange}>{formatWeekRange(weekStart)}</Text>
              <Pressable onPress={() => setWeekStart(getStartOfWeek(new Date()))}>
                <Text style={styles.weekTodayLink}>Semana atual</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.weekChevron}
              onPress={() => setWeekStart((w) => {
                const n = new Date(w);
                n.setDate(n.getDate() + 7);
                return n;
              })}>
              <MaterialIcons name="chevron-right" size={28} color={C.textHeading} />
            </Pressable>
          </View>
        ) : null}

        {dayConfigs.map((config, index) => {
          const past = isPastConfig(config, mode);
          const startOptions = getAvailableStartTimes(config, mode);
          const endOptions = getAvailableEndTimes(config.startTime);

          return (
            <View key={mode === 'specific' ? config.date : config.dayOfWeek} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View
                    style={[
                      styles.dayBadge,
                      config.isClosed ? styles.dayBadgeClosed : styles.dayBadgeOpen,
                    ]}>
                    <Text style={styles.dayBadgeLetter}>
                      {WEEK_DAY_LABELS[config.dayOfWeek].charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.dayTitle}>{WEEK_DAY_LABELS[config.dayOfWeek]}</Text>
                    {mode === 'specific' && config.date ? (
                      <Text style={styles.dayDate}>{formatDateShort(config.date)}</Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.closedRow}>
                  <Text style={styles.closedLabel}>Fechado</Text>
                  <Switch
                    value={config.isClosed}
                    onValueChange={(v) =>
                      updateConfigAt(index, (c) => {
                        c.isClosed = v;
                      })
                    }
                    disabled={past}
                    trackColor={{ false: C.surfaceSubtle, true: C.borderSubtle }}
                    thumbColor={config.isClosed ? C.actionPrimary : C.textMuted}
                  />
                </View>
              </View>

              {!config.isClosed ? (
                <>
                  <View style={[styles.hoursRow, past && styles.hoursRowDisabled]}>
                    <TimeSelect
                      label="Início"
                      value={config.startTime}
                      options={startOptions}
                      disabled={past}
                      onChange={(v) =>
                        updateConfigAt(index, (c) => {
                          c.startTime = v;
                          onStartTimeChange(c, mode);
                        })
                      }
                    />
                    <TimeSelect
                      label="Fim"
                      value={config.endTime}
                      options={endOptions}
                      disabled={past}
                      onChange={(v) =>
                        updateConfigAt(index, (c) => {
                          c.endTime = v;
                        })
                      }
                    />
                  </View>

                  <View style={styles.breaksSection}>
                    <View style={styles.breaksTitleRow}>
                      <Text style={styles.breaksTitle}>Intervalos / almoço</Text>
                      <Pressable
                        style={styles.addBreakBtn}
                        onPress={() =>
                          updateConfigAt(index, (c) => addBreakToConfig(c, mode))
                        }
                        disabled={past}>
                        <MaterialIcons name="add" size={18} color={C.textBody} />
                        <Text style={styles.addBreakLabel}>Adicionar</Text>
                      </Pressable>
                    </View>

                    {config.breaks.length === 0 ? (
                      <Text style={styles.emptyBreaks}>Nenhum intervalo configurado.</Text>
                    ) : (
                      config.breaks.map((brk, brkIndex) => (
                        <View key={`${config.date ?? config.dayOfWeek}-brk-${brkIndex}`} style={styles.breakCard}>
                          <TimeSelect
                            label="De"
                            value={brk.start}
                            options={TIME_OPTIONS}
                            disabled={past}
                            onChange={(v) =>
                              updateConfigAt(index, (c) => {
                                const b = c.breaks[brkIndex];
                                b.start = v;
                                onBreakStartTimeChange(c, b, mode);
                              })
                            }
                          />
                          <Text style={styles.breakArrow}>→</Text>
                          <TimeSelect
                            label="Até"
                            value={brk.end}
                            options={getAvailableEndTimes(brk.start)}
                            disabled={past}
                            onChange={(v) =>
                              updateConfigAt(index, (c) => {
                                c.breaks[brkIndex].end = v;
                              })
                            }
                          />
                          <Pressable
                            onPress={() =>
                              updateConfigAt(index, (c) => {
                                if (!past) c.breaks.splice(brkIndex, 1);
                              })
                            }
                            disabled={past}
                            hitSlop={8}>
                            <MaterialIcons name="cancel" size={22} color={C.textMuted} />
                          </Pressable>
                        </View>
                      ))
                    )}
                  </View>
                </>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <ScheduleConflictModal
        visible={conflictOpen}
        conflicts={conflicts}
        saving={conflictSaving}
        onClose={() => {
          setConflictOpen(false);
          setConflicts([]);
          setPendingConfigs([]);
        }}
        onConfirm={() => void confirmConflictSave()}
      />
    </View>
  );
}
