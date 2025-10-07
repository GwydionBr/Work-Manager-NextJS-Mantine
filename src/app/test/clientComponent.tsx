"use client";

import { useQuery } from "@tanstack/react-query";

import { Stack, Text } from "@mantine/core";

import { getAllFinanceClients } from "@/actions/finance/financeClient/get-all-finance-clients";
import { getAllSingleCashFlows } from "@/actions/finance/singleCashflow/get-all-single-cashflows";
import { getAllRecurringCashFlows } from "@/actions/finance/recurringCashflow/get-all-recurring-cashflows";

interface ClientComponentProps {
  // initalData: {
  //   financeClients: Tables<"finance_client">[];
  //   singleCashFlows: StoreSingleCashFlow[];
  //   recurringCashFlows: StoreRecurringCashFlow[];
  // };
}

export default function ClientComponent({  }: ClientComponentProps) {
  const { data: financeClients, isPending: isFinanceClientsPending } = useQuery({
    queryKey: ["financeClients"],
    queryFn: () => getAllFinanceClients(),
  });
  const { data: singleCashFlows, isPending: isSingleCashFlowsPending } = useQuery({
    queryKey: ["singleCashFlows"],
    queryFn: () => getAllSingleCashFlows(),
  });
  const { data: recurringCashFlows, isPending: isRecurringCashFlowsPending } = useQuery({
    queryKey: ["recurringCashFlows"],
    queryFn: () => getAllRecurringCashFlows(),
  });


  return (
    <Stack>
      <Text>Finance Clients</Text>
      <Text>{isFinanceClientsPending ? "Loading..." : financeClients?.map((client) => client.name).join(", ")}</Text>
      <Text>Single Cash Flows</Text>
      <Text>{isSingleCashFlowsPending ? "Loading..." : singleCashFlows?.map((flow) => flow.title).join(", ")}</Text>
      <Text>Recurring Cash Flows</Text>
      <Text>{isRecurringCashFlowsPending ? "Loading..." : recurringCashFlows?.map((flow) => flow.title).join(", ")}</Text>
    </Stack>
  );
}
