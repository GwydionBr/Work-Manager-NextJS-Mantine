"use client";

import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Tabs, Text } from "@mantine/core";
import {
  IconReload,
  IconCircleDashedNumber1,
  IconBriefcase,
  IconPresentationAnalytics,
  IconBrandCashapp,
} from "@tabler/icons-react";
import FinanceOverviewTab from "@/components/Finances/Overview/FinanceOverviewTab";
import FinanceRecurringTab from "@/components/Finances/CashFlow/Recurring/FinanceRecurringTab";
import FinanceSingleTab from "@/components/Finances/CashFlow/Single/FinanceSingleTab";
import FinanceProjectTab from "@/components/Finances/Project/FinanceProjectsTab";
import { FinanceTab } from "@/types/finance.types";
import PayoutTab from "./Payout/PayoutTab";

export default function FinanceTabs() {
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
      <Tabs.List
        grow
        mb="xl"
        pos="sticky"
        top={0}
        bg="var(--mantine-color-body)"
        style={{ zIndex: 100 }}
      >
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
        <Tabs.Tab
          value="Projects"
          leftSection={<IconBriefcase color="light-dark(blue, cyan)" />}
        >
          {locale === "de-DE" ? "Projekte" : "Projects"}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={<IconBrandCashapp color="light-dark(blue, cyan)" />}
          value="Payout"
        >
          {locale === "de-DE" ? "Auszahlung" : "Payout"}
        </Tabs.Tab>
        <Tabs.Tab
          leftSection={
            <IconPresentationAnalytics color="light-dark(blue, cyan)" />
          }
          value="Analysis"
        >
          {locale === "de-DE" ? "Analyse" : "Analysis"}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="Projects">
        <FinanceProjectTab />
      </Tabs.Panel>
      <Tabs.Panel value="Single">
        <FinanceSingleTab />
      </Tabs.Panel>
      <Tabs.Panel value="Recurring">
        <FinanceRecurringTab />
      </Tabs.Panel>
      <Tabs.Panel value="Payout">
        <PayoutTab />
      </Tabs.Panel>
      <Tabs.Panel value="Analysis">
        <FinanceOverviewTab />
      </Tabs.Panel>
    </Tabs>
  );
}
