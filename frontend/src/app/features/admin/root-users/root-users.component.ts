import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SystemUserService, SystemUser } from '../../../core/services/system-user.service';
import { RootUsersModalComponent } from './modal/root-users-modal.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { Observable, BehaviorSubject, switchMap, combineLatest, debounceTime } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { PageResponse } from '../../../core/models/pagination.models';

@Component({
  selector: 'app-root-users',
  standalone: true,
  imports: [AsyncPipe, NgIf, NgFor, DatePipe, MatIconModule, FormsModule, RootUsersModalComponent, PaginationComponent],
  template: `
    <div class="p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Gestão de Usuários (ROOT)</h1>
        <div class="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-4">
          
          <button (click)="isFiltersOpen = !isFiltersOpen"
                  class="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors shadow-sm whitespace-nowrap"
                  [class.bg-stone-100]="isFiltersOpen">
            <mat-icon class="w-5 h-5 text-sm">filter_list</mat-icon>
            <span class="font-medium text-sm">Filtros Avançados</span>
          </button>
          
          <button
            (click)="openModal()"
            class="flex items-center justify-center sm:justify-start gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <mat-icon class="w-5 h-5 text-sm">add</mat-icon>
            <span class="font-medium text-sm">Novo Usuário</span>
          </button>
        </div>
      </div>

      <!-- Painel de Filtros Avançados -->
      <div *ngIf="isFiltersOpen" class="bg-white p-6 rounded-lg shadow mb-6 animate-in fade-in slide-in-from-top-4 duration-200 border border-stone-100">
        <h3 class="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">Pesquisa Combinada</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-stone-600 mb-1">Nome do Usuário</label>
            <input type="text" [ngModel]="filters().name" (ngModelChange)="updateFilter('name', $event)" 
                   class="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none" placeholder="Buscar por nome...">
          </div>
          <div>
            <label class="block text-xs font-medium text-stone-600 mb-1">E-mail</label>
            <input type="text" [ngModel]="filters().email" (ngModelChange)="updateFilter('email', $event)" 
                   class="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none" placeholder="Buscar por email...">
          </div>
          <div>
            <label class="block text-xs font-medium text-stone-600 mb-1">Nível de Acesso</label>
            <select [ngModel]="filters().role" (ngModelChange)="updateFilter('role', $event)"
                    class="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none">
              <option value="ALL">Todos os Níveis</option>
              <option value="ROOT">Root</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button (click)="clearFilters()" class="text-xs text-stone-500 hover:text-stone-700 font-medium px-4 py-2 hover:bg-stone-100 rounded-lg transition-colors">
            Limpar Pesquisa
          </button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel (Role)</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <ng-container *ngIf="users$ | async as pageData; else loading">
              <tr *ngFor="let user of pageData.items">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [class.bg-purple-100]="user.role === 'ROOT'" [class.text-purple-800]="user.role === 'ROOT'"
                        [class.bg-blue-100]="user.role === 'ADMIN'" [class.text-blue-800]="user.role === 'ADMIN'"
                        [class.bg-green-100]="user.role === 'CLIENT'" [class.text-green-800]="user.role === 'CLIENT'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [class.bg-green-100]="!user.isBlocked" [class.text-green-800]="!user.isBlocked"
                        [class.bg-red-100]="user.isBlocked" [class.text-red-800]="user.isBlocked">
                    {{ user.isBlocked ? 'Bloqueado' : 'Ativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="openModal(user)" class="text-stone-500 hover:text-stone-900 mx-2" title="Editar">
                    <mat-icon class="text-xl">edit</mat-icon>
                  </button>
                  <button (click)="toggleBlock(user)" class="mx-2" [class.text-red-500]="!user.isBlocked" [class.text-green-500]="user.isBlocked" [title]="user.isBlocked ? 'Desbloquear' : 'Bloquear'">
                    <mat-icon class="text-xl">{{ user.isBlocked ? 'lock_open' : 'lock' }}</mat-icon>
                  </button>
                  <button (click)="deleteUser(user)" class="text-rose-500 hover:text-rose-700 mx-2" title="Deletar">
                    <mat-icon class="text-xl">delete</mat-icon>
                  </button>
                </td>
              </tr>
              <!-- Empty State / Sem resultados -->
              <tr *ngIf="pageData.items.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-stone-500">
                  <div class="flex flex-col items-center justify-center">
                    <mat-icon class="text-stone-300 w-12 h-12 text-[48px] mb-2">search_off</mat-icon>
                    <p>Nenhum resultado filtrado.</p>
                  </div>
                </td>
              </tr>
            </ng-container>
            <ng-template #loading>
              <tr>
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">Carregando usuários do sistema...</td>
              </tr>
            </ng-template>
          </tbody>
        </table>
        <div *ngIf="users$ | async as res">
          <app-pagination
            *ngIf="res.totalItems > 0"
            [currentPage]="currentPage()"
            [totalPages]="res.totalPages"
            [totalItems]="res.totalItems"
            [pageSize]="pageSize()"
            (pageChange)="onPageChange($event)"
            (pageSizeChange)="onPageSizeChange($event)"
          ></app-pagination>
        </div>
      </div>
    </div>

    <app-root-users-modal
      [isOpen]="isModalOpen"
      [user]="selectedUser"
      (closed)="closeModal()"
      (saved)="onUserSaved($event)"
    ></app-root-users-modal>
  `
})
export class RootUsersComponent implements OnInit {
  private userService = inject(SystemUserService);
  private refreshTrigger = new BehaviorSubject<void>(undefined);
  
  currentPage = signal(1);
  pageSize = signal(10);
  filters = signal({ name: '', email: '', role: 'ALL' });
  isFiltersOpen = false;

  private currentPage$ = toObservable(this.currentPage);
  private pageSize$ = toObservable(this.pageSize);
  private filters$ = toObservable(this.filters);

  users$!: Observable<PageResponse<SystemUser>>;
  isModalOpen = false;
  selectedUser: SystemUser | null = null;

  ngOnInit() {
    this.users$ = combineLatest([
      this.refreshTrigger,
      this.currentPage$,
      this.pageSize$,
      this.filters$
    ]).pipe(
      debounceTime(50),
      switchMap(([_, page, size, currentFilters]) => this.userService.getUsers(page, size, currentFilters))
    );
  }

  updateFilter(field: 'name' | 'email' | 'role', value: string) {
    this.filters.update(curr => ({ ...curr, [field]: value }));
    this.currentPage.set(1); // Reset page on filter
  }

  clearFilters() {
    this.filters.set({ name: '', email: '', role: 'ALL' });
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  openModal(user?: SystemUser) {
    this.selectedUser = user || null;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  onUserSaved(userData: any) {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser.id, userData).subscribe(() => {
        this.closeModal();
        this.refreshTrigger.next();
      });
    } else {
      this.userService.createUser(userData).subscribe(() => {
        this.closeModal();
        this.refreshTrigger.next();
      });
    }
  }

  deleteUser(user: SystemUser) {
    if (user.role === 'ROOT') {
      alert('Não é possível deletar usuários ROOT preventivamente por esta interface para evitar logout acidental.');
      return;
    }
    if (confirm(`Tem certeza que deseja deletar permanentemente o usuário ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe(() => this.refreshTrigger.next());
    }
  }

  toggleBlock(user: SystemUser) {
    if (user.role === 'ROOT') {
      alert('Contas ROOT não podem ser bloqueadas!');
      return;
    }
    this.userService.toggleBlock(user.id).subscribe(() => this.refreshTrigger.next());
  }
}
