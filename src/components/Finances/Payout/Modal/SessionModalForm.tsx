"use client";

import { useState } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";

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
import { formatDate, formatMoney } from "@/utils/formatFunctions";
import { showActionSuccessNotification } from "@/utils/notificationFunctions";

interface SessionModalFormProps {
  sessionIds: string[];
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
  categoryId: string | null;
  projectTitle: string;
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
  projectTitle,
}: SessionModalFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    initialValues: {
      endValue: Math.round(startValue * 100) / 100,
      endCurrency: startCurrency,
    },
    validate: zodResolver(schema),
  });

  const { payoutSessions } = useWorkStore();
  const { addExistingSingleCashFlow } = useFinanceStore();
  const { locale } = useSettingsStore();

  async function onSubmit(values: z.infer<typeof schema>) {
    setIsProcessing(true);
    setError(null);
    console.log("Start payout");

    try {
      // Create a timeout promise that rejects after 30 seconds
      console.log("Start try Block");
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              locale === "de-DE"
                ? "Die Auszahlung dauert zu lange. Bitte versuchen Sie es erneut."
                : "Payout is taking too long. Please try again."
            )
          );
        }, 15000); // 15 seconds timeout
      });

      // Race between the payout operation and the timeout
      const title = `Payout (${projectTitle}) ${formatDate(new Date(), locale)}`;
      console.log("Start server call");
      const payoutResult = await Promise.race([
        payoutSessions(
          sessionIds,
          startValue,
          title,
          startCurrency,
          categoryId,
          values.endValue !== startValue ? values.endValue : null,
          values.endCurrency !== startCurrency
            ? (values.endCurrency as Currency)
            : null
        ),
        timeoutPromise,
      ]);
      console.log("Payout result from Modal", payoutResult);
      if (payoutResult.success) {
        addExistingSingleCashFlow(payoutResult.data.cashFlow);
        showActionSuccessNotification(
          locale === "de-DE" ? "Auszahlung erfolgreich" : "Payout successful",
          locale
        );
        handleClose();
      } else {
        setError(payoutResult.error);
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (error) {
      // Handle timeout or other errors
      console.log("Error from Modal: ", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : locale === "de-DE"
            ? "Ein unbekannter Fehler ist aufgetreten."
            : "An unknown error occurred.";

      setError(errorMessage);
      setTimeout(() => {
        setError(null);
      }, 5000); // Show timeout errors longer
    } finally {
      setIsProcessing(false);
    }
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
