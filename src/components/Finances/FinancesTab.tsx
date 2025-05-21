"use client";

import { Tabs } from "@mantine/core";
import {
  IconReload,
  IconCircleDashedNumber1,
  IconMenuDeep,
} from "@tabler/icons-react";
import FinanceOverview from "./Overview/FinanceOverview";
import FinanceRecurring from "./Recurring/FinanceRecurring";
import FinanceSingle from "./Single/FinanceSingle";

export default function FinancesTab() {
  return (
    <Tabs defaultValue="Overview" w="100%">
      <Tabs.List grow my="xl">
        <Tabs.Tab leftSection={<IconMenuDeep />} value="Overview">
          Overview
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconCircleDashedNumber1 />} value="Single">
          Single
        </Tabs.Tab>
        <Tabs.Tab leftSection={<IconReload />} value="Recurring">
          Recurring
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
