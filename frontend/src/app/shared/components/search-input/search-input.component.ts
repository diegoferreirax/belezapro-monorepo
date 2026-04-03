import { Component, input, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="relative w-full sm:w-80">
      <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5 text-[20px]">search</mat-icon>
      
      @if (filterableFields(); as fields) {
        <div class="absolute left-10 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <mat-icon
            class="text-stone-300 w-4 h-4 text-[16px] cursor-help hover:text-stone-500 transition-colors"
            [title]="'Campos filtráveis: ' + getFormattedFields(fields)"
          >info</mat-icon>
        </div>
      }

      <input 
        type="text" 
        [formControl]="searchControl"
        [placeholder]="placeholder()"
        [class.pl-16]="filterableFields()"
        [class.pl-10]="!filterableFields()"
        class="w-full pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent transition-all"
      >
      @if (searchControl.value) {
        <button 
          (click)="clearSearch()"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <mat-icon class="w-4 h-4 text-[16px]">close</mat-icon>
        </button>
      }
    </div>
  `
})
export class SearchInputComponent implements OnInit, OnDestroy {
  placeholder = input<string>('Buscar...');
  filterableFields = input<string[]>();
  searchTerm = output<string>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  getFormattedFields(fields: string[]): string {
    return fields.join(', ');
  }

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm.emit(value || '');
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearSearch() {
    this.searchControl.setValue('');
  }
}
