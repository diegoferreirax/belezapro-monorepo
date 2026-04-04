import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { Service, Appointment, AppointmentStatus } from '../models/salon.models';
import { PageRequest, PageResponse } from '../models/pagination.models';
import { paginate } from '../utils/pagination.utils';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private repository = inject(LocalStorageRepository);
  private apiService = inject(ApiService);

  private readonly APPOINTMENTS_KEY = 'salon_appointments';

  // Signals for reactivity
  services = signal<Service[]>([]);
  appointments = signal<Appointment[]>([]);

  constructor() {
    this.refreshSignals();
  }

  private refreshSignals() {
    this.appointments.set(this.repository.get<Appointment>(this.APPOINTMENTS_KEY));
  }

  // Services — integrado com a API REST
  getServices() { return this.services(); }

  loadServices() {
    this.apiService.get<Service[]>('/services').subscribe({
      next: (data: Service[]) => this.services.set(data),
      error: () => console.log('Sessão sem permissão para buscar serviços ainda.')
    });
  }

  addService(service: Service) {
    this.apiService.post<Service>('/services', service).subscribe({
      next: () => this.loadServices()
    });
  }

  updateService(service: Service) {
    this.apiService.put<Service>(`/services/${service.id}`, service).subscribe({
      next: () => this.loadServices()
    });
  }

  deleteService(id: string) {
    this.apiService.delete<void>(`/services/${id}`).subscribe({
      next: () => this.loadServices()
    });
  }

  // Appointments — ainda em localStorage (TODO: migrar)
  getAppointments() { return this.appointments(); }

  getAppointmentsByDate(date: string): Appointment[] {
    return this.appointments().filter(a => a.date === date);
  }

  getActiveAppointmentsByDate(date: string): Appointment[] {
    return this.getAppointmentsByDate(date).filter(a =>
      a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED
    );
  }

  cancelAppointmentsByDate(date: string): void {
    this.getActiveAppointmentsByDate(date).forEach(app => {
      this.updateAppointment({ ...app, status: AppointmentStatus.CANCELLED });
    });
  }

  getAppointmentsPaginated(request: PageRequest, clientId?: string): PageResponse<Appointment> {
    let apps = this.appointments();
    if (clientId) {
      apps = apps.filter(a => a.clientId === clientId);
    }
    return paginate(apps, request, (app: Appointment, term: string) => {
      const services = this.services().filter((s: any) => app.serviceIds.includes(s.id));
      const serviceNames = services.map((s: any) => s.name.toLowerCase()).join(' ');
      return serviceNames.includes(term) || app.status.toLowerCase().includes(term);
    });
  }

  addAppointment(appointment: Appointment) {
    this.repository.add(this.APPOINTMENTS_KEY, appointment);
    this.refreshSignals();
  }

  updateAppointment(appointment: Appointment) {
    this.repository.update(this.APPOINTMENTS_KEY, appointment);
    this.refreshSignals();
  }

  deleteAppointment(id: string) {
    this.repository.delete(this.APPOINTMENTS_KEY, id);
    this.refreshSignals();
  }
}