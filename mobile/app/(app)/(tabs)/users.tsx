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
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pagination } from '@/src/components/pagination/Pagination';
import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { useAuth } from '@/src/auth/auth-context';
import { useDebouncedValue } from '@/src/hooks/use-debounced-value';
import { UserFormModal } from '@/src/features/users/UserFormModal';
import {
  useCreateSystemUserMutation,
  useDeleteSystemUserMutation,
  useSystemUsersQuery,
  useToggleSystemUserBlockMutation,
  useUpdateSystemUserMutation,
} from '@/src/features/users/queries';
import { useAppTheme } from '@/src/theme/app-theme';
import type {
  CreateSystemUserRequest,
  SystemUser,
  SystemUserFilters,
  SystemUserRoleFilter,
  UpdateSystemUserRequest,
} from '@/src/types/system-user.models';

const ROLE_FILTER_OPTIONS: { value: SystemUserRoleFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'ROOT', label: 'Root' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CLIENT', label: 'Client' },
];

const EMPTY_FILTERS: SystemUserFilters = { name: '', email: '', role: 'ALL' };

const rowCardShadow =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }
    : { elevation: 2 };

function createUsersStyles(C: BelezaproColorTokens) {
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
      flexWrap: 'wrap',
      gap: 10,
    },
    pageTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 26,
      lineHeight: 32,
      color: C.textHeading,
      flex: 1,
      minWidth: 160,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    filterToggleBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: R.controlLg,
      borderWidth: 1,
      borderColor: C.borderSubtle,
      backgroundColor: C.surfaceElevated,
    },
    filterToggleBtnActive: {
      backgroundColor: C.surfaceMuted,
    },
    filterToggleLabel: {
      fontFamily: F.sansSemiBold,
      fontSize: 13,
      color: C.textBody,
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
      fontSize: 14,
    },
    filtersPanel: {
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      padding: 16,
      marginBottom: 16,
    },
    filtersTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: C.textMuted,
      marginBottom: 14,
    },
    fieldLabel: {
      fontFamily: F.sansMedium,
      fontSize: 12,
      color: C.textBody,
      marginBottom: 6,
    },
    input: {
      fontFamily: F.sansRegular,
      fontSize: 15,
      color: C.textHeading,
      borderWidth: 1,
      borderColor: C.borderSoft,
      borderRadius: R.controlLg,
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: C.surfaceMuted,
      marginBottom: 12,
    },
    roleChipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    roleChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: R.pill,
      borderWidth: 1,
      borderColor: C.borderSoft,
      backgroundColor: C.surfaceMuted,
    },
    roleChipSelected: {
      borderColor: C.actionPrimary,
      backgroundColor: C.surfaceSubtle,
    },
    roleChipText: {
      fontFamily: F.sansMedium,
      fontSize: 12,
      color: C.textBody,
    },
    roleChipTextSelected: {
      color: C.textHeading,
    },
    clearFiltersBtn: {
      alignSelf: 'flex-end',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    clearFiltersLabel: {
      fontFamily: F.sansMedium,
      fontSize: 13,
      color: C.textMuted,
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
      paddingBottom: 8,
    },
    row: {
      backgroundColor: C.surfaceElevated,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.borderSoft,
      padding: 14,
      marginBottom: 12,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 8,
    },
    rowName: {
      fontFamily: F.sansSemiBold,
      fontSize: 16,
      color: C.textHeading,
      flex: 1,
    },
    rowEmail: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textBody,
      marginTop: 4,
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: R.pill,
      borderWidth: 1,
    },
    badgeRole: {
      borderColor: C.borderSubtle,
      backgroundColor: C.surfaceMuted,
    },
    badgeRoleText: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      color: C.textBody,
    },
    badgeActive: {
      borderColor: C.financePaidAccent,
      backgroundColor: C.financePaidBg,
    },
    badgeBlocked: {
      borderColor: C.error,
      backgroundColor: C.surfaceMuted,
    },
    badgeStatusText: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      flexWrap: 'wrap',
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
    },
    footerPagination: {
      marginTop: 4,
      marginBottom: 8,
    },
  });
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createUsersStyles(C), [C]);
  const { isRoot } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<SystemUserFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedFilters = useDebouncedValue(filters, 300);

  const { data, isPending, isError, error, refetch, isFetching } = useSystemUsersQuery(
    currentPage,
    pageSize,
    debouncedFilters
  );

  const createMut = useCreateSystemUserMutation();
  const updateMut = useUpdateSystemUserMutation();
  const deleteMut = useDeleteSystemUserMutation();
  const toggleBlockMut = useToggleSystemUserBlockMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SystemUser | null>(null);
  const saving = createMut.isPending || updateMut.isPending;

  const updateFilter = useCallback(
    <K extends keyof SystemUserFilters>(field: K, value: SystemUserFilters[K]) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
      setCurrentPage(1);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((u: SystemUser) => {
    setEditing(u);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const onSave = useCallback(
    async (payload: CreateSystemUserRequest | UpdateSystemUserRequest) => {
      try {
        if (editing) {
          await updateMut.mutateAsync({ id: editing.id, body: payload as UpdateSystemUserRequest });
        } else {
          await createMut.mutateAsync(payload as CreateSystemUserRequest);
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
    (u: SystemUser) => {
      if (u.role === 'ROOT') {
        Alert.alert(
          'Não permitido',
          'Não é possível excluir usuários ROOT por esta interface.'
        );
        return;
      }
      Alert.alert('Excluir usuário', `Remover permanentemente "${u.name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteMut.mutateAsync(u.id).catch((er) => {
              const msg = er instanceof Error ? er.message : 'Falha ao excluir.';
              Alert.alert('Erro', msg);
            });
          },
        },
      ]);
    },
    [deleteMut]
  );

  const toggleBlock = useCallback(
    (u: SystemUser) => {
      if (u.role === 'ROOT') {
        Alert.alert('Não permitido', 'Contas ROOT não podem ser bloqueadas.');
        return;
      }
      toggleBlockMut.mutateAsync(u.id).catch((er) => {
        const msg = er instanceof Error ? er.message : 'Falha ao atualizar.';
        Alert.alert('Erro', msg);
      });
    },
    [toggleBlockMut]
  );

  const filtersHeader = useMemo(
    () => (
      <>
        {filtersOpen ? (
          <View style={styles.filtersPanel}>
            <Text style={styles.filtersTitle}>Pesquisa combinada</Text>

            <Text style={styles.fieldLabel}>Nome do usuário</Text>
            <TextInput
              style={styles.input}
              value={filters.name}
              onChangeText={(v) => updateFilter('name', v)}
              placeholder="Buscar por nome..."
              placeholderTextColor={C.textMuted}
              autoCapitalize="words"
            />

            <Text style={styles.fieldLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={filters.email}
              onChangeText={(v) => updateFilter('email', v)}
              placeholder="Buscar por e-mail..."
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.fieldLabel}>Nível de acesso</Text>
            <View style={styles.roleChipRow}>
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.roleChip,
                    filters.role === opt.value && styles.roleChipSelected,
                  ]}
                  onPress={() => updateFilter('role', opt.value)}>
                  <Text
                    style={[
                      styles.roleChipText,
                      filters.role === opt.value && styles.roleChipTextSelected,
                    ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.clearFiltersBtn} onPress={clearFilters}>
              <Text style={styles.clearFiltersLabel}>Limpar pesquisa</Text>
            </Pressable>
          </View>
        ) : null}
      </>
    ),
    [C.textMuted, clearFilters, filters, filtersOpen, styles, updateFilter]
  );

  const renderItem = useCallback(
    ({ item }: { item: SystemUser }) => (
      <View style={[styles.row, rowCardShadow]}>
        <View style={styles.rowTop}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.rowName}>{item.name}</Text>
            <Text style={styles.rowEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeRole]}>
            <Text style={styles.badgeRoleText}>{item.role}</Text>
          </View>
          <View
            style={[
              styles.badge,
              item.isBlocked ? styles.badgeBlocked : styles.badgeActive,
            ]}>
            <Text
              style={[
                styles.badgeStatusText,
                { color: item.isBlocked ? C.error : C.financePaidAccent },
              ]}>
              {item.isBlocked ? 'Bloqueado' : 'Ativo'}
            </Text>
          </View>
        </View>
        <View style={styles.rowActions}>
          <Pressable style={styles.iconBtn} onPress={() => openEdit(item)} accessibilityLabel="Editar">
            <MaterialIcons name="edit" size={22} color={C.textBody} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => toggleBlock(item)}
            accessibilityLabel={item.isBlocked ? 'Desbloquear' : 'Bloquear'}>
            <MaterialIcons
              name={item.isBlocked ? 'lock-open' : 'lock'}
              size={22}
              color={item.isBlocked ? C.textBody : C.error}
            />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => confirmDelete(item)}
            accessibilityLabel="Excluir">
            <MaterialIcons name="delete-outline" size={22} color={C.error} />
          </Pressable>
        </View>
      </View>
    ),
    [C.error, C.financePaidAccent, C.textBody, confirmDelete, openEdit, styles, toggleBlock]
  );

  if (!isRoot) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const items = data?.items ?? [];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Usuários (ROOT)</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.filterToggleBtn, filtersOpen && styles.filterToggleBtnActive]}
            onPress={() => setFiltersOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: filtersOpen }}>
            <MaterialIcons name="filter-list" size={20} color={C.textBody} />
            <Text style={styles.filterToggleLabel}>Filtros</Text>
          </Pressable>
          <Pressable style={styles.headerBtn} onPress={openCreate}>
            <MaterialIcons name="person-add" size={20} color={C.actionOnPrimary} />
            <Text style={styles.headerBtnLabel}>Novo</Text>
          </Pressable>
        </View>
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
          data={items}
          keyExtractor={(u) => u.id}
          renderItem={renderItem}
          ListHeaderComponent={filtersHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 16 }]}
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
              <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                <MaterialIcons name="search-off" size={40} color={C.textMuted} />
                <Text style={styles.empty}>Nenhum resultado filtrado.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            <>
              {isPending && !data ? (
                <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={C.actionPrimary} />
                </View>
              ) : null}
              {data && data.totalItems > 0 ? (
                <View style={styles.footerPagination}>
                  <Pagination
                    currentPage={data.currentPage}
                    totalPages={data.totalPages}
                    totalItems={data.totalItems}
                    pageSize={data.pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />
                </View>
              ) : null}
            </>
          }
        />
      )}

      <UserFormModal
        visible={modalOpen}
        user={editing}
        saving={saving}
        onClose={closeModal}
        onSave={onSave}
      />
    </View>
  );
}
