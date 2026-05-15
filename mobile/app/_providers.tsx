import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { queryClient } from '@/src/api/query-client';

type Props = {
  readonly children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
