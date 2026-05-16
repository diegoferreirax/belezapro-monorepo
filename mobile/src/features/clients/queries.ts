import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/src/api/client';
import type { Client, CreateClientRequest } from '@/src/types/salon.models';

export const clientsQueryKey = ['clients'] as const;

export function useClientsQuery() {
  return useQuery({
    queryKey: clientsQueryKey,
    queryFn: () => apiRequest<Client[]>('/clients'),
  });
}

export function useCreateClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientRequest) =>
      apiRequest<Client>('/clients', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsQueryKey }),
  });
}

export function useUpdateClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, phone }: { id: string; name: string; phone: string }) =>
      apiRequest<Client>(`/clients/${id}`, {
        method: 'PUT',
        body: { name, phone },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsQueryKey }),
  });
}

export function useToggleClientBlockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<Client>(`/clients/${id}/toggle-block`, {
        method: 'PATCH',
        body: {},
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsQueryKey }),
  });
}
