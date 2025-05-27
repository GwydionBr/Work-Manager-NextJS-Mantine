"use client";

import { useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useWorkStore } from "@/stores/workManagerStore";

import classes from "./AppShell.module.css";

import {
  AppShell,
  Burger,
  Group,
  Stack,
  ActionIcon,
  Indicator,
} from "@mantine/core";
import { IconArrowBarLeft, IconBellFilled } from "@tabler/icons-react";
import Navbar from "@/components/Navbar/Navbar";
import TimeTrackerComponent from "../TimeTracker/TimeTrackerComponent";
import NotificationAside from "../Notification/NotificationAside";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { fetchGroupData, groupRequests } = useGroupStore();
  const { fetchUserData, friendRequests } = useUserStore();
  const { fetchFinanceData } = useFinanceStore();
  const { fetchWorkData } = useWorkStore();
  const { isAsideOpen, setIsAsideOpen, fetchSettings } = useSettingsStore();

  const [isBurgerOpen, { toggle: toggleBurger }] = useDisclosure();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAuth = pathname === "/auth";

  useEffect(() => {
    if (!isHome && !isAuth) {
      fetchSettings();
      fetchGroupData();
      fetchUserData();
      fetchFinanceData();
      fetchWorkData();
    }
  }, [isHome, isAuth]);

  function toggleAside() {
    setIsAsideOpen(!isAsideOpen);
  }

  return (
    <AppShell
      className={classes.appShell}
      disabled={isHome || isAuth}
      navbar={{
        width: 65,
        breakpoint: "sm",
        collapsed: { mobile: !isBurgerOpen },
      }}
      aside={{
        width: isAsideOpen ? 300 : 50,
        breakpoint: "md",
        collapsed: { desktop: isHome || isAuth, mobile: true },
      }}
    >
      <AppShell.Header hiddenFrom="sm">
        <Group h="100%" px="md">
          <Burger
            opened={isBurgerOpen}
            onClick={toggleBurger}
            hiddenFrom="sm"
            size="sm"
          />
          WM Logo
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main className={classes.main}>{children}</AppShell.Main>
      <AppShell.Aside className={classes.aside}>
        <Stack py="md" h="100%" justify="space-between" align="center">
          <Stack align="flex-start" w="100%">
            <Group pl="sm" justify="flex-start" w="100%">
              <ActionIcon
                onClick={toggleAside}
                aria-label="Toggle aside"
                variant="transparent"
              >
                <IconArrowBarLeft
                  className={classes.icon}
                  style={{ transform: isAsideOpen ? "rotate(180deg)" : "none" }}
                />
              </ActionIcon>
            </Group>
            <Group pl="sm">
              <Indicator
                size={16}
                disabled={friendRequests.length + groupRequests.length === 0}
                label={friendRequests.length + groupRequests.length}
                color="red"
              >
                <ActionIcon variant="transparent">
                  <IconBellFilled />
                </ActionIcon>
              </Indicator>
            </Group>
          </Stack>

          <NotificationAside />
          <TimeTrackerComponent />
          <Group pl="sm" justify="flex-start" w="100%">
            <ActionIcon
              onClick={toggleAside}
              aria-label="Toggle aside"
              variant="transparent"
            >
              <IconArrowBarLeft
                className={classes.icon}
                style={{ transform: isAsideOpen ? "rotate(180deg)" : "none" }}
              />
            </ActionIcon>
          </Group>
        </Stack>
      </AppShell.Aside>
    </AppShell>
  );
}
