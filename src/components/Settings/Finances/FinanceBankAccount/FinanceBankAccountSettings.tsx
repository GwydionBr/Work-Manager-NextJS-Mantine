"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Stack } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";
import FinanceSettingsHeader from "@/components/Settings/Finances/FinanceSettingsHeader";

export default function FinanceBankAccountSettings() {
  const { getLocalizedText } = useFormatter();
  return (
    <Stack>
      <FinanceSettingsHeader
        titleText={getLocalizedText("Bankkonten", "Bank Accounts")}
        titleIcon={<IconBuildingBank size={20} />}
      />
    </Stack>
  );
}
