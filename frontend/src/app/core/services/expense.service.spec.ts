import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExpenseService } from './expense.service';
import { ExpenseCategory, Expense } from '../models/salon.models';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let httpMock: HttpTestingController;

  const mockExpenses: Expense[] = [
    { id: '1', description: 'Esmaltes', amount: 100, date: '2026-03-01', category: ExpenseCategory.MATERIALS, isPaid: true },
    { id: '2', description: 'Aluguel', amount: 1500, date: '2026-03-05', category: ExpenseCategory.RENT, isPaid: false },
    { id: '3', description: 'Luz', amount: 200, date: '2026-03-10', category: ExpenseCategory.UTILITIES, isPaid: false },
    { id: '4', description: 'Marketing', amount: 300, date: '2026-02-28', category: ExpenseCategory.MARKETING, isPaid: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ExpenseService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ExpenseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loadExpenses deve buscar com month e year', () => {
    service.loadExpenses(3, 2026);
    const req = httpMock.expectOne(r => r.method === 'GET' && r.url.includes('/expenses'));
    expect(req.request.params.get('month')).toBe('3');
    expect(req.request.params.get('year')).toBe('2026');
    req.flush(mockExpenses);
    expect(service.expenses().length).toBe(4);
  });

  it('deve filtrar despesas por mês e ano corretamente', () => {
    service.loadExpenses(3, 2026);
    httpMock.expectOne(() => true).flush(mockExpenses);
    const march2026 = service.filterByMonth(3, 2026);
    expect(march2026.length).toBe(3);
    expect(march2026.every(e => e.date.startsWith('2026-03'))).toBe(true);
  });

  it('deve calcular totais corretamente', () => {
    const marchExpenses = mockExpenses.filter(e => e.date.startsWith('2026-03'));
    const totals = service.calculateTotals(marchExpenses);

    expect(totals.total).toBe(1800);
    expect(totals.paid).toBe(100);
    expect(totals.pending).toBe(1700);
  });

  it('deve retornar totais zerados para lista vazia', () => {
    const totals = service.calculateTotals([]);
    expect(totals.total).toBe(0);
    expect(totals.paid).toBe(0);
    expect(totals.pending).toBe(0);
  });
});
