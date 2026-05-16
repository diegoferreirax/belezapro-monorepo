import type { Expense } from '@/src/types/salon.models';

export type ExpenseTotals = {
  total: number;
  paid: number;
  pending: number;
};

export function calculateExpenseTotals(expenses: Expense[]): ExpenseTotals {
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
