export function formatAppointmentDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

export function formatBrl(value: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

export function isAppointmentInFuture(appointment: {
  date: string;
  startTime: string;
}): boolean {
  const [year, month, day] = appointment.date.split('-').map(Number);
  const [hour, minute] = appointment.startTime.split(':').map(Number);
  const appDate = new Date(year, month - 1, day, hour, minute);
  return appDate > new Date();
}

export function getTodayDateStr(): string {
  return new Date().toLocaleDateString('en-CA');
}
