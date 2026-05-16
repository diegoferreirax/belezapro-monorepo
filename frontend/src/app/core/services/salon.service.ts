import { Injectable, inject, signal } from '@angular/core';
import { CreateServiceRequest, Service } from '../models/salon.models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private apiService = inject(ApiService);

  services = signal<Service[]>([]);

  getServices() { return this.services(); }

  clearTenantCache(): void {
    this.services.set([]);
  }

  loadServices() {
    this.apiService.get<Service[]>('/services').subscribe({
      next: (data: Service[]) => this.services.set(data),
      error: () => console.log('Sessão sem permissão para buscar serviços ainda.')
    });
  }

  addService(body: CreateServiceRequest) {
    this.apiService.post<Service>('/services', body).subscribe({
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