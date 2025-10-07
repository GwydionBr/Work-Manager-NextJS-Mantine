import { useQuery } from "@tanstack/react-query";
import { getAllSingleCashFlows } from "@/actions/finance/singleCashflow/get-all-single-cashflows";

export default function useSingleCashflowQuery() {
  return useQuery({
    queryKey: ["singleCashFlows"],
    queryFn: () => getAllSingleCashFlows(),
  });
}
