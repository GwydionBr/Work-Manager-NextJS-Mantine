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
  ActionIcon,
} from "@mantine/core";
import {
  IconUserPlus,
  IconUsersPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import classes from "./Notification.module.css";
import CheckActionIcon from "../UI/Buttons/CheckActionIcon";
import XActionIcon from "../UI/Buttons/XActionIcon";

export default function NotificationAside() {
  const { friendRequests, acceptFriend, declineFriend } = useUserStore();
  const { groupRequests, answerGroupRequest } = useGroupStore();
  const [friendRequestsOpened, setFriendRequestsOpened] = useState(false);
  const [groupRequestsOpened, setGroupRequestsOpened] = useState(false);
  if (friendRequests.length === 0 && groupRequests.length === 0) {
    return null;
  }

  return (
    <Paper mah={300} p="md" withBorder className={classes.notificationAside}>
      <Stack gap="xs">
        {friendRequests.length > 0 && (
          <Popover
            opened={friendRequestsOpened}
            onChange={setFriendRequestsOpened}
          >
            <Popover.Target>
              <Group
                className={classes.notificationRow}
                onClick={() => setFriendRequestsOpened(true)}
              >
                <Indicator size={16} label={friendRequests.length}>
                  <IconUserPlus color="light-dark(var(--mantine-color-blue-9), var(--mantine-color-blue-4))" />
                </Indicator>
                <Text className={classes.notificationTitle}>
                  Friend Requests
                </Text>
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack>
                {friendRequests.map((request) => (
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
                          acceptFriend(request.requestId)
                        }
                      />
                      <XActionIcon
                        size="sm"
                        iconSize={20}
                        onClick={() =>
                          declineFriend(request.requestId)
                        }
                      />
                    </Group>
                  </Group>
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        )}
        {friendRequests.length > 0 && groupRequests.length > 0 && (
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
