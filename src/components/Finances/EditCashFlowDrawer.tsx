"use client";

import { useState } from "react";
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
} from "@mantine/core";
import SingleCashFlowForm from "@/components/Finances/Form/SingleFinanceForm";
import RecurringCashFlowForm from "@/components/Finances/Form/RecurringFinanceForm";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import UpdateRecurringCashFlowsModal from "@/components/Finances/Recurring/UpdateRecurringCashFlowsModal";

import { Tables } from "@/types/db.types";
import { IconMinus, IconPlus, IconCashMove } from "@tabler/icons-react";
import { CashFlowType } from "@/types/settings.types";

// Type guard to distinguish between single and recurring cash flows
function isSingleCashFlow(
  cashFlow: Tables<"single_cash_flow"> | Tables<"recurring_cash_flow">
): cashFlow is Tables<"single_cash_flow"> {
  return "date" in cashFlow && !("interval" in cashFlow);
}

export default function EditCashFlowButton({
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
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [
    updateModalOpened,
    { open: openUpdateModal, close: closeUpdateModal },
  ] = useDisclosure(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const {
    financeCategories,
    updateSingleCashFlow,
    updateRecurringCashFlow,
    updateMultipleSingleCashFlows,
    deleteSingleCashFlow,
    deleteRecurringCashFlow,
  } = useFinanceStore();
  const drawerStack = useDrawersStack(["edit-cash-flow", ]);
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
        openUpdateModal();
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
      closeDeleteModal();
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
        closeUpdateModal();
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
      closeUpdateModal();
      onClose();
    }
    setIsLoading(false);
  }

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title={
          <Group>
            <IconCashMove />
            <Text>
              {locale === "de-DE" ? "Cashflow bearbeiten" : "Edit Cash Flow"}
            </Text>
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
          <Select
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
          <DeleteButton onClick={openDeleteModal} />
        </Flex>
      </Drawer>

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title={locale === "de-DE" ? "Cashflow löschen" : "Delete Cash Flow"}
        message={
          locale === "de-DE"
            ? "Sind Sie sicher, dass Sie diesen Cashflow löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
            : "Are you sure you want to delete this cash flow? This action cannot be undone."
        }
      />

      <UpdateRecurringCashFlowsModal
        opened={updateModalOpened}
        onClose={closeUpdateModal}
        onConfirm={handleUpdateAll}
        onCancel={handleUpdateRecurringOnly}
        isLoading={isLoading}
      />
    </>
  );
}
