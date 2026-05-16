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
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { ExpenseFormModal } from '@/src/features/expenses/ExpenseFormModal';
import {
  type ExpenseWriteBody,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useExpensesQuery,
  useSetExpensePaidMutation,
  useUpdateExpenseMutation,
} from '@/src/features/expenses/queries';
import { calculateExpenseTotals } from '@/src/features/expenses/totals';
import { useAppTheme } from '@/src/theme/app-theme';
import type { Expense } from '@/src/types/salon.models';

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const rowCardShadow =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }
    : { elevation: 2 };

function formatBrl(value: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function formatDisplayDate(iso: string): string {
  const parts = iso.split('-').map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return iso;
  try {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(y, m - 1, d));
  } catch {
    return iso;
  }
}

function shiftMonth(month: number, year: number, delta: number): { month: number; year: number } {
  const dt = new Date(year, month - 1 + delta, 1);
  return { month: dt.getMonth() + 1, year: dt.getFullYear() };
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function todayYmd(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

function defaultDateInPeriod(month: number, year: number): string {
  const now = new Date();
  if (now.getFullYear() === year && now.getMonth() + 1 === month) {
    return todayYmd();
  }
  return `${year}-${pad2(month)}-01`;
}

function createExpenseScreenStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: C.surfaceCanvas,
      paddingHorizontal: 18,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    pageTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 28,
      lineHeight: 34,
      color: C.textHeading,
    },
    subtitle: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textMuted,
      marginBottom: 16,
    },
    periodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: C.surfaceElevated,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSoft,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginBottom: 18,
    },
    periodChevron: {
      padding: 8,
      borderRadius: 12,
    },
    periodLabel: {
      alignItems: 'center',
    },
    periodMonth: {
      fontFamily: F.serifItalicHeading,
      fontSize: 22,
      color: C.textHeading,
    },
    periodYear: {
      fontFamily: F.sansMedium,
      fontSize: 14,
      color: C.textMuted,
      marginTop: 2,
    },
    summaryStack: {
      gap: 12,
      marginBottom: 16,
    },
    heroCard: {
      borderRadius: R.card,
      borderWidth: 1,
      padding: 18,
    },
    heroCardNeutral: {
      backgroundColor: C.surfaceElevated,
      borderColor: C.borderSoft,
    },
    heroLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    heroValue: {
      fontFamily: F.serifItalicHeading,
      fontSize: 26,
    },
    heroRow: {
      flexDirection: 'row',
      gap: 12,
    },
    heroHalf: {
      flex: 1,
      borderRadius: R.card,
      borderWidth: 1,
      padding: 16,
    },
    progressTrack: {
      height: 10,
      borderRadius: 5,
      backgroundColor: C.surfaceMuted,
      overflow: 'hidden',
      flexDirection: 'row',
      marginBottom: 8,
    },
    progressLegend: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
    },
    headerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.actionPrimary,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: R.pill,
    },
    headerBtnLabel: {
      fontFamily: F.sansSemiBold,
      color: C.actionOnPrimary,
      fontSize: 15,
    },
    centerFill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    errorText: {
      fontFamily: F.sansRegular,
      color: C.error,
      textAlign: 'center',
      marginBottom: 12,
    },
    retryBtn: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSubtle,
    },
    retryLabel: {
      fontFamily: F.sansMedium,
      color: C.textHeading,
    },
    listContent: {
      paddingBottom: 28,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      padding: 14,
      marginBottom: 12,
    },
    rowMain: {
      flex: 1,
      minWidth: 0,
    },
    rowMeta: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginBottom: 4,
    },
    rowTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 16,
      color: C.textHeading,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    rowAmountCol: {
      alignItems: 'flex-end',
    },
    rowAmount: {
      fontFamily: F.serifItalicHeading,
      fontSize: 18,
      color: C.textHeading,
    },
    paidChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: R.pill,
      borderWidth: 1,
    },
    paidChipOn: {
      backgroundColor: C.financePaidBg,
      borderColor: C.financePaidAccent,
    },
    paidChipOff: {
      backgroundColor: C.financePendingBg,
      borderColor: C.financePendingAccent,
    },
    paidChipLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 12,
    },
    paidChipLabelOn: {
      color: C.financePaidAccent,
    },
    paidChipLabelOff: {
      color: C.financePendingAccent,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 12,
    },
    iconBtn: {
      padding: 6,
      borderRadius: 8,
    },
    empty: {
      fontFamily: F.sansRegular,
      color: C.textMuted,
      textAlign: 'center',
      paddingVertical: 32,
      paddingHorizontal: 16,
    },
  });
}

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createExpenseScreenStyles(C), [C]);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isPending, isError, error, refetch, isFetching } = useExpensesQuery(month, year);
  const createMut = useCreateExpenseMutation();
  const updateMut = useUpdateExpenseMutation();
  const deleteMut = useDeleteExpenseMutation();
  const setPaidMut = useSetExpensePaidMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const saving = createMut.isPending || updateMut.isPending;

  const expenses = data ?? [];
  const totals = useMemo(() => calculateExpenseTotals(expenses), [expenses]);
  const paidShare = totals.total > 0 ? totals.paid / totals.total : 0;
  const pendingShare = totals.total > 0 ? totals.pending / totals.total : 0;

  const defaultDateForNew = useMemo(() => defaultDateInPeriod(month, year), [month, year]);

  const goPrev = useCallback(() => {
    const next = shiftMonth(month, year, -1);
    setMonth(next.month);
    setYear(next.year);
  }, [month, year]);

  const goNext = useCallback(() => {
    const next = shiftMonth(month, year, 1);
    setMonth(next.month);
    setYear(next.year);
  }, [month, year]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((e: Expense) => {
    setEditing(e);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const onSave = useCallback(
    async (payload: ExpenseWriteBody) => {
      try {
        if (editing) {
          await updateMut.mutateAsync({ ...editing, ...payload });
        } else {
          await createMut.mutateAsync(payload);
        }
        closeModal();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Não foi possível salvar.';
        Alert.alert('Erro', msg);
      }
    },
    [closeModal, createMut, editing, updateMut]
  );

  const confirmDelete = useCallback(
    (e: Expense) => {
      Alert.alert('Excluir despesa', `Remover "${e.description}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMut.mutateAsync(e.id).catch((er) => {
              const msg = er instanceof Error ? er.message : 'Falha ao excluir.';
              Alert.alert('Erro', msg);
            });
          },
        },
      ]);
    },
    [deleteMut]
  );

  const togglePaid = useCallback(
    (e: Expense) => {
      setPaidMut.mutateAsync({ id: e.id, paid: !e.isPaid }).catch((er) => {
        const msg = er instanceof Error ? er.message : 'Falha ao atualizar.';
        Alert.alert('Erro', msg);
      });
    },
    [setPaidMut]
  );

  const summaryHeader = useMemo(
    () => (
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.subtitle}>Resumo com total do mês, pago e pendente.</Text>

        <View style={styles.periodRow}>
          <Pressable style={styles.periodChevron} onPress={goPrev} accessibilityLabel="Mês anterior">
            <MaterialIcons name="chevron-left" size={28} color={C.textHeading} />
          </Pressable>
          <View style={styles.periodLabel}>
            <Text style={styles.periodMonth}>{MONTH_LABELS[month - 1]}</Text>
            <Text style={styles.periodYear}>{year}</Text>
          </View>
          <Pressable style={styles.periodChevron} onPress={goNext} accessibilityLabel="Próximo mês">
            <MaterialIcons name="chevron-right" size={28} color={C.textHeading} />
          </Pressable>
        </View>

        <View style={styles.summaryStack}>
          <View style={[styles.heroCard, styles.heroCardNeutral]}>
            <Text style={[styles.heroLabel, { color: C.textMuted }]}>Total do mês</Text>
            <Text style={[styles.heroValue, { color: C.textHeading }]}>{formatBrl(totals.total)}</Text>
          </View>

          <View style={styles.heroRow}>
            <View style={[styles.heroHalf, { backgroundColor: C.financePaidBg, borderColor: C.financePaidAccent }]}>
              <Text style={[styles.heroLabel, { color: C.financePaidAccent }]}>Pago</Text>
              <Text style={[styles.heroValue, { color: C.financePaidAccent, fontSize: 22 }]}>
                {formatBrl(totals.paid)}
              </Text>
            </View>
            <View
              style={[
                styles.heroHalf,
                { backgroundColor: C.financePendingBg, borderColor: C.financePendingAccent },
              ]}>
              <Text style={[styles.heroLabel, { color: C.financePendingAccent }]}>Pendente</Text>
              <Text style={[styles.heroValue, { color: C.financePendingAccent, fontSize: 22 }]}>
                {formatBrl(totals.pending)}
              </Text>
            </View>
          </View>

          {totals.total > 0 ? (
            <View style={{ marginTop: 4 }}>
              <Text style={[styles.heroLabel, { color: C.textMuted, marginBottom: 8 }]}>Distribuição</Text>
              <View style={styles.progressTrack}>
                {paidShare > 0 ? (
                  <View
                    style={{
                      flex: Math.max(paidShare, 0.0001),
                      backgroundColor: C.financePaidAccent,
                      opacity: 0.85,
                    }}
                  />
                ) : null}
                {pendingShare > 0 ? (
                  <View
                    style={{
                      flex: Math.max(pendingShare, 0.0001),
                      backgroundColor: C.financePendingAccent,
                      opacity: 0.85,
                    }}
                  />
                ) : null}
              </View>
              <View style={styles.progressLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.financePaidAccent }]} />
                  <Text style={styles.legendText}>
                    Pago {Math.round(paidShare * 100)}%
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: C.financePendingAccent }]} />
                  <Text style={styles.legendText}>
                    Pendente {Math.round(pendingShare * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    ),
    [
      C.financePaidAccent,
      C.financePaidBg,
      C.financePendingAccent,
      C.financePendingBg,
      C.textHeading,
      C.textMuted,
      goNext,
      goPrev,
      month,
      paidShare,
      pendingShare,
      styles,
      totals.paid,
      totals.pending,
      totals.total,
      year,
    ]
  );

  const renderItem = useCallback(
    ({ item }: { item: Expense }) => (
      <View style={[styles.row, rowCardShadow]}>
        <View style={styles.rowMain}>
          <View style={styles.rowTop}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowMeta}>
                {formatDisplayDate(item.date)} · {item.category}
              </Text>
              <Text style={styles.rowTitle}>{item.description}</Text>
            </View>
            <View style={styles.rowAmountCol}>
              <Text style={styles.rowAmount}>{formatBrl(item.amount)}</Text>
            </View>
          </View>
          <View style={styles.rowActions}>
            <Pressable
              style={[styles.paidChip, item.isPaid ? styles.paidChipOn : styles.paidChipOff]}
              onPress={() => togglePaid(item)}>
              <Text
                style={[
                  styles.paidChipLabel,
                  item.isPaid ? styles.paidChipLabelOn : styles.paidChipLabelOff,
                ]}>
                {item.isPaid ? '✓ Pago' : 'Pendente'}
              </Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => openEdit(item)} accessibilityLabel="Editar">
              <MaterialIcons name="edit" size={21} color={C.textBody} />
            </Pressable>
            <Pressable
              style={styles.iconBtn}
              onPress={() => confirmDelete(item)}
              accessibilityLabel="Excluir">
              <MaterialIcons name="delete-outline" size={21} color={C.error} />
            </Pressable>
          </View>
        </View>
      </View>
    ),
    [C.error, C.textBody, confirmDelete, openEdit, styles, togglePaid]
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Financeiro</Text>
        </View>
        <Pressable style={styles.headerBtn} onPress={openCreate}>
          <MaterialIcons name="add" size={22} color={C.actionOnPrimary} />
          <Text style={styles.headerBtnLabel}>Nova</Text>
        </Pressable>
      </View>

      {isError ? (
        <View style={styles.centerFill}>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'Erro ao carregar.'}
          </Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryLabel}>Tentar de novo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(e) => e.id}
          renderItem={renderItem}
          ListHeaderComponent={
            <>
              {summaryHeader}
              {isPending && !data ? (
                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={C.actionPrimary} />
                </View>
              ) : null}
            </>
          }
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isPending}
              onRefresh={() => refetch()}
              tintColor={C.actionPrimary}
              colors={[C.actionPrimary]}
            />
          }
          ListEmptyComponent={
            !isPending || data !== undefined ? (
              <Text style={styles.empty}>Nenhuma despesa neste mês.</Text>
            ) : null
          }
        />
      )}

      <ExpenseFormModal
        visible={modalOpen}
        expense={editing}
        saving={saving}
        defaultDateForNew={defaultDateForNew}
        onClose={closeModal}
        onSave={onSave}
      />
    </View>
  );
}
