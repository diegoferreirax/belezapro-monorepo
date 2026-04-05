import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../core/models/salon.models';
import { PageRequest, PageResponse } from '../../../core/models/pagination.models';
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
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  pageRequest = signal<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'desc'
  });

  paginatedData = signal<PageResponse<Appointment>>({ items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 });
  
  // Para manter a reatividade da agenda caso se necessite da listagem do range, os components-filhos 
  // agora devem requerer da API eles mesmos, ou então injetamos um store para agendamentos do calendario
  appointments = computed(() => this.paginatedData().items);

  isModalOpen = signal(false);
  editingAppointment = signal<Appointment | undefined>(undefined);
  cancelingAppointmentId = signal<string | undefined>(undefined);
  cancelingAppointment = computed(() => this.appointments().find(a => a.id === this.cancelingAppointmentId()));
  completingAppointment = signal<Appointment | undefined>(undefined);
  prefillDate = signal<string | undefined>(undefined);
  prefillTime = signal<string | undefined>(undefined);

  viewMode = signal<'list' | 'calendar'>('list');
  currentDate = signal(new Date());

  AppointmentStatus = AppointmentStatus;

  constructor() {
    effect(() => {
      this.loadAppointments();
    });
  }

  ngOnInit() {
    // loadAppointments is triggered by effect on pageRequest changes
  }

  loadAppointments() {
    const req = this.pageRequest();
    this.appointmentService.getPaginatedList(req, undefined, req.searchTerm).subscribe({
      next: (res) => this.paginatedData.set(res),
      error: () => console.error('Erro ao listar agendamentos na tela.')
    });
  }

  // Denormalization: Get ClientName is now directly in Appointment!
  getClientName(appointment: Appointment): string {
    return appointment.clientName || 'Cliente desconhecido';
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
    this.appointmentService.update(appointment.id, updated).subscribe({
      next: () => this.loadAppointments(),
      error: () => alert('Acesso Negado ou Agendamento não encotrado.')
    });
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
      this.appointmentService.update(app.id, updated).subscribe({
        next: () => this.loadAppointments(),
        error: () => alert('Erro ao finalizar Agendamento.')
      });
      this.completingAppointment.set(undefined);
    }
  }

  abortComplete() {
    this.completingAppointment.set(undefined);
  }

  openBookingModal() {
    this.editingAppointment.set(undefined);
    this.prefillDate.set(undefined);
    this.prefillTime.set(undefined);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingAppointment.set(undefined);
    this.prefillDate.set(undefined);
    this.prefillTime.set(undefined);
  }

  openEditModal(appointment: Appointment) {
    this.editingAppointment.set(appointment);
    this.isModalOpen.set(true);
  }

  openBookingModalAt(data: { date: Date, hour: number, minutes: number }) {
    this.editingAppointment.set(undefined);
    this.prefillDate.set(data.date.toLocaleDateString('en-CA'));
    const timeStr = `${data.hour.toString().padStart(2, '0')}:${data.minutes.toString().padStart(2, '0')}`;
    this.prefillTime.set(timeStr);
    this.isModalOpen.set(true);
  }

  onBookingFinished() {
    this.closeModal();
    this.loadAppointments();
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
