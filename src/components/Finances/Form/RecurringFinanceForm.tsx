import { useForm } from "@mantine/form";

import {
  TextInput,
  Select,
  NumberInput,
  Group,
  Stack,
  Button,
} from "@mantine/core";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { DatePickerInput } from "@mantine/dates";
import { currencies, financeIntervals } from "@/constants/settings";
import { Currency, FinanceInterval } from "@/types/settings.types";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  amount: z.number().min(0, "Amount must be greater than 0"),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
  startDate: z.date(),
  endDate: z.date().nullable(),
  interval: z.enum(
    financeIntervals.map((interval) => interval.value) as [string, ...string[]]
  ),
});

export interface RecurringFinanceFormValues {
  name: string;
  description: string;
  amount: number;
  currency: Currency;
  startDate: Date;
  endDate: Date | null;
  interval: FinanceInterval;
}

interface RecurringFinanceFormProps {
  financeCurrency: Currency;
  handleSubmit: (values: RecurringFinanceFormValues) => void;
  isLoading: boolean;
}

export default function RecurringFinanceForm({
  financeCurrency,
  handleSubmit,
  isLoading,
}: RecurringFinanceFormProps) {
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      amount: 0,
      currency: financeCurrency,
      startDate: new Date(),
      endDate: null,
      interval: "month" as FinanceInterval,
    },
    validate: zodResolver(schema),
  });
  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput withAsterisk label="Name" {...form.getInputProps("name")} />
        <TextInput label="Description" {...form.getInputProps("description")} />
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
        <Group grow>
          <DatePickerInput
            label="Start Date"
            withAsterisk
            {...form.getInputProps("startDate")}
          />
          <DatePickerInput
            label="End Date"
            clearable
            {...form.getInputProps("endDate")}
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
