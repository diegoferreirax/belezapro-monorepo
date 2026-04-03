import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpenseService } from './expense.service';
import { LocalStorageRepository } from '../repositories/local-storage.repository';
import { ExpenseCategory, Expense } from '../models/salon.models';
import { TestBed } from '@angular/core/testing';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let repository: LocalStorageRepository;

  const mockExpenses: Expense[] = [
    { id: '1', description: 'Esmaltes', amount: 100, date: '2026-03-01', category: ExpenseCategory.MATERIALS, isPaid: true },
    { id: '2', description: 'Aluguel', amount: 1500, date: '2026-03-05', category: ExpenseCategory.RENT, isPaid: false },
    { id: '3', description: 'Luz', amount: 200, date: '2026-03-10', category: ExpenseCategory.UTILITIES, isPaid: false },
    { id: '4', description: 'Marketing', amount: 300, date: '2026-02-28', category: ExpenseCategory.MARKETING, isPaid: true }, // Mês anterior
  ];

  beforeEach(() => {
    const repositoryMock = {
      get: vi.fn().mockReturnValue(mockExpenses),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      save: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ExpenseService,
        { provide: LocalStorageRepository, useValue: repositoryMock }
      ]
    });

    service = TestBed.inject(ExpenseService);
    repository = TestBed.inject(LocalStorageRepository);
  });

  it('deve carregar despesas ao inicializar', () => {
    expect(service.getExpenses()).toEqual(mockExpenses);
    expect(repository.get).toHaveBeenCalledWith('salon_expenses');
  });

  it('deve filtrar despesas por mês e ano corretamente', () => {
    const march2026 = service.filterByMonth(3, 2026);
    expect(march2026.length).toBe(3);
    expect(march2026.every(e => e.date.startsWith('2026-03'))).toBe(true);
  });

  it('deve calcular totais corretamente', () => {
    const marchExpenses = service.filterByMonth(3, 2026);
    const totals = service.calculateTotals(marchExpenses);

    expect(totals.total).toBe(1800); // 100 + 1500 + 200
    expect(totals.paid).toBe(100);
    expect(totals.pending).toBe(1700);
  });

  it('deve alternar o status de pagamento de uma despesa', () => {
    const expenseId = '2';
    service.togglePaidStatus(expenseId);

    expect(repository.update).toHaveBeenCalledWith('salon_expenses', expect.objectContaining({
      id: expenseId,
      isPaid: true
    }));
  });

  it('deve retornar totais zerados para lista vazia', () => {
    const totals = service.calculateTotals([]);
    expect(totals.total).toBe(0);
    expect(totals.paid).toBe(0);
    expect(totals.pending).toBe(0);
  });
});
