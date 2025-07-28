"use client";

import { useGroupStore } from "@/stores/groupStore";
import { useSettingsStore } from "@/stores/settingsStore";

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

import MemberRow from "../GroupManager/MemberRow";
import AdjustmentActionIcon from "../UI/ActionIcons/AdjustmentActionIcon";
import classes from "./Navbar.module.css";
import { SettingsTab } from "../Settings/SettingsModal";

export default function FinanceNavbar() {
  const { groups, activeGroupId, isFetching, setActiveGroup } = useGroupStore();
  const activeGroup = useGroupStore((state) =>
    state.groups.find((g) => g.id === activeGroupId)
  );
  const { setSelectedTab, setIsModalOpen } = useSettingsStore();

  return (
    <Box className={classes.main} w="250px">
      <Group className={classes.title} align="center" justify="space-between">
        <Text>Group Manager</Text>
        {!isFetching && (
          <Group gap={8}>
            <AdjustmentActionIcon
              aria-label="Adjust group settings"
              tooltipLabel="Adjust group settings"
              size="md"
              iconSize={20}
              onClick={() => {
                setIsModalOpen(true);
                setSelectedTab(SettingsTab.GROUP);
              }}
            />
            <NewGroupButton />
          </Group>
        )}
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
          {activeGroup?.members.map((member) => (
            <MemberRow
              key={member.memberId}
              groupId={activeGroup.id}
              member={member}
            />
          ))}
        </Stack>
        <Divider />
        {activeGroup?.invitedMembers &&
          activeGroup.invitedMembers.length > 0 && (
            <Stack gap="sm">
              <Text fw={600}>Invited Members</Text>
              <Stack gap="xs">
                {activeGroup.invitedMembers.map((member) => (
                  <MemberRow
                    key={member.memberId}
                    groupId={activeGroup.id}
                    member={{
                      ...member,
                      isAdmin: false,
                      color: "",
                      memberId: member.memberId,
                    }}
                  />
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
