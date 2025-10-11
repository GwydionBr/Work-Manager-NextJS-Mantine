"use client";

import { useSettingsStore } from "@/stores/settingsStore";
import {
  useRemoveFriendMutation,
  useFriendsQuery,
  useDeclineFriendshipMutation,
  useAcceptFriendshipMutation,
} from "@/utils/queries/profile/use-friends";
import { modals } from "@mantine/modals";

import { Divider, Grid, Group, Stack, Text, Box } from "@mantine/core";
import {
  IconUserX,
  IconUserCheck,
  IconHourglass,
  IconUserPlus,
} from "@tabler/icons-react";
import FriendsTable from "./FriendsTable";
import styles from "./FriendList.module.css";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

export default function FriendList() {
  const { getLocalizedText, locale } = useSettingsStore();
  const { data: friends } = useFriendsQuery();
  const { mutate: removeFriend, isPending: isRemovingFriend } =
    useRemoveFriendMutation(() => {});
  const { mutate: declineFriend, isPending: isDecliningFriend } =
    useDeclineFriendshipMutation(() => {});
  const { mutate: acceptFriend, isPending: isAcceptingFriend } =
    useAcceptFriendshipMutation(() => {});

  function handleRemoveFriend(id: string) {
    showDeleteConfirmationModal(
      getLocalizedText("Freund entfernen", "Remove Friend"),
      getLocalizedText(
        "Sind Sie sicher, dass Sie diesen Freund entfernen möchten?",
        "Are you sure you want to remove this friend?"
      ),
      () => {
        removeFriend(id);
      },
      locale
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
  const requestedFriends =
    friends?.filter(
      (friend) => friend.friendshipStatus === "pending" && friend.isRequester
    ) || [];
  const pendingFriends =
    friends?.filter(
      (friend) => friend.friendshipStatus === "pending" && !friend.isRequester
    ) || [];
  const declinedFriends =
    friends?.filter((friend) => friend.friendshipStatus === "declined") || [];

  return (
    <Box w="100%">
      <Grid w="100%" gutter="md">
        <Grid.Col span={{ base: 12, sm: 12, md: 6, lg: 7 }}>
          <Stack className={styles.friendsSection}>
            <Group className={styles.sectionHeader}>
              <IconUserCheck color="light-dark(var(--mantine-color-teal-9), var(--mantine-color-teal-4))" />
              <Text>{getLocalizedText("Freunde", "Friends")}:</Text>
            </Group>
            <FriendsTable
              friends={acceptedFriends}
              emptyMessage={
                <Text className={styles.emptyMessage}>
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
          <Stack className={styles.friendRequestsSection}>
            <Group className={styles.sectionHeader}>
              <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
              <Text>
                {locale === "de-DE"
                  ? "Freundschaftsanfragen"
                  : "Friend requests"}
                :
              </Text>
            </Group>
            <FriendsTable
              friends={pendingFriends}
              emptyMessage={
                <Text className={styles.emptyMessage}>
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
                <Group className={styles.sectionHeader}>
                  <IconHourglass color="light-dark(var(--mantine-color-orange-7), var(--mantine-color-orange-4))" />
                  <Text>
                    {locale === "de-DE"
                      ? "Ausstehende Freundschaftsanfragen"
                      : "Pending friend requests"}
                  </Text>
                </Group>
                <FriendsTable friends={requestedFriends} />
              </Stack>
            )}
            {declinedFriends.length > 0 && (
              <Stack>
                <Divider my="md" />
                <Group className={styles.sectionHeader}>
                  <IconUserX color="red" />
                  <Text>
                    {locale === "de-DE"
                      ? "Abgelehnte Freundschaftsanfragen"
                      : "Declined friend requests"}
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
