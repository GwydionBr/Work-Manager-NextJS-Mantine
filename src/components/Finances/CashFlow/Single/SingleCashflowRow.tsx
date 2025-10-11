"use client";

import { useHover, useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Card,
  CardProps,
  Grid,
  Text,
  Group,
  Transition,
  Box,
} from "@mantine/core";

import { formatMoney } from "@/utils/formatFunctions";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import FinanceCategoryBadges from "../../Category/FinanceCategoryBadges";
import { SingleCashFlow } from "@/types/finance.types";
import { Tables } from "@/types/db.types";
import { useUpdateSingleCashflowMutation } from "@/utils/queries/finances/use-single-cashflow";

interface SingleCashflowRowProps extends CardProps {
  cashflow: SingleCashFlow;
  onEdit: () => void;
  selectedModeActive: boolean;
  isSelected: boolean;
  onToggleSelected: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function SingleCashflowRow({
  cashflow,
  onEdit,
  selectedModeActive,
  isSelected,
  onToggleSelected,
  ...props
}: SingleCashflowRowProps) {
  const { locale } = useSettingsStore();
  const {
    mutate: updateSingleCashFlowMutation,
    isPending: isUpdatingSingleCashFlow,
  } = useUpdateSingleCashflowMutation();
  const { hovered, ref } = useHover();
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const handleCategoryClose = async (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    if (isUpdatingSingleCashFlow) return;
    closeCategoryPopover();
    if (updatedCategories) {
      updateSingleCashFlowMutation({
        singleCashFlow: {
          ...cashflow,
          categories: updatedCategories.map((c) => ({
            finance_category: c,
          })),
        },
      });
    }
  };

  return (
    <Card
      withBorder
      shadow="sm"
      radius="md"
      p="xs"
      bg={
        hovered
          ? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
          : "light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
      }
      style={{
        cursor: "pointer",
        // border: hovered ? "1px solid var(--mantine-color-blue-6)" : "",
        border: cashflow.recurring_cash_flow_id ? "1px solid var(--mantine-color-red-6)" : hovered ? "1px solid var(--mantine-color-blue-6)" : "",
      }}
      onClick={(e) => {
        if (!isCategoryPopoverOpen) {
          if (selectedModeActive) {
            onToggleSelected(e as any);
          } else {
            onEdit();
          }
        }
      }}
      {...props}
      ref={ref}
    >
      <Box pos="absolute" top="xs" right="xl">
        <Transition
          mounted={selectedModeActive}
          transition="fade-right"
          duration={200}
        >
          {(styles) => (
            <SelectActionIcon
              style={styles}
              onClick={() => {
                onToggleSelected;
              }}
              selected={isSelected}
            />
          )}
        </Transition>
      </Box>
      <Grid
        ml={selectedModeActive ? 50 : 0}
        style={{ transition: "margin 0.2s ease" }}
      >
        <Grid.Col span={2}>
          <Group>
            <Text fw={700} c={cashflow.amount < 0 ? "red" : "green"}>
              {formatMoney(cashflow.amount, cashflow.currency, locale)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>{cashflow.title}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          <FinanceCategoryBadges
            categories={
              cashflow.categories.map((c) => c.finance_category) || []
            }
            onPopoverOpen={openCategoryPopover}
            onPopoverClose={handleCategoryClose}
            showAddCategory={hovered}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
}
