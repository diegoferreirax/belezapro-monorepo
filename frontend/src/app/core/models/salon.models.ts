export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBlocked?: boolean;
}

export enum AppointmentStatus {
  PENDING = 'Pendente',
  CONFIRMED = 'Confirmado',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado'
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceIds: string[];
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // HH:mm
  totalDurationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
}

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface DayScheduleConfig {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  date?: string; // YYYY-MM-DD (Present only for specific date overrides)
  startTime: string;
  endTime: string;
  breaks: TimeRange[];
  isClosed: boolean;
}

export enum ExpenseCategory {
  MATERIALS = 'Materiais',
  RENT = 'Aluguel',
  UTILITIES = 'Utilidades (Luz/Água)',
  MARKETING = 'Marketing',
  OTHER = 'Outros'
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO Date YYYY-MM-DD
  category: ExpenseCategory;
  isPaid: boolean;
}
