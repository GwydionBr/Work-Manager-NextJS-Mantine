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
import InitializeProfile from "@/components/Account/InitializeProfile";

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
  const { fetchIfStale: fetchGroupIfStale, abortFetch: abortGroupFetch } =
    useGroupStore();
  const {
    fetchIfStale: fetchUserIfStale,
    profile,
    abortFetch: abortUserFetch,
  } = useUserStore();
  const { fetchIfStale: fetchFinanceIfStale, abortFetch: abortFinanceFetch } =
    useFinanceStore();
  const { fetchIfStale: fetchCalendarIfStale, abortFetch: abortCalendarFetch } =
    useCalendarStore();
  const {
    fetchIfStale: fetchWorkIfStale,
    setActiveProjectId,
    abortFetch: abortWorkFetch,
  } = useWorkStore();
  const { fetchIfStale: fetchTaskIfStale, abortFetch: abortTaskFetch } =
    useTaskStore();
  const {
    locale,
    isAsideOpen,
    setIsAsideOpen,
    fetchIfStale: fetchSettingsIfStale,
    abortFetch: abortSettingsFetch,
  } = useSettingsStore();
  const newVersion = useCheckNewVersion(30000, profile);

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
    const interval = FETCH_INTERVAL;
    const prioritized = async () => {
      let priorityFetch = FetchPriority.Settings;
      // Always gently refresh user and settings if stale (non-blocking)
      fetchUserIfStale(interval);
      fetchSettingsIfStale(interval);

      if (pathname.startsWith("/finances")) {
        priorityFetch = FetchPriority.Finance;
        await fetchFinanceIfStale(interval);
      } else if (pathname.startsWith("/tasks")) {
        priorityFetch = FetchPriority.Tasks;
        await fetchTaskIfStale(interval);
      } else if (pathname.startsWith("/workCalendar")) {
        priorityFetch = FetchPriority.Calendar;
        await fetchWorkIfStale(interval);
        await fetchCalendarIfStale(interval);
      } else if (pathname === "/work") {
        console.log("fetching work");
        priorityFetch = FetchPriority.Work;
        await fetchWorkIfStale(interval);
      } else if (pathname.startsWith("/group")) {
        priorityFetch = FetchPriority.Group;
        await fetchGroupIfStale(interval);
      }

      // Background fetching for other data (best-effort)
      if (priorityFetch !== FetchPriority.Finance)
        console.log("fetching finance background");
        fetchFinanceIfStale(interval);
      if (
        priorityFetch !== FetchPriority.Work &&
        priorityFetch !== FetchPriority.Calendar
      )
        fetchWorkIfStale(interval);
      if (priorityFetch !== FetchPriority.Calendar)
        fetchCalendarIfStale(interval);
      if (priorityFetch !== FetchPriority.Group) fetchGroupIfStale(interval);
      if (priorityFetch !== FetchPriority.Tasks) fetchTaskIfStale(interval);
    };

    prioritized();
  };

  useEffect(() => {
    if (isHome || isAuth) return;

    // Abort any ongoing fetches when route changes
    abortFinanceFetch();
    abortWorkFetch();
    abortTaskFetch();
    abortUserFetch();
    abortGroupFetch();
    abortCalendarFetch();
    abortSettingsFetch();

    fetchAllData();
    if (pathname !== "/work") {
      setActiveProjectId(null);
    }
  }, [pathname]);

  function toggleAside() {
    setIsAsideOpen(!isAsideOpen);
  }

  if (profile && !profile.initialized) {
    return <InitializeProfile />;
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
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
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
        <AppShell.Main
          style={{ transition: "0.4s ease-in" }}
          bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
        >
          {children}
        </AppShell.Main>
        <AppShell.Aside
          bg="var(--mantine-color-body)"
          style={{ transition: "width 0.4s ease-in", overflow: "hidden" }}
        >
          <Aside toggleAside={toggleAside} isAsideOpen={isAsideOpen} />
        </AppShell.Aside>
      </AppShell>
    </DatesProvider>
  );
}
