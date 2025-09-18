"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Stack,
  Text,
  SegmentedControl,
  Center,
  Switch,
  Group,
  Alert,
  Select,
  Button,
} from "@mantine/core";
import {
  IconMinus,
  IconPlus,
  IconReload,
  IconCircleDashedNumber1,
} from "@tabler/icons-react";
import SingleFinanceForm, {
  SingleFinanceFormValues,
} from "./SingleFinanceForm";
import RecurringFinanceForm, {
  RecurringFinanceFormValues,
} from "./RecurringFinanceForm";
import CancelButton from "@/components/UI/Buttons/CancelButton";

import { CashFlowType } from "@/types/settings.types";

import classes from "../../UI/Switch.module.css";

interface FinanceFormProps {
  onClose: () => void;
  isSingle?: boolean;
  onOpenCategoryForm: () => void;
  categoryId: string | null;
  setCategoryId: (categoryId: string | null) => void;
}

export default function FinanceForm({
  onClose,
  isSingle = true,
  onOpenCategoryForm,
  categoryId,
  setCategoryId,
}: FinanceFormProps) {
  const [type, setType] = useState<CashFlowType>("income");
  const [isRecurring, setIsRecurring] = useState<boolean>(!isSingle);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { locale, defaultFinanceCurrency: financeCurrency } =
    useSettingsStore();
  const { addSingleCashFlow, addRecurringCashFlow, financeCategories } =
    useFinanceStore();

  useEffect(() => {
    if (financeCategories.length > 0) {
      setCategoryId(financeCategories[0].id);
    }
  }, []);

  async function handleSingleFinanceSubmit(values: SingleFinanceFormValues) {
    setIsLoading(true);
    const success = await addSingleCashFlow({
      ...values,
      date: values.date.toISOString(),
      category_id: categoryId,
      type,
    });
    if (!success) {
      setError("Failed to add single cash flow. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  async function handleRecurringFinanceSubmit(
    values: RecurringFinanceFormValues
  ) {
    setIsLoading(true);
    const success = await addRecurringCashFlow({
      ...values,
      end_date: values.end_date?.toISOString(),
      start_date: values.start_date.toISOString(),
      category_id: categoryId,
      type,
    });
    if (!success) {
      setError("Failed to add recurring cash flow. Please try again.");
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
    }
  }

  return (
    <Stack>
      <SegmentedControl
        value={type}
        color="teal"
        onChange={(value) => setType(value as CashFlowType)}
        data={[
          {
            value: "income",
            label: (
              <Center style={{ gap: 10 }}>
                <IconPlus size={16} />
                <Text>{locale === "de-DE" ? "Einnahme" : "Income"}</Text>
              </Center>
            ),
          },
          {
            value: "expense",
            label: (
              <Center style={{ gap: 10 }}>
                <IconMinus size={16} />
                <Text>{locale === "de-DE" ? "Ausgabe" : "Expense"}</Text>
              </Center>
            ),
          },
        ]}
      />
      <Stack gap="xs">
        <Group justify="center">
          <Text>{locale === "de-DE" ? "Einmalig" : "Single"}</Text>
          <IconCircleDashedNumber1 size={16} />
          <Switch
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.currentTarget.checked)}
            classNames={classes}
            size="md"
          />
          <IconReload size={16} />
          <Text>{locale === "de-DE" ? "Wiederkehrend" : "Recurring"}</Text>
        </Group>
        <Group wrap="nowrap">
          <Select
            w="100%"
            data={financeCategories.map((category) => ({
              label: category.title,
              value: category.id,
            }))}
            label={locale === "de-DE" ? "Kategorie" : "Category"}
            placeholder={
              locale === "de-DE" ? "Kategorie auswählen" : "Select a category"
            }
            value={categoryId}
            onChange={(value) => setCategoryId(value)}
            searchable
            clearable
            nothingFoundMessage={
              locale === "de-DE"
                ? "Keine Kategorien gefunden"
                : "No categories found"
            }
            size="sm"
          />
          <Button
            mt={25}
            w={180}
            p={0}
            onClick={onOpenCategoryForm}
            fw={500}
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={20} />}
          >
            <Text fz="xs" c="dimmed">
              {locale === "de-DE" ? "Neue Kategorie" : "Add Category"}
            </Text>
          </Button>
        </Group>
      </Stack>
      {isRecurring ? (
        <RecurringFinanceForm
          financeCurrency={financeCurrency}
          handleSubmit={handleRecurringFinanceSubmit}
          isLoading={isLoading}
        />
      ) : (
        <SingleFinanceForm
          financeCurrency={financeCurrency}
          handleSubmit={handleSingleFinanceSubmit}
          isLoading={isLoading}
        />
      )}
      <CancelButton onClick={onClose} />
      {error && (
        <Alert
          color="red"
          variant="filled"
          title={locale === "de-DE" ? "Fehler" : "Error"}
          withCloseButton
          onClose={() => setError(null)}
        >
          <Text>{error}</Text>
        </Alert>
      )}
    </Stack>
  );
}
