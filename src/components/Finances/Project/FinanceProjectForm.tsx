"use client";

import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Tables, TablesInsert } from "@/types/db.types";
import {
  Group,
  NumberInput,
  Select,
  Stack,
  Button,
  TextInput,
  Text,
} from "@mantine/core";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import CancelButton from "@/components/UI/Buttons/CancelButton";

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
  financeProject?: Tables<"finance_project">;
  initialValues?: TablesInsert<"finance_project">;
  clientId: string | null;
  categoryId: string | null;
  onOpenClientForm: () => void;
  onOpenCategoryForm: () => void;
  onClientChange: (value: string | null) => void;
  onCategoryChange: (value: string | null) => void;
}

export default function FinanceProjectForm({
  onClose,
  financeProject,
  initialValues,
  clientId,
  categoryId,
  onOpenClientForm,
  onOpenCategoryForm,
  onClientChange,
  onCategoryChange,
}: FinanceProjectFormProps) {
  const { locale, defaultFinanceCurrency } = useSettingsStore();
  const { addFinanceProject, financeCategories, financeClients } =
    useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    initialValues: initialValues ||
      financeProject || {
        title: "",
        currency: defaultFinanceCurrency,
        start_amount: 0,
      },
    validate: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (clientId) {
      form.setFieldValue("client_id", clientId);
    }
    if (categoryId) {
      form.setFieldValue("finance_category_id", categoryId);
    }
  }, [clientId, categoryId]);

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

  const handleClientChange = (value: string | null) => {
    form.setFieldValue("client_id", value);
    onClientChange(value);
  };

  const handleCategoryChange = (value: string | null) => {
    form.setFieldValue("finance_category_id", value);
    onCategoryChange(value);
  };

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
        <Group wrap="nowrap">
          <Select
            w="100%"
            data={categoryOptions}
            label={locale === "de-DE" ? "Finanzkategorie" : "Finance category"}
            placeholder={
              locale === "de-DE"
                ? "Finanzkategorie auswählen"
                : "Select finance category"
            }
            value={form.values.finance_category_id}
            onChange={handleCategoryChange}
            error={form.errors.finance_category_id}
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenCategoryForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {locale === "de-DE" ? "Neue Kategorie" : "Add Category"}
            </Text>
          </Button>
        </Group>
        <Group wrap="nowrap">
          <Select
            w="100%"
            data={clientOptions}
            label={locale === "de-DE" ? "Kunde" : "Client"}
            placeholder={
              locale === "de-DE" ? "Kunde auswählen" : "Select client"
            }
            {...form.getInputProps("client_id")}
            value={form.values.client_id}
            onChange={handleClientChange}
            error={form.errors.client_id}
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenClientForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {locale === "de-DE" ? "Neuer Kunde" : "Add Client"}
            </Text>
          </Button>
        </Group>
        <Stack mt="md">
          <CreateButton
            onClick={form.onSubmit(handleSubmit)}
            loading={isLoading}
          />
          <CancelButton
            onClick={() => {
              form.reset();
              onClose();
            }}
          />
        </Stack>
      </Stack>
    </form>
  );
}
