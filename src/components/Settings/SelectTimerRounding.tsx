"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Select, Text, NumberInput, Button } from "@mantine/core";
import { roundingAmounts, roundingModes } from "@/constants/settings";

import { RoundingAmount, RoundingDirection } from "@/types/settings.types";

import classes from "./Settings.module.css";

export default function SelectTimerRounding() {
  const {
    roundingAmount,
    roundingMode,
    setRoundingAmount,
    setRoundingMode,
    customRoundingAmount,
    setCustomRoundingAmount,
  } = useSettingsStore();

  const [customAmount, setCustomAmount] = useState(customRoundingAmount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCustomAmount(customRoundingAmount);
  }, [customRoundingAmount]);

  async function handleCustomSubmit() {
    setLoading(true);
    await setCustomRoundingAmount(customAmount);
    setLoading(false);
  }

  return (
    <Group>
      {customAmount !== customRoundingAmount && (
        <Button
          onClick={handleCustomSubmit}
          loading={loading}
          disabled={loading}
        >
          Submit
        </Button>
      )}
      {roundingAmount === "custom" && (
        <Group gap={5} className={classes.customRoundingAmountContainer}>
          <NumberInput
            w={75}
            allowNegative={false}
            allowDecimal={false}
            allowLeadingZeros={false}
            value={customAmount}
            onChange={(value) => setCustomAmount(Number(value))}
          />
          <Text>minutes</Text>
        </Group>
      )}
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
