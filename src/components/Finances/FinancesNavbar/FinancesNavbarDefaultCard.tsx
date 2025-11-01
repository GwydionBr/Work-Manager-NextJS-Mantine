import { Card } from "@mantine/core";

interface FinancesNavbarDefaultCardProps {
  children: React.ReactNode;
}

export default function FinancesNavbarDefaultCard({
  children,
}: FinancesNavbarDefaultCardProps) {
  return (
    <Card withBorder shadow="sm" radius="lg">
      {children}
    </Card>
  );
}
