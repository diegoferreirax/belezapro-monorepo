import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/src/api/client';
import { mapSpringPageToPageResponse } from '@/src/types/pagination.models';
import type { PageResponse } from '@/src/types/pagination.models';
import type {
  CreateSystemUserRequest,
  SystemUser,
  SystemUserFilters,
  UpdateSystemUserRequest,
} from '@/src/types/system-user.models';

export const usersRootKey = 'system-users' as const;

export function usersQueryKey(
  page: number,
  pageSize: number,
  filters: SystemUserFilters
) {
  return [usersRootKey, page, pageSize, filters] as const;
}

function buildUsersQuery(filters: SystemUserFilters): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  const name = filters.name.trim();
  const email = filters.email.trim();
  if (name) q.name = name;
  if (email) q.email = email;
  if (filters.role && filters.role !== 'ALL') q.role = filters.role;
  return q;
}

export function useSystemUsersQuery(
  page: number,
  pageSize: number,
  filters: SystemUserFilters
) {
  return useQuery({
    queryKey: usersQueryKey(page, pageSize, filters),
    queryFn: async (): Promise<PageResponse<SystemUser>> => {
      const javaPage = page - 1;
      const res = await apiRequest<{
        content: SystemUser[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
      }>('/users', {
        query: {
          page: javaPage,
          size: pageSize,
          ...buildUsersQuery(filters),
        },
      });
      return mapSpringPageToPageResponse(res);
    },
  });
}

export function useCreateSystemUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSystemUserRequest) =>
      apiRequest<SystemUser>('/users', { method: 'POST', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [usersRootKey] }),
  });
}

export function useUpdateSystemUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSystemUserRequest }) =>
      apiRequest<SystemUser>(`/users/${id}`, { method: 'PUT', body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [usersRootKey] }),
  });
}

export function useDeleteSystemUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [usersRootKey] }),
  });
}

export function useToggleSystemUserBlockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<SystemUser>(`/users/${id}/toggle-block`, {
        method: 'PATCH',
        body: {},
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [usersRootKey] }),
  });
}
