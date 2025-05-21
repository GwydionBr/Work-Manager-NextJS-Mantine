import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

export default function SelectCurrencies() {
  const { currency, financeCurrency, setCurrency, setFinanceCurrency } = useSettingsStore();

  return (
    <Group>
      <Select
        data={currencies}
        label="Work Currency"
        placeholder="Select Work Currency"
        value={currency}
        onChange={(value) => setCurrency(value as Currency)}
      />
      <Select
        data={currencies}
        label="Finance Currency"
        placeholder="Select Finance Currency"
        value={financeCurrency}
        onChange={(value) => setFinanceCurrency(value as Currency)}
      />
    </Group>
  );
}
