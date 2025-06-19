"use client";

import { useForm } from "@mantine/form";

import {
  Button,
  NumberInput,
  Stack,
  Textarea,
  TextInput,
  Select,
} from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CancelButton from "@/components/UI/Buttons/CancelButton";

interface ProjectFormProps {
  initialValues: {
    title: string;
    description: string;
    salary: number;
    currency: string;
    folder_id?: string | null;
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
  currency: z.string().min(1, { message: "Currency is required" }),
  folder_id: z.string().nullable().optional(),
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

  const folderOptions = folders.map((folder) => ({
    value: folder.id,
    label: folder.title,
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
        <NumberInput
          withAsterisk
          label="Salary"
          min={0}
          step={0.01}
          {...form.getInputProps("salary")}
        />
        <Select
          withAsterisk
          label="Currency"
          placeholder="Select currency"
          data={currencies}
          {...form.getInputProps("currency")}
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
