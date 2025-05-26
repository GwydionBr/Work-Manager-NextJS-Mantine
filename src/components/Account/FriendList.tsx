"use client";

import { useUserStore } from "@/stores/userStore";

import { Divider, Grid, Group, Stack, Text } from "@mantine/core";
import {
  IconUserX,
  IconUserCheck,
  IconHourglass,
  IconUserPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import FriendsTable from "./FriendsTable";

import { Friend } from "@/stores/userStore";

interface FriendListProps {
  friends: Friend[];
}

export default function FriendList({ friends }: FriendListProps) {
  const { removeFriend, acceptFriend, declineFriend } = useUserStore();

  const acceptedFriends = friends.filter(
    (friend) => friend.status === "accepted"
  );
  const pendingFriends = friends.filter(
    (friend) => friend.status === "pending" && friend.requester
  );
  const requestedFriends = friends.filter(
    (friend) => friend.status === "pending" && !friend.requester
  );
  const declinedFriends = friends.filter(
    (friend) => friend.status === "declined"
  );

  return (
    <Grid w="100%">
      <Grid.Col span={7}>
        <Stack>
          <Group>
            <IconUserCheck color="light-dark(var(--mantine-color-teal-9), var(--mantine-color-teal-4))" />
            <Text>Friends:</Text>
          </Group>
          <FriendsTable
            friends={acceptedFriends}
            emptyMessage={<Text>Add some friends to see them here</Text>}
            icon={<IconX color="red" />}
            iconAction={removeFriend}
          />
        </Stack>
      </Grid.Col>
      <Grid.Col span={5}>
        <Stack>
          <Group>
            <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            <Text>Friend requests:</Text>
          </Group>
          <FriendsTable
            friends={requestedFriends}
            emptyMessage={<Text>No friend requests yet</Text>}
            icon={<IconCheck color="green" />}
            iconAction={acceptFriend}
            secondaryIcon={<IconX color="red" />}
            secondaryIconAction={declineFriend}
          />
          {pendingFriends.length > 0 && (
            <Stack>
              <Divider my="md" />
              <Group>
                <IconHourglass color="light-dark(var(--mantine-color-orange-7), var(--mantine-color-orange-4))" />
                <Text>Pending friend requests:</Text>
              </Group>
              <FriendsTable friends={pendingFriends} />
            </Stack>
          )}
          {declinedFriends.length > 0 && (
            <Stack>
              <Divider my="md" />
              <Group>
                <IconUserX color="red" />
                <Text>Declined friend requests:</Text>
              </Group>
              <FriendsTable friends={declinedFriends} />
            </Stack>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
