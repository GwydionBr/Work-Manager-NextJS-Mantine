"use client";

import { Card, Divider, NavLink, Stack } from "@mantine/core";

interface FinancesNavbarProps {
  top?: React.ReactNode;
  isNavbar?: boolean;
  navbarItems?: {
    label: string;
    leftSection?: React.ReactNode;
    description?: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }[][];
  bottom?: React.ReactNode;
}

export default function FinancesNavbar({
  top,
  isNavbar,
  bottom,
  navbarItems,
}: FinancesNavbarProps) {
  return (
    <Stack
      w={200}
      miw={190}
      style={{ position: "absolute", top: 75, zIndex: 100 }}
    >
      {top && (
        <Card withBorder shadow="sm" radius="lg" p="sm" py={0}>
          {top}
        </Card>
      )}
      {isNavbar && navbarItems && (
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
      )}
      {bottom && (
        <Card withBorder shadow="sm" radius="lg">
          {bottom}
        </Card>
      )}
    </Stack>
  );
}
