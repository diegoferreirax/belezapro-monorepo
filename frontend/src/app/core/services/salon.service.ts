import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { Service, Client, Appointment, DayScheduleConfig, AppointmentStatus } from '../models/salon.models';
import { PageRequest, PageResponse } from '../models/pagination.models';
import { paginate } from '../utils/pagination.utils';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private repository = inject(LocalStorageRepository);

  private readonly SERVICES_KEY = 'salon_services';
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
    this.seedInitialData();
    this.refreshSignals();
  }

  private refreshSignals() {
    this.services.set(this.repository.get<Service>(this.SERVICES_KEY));
    this.clients.set(this.repository.get<Client>(this.CLIENTS_KEY));
    this.appointments.set(this.repository.get<Appointment>(this.APPOINTMENTS_KEY));
    this.scheduleConfigs.set(this.repository.get<DayScheduleConfig>(this.SCHEDULE_CONFIG_KEY));
    this.scheduleOverrides.set(this.repository.getRaw<Record<string, DayScheduleConfig>>(this.SCHEDULE_OVERRIDES_KEY) || {});
  }

  // Services
  getServices() { return this.services(); }
  addService(service: Service) {
    this.repository.add(this.SERVICES_KEY, service);
    this.refreshSignals();
  }
  updateService(service: Service) {
    this.repository.update(this.SERVICES_KEY, service);
    this.refreshSignals();
  }
  deleteService(id: string) {
    this.repository.delete(this.SERVICES_KEY, id);
    this.refreshSignals();
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

  private seedInitialData() {
    if (this.getServices().length === 0) {
      const initialServices: Service[] = [
        { id: '1', name: 'Manicure simples', price: 40, durationMinutes: 120, isActive: true },
        { id: '2', name: 'Pedicure simples', price: 45, durationMinutes: 120, isActive: true },
        { id: '3', name: 'Pe e mão', price: 80, durationMinutes: 210, isActive: true },
        { id: '4', name: 'Plástica dos Pés', price: 85, durationMinutes: 150, isActive: true },
        { id: '5', name: 'Unha em gel mão', price: 75, durationMinutes: 180, isActive: true },
        { id: '6', name: 'Unha gel pé', price: 85, durationMinutes: 180, isActive: true },
        { id: '7', name: 'Remoção de Esmaltação', price: 15, durationMinutes: 20, isActive: true },
        { id: '8', name: 'Limpeza de fungos ungueal', price: 55, durationMinutes: 120, isActive: true },
        { id: '9', name: 'Decoração unhas', price: 10, durationMinutes: 0, isActive: true },
        { id: '10', name: 'Esmaltação mão', price: 80, durationMinutes: 120, isActive: true },
        { id: '11', name: 'Pé', price: 45, durationMinutes: 120, isActive: true },
        { id: '12', name: 'Mão', price: 35, durationMinutes: 180, isActive: true },
      ];
      this.repository.save(this.SERVICES_KEY, initialServices);
    }

    if (this.getScheduleConfigs().length === 0) {
      const defaultConfig: DayScheduleConfig[] = [];
      for (let i = 0; i < 7; i++) {
        defaultConfig.push({
          dayOfWeek: i,
          startTime: '08:00',
          endTime: '18:00',
          breaks: [],
          isClosed: i === 0 // Sunday closed by default
        });
      }
      this.saveScheduleConfigs(defaultConfig);
    }
  }
}