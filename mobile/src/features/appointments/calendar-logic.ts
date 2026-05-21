import { getConfigForDate } from '@/src/features/schedule/schedule-logic';
import {
  AppointmentStatus,
  type Appointment,
  type DayScheduleConfig,
} from '@/src/types/salon.models';

/** Paridade com appointment-calendar Angular (90px/hora, 1.5px/min) */
export const CALENDAR_HOUR_HEIGHT = 90;
export const CALENDAR_PX_PER_MINUTE = 1.5;
export const CALENDAR_SLOT_HEIGHT = CALENDAR_HOUR_HEIGHT / 2;
export const CALENDAR_DAY_HEADER_HEIGHT = 48;
export const CALENDAR_TIME_AXIS_WIDTH = 52;
export const CALENDAR_DAY_COLUMN_WIDTH = 96;

const DEFAULT_MIN_HOUR = 8;
const DEFAULT_MAX_HOUR = 18;

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

export interface CalendarBounds {
  minHour: number;
  maxHour: number;
}

export interface CalendarBlock {
  top: number;
  height: number;
}

export interface CalendarSlot {
  hour: number;
  minutes: number;
}

export interface ScheduleLookup {
  configs: DayScheduleConfig[];
  overrides: Record<string, DayScheduleConfig>;
}

export function toDateStr(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

export function getCalendarDays(currentDate: Date): Date[] {
  const start = new Date(currentDate);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function getWeekRangeStrings(days: Date[]): { startDate: string; endDate: string } {
  return {
    startDate: toDateStr(days[0]),
    endDate: toDateStr(days[days.length - 1]),
  };
}

export function formatCalendarMonthTitle(days: Date[]): string {
  const first = days[0];
  const raw = first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatWeekdayShort(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()];
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function resolveConfigForDate(
  dateStr: string,
  schedule: ScheduleLookup
): DayScheduleConfig | undefined {
  return getConfigForDate(dateStr, schedule.configs, schedule.overrides);
}

function parseHourFromEnd(endTime: string): number {
  const [h, m] = endTime.split(':').map(Number);
  return m > 0 ? h + 1 : h;
}

export function computeCalendarBounds(
  calendarDays: Date[],
  appointments: Appointment[],
  schedule: ScheduleLookup
): CalendarBounds {
  const configs = calendarDays
    .map((d) => resolveConfigForDate(toDateStr(d), schedule))
    .filter((c): c is DayScheduleConfig => !!c && !c.isClosed);

  let minHour = DEFAULT_MIN_HOUR;
  let maxHour = DEFAULT_MAX_HOUR;

  if (configs.length > 0) {
    const startHours = configs.map((c) => Number.parseInt(c.startTime.split(':')[0], 10));
    const endHours = configs.map((c) => parseHourFromEnd(c.endTime));
    minHour = Math.min(minHour, ...startHours);
    maxHour = Math.max(maxHour, ...endHours);
  }

  const appHours = appointments
    .filter((a) => a.status !== AppointmentStatus.CANCELLED)
    .map((a) => {
      const [h] = a.startTime.split(':').map(Number);
      return { start: h, end: Math.ceil(h + a.totalDurationMinutes / 60) };
    });

  if (appHours.length > 0) {
    minHour = Math.min(minHour, ...appHours.map((a) => a.start));
    maxHour = Math.max(maxHour, ...appHours.map((a) => a.end));
  }

  return { minHour, maxHour };
}

export function computeCalendarHours(bounds: CalendarBounds): number[] {
  const { minHour, maxHour } = bounds;
  return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
}

export function computeCalendarHeight(bounds: CalendarBounds): number {
  return (bounds.maxHour - bounds.minHour) * CALENDAR_HOUR_HEIGHT;
}

export function computeClickableSlots(bounds: CalendarBounds): CalendarSlot[] {
  const { minHour, maxHour } = bounds;
  const slots: CalendarSlot[] = [];
  for (let h = minHour; h < maxHour; h++) {
    slots.push({ hour: h, minutes: 0 });
    slots.push({ hour: h, minutes: 30 });
  }
  return slots;
}

export function formatCalendarHour(hour: number): string {
  const h = hour % 24;
  return `${h.toString().padStart(2, '0')}:00`;
}

export function getAppointmentsForDay(
  date: Date,
  appointments: Appointment[]
): Appointment[] {
  const dateStr = toDateStr(date);
  return appointments.filter(
    (a) => a.date === dateStr && a.status !== AppointmentStatus.CANCELLED
  );
}

export function getUnavailableBlocksForDay(
  date: Date,
  bounds: CalendarBounds,
  schedule: ScheduleLookup
): CalendarBlock[] {
  const dateStr = toDateStr(date);
  const config = resolveConfigForDate(dateStr, schedule);
  const { minHour, maxHour } = bounds;
  const blocks: CalendarBlock[] = [];
  const totalHeight = computeCalendarHeight(bounds);

  if (!config || config.isClosed) {
    blocks.push({ top: 0, height: totalHeight });
    return blocks;
  }

  const startH = Number.parseInt(config.startTime.split(':')[0], 10);
  const startM = Number.parseInt(config.startTime.split(':')[1], 10);
  const endH = Number.parseInt(config.endTime.split(':')[0], 10);
  const endM = Number.parseInt(config.endTime.split(':')[1], 10);

  const dayStartMin = startH * 60 + startM;
  const dayEndMin = endH * 60 + endM;
  const calStartMin = minHour * 60;

  if (dayStartMin > calStartMin) {
    blocks.push({
      top: 0,
      height: (dayStartMin - calStartMin) * CALENDAR_PX_PER_MINUTE,
    });
  }

  const calEndMin = maxHour * 60;
  if (dayEndMin < calEndMin) {
    blocks.push({
      top: (dayEndMin - calStartMin) * CALENDAR_PX_PER_MINUTE,
      height: (calEndMin - dayEndMin) * CALENDAR_PX_PER_MINUTE,
    });
  }

  for (const b of config.breaks ?? []) {
    const bStartH = Number.parseInt(b.start.split(':')[0], 10);
    const bStartM = Number.parseInt(b.start.split(':')[1], 10);
    const bEndH = Number.parseInt(b.end.split(':')[0], 10);
    const bEndM = Number.parseInt(b.end.split(':')[1], 10);
    const bStartMin = bStartH * 60 + bStartM;
    const bEndMin = bEndH * 60 + bEndM;

    blocks.push({
      top: (bStartMin - calStartMin) * CALENDAR_PX_PER_MINUTE,
      height: (bEndMin - bStartMin) * CALENDAR_PX_PER_MINUTE,
    });
  }

  return blocks;
}

export function calculateAppointmentTop(startTime: string, bounds: CalendarBounds): number {
  const [h, m] = startTime.split(':').map(Number);
  const { minHour } = bounds;
  return (h * 60 + m - minHour * 60) * CALENDAR_PX_PER_MINUTE;
}

export function calculateAppointmentHeight(durationMinutes: number): number {
  return durationMinutes * CALENDAR_PX_PER_MINUTE;
}

export function hourLineTop(hour: number, bounds: CalendarBounds): number {
  return (hour - bounds.minHour) * CALENDAR_HOUR_HEIGHT;
}

export function hourLabelTop(hour: number, bounds: CalendarBounds): number {
  return hourLineTop(hour, bounds) - 8;
}
