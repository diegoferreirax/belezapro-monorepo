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
import { useAppTheme } from '@/src/theme/app-theme';
import type { ExpenseWriteBody } from '@/src/features/expenses/queries';
import { ExpenseCategory, type Expense } from '@/src/types/salon.models';

type Props = {
  readonly visible: boolean;
  readonly expense: Expense | null;
  readonly saving: boolean;
  readonly defaultDateForNew: string;
  readonly onClose: () => void;
  readonly onSave: (payload: ExpenseWriteBody) => void | Promise<void>;
};

const CATEGORY_VALUES = Object.values(ExpenseCategory);

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
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
    },
    chipSelected: {
      borderColor: C.actionPrimary,
      backgroundColor: C.surfaceSubtle,
    },
    chipText: {
      fontFamily: F.sansMedium,
      fontSize: 12,
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
    dateHint: {
      fontFamily: F.sansRegular,
      fontSize: 12,
      color: C.textMuted,
      marginTop: -10,
      marginBottom: 14,
    },
  });
}

export function ExpenseFormModal({
  visible,
  expense,
  saving,
  defaultDateForNew,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createModalStyles(C), [C]);

  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('0');
  const [dateStr, setDateStr] = useState(defaultDateForNew);
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTHER);
  const [isPaid, setIsPaid] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (expense) {
      setDescription(expense.description);
      setAmountStr(String(expense.amount));
      setDateStr(expense.date);
      setCategory(expense.category);
      setIsPaid(expense.isPaid);
    } else {
      setDescription('');
      setAmountStr('0');
      setDateStr(defaultDateForNew);
      setCategory(ExpenseCategory.OTHER);
      setIsPaid(false);
    }
    setFormError(null);
  }, [visible, expense, defaultDateForNew]);

  function handleSave() {
    const trimmed = description.trim();
    if (trimmed.length < 3) {
      setFormError('Descrição com pelo menos 3 caracteres.');
      return;
    }
    const amount = Number.parseFloat(amountStr.replace(',', '.'));
    if (Number.isNaN(amount) || amount < 0.01) {
      setFormError('Informe um valor válido (mín. 0,01).');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      setFormError('Data no formato AAAA-MM-DD.');
      return;
    }
    setFormError(null);
    onSave({
      description: trimmed,
      amount,
      date: dateStr.trim(),
      category,
      isPaid,
    });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={(e) => e.stopPropagation()}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{expense ? 'Editar despesa' : 'Nova despesa'}</Text>

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex.: Material de coloração"
              placeholderTextColor={C.textMuted}
              editable={!saving}
            />

            <Text style={styles.label}>Valor (R$)</Text>
            <TextInput
              style={styles.input}
              value={amountStr}
              onChangeText={setAmountStr}
              keyboardType="decimal-pad"
              editable={!saving}
            />

            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              editable={!saving}
            />
            <Text style={styles.dateHint}>Use o formato AAAA-MM-DD (ex.: 2026-05-14).</Text>

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.chipRow}>
              {CATEGORY_VALUES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, category === c && styles.chipSelected]}
                  onPress={() => setCategory(c)}
                  disabled={saving}>
                  <Text style={[styles.chipText, category === c && styles.chipTextSelected]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Marcar como pago</Text>
              <Switch
                value={isPaid}
                onValueChange={setIsPaid}
                disabled={saving}
                trackColor={{ false: C.surfaceSubtle, true: C.borderSubtle }}
                thumbColor={isPaid ? C.actionPrimary : C.textMuted}
              />
            </View>

            {formError ? <Text style={styles.fieldError}>{formError}</Text> : null}

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
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
