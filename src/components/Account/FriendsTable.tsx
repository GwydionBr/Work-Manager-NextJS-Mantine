"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Avatar, Box, Group, Table, Text } from "@mantine/core";

import { Friend } from "@/stores/userStore";
import CheckActionIcon from "../UI/ActionIcons/CheckActionIcon";
import XActionIcon from "../UI/ActionIcons/XActionIcon";

interface FriendsTableProps {
  friends: Friend[];
  emptyMessage?: React.ReactNode;
  checkIcon?: boolean;
  xIcon?: boolean;
  checkIconAction?: (id: string) => void;
  xIconAction?: (id: string) => void;
}

export default function FriendsTable({
  friends,
  emptyMessage,
  checkIcon,
  xIcon,
  checkIconAction,
  xIconAction,
}: FriendsTableProps) {
  const { locale } = useSettingsStore();
  const rows = friends.map((friend) => (
    <Table.Tr key={friend.friendshipId}>
      <Table.Td>
        <Avatar src={friend.profile.avatar_url} size={32} color="teal" />
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {friend.profile.username}
        </Text>
      </Table.Td>
      <Table.Td visibleFrom="sm">
        <Text size="sm" c="dimmed">
          {friend.profile.email}
        </Text>
      </Table.Td>
      {(checkIcon || xIcon) && (
        <Table.Td>
          <Group gap={5} wrap="nowrap">
            {checkIcon && (
              <CheckActionIcon
                onClick={() => checkIconAction?.(friend.friendshipId)}
              />
            )}
            {xIcon && (
              <XActionIcon onClick={() => xIconAction?.(friend.friendshipId)} />
            )}
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th>{locale === "de-DE" ? "Benutzername" : "Username"}</Table.Th>
            <Table.Th visibleFrom="sm">{locale === "de-DE" ? "E-Mail" : "Email"}</Table.Th>
            {(checkIcon || xIcon) && <Table.Th></Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {friends.length === 0 && (
        <Box p="md" ta="center">
          {emptyMessage ||
            (locale === "de-DE"
              ? "Keine Freunde gefunden"
              : "No friends found")}
        </Box>
      )}
    </Box>
  );
}
