"use client";

import { useEffect } from "react";
import { Group, ScrollArea, Stack, Text, Box } from "@mantine/core";
import { useGroupStore } from "@/stores/groupStore";
import classes from "./Navbar.module.css";
import NewGroupButton from "../GroupManager/NewGroupButton";

export default function FinanceNavbar() {
  const { groups, activeGroup, fetchGroupData } = useGroupStore();

  useEffect(() => {
    fetchGroupData();
  }, []);

  return (
    <Box className={classes.main} w="250px">
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Group Manager</Text>
        <NewGroupButton />
      </Group>

      <ScrollArea className={classes.scrollArea}>
        <Stack className={classes.financeSections} gap={0}>
        </Stack>
      </ScrollArea>
    </Box>
  );
}
