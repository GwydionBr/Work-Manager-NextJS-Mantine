import { Button, NumberInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';


interface ProjectFormProps {
  initialValues: { title: string; description: string; salary: number; currency: string };
  onSubmit: (values: any) => void;
  onCancel: () => void;
  newProject: boolean;
}

export default function ProjectForm({ initialValues, onSubmit, onCancel, newProject }: ProjectFormProps) {
  const form = useForm({
    initialValues,
    validate: {
      title: (value) => (value.trim().length === 0 ? "Title is required" : null),
      salary: (value) => (value < 0 ? "Salary must be positive" : null),
    },
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
        <TextInput
          label="Currency"
          placeholder="USD, EUR, etc."
          {...form.getInputProps('currency')}
        />
        <Button type="submit">{newProject ? "Create Project" : "Save Changes" }</Button>
        <Button onClick={onCancel} color="red" variant="outline">
          Cancel
        </Button>
      </Stack>
    </form>
  );
}