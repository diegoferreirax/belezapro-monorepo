import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Expense, ExpenseCategory } from '../../../../core/models/salon.models';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './expense-modal.html'
})
export class ExpenseModalComponent implements OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() expense: Expense | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Omit<Expense, 'id'>>();

  categories = Object.values(ExpenseCategory);

  expenseForm = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [this.getLocalDateString(), [Validators.required]],
    category: [ExpenseCategory.OTHER, [Validators.required]],
    isPaid: [false]
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      if (this.expense) {
        this.expenseForm.patchValue(this.expense);
      } else {
        this.expenseForm.reset({
          description: '',
          amount: 0,
          date: this.getLocalDateString(),
          category: ExpenseCategory.OTHER,
          isPaid: false
        });
      }
    }
  }

  private getLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  closeModal() {
    this.closed.emit();
  }

  saveExpense() {
    if (this.expenseForm.invalid) return;
    const formValue = this.expenseForm.value as Omit<Expense, 'id'>;
    this.saved.emit(formValue);
  }
}
