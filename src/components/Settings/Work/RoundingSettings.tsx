"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Group,
  Select,
  Text,
  NumberInput,
  Button,
  Stack,
  Switch,
  Collapse,
} from "@mantine/core";
import { roundingAmounts, roundingInTimeSections, roundingModes } from "@/constants/settings";

import { RoundingAmount, RoundingDirection, RoundingInTimeSections } from "@/types/settings.types";

import classes from "./WorkSettings.module.css";

export default function RoundingSettings() {
  const {
    roundingAmount,
    roundingMode,
    customRoundingAmount,
    roundInTimeSections,
    timeSectionInterval,
    setRoundingAmount,
    setRoundingMode,
    setCustomRoundingAmount,
    setRoundInTimeSections,
    setTimeSectionInterval,
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
    <Stack>
      <Collapse in={roundInTimeSections === false}>
        <Group>
          {customAmount !== customRoundingAmount && (
            <Button
              onClick={handleCustomSubmit}
              loading={loading}
              disabled={loading}
            >
              Save
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
      </Collapse>
      <Switch
        label="Round in time sections"
        checked={roundInTimeSections}
        onChange={(event) =>
          setRoundInTimeSections(event.currentTarget.checked)
        }
      />
      <Collapse in={roundInTimeSections === true}>
        <Select
          w={150}
          data={roundingInTimeSections}
          label="Rounding in time sections"
          placeholder="Select Default Rounding Amount"
          value={timeSectionInterval}
          onChange={(value) => setTimeSectionInterval(value as RoundingInTimeSections)}
        />
      </Collapse>
    </Stack>
  );
}
