"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Radio, Select, Stack } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import SettingsRow from "../SettingsRow";

export default function FinanceDefaultSettings() {
  const {
    defaultFinanceCurrency: financeCurrency,
    setDefaultFinanceCurrency: setFinanceCurrency,
    showChangeCurrencyWindow,
    setShowChangeCurrencyWindow,
    getLocalizedText,
  } = useSettingsStore();

  const [showCCW, setShowCCW] = useState<"true" | "false" | "null">("null");

  const handleCCWChange = (value: string) => {
    setShowCCW(value as "true" | "false" | "null");
    setShowChangeCurrencyWindow(value === "null" ? null : value === "true");
  };

  return (
    <Stack w="100%">
      <SettingsRow
        title={getLocalizedText(
          "Default Finance Currency",
          "Default Finance Currency"
        )}
        children={
          <Select
            data={currencies}
            label={getLocalizedText("Finanzwährung", "Currency")}
            placeholder={getLocalizedText(
              "Standard Finanzwährung auswählen",
              "Select Finance Currency"
            )}
            value={financeCurrency}
            onChange={(value) => setFinanceCurrency(value as Currency)}
          />
        }
      />
      <SettingsRow
        title={getLocalizedText("Auszahlung", "Payout")}
        children={
          <Radio.Group
            label={getLocalizedText(
              "Währungswechsel Fenster anzeigen",
              "Show currency change window"
            )}
            value={showCCW}
            onChange={(value) => handleCCWChange(value)}
          >
            <Stack mt="sm">
              <Radio
                value="true"
                label={getLocalizedText(
                  "Ja, immer anzeigen",
                  "Yes, always show"
                )}
              />
              <Radio
                value="false"
                label={getLocalizedText(
                  "Nein, nur wenn es einen Unterschied zu der Standardwährung gibt",
                  "No, only if there is a difference to the default currency"
                )}
              />
              <Radio
                value="null"
                label={getLocalizedText("Nicht anzeigen", "Do not show")}
              />
            </Stack>
          </Radio.Group>
        }
      />
    </Stack>
  );
}
