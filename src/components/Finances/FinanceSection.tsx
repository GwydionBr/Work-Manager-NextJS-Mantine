"use client";

import { useSettingsStore } from "@/stores/settingsStore";

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
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { enUS, de } from "date-fns/locale";

import { Tables } from "@/types/db.types";

import classes from "./Finances.module.css";
import { formatMoney } from "@/utils/workHelperFunctions";

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
  // Sort cash flows by date (most recent first) and take only the 4 most recent ones
  const recentCashFlows = [...cashFlows]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const backgroundColor =
    title === "Income" || title === "Einnahmen"
      ? alpha("var(--mantine-color-green-8)", 0.4)
      : alpha("var(--mantine-color-red-8)", 0.4);

  return (
    <Container className={classes.financeSection} bg={backgroundColor}>
      <Text ta="center" fz="lg" p="xs" className={classes.financeSectionTitle}>
        {title}
      </Text>
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
                bg={backgroundColor}
                radius="md"
                p="xs"
              >
                <Grid gutter="xs" align="center">
                  <Grid.Col span={6}>
                    <Text p="xs" fz={12}>
                      {cashFlow.title}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text p="xs" ta="right">
                      {cashFlow.amount.toLocaleString(locale, {
                        style: "currency",
                        currency: cashFlow.currency,
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </Grid.Col>
                </Grid>
              </Card>
            </Box>
          ))}
        </ScrollArea>
      )}
    </Container>
  );
}
