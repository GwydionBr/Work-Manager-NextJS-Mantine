"use client";

import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";

import { TextInput, Select, NumberInput, Group, Stack } from "@mantine/core";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";

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

export interface RecurringFinanceFormValues {
  title: string;
  description: string;
  amount: number;
  currency: Currency;
  start_date: Date;
  end_date: Date | null;
  interval: FinanceInterval;
}

interface RecurringFinanceFormProps {
  financeCurrency: Currency;
  handleSubmit: (values: RecurringFinanceFormValues) => void;
  isLoading: boolean;
  cashFlow?: Tables<"recurring_cash_flow">;
}

export default function RecurringFinanceForm({
  financeCurrency,
  handleSubmit,
  isLoading,
  cashFlow,
}: RecurringFinanceFormProps) {
  const { locale } = useSettingsStore();
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

  function handleFormSubmit(values: RecurringFinanceFormValues) {
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
        <TextInput
          label={locale === "de-DE" ? "Beschreibung" : "Description"}
          {...form.getInputProps("description")}
        />
        <NumberInput
          withAsterisk
          allowNegative={false}
          allowLeadingZeros={false}
          label={locale === "de-DE" ? "Betrag" : "Amount"}
          {...form.getInputProps("amount")}
        />
        <Select
          withAsterisk
          label={locale === "de-DE" ? "Währung" : "Currency"}
          placeholder={
            locale === "de-DE" ? "Währung auswählen" : "Select currency"
          }
          data={currencies}
          {...form.getInputProps("currency")}
        />
        <Group grow>
          <LocaleDatePickerInput
            label={locale === "de-DE" ? "Startdatum" : "Start Date"}
            withAsterisk
            {...form.getInputProps("start_date")}
          />
          <LocaleDatePickerInput
            label={locale === "de-DE" ? "Enddatum" : "End Date"}
            clearable
            {...form.getInputProps("end_date")}
          />
        </Group>
        <Select
          withAsterisk
          label={
            locale === "de-DE"
              ? "Wiederholungsintervall auswählen"
              : "Select the repetition interval"
          }
          placeholder={
            locale === "de-DE" ? "Intervall auswählen" : "Select interval"
          }
          data={financeIntervals}
          {...form.getInputProps("interval")}
          mb="md"
        />
        {cashFlow ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
            variant="filled"
            title={locale === "de-DE" ? "Speichern" : "Save"}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
            variant="filled"
            title={locale === "de-DE" ? "Erstellen" : "Create"}
          />
        )}
      </Stack>
    </form>
  );
}
