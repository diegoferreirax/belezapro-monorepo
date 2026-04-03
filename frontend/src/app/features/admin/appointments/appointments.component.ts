import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/services/salon.service';
import { Appointment, AppointmentStatus } from '../../../core/models/salon.models';
import { PageRequest } from '../../../core/models/pagination.models';
import { MatIconModule } from '@angular/material/icon';
import { AppointmentBookingModalComponent } from './appointment-booking-modal/booking-modal';
import { AppointmentCancelModalComponent } from './appointment-cancel-modal/cancel-modal';
import { AppointmentCompleteModalComponent } from './appointment-complete-modal/complete-modal';
import { AppointmentListComponent } from './appointment-list/appointment-list';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    AppointmentBookingModalComponent, 
    AppointmentCancelModalComponent,
    AppointmentCompleteModalComponent,
    AppointmentListComponent, 
    AppointmentCalendarComponent,
    SearchInputComponent,
    PaginationComponent
  ],
  templateUrl: './appointments.html'
})
export class AppointmentsComponent {
  private salonService = inject(SalonService);

  pageRequest = signal<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'desc'
  });

  paginatedData = computed(() => {
    return this.salonService.getAppointmentsPaginated(this.pageRequest());
  });

  appointments = computed(() => {
    return [...this.salonService.appointments()].sort((a: Appointment, b: Appointment) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });
  });
  services = this.salonService.services;
  clients = this.salonService.clients;
  isModalOpen = signal(false);
  editingAppointmentId = signal<string | undefined>(undefined);
  cancelingAppointmentId = signal<string | undefined>(undefined);
  cancelingAppointment = computed(() => this.appointments().find(a => a.id === this.cancelingAppointmentId()));
  completingAppointment = signal<Appointment | undefined>(undefined);
  prefillDate = signal<string | undefined>(undefined);
  prefillTime = signal<string | undefined>(undefined);
  
  viewMode = signal<'list' | 'calendar'>('list');
  currentDate = signal(new Date());

  AppointmentStatus = AppointmentStatus;

  getClientName(clientId: string | undefined): string {
    if (!clientId) return 'Cliente desconhecido';
    return this.clients().find(c => c.id === clientId)?.name || 'Cliente desconhecido';
  }

  async updateStatus(appointment: Appointment, status: AppointmentStatus) {
    if (status === AppointmentStatus.COMPLETED) {
      const now = new Date();
      // Use local date/time for comparison
      const [year, month, day] = appointment.date.split('-').map(Number);
      const [hour, minute] = appointment.startTime.split(':').map(Number);
      const appDate = new Date(year, month - 1, day, hour, minute);
      
      if (appDate > now) {
        this.completingAppointment.set(appointment);
        return;
      }
    }

    const updated = { ...appointment, status };
    await this.salonService.updateAppointment(updated);
  }

  confirmCancel(id: string) {
    this.cancelingAppointmentId.set(id);
  }

  abortCancel() {
    this.cancelingAppointmentId.set(undefined);
  }

  async executeCancel() {
    const id = this.cancelingAppointmentId();
    if (id) {
      const app = this.appointments().find(a => a.id === id);
      if (app) {
        await this.updateStatus(app, AppointmentStatus.CANCELLED);
      }
      this.cancelingAppointmentId.set(undefined);
    }
  }

  async executeComplete() {
    const app = this.completingAppointment();
    if (app) {
      const updated = { ...app, status: AppointmentStatus.COMPLETED };
      await this.salonService.updateAppointment(updated);
      this.completingAppointment.set(undefined);
    }
  }

  abortComplete() {
    this.completingAppointment.set(undefined);
  }

  openBookingModal() {
    this.editingAppointmentId.set(undefined);
    this.prefillDate.set(undefined);
    this.prefillTime.set(undefined);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingAppointmentId.set(undefined);
    this.prefillDate.set(undefined);
    this.prefillTime.set(undefined);
  }

  openEditModal(appointment: Appointment) {
    this.editingAppointmentId.set(appointment.id);
    this.isModalOpen.set(true);
  }

  openBookingModalAt(data: { date: Date, hour: number, minutes: number }) {
    this.editingAppointmentId.set(undefined);
    this.prefillDate.set(data.date.toLocaleDateString('en-CA'));
    const timeStr = `${data.hour.toString().padStart(2, '0')}:${data.minutes.toString().padStart(2, '0')}`;
    this.prefillTime.set(timeStr);
    this.isModalOpen.set(true);
  }

  onBookingFinished() {
    this.closeModal();
  }

  onSearch(term: string) {
    this.pageRequest.update(req => ({ ...req, searchTerm: term, page: 1 }));
  }

  onPageChange(page: number) {
    this.pageRequest.update(req => ({ ...req, page }));
  }

  onPageSizeChange(pageSize: number) {
    this.pageRequest.update(req => ({ ...req, pageSize, page: 1 }));
  }
}
