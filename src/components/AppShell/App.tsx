"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Layout from "@/components/AppShell/AppShell";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 1000,
      gcTime: Infinity,
    },
  },
});

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <Layout>{children}</Layout>
        <ReactQueryDevtools initialIsOpen={false} />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
