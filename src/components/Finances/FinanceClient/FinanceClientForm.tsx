"use client";

import { useState } from "react";
import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { Fieldset, Select, Stack, TextInput } from "@mantine/core";

import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { currencies } from "@/constants/settings";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import UpdateButton from "@/components/UI/Buttons/UpdateButton";
import { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";
import CancelButton from "@/components/UI/Buttons/CancelButton";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.enum(
    currencies.map((currency) => currency.value) as [string, ...string[]]
  ),
});

interface FinanceClientFormProps {
  onClose: () => void;
  client?: Tables<"client">;
}

export default function FinanceClientForm({
  onClose,
  client,
}: FinanceClientFormProps) {
  const { locale } = useSettingsStore();
  const { addFinanceClient } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      name: client?.name || "",
      description: client?.description || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      currency: client?.currency || "USD",
    },
    validate: zodResolver(schema),
  });

  async function handleSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    const success = await addFinanceClient({
      ...values,
      currency: values.currency as Currency,
    });
    if (!success) {
      setError(
        locale === "de-DE"
          ? "Fehler beim Hinzufügen des Kunden. Bitte versuchen Sie es erneut."
          : "Failed to add finance client. Please try again."
      );
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <Fieldset
          legend={locale === "de-DE" ? "Kunden Details" : "Client details"}
        >
          <Stack>
            <TextInput
              withAsterisk
              label={locale === "de-DE" ? "Name" : "Name"}
              {...form.getInputProps("name")}
              data-autofocus
            />
            <TextInput
              label={locale === "de-DE" ? "Beschreibung" : "Description"}
              {...form.getInputProps("description")}
            />
          </Stack>
        </Fieldset>
        <Fieldset legend={locale === "de-DE" ? "Kontakt" : "Contact"}>
          <TextInput
            label={locale === "de-DE" ? "Email" : "Email"}
            {...form.getInputProps("email")}
          />
          <TextInput
            label={locale === "de-DE" ? "Telefon" : "Phone"}
            {...form.getInputProps("phone")}
          />
          <TextInput
            label={locale === "de-DE" ? "Adresse" : "Address"}
            {...form.getInputProps("address")}
          />
        </Fieldset>
        <Fieldset legend={locale === "de-DE" ? "Finanzen" : "Finances"}>
          <Select
            label={locale === "de-DE" ? "Währung" : "Currency"}
            data={currencies}
            {...form.getInputProps("currency")}
          />
        </Fieldset>
        {client ? (
          <UpdateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            loading={isLoading}
          />
        ) : (
          <CreateButton
            type="submit"
            onClick={form.onSubmit(handleSubmit)}
            loading={isLoading}
          />
        )}
        <CancelButton onClick={onClose} />
      </Stack>
    </form>
  );
}
