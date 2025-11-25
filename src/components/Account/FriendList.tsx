"use client";

import { useFormatter } from "@/hooks/useFormatter";
import {
  useRemoveFriendMutation,
  useFriendsQuery,
  useDeclineFriendshipMutation,
  useAcceptFriendshipMutation,
} from "@/utils/queries/profile/use-friends";


import { Divider, Grid, Group, Stack, Text, Box } from "@mantine/core";
import {
  IconUserX,
  IconUserCheck,
  IconHourglass,
  IconUserPlus,
} from "@tabler/icons-react";
import FriendsTable from "./FriendsTable";

import { modals } from "@mantine/modals";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

export default function FriendList() {
  const { getLocalizedText } = useFormatter();
  const { data: friends } = useFriendsQuery();
  const { mutate: removeFriend, isPending: isRemovingFriend } =
    useRemoveFriendMutation();
  const { mutate: declineFriend, isPending: isDecliningFriend } =
    useDeclineFriendshipMutation();
  const { mutate: acceptFriend, isPending: isAcceptingFriend } =
    useAcceptFriendshipMutation();

  function handleRemoveFriend(id: string) {
    showDeleteConfirmationModal(
      getLocalizedText("Freund entfernen", "Remove Friend"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie diesen Freund entfernen möchten?",
        "Are you sure you want to remove this friend?"
      ),
      () => {
        removeFriend(id);
      }
    );
  }

  function handleDeclineFriend(id: string) {
    modals.openConfirmModal({
      title: getLocalizedText(
        "Freundschaftsanfrage ablehnen",
        "Decline Friend Request"
      ),
      children: getLocalizedText(
        "Sind Sie sicher, dass Sie diese Freundschaftsanfrage ablehnen möchten?",
        "Are you sure you want to decline this friend request?"
      ),
      onConfirm: () => {
        declineFriend(id);
      },
    });
  }

  const acceptedFriends =
    friends?.filter((friend) => friend.friendshipStatus === "accepted") || [];
  const pendingFriends =
    friends?.filter(
      (friend) => friend.friendshipStatus === "pending" && !friend.isRequester
    ) || [];
  const requestedFriends =
    friends?.filter(
      (friend) => friend.friendshipStatus === "pending" && friend.isRequester
    ) || [];
  const declinedFriends =
    friends?.filter((friend) => friend.friendshipStatus === "declined") || [];

  return (
    <Box w="100%">
      <Grid w="100%" gutter="md">
        <Grid.Col span={{ base: 12, sm: 12, md: 6, lg: 7 }}>
          <Stack mb="md">
            <Group mb="sm">
              <IconUserCheck color="light-dark(var(--mantine-color-teal-9), var(--mantine-color-teal-4))" />
              <Text>{getLocalizedText("Freunde", "Friends")}:</Text>
            </Group>
            <FriendsTable
              friends={acceptedFriends}
              emptyMessage={
                <Text c="dimmed" ta="center">
                  {getLocalizedText(
                    "Fügen Sie einige Freunde hinzu, um sie hier zu sehen",
                    "Add some friends to see them here"
                  )}
                </Text>
              }
              xIcon={true}
              xIconAction={handleRemoveFriend}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 12, md: 6, lg: 5 }}>
          <Stack mb="md">
            <Group mb="sm">
              <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
              <Text>
                {getLocalizedText("Freundschaftsanfragen", "Friend requests")}
              </Text>
            </Group>
            <FriendsTable
              friends={pendingFriends}
              emptyMessage={
                <Text c="dimmed" ta="center">
                  {getLocalizedText(
                    "Noch keine Freundschaftsanfragen",
                    "No friend requests yet"
                  )}
                </Text>
              }
              checkIcon={true}
              checkIconAction={acceptFriend}
              xIcon={true}
              xIconAction={handleDeclineFriend}
            />
            {requestedFriends.length > 0 && (
              <Stack>
                <Divider my="md" />
                <Group mb="sm">
                  <IconHourglass color="light-dark(var(--mantine-color-orange-7), var(--mantine-color-orange-4))" />
                  <Text>
                    {getLocalizedText(
                      "Ausstehende Freundschaftsanfragen",
                      "Pending friend requests"
                    )}
                  </Text>
                </Group>
                <FriendsTable friends={requestedFriends} />
              </Stack>
            )}
            {declinedFriends.length > 0 && (
              <Stack>
                <Divider my="md" />
                <Group mb="sm">
                  <IconUserX color="red" />
                  <Text>
                    {getLocalizedText(
                      "Abgelehnte Freundschaftsanfragen",
                      "Declined friend requests"
                    )}
                  </Text>
                </Group>
                <FriendsTable friends={declinedFriends} />
              </Stack>
            )}
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
