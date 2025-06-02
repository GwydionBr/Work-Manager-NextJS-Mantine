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
  Skeleton,
} from "@mantine/core";
import NewGroupButton from "../GroupManager/Group/NewGroupButton";

import classes from "./Navbar.module.css";
import ProfileRow from "../Account/ProfileRow";

export default function FinanceNavbar() {
  const { groups, activeGroup, isFetching, setActiveGroup } = useGroupStore();

  return (
    <Box className={classes.main} w="250px">
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Group Manager</Text>
        {!isFetching && <NewGroupButton />}
      </Group>
      <Stack gap="sm" px="xs">
        <Text mt="sm" fz="sm" ta="center">
          Active Group
        </Text>
        {isFetching ? (
          <Skeleton height={25} w={200} mx="md" />
        ) : (
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
        )}
        <Divider />
        <Text fw={600}>Group Members</Text>
        {isFetching && <Skeleton height={25} w={200} mx="md" />}
        <Stack gap="xs">
          {activeGroup?.admins.map((admin) => (
            <ProfileRow key={admin.id} profile={admin} isAdmin={true} />
          ))}
          {activeGroup?.members.map((member) => (
            <ProfileRow key={member.id} profile={member} />
          ))}
        </Stack>
        <Divider />
        {activeGroup?.invitedMemebers &&
          activeGroup.invitedMemebers.length > 0 && (
            <Stack gap="sm">
              <Text fw={600}>Invited Members</Text>
              <Stack gap="xs">
                {activeGroup.invitedMemebers.map((member) => (
                  <ProfileRow key={member.id} profile={member} />
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
