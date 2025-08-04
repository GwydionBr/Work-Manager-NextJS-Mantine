"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useUserStore } from "@/stores/userStore";

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
      title: "Remove Friend",
      message: "Are you sure you want to remove this friend?",
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
      title: "Decline Friend Request",
      message: "Are you sure you want to decline this friend request?",
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
              <Text>Friends:</Text>
            </Group>
            <FriendsTable
              friends={friends}
              emptyMessage={
                <Text className={styles.emptyMessage}>
                  Add some friends to see them here
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
              <Text>Friend requests:</Text>
            </Group>
            <FriendsTable
              friends={requestedFriends}
              emptyMessage={
                <Text className={styles.emptyMessage}>
                  No friend requests yet
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
                  <Text>Pending friend requests:</Text>
                </Group>
                <FriendsTable friends={pendingFriends} />
              </Stack>
            )}
            {declinedFriends.length > 0 && (
              <Stack>
                <Divider my="md" />
                <Group className={styles.sectionHeader}>
                  <IconUserX color="red" />
                  <Text>Declined friend requests:</Text>
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
