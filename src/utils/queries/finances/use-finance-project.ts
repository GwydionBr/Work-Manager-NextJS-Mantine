"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllFinanceProjects } from "@/actions/finance/financeProject/get-all-finance-projects";

export function useFinanceProjectQuery() {
  return useQuery({
    queryKey: ["financeProjects"],
    queryFn: () => getAllFinanceProjects(),
  });
}