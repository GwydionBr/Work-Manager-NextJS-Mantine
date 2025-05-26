"use client";

import { useNotificationStore } from "@/stores/notificationStore";
import { Divider, Group, Paper, Stack, Text } from "@mantine/core";

import classes from "./Notification.module.css";
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

export default function NotificationAside() {
  const { friendRequests, groupRequests } = useNotificationStore();

  if (friendRequests.length === 0 && groupRequests.length === 0) {
    return null;
  }

  return (
    <Paper mah={300} p="sm" withBorder>
      <Stack>
      {friendRequests.length > 0 && (
        <Stack>
          <Group>
            <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            <Text className={classes.notificationTitle}>Friend Requests</Text>
          </Group>
          {friendRequests.map((request) => (
            <Group key={request.requestId} className={classes.notifactionRow}>
              {request.name}
            </Group>
          ))}
        </Stack>
        )}
        {friendRequests.length > 0 && groupRequests.length > 0 && (
          <Divider orientation="vertical" />
        )}
        {groupRequests.length > 0 && (

        <Stack>
          <Group>
            <IconUsersPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            <Text className={classes.notificationTitle}>Group Requests</Text>
          </Group>
          {groupRequests.map((request) => (
            <Group className={classes.notifactionRow} key={request.requestId}>
              {request.name}
            </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
