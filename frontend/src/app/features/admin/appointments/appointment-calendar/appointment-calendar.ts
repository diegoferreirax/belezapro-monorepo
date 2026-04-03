import { Component, input, output, computed, inject, ChangeDetectionStrategy, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Appointment, AppointmentStatus, Client, Service, DayScheduleConfig } from '../../../../core/models/salon.models';
import { SalonService } from '../../../../core/services/salon.service';

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './appointment-calendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentCalendarComponent {
  private salonService = inject(SalonService);

  appointments = signal<Appointment[]>([]);
  clients = signal<Client[]>([]);
  services = signal<Service[]>([]);
  currentDate = signal<Date>(new Date());

  @Input('appointments') set appointmentsInput(value: Appointment[]) { this.appointments.set(value || []); }
  @Input('clients') set clientsInput(value: Client[]) { this.clients.set(value || []); }
  @Input('services') set servicesInput(value: Service[] | undefined) { this.services.set(value || []); }
  @Input('currentDate') set currentDateInput(value: Date) { this.currentDate.set(value || new Date()); }

  dateChange = output<Date>();
  editAppointment = output<Appointment>();
  cancelAppointment = output<string>();
  statusChange = output<{ appointment: Appointment, status: AppointmentStatus }>();
  bookAt = output<{ date: Date, hour: number, minutes: number }>();

  AppointmentStatus = AppointmentStatus;

  calendarDays = computed(() => {
    const start = new Date(this.currentDate());
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  });

  calendarBounds = computed(() => {
    const days = this.calendarDays();
    const configs = days.map(d => {
      const dateStr = d.toLocaleDateString('en-CA');
      return this.salonService.getScheduleForDate(dateStr);
    }).filter(c => c && !c.isClosed) as DayScheduleConfig[];

    let minHour = 8;
    let maxHour = 18;

    if (configs.length > 0) {
      const startHours = configs.map(c => parseInt(c.startTime.split(':')[0]));
      const endHours = configs.map(c => {
        const [h, m] = c.endTime.split(':').map(Number);
        return m > 0 ? h + 1 : h;
      });
      minHour = Math.min(minHour, ...startHours);
      maxHour = Math.max(maxHour, ...endHours);
    }

    // Also consider existing appointments just in case they are outside business hours
    const appHours = this.appointments().map(a => {
      const [h] = a.startTime.split(':').map(Number);
      return { start: h, end: Math.ceil(h + a.totalDurationMinutes / 60) };
    });

    if (appHours.length > 0) {
      minHour = Math.min(minHour, ...appHours.map(a => a.start));
      maxHour = Math.max(maxHour, ...appHours.map(a => a.end));
    }

    return { minHour, maxHour };
  });

  calendarHours = computed(() => {
    const { minHour, maxHour } = this.calendarBounds();
    return Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  });

  clickableSlots = computed(() => {
    const { minHour, maxHour } = this.calendarBounds();
    const slots: { hour: number, minutes: number }[] = [];
    for (let h = minHour; h < maxHour; h++) {
      slots.push({ hour: h, minutes: 0 });
      slots.push({ hour: h, minutes: 30 });
    }
    return slots;
  });

  calendarHeight = computed(() => {
    const { minHour, maxHour } = this.calendarBounds();
    return (maxHour - minHour) * 90;
  });

  formatHour(hour: number): string {
    const h = hour % 24;
    return `${h.toString().padStart(2, '0')}:00`;
  }

  getAppointmentsForDay(date: Date): Appointment[] {
    const dateStr = date.toLocaleDateString('en-CA');
    return this.appointments().filter(a => 
      a.date === dateStr && 
      a.status !== AppointmentStatus.CANCELLED
    );
  }

  getUnavailableBlocksForDay(date: Date) {
    const dateStr = date.toLocaleDateString('en-CA');
    const config = this.salonService.getScheduleForDate(dateStr);
    const { minHour, maxHour } = this.calendarBounds();
    const blocks: { top: number, height: number }[] = [];
    const totalHeight = (maxHour - minHour) * 90;

    if (!config || config.isClosed) {
      blocks.push({ top: 0, height: totalHeight });
      return blocks;
    }

    const startH = parseInt(config.startTime.split(':')[0]);
    const startM = parseInt(config.startTime.split(':')[1]);
    const endH = parseInt(config.endTime.split(':')[0]);
    const endM = parseInt(config.endTime.split(':')[1]);

    const dayStartMin = startH * 60 + startM;
    const dayEndMin = endH * 60 + endM;
    const calStartMin = minHour * 60;

    if (dayStartMin > calStartMin) {
      blocks.push({
        top: 0,
        height: (dayStartMin - calStartMin) * 1.5
      });
    }

    const calEndMin = maxHour * 60;
    if (dayEndMin < calEndMin) {
      blocks.push({
        top: (dayEndMin - calStartMin) * 1.5,
        height: (calEndMin - dayEndMin) * 1.5
      });
    }

    config.breaks.forEach(b => {
      const bStartH = parseInt(b.start.split(':')[0]);
      const bStartM = parseInt(b.start.split(':')[1]);
      const bEndH = parseInt(b.end.split(':')[0]);
      const bEndM = parseInt(b.end.split(':')[1]);
      const bStartMin = bStartH * 60 + bStartM;
      const bEndMin = bEndH * 60 + bEndM;

      blocks.push({
        top: (bStartMin - calStartMin) * 1.5,
        height: (bEndMin - bStartMin) * 1.5
      });
    });

    return blocks;
  }

  calculateTop(startTime: string): number {
    const [h, m] = startTime.split(':').map(Number);
    const { minHour } = this.calendarBounds();
    return (h * 60 + m - minHour * 60) * 1.5;
  }

  calculateHeight(durationMinutes: number): number {
    return durationMinutes * 1.5;
  }

  getClientName(clientId: string): string {
    return this.clients().find(c => c.id === clientId)?.name || 'Cliente desconhecido';
  }

  getServiceNames(serviceIds: string[]): string {
    return serviceIds
      .map(id => this.services().find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  }

  getAppointmentClasses(app: Appointment): string {
    const base = 'absolute left-1 right-1 rounded-xl p-2 overflow-hidden shadow-sm border z-20 transition-all hover:shadow-md hover:z-40 group';
    const cursor = (app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.CONFIRMED) 
      ? 'cursor-pointer' 
      : 'cursor-default';
    
    let statusClasses = '';
    switch (app.status) {
      case AppointmentStatus.PENDING:
        statusClasses = 'bg-amber-100/50 border-amber-200/70 text-amber-900/80';
        break;
      case AppointmentStatus.CONFIRMED:
        statusClasses = 'bg-indigo-100/50 border-indigo-200/70 text-indigo-900/80';
        break;
      case AppointmentStatus.COMPLETED:
        statusClasses = 'bg-emerald-100/50 border-emerald-200/70 text-emerald-900/80';
        break;
    }

    return `${base} ${cursor} ${statusClasses}`;
  }

  handleAppointmentClick(app: Appointment, event: Event) {
    event.stopPropagation();
    if (app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.CONFIRMED) {
      this.editAppointment.emit(app);
    }
  }

  onCancelClick(app: Appointment, event: Event) {
    event.stopPropagation();
    this.cancelAppointment.emit(app.id);
  }

  onStatusChangeClick(app: Appointment, status: AppointmentStatus, event: Event) {
    event.stopPropagation();
    this.statusChange.emit({ appointment: app, status });
  }

  previousWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() - 7);
    this.dateChange.emit(d);
  }

  nextWeek() {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + 7);
    this.dateChange.emit(d);
  }

  today() {
    this.dateChange.emit(new Date());
  }
}
