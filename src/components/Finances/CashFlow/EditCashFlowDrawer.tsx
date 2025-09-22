"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Center,
  Drawer,
  Flex,
  SegmentedControl,
  Select,
  Group,
  Text,
  useDrawersStack,
  Button,
  Stack,
  Popover,
} from "@mantine/core";
import SingleCashFlowForm from "@/components/Finances/Form/SingleFinanceForm";
import RecurringCashFlowForm from "@/components/Finances/Form/RecurringFinanceForm";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";

import { Tables } from "@/types/db.types";
import {
  IconMinus,
  IconPlus,
  IconCashMove,
  IconAlertHexagonFilled,
  IconAlertTriangle,
  IconCategoryPlus,
} from "@tabler/icons-react";
import { CashFlowType } from "@/types/settings.types";
import CancelButton from "../../UI/Buttons/CancelButton";
import DeleteActionIcon from "../../UI/ActionIcons/DeleteActionIcon";
import FinanceCategoryForm from "../Form/FinanceCategoryForm";

// Type guard to distinguish between single and recurring cash flows
function isSingleCashFlow(
  cashFlow: Tables<"single_cash_flow"> | Tables<"recurring_cash_flow">
): cashFlow is Tables<"single_cash_flow"> {
  return "date" in cashFlow && !("interval" in cashFlow);
}

export default function EditCashFlowDrawer({
  cashFlow,
  opened,
  onClose,
}: {
  cashFlow: Tables<"single_cash_flow"> | Tables<"recurring_cash_flow">;
  opened: boolean;
  onClose: () => void;
}) {
  const { locale } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<CashFlowType>(
    cashFlow.type === "income" ? "income" : "expense"
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    cashFlow.category_id ?? null
  );
  const [pendingValues, setPendingValues] = useState<any>(null);
  const {
    financeCategories,
    updateSingleCashFlow,
    updateRecurringCashFlow,
    updateMultipleSingleCashFlows,
    deleteSingleCashFlow,
    deleteRecurringCashFlow,
  } = useFinanceStore();
  const drawerStack = useDrawersStack([
    "edit-cash-flow",
    "delete-cash-flow",
    "update-cash-flow",
    "add-category",
  ]);

  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-cash-flow");
    } else {
      drawerStack.closeAll();
    }
  }, [opened]);

  useEffect(() => {
    if (categoryId !== cashFlow.category_id) {
      setCategoryId(cashFlow.category_id);
    }
  }, [cashFlow]);

  async function handleSubmit(values: any) {
    setIsLoading(true);
    let success = false;

    if (isSingleCashFlow(cashFlow)) {
      success = await updateSingleCashFlow({
        id: cashFlow.id,
        type,
        category_id: categoryId,
        ...values,
      });
      if (success) {
        onClose();
      }
    } else {
      // For recurring cash flows, check if any fields that affect single cash flows have changed
      const hasChanges =
        values.title !== cashFlow.title ||
        values.amount !== cashFlow.amount ||
        values.currency !== cashFlow.currency ||
        type !== cashFlow.type ||
        categoryId !== cashFlow.category_id;

      if (hasChanges) {
        // Store the values and show the update modal
        setPendingValues({
          id: cashFlow.id,
          type,
          category_id: categoryId,
          ...values,
        });
        drawerStack.open("update-cash-flow");
      } else {
        // No changes that affect single cash flows, just update the recurring cash flow
        success = await updateRecurringCashFlow({
          id: cashFlow.id,
          type,
          category_id: categoryId,
          ...values,
        });
        if (success) {
          onClose();
        }
      }
    }
    setIsLoading(false);
  }

  async function handleDelete() {
    let success = false;
    if (isSingleCashFlow(cashFlow)) {
      success = await deleteSingleCashFlow(cashFlow.id);
    } else {
      success = await deleteRecurringCashFlow(cashFlow.id);
    }
    if (success) {
      onClose();
    }
  }

  async function handleUpdateAll() {
    if (!pendingValues) return;

    setIsLoading(true);

    // First update the recurring cash flow
    const recurringSuccess = await updateRecurringCashFlow(pendingValues);

    if (recurringSuccess) {
      // Then update all related single cash flows
      const singleUpdates = {
        title: pendingValues.title,
        amount: pendingValues.amount,
        currency: pendingValues.currency,
        type: pendingValues.type,
        category_id: pendingValues.category_id,
      };

      const singleSuccess = await updateMultipleSingleCashFlows(
        cashFlow.id,
        singleUpdates
      );

      if (singleSuccess) {
        drawerStack.close("update-cash-flow");
        onClose();
      }
    }

    setIsLoading(false);
  }

  async function handleUpdateRecurringOnly() {
    if (!pendingValues) return;

    setIsLoading(true);
    const success = await updateRecurringCashFlow(pendingValues);
    if (success) {
      onClose();
    }
    setIsLoading(false);
  }

  const handleAddCategory = (category: Tables<"finance_category">) => {
    setCategoryId(category.id);
  };

  return (
    <Drawer.Stack>
      <Drawer
        {...drawerStack.register("edit-cash-flow")}
        onClose={onClose}
        title={
          <Group>
            <DeleteActionIcon
              tooltipLabel={
                locale === "de-DE" ? "Cashflow löschen" : "Delete Cash Flow"
              }
              onClick={() => drawerStack.open("delete-cash-flow")}
            />
            <Text>
              {locale === "de-DE" ? "Cashflow bearbeiten" : "Edit Cash Flow"}
            </Text>
            <IconCashMove />
          </Group>
        }
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
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
                    <span>{locale === "de-DE" ? "Einnahme" : "Income"}</span>
                  </Center>
                ),
              },
              {
                value: "expense",
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconMinus size={16} />
                    <span>{locale === "de-DE" ? "Ausgabe" : "Expense"}</span>
                  </Center>
                ),
              },
            ]}
          />
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
              onClick={() => drawerStack.open("add-category")}
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
          {isSingleCashFlow(cashFlow) ? (
            <SingleCashFlowForm
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              cashFlow={cashFlow}
            />
          ) : (
            <RecurringCashFlowForm
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              cashFlow={cashFlow}
            />
          )}
          <CancelButton
            onClick={onClose}
            tooltipLabel={locale === "de-DE" ? "Abbrechen" : "Cancel"}
          />
        </Flex>
      </Drawer>

      <Drawer
        {...drawerStack.register("delete-cash-flow")}
        onClose={() => drawerStack.close("delete-cash-flow")}
        title={
          <Group>
            <IconAlertHexagonFilled size={25} color="red" />
            <Text>
              {locale === "de-DE" ? "Cashflow löschen" : "Delete Cash Flow"}
            </Text>
          </Group>
        }
      >
        <Text>
          {locale === "de-DE"
            ? "Sind Sie sicher, dass Sie diesen Cashflow löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
            : "Are you sure you want to delete this cash flow? This action cannot be undone."}
        </Text>
        <Group mt="md" justify="flex-end" gap="sm">
          <CancelButton
            onClick={() => drawerStack.close("delete-cash-flow")}
            color="teal"
          />
          <DeleteButton onClick={handleDelete} />
        </Group>
      </Drawer>

      <Drawer
        {...drawerStack.register("update-cash-flow")}
        onClose={() => drawerStack.close("update-cash-flow")}
        title={
          locale === "de-DE"
            ? "Bestehende Cashflows aktualisieren"
            : "Update Existing Cash Flows"
        }
      >
        <Stack gap="md">
          <Group gap="sm">
            <IconAlertTriangle size={24} color="orange" />
            <Text size="sm" c="dimmed">
              {locale === "de-DE"
                ? "Sie haben Änderungen an einem wiederkehrenden Cashflow vorgenommen. Möchten Sie alle bestehenden Einmalzahlungen, die aus diesem Wiederholungsmuster erstellt wurden, aktualisieren?"
                : "You've made changes to a recurring cash flow. Would you like to update all existing single cash flows that were created from this recurring pattern?"}
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            {locale === "de-DE"
              ? "Dies wird den Titel, den Betrag, die Währung und die Kategorie aller vergangenen und aktuellen Cashflows aktualisieren, die aus diesem Wiederholungsmuster generiert wurden. Zukünftige Cashflows werden automatisch die neuen Einstellungen verwenden."
              : "This will update the title, amount, currency, and category of all past and current cash flows that were generated from this recurring pattern. Future cash flows will automatically use the new settings."}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={handleUpdateRecurringOnly}
              disabled={isLoading}
            >
              {locale === "de-DE" ? "Nein, beibehalten" : "No, keep existing"}
            </Button>
            <Button color="blue" onClick={handleUpdateAll} loading={isLoading}>
              {locale === "de-DE" ? "Ja, aktualisieren" : "Yes, update all"}
            </Button>
          </Group>
        </Stack>
      </Drawer>
      <Drawer
        {...drawerStack.register("add-category")}
        onClose={() => drawerStack.close("add-category")}
        title={
          <Group>
            <IconCategoryPlus />
            <Text>
              {locale === "de-DE" ? "Kategorie hinzufügen" : "Add Category"}
            </Text>
          </Group>
        }
      >
        <FinanceCategoryForm
          onClose={() => drawerStack.close("add-category")}
          onSuccess={handleAddCategory}
        />
      </Drawer>
    </Drawer.Stack>
  );
}
