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
  Collapse,
  Popover,
  Button,
  Fieldset,
  Text,
  SegmentedControl,
} from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import {
  currencies,
  getRoundingInTimeFragments,
  getRoundingModes,
} from "@/constants/settings";
import DelayedTooltip from "@/components/UI/DelayedTooltip";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import ProjectColorPicker from "@/components/UI/ProjectColorPicker";
import {
  IconBriefcase,
  IconHammer,
  IconPalette,
  IconPlus,
} from "@tabler/icons-react";
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
    rounding_interval: number | null;
    rounding_direction: string | null;
    round_in_time_fragments: boolean | null;
    time_fragment_interval: number | null;
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
  rounding_interval: z.number(),
  rounding_direction: z.string(),
  round_in_time_fragments: z.boolean(),
  time_fragment_interval: z.number(),
});

export default function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  newProject,
  submitting,
}: ProjectFormProps) {
  const {
    locale,
    roundingInterval: settingsRoundingInterval,
    roundingDirection: settingsRoundingDirection,
    roundInTimeFragments: settingsRoundInTimeFragments,
    timeFragmentInterval: settingsTimeFragmentInterval,
  } = useSettingsStore();
  const [isColorPickerOpen, { open, close }] = useDisclosure(false);
  const [
    isCategoryFormOpen,
    { open: openCategoryForm, close: closeCategoryForm },
  ] = useDisclosure(false);
  const [
    isDefaultRounding,
    { open: openDefaultRounding, close: closeDefaultRounding },
  ] = useDisclosure(initialValues.rounding_interval === null);
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
      round_in_time_fragments:
        initialValues.round_in_time_fragments === null
          ? settingsRoundInTimeFragments
          : initialValues.round_in_time_fragments,
      time_fragment_interval:
        initialValues.time_fragment_interval || settingsTimeFragmentInterval,
      rounding_interval:
        initialValues.rounding_interval || settingsRoundingInterval,
      rounding_direction:
        initialValues.rounding_direction || settingsRoundingDirection,
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

  const handleCustomRoundingToggle = (checked: boolean) => {
    if (checked) {
      openDefaultRounding();
    } else {
      closeDefaultRounding();
      form.setFieldValue("rounding_interval", settingsRoundingInterval);
      form.setFieldValue("rounding_direction", settingsRoundingDirection);
      form.setFieldValue(
        "round_in_time_fragments",
        settingsRoundInTimeFragments
      );
      form.setFieldValue(
        "time_fragment_interval",
        settingsTimeFragmentInterval
      );
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

  const handleSubmit = (values: any) => {
    const newValues = { ...values };
    if (isDefaultRounding) {
      newValues.rounding_interval = null;
      newValues.rounding_direction = null;
      newValues.round_in_time_fragments = null;
      newValues.time_fragment_interval = null;
    }
    onSubmit(newValues);
  };

  const handleAddCategory = (category: Tables<"finance_category">) => {
    form.setFieldValue("cash_flow_category_id", category.id);
  };

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        <Fieldset
          legend={locale === "de-DE" ? "Projekt Details" : "Project details"}
        >
          <TextInput
            withAsterisk
            data-autofocus
            aria-label={
              locale === "de-DE" ? "Name des Projekts" : "Name of the project"
            }
            label={locale === "de-DE" ? "Name" : "Name"}
            placeholder={
              locale === "de-DE"
                ? "Project Name eingeben"
                : "Enter project name"
            }
            {...form.getInputProps("title")}
          />
          <Textarea
            aria-label={
              locale === "de-DE"
                ? "Beschreibung des Projekts"
                : "Description of the project"
            }
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
            <DelayedTooltip
              label={
                locale === "de-DE"
                  ? "Projekt Typ (Hobby/Arbeit)"
                  : "Project type (Hobby/Work)"
              }
              openDelay={500}
            >
              <SegmentedControl
                color={isHobby ? "lime" : "cyan"}
                data={[
                  {
                    value: "hobby",
                    label: (
                      <Group gap="xs" align="center" wrap="nowrap">
                        <IconHammer size={20} />
                        <Text>{locale === "de-DE" ? "Hobby" : "Hobby"}</Text>
                      </Group>
                    ),
                  },
                  {
                    value: "work",
                    label: (
                      <Group gap="xs" align="center" wrap="nowrap">
                        <IconBriefcase size={20} />
                        <Text>{locale === "de-DE" ? "Arbeit" : "Work"}</Text>
                      </Group>
                    ),
                  },
                ]}
                value={isHobby ? "hobby" : "work"}
                onChange={(value) => handleHobbyToggle(value === "hobby")}
              />
            </DelayedTooltip>

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
                <DelayedTooltip
                  label={
                    locale === "de-DE" ? "Zahlungsmethode" : "Payment method"
                  }
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
                </DelayedTooltip>
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
            <Popover
              opened={isColorPickerOpen}
              onClose={close}
              onOpen={open}
              trapFocus
              returnFocus
            >
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
        <Fieldset
          legend={locale === "de-DE" ? "Zeit Rundung" : "Time Rounding"}
        >
          <Stack>
            <Switch
              label={
                locale === "de-DE"
                  ? "Rundung aus Einstellungen verwenden"
                  : "Use rounding from settings"
              }
              checked={isDefaultRounding}
              onChange={(event) =>
                handleCustomRoundingToggle(event.currentTarget.checked)
              }
            />
            <Stack>
              <Switch
                disabled={isDefaultRounding}
                label={
                  locale === "de-DE"
                    ? "Runden in Zeitabschnitten"
                    : "Round in time fragments"
                }
                checked={form.values.round_in_time_fragments || false}
                onChange={(event) =>
                  handleWorkFieldChange(
                    "round_in_time_fragments",
                    event.currentTarget.checked
                  )
                }
              />
              <Collapse in={!form.values.round_in_time_fragments || false}>
                <Group>
                  <NumberInput
                    disabled={isDefaultRounding}
                    label={
                      locale === "de-DE"
                        ? "Rundungsintervall"
                        : "Rounding interval"
                    }
                    suffix={locale === "de-DE" ? " Minuten" : " minutes"}
                    allowNegative={false}
                    allowDecimal={false}
                    allowLeadingZeros={false}
                    min={1}
                    max={1440}
                    value={form.values.rounding_interval}
                    onChange={(value) =>
                      handleWorkFieldChange("rounding_interval", value || 1)
                    }
                  />
                  <Select
                    w={125}
                    disabled={isDefaultRounding}
                    label={
                      locale === "de-DE" ? "Rundungsmodus" : "Rounding mode"
                    }
                    data={getRoundingModes(locale)}
                    value={form.values.rounding_direction}
                    onChange={(value) =>
                      handleWorkFieldChange("rounding_direction", value || "")
                    }
                  />
                </Group>
              </Collapse>
              <Collapse in={form.values.round_in_time_fragments || false}>
                <Group>
                  <Select
                    w={200}
                    disabled={isDefaultRounding}
                    data={getRoundingInTimeFragments(locale)}
                    label={
                      locale === "de-DE"
                        ? "Zeitabschnittsintervall"
                        : "Time Fragment Interval"
                    }
                    placeholder={
                      locale === "de-DE"
                        ? "Intervall auswählen"
                        : "Select Default Rounding Amount"
                    }
                    value={form.values.time_fragment_interval.toString()}
                    onChange={(value) =>
                      handleWorkFieldChange(
                        "time_fragment_interval",
                        Number(value) || 5
                      )
                    }
                  />
                </Group>
              </Collapse>
            </Stack>
          </Stack>
        </Fieldset>
        {newProject ? (
          <CreateButton
            onClick={form.onSubmit(handleSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title={locale === "de-DE" ? "Projekt erstellen" : "Create Project"}
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(handleSubmit)}
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
