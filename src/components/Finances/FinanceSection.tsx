import {
  Container,
  Text,
  ScrollArea,
  Box,
  Skeleton,
  Stack,
  Badge,
  alpha,
} from "@mantine/core";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

import { Tables } from "@/types/db.types";

import classes from "./Finances.module.css";

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
  // Sort cash flows by date (most recent first) and take only the 4 most recent ones
  const recentCashFlows = [...cashFlows]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const backgroundColor =
    title === "Income"
      ? alpha("var(--mantine-color-green-5)", 0.15)
      : alpha("var(--mantine-color-red-5)", 0.15);

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
                  locale: enUS,
                })}
              </Badge>
              <Box className={classes.cashFlowBox} my="xs">
                <Text p="xs" fz={12}>
                  {cashFlow.title}
                </Text>
                <Text p="xs" fz={12} c="dimmed"></Text>
                <Text p="xs">{cashFlow.amount}</Text>
              </Box>
            </Box>
          ))}
        </ScrollArea>
      )}
    </Container>
  );
}
