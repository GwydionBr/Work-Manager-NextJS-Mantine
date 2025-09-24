"use client";

import { useHover } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Badge,
  Card,
  CardProps,
  Grid,
  Text,
  Group,
  Transition,
  Box,
} from "@mantine/core";
import { IconTag } from "@tabler/icons-react";

import { formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

interface SingleCashflowRowProps extends CardProps {
  cashflow: Tables<"single_cash_flow">;
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
  const { financeCategories } = useFinanceStore();
  const { hovered, ref } = useHover();
  return (
    <Card
      withBorder
      shadow="sm"
      h={45}
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
        if (selectedModeActive) {
          onToggleSelected(e as any);
        } else {
          onEdit();
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
            <Text fw={700} c={cashflow.type === "expense" ? "red" : "green"}>
              {formatMoney(cashflow.amount, cashflow.currency, locale)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>{cashflow.title}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          {cashflow.category_id && (
            <Badge
              color="grape"
              variant="light"
              leftSection={<IconTag size={12} />}
            >
              {
                financeCategories.find(
                  (category) => category.id === cashflow.category_id
                )?.title
              }
            </Badge>
          )}
        </Grid.Col>
      </Grid>
    </Card>
  );
}
