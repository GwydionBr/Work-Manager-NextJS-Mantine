import { Tables } from "@/types/db.types";
import { Stack, Text } from "@mantine/core";

interface FriendListProps {
  pendingFriends: Tables<"profiles">[];
  friends: Tables<"profiles">[];
}

export default function FriendList({
  friends,
  pendingFriends,
}: FriendListProps) {
  return (
    <Stack>
      <Text>Friends:</Text>
      {friends.length === 0 ? (
        <Text>No friends found</Text>
      ) : (
        friends.map((friend) => <div key={friend.id}>{friend.username}</div>)
      )}

      <Text>Pending Friends:</Text>
      {pendingFriends.map((friend) => (
        <div key={friend.id}>{friend.username}</div>
      ))}
      {pendingFriends.length === 0 && <Text>No pending friends found</Text>}
    </Stack>
  );
}
