"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Tabs, Text } from "@mantine/core";
import {
  IconReload,
  IconCircleDashedNumber1,
  IconMenuDeep,
} from "@tabler/icons-react";
import FinanceOverview from "./Overview/FinanceOverview";
import FinanceRecurring from "./Recurring/FinanceRecurring";
import FinanceSingle from "./Single/FinanceSingle";

export default function FinancesTab() {
  const { locale } = useSettingsStore();
  const { singleCashFlows, recurringCashFlows } = useFinanceStore();

  if (singleCashFlows.length === 0 && recurringCashFlows.length === 0) {
    return (
      <Box>
        <Text>
          {locale === "de-DE"
            ? "Bitte fügen Sie einige Daten hinzu, um die Diagramme anzuzeigen"
            : "Please insert some data to see the charts"}
        </Text>
      </Box>
    );
  }

  return (
    <Tabs defaultValue="Overview" w="100%">
      <Tabs.List grow my="xl">
        <Tabs.Tab
          leftSection={<IconMenuDeep color="light-dark(blue, cyan)" />}
          value="Overview"
        >
          {locale === "de-DE" ? "Übersicht" : "Overview"}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={
            <IconCircleDashedNumber1 color="light-dark(blue, cyan)" />
          }
          value="Single"
        >
          {locale === "de-DE" ? "Einzel" : "Single"}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={<IconReload color="light-dark(blue, cyan) " />}
          value="Recurring"
        >
          {locale === "de-DE" ? "Wiederkehrend" : "Recurring"}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="Overview">
        <FinanceOverview />
      </Tabs.Panel>
      <Tabs.Panel value="Single">
        <FinanceSingle />
      </Tabs.Panel>
      <Tabs.Panel value="Recurring">
        <FinanceRecurring />
      </Tabs.Panel>
    </Tabs>
  );
}
