import { Injectable, inject, signal } from '@angular/core';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { Expense } from '../models/salon.models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private repository = inject(LocalStorageRepository);
  private readonly STORAGE_KEY = 'salon_expenses';

  private expensesSignal = signal<Expense[]>([]);
  public readonly expenses = this.expensesSignal.asReadonly();

  constructor() {
    this.loadExpenses();
  }

  private loadExpenses(): void {
    const data = this.repository.get<Expense>(this.STORAGE_KEY);
    this.expensesSignal.set(data);
  }

  getExpenses(): Expense[] {
    return this.expensesSignal();
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID()
    };
    this.repository.add(this.STORAGE_KEY, newExpense);
    this.loadExpenses();
  }

  updateExpense(expense: Expense): void {
    this.repository.update(this.STORAGE_KEY, expense);
    this.loadExpenses();
  }

  deleteExpense(id: string): void {
    this.repository.delete(this.STORAGE_KEY, id);
    this.loadExpenses();
  }

  togglePaidStatus(id: string): void {
    const expense = this.expensesSignal().find(e => e.id === id);
    if (expense) {
      this.updateExpense({ ...expense, isPaid: !expense.isPaid });
    }
  }

  filterByMonth(month: number, year: number): Expense[] {
    return this.expensesSignal().filter(expense => {
      if (!expense.date) return false;
      const [y, m] = expense.date.split('-').map(Number);
      return m === month && y === year;
    });
  }

  calculateTotals(expenses: Expense[]) {
    return expenses.reduce((acc, curr) => {
      acc.total += curr.amount;
      if (curr.isPaid) {
        acc.paid += curr.amount;
      } else {
        acc.pending += curr.amount;
      }
      return acc;
    }, { total: 0, paid: 0, pending: 0 });
  }
}
