"use client";

import { useForm } from "@mantine/form";

import { TextInput, NumberInput, Select, Stack, Button } from "@mantine/core";

import { z } from "zod";
import { DatePickerInput } from "@mantine/dates";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";

import { Currency } from "@/types/settings.types";
import { Tables } from "@/types/db.types";

const schema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
  date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
});

export interface SingleFinanceFormValues {
  title: string;
  amount: number;
  currency: Currency;
  date: Date;
}

interface SingleFinanceFormProps {
  financeCurrency: Currency;
  handleSubmit: (values: SingleFinanceFormValues) => void;
  isLoading: boolean;
  cashFlow?: Tables<"single_cash_flow">;
}

export default function SingleFinanceForm({
  financeCurrency,
  handleSubmit,
  isLoading,
  cashFlow,
}: SingleFinanceFormProps) {
  const form = useForm({
    initialValues: {
      title: cashFlow?.title ?? "",
      amount: cashFlow?.amount ?? 0,
      date: cashFlow?.date ? new Date(cashFlow.date) : new Date(),
      currency: financeCurrency,
    },
    validate: zodResolver(schema),
  });

  function handleFormSubmit(values: SingleFinanceFormValues) {
    handleSubmit({
      ...values,
      date: new Date(values.date),
    });
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Name"
          {...form.getInputProps("title")}
          data-autofocus
        />
        <NumberInput
          withAsterisk
          allowNegative={false}
          allowLeadingZeros={false}
          label="Amount"
          {...form.getInputProps("amount")}
        />
        <Select
          withAsterisk
          label="Currency"
          placeholder="Select currency"
          data={currencies}
          {...form.getInputProps("currency")}
        />
        <DatePickerInput
          label="Date"
          withAsterisk
          {...form.getInputProps("date")}
        />
        <Button type="submit" loading={isLoading}>
          Create
        </Button>
      </Stack>
    </form>
  );
}
