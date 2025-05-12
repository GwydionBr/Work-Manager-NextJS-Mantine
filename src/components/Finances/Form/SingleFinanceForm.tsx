"use client";

import { useForm } from "@mantine/form";

import { TextInput, NumberInput, Select, Stack, Button } from "@mantine/core";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { DatePickerInput } from "@mantine/dates";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
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
  name: string;
  amount: number;
  currency: Currency;
  date: Date;
}

interface SingleFinanceFormProps {
  financeCurrency: Currency;
  handleSubmit: (values: SingleFinanceFormValues) => void;
  isLoading: boolean;
}

export default function SingleFinanceForm({
  financeCurrency,
  handleSubmit,
  isLoading,
}: SingleFinanceFormProps) {
  const form = useForm({
    initialValues: {
      name: "",
      amount: 0,
      date: new Date(),
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
        <TextInput withAsterisk label="Name" {...form.getInputProps("name")} />
        <NumberInput
          withAsterisk
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
