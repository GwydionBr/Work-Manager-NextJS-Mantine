"use client";

import { useState, useEffect } from "react";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Center,
  Drawer,
  Flex,
  SegmentedControl,
  Group,
  Text,
  useDrawersStack,
  Button,
  Stack,
  MultiSelect,
} from "@mantine/core";
import SingleCashFlowForm from "@/components/Finances/CashFlow/Single/SingleFinanceForm";
import RecurringCashFlowForm from "@/components/Finances/CashFlow/Recurring/RecurringFinanceForm";
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
import FinanceCategoryForm from "../FinanceCategoryForm";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { Radio } from "@mantine/core";
import {
  DeleteRecurringCashFlowMode,
  StoreRecurringCashFlow,
  StoreSingleCashFlow,
} from "@/types/finance.types";

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
  cashFlow: StoreSingleCashFlow | StoreRecurringCashFlow;
  opened: boolean;
  onClose: () => void;
}) {
  const { locale, getLocalizedText } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteRecurringCashFlowMode>(
    DeleteRecurringCashFlowMode.delete_all
  );
  const [type, setType] = useState<CashFlowType>("income");
  const [categoryIds, setCategoryIds] = useState<string[]>(
    cashFlow.categoryIds ?? []
  );
  const [pendingValues, setPendingValues] = useState<any>(null);
  const {
    financeCategories,
    updateSingleCashFlow,
    updateRecurringCashFlow,
    updateMultipleSingleCashFlows,
    deleteSingleCashFlows,
    deleteRecurringCashFlow,
  } = useFinanceStore();
  const drawerStack = useDrawersStack([
    "edit-cash-flow",
    "delete-cash-flow",
    "delete-recurring-cash-flow",
    "update-cash-flow",
    "add-category",
  ]);

  useEffect(() => {
    if (cashFlow) {
      setType(cashFlow.type);
    }
  }, [cashFlow, opened]);

  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-cash-flow");
    } else {
      drawerStack.closeAll();
    }
  }, [opened]);

  useEffect(() => {
    if (categoryIds !== cashFlow.categoryIds) {
      setCategoryIds(cashFlow.categoryIds);
    }
  }, [cashFlow]);

  async function handleSubmit(values: any) {
    setIsLoading(true);
    let success = false;

    if (isSingleCashFlow(cashFlow)) {
      success = await updateSingleCashFlow({
        id: cashFlow.id,
        type,
        categoryIds,
        ...values,
      });
      if (success) {
        showActionSuccessNotification(
          getLocalizedText(
            "Einmal-Cashflow erfolgreich aktualisiert",
            "Single cash flow updated successfully"
          ),
          locale
        );
        onClose();
      } else {
        showActionErrorNotification(
          getLocalizedText(
            "Einmal-Cashflow konnte nicht aktualisiert werden",
            "Single cash flow could not be updated"
          ),
          locale
        );
      }
    } else {
      // For recurring cash flows, check if any fields that affect single cash flows have changed
      const hasChanges =
        values.title !== cashFlow.title ||
        values.amount !== cashFlow.amount ||
        values.currency !== cashFlow.currency ||
        type !== cashFlow.type ||
        categoryIds !== cashFlow.categoryIds;

      if (hasChanges) {
        // Store the values and show the update modal
        setPendingValues({
          id: cashFlow.id,
          type,
          categoryIds,
          ...values,
        });
        drawerStack.open("update-cash-flow");
      } else {
        // No changes that affect single cash flows, just update the recurring cash flow
        success = await updateRecurringCashFlow({
          id: cashFlow.id,
          type,
          categoryIds,
          ...values,
        });
        if (success) {
          showActionSuccessNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow erfolgreich aktualisiert",
              "Recurring cash flow updated successfully"
            ),
            locale
          );
          onClose();
        } else {
          showActionErrorNotification(
            getLocalizedText(
              "Wiederkehrender Cashflow konnte nicht aktualisiert werden",
              "Recurring cash flow could not be updated"
            ),
            locale
          );
        }
      }
    }
    setIsLoading(false);
  }

  async function handleSingleDelete() {
    if (!isSingleCashFlow(cashFlow)) return;
    const success = await deleteSingleCashFlows([cashFlow.id]);
    if (success) {
      showActionSuccessNotification(
        getLocalizedText(
          "Cashflow erfolgreich gelöscht",
          "Cashflow deleted successfully"
        ),
        locale
      );
      onClose();
    } else {
      showActionErrorNotification(
        getLocalizedText(
          "Cashflow konnte nicht gelöscht werden",
          "Cashflow could not be deleted"
        ),
        locale
      );
    }
  }

  async function handleDeleteRecurringWithMode(
    mode: DeleteRecurringCashFlowMode
  ) {
    if (isSingleCashFlow(cashFlow)) return;
    const success = await deleteRecurringCashFlow(cashFlow.id, mode);
    if (success) {
      showActionSuccessNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow erfolgreich gelöscht",
          "Recurring cash flow deleted successfully"
        ),
        locale
      );
      onClose();
    } else {
      showActionErrorNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow konnte nicht gelöscht werden",
          "Recurring cash flow could not be deleted"
        ),
        locale
      );
    }
  }

  async function handleDeactivateRecurring() {
    if (isSingleCashFlow(cashFlow)) return;
    setIsLoading(true);
    const success = await updateRecurringCashFlow({
      ...cashFlow,
      end_date: new Date().toISOString(),
      categoryIds,
    });
    if (success) {
      showActionSuccessNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow erfolgreich deaktiviert",
          "Recurring cash flow deactivated successfully"
        ),
        locale
      );
      onClose();
    } else {
      showActionErrorNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow konnte nicht deaktiviert werden",
          "Recurring cash flow could not be deactivated"
        ),
        locale
      );
    }
    setIsLoading(false);
  }

  async function handleUpdateAll() {
    if (!pendingValues) return;

    setIsLoading(true);

    const categoryUpdates = {
      deleteIds: cashFlow.categoryIds.filter(
        (id: string) => !pendingValues.categoryIds.includes(id)
      ),
      addIds: pendingValues.categoryIds.filter(
        (id: string) => !cashFlow.categoryIds.includes(id)
      ),
    };

    console.log()

    // First update the recurring cash flow
    const recurringSuccess = await updateRecurringCashFlow(pendingValues);

    if (recurringSuccess) {
      // Then update all related single cash flows
      const singleUpdates = {
        title: pendingValues.title,
        amount: pendingValues.amount,
        currency: pendingValues.currency,
        type: pendingValues.type,
        // categoryIds: pendingValues.categoryIds,
      };

      const singleSuccess = await updateMultipleSingleCashFlows(
        cashFlow.id,
        singleUpdates,
        categoryUpdates
      );

      if (singleSuccess) {
        showActionSuccessNotification(
          getLocalizedText(
            "Einmal-Cashflows erfolgreich aktualisiert",
            "Single cash flows updated successfully"
          ),
          locale
        );
        onClose();
      } else {
        showActionErrorNotification(
          getLocalizedText(
            "Einmal-Cashflows konnten nicht aktualisiert werden",
            "Single cash flows could not be updated"
          ),
          locale
        );
      }
    }

    setIsLoading(false);
  }

  async function handleUpdateRecurringOnly() {
    if (!pendingValues) return;

    setIsLoading(true);
    const success = await updateRecurringCashFlow(pendingValues);
    if (success) {
      showActionSuccessNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow erfolgreich aktualisiert",
          "Recurring cash flow updated successfully"
        ),
        locale
      );
      onClose();
    } else {
      showActionErrorNotification(
        getLocalizedText(
          "Wiederkehrender Cashflow konnte nicht aktualisiert werden",
          "Recurring cash flow could not be updated"
        ),
        locale
      );
    }
    setIsLoading(false);
  }

  const handleAddCategory = (category: Tables<"finance_category">) => {
    setCategoryIds((prev) => [...prev, category.id]);
  };

  return (
    <Drawer.Stack>
      <Drawer
        {...drawerStack.register("edit-cash-flow")}
        onClose={onClose}
        title={
          <Group>
            <DeleteActionIcon
              tooltipLabel={getLocalizedText(
                "Cashflow löschen",
                "Delete Cash Flow"
              )}
              onClick={() => drawerStack.open("delete-cash-flow")}
            />
            <Text>
              {getLocalizedText("Cashflow bearbeiten", "Edit Cash Flow")}
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
          <Group wrap="nowrap">
            <MultiSelect
              w="100%"
              data={financeCategories.map((category) => ({
                label: category.title,
                value: category.id,
              }))}
              label={getLocalizedText("Kategorie", "Category")}
              placeholder={getLocalizedText(
                "Kategorie auswählen",
                "Select a category"
              )}
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
              onClick={() => drawerStack.open("add-category")}
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
          {isSingleCashFlow(cashFlow) ? (
            <SingleCashFlowForm
              type={type}
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              cashFlow={cashFlow}
            />
          ) : (
            <RecurringCashFlowForm
              type={type}
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              cashFlow={cashFlow}
            />
          )}
          <CancelButton
            onClick={onClose}
            tooltipLabel={getLocalizedText("Abbrechen", "Cancel")}
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
              {getLocalizedText("Cashflow löschen", "Delete Cash Flow")}
            </Text>
          </Group>
        }
      >
        <Text>
          {getLocalizedText(
            "Sind Sie sicher, dass Sie diesen Cashflow löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
            "Are you sure you want to delete this cash flow? This action cannot be undone."
          )}
        </Text>
        <Group mt="md" justify="flex-end" gap="sm">
          <CancelButton
            onClick={() => drawerStack.close("delete-cash-flow")}
            color="teal"
          />
          <DeleteButton
            onClick={() => {
              if (isSingleCashFlow(cashFlow)) {
                handleSingleDelete();
              } else {
                drawerStack.open("delete-recurring-cash-flow");
              }
            }}
          />
        </Group>
      </Drawer>

      <Drawer
        {...drawerStack.register("delete-recurring-cash-flow")}
        onClose={() => {
          drawerStack.close("delete-cash-flow");
          drawerStack.close("delete-recurring-cash-flow");
        }}
        title={
          <Group>
            <IconAlertHexagonFilled size={25} color="red" />
            <Text>
              {getLocalizedText(
                "Wiederkehrender Cashflow löschen",
                "Delete Recurring Cash Flow"
              )}
            </Text>
          </Group>
        }
      >
        <Stack gap="md">
          <Text>
            {getLocalizedText(
              "Wie möchten Sie mit den verknüpften Einmal-Cashflows verfahren?",
              "How should linked single cash flows be handled?"
            )}
          </Text>
          <Radio.Group
            value={deleteMode}
            onChange={(v) => setDeleteMode(v as any)}
          >
            <Stack gap={6}>
              <Radio
                value={DeleteRecurringCashFlowMode.delete_all}
                label={getLocalizedText(
                  "Alle verknüpften Einmal-Cashflows ebenfalls löschen",
                  "Also delete all linked single cash flows"
                )}
              />
              <Radio
                value={DeleteRecurringCashFlowMode.keep_unlinked}
                label={getLocalizedText(
                  "Einmal-Cashflows behalten (Verknüpfung entfernen)",
                  "Keep single cash flows (unlink from recurring)"
                )}
              />
            </Stack>
          </Radio.Group>

          <Group justify="space-between" mt="sm">
            <Button
              variant="light"
              color="gray"
              onClick={handleDeactivateRecurring}
              loading={isLoading}
            >
              {getLocalizedText(
                "Stattdessen deaktivieren",
                "Deactivate instead"
              )}
            </Button>
            <Group gap="sm">
              <CancelButton
                onClick={() => {
                  drawerStack.close("delete-cash-flow");
                  drawerStack.close("delete-recurring-cash-flow");
                }}
                color="teal"
              />
              <DeleteButton
                onClick={() => handleDeleteRecurringWithMode(deleteMode)}
              />
            </Group>
          </Group>
        </Stack>
      </Drawer>

      <Drawer
        {...drawerStack.register("update-cash-flow")}
        onClose={() => drawerStack.close("update-cash-flow")}
        title={getLocalizedText(
          "Bestehende Cashflows aktualisieren",
          "Update Existing Cash Flows"
        )}
      >
        <Stack gap="md">
          <Group gap="sm">
            <IconAlertTriangle size={24} color="orange" />
            <Text size="sm" c="dimmed">
              {getLocalizedText(
                "Sie haben Änderungen an einem wiederkehrenden Cashflow vorgenommen. Möchten Sie alle bestehenden Einmalzahlungen, die aus diesem Wiederholungsmuster erstellt wurden, aktualisieren?",
                "You've made changes to a recurring cash flow. Would you like to update all existing single cash flows that were created from this recurring pattern?"
              )}
            </Text>
          </Group>

          <Text size="sm" c="dimmed">
            {getLocalizedText(
              "Dies wird den Titel, den Betrag, die Währung und die Kategorie aller vergangenen und aktuellen Cashflows aktualisieren, die aus diesem Wiederholungsmuster generiert wurden. Zukünftige Cashflows werden automatisch die neuen Einstellungen verwenden.",
              "This will update the title, amount, currency, and category of all past and current cash flows that were generated from this recurring pattern. Future cash flows will automatically use the new settings."
            )}
          </Text>

          <Group justify="flex-end" gap="sm">
            <Button
              variant="outline"
              onClick={handleUpdateRecurringOnly}
              disabled={isLoading}
            >
              {getLocalizedText("Nein, beibehalten", "No, keep existing")}
            </Button>
            <Button color="blue" onClick={handleUpdateAll} loading={isLoading}>
              {getLocalizedText("Ja, aktualisieren", "Yes, update all")}
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
              {getLocalizedText("Kategorie hinzufügen", "Add Category")}
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
