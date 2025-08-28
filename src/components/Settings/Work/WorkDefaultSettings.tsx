"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Button, Group, NumberInput, Select, Switch } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

export default function WorkDefaultSettings() {
  const {
    locale,
    defaultSalaryCurrency: salaryCurrency,
    defaultSalaryAmount,
    defaultProjectHourlyPayment,
    setDefaultSalaryCurrency: setSalaryCurrency,
    setDefaultSalaryAmount,
    setDefaultProjectHourlyPayment,
  } = useSettingsStore();

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
          {locale === "de-DE" ? "Speichern" : "Save"}
        </Button>
      )}
      <NumberInput
        w={100}
        label={locale === "de-DE" ? "Standard Gehalt" : "Default Salary"}
        allowNegative={false}
        allowDecimal={false}
        allowLeadingZeros={false}
        aria-label={
          locale === "de-DE"
            ? "Standard Gehalt auswählen"
            : "Select Default Salary"
        }
        placeholder={
          locale === "de-DE"
            ? "Standard Gehalt auswählen"
            : "Select Default Salary"
        }
        value={salaryAmount}
        onChange={(value) => setSalaryAmount(value as number)}
      />
      <Select
        data={currencies}
        label={
          locale === "de-DE"
            ? "Standard Gehalt Währung"
            : "Default Salary Currency"
        }
        aria-label={
          locale === "de-DE"
            ? "Standard Währung auswählen"
            : "Select Default Salary Currency"
        }
        placeholder={
          locale === "de-DE"
            ? "Standard Währung auswählen"
            : "Select Salary Currency"
        }
        value={salaryCurrency}
        onChange={(value) => setSalaryCurrency(value as Currency)}
      />
      <Switch
        mt="lg"
        label={locale === "de-DE" ? "Stundenlohn" : "Hourly Payment"}
        checked={defaultProjectHourlyPayment}
        onChange={(event) =>
          setDefaultProjectHourlyPayment(event.currentTarget.checked)
        }
      />
    </Group>
  );
}
