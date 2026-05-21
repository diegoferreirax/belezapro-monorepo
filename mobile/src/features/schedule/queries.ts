import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/src/api/client';
import { overridesToRecord, stripConfigPayload, stripOverridePayload } from '@/src/features/schedule/schedule-logic';
import type { DayScheduleConfig } from '@/src/types/salon.models';

export const scheduleConfigKey = ['schedule', 'config'] as const;
export const scheduleOverridesKey = ['schedule', 'overrides'] as const;

export function useScheduleConfigQuery() {
  return useQuery({
    queryKey: scheduleConfigKey,
    queryFn: () => apiRequest<DayScheduleConfig[]>('/schedule/config'),
  });
}

export function useScheduleOverridesQuery() {
  return useQuery({
    queryKey: scheduleOverridesKey,
    queryFn: async () => {
      const rows = await apiRequest<DayScheduleConfig[]>('/schedule/overrides');
      return overridesToRecord(rows ?? []);
    },
  });
}

export function useSaveScheduleConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (configs: DayScheduleConfig[]) =>
      apiRequest<DayScheduleConfig[]>('/schedule/config', {
        method: 'PUT',
        body: configs.map(stripConfigPayload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(scheduleConfigKey, data);
      void qc.invalidateQueries({ queryKey: scheduleOverridesKey });
    },
  });
}

export function useSaveScheduleOverridesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (overridesMap: Record<string, DayScheduleConfig>) =>
      apiRequest<DayScheduleConfig[]>('/schedule/overrides', {
        method: 'PUT',
        body: Object.values(overridesMap).map(stripOverridePayload),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: scheduleOverridesKey });
    },
  });
}
