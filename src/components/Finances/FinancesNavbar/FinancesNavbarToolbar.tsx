import { Card, Group } from "@mantine/core";

interface FinancesNavbarToolbarProps {
  toolbarItems: React.ReactNode[];
}

export default function FinancesNavbarToolbar({
  toolbarItems,
}: FinancesNavbarToolbarProps) {
  return (
    <Card withBorder shadow="sm" radius="lg" p="sm" py={0}>
      <Group justify="space-between">{toolbarItems.map((item) => item)}</Group>
    </Card>
  );
}
