import type { DayScheduleConfig, TimeRange } from '@/src/types/salon.models';

export const WEEK_DAY_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

export const TIME_OPTIONS: string[] = (() => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    const hourStr = h.toString().padStart(2, '0');
    options.push(`${hourStr}:00`);
    options.push(`${hourStr}:30`);
  }
  options.push('23:59');
  return options;
})();

export function overridesToRecord(
  overrides: DayScheduleConfig[]
): Record<string, DayScheduleConfig> {
  return overrides.reduce<Record<string, DayScheduleConfig>>((acc, o) => {
    if (o.date) acc[o.date] = o;
    return acc;
  }, {});
}

export function getTodayDateStr(): string {
  return new Date().toLocaleDateString('en-CA');
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function toDateStr(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

export function formatDateShort(dateStr?: string): string {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const startStr = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return `${startStr} - ${endStr}`;
}

export function getConfigForDate(
  dateStr: string,
  configs: DayScheduleConfig[],
  overrides: Record<string, DayScheduleConfig>
): DayScheduleConfig | undefined {
  const override = overrides[dateStr];
  if (override) {
    const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay();
    return { ...override, date: dateStr, dayOfWeek };
  }
  const dayOfWeek = new Date(`${dateStr}T12:00:00`).getDay();
  const base = configs.find((c) => c.dayOfWeek === dayOfWeek);
  if (!base) return undefined;
  return { ...base, date: dateStr, dayOfWeek };
}

export function buildDefaultDayConfigs(configs: DayScheduleConfig[]): DayScheduleConfig[] {
  return configs.map((c) => ({
    ...c,
    breaks: c.breaks ? [...c.breaks.map((b) => ({ ...b }))] : [],
  }));
}

export function buildWeekDayConfigs(
  weekStart: Date,
  configs: DayScheduleConfig[],
  overrides: Record<string, DayScheduleConfig>
): DayScheduleConfig[] {
  const result: DayScheduleConfig[] = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStart, i);
    const dateStr = toDateStr(currentDate);
    const resolved = getConfigForDate(dateStr, configs, overrides);
    if (resolved) {
      result.push({
        ...resolved,
        date: dateStr,
        dayOfWeek: currentDate.getDay(),
        breaks: resolved.breaks ? [...resolved.breaks.map((b) => ({ ...b }))] : [],
      });
    }
  }
  return result;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getAvailableEndTimes(startTime: string): string[] {
  if (!startTime) return TIME_OPTIONS;
  const startIndex = TIME_OPTIONS.indexOf(startTime);
  return startIndex >= 0 ? TIME_OPTIONS.slice(startIndex + 1) : TIME_OPTIONS;
}

export function isPastConfig(
  config: DayScheduleConfig,
  mode: 'default' | 'specific'
): boolean {
  if (mode !== 'specific') return false;
  if (!config.date) return false;
  return config.date < getTodayDateStr();
}

export function isConfigForToday(
  config: DayScheduleConfig,
  mode: 'default' | 'specific'
): boolean {
  if (mode === 'specific') {
    return !!config.date && config.date === getTodayDateStr();
  }
  return config.dayOfWeek === new Date().getDay();
}

export function getAvailableStartTimes(
  config: DayScheduleConfig,
  mode: 'default' | 'specific'
): string[] {
  if (!isConfigForToday(config, mode)) {
    return TIME_OPTIONS;
  }
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const filtered = TIME_OPTIONS.filter((t) => timeToMinutes(t) >= nowMinutes);
  return filtered.length > 0 ? filtered : TIME_OPTIONS;
}

export function onStartTimeChange(config: DayScheduleConfig, mode: 'default' | 'specific'): void {
  if (isPastConfig(config, mode)) return;
  const validEndTimes = getAvailableEndTimes(config.startTime);
  if (config.endTime && !validEndTimes.includes(config.endTime)) {
    config.endTime = validEndTimes.length > 0 ? validEndTimes[0] : config.startTime;
  }
}

export function onBreakStartTimeChange(
  config: DayScheduleConfig,
  brk: TimeRange,
  mode: 'default' | 'specific'
): void {
  if (isPastConfig(config, mode)) return;
  const validEndTimes = getAvailableEndTimes(brk.start);
  if (brk.end && !validEndTimes.includes(brk.end)) {
    brk.end = validEndTimes.length > 0 ? validEndTimes[0] : brk.start;
  }
}

export function clampStartsForToday(
  dayConfigs: DayScheduleConfig[],
  mode: 'default' | 'specific'
): void {
  for (const config of dayConfigs) {
    if (config.isClosed) continue;
    const available = getAvailableStartTimes(config, mode);
    if (available.length === 0) continue;
    if (!available.includes(config.startTime)) {
      config.startTime = available[0];
      onStartTimeChange(config, mode);
    }
  }
}

function getNextFullHourStartMinutes(): number {
  const now = new Date();
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setMilliseconds(0);
  if (d.getTime() <= now.getTime()) {
    d.setHours(d.getHours() + 1);
  }
  return d.getHours() * 60 + d.getMinutes();
}

export function addBreakToConfig(
  config: DayScheduleConfig,
  mode: 'default' | 'specific'
): void {
  if (isPastConfig(config, mode)) return;
  if (!config.breaks) config.breaks = [];

  const dayStart = timeToMinutes(config.startTime);
  const dayEnd = timeToMinutes(config.endTime);
  let startMin = Math.max(getNextFullHourStartMinutes(), dayStart);
  let endMin = Math.min(startMin + 60, dayEnd);

  if (endMin <= startMin) {
    startMin = dayStart;
    endMin = Math.min(dayStart + 60, dayEnd);
    if (endMin <= startMin) {
      endMin = Math.min(dayStart + 30, dayEnd);
    }
  }

  const brk: TimeRange = { start: minutesToTime(startMin), end: minutesToTime(endMin) };
  config.breaks.push(brk);
  onBreakStartTimeChange(config, brk, mode);
}

export function canGoToPrevWeek(weekStart: Date): boolean {
  const currentViewStart = new Date(weekStart);
  const actualCurrentWeekStart = getStartOfWeek(new Date());
  currentViewStart.setHours(0, 0, 0, 0);
  actualCurrentWeekStart.setHours(0, 0, 0, 0);
  return currentViewStart > actualCurrentWeekStart;
}

export function stripConfigPayload(config: DayScheduleConfig) {
  return {
    dayOfWeek: config.dayOfWeek,
    startTime: config.startTime,
    endTime: config.endTime,
    breaks: config.breaks,
    isClosed: config.isClosed,
  };
}

export function stripOverridePayload(config: DayScheduleConfig) {
  return {
    date: config.date,
    startTime: config.startTime,
    endTime: config.endTime,
    breaks: config.breaks,
    isClosed: config.isClosed,
  };
}

export function buildOverridesPayload(
  dayConfigs: DayScheduleConfig[],
  defaultConfigs: DayScheduleConfig[],
  existingOverrides: Record<string, DayScheduleConfig>
): Record<string, DayScheduleConfig> {
  const overrides: Record<string, DayScheduleConfig> = {};

  for (const config of dayConfigs) {
    if (!config.date) continue;

    const defaultForDay = defaultConfigs.find((d) => d.dayOfWeek === config.dayOfWeek);
    const differFromDefault =
      !defaultForDay ||
      config.isClosed !== defaultForDay.isClosed ||
      config.startTime !== defaultForDay.startTime ||
      config.endTime !== defaultForDay.endTime ||
      JSON.stringify(config.breaks) !== JSON.stringify(defaultForDay.breaks);

    const hasExistingOverride = !!existingOverrides[config.date];

    if (differFromDefault || hasExistingOverride) {
      overrides[config.date] = config;
    }
  }

  return overrides;
}
