import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientPortalService } from '../../../core/services/client-portal.service';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppointmentStatus, AppointmentStatusLabels, Company, Appointment } from '../../../core/models/salon.models';
import { PageRequest, PageResponse } from '../../../core/models/pagination.models';
import { MatIconModule } from '@angular/material/icon';
import { DurationFormatPipe } from '../../../shared/pipes/duration-format.pipe';
import { ClientBookingModalComponent } from './client-booking-modal/client-booking-modal';
import { ClientCancelModalComponent } from './client-cancel-modal/client-cancel-modal';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-appointments',
  standalone: true,
  imports: [CommonModule, MatIconModule, DurationFormatPipe, ClientBookingModalComponent, ClientCancelModalComponent, SearchInputComponent, PaginationComponent, FormsModule],
  templateUrl: './client-appointments.html'
})
export class ClientAppointmentsComponent implements OnInit {
  private clientPortalService = inject(ClientPortalService);
  private authService = inject(AuthService);

  pageRequest = signal<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'date',
    sortDirection: 'desc'
  });

  paginatedData = signal<PageResponse<Appointment>>({ items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 });
  
  companies = signal<Company[]>([]);
  selectedCompanyId = signal<string>('');

  isModalOpen = signal(false);
  cancelingAppointmentId = signal<string | undefined>(undefined);
  editingAppointment = signal<Appointment | undefined>(undefined);

  userName = computed(() => this.authService.getUser()()?.name || 'Cliente');

  AppointmentStatus = AppointmentStatus;
  StatusLabels = AppointmentStatusLabels;

  constructor() {
    effect(() => {
      this.loadAppointments();
    });
  }

  ngOnInit() {
    this.loadCompanies();
  }

  loadAppointments() {
    const req = this.pageRequest();
    this.clientPortalService.getPaginatedList(
      req,
      this.selectedCompanyId() || undefined,
      req.searchTerm
    ).subscribe({
      next: (res) => this.paginatedData.set(res),
      error: () => console.error('Erro ao listar agendamentos do cliente.')
    });
  }

  getServiceNames(app: Appointment) {
    return app.parsedServiceNames ? app.parsedServiceNames.join(', ') : '';
  }

  onCompanySelected(event: any) {
    const val = event.target.value;
    this.selectedCompanyId.set(val);
    this.pageRequest.update(r => ({ ...r, page: 1 }));
  }

  confirmCancel(id: string) {
    this.cancelingAppointmentId.set(id);
  }

  abortCancel() {
    this.cancelingAppointmentId.set(undefined);
  }

  executeCancel() {
    const id = this.cancelingAppointmentId();
    if (!id) return;

    this.clientPortalService.cancelAppointment(id).subscribe({
      next: () => {
        this.loadAppointments();
        this.cancelingAppointmentId.set(undefined);
      },
      error: (err: HttpErrorResponse) => {
        const body = err.error;
        const detail =
          typeof body === 'object' && body !== null && 'message' in body
            ? String((body as { message: string }).message)
            : err.message;
        alert('Erro ao cancelar: ' + detail);
        this.cancelingAppointmentId.set(undefined);
      }
    });
  }

  openBookingModal() {
    this.editingAppointment.set(undefined);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  openEditModal(appointment: Appointment) {
    this.editingAppointment.set(appointment);
    this.isModalOpen.set(true);
  }

  onBookingFinished() {
    this.isModalOpen.set(false);
    this.loadAppointments();
    this.loadCompanies();
  }

  loadCompanies() {
    this.clientPortalService.getCompaniesWithAppointments().subscribe({
      next: (list) => {
        this.companies.set(list);
      },
      error: () => console.error("Falha ao carregar empresas do cliente")
    });
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
