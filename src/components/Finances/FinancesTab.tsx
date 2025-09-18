"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Tabs, Text } from "@mantine/core";
import {
  IconReload,
  IconCircleDashedNumber1,
  IconBriefcase,
  IconPresentationAnalytics,
} from "@tabler/icons-react";
import FinanceOverview from "@/components/Finances/Overview/FinanceOverview";
import FinanceRecurring from "@/components/Finances/CashFlow/Recurring/FinanceRecurring";
import FinanceSingle from "@/components/Finances/CashFlow/Single/FinanceSingle";
import FinanceProjects from "@/components/Finances/Project/FinanceProjects";
import { FinanceTab } from "@/types/finance.types";

export default function FinancesTab() {
  const { locale } = useSettingsStore();
  const { singleCashFlows, recurringCashFlows, activeTab, setActiveTab } =
    useFinanceStore();

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
    <Tabs
      defaultValue={activeTab}
      w="100%"
      value={activeTab}
      onChange={(value) => setActiveTab(value as FinanceTab)}
    >
      <Tabs.List grow mb="xl">
        <Tabs.Tab
          leftSection={
            <IconPresentationAnalytics color="light-dark(blue, cyan)" />
          }
          value="Analysis"
        >
          {locale === "de-DE" ? "Analyse" : "Analysis"}
        </Tabs.Tab>
        <Tabs.Tab
          value="Projects"
          leftSection={<IconBriefcase color="light-dark(blue, cyan)" />}
        >
          {locale === "de-DE" ? "Projekte" : "Projects"}
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

      <Tabs.Panel value="Analysis">
        <FinanceOverview />
      </Tabs.Panel>
      <Tabs.Panel value="Projects">
        <FinanceProjects />
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
