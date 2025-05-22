import { useForm } from "@mantine/form";
import { useState } from "react";
import { useGroupStore, GroupContent } from "@/stores/groupStore";

import { TextInput, Stack, Button, Alert } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

const schema = z.object({
  title: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

interface GroupFormProps {
  onClose: () => void;
  group?: GroupContent | null;
}

export default function GroupForm({ onClose, group }: GroupFormProps) {
  const { addGroup, updateGroup } = useGroupStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: group?.title || "",
      description: group?.description || "",
    },
    validate: zodResolver(schema),
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    let success = false;
    if (group) {
      success = await updateGroup({
        id: group.id,
        ...values,
      });
    } else {
      success = await addGroup(values);
    }
    if (success) {
      form.reset();
      onClose();
    } else {
      setError("Failed to create group. Please try again.");
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput withAsterisk label="Name" {...form.getInputProps("title")} />
        <TextInput label="Description" {...form.getInputProps("description")} />
        <Button type="submit" loading={isLoading}>
          Create
        </Button>
        {error && (
          <Alert variant="light" color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
