"use client";

import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { Tables } from "@/types/db.types";
import { z } from "zod";
import { Group, Select, Stack } from "@mantine/core";
import { TextInput } from "@mantine/core";
import { zodResolver } from "mantine-form-zod-resolver";

const schema = z.object({
  amount: z.number().min(0, "Amount must be greater than 0"),
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
  const { financeClients } = useFinanceStore();
  const form = useForm({
    initialValues: {
      amount: 0,
      description: "",
      client_id: "",
    },
    validate: zodResolver(schema),
  });
  const handleSubmit = (values: z.infer<typeof schema>) => {
    console.log(values);
  };

  const clientOptions = financeClients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group>
        <TextInput
          withAsterisk
          label={locale === "de-DE" ? "Betrag" : "Amount"}
          {...form.getInputProps("amount")}
        />
        <TextInput
          label={locale === "de-DE" ? "Beschreibung" : "Description"}
          {...form.getInputProps("description")}
        />
        <Select
          label={locale === "de-DE" ? "Kunde" : "Client"}
          {...form.getInputProps("client_id")}
          data={clientOptions}
        />
      </Group>
    </form>
  );
}
