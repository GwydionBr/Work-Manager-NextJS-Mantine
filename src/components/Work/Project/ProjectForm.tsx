"use client";

import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Button,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  Select,
  Group,
  Switch,
  Tooltip,
  Collapse,
} from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CancelButton from "@/components/UI/Buttons/CancelButton";

interface ProjectFormProps {
  initialValues: {
    title: string;
    description: string | null;
    salary: number;
    hourly_payment: boolean;
    currency: string;
    folder_id?: string | null;
    cash_flow_category_id?: string | null;
  };
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  newProject: boolean;
  submitting?: boolean;
  showFolderSelect?: boolean;
  folders?: Array<{ id: string; title: string }>;
}

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  salary: z.number().min(0, { message: "Salary must be positive" }),
  hourly_payment: z.boolean(),
  currency: z.string().min(1, { message: "Currency is required" }),
  folder_id: z.string().nullable().optional(),
  cash_flow_category_id: z.string().nullable().optional(),
});

export default function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  newProject,
  submitting,
  showFolderSelect = false,
  folders = [],
}: ProjectFormProps) {
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

  const folderOptions = folders.map((folder) => ({
    value: folder.id,
    label: folder.title,
  }));

  const categoryOptions = financeCategories.map((category) => ({
    value: category.id,
    label: category.title,
  }));

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
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

        <Group align="flex-end">
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
              <Tooltip label="Payment method" refProp="rootRef" openDelay={500}>
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
        </Group>

        {/* Currency - only show for work projects */}
        <Collapse in={!isHobby}>
          <Select
            withAsterisk
            label="Currency"
            placeholder="Select currency"
            data={currencies}
            value={form.values.currency}
            onChange={(value) => handleWorkFieldChange("currency", value || "")}
            error={form.errors.currency}
          />
        </Collapse>

        <Select
          label="Category"
          placeholder="Select category (optional)"
          data={categoryOptions}
          clearable
          searchable
          nothingFoundMessage="No categories found"
          {...form.getInputProps("cash_flow_category_id")}
        />
        {showFolderSelect && (
          <Select
            label="Folder"
            placeholder="Select folder (optional)"
            data={folderOptions}
            clearable
            {...form.getInputProps("folder_id")}
          />
        )}
        <Button
          type="submit"
          loading={submitting}
          disabled={submitting}
          mt="md"
        >
          {newProject ? "Create Project" : "Save Changes"}
        </Button>
        {onCancel && <CancelButton onClick={onCancel} />}
      </Stack>
    </form>
  );
}
