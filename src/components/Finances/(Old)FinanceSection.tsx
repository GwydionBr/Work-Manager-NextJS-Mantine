"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import {
  Container,
  Text,
  ScrollArea,
  Box,
  Skeleton,
  Stack,
  Badge,
  alpha,
  Card,
  Grid,
  Group,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { enUS, de } from "date-fns/locale";
import { IconCashMove, IconCashMoveBack } from "@tabler/icons-react";
import { Tables } from "@/types/db.types";

import classes from "./Finances.module.css";
import { formatMoney } from "@/utils/formatFunctions";
import EditCashFlowDrawer from "@/components/Finances/CashFlow/EditCashFlowDrawer";

interface FinanceSectionProps {
  title: string;
  cashFlows: Tables<"single_cash_flow">[];
  isFetching: boolean;
}

export default function FinanceSection({
  title,
  cashFlows,
  isFetching,
}: FinanceSectionProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  const [selectedCashFlow, setSelectedCashFlow] =
    useState<Tables<"single_cash_flow"> | null>(null);
  const [
    editCashFlowOpened,
    { open: openEditCashFlow, close: closeEditCashFlow },
  ] = useDisclosure(false);
  useEffect(() => {
    if (cashFlows.length > 0) {
      setSelectedCashFlow(cashFlows[0]);
    }
  }, [cashFlows]);
  // Sort cash flows by date (most recent first) and take only the 4 most recent ones
  const recentCashFlows = [...cashFlows]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const isIncome = title === "Income" || title === "Einnahmen";

  const borderColor = isIncome
    ? "var(--mantine-color-green-8)"
    : "var(--mantine-color-red-8)";

  return (
    <Container className={classes.financeSection}>
      <Group
        p="xs"
        justify="center"
        align="center"
        gap="xs"
        style={{
          borderBottom: `1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-1))`,
        }}
      >
        {isIncome ? (
          <IconCashMove color={borderColor} />
        ) : (
          <IconCashMoveBack color={borderColor} />
        )}
        <Text ta="center" fz="lg" fw={700}>
          {title}
        </Text>
      </Group>
      {isFetching ? (
        <Stack>
          <Skeleton height={30} mt="md" />
          <Skeleton height={30} mt="xs" />
        </Stack>
      ) : (
        <ScrollArea className={classes.financeSectionContent} scrollbarSize={7}>
          {recentCashFlows.map((cashFlow) => (
            <Box key={cashFlow.id}>
              <Badge
                color={
                  "light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-6))"
                }
              >
                {formatDistanceToNow(new Date(cashFlow.date), {
                  addSuffix: true,
                  locale: locale === "de-DE" ? de : enUS,
                })}
              </Badge>
              <Card
                my="xs"
                withBorder
                shadow="md"
                radius="md"
                p="xs"
                style={{
                  border: `2px solid ${borderColor}`,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedCashFlow(cashFlow);
                  openEditCashFlow();
                }}
              >
                <Group justify="center">
                  <Text size="sm" fw={700}>
                    {/* {
                      financeCategories.find(
                        (category) => category.id === cashFlow.categoryIds[0]
                      )?.title
                    } */}
                  </Text>
                </Group>
                <Grid gutter="xs" align="center">
                  <Grid.Col span={7}>
                    <Text p="xs" fz={12}>
                      {cashFlow.title}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={5}>
                    <Group justify="flex-end">
                      <Text p="xs">
                        {formatMoney(
                          cashFlow.amount,
                          cashFlow.currency,
                          locale
                        )}
                      </Text>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Card>
            </Box>
          ))}
        </ScrollArea>
      )}
      {/* {selectedCashFlow && (
        <EditCashFlowDrawer
          cashFlow={selectedCashFlow}
          opened={editCashFlowOpened}
          onClose={closeEditCashFlow}
        />
      )} */}
    </Container>
  );
}
