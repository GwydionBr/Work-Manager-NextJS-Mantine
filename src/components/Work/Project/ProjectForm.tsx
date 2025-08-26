"use client";

import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useDisclosure, useClickOutside } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";

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
} from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import ProjectColorPicker from "@/components/UI/ProjectColorPicker";
import { IconPalette } from "@tabler/icons-react";

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
  const [isColorPickerOpen, { open, close }] = useDisclosure(false);
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

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="xl">
        <Fieldset legend="Project details">
          <TextInput
            withAsterisk
            data-autofocus
            label="Title"
            placeholder="Enter project title"
            {...form.getInputProps("title")}
          />
          <Textarea
            label="Description"
            placeholder="Enter project description"
            {...form.getInputProps("description")}
          />
        </Fieldset>

        <Fieldset legend="Finance settings">
          <Stack gap="xs" align="flex-start">
            <Tooltip label="Project type" refProp="rootRef" openDelay={500}>
              <Switch
                size="xl"
                pt={25}
                onLabel="Hobby"
                offLabel="Work"
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
                  label="Salary"
                  min={0}
                  step={0.01}
                  value={form.values.salary}
                  onChange={(value) =>
                    handleWorkFieldChange("salary", value || 0)
                  }
                  error={form.errors.salary}
                />
                <Tooltip
                  label="Payment method"
                  refProp="rootRef"
                  openDelay={500}
                >
                  <Switch
                    size="xl"
                    onLabel="Hourly"
                    offLabel="Project"
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
                label="Currency"
                placeholder="Select currency"
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

        <Fieldset legend="Configuration">
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
                  Color
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

            <Select
              label="Category"
              placeholder="Select category (optional)"
              data={categoryOptions}
              clearable
              searchable
              nothingFoundMessage="No categories found"
              {...form.getInputProps("cash_flow_category_id")}
            />
          </Group>
        </Fieldset>
        {newProject ? (
          <CreateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title="Create Project"
          />
        ) : (
          <UpdateButton
            onClick={form.onSubmit(onSubmit)}
            type="submit"
            loading={submitting}
            mt="md"
            title="Update Project"
          />
        )}
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
