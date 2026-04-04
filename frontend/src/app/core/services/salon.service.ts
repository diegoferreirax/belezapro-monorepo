import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { Service, Client, Appointment, DayScheduleConfig, AppointmentStatus } from '../models/salon.models';
import { PageRequest, PageResponse } from '../models/pagination.models';
import { paginate } from '../utils/pagination.utils';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private repository = inject(LocalStorageRepository);
  private apiService = inject(ApiService);

  private readonly CLIENTS_KEY = 'salon_clients';
  private readonly APPOINTMENTS_KEY = 'salon_appointments';
  private readonly SCHEDULE_CONFIG_KEY = 'salon_schedule_config';
  private readonly SCHEDULE_OVERRIDES_KEY = 'salon_schedule_overrides';

  // Signals for reactivity
  services = signal<Service[]>([]);
  clients = signal<Client[]>([]);
  appointments = signal<Appointment[]>([]);
  scheduleConfigs = signal<DayScheduleConfig[]>([]);
  scheduleOverrides = signal<Record<string, DayScheduleConfig>>({});

  constructor() {
    this.refreshSignals();
  }

  private refreshSignals() {
    this.clients.set(this.repository.get<Client>(this.CLIENTS_KEY));
    this.appointments.set(this.repository.get<Appointment>(this.APPOINTMENTS_KEY));
    this.scheduleConfigs.set(this.repository.get<DayScheduleConfig>(this.SCHEDULE_CONFIG_KEY));
    this.scheduleOverrides.set(this.repository.getRaw<Record<string, DayScheduleConfig>>(this.SCHEDULE_OVERRIDES_KEY) || {});
  }

  // Services Integrados The Verdade ao Java JWT API backend
  getServices() { return this.services(); }

  loadServices() {
    // Carrega o catalogo atrelado the forma segura the nuvem The back End
    this.apiService.get<Service[]>('/services').subscribe({
      next: (data: Service[]) => this.services.set(data),
      error: (e: any) => console.log('Sessão sem permissão para buscar serviços ainda.')
    });
  }

  addService(service: Service) {
    this.apiService.post<Service>('/services', service).subscribe({
      next: (res: Service) => this.loadServices()
    });
  }

  updateService(service: Service) {
    this.apiService.put<Service>(`/services/${service.id}`, service).subscribe({
      next: (res: Service) => this.loadServices()
    });
  }

  deleteService(id: string) {
    this.apiService.delete<void>(`/services/${id}`).subscribe({
      next: (res: void) => this.loadServices()
    });
  }

  // Clients
  getClients() { return this.clients(); }
  
  getClientsPaginated(request: PageRequest): PageResponse<Client> {
    return paginate(this.clients(), request, (client, term) => 
      client.name.toLowerCase().includes(term) || 
      client.email.toLowerCase().includes(term) || 
      client.phone.includes(term)
    );
  }

  getClientByEmail(email: string) { return this.clients().find(c => c.email === email); }
  addClient(client: Client) {
    this.repository.add(this.CLIENTS_KEY, client);
    this.refreshSignals();
  }
  updateClient(client: Client) {
    this.repository.update(this.CLIENTS_KEY, client);
    this.refreshSignals();
  }
  blockClient(id: string) {
    const client = this.clients().find(c => c.id === id);
    if (client) {
      this.updateClient({ ...client, isBlocked: true });

      const now = new Date();
      const appointments = this.appointments().filter(a => 
        a.clientId === id && 
        (a.status === AppointmentStatus.PENDING || a.status === AppointmentStatus.CONFIRMED)
      );
      
      appointments.forEach(app => {
        const appDateTime = new Date(`${app.date}T${app.startTime}:00`);
        if (appDateTime > now) {
          this.updateAppointment({ ...app, status: AppointmentStatus.CANCELLED });
        }
      });
    }
  }
  unblockClient(id: string) {
    const client = this.clients().find(c => c.id === id);
    if (client) {
      this.updateClient({ ...client, isBlocked: false });
    }
  }

  // Appointments
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
    const apps = this.getActiveAppointmentsByDate(date);
    apps.forEach(app => {
      this.updateAppointment({ ...app, status: AppointmentStatus.CANCELLED });
    });
  }

  getAppointmentsPaginated(request: PageRequest, clientId?: string): PageResponse<Appointment> {
    let apps = this.appointments();
    if (clientId) {
      apps = apps.filter(a => a.clientId === clientId);
    }
    
    return paginate(apps, request, (app, term) => {
      const client = this.clients().find(c => c.id === app.clientId);
      const clientName = client ? client.name.toLowerCase() : '';
      
      const services = this.services().filter(s => app.serviceIds.includes(s.id));
      const serviceNames = services.map(s => s.name.toLowerCase()).join(' ');

      return clientName.includes(term) || 
             serviceNames.includes(term) || 
             app.status.toLowerCase().includes(term);
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

  // Schedule Config
  getScheduleConfigs() { return this.scheduleConfigs(); }
  saveScheduleConfigs(configs: DayScheduleConfig[]) {
    this.repository.save(this.SCHEDULE_CONFIG_KEY, configs);
    this.refreshSignals();
  }

  getScheduleOverrides() { return this.scheduleOverrides(); }
  saveScheduleOverrides(overrides: Record<string, DayScheduleConfig>) {
    // Merge with existing
    const current = this.getScheduleOverrides();
    const updated = { ...current, ...overrides };
    this.repository.saveRaw(this.SCHEDULE_OVERRIDES_KEY, updated);
    this.refreshSignals();
  }

  getScheduleForDate(dateStr: string): DayScheduleConfig | undefined {
    // 1. Check for specific override
    const overrides = this.getScheduleOverrides();
    if (overrides[dateStr]) {
      return overrides[dateStr];
    }

    // 2. Fallback to default for that day of week
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay();
    const defaults = this.getScheduleConfigs();
    const defaultConfig = defaults.find(c => c.dayOfWeek === dayOfWeek);
    
    if (defaultConfig) {
      // Clone and add date
      return { ...defaultConfig, date: dateStr };
    }
    
    return undefined;
  }
}