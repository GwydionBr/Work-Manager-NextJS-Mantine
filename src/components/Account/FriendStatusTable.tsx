"use client";

import { useFormatter } from "@/hooks/useFormatter";

import { Box, Table, Text } from "@mantine/core";

import { Tables } from "@/types/db.types";

interface FriendStatusTableProps {
  friends: Tables<"profiles">[];
}

export default function FriendStatusTable({ friends }: FriendStatusTableProps) {
  const { getLocalizedText } = useFormatter();
  const rows = friends.map((friend) => (
    <Table.Tr key={friend.id}>
      <Table.Td>{friend.username}</Table.Td>
      <Table.Td>{friend.email}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{getLocalizedText("Benutzername", "Username")}</Table.Th>
            <Table.Th>{getLocalizedText("Status", "Status")}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {friends.length === 0 && (
        <Text c="red" p="md" ta="center">
          {getLocalizedText(
            "Füge Freunde hinzu, um sie hier zu sehen",
            "Add some friends to see them here"
          )}
        </Text>
      )}
    </Box>
  );
}
