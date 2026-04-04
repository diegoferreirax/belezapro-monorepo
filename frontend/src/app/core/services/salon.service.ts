import { Injectable, inject, signal } from '@angular/core';
import { Service } from '../models/salon.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private apiService = inject(ApiService);

  // Signals for reactivity
  services = signal<Service[]>([]);

  constructor() {
    this.refreshSignals();
  }

  private refreshSignals() {
    this.loadServices();
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
}