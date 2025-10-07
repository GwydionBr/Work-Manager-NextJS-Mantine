import { useQuery } from "@tanstack/react-query";
import { getAllFinanceCategories } from "@/actions/finance/financeCategory/get-all-finance-categories";

export default function useFinanceCategoriesQuery() {
  return useQuery({
    queryKey: ["financeCategories"],
    queryFn: () => getAllFinanceCategories(),
  });
}
