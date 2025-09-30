"use client";

import { useEffect } from "react";
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
  Modal,
} from "@mantine/core";
import { IconArrowDown, IconCashBanknotePlus } from "@tabler/icons-react";
import { currencies } from "@/constants/settings";
import { formatMoney } from "@/utils/formatFunctions";

interface SessionModalFormProps {
  opened: boolean;
  handleClose: () => void;
  startValue: number;
  startCurrency: Currency;
  onSubmit: (values: { endValue: number; endCurrency: Currency }) => void;
  isProcessing: boolean;
}

const schema = z.object({
  endValue: z.number().min(0, { message: "Value must be positive" }),
  endCurrency: z.string().min(1, { message: "Currency is required" }),
});

export default function SessionModalForm({
  opened,
  handleClose,
  startValue,
  startCurrency,
  onSubmit,
  isProcessing,
}: SessionModalFormProps) {
  const { locale, defaultFinanceCurrency } = useSettingsStore();

  const form = useForm({
    initialValues: {
      endValue: Math.round(startValue * 100) / 100,
      endCurrency: defaultFinanceCurrency,
    },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    form.setFieldValue("endCurrency", defaultFinanceCurrency);
  }, [defaultFinanceCurrency]);

  useEffect(() => {
    form.setFieldValue("endValue", Math.round(startValue * 100) / 100);
  }, [startValue]);

  const startValueString = formatMoney(startValue ?? 0, startCurrency, locale);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconCashBanknotePlus size={20} />
          <Text fw={600}>{locale === "de-DE" ? "Auszahlung" : "Payout"}</Text>
        </Group>
      }
      styles={{
        title: {
          fontSize: "1.2rem",
          fontWeight: 600,
        },
        header: {
          borderBottom:
            "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        },
      }}
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <Text>
            {locale === "de-DE" ? "Startwert" : "Start Value"}:{" "}
            {startValueString}
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
            color="violet"
            type="submit"
            loading={isProcessing}
            leftSection={<IconCashBanknotePlus />}
          >
            {locale === "de-DE" ? "Auszahlen" : "Payout"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
