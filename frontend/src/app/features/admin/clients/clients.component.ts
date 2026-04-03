import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonService } from '../../../core/services/salon.service';
import { Client } from '../../../core/models/salon.models';
import { PageRequest } from '../../../core/models/pagination.models';
import { MatIconModule } from '@angular/material/icon';
import { ClientModalComponent } from './client-modal/client-modal';
import { ClientBookingModalComponent } from './booking-modal/booking-modal';
import { ClientBlockModalComponent } from './block-modal/block-modal';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, MatIconModule, SearchInputComponent, PaginationComponent, ClientModalComponent, ClientBookingModalComponent, ClientBlockModalComponent],
  templateUrl: './clients.html'
})
export class ClientsComponent {
  private salonService = inject(SalonService);

  pageRequest = signal<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'name',
    sortDirection: 'asc'
  });

  paginatedData = computed(() => {
    return this.salonService.getClientsPaginated(this.pageRequest());
  });

  isModalOpen = signal(false);
  editingClient = signal<Client | null>(null);

  isBookingModalOpen = signal(false);
  selectedClientForBooking = signal<Client | null>(null);

  isBlockModalOpen = signal(false);
  clientToBlock = signal<Client | null>(null);

  openModal(client?: Client) {
    this.editingClient.set(client || null);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  openBookingModal(client: Client) {
    this.selectedClientForBooking.set(client);
    this.isBookingModalOpen.set(true);
  }

  closeBookingModal() {
    this.isBookingModalOpen.set(false);
    this.selectedClientForBooking.set(null);
  }

  toggleBlockClient(client: Client) {
    if (client.isBlocked) {
      this.salonService.unblockClient(client.id);
    } else {
      this.clientToBlock.set(client);
      this.isBlockModalOpen.set(true);
    }
  }

  closeBlockModal() {
    this.isBlockModalOpen.set(false);
    this.clientToBlock.set(null);
  }

  confirmBlock() {
    const client = this.clientToBlock();
    if (client) {
      this.salonService.blockClient(client.id);
      this.closeBlockModal();
    }
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
