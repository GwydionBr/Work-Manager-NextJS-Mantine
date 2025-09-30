"use client";

import { useMemo, useState } from "react";
import { useHover, useDisclosure } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
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
import { StoreSingleCashFlow } from "@/types/finance.types";
import { Tables } from "@/types/db.types";

interface SingleCashflowRowProps extends CardProps {
  cashflow: StoreSingleCashFlow;
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
  const [isLoading, setIsLoading] = useState(false);
  const { financeCategories, updateSingleCashFlow } = useFinanceStore();
  const { hovered, ref } = useHover();
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const currentCategories = useMemo(() => {
    return financeCategories.filter((category) =>
      cashflow.categoryIds.includes(category.id)
    );
  }, [financeCategories, cashflow.categoryIds]);

  const handleCategoryClose = async (
    updatedCategories: Tables<"finance_category">[] | null
  ) => {
    if (isLoading) return;
    closeCategoryPopover();
    if (updatedCategories) {
      setIsLoading(true);
      await updateSingleCashFlow({
        ...cashflow,
        categoryIds: updatedCategories.map((c) => c.id),
      });
      setIsLoading(false);
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
        border: hovered ? "1px solid var(--mantine-color-blue-6)" : "",
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
            categories={currentCategories}
            onPopoverOpen={openCategoryPopover}
            onPopoverClose={handleCategoryClose}
            showAddCategory={hovered}
          />
        </Grid.Col>
      </Grid>
    </Card>
  );
}
