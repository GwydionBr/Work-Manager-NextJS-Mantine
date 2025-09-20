"use client";

import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { z } from "zod";
import { Box, Button, Group, NumberInput, Select } from "@mantine/core";
import { TextInput } from "@mantine/core";
import { zodResolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import CreateButton from "@/components/UI/Buttons/CreateButton";
import { useState } from "react";

const schema = z.object({
  amount: z.number(),
  description: z.string().optional(),
  client_id: z.string().optional(),
});

interface FinanceAdjustmentFormProps {
  onClose: () => void;
  projectId: string;
}

export default function FinanceAdjustmentForm({
  onClose,
  projectId,
}: FinanceAdjustmentFormProps) {
  const { locale } = useSettingsStore();
  const { financeClients, addFinanceAdjustment } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    initialValues: {
      amount: 0,
      description: "",
      client_id: "",
    },
    validate: zodResolver(schema),
  });
  const handleSubmit = async (values: z.infer<typeof schema>) => {
    setIsLoading(true);
    const response = await addFinanceAdjustment({
      ...values,
      client_id: values.client_id || null,
      finance_project_id: projectId,
    });
    if (response) {
      notifications.show({
        title: locale === "de-DE" ? "Erfolg" : "Success",
        message:
          locale === "de-DE"
            ? "Anpassung erfolgreich erstellt"
            : "Adjustment created successfully",
        icon: <IconCheck />,
        color: "green",
        autoClose: 4000,
        withBorder: true,
        position: "top-center",
      });
      handleClose();
    } else {
      notifications.show({
        title: locale === "de-DE" ? "Fehler" : "Error",
        message:
          locale === "de-DE"
            ? "Anpassung konnte nicht erstellt werden"
            : "Adjustment could not be created",
        icon: <IconX />,
        color: "red",
        autoClose: 4000,
        withBorder: true,
        position: "top-center",
      });
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const clientOptions = financeClients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group>
        <NumberInput
          withAsterisk
          allowLeadingZeros={false}
          label={locale === "de-DE" ? "Betrag" : "Amount"}
          {...form.getInputProps("amount")}
          data-autofocus
        />
        <TextInput
          label={locale === "de-DE" ? "Beschreibung" : "Description"}
          {...form.getInputProps("description")}
        />
        <Select
          allowDeselect
          searchable
          clearable
          label={locale === "de-DE" ? "Kunde" : "Client"}
          {...form.getInputProps("client_id")}
          data={clientOptions}
        />
        <Box mt="lg">
          <CreateButton
            onClick={form.onSubmit(handleSubmit)}
            loading={isLoading}
          />
        </Box>
      </Group>
    </form>
  );
}
