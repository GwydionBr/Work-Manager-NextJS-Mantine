"use client";

import { useUserStore } from "@/stores/userStore";
import { useGroupStore } from "@/stores/groupStore";

import { Group, Indicator, Stack, Text } from "@mantine/core";
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

import classes from "./Notification.module.css";
import CheckActionIcon from "../UI/Buttons/CheckActionIcon";
import XActionIcon from "../UI/Buttons/XActionIcon";

export default function NotificationPopover() {
  const { requestedFriends, acceptFriend, declineFriend } = useUserStore();
  const { groupRequests, answerGroupRequest } = useGroupStore();

  return (
    <Stack gap="xs">
      {requestedFriends.length > 0 && (
        <Stack>
          <Group className={classes.popoverTitle}>
            <Indicator size={16} label={requestedFriends.length}>
              <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            </Indicator>
            <Text className={classes.notificationTitle}>Friend Requests</Text>
          </Group>
          <Stack>
            {requestedFriends.map((request) => (
              <Group
                key={request.friendshipId}
                className={classes.popoverRow}
                justify="space-between"
              >
                {request.profile.username}
                <Group gap="xs">
                  <CheckActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() => acceptFriend(request.friendshipId)}
                  />
                  <XActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() => declineFriend(request.friendshipId)}
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      )}
      {groupRequests.length > 0 && (
        <Stack>
          <Group className={classes.popoverTitle}>
            <Indicator size={16} label={groupRequests.length}>
              <IconUsersPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
            </Indicator>
            <Text className={classes.notificationTitle}>Group Requests</Text>
          </Group>
          <Stack>
            {groupRequests.map((request) => (
              <Group
                key={request.requestId}
                className={classes.popoverRow}
                justify="space-between"
              >
                {request.name}
                <Group gap="xs">
                  <CheckActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() => answerGroupRequest(request.requestId, true)}
                  />
                  <XActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() => answerGroupRequest(request.requestId, false)}
                  />
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
