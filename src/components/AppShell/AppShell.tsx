"use client";

import { AppShell, Burger, Group, Stack, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Navbar from "@/components/Navbar/Navbar";
import classes from "./AppShell.module.css";
import TimeTrackerComponent from "../TimeTracker/TimeTrackerComponent";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";
import { IconArrowBarLeft } from "@tabler/icons-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAsideOpen, setIsAsideOpen } = useSettingsStore();
  const [isBurgerOpen, { toggle: toggleBurger }] = useDisclosure();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAuth = pathname === "/auth";

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
      <AppShell.Main>{children}</AppShell.Main>
      <AppShell.Aside className={classes.aside}>
        <Stack py="md" h="100%" justify="space-between" align="center">
          <Group pl="sm" justify="flex-start" w="100%">
            <ActionIcon onClick={toggleAside}>
              <IconArrowBarLeft
                className={classes.icon}
                style={{ transform: isAsideOpen ? "rotate(180deg)" : "none" }}
              />
            </ActionIcon>
          </Group>
          {isAsideOpen && <TimeTrackerComponent />}
          <Group pl="sm" justify="flex-start" w="100%">
            <ActionIcon onClick={toggleAside}>
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
