"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Center, Loader, ScrollArea } from "@mantine/core";
import FinancesTab from "@/components/Finances/FinancesTab";
import Header from "@/components/Header/Header";

export default function FinancesPage() {
  const { locale } = useSettingsStore();
  const { isFetching } = useFinanceStore();

  return (
    <ScrollArea px="xl" h="100vh" type="scroll">
      {/* <Header headerTitle={locale === "de-DE" ? "Finanzen" : "Finances"} /> */}
      {isFetching ? (
        <Center>
          <Loader />
        </Center>
      ) : (
        <FinancesTab />
      )}
    </ScrollArea>
  );
}
