"use client";

import "dayjs/locale/de";
import "dayjs/locale/en";

import { useEffect } from "react";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useCheckNewVersion } from "@/hooks/useCheckNewVersion";
import { notifications } from "@mantine/notifications";


import { AppShell, Burger, Button, Group, Stack, Text } from "@mantine/core";
import { IconInfoCircle, IconRefresh } from "@tabler/icons-react";

import { DatesProvider } from "@mantine/dates";
import Navbar from "@/components/Navbar/Navbar";
import Aside from "./Aside";

import classes from "./AppShell.module.css";

enum FetchPriority {
  Settings = "settings",
  Finance = "finance",
  Tasks = "tasks",
  Work = "work",
  Group = "group",
  User = "user",
  Calendar = "calendar",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { fetchGroupData, lastFetch: lastGroupFetch } = useGroupStore();
  const { fetchUserData, lastFetch: lastUserFetch } = useUserStore();
  const { fetchFinanceData, lastFetch: lastFinanceFetch } = useFinanceStore();
  const { fetchCalendarData, lastFetch: lastCalendarFetch } =
    useCalendarStore();
  const {
    fetchWorkData,
    lastFetch: lastWorkFetch,
    setActiveProjectId,
  } = useWorkStore();
  const { fetchTasksData, lastFetch: lastTaskFetch } = useTaskStore();
  const {
    locale,
    isAsideOpen,
    setIsAsideOpen,
    fetchSettings,
    lastFetch: lastSettingsFetch,
  } = useSettingsStore();
  const newVersion = useCheckNewVersion();

  useEffect(() => {
    if (newVersion) {
      notifications.show({
        id: "new-version",
        title: (
          <Group gap="xs">
            <IconInfoCircle size={16} />
            <Text fw={600}>
              {locale === "de-DE"
                ? "Neue Version verfügbar"
                : "New Version available"}
            </Text>
          </Group>
        ),
        message: (
          <Stack>
            <Text ml={26} c="dimmed" size="sm">
              {locale === "de-DE"
                ? "Aktualisiere um die neuesten Änderungen zu sehen."
                : "Refresh to see the latest changes."}
            </Text>
            <Group justify="flex-end">
              <Button
                variant="outline"
                onClick={() => notifications.hide("new-version")}
              >
                {locale === "de-DE" ? "Nicht jetzt" : "Not now"}
              </Button>
              <Button
                onClick={() => window.location.reload()}
                leftSection={<IconRefresh />}
              >
                {locale === "de-DE" ? "Aktualisieren" : "Refresh"}
              </Button>
            </Group>
          </Stack>
        ),
        color: "yellow",
        autoClose: false,
        withBorder: true,
        withCloseButton: false,
      });
    }
  }, [newVersion]);

  const [isBurgerOpen, { toggle: toggleBurger }] = useDisclosure();
  useHotkeys([["mod + B", () => toggleAside()]]);

  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAuth = pathname === "/auth";

  // Define fetch intervals in milliseconds (5 minutes)
  const FETCH_INTERVAL = 5 * 60 * 1000;

  const fetchAllData = async () => {
    const currentTime = Date.now();

    // Helper function to check if data needs to be fetched
    const shouldFetch = (lastFetch: Date | null) => {
      if (lastFetch === null) return true;
      const lastFetchTime =
        lastFetch instanceof Date
          ? lastFetch.getTime()
          : new Date(lastFetch).getTime();
      return currentTime - lastFetchTime > FETCH_INTERVAL;
    };

    const fetchData = async () => {
      let priorityFetch = FetchPriority.Settings;
      // Prioritized fetching based on current route
      if (shouldFetch(lastSettingsFetch)) {
        await fetchSettings();
      }
      if (pathname.startsWith("/finances") && shouldFetch(lastFinanceFetch)) {
        priorityFetch = FetchPriority.Finance;
        await fetchFinanceData();
      } else if (pathname.startsWith("/tasks") && shouldFetch(lastTaskFetch)) {
        priorityFetch = FetchPriority.Tasks;
        await fetchTasksData();
      } else if (
        pathname.startsWith("/workCalendar") &&
        shouldFetch(lastCalendarFetch)
      ) {
        priorityFetch = FetchPriority.Calendar;
        await fetchCalendarData();
        await fetchWorkData();
      } else if (pathname.startsWith("/work") && shouldFetch(lastWorkFetch)) {
        priorityFetch = FetchPriority.Work;
        await fetchWorkData();
      } else if (pathname.startsWith("/group") && shouldFetch(lastGroupFetch)) {
        priorityFetch = FetchPriority.Group;
        await fetchGroupData();
      } else if (
        pathname.startsWith("/account") &&
        shouldFetch(lastUserFetch)
      ) {
        priorityFetch = FetchPriority.User;
        await fetchUserData();
      }

      // Background fetching for other data
      const backgroundFetch = () => {
        if (
          priorityFetch !== FetchPriority.User &&
          shouldFetch(lastUserFetch)
        ) {
          fetchUserData();
        }
        if (
          priorityFetch !== FetchPriority.Finance &&
          shouldFetch(lastFinanceFetch)
        ) {
          fetchFinanceData();
        }
        if (
          priorityFetch !== FetchPriority.Work &&
          priorityFetch !== FetchPriority.Calendar &&
          shouldFetch(lastWorkFetch)
        ) {
          fetchWorkData();
        }
        if (
          priorityFetch !== FetchPriority.Group &&
          shouldFetch(lastGroupFetch)
        ) {
          fetchGroupData();
        }
        if (
          priorityFetch !== FetchPriority.Tasks &&
          shouldFetch(lastTaskFetch)
        ) {
          fetchTasksData();
        }
      };

      backgroundFetch();
    };

    fetchData();
  };

  useEffect(() => {
    if (isHome || isAuth) return;
    fetchAllData();
    if (pathname !== "/work") {
      setActiveProjectId(null);
    }
  }, [pathname, isHome, isAuth]);

  function toggleAside() {
    setIsAsideOpen(!isAsideOpen);
  }

  return (
    <DatesProvider
      settings={{
        locale: locale === "de-DE" ? "de" : "en",
        firstDayOfWeek: locale === "de-DE" ? 1 : 0,
        weekendDays: locale === "de-DE" ? [0, 6] : [0],
      }}
    >
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
    </DatesProvider>
  );
}
