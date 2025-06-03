"use client";

import { useEffect } from "react";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useWorkStore } from "@/stores/workManagerStore";

import classes from "./AppShell.module.css";

import { AppShell, Burger, Group } from "@mantine/core";
import Navbar from "@/components/Navbar/Navbar";
import Aside from "./Aside";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { fetchGroupData, lastFetch: lastGroupFetch } = useGroupStore();
  const { fetchUserData, lastFetch: lastUserFetch } = useUserStore();
  const { fetchFinanceData, lastFetch: lastFinanceFetch } = useFinanceStore();
  const { fetchWorkData, lastFetch: lastWorkFetch } = useWorkStore();
  const {
    isAsideOpen,
    setIsAsideOpen,
    fetchSettings,
    lastFetch: lastSettingsFetch,
  } = useSettingsStore();

  const [isBurgerOpen, { toggle: toggleBurger }] = useDisclosure();
  useHotkeys([["mod + B", () => toggleAside()]]);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAuth = pathname === "/auth";

  // Define fetch intervals in milliseconds (5 minutes)
  const FETCH_INTERVAL = 5 * 60 * 1000;

  useEffect(() => {
    if (isHome || isAuth) return;

    const currentTime = Date.now();

    // Helper function to check if data needs to be fetched
    const shouldFetch = (lastFetch: Date | null) => {
      return !lastFetch || currentTime - lastFetch.getTime() > FETCH_INTERVAL;
    };

    // Prioritized fetching based on current route
    if (pathname.startsWith("/settings") && shouldFetch(lastSettingsFetch)) {
      fetchSettings();
    } else if (
      pathname.startsWith("/finances") &&
      shouldFetch(lastFinanceFetch)
    ) {
      fetchFinanceData();
    } else if (pathname.startsWith("/work") && shouldFetch(lastWorkFetch)) {
      fetchWorkData();
    } else if (pathname.startsWith("/group") && shouldFetch(lastGroupFetch)) {
      fetchGroupData();
    } else if (pathname.startsWith("/account") && shouldFetch(lastUserFetch)) {
      fetchUserData();
    }

    // Background fetching for other data
    const backgroundFetch = async () => {
      if (shouldFetch(lastUserFetch)) await fetchUserData();
      if (shouldFetch(lastSettingsFetch)) await fetchSettings();
      if (shouldFetch(lastFinanceFetch)) await fetchFinanceData();
      if (shouldFetch(lastWorkFetch)) await fetchWorkData();
      if (shouldFetch(lastGroupFetch)) await fetchGroupData();
    };

    // Execute background fetch after a short delay
    const timeoutId = setTimeout(backgroundFetch, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname, isHome, isAuth]);

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
        <Aside toggleAside={toggleAside} isAsideOpen={isAsideOpen} />
      </AppShell.Aside>
    </AppShell>
  );
}
