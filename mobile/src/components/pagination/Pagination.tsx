import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { useAppTheme } from '@/src/theme/app-theme';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

type Props = {
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageSize: number;
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange: (size: number) => void;
  readonly pageSizeOptions?: readonly number[];
};

function createStyles(C: BelezaproColorTokens) {
  return StyleSheet.create({
    root: {
      borderTopWidth: 1,
      borderTopColor: C.borderSoft,
      paddingTop: 14,
      paddingBottom: 4,
      gap: 14,
    },
    summary: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textBody,
      lineHeight: 20,
    },
    summaryStrong: {
      fontFamily: F.sansSemiBold,
      color: C.textHeading,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
    },
    pageSizeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    pageSizeLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: C.textMuted,
    },
    sizeChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
    },
    sizeChipActive: {
      borderColor: C.actionPrimary,
      backgroundColor: C.surfaceSubtle,
    },
    sizeChipText: {
      fontFamily: F.sansMedium,
      fontSize: 13,
      color: C.textBody,
    },
    sizeChipTextActive: {
      color: C.textHeading,
    },
    nav: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.borderSubtle,
      borderRadius: R.controlLg,
      overflow: 'hidden',
    },
    navBtn: {
      padding: 10,
      backgroundColor: C.surfaceElevated,
    },
    navBtnDisabled: {
      opacity: 0.4,
    },
    navCenter: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: C.surfaceElevated,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: C.borderSubtle,
    },
    navCenterText: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: C.textHeading,
    },
  });
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: Props) {
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  const safeTotalPages = Math.max(totalPages, totalItems > 0 ? 1 : 0);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < safeTotalPages && safeTotalPages > 0;

  if (totalItems === 0) {
    return null;
  }

  return (
    <View style={styles.root}>
      <Text style={styles.summary}>
        Mostrando <Text style={styles.summaryStrong}>{startIndex}</Text> até{' '}
        <Text style={styles.summaryStrong}>{endIndex}</Text> de{' '}
        <Text style={styles.summaryStrong}>{totalItems}</Text> resultados
      </Text>

      <View style={styles.row}>
        <View style={styles.pageSizeRow}>
          <Text style={styles.pageSizeLabel}>Itens</Text>
          {pageSizeOptions.map((size) => (
            <Pressable
              key={size}
              style={[styles.sizeChip, pageSize === size && styles.sizeChipActive]}
              onPress={() => onPageSizeChange(size)}
              accessibilityRole="button"
              accessibilityState={{ selected: pageSize === size }}>
              <Text style={[styles.sizeChipText, pageSize === size && styles.sizeChipTextActive]}>
                {size}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.nav}>
          <Pressable
            style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
            onPress={() => onPageChange(currentPage - 1)}
            disabled={!canPrev}
            accessibilityLabel="Página anterior">
            <MaterialIcons name="chevron-left" size={22} color={C.textBody} />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navCenterText}>
              Página {currentPage} de {safeTotalPages || 1}
            </Text>
          </View>
          <Pressable
            style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
            onPress={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
            accessibilityLabel="Próxima página">
            <MaterialIcons name="chevron-right" size={22} color={C.textBody} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
