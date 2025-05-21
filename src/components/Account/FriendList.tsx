import { Grid, Stack, Text } from "@mantine/core";
import FriendsTable from "./FriendsTable";

import { Tables } from "@/types/db.types";

interface FriendListProps {
  pendingFriends: Tables<"profiles">[];
  friends: Tables<"profiles">[];
}

export default function FriendList({
  friends,
  pendingFriends,
}: FriendListProps) {
  return (
    <Grid w="100%">
      <Grid.Col span={7}>
        <Stack>
          <Text>Friends:</Text>
          <FriendsTable friends={friends} />
        </Stack>
      </Grid.Col>
      <Grid.Col span={5}>
        <Stack>
          <Text>Pending Friends:</Text>
          <FriendsTable friends={pendingFriends} />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
