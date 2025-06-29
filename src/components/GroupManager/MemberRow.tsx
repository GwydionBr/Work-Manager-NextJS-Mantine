"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useGroupStore } from "@/stores/groupStore";

import { Text, Group, Avatar, Box, Indicator, Popover } from "@mantine/core";

import { GroupMember } from "@/stores/groupStore";

import classes from "./GroupManager.module.css";
import DefaultColorPicker from "../UI/DefaultColorPicker";

interface MemberRowProps {
  groupId: string;
  member: GroupMember;
  onClick?: () => void;
}

export default function MemberRow({
  groupId,
  member,
  onClick,
}: MemberRowProps) {
  const { profile: userProfile } = useUserStore();
  const { updateGroupMember } = useGroupStore();
  const [color, setColor] = useState(member.color);

  function handleColorChange() {
    updateGroupMember(groupId, member.id, member.isAdmin, color);
  }

  return (
    <Group
      onClick={onClick}
      justify="space-between"
      className={classes.memberRow}
      style={{
        border: member.id === userProfile?.id ? "2px solid teal" : "none",
      }}
    >
      <Group gap="sm">
        <Indicator
          withBorder
          autoContrast
          inline
          size={20}
          color="grape"
          offset={-5}
          position="top-end"
          disabled={!member.isAdmin}
          label={
            <Text size="xs" fw={600} c="white">
              Admin
            </Text>
          }
        >
          <Avatar
            src={member.avatar_url}
            size={32}
            color={member.id === userProfile?.id ? "yellow" : "cyan"}
            variant="light"
          />
        </Indicator>
        <Text size="sm" fw={700}>
          {member.username}
        </Text>
      </Group>
      {member.color !== "" &&
        (member.id === userProfile?.id ? (
          <Popover onClose={handleColorChange}>
            <Popover.Target>
              <Box className={classes.colorPoint} bg={color} />
            </Popover.Target>
            <Popover.Dropdown>
              <DefaultColorPicker color={color} setColor={setColor} />
            </Popover.Dropdown>
          </Popover>
        ) : (
          <Box className={classes.colorPoint} bg={member.color} />
        ))}
    </Group>
  );
}
