"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  getRoundingInTimeFragments,
  getRoundingModes,
} from "@/constants/settings";

import {
  Group,
  Select,
  NumberInput,
  Button,
  Stack,
  Switch,
  Collapse,
  Transition,
} from "@mantine/core";

import { RoundingDirection } from "@/types/settings.types";

export default function RoundingSettings() {
  const {
    locale,
    timerRoundingSettings,
    setRoundingInterval,
    setRoundingDirection,
    setRoundInTimeFragments,
    setTimeFragmentInterval,
  } = useSettingsStore();

  const [roundingIntervalState, setRoundingIntervalState] = useState(
    timerRoundingSettings.roundingInterval
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRoundingIntervalState(timerRoundingSettings.roundingInterval);
  }, [timerRoundingSettings.roundingInterval]);

  async function handleCustomSubmit() {
    setLoading(true);
    await setRoundingInterval(roundingIntervalState);
    setLoading(false);
  }

  const roundingInTimeSections = getRoundingInTimeFragments(locale);
  const roundingModes = getRoundingModes(locale);

  return (
    <Stack>
      <Switch
        label={
          locale === "de-DE"
            ? "Runden in Zeitabschnitten"
            : "Round in time fragments"
        }
        checked={timerRoundingSettings.roundInTimeFragments}
        onChange={(event) =>
          setRoundInTimeFragments(event.currentTarget.checked)
        }
      />
      <Collapse in={!timerRoundingSettings.roundInTimeFragments}>
        <Group>
          <NumberInput
            label={
              locale === "de-DE" ? "Rundungsintervall" : "Rounding interval"
            }
            suffix={locale === "de-DE" ? " Minuten" : " minutes"}
            allowNegative={false}
            allowDecimal={false}
            allowLeadingZeros={false}
            value={roundingIntervalState}
            onChange={(value) => setRoundingIntervalState(Number(value))}
          />
          <Select
            w={125}
            label={locale === "de-DE" ? "Rundungsmodus" : "Rounding mode"}
            data={roundingModes}
            value={timerRoundingSettings.roundingDirection}
            onChange={(value) => setRoundingDirection(value as RoundingDirection)}
          />
          <Transition
            mounted={
              roundingIntervalState !== timerRoundingSettings.roundingInterval
            }
            transition="fade-right"
          >
            {(styles) => (
              <Button
                onClick={handleCustomSubmit}
                loading={loading}
                disabled={loading}
                style={{ ...styles }}
              >
                {locale === "de-DE" ? "Speichern" : "Save"}
              </Button>
            )}
          </Transition>
        </Group>
      </Collapse>
      <Collapse in={timerRoundingSettings.roundInTimeFragments}>
        <Group>
          <Select
            w={200}
            data={roundingInTimeSections}
            label={
              locale === "de-DE"
                ? "Zeitabschnittsintervall"
                : "Time Fragment Interval"
            }
            placeholder={
              locale === "de-DE"
                ? "Intervall auswählen"
                : "Select Default Rounding Amount"
            }
            value={timerRoundingSettings.timeFragmentInterval.toString()}
            onChange={(value) => setTimeFragmentInterval(Number(value))}
          />
        </Group>
      </Collapse>
    </Stack>
  );
}
