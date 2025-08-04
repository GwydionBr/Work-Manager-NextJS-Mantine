"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";

import { TextInput, Stack, Button, Alert, Textarea } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

interface FinanceCategoryFormProps {
  onClose: () => void;
  category?: {
    id: string;
    title: string;
    description: string | null;
  } | null;
}

export default function FinanceCategoryForm({
  onClose,
  category,
}: FinanceCategoryFormProps) {
  const { addFinanceCategory, updateFinanceCategory } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: category?.title || "",
      description: category?.description || "",
    },
    validate: zodResolver(schema),
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    let success = false;

    if (category) {
      success = await updateFinanceCategory({
        id: category.id,
        title: values.title,
        description: values.description,
      });
    } else {
      success = await addFinanceCategory({
        title: values.title,
        description: values.description,
      });
    }

    if (success) {
      form.reset();
      onClose();
    } else {
      setError(
        category
          ? "Failed to update finance category. Please try again."
          : "Failed to create finance category. Please try again."
      );
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label="Title"
          placeholder="Enter category title"
          {...form.getInputProps("title")}
          data-autofocus
        />
        <Textarea
          label="Description"
          placeholder="Enter category description"
          {...form.getInputProps("description")}
        />
        {category ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
            title="Update"
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
            title="Create"
          />
        )}
        <CancelButton onClick={onClose} />
        {error && (
          <Alert variant="light" color="red">
            {error}
          </Alert>
        )}
      </Stack>
    </form>
  );
}
