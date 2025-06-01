"use client";

import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import { Button, Group, NumberInput, Select } from "@mantine/core";

import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

export default function WorkSettings() {
  const {
    defaultSalaryCurrency: salaryCurrency,
    setDefaultSalaryCurrency: setSalaryCurrency,
    defaultSalaryAmount,
    setDefaultSalaryAmount,
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
          Save
        </Button>
      )}
      <NumberInput
        w={100}
        label="Default Salary"
        allowNegative={false}
        allowDecimal={false}
        allowLeadingZeros={false}
        aria-label="Select Default Salary"
        placeholder="Select Default Salary"
        value={salaryAmount}
        onChange={(value) => setSalaryAmount(value as number)}
      />
      <Select
        data={currencies}
        label="Default Salary Currency"
        aria-label="Select Default Salary Currency"
        placeholder="Select Salary Currency"
        value={salaryCurrency}
        onChange={(value) => setSalaryCurrency(value as Currency)}
      />
    </Group>
  );
}
