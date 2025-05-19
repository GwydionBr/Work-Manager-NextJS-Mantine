"use client";

import { Group, ScrollArea, Stack, Text, Box } from "@mantine/core";
import classes from "./Navbar.module.css";

export default function FinanceNavbar() {

  return (
    <Box className={classes.main} w="250px">
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Group Manager</Text>
      </Group>

      <ScrollArea className={classes.scrollArea}>
        <Stack className={classes.financeSections} gap={0}>
        </Stack>
      </ScrollArea>
    </Box>
  );
}
