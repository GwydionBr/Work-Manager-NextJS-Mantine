"use client";

import { useProfileStore } from "@/stores/profileStore";

import {  Divider, Grid, Group, Stack, Text } from "@mantine/core";
import {
  IconUserX,
  IconUserCheck,
  IconHourglass,
  IconUserPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import FriendsTable from "./FriendsTable";

import { Friend } from "@/stores/profileStore";

interface FriendListProps {
  friends: Friend[];
}

export default function FriendList({ friends }: FriendListProps) {
  const { removeFriend, acceptFriend, declineFriend } = useProfileStore();

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
            <IconUserCheck color="teal" />
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
            <IconUserPlus color="blue" />
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
                <IconHourglass color="orange" />
                <Text>Pending friend requests:</Text>
              </Group>
              <FriendsTable
                friends={pendingFriends}
              />
            </Stack>
          )}
          {declinedFriends.length > 0 && (
            <Stack>
              <Divider my="md" />
              <Group>
                <IconUserX color="red" />
                <Text>Declined friend requests:</Text>
              </Group>
              <FriendsTable
                friends={declinedFriends}
              />
            </Stack>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
