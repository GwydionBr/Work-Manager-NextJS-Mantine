"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { useGroupStore } from "@/stores/groupStore";

import { ActionIcon, Box, Indicator, Popover, Transition } from "@mantine/core";
import { IconBellFilled } from "@tabler/icons-react";
import NotificationAsideCard from "./NotificationAsideCard";
import NotificationPopover from "./NotificationPopover";

import classes from "./Notification.module.css";

export default function NotificationAside({
  asideOpened,
}: {
  asideOpened: boolean;
}) {
  const { requestedFriends } = useUserStore();
  const { groupRequests } = useGroupStore();
  const [opened, setOpened] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (
      asideOpened &&
      (requestedFriends.length > 0 || groupRequests.length > 0)
    ) {
      setShowCard(true);
    } else {
      setShowCard(false);
    }
  }, [asideOpened, requestedFriends, groupRequests]);

  function toggleOpened() {
    if (asideOpened) {
      setOpened(false);
    } else {
      const newOpened = !opened;
      setOpened(newOpened);
    }
  }

  return (
    <Box className={classes.notificationAside}>
      <Popover
        opened={opened}
        onChange={setOpened}
        position="left-start"
        offset={5}
        withArrow
        arrowSize={20}
      >
        <Popover.Target>
          <Indicator
            size={16}
            disabled={requestedFriends.length + groupRequests.length === 0}
            label={requestedFriends.length + groupRequests.length}
            color="red"
          >
            <ActionIcon variant="transparent" onClick={toggleOpened}>
              <IconBellFilled />
            </ActionIcon>
          </Indicator>
        </Popover.Target>
        {(requestedFriends.length > 0 || groupRequests.length > 0) && (
          <Popover.Dropdown>
            <NotificationPopover />
          </Popover.Dropdown>
        )}
      </Popover>
      <Transition
        mounted={showCard}
        transition="fade"
        duration={200}
        enterDelay={100}
      >
        {(styles) => (
          <div style={styles}>
            <NotificationAsideCard />
          </div>
        )}
      </Transition>
    </Box>
  );
}
