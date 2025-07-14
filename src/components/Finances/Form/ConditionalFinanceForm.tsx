import { useForm } from "@mantine/form";

import {
  TextInput,
  Select,
  NumberInput,
  Group,
  Stack,
  Button,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies, financeIntervals } from "@/constants/settings";

import { Currency, FinanceInterval } from "@/types/settings.types";
import { Tables } from "@/types/db.types";

const schema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be greater than 0"),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
  start_date: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val)),
  end_date: z
    .string()
    .or(z.date())
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  interval: z.enum(
    financeIntervals.map((interval) => interval.value) as [string, ...string[]]
  ),
});

export interface ConditionalFinanceFormValues {
  title: string;
  description: string;
  amount: number;
  currency: Currency;
  start_date: Date;
  end_date: Date | null;
  interval: FinanceInterval;
}

interface ConditionalFinanceFormProps {
  financeCurrency: Currency;
  handleSubmit: (values: ConditionalFinanceFormValues) => void;
  isLoading: boolean;
  cashFlow?: Tables<"recurring_cash_flow">;
}

export default function ConditionalFinanceForm({
  financeCurrency,
  handleSubmit,
  isLoading,
  cashFlow,
}: ConditionalFinanceFormProps) {
  const form = useForm({
    initialValues: {
      title: cashFlow?.title ?? "",
      description: cashFlow?.description ?? "",
      amount: cashFlow?.amount ?? 0,
      currency: financeCurrency,
      start_date: cashFlow?.start_date
        ? new Date(cashFlow.start_date)
        : new Date(),
      end_date: cashFlow?.end_date ? new Date(cashFlow.end_date) : null,
      interval: cashFlow?.interval ?? "month",
    },
    validate: zodResolver(schema),
  });

  function handleFormSubmit(values: ConditionalFinanceFormValues) {
    handleSubmit({
      ...values,
      start_date: new Date(values.start_date),
      end_date: values.end_date ? new Date(values.end_date) : null,
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
        <TextInput label="Description" {...form.getInputProps("description")} />
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
        <Group grow>
          <DatePickerInput
            label="Start Date"
            withAsterisk
            {...form.getInputProps("start_date")}
          />
          <DatePickerInput
            label="End Date"
            clearable
            {...form.getInputProps("end_date")}
          />
        </Group>
        <Select
          withAsterisk
          label="Select the repetition interval"
          placeholder="Select interval"
          data={financeIntervals}
          {...form.getInputProps("interval")}
        />
        <Button type="submit" loading={isLoading}>
          Create
        </Button>
      </Stack>
    </form>
  );
}
