"use client";

import { useState, useEffect } from "react";
import { useFormatter } from "@/hooks/useFormatter";

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
import FinanceCategoryForm from "../Category/FinanceCategoryForm";
import { Radio } from "@mantine/core";
import {
  DeleteRecurringCashFlowMode,
  RecurringCashFlow,
  SingleCashFlow,
  UpdateRecurringCashFlow,
  UpdateSingleCashFlow,
} from "@/types/finance.types";
import { useFinanceCategoriesQuery } from "@/utils/queries/finances/use-finance-category";
import {
  useDeleteSingleCashflowMutation,
  useUpdateSingleCashflowMutation,
} from "@/utils/queries/finances/use-single-cashflow";
import {
  useDeleteRecurringCashflowMutation,
  useUpdateRecurringCashflowMutation,
} from "@/utils/queries/finances/use-recurring-cashflow";

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
  cashFlow: SingleCashFlow | RecurringCashFlow;
  opened: boolean;
  onClose: () => void;
}) {
  const { getLocalizedText } = useFormatter();
  const [deleteMode, setDeleteMode] = useState<DeleteRecurringCashFlowMode>(
    DeleteRecurringCashFlowMode.delete_all
  );
  const [type, setType] = useState<CashFlowType>("income");
  const [categories, setCategories] = useState<Tables<"finance_category">[]>(
    cashFlow.categories.map((category) => category.finance_category)
  );
  const [pendingValues, setPendingValues] = useState<
    UpdateSingleCashFlow | UpdateRecurringCashFlow
  >(cashFlow);
  const { mutate: updateSingleCashFlow, isPending: isUpdatingSingleCashFlow } =
    useUpdateSingleCashflowMutation({ onSuccess: onClose });
  const {
    mutate: updateRecurringCashFlow,
    isPending: isUpdatingRecurringCashFlow,
  } = useUpdateRecurringCashflowMutation({ onSuccess: onClose });
  const drawerStack = useDrawersStack([
    "edit-cash-flow",
    "delete-cash-flow",
    "delete-recurring-cash-flow",
    "update-cash-flow",
    "add-category",
  ]);
  const { data: financeCategories = [] } = useFinanceCategoriesQuery();
  const {
    mutate: deleteSingleCashFlows,
    isPending: isDeletingSingleCashFlows,
  } = useDeleteSingleCashflowMutation({ onSuccess: onClose });
  const {
    mutate: deleteRecurringCashFlow,
    isPending: isDeletingRecurringCashFlow,
  } = useDeleteRecurringCashflowMutation({ onSuccess: onClose });

  useEffect(() => {
    if (cashFlow) {
      setType(cashFlow.amount > 0 ? "income" : "expense");
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
    if (
      categories !==
      cashFlow.categories.map((category) => category.finance_category)
    ) {
      setCategories(
        cashFlow.categories.map((category) => category.finance_category)
      );
    }
  }, [cashFlow]);

  async function handleSubmit(values: any) {
    if (isSingleCashFlow(cashFlow)) {
      updateSingleCashFlow({
        singleCashFlow: {
          id: cashFlow.id,
          categories: categories.map((category) => ({
            finance_category: category,
          })),
          ...values,
        },
      });
    } else {
      // For recurring cash flows, check if any fields that affect single cash flows have changed
      const hasChanges =
        values.title !== cashFlow.title ||
        values.amount !== cashFlow.amount ||
        values.currency !== cashFlow.currency ||
        categories !==
          cashFlow.categories.map((category) => category.finance_category);

      if (hasChanges) {
        // Store the values and show the update modal
        setPendingValues({
          id: cashFlow.id,
          categories: categories.map((category) => ({
            finance_category: category,
          })),
          ...values,
        });
        drawerStack.open("update-cash-flow");
      } else {
        // No changes that affect single cash flows, just update the recurring cash flow
        updateRecurringCashFlow({
          id: cashFlow.id,
          categories: categories.map((category) => ({
            finance_category: category,
          })),
          ...values,
        });
      }
    }
  }

  async function handleSingleDelete() {
    if (!isSingleCashFlow(cashFlow)) return;
    deleteSingleCashFlows([cashFlow.id]);
  }

  async function handleDeleteRecurringWithMode(
    mode: DeleteRecurringCashFlowMode
  ) {
    if (isSingleCashFlow(cashFlow)) return;
    deleteRecurringCashFlow({
      recurringCashFlowId: cashFlow.id,
      mode,
    });
  }

  async function handleDeactivateRecurring() {
    if (isSingleCashFlow(cashFlow)) return;
    updateRecurringCashFlow({
      recurringCashFlow: {
        ...cashFlow,
        end_date: new Date().toISOString(),
        categories: categories.map((category) => ({
          finance_category: category,
        })),
      },
    });
  }

  async function handleUpdateAll() {
    if (!pendingValues) return;

    // First update the recurring cash flow
    updateRecurringCashFlow({
      recurringCashFlow: {
        ...cashFlow,
        categories: categories.map((category) => ({
          finance_category: category,
        })),
      },
      shouldUpdateSingleCashFlows: true,
    });
  }

  async function handleUpdateRecurringOnly() {
    if (!pendingValues) return;

    updateRecurringCashFlow({
      recurringCashFlow: {
        ...cashFlow,
        categories: categories.map((category) => ({
          finance_category: category,
        })),
      },
    });
  }

  const handleAddCategory = (category: Tables<"finance_category">) => {
    setCategories((prev) => [...prev, category]);
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
              value={categories.map((category) => category.id)}
              onChange={(value) =>
                setCategories(
                  value.map(
                    (category) =>
                      financeCategories.find((c) => c.id === category)!
                  )
                )
              }
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
              isLoading={isUpdatingSingleCashFlow}
              cashFlow={cashFlow}
            />
          ) : (
            <RecurringCashFlowForm
              type={type}
              financeCurrency={cashFlow.currency}
              handleSubmit={handleSubmit}
              isLoading={isUpdatingRecurringCashFlow}
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
            loading={isDeletingSingleCashFlows}
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
              loading={isUpdatingRecurringCashFlow}
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
                loading={isDeletingRecurringCashFlow}
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
              disabled={isUpdatingRecurringCashFlow}
            >
              {getLocalizedText("Nein, beibehalten", "No, keep existing")}
            </Button>
            <Button
              color="blue"
              onClick={handleUpdateAll}
              loading={isUpdatingRecurringCashFlow}
            >
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
