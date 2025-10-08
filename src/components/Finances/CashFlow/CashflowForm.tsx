"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAddSingleCashflowMutation } from "@/utils/queries/finances/use-single-cashflow";
import { useFinanceCategoriesQuery } from "@/utils/queries/finances/use-finance-categories";

import {
  Stack,
  Text,
  SegmentedControl,
  Center,
  Switch,
  Group,
  MultiSelect,
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
} from "./Single/SingleFinanceForm";
import RecurringFinanceForm, {
  RecurringFinanceFormValues,
} from "./Recurring/RecurringFinanceForm";
import CancelButton from "@/components/UI/Buttons/CancelButton";

import { CashFlowType } from "@/types/settings.types";

import classes from "../../UI/Switch.module.css";
import { useAddRecurringCashflowMutation } from "@/utils/queries/finances/use_recurring-cashflow";

interface FinanceFormProps {
  onClose: () => void;
  isSingle?: boolean;
  onOpenCategoryForm: () => void;
  categoryIds: string[];
  setCategoryIds: (categoryIds: string[]) => void;
}

export default function FinanceForm({
  onClose,
  isSingle = true,
  onOpenCategoryForm,
  categoryIds,
  setCategoryIds,
}: FinanceFormProps) {
  const [type, setType] = useState<CashFlowType>("income");
  const [isRecurring, setIsRecurring] = useState<boolean>(!isSingle);
  const {
    getLocalizedText,
    defaultFinanceCurrency: financeCurrency,
  } = useSettingsStore();
  const { mutate: addRecurringCashFlow, isPending: isAddingRecurringCashFlow } =
    useAddRecurringCashflowMutation(() => onClose());
  const { data: financeCategories, isPending: isFinanceCategoriesPending } =
    useFinanceCategoriesQuery();
  const { mutate: addSingleCashFlow, isPending: isAddingSingleCashFlow } =
    useAddSingleCashflowMutation(() => onClose());

  async function handleSingleFinanceSubmit(values: SingleFinanceFormValues) {
    addSingleCashFlow({
      cashflow: {
        ...values,
        date: values.date.toISOString(),
        type,
      },
      categoryIds,
    });
  }

  async function handleRecurringFinanceSubmit(
    values: RecurringFinanceFormValues
  ) {
    addRecurringCashFlow({
      cashflow: {
        ...values,
        end_date: values.end_date?.toISOString(),
        start_date: values.start_date.toISOString(),
        type,
      },
      categoryIds,
    });
  }

  return (
    <Stack>
      <SegmentedControl
        value={type}
        color={type === "income" ? "green" : "red"}
        onChange={(value) => setType(value as CashFlowType)}
        data={[
          {
            value: "income",
            label: (
              <Center style={{ gap: 10 }}>
                <IconPlus size={16} />
                <Text>{getLocalizedText("Einnahme", "Income")}</Text>
              </Center>
            ),
          },
          {
            value: "expense",
            label: (
              <Center style={{ gap: 10 }}>
                <IconMinus size={16} />
                <Text>{getLocalizedText("Ausgabe", "Expense")}</Text>
              </Center>
            ),
          },
        ]}
      />
      <Stack gap="xs">
        <Group justify="center">
          <Text>{getLocalizedText("Einmalig", "Single")}</Text>
          <IconCircleDashedNumber1 size={16} />
          <Switch
            checked={isRecurring}
            onChange={(event) => setIsRecurring(event.currentTarget.checked)}
            classNames={classes}
            size="md"
          />
          <IconReload size={16} />
          <Text>{getLocalizedText("Wiederkehrend", "Recurring")}</Text>
        </Group>
        <Group wrap="nowrap">
          <MultiSelect
            w="100%"
            data={financeCategories?.map((category) => ({
              label: category.title,
              value: category.id,
            }))}
            label={getLocalizedText("Kategorie", "Category")}
            placeholder={
              isFinanceCategoriesPending
                ? getLocalizedText("Lädt...", "Loading...")
                : getLocalizedText("Kategorie auswählen", "Select a category")
            }
            value={categoryIds}
            onChange={(value) => setCategoryIds(value)}
            searchable
            clearable
            nothingFoundMessage={getLocalizedText(
              "Keine Kategorien gefunden",
              "No categories found"
            )}
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
              {getLocalizedText("Neue Kategorie", "Add Category")}
            </Text>
          </Button>
        </Group>
      </Stack>
      {isRecurring ? (
        <RecurringFinanceForm
          type={type}
          financeCurrency={financeCurrency}
          handleSubmit={handleRecurringFinanceSubmit}
          isLoading={isAddingRecurringCashFlow}
        />
      ) : (
        <SingleFinanceForm
          type={type}
          financeCurrency={financeCurrency}
          handleSubmit={handleSingleFinanceSubmit}
          isLoading={isAddingSingleCashFlow}
        />
      )}
      <CancelButton onClick={onClose} />
    </Stack>
  );
}
