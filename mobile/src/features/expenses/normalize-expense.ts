import type { Expense } from '@/src/types/salon.models';

export function normalizeExpense(row: Expense & { paid?: boolean }): Expense {
  const isPaid = row.isPaid === true || row.paid === true;
  return { ...row, isPaid };
}
