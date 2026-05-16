/** Same rules as Angular `DurationFormatPipe`. */
export function formatDurationMinutes(minutes: number): string {
  if (minutes === 0) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}:${mins.toString().padStart(2, '0')}h`;
}

export const SERVICE_DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
