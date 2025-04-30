"use client";

import { AppShell, Burger, Group, Button, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Navbar from "@/components/Navbar/Navbar";
import classes from "./AppShell.module.css";
import TimeTrackerComponent from "../TimeTracker/TimeTrackerComponent";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isBurgerOpen, { toggle: toggleBurger }] = useDisclosure();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAuth = pathname === "/auth";

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
        width: 300,
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
      <AppShell.Aside>
        <Stack h="100%" justify="center" align="center">
          <TimeTrackerComponent />
        </Stack>
      </AppShell.Aside>
    </AppShell>
  );
}
