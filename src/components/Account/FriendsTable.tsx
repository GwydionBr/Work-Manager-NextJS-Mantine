import { ActionIcon, Box, Table } from "@mantine/core";

import { Friend } from "@/stores/userStore";

interface FriendsTableProps {
  friends: Friend[];
  emptyMessage?: React.ReactNode;
  icon?: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  iconAction?: (id: string) => void;
  secondaryIconAction?: (id: string) => void;
}

export default function FriendsTable({
  friends,
  emptyMessage,
  icon,
  secondaryIcon,
  iconAction,
  secondaryIconAction,
}: FriendsTableProps) {
  const rows = friends.map((friend) => (
    <Table.Tr key={friend.friendshipId}>
      <Table.Td>{friend.profile.username}</Table.Td>
      <Table.Td>{friend.profile.email}</Table.Td>
      {icon && (
        <Table.Td>
          <ActionIcon
            variant="transparent"
            onClick={() => iconAction?.(friend.friendshipId)}
          >
            {icon}
          </ActionIcon>
          {secondaryIcon && (
            <ActionIcon
              variant="transparent"
              onClick={() => secondaryIconAction?.(friend.friendshipId)}
            >
              {secondaryIcon}
            </ActionIcon>
          )}
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Box>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Username</Table.Th>
            <Table.Th>Email</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {friends.length === 0 && (
        <Box p="md" ta="center">
          {emptyMessage || "No friends found"}
        </Box>
      )}
    </Box>
  );
}
