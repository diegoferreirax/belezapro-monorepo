import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/services/salon.service';
import { Service } from '../../../core/models/salon.models';
import { MatIconModule } from '@angular/material/icon';
import { DurationFormatPipe } from '../../../shared/pipes/duration-format.pipe';
import { ServiceModalComponent } from './service-modal/service-modal';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, MatIconModule, DurationFormatPipe, ServiceModalComponent, ConfirmModalComponent],
  templateUrl: './services.html'
})
export class ServicesComponent implements OnInit {
  private salonService = inject(SalonService);

  services = this.salonService.services;
  isModalOpen = signal(false);
  editingService = signal<Service | null>(null);

  ngOnInit() {
    this.salonService.loadServices();
  }

  isDeleteModalOpen = signal(false);
  serviceToDelete = signal<Service | null>(null);

  openModal(service?: Service) {
    if (service) {
      this.editingService.set(service);
    } else {
      this.editingService.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  async onServiceSaved(serviceData: Service) {
    if (this.editingService()) {
      await this.salonService.updateService(serviceData);
    } else {
      await this.salonService.addService(serviceData);
    }

    this.closeModal();
  }

  openDeleteModal(service: Service) {
    this.serviceToDelete.set(service);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.serviceToDelete.set(null);
  }

  async confirmDelete() {
    const service = this.serviceToDelete();
    if (service) {
      await this.salonService.deleteService(service.id);
      this.closeDeleteModal();
    }
  }

  async toggleStatus(service: Service) {
    const updated = { ...service, isActive: !service.isActive };
    await this.salonService.updateService(updated);
  }
}
