import { Avatar, Box, Group, Table } from "@mantine/core";

import { Friend } from "@/stores/userStore";
import CheckActionIcon from "../UI/Buttons/CheckActionIcon";
import XActionIcon from "../UI/Buttons/XActionIcon";

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
  const rows = friends.map((friend) => (
    <Table.Tr key={friend.friendshipId}>
      <Table.Td>
        <Avatar src={friend.profile.avatar_url} size={32} color="teal" />
      </Table.Td>
      <Table.Td>{friend.profile.username}</Table.Td>
      <Table.Td>{friend.profile.email}</Table.Td>
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
