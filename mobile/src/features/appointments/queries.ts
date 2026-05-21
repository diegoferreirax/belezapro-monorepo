import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/src/api/client';
import { mapSpringPageToPageResponse } from '@/src/types/pagination.models';
import type { PageRequest, PageResponse, SpringPage } from '@/src/types/pagination.models';
import {
  AppointmentStatus,
  type Appointment,
  type Client,
  type CreateClientRequest,
} from '@/src/types/salon.models';

export const appointmentsRootKey = 'appointments' as const;

export function appointmentsRangeQueryKey(startDate: string, endDate: string) {
  return [appointmentsRootKey, 'range', startDate, endDate] as const;
}

export function appointmentsListQueryKey(req: PageRequest) {
  return [
    appointmentsRootKey,
    'list',
    req.page,
    req.pageSize,
    req.searchTerm ?? '',
    req.sortBy ?? 'date',
    req.sortDirection ?? 'desc',
  ] as const;
}

export function availableTimesQueryKey(
  professionalId: string,
  date: string,
  durationMinutes: number,
  excludeAppointmentId?: string
) {
  return [
    appointmentsRootKey,
    'available-times',
    professionalId,
    date,
    durationMinutes,
    excludeAppointmentId ?? '',
  ] as const;
}

export async function fetchAppointmentsInRange(
  startDate: string,
  endDate: string
): Promise<Appointment[]> {
  return apiRequest<Appointment[]>('/appointments/range', {
    query: { startDate, endDate },
  });
}

export async function fetchAppointmentsPaginated(
  request: PageRequest
): Promise<PageResponse<Appointment>> {
  const res = await apiRequest<SpringPage<Appointment>>('/appointments', {
    query: {
      page: request.page - 1,
      size: request.pageSize,
      term: request.searchTerm || undefined,
    },
  });
  return mapSpringPageToPageResponse(res);
}

export interface AvailableTimesResponse {
  slots: string[];
}

export async function fetchAvailableTimes(
  professionalId: string,
  date: string,
  durationMinutes: number,
  excludeAppointmentId?: string
): Promise<string[]> {
  const res = await apiRequest<AvailableTimesResponse>(
    `/public/professionals/${professionalId}/available-times`,
    {
      query: {
        date,
        durationMinutes,
        excludeAppointmentId: excludeAppointmentId || undefined,
      },
    }
  );
  return res?.slots ?? [];
}

export function useAppointmentsRangeQuery(startDate: string, endDate: string) {
  return useQuery({
    queryKey: appointmentsRangeQueryKey(startDate, endDate),
    queryFn: () => fetchAppointmentsInRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useAppointmentsPaginatedQuery(request: PageRequest) {
  return useQuery({
    queryKey: appointmentsListQueryKey(request),
    queryFn: () => fetchAppointmentsPaginated(request),
  });
}

export function useAvailableTimesQuery(
  professionalId: string | undefined,
  date: string,
  durationMinutes: number,
  excludeAppointmentId?: string
) {
  return useQuery({
    queryKey: availableTimesQueryKey(
      professionalId ?? '',
      date,
      durationMinutes,
      excludeAppointmentId
    ),
    queryFn: () =>
      fetchAvailableTimes(professionalId!, date, durationMinutes, excludeAppointmentId),
    enabled:
      !!professionalId &&
      !!date &&
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      durationMinutes > 0,
  });
}

function invalidateAllAppointments(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: [appointmentsRootKey] });
}

export function useCreateAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      clientId: string;
      serviceIds: string[];
      date: string;
      startTime: string;
      status?: AppointmentStatus;
    }) =>
      apiRequest<Appointment>('/appointments', {
        method: 'POST',
        body: {
          ...body,
          status: body.status ?? AppointmentStatus.CONFIRMED,
        },
      }),
    onSuccess: () => invalidateAllAppointments(qc),
  });
}

export function useUpdateAppointmentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointment: Appointment) =>
      apiRequest<Appointment>(`/appointments/${appointment.id}`, {
        method: 'PUT',
        body: appointment,
      }),
    onSuccess: () => invalidateAllAppointments(qc),
  });
}

export function useEnsureClientMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientRequest) =>
      apiRequest<Client>('/clients', {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
