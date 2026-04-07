import { Injectable, inject, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Expense } from '../models/salon.models';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiService = inject(ApiService);

  private expensesSignal = signal<Expense[]>([]);
  public readonly expenses = this.expensesSignal.asReadonly();

  clearTenantCache(): void {
    this.expensesSignal.set([]);
  }

  loadExpenses(month: number, year: number): void {
    const params = new HttpParams().set('month', month).set('year', year);
    this.apiService.get<Expense[]>('/expenses', { params }).subscribe({
      next: (data) =>
        this.expensesSignal.set(
          (data ?? []).map((row) => this.normalizeExpense(row as Expense & { paid?: boolean }))
        ),
      error: () => {
        console.error('Erro ao carregar despesas.');
        this.expensesSignal.set([]);
      }
    });
  }

  createExpense(body: Omit<Expense, 'id'>): Observable<Expense> {
    return this.apiService.post<Expense>('/expenses', body);
  }

  updateExpense(expense: Expense): Observable<Expense> {
    const { id, ...fields } = expense;
    return this.apiService.put<Expense>(`/expenses/${id}`, fields);
  }

  deleteExpense(id: string): Observable<void> {
    return this.apiService.delete<void>(`/expenses/${id}`);
  }

  setPaid(id: string, paid: boolean): Observable<Expense> {
    return this.apiService.patch<Expense>(`/expenses/${id}/paid`, { paid });
  }

  /** Jackson/Lombok às vezes enviam `paid` em vez de `isPaid` no JSON. */
  private normalizeExpense(row: Expense & { paid?: boolean }): Expense {
    const isPaid = row.isPaid === true || row.paid === true;
    return { ...row, isPaid };
  }

  filterByMonth(month: number, year: number): Expense[] {
    return this.expensesSignal().filter(expense => {
      if (!expense.date) return false;
      const [y, m] = expense.date.split('-').map(Number);
      return m === month && y === year;
    });
  }

  calculateTotals(expenses: Expense[]) {
    return expenses.reduce(
      (acc, curr) => {
        acc.total += curr.amount;
        if (curr.isPaid) {
          acc.paid += curr.amount;
        } else {
          acc.pending += curr.amount;
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }
}
