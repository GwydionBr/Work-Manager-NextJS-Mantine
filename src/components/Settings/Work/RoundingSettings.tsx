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
import {
  roundingAmounts,
  roundingInTimeSections,
  roundingModes,
} from "@/constants/settings";

import {
  RoundingAmount,
  RoundingDirection,
  RoundingInTimeSections,
} from "@/types/settings.types";

import classes from "./WorkSettings.module.css";

export default function RoundingSettings() {
  const {
    locale,
    roundingAmount,
    roundingMode,
    customRoundingAmount,
    roundInTimeFragments: roundInTimeSections,
    timeFragmentInterval: timeSectionInterval,
    setRoundingAmount,
    setRoundingMode,
    setCustomRoundingAmount,
    setRoundInTimeFragments: setRoundInTimeSections,
    setTimeFragmentInterval: setTimeSectionInterval,
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
              {locale === "de-DE" ? "Speichern" : "Save"}
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
              <Text>{locale === "de-DE" ? "Minuten" : "minutes"}</Text>
            </Group>
          )}
          <Select
            w={150}
            data={roundingAmounts}
            label={locale === "de-DE" ? "Rundungsbetrag" : "Rounding amount"}
            placeholder={
              locale === "de-DE"
                ? "Rundungsbetrag auswählen"
                : "Select Default Rounding Amount"
            }
            value={roundingAmount}
            onChange={(value) => setRoundingAmount(value as RoundingAmount)}
          />
          <Select
            w={125}
            label={locale === "de-DE" ? "Rundungsmodus" : "Rounding mode"}
            data={roundingModes}
            value={roundingMode}
            onChange={(value) => setRoundingMode(value as RoundingDirection)}
          />
        </Group>
      </Collapse>
      <Switch
        label={
          locale === "de-DE"
            ? "Runden in Zeitabschnitten"
            : "Round in time sections"
        }
        checked={roundInTimeSections}
        onChange={(event) =>
          setRoundInTimeSections(event.currentTarget.checked)
        }
      />
      <Collapse in={roundInTimeSections === true}>
        <Group>
          <Select
            w={200}
            data={roundingInTimeSections}
            label={
              locale === "de-DE"
                ? "Runden in Zeitabschnitten"
                : "Rounding in time fragments"
            }
            placeholder={
              locale === "de-DE"
                ? "Rundungsbetrag auswählen"
                : "Select Default Rounding Amount"
            }
            value={timeSectionInterval.toString()}
            onChange={(value) => setTimeSectionInterval(Number(value))}
          />
        </Group>
      </Collapse>
    </Stack>
  );
}
