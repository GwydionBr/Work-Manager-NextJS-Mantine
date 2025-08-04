"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useForm, zodResolver } from "@mantine/form";

import { z } from "zod";

import { Currency } from "@/types/settings.types";
import {
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowDown } from "@tabler/icons-react";
import { currencies } from "@/constants/settings";
import { formatMoney } from "@/utils/workHelperFunctions";

interface SessionModalFormProps {
  sessionIds: string[];
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
}

const schema = z.object({
  endValue: z.number().min(0, { message: "Value must be positive" }).optional(),
  endCurrency: z
    .string()
    .min(1, { message: "Currency is required" })
    .optional(),
});

export default function SessionModalForm({
  sessionIds,
  handleClose,
  startValue,
  startCurrency,
}: SessionModalFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const form = useForm({
    initialValues: {
      endValue: startValue,
      endCurrency: startCurrency,
    },
    validate: zodResolver(schema),
  });

  const { payoutSessions } = useWorkStore();

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsProcessing(true);
    const payoutResult = await payoutSessions(
      sessionIds,
      startValue,
      startCurrency,
      null,
      values.endValue ?? null,
      values.endCurrency as Currency | null
    );
    if (payoutResult.success) {
      
      handleClose();
    }
    setIsProcessing(false);
  }

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Text>Start Value: {formatMoney(startValue, startCurrency)}</Text>
        <Divider />
        <Group justify="center">
          <IconArrowDown />
        </Group>
        <Divider />
        <NumberInput label="End Value" {...form.getInputProps("endValue")} />
        <Select
          label="End Currency"
          placeholder="Select currency"
          data={currencies}
          value={form.values.endCurrency}
          onChange={(value) =>
            form.setFieldValue("endCurrency", value as Currency)
          }
          error={form.errors.endCurrency}
        />
        <Button type="submit" loading={isProcessing}>
          Submit
        </Button>
      </Stack>
    </form>
  );
}
