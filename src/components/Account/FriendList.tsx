"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Divider, Grid, Group, Stack, Text, Box } from "@mantine/core";
import {
  IconUserX,
  IconUserCheck,
  IconHourglass,
  IconUserPlus,
} from "@tabler/icons-react";
import ConfirmDeleteModal from "../UI/ConfirmDeleteModal";
import FriendsTable from "./FriendsTable";
import styles from "./FriendList.module.css";

interface ModalInformation {
  title: string;
  message: string;
  onDelete: () => void;
  onCancel: () => void;
}

export default function FriendList() {
  const { locale } = useSettingsStore();
  const [modalInformation, setModalInformation] =
    useState<ModalInformation | null>(null);
  const [modalOpened, modalHandler] = useDisclosure(false);

  const {
    friends,
    requestedFriends,
    pendingFriends,
    declinedFriends,
    acceptFriend,
    declineFriend,
    removeFriend,
  } = useUserStore();

  function handleRemoveFriend(id: string) {
    setModalInformation({
      title: locale === "de-DE" ? "Freund entfernen" : "Remove Friend",
      message:
        locale === "de-DE"
          ? "Sind Sie sicher, dass Sie diesen Freund entfernen möchten?"
          : "Are you sure you want to remove this friend?",
      onDelete: () => {
        removeFriend(id);
        modalHandler.close();
      },
      onCancel: () => modalHandler.close(),
    });
    modalHandler.open();
  }

  function handleDeclineFriend(id: string) {
    setModalInformation({
      title: locale === "de-DE" ? "Freundschaftsanfrage ablehnen" : "Decline Friend Request",
      message:
        locale === "de-DE"
          ? "Sind Sie sicher, dass Sie diese Freundschaftsanfrage ablehnen möchten?"
          : "Are you sure you want to decline this friend request?",
      onDelete: () => {
        declineFriend(id);
        modalHandler.close();
      },
      onCancel: () => modalHandler.close(),
    });
    modalHandler.open();
  }

  return (
    <Box className={styles.container}>
      <Grid w="100%" gutter="md">
        <Grid.Col span={{ base: 12, sm: 12, md: 6, lg: 7 }}>
          <Stack className={styles.friendsSection}>
            <Group className={styles.sectionHeader}>
              <IconUserCheck color="light-dark(var(--mantine-color-teal-9), var(--mantine-color-teal-4))" />
              <Text>{locale === "de-DE" ? "Freunde" : "Friends"}:</Text>
            </Group>
            <FriendsTable
              friends={friends}
              emptyMessage={
                <Text className={styles.emptyMessage}>
                  {locale === "de-DE"
                    ? "Fügen Sie einige Freunde hinzu, um sie hier zu sehen"
                    : "Add some friends to see them here"}
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
              <Text>{locale === "de-DE" ? "Freundschaftsanfragen" : "Friend requests"}:</Text>
            </Group>
            <FriendsTable
              friends={requestedFriends}
              emptyMessage={
                <Text className={styles.emptyMessage}>
                  {locale === "de-DE"
                    ? "Noch keine Freundschaftsanfragen"
                    : "No friend requests yet"}
                </Text>
              }
              checkIcon={true}
              checkIconAction={acceptFriend}
              xIcon={true}
              xIconAction={handleDeclineFriend}
            />
            {pendingFriends.length > 0 && (
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
                <FriendsTable friends={pendingFriends} />
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
        <ConfirmDeleteModal
          opened={modalOpened}
          onClose={modalHandler.close}
          onDelete={modalInformation?.onDelete || (() => {})}
          title={modalInformation?.title || ""}
          message={modalInformation?.message || ""}
        />
      </Grid>
    </Box>
  );
}
