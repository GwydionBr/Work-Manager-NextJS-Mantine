"use client";

import { useEffect } from "react";
import { Group, ScrollArea, Stack, Text, Box, Select } from "@mantine/core";
import { useGroupStore } from "@/stores/groupStore";
import classes from "./Navbar.module.css";
import NewGroupButton from "../GroupManager/NewGroupButton";

export default function FinanceNavbar() {
  const { groups, activeGroup, fetchGroupData, setActiveGroup } =
    useGroupStore();

  useEffect(() => {
    fetchGroupData();
  }, []);

  return (
    <Box className={classes.main} w="250px">
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Group Manager</Text>
        <NewGroupButton />
      </Group>
      <Stack gap="sm">
        <Text mt="sm" fz="sm" ta="center">
          Active Group
        </Text>
        <Select
          data={groups.map((group) => ({
            label: group.group.title,
            value: group.group.id,
          }))}
          value={activeGroup?.group.id}
          onChange={(value) => {
            if (value) {
              setActiveGroup(value);
            }
          }}
        />
      </Stack>

      <ScrollArea className={classes.scrollArea}>
        <Stack className={classes.financeSections} gap={0}></Stack>
      </ScrollArea>
    </Box>
  );
}
