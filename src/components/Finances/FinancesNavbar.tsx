"use client";

import { Card, Stack } from "@mantine/core";

interface FinancesNavbarProps {
  top?: React.ReactNode;
  navbar?: React.ReactNode;
  bottom?: React.ReactNode;
}

export default function FinancesNavbar({
  top,
  navbar,
  bottom,
}: FinancesNavbarProps) {
  return (
    <Stack
      w={200}
      miw={190}
      style={{ position: "absolute", top: 75, zIndex: 100 }}
    >
      {top && (
        <Card withBorder shadow="sm" radius="lg">
          {top}
        </Card>
      )}
      {navbar && (
        <Card withBorder shadow="sm" radius="lg">
          {navbar}
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
