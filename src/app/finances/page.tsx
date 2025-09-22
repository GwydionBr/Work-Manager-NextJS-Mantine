"use client";

import { ScrollArea } from "@mantine/core";
import FinancesTab from "@/components/Finances/FinanceTabs";

export default function FinancesPage() {
  return (
    <ScrollArea px="xl" h="100vh" type="scroll">
      <FinancesTab />
    </ScrollArea>
  );
}
