"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllBankAccounts } from "@/actions/finance/bankAccount/get-all-bank-accounts";

// Query to get all bank accounts
export function useBankAccountQuery() {
  return useQuery({
    queryKey: ["bankAccounts"],
    queryFn: () => getAllBankAccounts(),
  });
}