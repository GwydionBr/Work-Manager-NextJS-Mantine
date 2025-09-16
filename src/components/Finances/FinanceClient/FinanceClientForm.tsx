"use client";

import { useForm } from "@mantine/form";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useDisclosure } from "@mantine/hooks";
import { Stack, TextInput, Button } from "@mantine/core";
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

interface FinanceClientFormProps {
  onClose: () => void;
}

export default function FinanceClientForm({ onClose }: FinanceClientFormProps) {
  const { locale } = useSettingsStore();
  const { addFinanceClient } = useFinanceStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: zodResolver(schema),
  });

  async function handleSubmit(values: z.infer<typeof schema>) {
    setIsLoading(true);
    const success = await addFinanceClient(values);
    if (!success) {
      setError("Failed to add finance client. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  return <div>FinanceClientForm</div>;
}