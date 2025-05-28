"use client";

import { useGroupStore } from "@/stores/groupStore";

import {
  Group,
  ScrollArea,
  Stack,
  Text,
  Box,
  Select,
  Divider,
} from "@mantine/core";
import NewGroupButton from "../GroupManager/Group/NewGroupButton";

import classes from "./Navbar.module.css";
import ProfileRow from "../UI/ProfileRow";

export default function FinanceNavbar() {
  const { groups, activeGroup, setActiveGroup } = useGroupStore();

  const acceptedMembers = activeGroup?.members.filter(
    (member) => member.status === "accepted"
  );
  const pendingMembers = activeGroup?.members.filter(
    (member) => member.status === "pending"
  );

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
            label: group.title,
            value: group.id,
          }))}
          value={activeGroup?.id}
          onChange={(value) => {
            if (value) {
              setActiveGroup(value);
            }
          }}
        />
        <Divider />
        <Text>Group Members</Text>
        <Stack gap="sm">
          {acceptedMembers?.map((member) => (
            <ProfileRow key={member.member.id} profile={member.member} />
          ))}
        </Stack>
        <Divider />
        {pendingMembers && pendingMembers.length > 0 && (
          <Stack gap="sm">
            <Text>Pending Requests</Text>
            <Stack gap="sm">
              {pendingMembers?.map((member) => (
                <ProfileRow key={member.member.id} profile={member.member} />
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>

      <ScrollArea className={classes.scrollArea}>
        <Stack className={classes.financeSections} gap={0}></Stack>
      </ScrollArea>
    </Box>
  );
}
