"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Stack,
  Text,
  SegmentedControl,
  Center,
  Switch,
  Group,
  Alert,
} from "@mantine/core";
import {
  IconMinus,
  IconPlus,
  IconReload,
  IconCircleDashedNumber1,
} from "@tabler/icons-react";
import { CashFlowType } from "@/types/settings.types";
import SingleFinanceForm, {
  SingleFinanceFormValues,
} from "./SingleFinanceForm";
import RecurringFinanceForm, {
  RecurringFinanceFormValues,
} from "./RecurringFinanceForm";

import classes from "../UI/Switch.module.css";
import { createSingleCashFlow, createRecurringCashFlow } from "@/actions";

interface FinanceFormProps {
  onClose: () => void;
}

export default function FinanceForm({ onClose }: FinanceFormProps) {
  const [type, setType] = useState<CashFlowType>("expense");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { financeCurrency } = useSettingsStore();
  const { addSingleCashFlow, addRecurringCashFlow } = useFinanceStore();

  async function handleSingleFinanceSubmit(values: SingleFinanceFormValues) {
    setIsLoading(true);
    const success = await addSingleCashFlow({
      title: values.name,
      amount: values.amount,
      currency: values.currency,
      date: values.date.toISOString(),
      type,
    });
    if (!success) {
      setError("Failed to add single cash flow. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  async function handleRecurringFinanceSubmit(
    values: RecurringFinanceFormValues
  ) {
    setIsLoading(true);
    const success = await addRecurringCashFlow({
      title: values.name,
      description: values.description || "",
      amount: values.amount,
      currency: values.currency,
      start_date: values.startDate.toISOString(),
      end_date: values.endDate?.toISOString(),
      interval: values.interval,
      type,
    });
    if (!success) {
      setError("Failed to add recurring cash flow. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <Stack>
      <SegmentedControl
        value={type}
        color="teal"
        onChange={(value) => setType(value as CashFlowType)}
        data={[
          {
            value: "income",
            label: (
              <Center style={{ gap: 10 }}>
                <IconPlus size={16} />
                <span>Income</span>
              </Center>
            ),
          },
          {
            value: "expense",
            label: (
              <Center style={{ gap: 10 }}>
                <IconMinus size={16} />
                <span>Expense</span>
              </Center>
            ),
          },
        ]}
      />
      <Group justify="center">
        <Text>Single</Text>
        <IconCircleDashedNumber1 size={16} />
        <Switch
          checked={isRecurring}
          onChange={(event) => setIsRecurring(event.currentTarget.checked)}
          classNames={classes}
          size="md"
        />
        <IconReload size={16} />
        <Text>Recurring</Text>
      </Group>
      {isRecurring ? (
        <RecurringFinanceForm
          financeCurrency={financeCurrency}
          handleSubmit={handleRecurringFinanceSubmit}
          isLoading={isLoading}
        />
      ) : (
        <SingleFinanceForm
          financeCurrency={financeCurrency}
          handleSubmit={handleSingleFinanceSubmit}
          isLoading={isLoading}
        />
      )}
      {error && (
        <Alert
          color="red"
          variant="filled"
          title="Error"
          withCloseButton
          onClose={() => setError(null)}
        >
          <Text>{error}</Text>
        </Alert>
      )}
    </Stack>
  );
}
