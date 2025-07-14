"use client";

import { useState } from "react";

import { Group } from "@mantine/core";
import SettingsNavbar from "@/components/Navbar/SettingsNavbar";
import FinanceCategorySettings from "./FinanceCategorySettings";

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
    <Group align="flex-start" h="100%" wrap="nowrap" w="100%">
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
      {activeSetting === FinanceSettingType.CATEGORIES && (
        <FinanceCategorySettings />
      )}
    </Group>
  );
}
