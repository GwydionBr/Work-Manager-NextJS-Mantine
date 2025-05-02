import { Container, Text, Stack, ScrollArea } from "@mantine/core";
import classes from "./Finances.module.css";

interface FinanceSectionProps {
  title: string;
}

export default function FinanceSection({ title }: FinanceSectionProps) {
  return (
    <Container className={classes.financeSection}>
      <Text ta="center" fz="lg" p="xs">
        {title}
      </Text>
      <ScrollArea className={classes.financeSectionContent}>
        <Text>Income</Text>
        <Text>Expenses</Text>
      </ScrollArea>
    </Container>
  );
}
