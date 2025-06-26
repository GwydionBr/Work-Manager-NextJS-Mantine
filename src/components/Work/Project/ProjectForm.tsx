"use client";

import { useForm } from "@mantine/form";
import { useEffect } from "react";
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
  const form = useForm({
    initialValues,
    validate: zodResolver(schema),
  });

  const { financeCategories, fetchFinanceData, isFetching } = useFinanceStore();

  useEffect(() => {
    if (financeCategories.length === 0 && !isFetching) {
      fetchFinanceData();
    }
  }, [financeCategories.length, isFetching, fetchFinanceData]);

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
          <NumberInput
            allowLeadingZeros={false}
            allowNegative={false}
            withAsterisk
            label="Salary"
            min={0}
            step={0.01}
            {...form.getInputProps("salary")}
          />
          <Tooltip label="Payment method" refProp="rootRef">
            <Switch
              size="xl"
              onLabel="Hourly"
              offLabel="Project"
              checked={form.values.hourly_payment}
              onChange={(event) =>
                form.setFieldValue(
                  "hourly_payment",
                  event.currentTarget.checked
                )
              }
            />
          </Tooltip>
        </Group>
        <Select
          withAsterisk
          label="Currency"
          placeholder="Select currency"
          data={currencies}
          {...form.getInputProps("currency")}
        />
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
