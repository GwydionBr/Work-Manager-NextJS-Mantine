"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

export default function FinanceDefaultSettings() {
  const {
    locale,
    defaultFinanceCurrency: financeCurrency,
    setDefaultFinanceCurrency: setFinanceCurrency,
  } = useSettingsStore();

  return (
    <Group>
      <Select
        data={currencies}
        label={locale === "de-DE" ? "Standard Finanzwährung" : "Default Finance Currency"}
        placeholder={locale === "de-DE" ? "Standard Finanzwährung auswählen" : "Select Finance Currency"}
        value={financeCurrency}
        onChange={(value) => setFinanceCurrency(value as Currency)}
      />
    </Group>
  );
}
