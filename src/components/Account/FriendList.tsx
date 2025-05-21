import { Grid, Group, Stack, Text } from "@mantine/core";
import { IconUserX, IconUserCheck, IconHourglass } from "@tabler/icons-react";
import FriendsTable from "./FriendsTable";

import { Friend } from "@/stores/profileStore";

interface FriendListProps {
  friends: Friend[];
}

export default function FriendList({ friends }: FriendListProps) {
  const pendingFriends = friends.filter(
    (friend) => friend.status === "pending"
  );
  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );

  const declinedFriends = friends.filter(
    (friend) => friend.status === "declined"
  );

  return (
    <Grid w="100%">
      <Grid.Col span={7}>
        <Stack>
          <Group>
            <IconUserCheck color="teal"/>
            <Text>Friends:</Text>
          </Group>
          <FriendsTable
            friends={acceptedFriends.map((friend) => friend.profile)}
          />
        </Stack>
      </Grid.Col>
      <Grid.Col span={5}>
        <Stack>
          <Group>
            <IconHourglass color="orange" />
            <Text>Pending Friends:</Text>
          </Group>
          <FriendsTable
            friends={pendingFriends.map((friend) => friend.profile)}
          />
          <Group>
            <IconUserX color="red" />
            <Text>Declined Friends:</Text>
          </Group>
          <FriendsTable
            friends={declinedFriends.map((friend) => friend.profile)}
          />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
