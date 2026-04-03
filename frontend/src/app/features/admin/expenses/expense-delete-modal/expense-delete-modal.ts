import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Expense } from '../../../../core/models/salon.models';

@Component({
  selector: 'app-expense-delete-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './expense-delete-modal.html'
})
export class ExpenseDeleteModalComponent {
  @Input() isOpen = false;
  @Input() expense: Expense | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  closeModal() {
    this.closed.emit();
  }

  confirmDelete() {
    this.confirmed.emit();
  }
}
