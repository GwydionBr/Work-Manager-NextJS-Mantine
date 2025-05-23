"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select } from "@mantine/core";
import { roundingAmounts, roundingModes } from "@/constants/settings";

import { RoundingAmount, RoundingDirection } from "@/types/settings.types";

export default function SelectDefaultUnits() {
  const { roundingAmount, roundingMode, setRoundingAmount, setRoundingMode } =
    useSettingsStore();

  return (
    <Group>
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
