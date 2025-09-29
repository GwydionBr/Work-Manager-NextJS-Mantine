"use client";

import { useForm } from "@mantine/form";
import { useState } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { TextInput, Stack, Textarea } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

const schema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
});

interface FinanceCategoryFormProps {
  onClose?: () => void;
  onSuccess?: (category: Tables<"finance_category">) => void;
  category?: Tables<"finance_category"> | null;
}

export default function FinanceCategoryForm({
  onClose,
  onSuccess,
  category,
}: FinanceCategoryFormProps) {
  const { locale, getLocalizedText } = useSettingsStore();
  const { addFinanceCategory, updateFinanceCategory } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: category?.title || "",
      description: category?.description || "",
    },
    validate: zodResolver(schema),
  });

  const handleClose = () => {
    form.reset();
    onClose?.();
  };

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
      onSuccess?.(currentCategory);
      showActionSuccessNotification(
        getLocalizedText(
          `Kategorie erfolgreich ${category ? "bearbeitet" : "erstellt"}`,
          `Category successfully ${category ? "edited" : "created"}`
        ),
        locale
      );
      handleClose();
    } else {
      showActionErrorNotification(
        getLocalizedText(
          `Kategorie konnte nicht ${category ? "bearbeitet" : "erstellt"} werden`,
          `Category could not ${category ? "edited" : "created"}`
        ),
        locale
      );
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={form.onSubmit(handleFormSubmit)}>
      <Stack>
        <TextInput
          withAsterisk
          label={getLocalizedText("Name", "Name")}
          placeholder={
            getLocalizedText("Name eingeben", "Enter category name")
          }
          {...form.getInputProps("title")}
          data-autofocus
        />
        <Textarea
          label={getLocalizedText("Beschreibung", "Description")}
          placeholder={
            getLocalizedText("Beschreibung eingeben", "Enter category description")
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
        {onClose && <CancelButton onClick={handleClose} />}
      </Stack>
    </form>
  );
}
