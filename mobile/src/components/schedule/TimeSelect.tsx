import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { useAppTheme } from '@/src/theme/app-theme';

type Props = {
  readonly label: string;
  readonly value: string;
  readonly options: string[];
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
};

function createStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    field: {
      flex: 1,
      minWidth: 100,
    },
    label: {
      fontFamily: F.sansSemiBold,
      fontSize: 10,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: C.textMuted,
      marginBottom: 4,
    },
    trigger: {
      borderWidth: 1,
      borderColor: C.borderSoft,
      borderRadius: R.controlLg,
      backgroundColor: C.surfaceMuted,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    triggerDisabled: {
      opacity: 0.55,
    },
    triggerText: {
      fontFamily: F.sansMedium,
      fontSize: 15,
      color: C.textHeading,
    },
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: C.overlayScrim,
    },
    panel: {
      backgroundColor: C.surfaceElevated,
      borderTopLeftRadius: R.card,
      borderTopRightRadius: R.card,
      maxHeight: '55%',
      paddingTop: 12,
    },
    panelTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 14,
      color: C.textHeading,
      textAlign: 'center',
      marginBottom: 8,
    },
    option: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.borderSoft,
    },
    optionSelected: {
      backgroundColor: C.surfaceSubtle,
    },
    optionText: {
      fontFamily: F.sansRegular,
      fontSize: 16,
      color: C.textBody,
      textAlign: 'center',
    },
    optionTextSelected: {
      fontFamily: F.sansSemiBold,
      color: C.textHeading,
    },
  });
}

export function TimeSelect({ label, value, options, disabled, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [open, setOpen] = useState(false);

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={[styles.trigger, disabled && styles.triggerDisabled]}
          onPress={() => !disabled && setOpen(true)}
          disabled={disabled}
          accessibilityRole="button">
          <Text style={styles.triggerText}>{value || '—'}</Text>
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 12) }]}
            onPress={(e) => e.stopPropagation()}>
            <Text style={styles.panelTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(t) => t}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item === value && styles.optionSelected]}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}>
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
