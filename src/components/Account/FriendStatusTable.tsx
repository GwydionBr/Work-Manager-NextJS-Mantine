import { Box, Table, Text } from "@mantine/core";

import { Tables } from "@/types/db.types";

interface FriendsTableProps {
  friends: Tables<"profiles">[];
}

export default function FriendsTable({ friends }: FriendsTableProps) {
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
            <Table.Th>Username</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {friends.length === 0 && (
        <Text c="red" p="md" ta="center">
          Add some friends to see them here
        </Text>
      )}
    </Box>
  );
}
