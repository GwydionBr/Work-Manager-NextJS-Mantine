"use client";

import { useFinanceStore } from "@/stores/financeStore";

import { Center, Loader, ScrollArea } from "@mantine/core";
import FinancesTab from "@/components/Finances/FinanceTabs";

export default function FinancesPage() {
  const { isFetching } = useFinanceStore();

  return (
    <ScrollArea px="xl" h="100vh" type="scroll">
      {isFetching ? (
        <Center h="100vh">
          <Loader />
        </Center>
      ) : (
        <FinancesTab />
      )}
    </ScrollArea>
  );
}
