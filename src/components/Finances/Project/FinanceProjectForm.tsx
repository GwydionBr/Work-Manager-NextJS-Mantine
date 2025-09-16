"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { TablesInsert } from "@/types/db.types";
import { Group, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [Currency, ...Currency[]]
  ),
  start_amount: z.number().min(0, "Start amount is required"),
  due_date: z.string().optional(),
  finance_category_id: z.string().optional(),
  client_id: z.string().optional(),
});

interface FinanceProjectFormProps {
  onClose: () => void;
  initialValues?: TablesInsert<"finance_project">;
}

export default function FinanceProjectForm({
  onClose,
  initialValues,
}: FinanceProjectFormProps) {
  const { locale, defaultFinanceCurrency } = useSettingsStore();
  const { addFinanceProject, financeCategories, financeClients } =
    useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    initialValues: initialValues || {
      title: "",
      currency: defaultFinanceCurrency,
      start_amount: 0,
    },
    validate: zodResolver(projectSchema),
  });
  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    const success = await addFinanceProject({
      ...values,
      due_date: values.due_date || null,
      finance_category_id: values.finance_category_id || null,
      client_id: values.client_id || null,
    });
    if (success) {
      notifications.show({
        title: locale === "de-DE" ? "Erfolg" : "Success",
        message:
          locale === "de-DE"
            ? "Projekt erfolgreich erstellt"
            : "Project created successfully",
        icon: <IconCheck />,
        color: "green",
        autoClose: 4000,
        withBorder: true,
        position: "top-center",
      });
      handleClose();
    } else {
      notifications.show({
        title: locale === "de-DE" ? "Fehler" : "Error",
        message:
          locale === "de-DE"
            ? "Projekt konnte nicht erstellt werden"
            : "Project could not be created",
        icon: <IconX />,
        color: "red",
        autoClose: 4000,
        withBorder: true,
        position: "top-center",
      });
    }
    setIsLoading(false);
  };
  function handleClose() {
    onClose();
    form.reset();
  }

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));
  const clientOptions = financeClients.map((client) => ({
    value: client.id,
    label: client.name,
  }));
  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={locale === "de-DE" ? "Name" : "Title"}
          placeholder={
            locale === "de-DE" ? "Name des Projekts" : "Enter project name"
          }
          {...form.getInputProps("title")}
          data-autofocus
        />
        <NumberInput
          withAsterisk
          label={locale === "de-DE" ? "Startbetrag" : "Start amount"}
          placeholder={
            locale === "de-DE" ? "Startbetrag eingeben" : "Enter start amount"
          }
          {...form.getInputProps("start_amount")}
        />
        <Select
          data={currencies}
          withAsterisk
          label={locale === "de-DE" ? "Währung" : "Currency"}
          placeholder={
            locale === "de-DE" ? "Währung auswählen" : "Select currency"
          }
          {...form.getInputProps("currency")}
        />
        <LocaleDatePickerInput
          label={locale === "de-DE" ? "Fälligkeitsdatum" : "Due date"}
          {...form.getInputProps("due_date")}
        />
        <Select
          data={categoryOptions}
          label={locale === "de-DE" ? "Finanzkategorie" : "Finance category"}
          placeholder={
            locale === "de-DE"
              ? "Finanzkategorie auswählen"
              : "Select finance category"
          }
          {...form.getInputProps("finance_category_id")}
        />
        <Select
          data={clientOptions}
          label={locale === "de-DE" ? "Kunde" : "Client"}
          placeholder={locale === "de-DE" ? "Kunde auswählen" : "Select client"}
          {...form.getInputProps("client_id")}
        />
        <Stack mt="md">
          <CreateButton
            onClick={form.onSubmit(handleSubmit)}
            loading={isLoading}
          />
          <CancelButton onClick={onClose} />
        </Stack>
      </Stack>
    </form>
  );
}
