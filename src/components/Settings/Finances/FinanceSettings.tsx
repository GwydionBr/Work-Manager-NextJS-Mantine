"use client";

import { useState } from "react";
import { Grid } from "@mantine/core";
import SettingsNavbar from "@/components/Navbar/SettingsNavbar";
import FinanceCategorySettings from "./FinanceCategorySettings";
import FinanceRuleSettings from "./FinanceRuleSettings";
import FinanceDefaultSettings from "./FinanceDefaultSettings";

enum FinanceSettingType {
  DEFAULT = "default",
  CATEGORIES = "categories",
  RULES = "rules",
}

export default function FinanceSettings() {
  const [activeSetting, setActiveSetting] = useState<FinanceSettingType>(
    FinanceSettingType.DEFAULT
  );

  return (
    <Grid align="flex-start" h="100%" w="100%">
      <Grid.Col span={{ base: 4, sm: 3, lg: 2 }}>
        <SettingsNavbar
          items={[
            {
              title: "Default",
              onClick: () => setActiveSetting(FinanceSettingType.DEFAULT),
            },
            {
              title: "Categories",
              onClick: () => setActiveSetting(FinanceSettingType.CATEGORIES),
            },
            {
              title: "Rules",
              onClick: () => setActiveSetting(FinanceSettingType.RULES),
            },
          ]}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 8, sm: 9, lg: 10 }} h="100%">
        {activeSetting === FinanceSettingType.DEFAULT && (
          <FinanceDefaultSettings />
        )}
        {activeSetting === FinanceSettingType.CATEGORIES && (
          <FinanceCategorySettings />
        )}
        {activeSetting === FinanceSettingType.RULES && (
          <FinanceRuleSettings />
        )}
      </Grid.Col>
    </Grid>
  );
}
