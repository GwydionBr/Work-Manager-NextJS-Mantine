"use client";

import { Box, Button } from "@mantine/core";

import classes from "./Navbar.module.css";

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
    <Box className={classes.settingsNavbarContainer}>
      {items.map((item) => (
        <Button key={item.title} onClick={item.onClick} variant="subtle">
          {item.title}
        </Button>
      ))}
    </Box>
  );
}
