import { Stack, NavLink, Card, Divider } from "@mantine/core";

interface FinancesNavbarNavListProps {
  navbarItems: {
    label: string;
    leftSection?: React.ReactNode;
    description?: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }[][];
}

export default function FinancesNavbarNavList({
  navbarItems,
}: FinancesNavbarNavListProps) {
  return (
    <Card withBorder shadow="sm" radius="lg">
      <Stack gap={0}>
        {navbarItems.map((items, index) => (
          <Stack key={index} gap={0}>
            {index > 0 && (
              <Divider color="light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))" />
            )}
            {items.map((item) => (
              <NavLink key={item.label} {...item} />
            ))}
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
