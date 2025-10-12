"use client";

import "dayjs/locale/de";
import "dayjs/locale/en";

import { useEffect, useMemo } from "react";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUserStore } from "@/stores/userStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useCalendarStore } from "@/stores/calendarStore";
import { useCheckNewVersion } from "@/hooks/useCheckNewVersion";
import { notifications } from "@mantine/notifications";

import { AppShell, Burger, Button, Group, Stack, Text } from "@mantine/core";
import { IconInfoCircle, IconRefresh } from "@tabler/icons-react";
import { DatesProvider } from "@mantine/dates";
import Navbar from "@/components/Navbar/Navbar";
import Aside from "./Aside";
import InitializeProfile from "@/components/Account/InitializeProfile";
import { useProfileQuery } from "@/utils/queries/profile/use-profile";

enum FetchPriority {
  Settings = "settings",
  Work = "work",
  User = "user",
  Calendar = "calendar",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: profile } = useProfileQuery();
  const { fetchIfStale: fetchUserIfStale, abortFetch: abortUserFetch } =
    useUserStore();
  const { fetchIfStale: fetchCalendarIfStale, abortFetch: abortCalendarFetch } =
    useCalendarStore();
  const {
    fetchIfStale: fetchWorkIfStale,
    setActiveProjectId,
    abortFetch: abortWorkFetch,
  } = useWorkStore();
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
  const isHome = useMemo(() => pathname === "/", [pathname]);
  const isAuth = useMemo(() => pathname === "/auth", [pathname]);

  const showInitializeProfile = useMemo(
    () =>
      profile && profile.initialized === false && !isAuth && !isHome,
    [profile, isAuth, isHome]
  );

  // Define fetch intervals in milliseconds (5 minutes)
  const FETCH_INTERVAL = 5 * 60 * 1000;

  const fetchAllData = async () => {
    const interval = FETCH_INTERVAL;
    const prioritized = async () => {
      let priorityFetch = FetchPriority.Settings;
      // Always gently refresh user and settings if stale (non-blocking)
      fetchUserIfStale(interval);
      fetchSettingsIfStale(interval);

      if (pathname.startsWith("/workCalendar")) {
        priorityFetch = FetchPriority.Calendar;
        await fetchWorkIfStale(interval);
        await fetchCalendarIfStale(interval);
      } else if (pathname === "/work") {
        priorityFetch = FetchPriority.Work;
        await fetchWorkIfStale(interval);
      }

      // Background fetching for other data (best-effort)
      if (
        priorityFetch !== FetchPriority.Work &&
        priorityFetch !== FetchPriority.Calendar
      )
        fetchWorkIfStale(interval);
      if (priorityFetch !== FetchPriority.Calendar)
        fetchCalendarIfStale(interval);
    };

    prioritized();
  };

  useEffect(() => {
    if (isHome || isAuth) return;

    // Abort any ongoing fetches when route changes
    abortWorkFetch();
    abortUserFetch();
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

  return (
    <DatesProvider
      settings={{
        locale: locale === "de-DE" ? "de" : "en",
        firstDayOfWeek: locale === "de-DE" ? 1 : 0,
        weekendDays: locale === "de-DE" ? [0, 6] : [0],
      }}
    >
      {showInitializeProfile ? (
        <InitializeProfile />
      ) : (
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
      )}
    </DatesProvider>
  );
}
