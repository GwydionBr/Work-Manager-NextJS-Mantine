"use client";

import { useFriendsQuery } from "@/utils/queries/profile/use-friends";
import {
  useAcceptFriendshipMutation,
  useDeclineFriendshipMutation,
} from "@/utils/queries/profile/use-friends";
import { useGroupStore } from "@/stores/groupStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Indicator, Stack, Text } from "@mantine/core";
import { IconUserPlus, IconUsersPlus } from "@tabler/icons-react";

import classes from "./Notification.module.css";
import CheckActionIcon from "../UI/ActionIcons/CheckActionIcon";
import XActionIcon from "../UI/ActionIcons/XActionIcon";
import { useMemo } from "react";

export default function NotificationPopover() {
  const { data: friends } = useFriendsQuery();
  const { mutate: acceptFriend, isPending: isAcceptingFriend } =
    useAcceptFriendshipMutation();
  const { mutate: declineFriend, isPending: isDecliningFriend } =
    useDeclineFriendshipMutation();
  const { groupRequests, answerGroupRequest } = useGroupStore();
  const { defaultGroupColor } = useSettingsStore();

  const requestedFriends = useMemo(
    () =>
      friends?.filter(
        (friend) => friend.friendshipStatus === "pending" && !friend.isRequester
      ) || [],
    [friends]
  );

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
                {request.username}
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
                    onClick={() =>
                      answerGroupRequest(
                        request.requestId,
                        true,
                        defaultGroupColor
                      )
                    }
                  />
                  <XActionIcon
                    size="sm"
                    iconSize={20}
                    onClick={() =>
                      answerGroupRequest(
                        request.requestId,
                        false,
                        defaultGroupColor
                      )
                    }
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
