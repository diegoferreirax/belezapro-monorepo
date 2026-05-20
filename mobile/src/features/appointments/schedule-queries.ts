import { apiRequest } from '@/src/api/client';
import type { Appointment } from '@/src/types/salon.models';

export async function fetchActiveAppointmentsByDate(date: string): Promise<Appointment[]> {
  return apiRequest<Appointment[]>(`/appointments/active/date/${date}`);
}

export async function cancelAppointmentsByDate(date: string): Promise<void> {
  return apiRequest<void>(`/appointments/cancel/date/${date}`, {
    method: 'PATCH',
    body: {},
  });
}
