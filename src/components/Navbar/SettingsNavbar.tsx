"use client";

import { Button, Stack } from "@mantine/core";

interface SettingsNavbarItem {
  title: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface SettingsNavbarProps {
  items: SettingsNavbarItem[];
}

export default function SettingsNavbar({ items }: SettingsNavbarProps) {
  return (
    <Stack
      h="70vh"
      gap="xs"
      justify="flex-start"
      align="flex-start"
      style={{
        borderRight:
          "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
      }}
    >
      {items.map((item) => (
        <Button
          key={item.title}
          leftSection={item.icon}
          onClick={item.onClick}
          variant="subtle"
          w="100%"
        >
          {item.title}
        </Button>
      ))}
    </Stack>
  );
}
