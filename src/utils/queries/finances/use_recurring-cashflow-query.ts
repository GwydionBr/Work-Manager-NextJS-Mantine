import { useQuery } from "@tanstack/react-query";
import { getAllRecurringCashFlows } from "@/actions/finance/recurringCashflow/get-all-recurring-cashflows";

export default function useRecurringCashflowQuery() {
  return useQuery({
    queryKey: ["recurringCashFlows"],
    queryFn: () => getAllRecurringCashFlows(),
  });
}
