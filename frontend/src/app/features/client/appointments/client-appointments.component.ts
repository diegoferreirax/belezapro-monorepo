import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/services/salon.service';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentStatus, Service } from '../../../core/models/salon.models';
import { PageRequest } from '../../../core/models/pagination.models';
import { MatIconModule } from '@angular/material/icon';
import { DurationFormatPipe } from '../../../shared/pipes/duration-format.pipe';
import { Router } from '@angular/router';
import { ClientBookingModalComponent } from './client-booking-modal/client-booking-modal';
import { ClientCancelModalComponent } from './client-cancel-modal/client-cancel-modal';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-client-appointments',
  standalone: true,
  imports: [CommonModule, MatIconModule, DurationFormatPipe, ClientBookingModalComponent, ClientCancelModalComponent, SearchInputComponent, PaginationComponent],
  templateUrl: './client-appointments.html'
})
export class ClientAppointmentsComponent {
  private salonService = inject(SalonService);
  private authService = inject(AuthService);

  pageRequest = signal<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'desc'
  });

  paginatedData = computed(() => {
    const user = this.authService.getUser()();
    if (!user || !user.email) return { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 };
    // const client = this.salonService.getClientByEmail(user.email);
    // if (!client) return { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 };

    // return this.salonService.getAppointmentsPaginated(this.pageRequest(), client.id);
    return {
      items: [
        {
          id: '1',
          date: new Date(),
          startTime: '10:00',
          endTime: '11:00',
          totalPrice: 100,
          totalDurationMinutes: 60,
          status: AppointmentStatus.PENDING,
          serviceIds: ['1'],
          parsedServiceNames: ['Service 1'],
          clientName: 'Client 1'
        }
      ], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10
    };
  });

  isModalOpen = signal(false);
  cancelingAppointmentId = signal<string | undefined>(undefined);
  editingAppointmentId = signal<string | undefined>(undefined);

  userName = computed(() => this.authService.getUser()()?.name || 'Cliente');

  AppointmentStatus = AppointmentStatus;

  getServiceNames(app: any) {
    return app.parsedServiceNames ? app.parsedServiceNames.join(', ') : '';
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
      // const appointment = this.salonService.getAppointments().find(a => a.id === id);
      // if (appointment) {
      //   await this.salonService.updateAppointment({ ...appointment, status: AppointmentStatus.CANCELLED });
      // }
      this.cancelingAppointmentId.set(undefined);
    }
  }

  openBookingModal() {
    this.editingAppointmentId.set(undefined);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  openEditModal(id: string) {
    this.editingAppointmentId.set(id);
    this.isModalOpen.set(true);
  }

  onBookingFinished() {
    this.isModalOpen.set(false);
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
