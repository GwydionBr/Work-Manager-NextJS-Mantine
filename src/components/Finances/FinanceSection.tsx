import { Container, Text, Stack, ScrollArea } from "@mantine/core";
import classes from "./Finances.module.css";
import { Tables } from "@/types/db.types";

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
          <Text key={cashFlow.id}>{cashFlow.title}</Text>
        ))}
      </ScrollArea>
    </Container>
  );
}
