"use client";

import { useMemo } from "react";
import { useHover, useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUpdateSingleCashflowMutation } from "@/utils/queries/finances/use-single-cashflow";

import {
  Card,
  CardProps,
  Grid,
  Text,
  Group,
  Transition,
  Box,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import FinanceCategoryBadges from "@/components/Finances/Category/FinanceCategoryBadges";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

import { formatMoney } from "@/utils/formatFunctions";
import { SingleCashFlow } from "@/types/finance.types";
import { Tables } from "@/types/db.types";
import { IconRepeat } from "@tabler/icons-react";

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
  } = useUpdateSingleCashflowMutation({ showNotification: false });
  const { hovered, ref } = useHover();
  const [
    isCategoryPopoverOpen,
    { open: openCategoryPopover, close: closeCategoryPopover },
  ] = useDisclosure(false);

  const currentCategories = useMemo(
    () => cashflow.categories.map((c) => c.finance_category),
    [cashflow.categories]
  );

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
          <Group>
            <Text>{cashflow.title}</Text>
            {cashflow.recurring_cash_flow_id && (
              <ThemeIcon
                variant="transparent"
                color={cashflow.amount < 0 ? "red" : "green"}
              >
                <IconRepeat size={20} />
              </ThemeIcon>
            )}
          </Group>
        </Grid.Col>
        <Grid.Col span={3}>
          <Stack>
            <FinanceCategoryBadges
              initialCategories={currentCategories}
              onPopoverOpen={openCategoryPopover}
              onPopoverClose={handleCategoryClose}
              showAddCategory={hovered}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
