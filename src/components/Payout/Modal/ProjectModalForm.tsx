"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";
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
  Alert,
} from "@mantine/core";
import { IconArrowDown, IconBrandCashapp } from "@tabler/icons-react";
import { currencies } from "@/constants/settings";
import { formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";

interface ProjectModalFormProps {
  project: Tables<"timer_project">;
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
  categoryId: string | null;
}

const schema = z.object({
  endValue: z.number().min(0, { message: "Value must be positive" }),
  endCurrency: z.string().min(1, { message: "Currency is required" }),
});

export default function ProjectModalForm({
  project,
  handleClose,
  startValue,
  startCurrency,
  categoryId,
}: ProjectModalFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      endValue: startValue,
      endCurrency: startCurrency,
    },
    validate: zodResolver(schema),
  });

  const { payoutProjectSalary, updateProject } = useWorkStore();
  const { addExistingSingleCashFlow } = useFinanceStore();
  const { locale } = useSettingsStore();

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsProcessing(true);
    const payoutResult = await payoutProjectSalary(
      project.id,
      startValue,
      startCurrency,
      categoryId,
      values.endValue !== startValue ? values.endValue : null,
      values.endCurrency !== startCurrency
        ? (values.endCurrency as Currency)
        : null
    );

    if (payoutResult.success) {
      addExistingSingleCashFlow(payoutResult.data.cashFlow);
      updateProject({
        ...project,
        total_payout: startValue + project.total_payout,
      });
      handleClose();
    } else {
      setError("Failed to process payout");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
    setIsProcessing(false);
  }

  const startValueString = formatMoney(startValue ?? 0, startCurrency, locale);

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        <Text>Start Value: {startValueString}</Text>
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
        <Button type="submit" loading={isProcessing} leftSection={<IconBrandCashapp />}>
          Submit
        </Button>
        <Alert title="Error" color="red" hidden={!error}>
          {error}
        </Alert>
      </Stack>
    </form>
  );
}
