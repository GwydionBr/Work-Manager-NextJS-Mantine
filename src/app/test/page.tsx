"use server";

import { getAllFinanceClients } from "@/actions/finance/financeClient/getAllFinanceClients";
import { getAllSingleCashFlows } from "@/actions/finance/singleCashflow/getAllSingleCashFlows";
import { getAllRecurringCashFlows } from "@/actions/finance/recurringCashflow/getAllRecurringCashflows";
import ClientComponent from "./clientComponent";

export default async function TestPage() {
  // const financeClients = await getAllFinanceClients();
  // const singleCashFlows = await getAllSingleCashFlows();
  // const recurringCashFlows = await getAllRecurringCashFlows();

  return (
    <ClientComponent
      // initalData={{
      //   financeClients: financeClients.data || [],
      //   singleCashFlows: singleCashFlows.data || [],
      //   recurringCashFlows: recurringCashFlows.data || [],
      // }}
    />
  );
}
