import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex items-center justify-between border-t border-stone-100 px-4 py-3 sm:px-6 bg-white">
      <div class="flex flex-1 justify-between sm:hidden">
        <button 
          (click)="onPrevious()"
          [disabled]="currentPage() === 1"
          class="relative inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Anterior
        </button>
        <button 
          (click)="onNext()"
          [disabled]="currentPage() === totalPages() || totalPages() === 0"
          class="relative ml-3 inline-flex items-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed">
          Próxima
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <p class="text-sm text-stone-700">
            Mostrando
            <span class="font-medium">{{ startIndex() }}</span>
            até
            <span class="font-medium">{{ endIndex() }}</span>
            de
            <span class="font-medium">{{ totalItems() }}</span>
            resultados
          </p>
          
          <div class="flex items-center gap-2 ml-4 border-l border-stone-100 pl-4">
            <label for="pageSize" class="text-xs font-medium text-stone-400 uppercase tracking-wider">Itens:</label>
            <select 
              id="pageSize"
              [value]="pageSize()"
              (change)="onPageSizeChange($event)"
              class="text-sm font-medium text-stone-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-stone-900 transition-colors">
              <option [value]="10">10</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button 
              (click)="onPrevious()"
              [disabled]="currentPage() === 1"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-stone-400 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Anterior</span>
              <mat-icon class="h-5 w-5 text-[20px]">chevron_left</mat-icon>
            </button>
            
            <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-stone-900 ring-1 ring-inset ring-stone-300 focus:outline-offset-0">
              Página {{ currentPage() }} de {{ totalPages() || 1 }}
            </span>
            
            <button 
              (click)="onNext()"
              [disabled]="currentPage() === totalPages() || totalPages() === 0"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-stone-400 ring-1 ring-inset ring-stone-300 hover:bg-stone-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <span class="sr-only">Próxima</span>
              <mat-icon class="h-5 w-5 text-[20px]">chevron_right</mat-icon>
            </button>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalItems = input.required<number>();
  pageSize = input.required<number>();
  
  pageChange = output<number>();
  pageSizeChange = output<number>();

  startIndex() {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  endIndex() {
    const end = this.currentPage() * this.pageSize();
    return end > this.totalItems() ? this.totalItems() : end;
  }

  onPrevious() {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  onNext() {
    if (this.currentPage() < this.totalPages()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.pageSizeChange.emit(Number(select.value));
  }
}
