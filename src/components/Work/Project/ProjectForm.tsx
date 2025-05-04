import { Button, NumberInput, Stack, Textarea, TextInput, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";

interface ProjectFormProps {
  initialValues: { title: string; description: string; salary: number; currency: string };
  onSubmit: (values: any) => void;
  onCancel: () => void;
  newProject: boolean;
  submitting?: boolean;
}

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  salary: z.number().min(0, { message: "Salary must be positive" }),
  currency: z.string().min(1, { message: "Currency is required" }),
});

export default function ProjectForm({ initialValues, onSubmit, onCancel, newProject, submitting }: ProjectFormProps) {
  const form = useForm({
    initialValues,
    validate: zodResolver(schema),
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <TextInput
          label="Title"
          placeholder="Enter project title"
          {...form.getInputProps("title")}
        />
        <Textarea
          label="Description"
          placeholder="Enter project description"
          {...form.getInputProps('description')}
        />
        <NumberInput label="Salary" min={0} step={0.01} {...form.getInputProps("salary")} />
        <Select
          label="Currency"
          placeholder="Select currency"
          data={currencies}
          {...form.getInputProps('currency')}
        />
        <Button type="submit" loading={submitting} disabled={submitting}>{newProject ? "Create Project" : "Save Changes" }</Button>
        <Button onClick={onCancel} color="red" variant="outline">
          Cancel
        </Button>
      </Stack>
    </form>
  );
}