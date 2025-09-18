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
import { IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

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
  onSuccess?: (client: Tables<"finance_client">) => void;
  client?: Tables<"finance_client">;
}

export default function FinanceClientForm({
  onClose,
  onSuccess,
  client,
}: FinanceClientFormProps) {
  const { locale } = useSettingsStore();
  const { addFinanceClient, updateFinanceClient } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
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
    let currentClient: Tables<"finance_client"> | null = null;
    if (client) {
      const response = await updateFinanceClient({
        ...client,
        ...values,
        currency: values.currency as Currency,
      });
      currentClient = response;
    } else {
      const response = await addFinanceClient({
        ...values,
        currency: values.currency as Currency,
      });
      currentClient = response;
    }
    if (currentClient) {
      onSuccess?.(currentClient);
      notifications.show({
        title: locale === "de-DE" ? "Erfolg" : "Success",
        message:
          locale === "de-DE"
            ? `Kunde erfolgreich ${client ? "bearbeitet" : "erstellt"}`
            : `Client ${client ? "edited" : "created"} successfully`,
        icon: <IconCheck />,
        color: "green",
        autoClose: 4000,
        withBorder: true,
        position: "top-center",
      });
      onClose();
      form.reset();
    } else {
      notifications.show({
        title: locale === "de-DE" ? "Fehler" : "Error",
        message:
          locale === "de-DE"
            ? `Kunde konnte nicht ${client ? "bearbeitet" : "erstellt"} werden`
            : `Client could not ${client ? "edited" : "created"}`,
        icon: <IconX />,
        color: "red",
        autoClose: 4000,
        position: "top-center",
        withBorder: true,
      });
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
