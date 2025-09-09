"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { notifications } from "@mantine/notifications";

import { TextInput, Stack, Textarea } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import { IconCheck, IconX } from "@tabler/icons-react";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

interface FinanceCategoryFormProps {
  onClose: () => void;
  onSuccess?: (category: Tables<"finance_category">) => void;
  category?: {
    id: string;
    title: string;
    description: string | null;
  } | null;
}

export default function FinanceCategoryForm({
  onClose,
  onSuccess,
  category,
}: FinanceCategoryFormProps) {
  const { locale } = useSettingsStore();
  const { addFinanceCategory, updateFinanceCategory } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: category?.title || "",
      description: category?.description || "",
    },
    validate: zodResolver(schema),
  });

  async function handleFormSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    let currentCategory: Tables<"finance_category"> | null = null;

    if (category) {
      const updatedCategory = await updateFinanceCategory({
        id: category.id,
        title: values.title,
        description: values.description,
      });
      currentCategory = updatedCategory;
    } else {
      const newCategory = await addFinanceCategory({
        title: values.title,
        description: values.description,
      });
      currentCategory = newCategory;
    }

    if (currentCategory) {
      form.reset();
      onClose();
      onSuccess?.(currentCategory);
      notifications.show({
        title:
          locale === "de-DE"
            ? "Kategorie erfolgreich erstellt"
            : "Category created successfully",
        message:
          locale === "de-DE"
            ? "Kategorie erfolgreich erstellt"
            : "Category created successfully",
        icon: <IconCheck />,
        color: "green",
        autoClose: 4000,
        withBorder: true,
        position: "top-center",
      });
    } else {
      notifications.show({
        title:
          locale === "de-DE"
            ? "Kategorie konnte nicht erstellt werden"
            : "Category could not be created",
        message:
          locale === "de-DE"
            ? "Kategorie konnte nicht erstellt werden"
            : "Category could not be created",
        icon: <IconX />,
        color: "red",
        autoClose: 4000,
        position: "top-center",
        withBorder: true,
      });
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={locale === "de-DE" ? "Name" : "Title"}
          placeholder={
            locale === "de-DE" ? "Name eingeben" : "Enter category title"
          }
          {...form.getInputProps("title")}
          data-autofocus
        />
        <Textarea
          label={locale === "de-DE" ? "Beschreibung" : "Description"}
          placeholder={
            locale === "de-DE"
              ? "Beschreibung eingeben"
              : "Enter category description"
          }
          {...form.getInputProps("description")}
        />
        {category ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleFormSubmit)}
            loading={isLoading}
          />
        )}
        <CancelButton onClick={onClose} />
      </Stack>
    </form>
  );
}
