"use client";

import { useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useGroupStore } from "@/stores/groupStore";

import {
  Divider,
  Group,
  Indicator,
  Paper,
  Stack,
  Text,
  Popover,
} from "@mantine/core";
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

import classes from "./Notification.module.css";
import CheckActionIcon from "../UI/Buttons/CheckActionIcon";
import XActionIcon from "../UI/Buttons/XActionIcon";

export default function NotificationAsideCard() {
  const { requestedFriends, acceptFriend, declineFriend } = useUserStore();
  const { groupRequests, answerGroupRequest } = useGroupStore();
  const [friendRequestsOpened, setFriendRequestsOpened] = useState(false);
  const [groupRequestsOpened, setGroupRequestsOpened] = useState(false);

  return (
    <Paper
      mah={300}
      p="md"
      withBorder
      className={classes.notificationAsideCard}
    >
      <Stack gap="xs">
        {requestedFriends.length > 0 && (
          <Popover
            opened={friendRequestsOpened}
            onChange={setFriendRequestsOpened}
          >
            <Popover.Target>
              <Group
                className={classes.notificationRow}
                onClick={() => setFriendRequestsOpened(true)}
              >
                <Indicator size={16} label={requestedFriends.length}>
                  <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
                </Indicator>
                <Text className={classes.notificationTitle}>
                  Friend Requests
                </Text>
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                {requestedFriends.map((request) => (
                  <Group
                    key={request.friendshipId}
                    className={classes.notificationDropdownRow}
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
            </Popover.Dropdown>
          </Popover>
        )}
        {requestedFriends.length > 0 && groupRequests.length > 0 && (
          <Divider orientation="vertical" />
        )}
        {groupRequests.length > 0 && (
          <Popover
            opened={groupRequestsOpened}
            onChange={setGroupRequestsOpened}
          >
            <Popover.Target>
              <Group
                className={classes.notificationRow}
                onClick={() => setGroupRequestsOpened(true)}
              >
                <Indicator size={16} label={groupRequests.length}>
                  <IconUsersPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
                </Indicator>
                <Text className={classes.notificationTitle}>
                  Group Requests
                </Text>
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                {groupRequests.map((request) => (
                  <Group
                    key={request.requestId}
                    className={classes.notificationDropdownRow}
                    justify="space-between"
                  >
                    {request.name}
                    <Group gap="xs">
                      <CheckActionIcon
                        size="sm"
                        iconSize={20}
                        onClick={() =>
                          answerGroupRequest(request.requestId, true)
                        }
                      />
                      <XActionIcon
                        size="sm"
                        iconSize={20}
                        onClick={() =>
                          answerGroupRequest(request.requestId, false)
                        }
                      />
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
      </Stack>
    </Paper>
  );
}
