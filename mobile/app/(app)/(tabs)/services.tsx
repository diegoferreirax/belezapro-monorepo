import { useCallback, useMemo, useState, type ReactNode } from 'react';
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
import { ServiceFormModal } from '@/src/features/services/ServiceFormModal';
import { formatDurationMinutes } from '@/src/features/services/format-duration';
import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useServicesQuery,
  useUpdateServiceMutation,
} from '@/src/features/services/queries';
import { useAppTheme } from '@/src/theme/app-theme';
import type { CreateServiceRequest, Service } from '@/src/types/salon.models';

function formatBrl(value: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

function createServicesStyles(C: BelezaproColorTokens) {
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
      marginBottom: 20,
    },
    pageTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 30,
      lineHeight: 36,
      color: C.textHeading,
    },
    pageSubtitle: {
      fontFamily: F.sansRegular,
      fontSize: 15,
      color: C.textBody,
      marginTop: 4,
      maxWidth: 240,
    },
    headerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.actionPrimary,
      paddingHorizontal: 16,
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
      paddingTop: 4,
      flexGrow: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      padding: 14,
      marginBottom: 12,
    },
    rowIconWrap: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowIconActive: {
      backgroundColor: C.stateActiveMutedBg,
    },
    rowIconInactive: {
      backgroundColor: C.surfaceMuted,
    },
    rowText: {
      flex: 1,
      minWidth: 0,
    },
    rowTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 16,
      color: C.textHeading,
    },
    rowMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 4,
    },
    rowMetaItem: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textBody,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    iconBtn: {
      padding: 6,
      borderRadius: 8,
    },
    empty: {
      fontFamily: F.sansRegular,
      color: C.textMuted,
      textAlign: 'center',
      marginTop: 48,
      paddingHorizontal: 24,
    },
  });
}

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createServicesStyles(C), [C]);

  const rowCardShadow =
    Platform.OS === 'ios'
      ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }
      : { elevation: 2 };

  const { data, isPending, isError, error, refetch, isFetching } = useServicesQuery();
  const createMut = useCreateServiceMutation();
  const updateMut = useUpdateServiceMutation();
  const deleteMut = useDeleteServiceMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const saving = createMut.isPending || updateMut.isPending;

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((s: Service) => {
    setEditing(s);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const onSave = useCallback(
    async (payload: CreateServiceRequest | Service) => {
      try {
        if (editing) {
          await updateMut.mutateAsync(payload as Service);
        } else {
          await createMut.mutateAsync(payload as CreateServiceRequest);
        }
        closeModal();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Não foi possível salvar.';
        Alert.alert('Erro', msg);
      }
    },
    [closeModal, createMut, editing, updateMut]
  );

  const confirmDelete = useCallback(
    (s: Service) => {
      Alert.alert(
        'Excluir serviço',
        `Excluir "${s.name}"? Esta ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              deleteMut.mutateAsync(s.id).catch((err) => {
                const msg = err instanceof Error ? err.message : 'Falha ao excluir.';
                Alert.alert('Erro', msg);
              });
            },
          },
        ]
      );
    },
    [deleteMut]
  );

  const toggleActive = useCallback(
    (s: Service) => {
      updateMut.mutateAsync({ ...s, isActive: !s.isActive }).catch((err) => {
        const msg = err instanceof Error ? err.message : 'Falha ao atualizar.';
        Alert.alert('Erro', msg);
      });
    },
    [updateMut]
  );

  const renderItem = useCallback(
    ({ item }: { item: Service }) => (
      <View style={[styles.row, rowCardShadow]}>
        <View
          style={[
            styles.rowIconWrap,
            item.isActive ? styles.rowIconActive : styles.rowIconInactive,
          ]}>
          <MaterialIcons
            name={item.isActive ? 'check-circle' : 'pause-circle-filled'}
            size={26}
            color={item.isActive ? '#059669' : C.textMuted}
          />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <View style={styles.rowMeta}>
            <Text style={styles.rowMetaItem}>{formatBrl(item.price)}</Text>
            {item.durationMinutes > 0 ? (
              <Text style={styles.rowMetaItem}>
                {formatDurationMinutes(item.durationMinutes)}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.rowActions}>
          <Pressable
            hitSlop={8}
            style={styles.iconBtn}
            onPress={() => toggleActive(item)}
            accessibilityLabel={item.isActive ? 'Desativar' : 'Ativar'}>
            <MaterialIcons
              name={item.isActive ? 'visibility-off' : 'visibility'}
              size={22}
              color={C.textBody}
            />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn} onPress={() => openEdit(item)}>
            <MaterialIcons name="edit" size={22} color={C.textBody} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.iconBtn} onPress={() => confirmDelete(item)}>
            <MaterialIcons name="delete-outline" size={22} color={C.error} />
          </Pressable>
        </View>
      </View>
    ),
    [C.error, C.textBody, C.textMuted, confirmDelete, openEdit, rowCardShadow, styles, toggleActive]
  );

  let body: ReactNode;
  if (isPending && !data) {
    body = (
      <View style={styles.centerFill}>
        <ActivityIndicator size="large" color={C.actionPrimary} />
      </View>
    );
  } else if (isError) {
    body = (
      <View style={styles.centerFill}>
        <Text style={styles.errorText}>{error instanceof Error ? error.message : 'Erro ao carregar.'}</Text>
        <Pressable
          style={styles.retryBtn}
          onPress={() => {
            refetch();
          }}>
          <Text style={styles.retryLabel}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={data ?? []}
        keyExtractor={(s) => s.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={() => {
              refetch();
            }}
            tintColor={C.actionPrimary}
            colors={[C.actionPrimary]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum serviço cadastrado. Toque em Novo.</Text>
        }
      />
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Meus Serviços</Text>
        </View>
        <Pressable style={styles.headerBtn} onPress={openCreate} accessibilityRole="button">
          <MaterialIcons name="add" size={22} color={C.actionOnPrimary} />
          <Text style={styles.headerBtnLabel}>Novo</Text>
        </Pressable>
      </View>

      {body}

      <ServiceFormModal
        visible={modalOpen}
        service={editing}
        saving={saving}
        onClose={closeModal}
        onSave={onSave}
      />
    </View>
  );
}
