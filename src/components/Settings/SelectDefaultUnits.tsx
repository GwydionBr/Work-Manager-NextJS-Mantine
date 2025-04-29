"use client";

import { Group, Select } from "@mantine/core";
import {
  currencies,
  roundingAmounts,
  roundingModes,
} from "@/constants/settings";
import useSettingsStore from "@/stores/settingsStore";
import {
  Currency,
  RoundingAmount,
  RoundingDirection,
} from "@/types/settings.types";

export default function SelectDefaultUnits() {
  const {
    currency,
    roundingAmount,
    roundingMode,
    setCurrency,
    setRoundingAmount,
    setRoundingMode,
  } = useSettingsStore();

  return (
    <Group>
      <Select
        data={currencies}
        label="Currency"
        placeholder="Select Currency"
        value={currency}
        onChange={(value) => setCurrency(value as Currency)}
      />
      <Select
        w={150}
        data={roundingAmounts}
        label="Rounding amount"
        placeholder="Select Default Rounding Amount"
        value={roundingAmount}
        onChange={(value) => setRoundingAmount(value as RoundingAmount)}
      />
      <Select
        w={125}
        label="Rounding mode"
        data={roundingModes}
        value={roundingMode}
        onChange={(value) => setRoundingMode(value as RoundingDirection)}
      />
    </Group>
  );
}
