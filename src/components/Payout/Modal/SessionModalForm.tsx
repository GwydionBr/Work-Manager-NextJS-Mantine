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

interface SessionModalFormProps {
  sessionIds: string[];
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
  categoryId: string | null;
}

const schema = z.object({
  endValue: z.number().min(0, { message: "Value must be positive" }),
  endCurrency: z.string().min(1, { message: "Currency is required" }),
});

export default function SessionModalForm({
  sessionIds,
  handleClose,
  startValue,
  startCurrency,
  categoryId,
}: SessionModalFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      endValue: startValue,
      endCurrency: startCurrency,
    },
    validate: zodResolver(schema),
  });

  const { payoutSessions } = useWorkStore();
  const { addExistingSingleCashFlow } = useFinanceStore();
  const { locale } = useSettingsStore();

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsProcessing(true);
    const payoutResult = await payoutSessions(
      sessionIds,
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
      handleClose();
    } else {
      setError(payoutResult.error);
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
        <Text>
          {locale === "de-DE" ? "Startwert" : "Start Value"}: {startValueString}
        </Text>
        <Divider />
        <Group justify="center">
          <IconArrowDown />
        </Group>
        <Divider />
        <NumberInput
          label={locale === "de-DE" ? "Endwert" : "End Value"}
          {...form.getInputProps("endValue")}
        />
        <Select
          label={locale === "de-DE" ? "Endwährung" : "End Currency"}
          placeholder={
            locale === "de-DE" ? "Währung auswählen" : "Select currency"
          }
          data={currencies}
          value={form.values.endCurrency}
          onChange={(value) =>
            form.setFieldValue("endCurrency", value as Currency)
          }
          error={form.errors.endCurrency}
        />
        <Button
          type="submit"
          loading={isProcessing}
          leftSection={<IconBrandCashapp />}
        >
          {locale === "de-DE" ? "Auszahlen" : "Payout"}
        </Button>
        <Alert
          title={locale === "de-DE" ? "Fehler" : "Error"}
          color="red"
          hidden={!error}
        >
          {error}
        </Alert>
      </Stack>
    </form>
  );
}
