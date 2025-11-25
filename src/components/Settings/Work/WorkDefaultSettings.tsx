"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFormatter } from "@/hooks/useFormatter";

import { Button, Group, NumberInput, Select, Switch } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

export default function WorkDefaultSettings() {
  const {
    defaultSalaryCurrency: salaryCurrency,
    defaultSalaryAmount,
    defaultProjectHourlyPayment,
    setDefaultSalaryCurrency: setSalaryCurrency,
    setDefaultSalaryAmount,
    setDefaultProjectHourlyPayment,
  } = useSettingsStore();
  const { getLocalizedText } = useFormatter();

  const [salaryAmount, setSalaryAmount] = useState(defaultSalaryAmount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSalaryAmount(defaultSalaryAmount);
  }, [defaultSalaryAmount]);

  async function handleCustomSubmit() {
    setLoading(true);
    await setDefaultSalaryAmount(salaryAmount);
    setLoading(false);
  }

  return (
    <Group>
      {salaryAmount !== defaultSalaryAmount && (
        <Button
          mt="lg"
          onClick={handleCustomSubmit}
          loading={loading}
          disabled={loading}
        >
          {getLocalizedText("Speichern", "Save")}
        </Button>
      )}
      <NumberInput
        w={120}
        label={getLocalizedText("Standard Gehalt", "Default Salary")}
        allowNegative={false}
        allowDecimal={false}
        allowLeadingZeros={false}
        aria-label={getLocalizedText("Standard Gehalt auswählen", "Select Default Salary")}
        placeholder={getLocalizedText("Standard Gehalt auswählen", "Select Default Salary")}
        value={salaryAmount}
        onChange={(value) => setSalaryAmount(value as number)}
      />
      <Select
        data={currencies}
        label={
          getLocalizedText("Standard Gehalt Währung", "Default Salary Currency")
        }
        aria-label={getLocalizedText("Standard Währung auswählen", "Select Default Salary Currency")}
        placeholder={
          getLocalizedText("Standard Währung auswählen", "Select Salary Currency")
        }
        value={salaryCurrency}
        onChange={(value) => setSalaryCurrency(value as Currency)}
      />
      <Switch
        mt="lg"
        label={getLocalizedText("Stundenlohn", "Hourly Payment")}
        checked={defaultProjectHourlyPayment}
        onChange={(event) =>
          setDefaultProjectHourlyPayment(event.currentTarget.checked)
        }
      />
    </Group>
  );
}
