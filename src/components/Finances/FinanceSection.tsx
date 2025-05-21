import { Container, Text, ScrollArea, Box } from "@mantine/core";

import { Tables } from "@/types/db.types";

import classes from "./Finances.module.css";

interface FinanceSectionProps {
  title: string;
  cashFlows: Tables<"single_cash_flow">[];
}

export default function FinanceSection({
  title,
  cashFlows,
}: FinanceSectionProps) {
  return (
    <Container className={classes.financeSection}>
      <Text ta="center" fz="lg" p="xs">
        {title}
      </Text>
      <ScrollArea className={classes.financeSectionContent}>
        {cashFlows.map((cashFlow) => (
          <Box className={classes.cashFlowBox} my="xs" key={cashFlow.id}>
            <Text p="xs" fz={12}>
              {cashFlow.title}
            </Text>
            <Text p="xs">{cashFlow.amount}</Text>
          </Box>
        ))}
      </ScrollArea>
    </Container>
  );
}
