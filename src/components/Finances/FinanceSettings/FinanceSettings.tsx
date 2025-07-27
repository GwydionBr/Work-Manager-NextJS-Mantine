"use client";

import { useState } from "react";

import { Grid, Group, Text } from "@mantine/core";
import SettingsNavbar from "@/components/Navbar/SettingsNavbar";
import FinanceCategorySettings from "./FinanceCategorySettings";
import Conditional from "./Conditional";

enum FinanceSettingType {
  CATEGORIES = "categories",
  CONDITIONAL_CASH_FLOWS = "conditional_cash_flows",
  OTHER = "other",
}

export default function FinanceSettings({ onClose }: { onClose: () => void }) {
  const [activeSetting, setActiveSetting] = useState<FinanceSettingType>(
    FinanceSettingType.CATEGORIES
  );

  return (
    <Grid align="flex-start" h="100%" w="100%">
      <Grid.Col span={{ base: 4, sm: 3, lg: 2 }}>
        <SettingsNavbar
          items={[
            {
              title: "Categories",
              onClick: () => setActiveSetting(FinanceSettingType.CATEGORIES),
            },
            {
              title: "Conditional",
              onClick: () =>
                setActiveSetting(FinanceSettingType.CONDITIONAL_CASH_FLOWS),
            },
            {
              title: "Other",
              onClick: () => setActiveSetting(FinanceSettingType.OTHER),
            },
          ]}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 8, sm: 9, lg: 10 }}>
        {activeSetting === FinanceSettingType.CATEGORIES && (
          <FinanceCategorySettings />
        )}
        {activeSetting === FinanceSettingType.CONDITIONAL_CASH_FLOWS && (
          <Conditional />
        )}
      </Grid.Col>
    </Grid>
  );
}
