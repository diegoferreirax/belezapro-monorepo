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
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BelezaproColorTokens } from '@/constants/belezapro-theme';
import { BelezaproRadius as R, FontFamilies as F } from '@/constants/belezapro-theme';
import { ClientFormModal } from '@/src/features/clients/ClientFormModal';
import {
  useClientsQuery,
  useCreateClientMutation,
  useToggleClientBlockMutation,
  useUpdateClientMutation,
} from '@/src/features/clients/queries';
import { useAppTheme } from '@/src/theme/app-theme';
import type { Client, CreateClientRequest } from '@/src/types/salon.models';

const rowCardShadow =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      }
    : { elevation: 2 };

function createClientsStyles(C: BelezaproColorTokens) {
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
      marginBottom: 16,
    },
    pageTitle: {
      fontFamily: F.serifItalicHeading,
      fontSize: 30,
      lineHeight: 36,
      color: C.textHeading,
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
    searchWrap: {
      marginBottom: 16,
    },
    searchInput: {
      fontFamily: F.sansRegular,
      fontSize: 16,
      color: C.textHeading,
      borderWidth: 1,
      borderColor: C.borderSoft,
      borderRadius: R.controlLg,
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: C.surfaceElevated,
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
    rowMain: {
      flex: 1,
      minWidth: 0,
    },
    rowTitle: {
      fontFamily: F.sansSemiBold,
      fontSize: 16,
      color: C.textHeading,
    },
    rowEmail: {
      fontFamily: F.sansRegular,
      fontSize: 14,
      color: C.textBody,
      marginTop: 2,
    },
    rowPhone: {
      fontFamily: F.sansRegular,
      fontSize: 13,
      color: C.textMuted,
      marginTop: 2,
    },
    statusPill: {
      alignSelf: 'flex-start',
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: R.pill,
      borderWidth: 1,
    },
    statusBlocked: {
      borderColor: C.error,
      backgroundColor: C.surfaceMuted,
    },
    statusActive: {
      borderColor: C.borderSubtle,
      backgroundColor: C.surfaceMuted,
    },
    statusTextBlocked: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      color: C.error,
    },
    statusTextActive: {
      fontFamily: F.sansSemiBold,
      fontSize: 11,
      color: C.textBody,
    },
    rowActions: {
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 4,
      marginLeft: 8,
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

function matchesSearch(c: Client, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return (
    c.name.toLowerCase().includes(t) ||
    c.email.toLowerCase().includes(t) ||
    c.phone.includes(t)
  );
}

export default function ClientsScreen() {
  const insets = useSafeAreaInsets();
  const { colors: C } = useAppTheme();
  const styles = useMemo(() => createClientsStyles(C), [C]);

  const [search, setSearch] = useState('');
  const { data, isPending, isError, error, refetch, isFetching } = useClientsQuery();
  const createMut = useCreateClientMutation();
  const updateMut = useUpdateClientMutation();
  const toggleBlockMut = useToggleClientBlockMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const saving = createMut.isPending || updateMut.isPending;

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    return list.filter((c) => matchesSearch(c, search));
  }, [data, search]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((c: Client) => {
    if (c.isBlocked) return;
    setEditing(c);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(null);
  }, []);

  const onSave = useCallback(
    async (payload: CreateClientRequest | Client) => {
      try {
        if (editing) {
          const c = payload as Client;
          await updateMut.mutateAsync({
            id: c.id,
            name: c.name.trim(),
            phone: c.phone.trim(),
          });
        } else {
          await createMut.mutateAsync(payload as CreateClientRequest);
        }
        closeModal();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Não foi possível salvar.';
        Alert.alert('Erro', msg);
      }
    },
    [closeModal, createMut, editing, updateMut]
  );

  const runToggleBlock = useCallback(
    (c: Client) => {
      toggleBlockMut.mutateAsync(c.id).catch((err) => {
        const msg = err instanceof Error ? err.message : 'Falha ao atualizar bloqueio.';
        Alert.alert('Erro', msg);
      });
    },
    [toggleBlockMut]
  );

  const onToggleBlockPress = useCallback(
    (c: Client) => {
      if (c.isBlocked) {
        runToggleBlock(c);
        return;
      }
      Alert.alert(
        'Bloquear cliente',
        `Bloquear "${c.name}"? Agendamentos futuros deste cliente serão cancelados e ele não poderá agendar.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Bloquear', style: 'destructive', onPress: () => runToggleBlock(c) },
        ]
      );
    },
    [runToggleBlock]
  );

  const renderItem = useCallback(
    ({ item }: { item: Client }) => (
      <View style={[styles.row, rowCardShadow]}>
        <View style={styles.rowMain}>
          <Text style={styles.rowTitle}>{item.name}</Text>
          <Text style={styles.rowEmail}>{item.email}</Text>
          <Text style={styles.rowPhone}>{item.phone}</Text>
          <View
            style={[
              styles.statusPill,
              item.isBlocked ? styles.statusBlocked : styles.statusActive,
            ]}>
            <Text style={item.isBlocked ? styles.statusTextBlocked : styles.statusTextActive}>
              {item.isBlocked ? 'Bloqueado' : 'Ativo'}
            </Text>
          </View>
        </View>
        <View style={styles.rowActions}>
          <Pressable
            hitSlop={8}
            style={styles.iconBtn}
            onPress={() => openEdit(item)}
            disabled={!!item.isBlocked}
            accessibilityLabel="Editar">
            <MaterialIcons
              name="edit"
              size={22}
              color={item.isBlocked ? C.textMuted : C.textBody}
            />
          </Pressable>
          <Pressable
            hitSlop={8}
            style={styles.iconBtn}
            onPress={() => onToggleBlockPress(item)}
            accessibilityLabel={item.isBlocked ? 'Desbloquear' : 'Bloquear'}>
            <MaterialIcons
              name={item.isBlocked ? 'lock-open' : 'block'}
              size={22}
              color={item.isBlocked ? C.textBody : C.error}
            />
          </Pressable>
        </View>
      </View>
    ),
    [C.error, C.textBody, C.textMuted, onToggleBlockPress, openEdit, styles]
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
        <Text style={styles.errorText}>
          {error instanceof Error ? error.message : 'Erro ao carregar.'}
        </Text>
        <Pressable style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryLabel}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  } else {
    body = (
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={() => refetch()}
            tintColor={C.actionPrimary}
            colors={[C.actionPrimary]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            {data?.length ? 'Nenhum cliente corresponde à busca.' : 'Nenhum cliente cadastrado. Toque em Novo.'}
          </Text>
        }
      />
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Clientes</Text>
        <Pressable style={styles.headerBtn} onPress={openCreate} accessibilityRole="button">
          <MaterialIcons name="person-add" size={22} color={C.actionOnPrimary} />
          <Text style={styles.headerBtnLabel}>Novo</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar nome, e-mail ou telefone"
          placeholderTextColor={C.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {body}

      <ClientFormModal
        visible={modalOpen}
        client={editing}
        saving={saving}
        onClose={closeModal}
        onSave={onSave}
      />
    </View>
  );
}
