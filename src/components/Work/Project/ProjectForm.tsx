"use client";

import { useForm } from "@mantine/form";

import { useEffect, useState } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useWorkStore } from "@/stores/workManagerStore";
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
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { Currency, RoundingDirection } from "@/types/settings.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import CancelButton from "@/components/UI/Buttons/CancelButton";

interface ProjectFormProps {
  project?: Tables<"timer_project">;
  onClose?: () => void;
  onSuccess?: (project: Tables<"timer_project">) => void;
  onCancel?: () => void;
  categoryId: string | null;
  setCategoryId: (categoryId: string | null) => void;
  setActiveProjectId?: boolean;
  onOpenCategoryForm?: () => void;
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
  project,
  onClose,
  onSuccess,
  categoryId,
  setCategoryId,
  onOpenCategoryForm,
  setActiveProjectId = false,
  onCancel,
}: ProjectFormProps) {
  const {
    locale,
    timerRoundingSettings,
    defaultSalaryCurrency,
    defaultSalaryAmount,
  } = useSettingsStore();
  const { addProject, updateProject } = useWorkStore();
  const {
    roundingInterval,
    roundingDirection,
    roundInTimeFragments,
    timeFragmentInterval,
  } = timerRoundingSettings;
  const [isColorPickerOpen, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const [
    isDefaultRounding,
    { open: openDefaultRounding, close: closeDefaultRounding },
  ] = useDisclosure(
    !project ||
      project?.rounding_interval === null ||
      project?.rounding_direction === null ||
      project?.round_in_time_fragments === null ||
      project?.time_fragment_interval === null
  );
  const ref = useClickOutside(() => {
    close();
  });

  // State to store previous work values
  const [previousWorkValues, setPreviousWorkValues] = useState({
    salary: project?.salary,
    hourly_payment: project?.hourly_payment,
  });

  const [isHobby, setIsHobby] = useState(
    project?.hourly_payment === false && project?.salary === 0 ? true : false
  );

  const form = useForm({
    initialValues: {
      color: project?.color || null,
      title: project?.title || "",
      description: project?.description || "",
      salary: project?.salary || defaultSalaryAmount,
      hourly_payment: project?.hourly_payment || false,
      currency: project?.currency || defaultSalaryCurrency,
      cash_flow_category_id: project?.cash_flow_category_id || null,
      round_in_time_fragments:
        project?.round_in_time_fragments === null ||
        project?.round_in_time_fragments === undefined
          ? roundInTimeFragments
          : project?.round_in_time_fragments,
      time_fragment_interval:
        project?.time_fragment_interval || timeFragmentInterval,
      rounding_interval: project?.rounding_interval || roundingInterval,
      rounding_direction: project?.rounding_direction || roundingDirection,
    },
    validate: zodResolver(schema),
  });

  const { financeCategories, fetchFinanceData, isFetching } = useFinanceStore();

  useEffect(() => {
    if (categoryId) {
      form.setFieldValue("cash_flow_category_id", categoryId);
    }
  }, [categoryId]);

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
      form.setFieldValue("salary", previousWorkValues.salary || 10);
      form.setFieldValue(
        "hourly_payment",
        previousWorkValues.hourly_payment || true
      );
    }
  };

  const handleCustomRoundingToggle = (checked: boolean) => {
    if (checked) {
      openDefaultRounding();
    } else {
      closeDefaultRounding();
      form.setFieldValue("rounding_interval", roundingInterval);
      form.setFieldValue("rounding_direction", roundingDirection);
      form.setFieldValue("round_in_time_fragments", roundInTimeFragments);
      form.setFieldValue("time_fragment_interval", timeFragmentInterval);
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

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setSubmitting(true);
    if (project) {
      const updatedProject: TablesUpdate<"timer_project"> = {
        ...project,
        ...values,
        currency: values.currency as Currency,
        rounding_direction: values.rounding_direction as RoundingDirection,
      };
      if (isDefaultRounding) {
        updatedProject.rounding_interval = null;
        updatedProject.rounding_direction = null;
        updatedProject.round_in_time_fragments = null;
        updatedProject.time_fragment_interval = null;
      }
      const success = await updateProject(updatedProject);
      if (success) {
        showActionSuccessNotification(
          locale === "de-DE"
            ? "Projekt erfolgreich bearbeitet"
            : "Project successfully updated",
          locale
        );
        onClose?.();
        onSuccess?.(success);
      } else {
        showActionErrorNotification(
          locale === "de-DE"
            ? "Projekt konnte nicht bearbeitet werden"
            : "Project could not be updated",
          locale
        );
      }
    } else {
      const newProject: TablesInsert<"timer_project"> = {
        ...values,
        currency: values.currency as Currency,
        rounding_direction: values.rounding_direction as RoundingDirection,
      };
      if (isDefaultRounding) {
        newProject.rounding_interval = null;
        newProject.rounding_direction = null;
        newProject.round_in_time_fragments = null;
        newProject.time_fragment_interval = null;
      }
      const success = await addProject(newProject, setActiveProjectId);
      if (success) {
        showActionSuccessNotification(
          locale === "de-DE"
            ? "Projekt erfolgreich erstellt"
            : "Project successfully created",
          locale
        );
        onClose?.();
        onSuccess?.(success);
      } else {
        showActionErrorNotification(
          locale === "de-DE"
            ? "Projekt konnte nicht erstellt werden"
            : "Project could not be created",
          locale
        );
      }
    }
    setSubmitting(false);
  };

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
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
          <Stack>
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
            <Group wrap="nowrap">
              <Select
                w="100%"
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
                value={categoryId}
                onChange={(value) => setCategoryId(value)}
                error={form.errors.cash_flow_category_id}
              />
              <Button
                mt={25}
                w={180}
                p={0}
                onClick={onOpenCategoryForm}
                fw={500}
                variant="subtle"
                leftSection={<IconPlus size={20} />}
              >
                <Text fz="xs" c="dimmed">
                  {locale === "de-DE" ? "Neue Kategorie" : "Add Category"}
                </Text>
              </Button>
            </Group>
          </Stack>
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
        {project ? (
          <CreateButton
            onClick={form.onSubmit(handleSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(handleSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
