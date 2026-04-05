import { Injectable } from '@angular/core';
import { Appointment, AppointmentStatus, DayScheduleConfig } from '../models/salon.models';

@Injectable({
  providedIn: 'root'
})
export class ScheduleCalculatorService {

  getAvailableTimes(
    date: string | undefined | null,
    duration: number,
    appointments: Appointment[],
    config: DayScheduleConfig | undefined,
    excludeAppointmentId?: string
  ): string[] {
    if (!date || duration === 0) {
      return [];
    }

    if (!config || config.isClosed) {
      return [];
    }

    // Generate 30min blocks
    const times: string[] = [];
    let current = this.timeToMinutes(config.startTime);
    const end = this.timeToMinutes(config.endTime);

    while (current + duration <= end) {
      const timeStr = this.minutesToTime(current);

      // Check if it overlaps with breaks
      const hasOverlapWithBreak = config.breaks.some((b: { start: string, end: string }) => {
        const bStart = this.timeToMinutes(b.start);
        const bEnd = this.timeToMinutes(b.end);
        return (current < bEnd && current + duration > bStart);
      });

      // Check if it overlaps with existing appointments
      const existingApps = appointments.filter(a =>
        a.date === date &&
        a.status !== AppointmentStatus.CANCELLED &&
        a.id !== excludeAppointmentId
      );
      const hasOverlapWithAppointment = existingApps.some((a: Appointment) => {
        const aStart = this.timeToMinutes(a.startTime);
        const aEnd = aStart + a.totalDurationMinutes;
        return (current < aEnd && current + duration > aStart);
      });

      if (!hasOverlapWithBreak && !hasOverlapWithAppointment) {
        // Filter out past times for today
        const now = new Date();
        const checkDate = new Date(`${date}T${timeStr}:00`);
        if (checkDate.getTime() >= now.getTime()) {
          times.push(timeStr);
        }
      }

      current += 30; // 30min blocks
    }

    return times;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
