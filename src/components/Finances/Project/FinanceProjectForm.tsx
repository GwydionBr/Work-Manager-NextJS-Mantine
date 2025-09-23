"use client";

import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import {
  Group,
  NumberInput,
  Select,
  Stack,
  Button,
  TextInput,
  Text,
  MultiSelect,
} from "@mantine/core";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import { currencies } from "@/constants/settings";
import { Currency } from "@/types/settings.types";
import LocaleDatePickerInput from "@/components/UI/Locale/LocaleDatePickerInput";
import { IconPlus } from "@tabler/icons-react";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import { FinanceProject } from "@/types/finance.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [Currency, ...Currency[]]
  ),
  start_amount: z.number().min(0, "Start amount is required"),
  due_date: z.string().optional(),
  finance_category_ids: z.array(z.string()),
  finance_client_ids: z.array(z.string()),
});

interface FinanceProjectFormProps {
  onClose: () => void;
  financeProject?: FinanceProject;
  clientIds: string[];
  categoryIds: string[];
  onOpenClientForm: () => void;
  onOpenCategoryForm: () => void;
  onClientChange: (value: string[]) => void;
  onCategoryChange: (value: string[]) => void;
}

export default function FinanceProjectForm({
  onClose,
  financeProject,
  clientIds,
  categoryIds,
  onOpenClientForm,
  onOpenCategoryForm,
  onClientChange,
  onCategoryChange,
}: FinanceProjectFormProps) {
  const { locale, defaultFinanceCurrency } = useSettingsStore();
  const {
    addFinanceProject,
    financeCategories,
    financeClients,
    updateFinanceProject,
  } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof projectSchema>>({
    initialValues: financeProject
      ? {
          title: financeProject.title,
          currency: financeProject.currency,
          start_amount: financeProject.start_amount,
          finance_category_ids: financeProject.categories.map(
            (category) => category.id
          ),
          finance_client_ids: financeProject.clients.map((client) => client.id),
          due_date: financeProject.due_date || undefined,
        }
      : {
          title: "",
          currency: defaultFinanceCurrency,
          start_amount: 0,
          finance_category_ids: [],
          finance_client_ids: [],
          due_date: undefined,
        },
    validate: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (clientIds) {
      form.setFieldValue("finance_client_ids", clientIds);
    }
    if (categoryIds) {
      form.setFieldValue("finance_category_ids", categoryIds);
    }
  }, [clientIds, categoryIds]);

  const handleSubmit = async (values: z.infer<typeof projectSchema>) => {
    setIsLoading(true);
    if (financeProject) {
      const { clients, categories, ...projectData } = financeProject;
      const newProject = {
        ...projectData,
        title: values.title,
        currency: values.currency,
        start_amount: values.start_amount,
        due_date: values.due_date || null,
        clientIds: values.finance_client_ids,
        categoryIds: values.finance_category_ids,
      };
      const success = await updateFinanceProject(newProject);
      if (success) {
        showActionSuccessNotification(
          locale === "de-DE"
            ? "Projekt erfolgreich bearbeitet"
            : "Project successfully updated",
          locale
        );
        handleClose();
      } else {
        showActionErrorNotification(
          locale === "de-DE"
            ? "Projekt konnte nicht bearbeitet werden"
            : "Project could not be updated",
          locale
        );
      }
    } else {
      const success = await addFinanceProject(
        {
          title: values.title,
          currency: values.currency,
          start_amount: values.start_amount,
          due_date: values.due_date || null,
        },
        values.finance_client_ids,
        values.finance_category_ids
      );
      if (success) {
        showActionSuccessNotification(
          locale === "de-DE"
            ? "Projekt erfolgreich erstellt"
            : "Project successfully created",
          locale
        );
        handleClose();
      } else {
        showActionErrorNotification(
          locale === "de-DE"
            ? "Projekt konnte nicht erstellt werden"
            : "Project could not be created",
          locale
        );
      }
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

  const handleClientChange = (value: string[]) => {
    form.setFieldValue("finance_client_ids", value);
    onClientChange(value);
  };

  const handleCategoryChange = (value: string[]) => {
    form.setFieldValue("finance_category_ids", value);
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
          allowLeadingZeros={false}
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
          <MultiSelect
            w="100%"
            multiple
            data={categoryOptions}
            searchable
            clearable
            nothingFoundMessage={
              locale === "de-DE"
                ? "Keine Kategorien gefunden"
                : "No categories found"
            }
            label={locale === "de-DE" ? "Finanzkategorie" : "Finance category"}
            placeholder={
              locale === "de-DE"
                ? "Finanzkategorie auswählen"
                : "Select finance category"
            }
            value={form.values.finance_category_ids}
            onChange={handleCategoryChange}
            error={form.errors.finance_category_ids}
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
          <MultiSelect
            w="100%"
            multiple
            data={clientOptions}
            searchable
            clearable
            nothingFoundMessage={
              locale === "de-DE" ? "Keine Kunden gefunden" : "No clients found"
            }
            label={locale === "de-DE" ? "Kunde" : "Client"}
            placeholder={
              locale === "de-DE" ? "Kunde auswählen" : "Select client"
            }
            value={form.values.finance_client_ids || []}
            onChange={handleClientChange}
            error={form.errors.finance_client_ids}
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
            type="submit"
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
