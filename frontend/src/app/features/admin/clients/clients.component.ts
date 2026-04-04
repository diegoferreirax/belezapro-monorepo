import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/salon.models';
import { PageRequest } from '../../../core/models/pagination.models';
import { MatIconModule } from '@angular/material/icon';
import { ClientModalComponent } from './client-modal/client-modal';
import { ClientBookingModalComponent } from './booking-modal/booking-modal';
import { ClientBlockModalComponent } from './block-modal/block-modal';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { paginate } from '../../../core/utils/pagination.utils';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, MatIconModule, SearchInputComponent, PaginationComponent, ClientModalComponent, ClientBookingModalComponent, ClientBlockModalComponent],
  templateUrl: './clients.html'
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientService);

  pageRequest = signal<PageRequest>({
    page: 1,
    pageSize: 10,
    searchTerm: '',
    sortBy: 'name',
    sortDirection: 'asc'
  });

  paginatedData = computed(() => {
    return paginate(this.clientService.clients(), this.pageRequest(), (client, term) =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.includes(term)
    );
  });

  isModalOpen = signal(false);
  editingClient = signal<Client | null>(null);

  isBookingModalOpen = signal(false);
  selectedClientForBooking = signal<Client | null>(null);

  isBlockModalOpen = signal(false);
  clientToBlock = signal<Client | null>(null);

  ngOnInit() {
    this.clientService.loadClients();
  }

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
      this.clientService.toggleBlock(client.id).subscribe();
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
      this.clientService.toggleBlock(client.id).subscribe();
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

