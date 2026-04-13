import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, ExpenseCategory } from '../../../core/models/salon.models';
import { ExpenseModalComponent } from './expense-modal/expense-modal';
import { ExpenseDeleteModalComponent } from './expense-delete-modal/expense-delete-modal';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, MatIconModule, ExpenseModalComponent, ExpenseDeleteModalComponent],
  templateUrl: './expenses.html'
})
export class ExpensesComponent {
  private expenseService = inject(ExpenseService);

  ExpenseCategory = ExpenseCategory;

  currentMonth = signal(new Date().getMonth() + 1);
  currentYear = signal(new Date().getFullYear());

  months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  constructor() {
    effect(() => {
      const month = this.currentMonth();
      const year = this.currentYear();
      this.expenseService.loadExpenses(month, year);
    });
  }

  filteredExpenses = computed(() => this.expenseService.expenses());

  totals = computed(() => {
    return this.expenseService.calculateTotals(this.filteredExpenses());
  });

  isModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  editingExpense = signal<Expense | null>(null);
  expenseToDelete = signal<Expense | null>(null);

  openModal(expense?: Expense) {
    if (expense) {
      this.editingExpense.set(expense);
    } else {
      this.editingExpense.set(null);
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingExpense.set(null);
  }

  private reloadList() {
    this.expenseService.loadExpenses(this.currentMonth(), this.currentYear());
  }

  private httpErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return String((body as { message: string }).message);
    }
    return err.message;
  }

  onSaveExpense(formValue: Omit<Expense, 'id'>) {
    const editing = this.editingExpense();
    const req = editing
      ? this.expenseService.updateExpense({ ...editing, ...formValue })
      : this.expenseService.createExpense(formValue);

    req.subscribe({
      next: () => {
        this.closeModal();
        this.reloadList();
      },
      error: (err: HttpErrorResponse) => alert('Erro ao salvar despesa: ' + this.httpErrorMessage(err))
    });
  }

  togglePaid(id: string) {
    const exp = this.expenseService.expenses().find(e => e.id === id);
    if (!exp) return;
    this.expenseService.setPaid(id, !exp.isPaid).subscribe({
      next: () => this.reloadList(),
      error: (err: HttpErrorResponse) => alert('Erro ao atualizar status: ' + this.httpErrorMessage(err))
    });
  }

  openDeleteModal(expense: Expense) {
    this.expenseToDelete.set(expense);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.expenseToDelete.set(null);
  }

  confirmDelete() {
    const expense = this.expenseToDelete();
    if (!expense) return;
    this.expenseService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.reloadList();
      },
      error: (err: HttpErrorResponse) => alert('Erro ao excluir: ' + this.httpErrorMessage(err))
    });
  }

  changeMonth(event: Event) {
    const month = (event.target as HTMLSelectElement).value;
    const val = parseInt(month, 10);
    if (!isNaN(val)) {
      this.currentMonth.set(val);
    }
  }

  changeYear(event: Event) {
    const year = (event.target as HTMLSelectElement).value;
    const val = parseInt(year, 10);
    if (!isNaN(val)) {
      this.currentYear.set(val);
    }
  }
}
