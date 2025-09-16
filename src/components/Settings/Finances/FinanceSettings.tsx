"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Grid } from "@mantine/core";
import SettingsNavbar from "@/components/Navbar/SettingsNavbar";
import FinanceCategorySettings from "./FinanceCategory/FinanceCategorySettings";
import FinanceRuleSettings from "./FinanceRuleSettings";
import FinanceDefaultSettings from "./FinanceDefaultSettings";
import FinanceClientSettings from "./FinanceClient/FinanceClientSettings";
import { IconCategory, IconUsers } from "@tabler/icons-react";

enum FinanceSettingType {
  DEFAULT = "default",
  CATEGORIES = "categories",
  RULES = "rules",
  CLIENTS = "clients",
}

export default function FinanceSettings() {
  const { locale } = useSettingsStore();
  const [activeSetting, setActiveSetting] = useState<FinanceSettingType>(
    FinanceSettingType.DEFAULT
  );

  return (
    <Grid align="flex-start" h="100%" w="100%">
      <Grid.Col
        span={{ base: 4, sm: 3, lg: 2 }}
        h="100%"
        style={{ position: "sticky", top: 60, zIndex: 100 }}
      >
        <SettingsNavbar
          items={[
            {
              title: locale === "de-DE" ? "Standard" : "Default",
              onClick: () => setActiveSetting(FinanceSettingType.DEFAULT),
              active: activeSetting === FinanceSettingType.DEFAULT,
            },
            {
              title: locale === "de-DE" ? "Kategorien" : "Categories",
              icon: <IconCategory size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.CATEGORIES),
              active: activeSetting === FinanceSettingType.CATEGORIES,
            },
            {
              title: locale === "de-DE" ? "Kunden" : "Clients",
              icon: <IconUsers size={20} />,
              onClick: () => setActiveSetting(FinanceSettingType.CLIENTS),
              active: activeSetting === FinanceSettingType.CLIENTS,
            },
            // {
            //   title: locale === "de-DE" ? "Regeln" : "Rules",
            //   onClick: () => setActiveSetting(FinanceSettingType.RULES),
            // },
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
        {activeSetting === FinanceSettingType.CLIENTS && (
          <FinanceClientSettings />
        )}
        {activeSetting === FinanceSettingType.RULES && <FinanceRuleSettings />}
      </Grid.Col>
    </Grid>
  );
}
