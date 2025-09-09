"use client";

import { useForm } from "@mantine/form";

import { useEffect, useState } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  Select,
  Group,
  Switch,
  Tooltip,
  Collapse,
  Popover,
  Button,
  Fieldset,
  Text,
} from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import ProjectColorPicker from "@/components/UI/ProjectColorPicker";
import { IconPalette, IconPlus } from "@tabler/icons-react";
import FinanceCategoryForm from "@/components/Finances/Form/FinanceCategoryForm";
import { Tables } from "@/types/db.types";

interface ProjectFormProps {
  initialValues: {
    color: string | null;
    title: string;
    description: string | null;
    salary: number;
    hourly_payment: boolean;
    currency: string;
    cash_flow_category_id?: string | null;
  };
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  newProject: boolean;
  submitting?: boolean;
}

const schema = z.object({
  color: z.string().nullable().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  salary: z.number().min(0, { message: "Salary must be positive" }),
  hourly_payment: z.boolean(),
  currency: z.string().min(1, { message: "Currency is required" }),
  cash_flow_category_id: z.string().nullable().optional(),
});

export default function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  newProject,
  submitting,
}: ProjectFormProps) {
  const { locale } = useSettingsStore();
  const [isColorPickerOpen, { open, close }] = useDisclosure(false);
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const ref = useClickOutside(() => {
    close();
  });

  // State to store previous work values
  const [previousWorkValues, setPreviousWorkValues] = useState({
    salary: initialValues.salary,
    hourly_payment: initialValues.hourly_payment,
  });

  const [isHobby, setIsHobby] = useState(
    initialValues.hourly_payment === false && initialValues.salary === 0
      ? true
      : false
  );

  const form = useForm({
    initialValues: {
      ...initialValues,
    },
    validate: zodResolver(schema),
  });

  const { financeCategories, fetchFinanceData, isFetching } = useFinanceStore();

  useEffect(() => {
    if (financeCategories.length === 0 && !isFetching) {
      fetchFinanceData();
    }
  }, [financeCategories.length, isFetching, fetchFinanceData]);

  // Handle hobby toggle
  const handleHobbyToggle = (checked: boolean) => {
    if (checked) {
      setIsHobby(true);
      form.setFieldValue("salary", 0);
      form.setFieldValue("hourly_payment", false);
    } else {
      setIsHobby(false);
      form.setFieldValue("salary", previousWorkValues.salary);
      form.setFieldValue("hourly_payment", previousWorkValues.hourly_payment);
    }
  };

  // Update previous work values when user changes work-related fields
  const handleWorkFieldChange = (field: string, value: any) => {
    form.setFieldValue(field, value);
    if (!isHobby) {
      setPreviousWorkValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddCategory = (category: Tables<"finance_category">) => {
    form.setFieldValue("cash_flow_category_id", category.id);
  };

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="xl">
        <Fieldset
          legend={locale === "de-DE" ? "Projekt Details" : "Project details"}
        >
          <TextInput
            withAsterisk
            data-autofocus
            label={locale === "de-DE" ? "Titel" : "Title"}
            placeholder={
              locale === "de-DE"
                ? "Projekt Titel eingeben"
                : "Enter project title"
            }
            {...form.getInputProps("title")}
          />
          <Textarea
            label={locale === "de-DE" ? "Beschreibung" : "Description"}
            placeholder={
              locale === "de-DE"
                ? "Projekt Beschreibung eingeben"
                : "Enter project description"
            }
            {...form.getInputProps("description")}
          />
        </Fieldset>

        <Fieldset
          legend={
            locale === "de-DE" ? "Finanz Einstellungen" : "Finance settings"
          }
        >
          <Stack gap="xs" align="flex-start">
            <Tooltip
              label={locale === "de-DE" ? "Projekt Typ" : "Project type"}
              refProp="rootRef"
              openDelay={500}
            >
              <Switch
                size="xl"
                pt={25}
                onLabel={locale === "de-DE" ? "Hobby" : "Hobby"}
                offLabel={locale === "de-DE" ? "Arbeit" : "Work"}
                checked={isHobby}
                onChange={(event) =>
                  handleHobbyToggle(event.currentTarget.checked)
                }
              />
            </Tooltip>

            <Collapse in={!isHobby}>
              <Group align="flex-end">
                <NumberInput
                  allowLeadingZeros={false}
                  allowNegative={false}
                  withAsterisk
                  label={locale === "de-DE" ? "Gehalt" : "Salary"}
                  min={0}
                  step={0.01}
                  value={form.values.salary}
                  onChange={(value) =>
                    handleWorkFieldChange("salary", value || 0)
                  }
                  error={form.errors.salary}
                />
                <Tooltip
                  label={
                    locale === "de-DE" ? "Zahlungsmethode" : "Payment method"
                  }
                  refProp="rootRef"
                  openDelay={500}
                >
                  <Switch
                    size="xl"
                    onLabel={locale === "de-DE" ? "Stündlich" : "Hourly"}
                    offLabel={locale === "de-DE" ? "Projekt" : "Project"}
                    checked={form.values.hourly_payment}
                    onChange={(event) =>
                      handleWorkFieldChange(
                        "hourly_payment",
                        event.currentTarget.checked
                      )
                    }
                  />
                </Tooltip>
              </Group>
            </Collapse>
            {/* Currency - only show for work projects */}
            <Collapse in={!isHobby}>
              <Select
                withAsterisk
                label={locale === "de-DE" ? "Währung" : "Currency"}
                placeholder={
                  locale === "de-DE" ? "Währung auswählen" : "Select currency"
                }
                data={currencies}
                value={form.values.currency}
                onChange={(value) =>
                  handleWorkFieldChange("currency", value || "")
                }
                error={form.errors.currency}
              />
            </Collapse>
          </Stack>
        </Fieldset>

        <Fieldset
          legend={locale === "de-DE" ? "Konfiguration" : "Configuration"}
        >
          <Group wrap="nowrap" justify="space-between">
            <Popover opened={isColorPickerOpen} onClose={close} onOpen={open}>
              <Popover.Target>
                <Button
                  mt="lg"
                  leftSection={<IconPalette />}
                  variant="light"
                  size="sm"
                  onClick={open}
                  color={form.values.color || "teal"}
                >
                  {locale === "de-DE" ? "Farbe" : "Color"}
                </Button>
              </Popover.Target>
              <Popover.Dropdown ref={ref}>
                <ProjectColorPicker
                  value={form.values.color || ""}
                  onChange={(value) => form.setFieldValue("color", value)}
                  onClose={close}
                />
              </Popover.Dropdown>
            </Popover>
            <Stack gap={0}>
              <Group justify="flex-end">
                <Popover
                  opened={isCategoryFormOpen}
                  onClose={closeCategoryForm}
                  onOpen={openCategoryForm}
                  closeOnClickOutside
                  trapFocus
                  returnFocus
                  withOverlay
                >
                  <Popover.Target>
                    <Button
                      onClick={openCategoryForm}
                      fw={500}
                      variant="subtle"
                    >
                      <Group gap={4} p={0} m={0}>
                        <IconPlus size={14} />
                        <Text fz="xs" c="dimmed">
                          {locale === "de-DE"
                            ? "Neue Kategorie"
                            : "Add Category"}
                        </Text>
                      </Group>
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <FinanceCategoryForm
                      onClose={closeCategoryForm}
                      category={null}
                      onSuccess={handleAddCategory}
                    />
                  </Popover.Dropdown>
                </Popover>
              </Group>
              <Select
                label={locale === "de-DE" ? "Kategorie" : "Category"}
                placeholder={
                  locale === "de-DE"
                    ? "Kategorie auswählen (optional)"
                    : "Select category (optional)"
                }
                data={categoryOptions}
                clearable
                searchable
                nothingFoundMessage={
                  locale === "de-DE"
                    ? "Keine Kategorien gefunden"
                    : "No categories found"
                }
                {...form.getInputProps("cash_flow_category_id")}
              />
            </Stack>
          </Group>
        </Fieldset>
        {newProject ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title={locale === "de-DE" ? "Projekt erstellen" : "Create Project"}
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title={
              locale === "de-DE" ? "Projekt aktualisieren" : "Update Project"
            }
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
