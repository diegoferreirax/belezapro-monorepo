import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/src/api/client';
import type { CreateServiceRequest, Service } from '@/src/types/salon.models';

export const servicesQueryKey = ['services'] as const;

export function useServicesQuery() {
  return useQuery({
    queryKey: servicesQueryKey,
    queryFn: () => apiRequest<Service[]>('/services'),
  });
}

export function useCreateServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServiceRequest) =>
      apiRequest<Service>('/services', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: servicesQueryKey }),
  });
}

export function useUpdateServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (service: Service) =>
      apiRequest<Service>(`/services/${service.id}`, {
        method: 'PUT',
        body: service,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: servicesQueryKey }),
  });
}

export function useDeleteServiceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/services/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: servicesQueryKey }),
  });
}
