"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Stack,
  Text,
  SegmentedControl,
  Center,
  Switch,
  Group,
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
  const { financeCurrency } = useSettingsStore();

  async function handleSingleFinanceSubmit(values: SingleFinanceFormValues) {
    setIsLoading(true);
    const { data, error } =  await createSingleCashFlow({
      cashFlow: {
        title: values.name,
        amount: values.amount,
        currency: values.currency,
        date: values.date.toISOString(),
        type,
      },
    });
    console.log(data, error);
    setIsLoading(false);
    onClose();
  }

  async function handleRecurringFinanceSubmit(
    values: RecurringFinanceFormValues
  ) {
    setIsLoading(true);
    console.log(values);
    await createRecurringCashFlow({
      cashFlow: {
        title: values.name,
        description: values.description || "",
        amount: values.amount,
        currency: values.currency,
        start_date: values.startDate.toISOString(),
        end_date: values.endDate?.toISOString(),
        interval: values.interval,
        type,
      },
    });
    setIsLoading(false);
    onClose();
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
    </Stack>
  );
}
