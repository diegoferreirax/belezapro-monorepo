import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Client } from '../models/salon.models';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiService = inject(ApiService);

  clients = signal<Client[]>([]);

  private fetchClients(): Observable<Client[]> {
    return this.apiService.get<Client[]>('/clients');
  }

  clearTenantCache(): void {
    this.clients.set([]);
  }

  loadClients(): void {
    this.fetchClients().subscribe({
      next: (data: Client[]) => this.clients.set(data),
      error: (e: any) => console.error('Erro ao carregar clientes:', e)
    });
  }

  createClient(data: Omit<Client, 'id' | 'isBlocked' | 'linkedAt'>): Observable<Client[]> {
    return this.apiService.post<Client>('/clients', data).pipe(
      switchMap(() => this.fetchClients()),
      tap((clients: Client[]) => this.clients.set(clients))
    );
  }

  updateClient(id: string, data: { name: string; phone: string }): Observable<Client[]> {
    return this.apiService.put<Client>(`/clients/${id}`, data).pipe(
      switchMap(() => this.fetchClients()),
      tap((clients: Client[]) => this.clients.set(clients))
    );
  }

  toggleBlock(id: string): Observable<Client[]> {
    return this.apiService.patch<Client>(`/clients/${id}/toggle-block`, {}).pipe(
      switchMap(() => this.fetchClients()),
      tap((clients: Client[]) => this.clients.set(clients))
    );
  }

  ensureClient(data: Omit<Client, 'id' | 'isBlocked' | 'linkedAt'>): Observable<Client> {
    return this.apiService.post<Client>('/clients', data);
  }
}
