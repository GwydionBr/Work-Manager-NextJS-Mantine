"use client";

import { Box, Table, Text } from "@mantine/core";

import { Tables } from "@/types/db.types";
import { useSettingsStore } from "@/stores/settingsStore";

interface FriendsTableProps {
  friends: Tables<"profiles">[];
}

export default function FriendsTable({ friends }: FriendsTableProps) {
  const { locale } = useSettingsStore();
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
            <Table.Th>
              {locale === "de-DE" ? "Benutzername" : "Username"}
            </Table.Th>
            <Table.Th>{locale === "de-DE" ? "Status" : "Status"}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {friends.length === 0 && (
        <Text c="red" p="md" ta="center">
          {locale === "de-DE"
            ? "Füge Freunde hinzu, um sie hier zu sehen"
            : "Add some friends to see them here"}
        </Text>
      )}
    </Box>
  );
}
