import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiRequest } from '@/src/api/client';
import { normalizeExpense } from '@/src/features/expenses/normalize-expense';
import type { Expense } from '@/src/types/salon.models';

export const expensesRootKey = 'expenses' as const;

export function expensesQueryKey(month: number, year: number) {
  return [expensesRootKey, month, year] as const;
}

export type ExpenseWriteBody = Omit<Expense, 'id'>;

export function useExpensesQuery(month: number, year: number) {
  return useQuery({
    queryKey: expensesQueryKey(month, year),
    queryFn: async () => {
      const rows = await apiRequest<Expense[]>('/expenses', {
        query: { month, year },
      });
      return (rows ?? []).map((row) => normalizeExpense(row as Expense & { paid?: boolean }));
    },
  });
}

export function useCreateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ExpenseWriteBody) =>
      apiRequest<Expense>('/expenses', {
        method: 'POST',
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [expensesRootKey] }),
  });
}

export function useUpdateExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expense: Expense) => {
      const { id, ...body } = expense;
      return apiRequest<Expense>(`/expenses/${id}`, {
        method: 'PUT',
        body,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [expensesRootKey] }),
  });
}

export function useDeleteExpenseMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/expenses/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [expensesRootKey] }),
  });
}

export function useSetExpensePaidMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paid }: { id: string; paid: boolean }) =>
      apiRequest<Expense>(`/expenses/${id}/paid`, {
        method: 'PATCH',
        body: { paid },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [expensesRootKey] }),
  });
}
