"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllFinanceClients } from "@/actions/finance/financeClient/get-all-finance-clients";

// 
export function useFinanceClientQuery() {
  return useQuery({
    queryKey: ["financeClients"],
    queryFn: () => getAllFinanceClients(),
  });
}

