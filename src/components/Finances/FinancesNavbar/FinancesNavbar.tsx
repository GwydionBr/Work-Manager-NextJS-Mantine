"use client";

import { Stack } from "@mantine/core";

interface FinancesNavbarProps {
  items: React.ReactNode[];
}

export default function FinancesNavbar({ items }: FinancesNavbarProps) {
  return (
    <Stack
      w={200}
      miw={190}
      style={{ position: "absolute", top: 75, zIndex: 100 }}
    >
      {items.map((item) => item)}
    </Stack>
  );
}
