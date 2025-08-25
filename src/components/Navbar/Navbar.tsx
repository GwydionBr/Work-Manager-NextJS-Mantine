"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";

import { Button, Flex, Stack, Tooltip, UnstyledButton } from "@mantine/core";
import {
  IconBriefcase,
  IconSettings,
  IconUser,
  IconBrandCashapp,
  IconUsersGroup,
  IconCalendar,
  IconListCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import SchemeToggle from "@/components/Scheme/SchemeToggleButton";
import paths from "@/utils/paths";

import classes from "./Navbar.module.css";
import SettingsModal, { SettingsTab } from "../Settings/SettingsModal";

interface LinkData {
  icon: React.ElementType;
  label: string;
  to: string;
}

const mainLinksData = [
  { icon: IconBriefcase, label: "Work", to: paths.work.workPage() },
  {
    icon: IconCalendar,
    label: "Work Calendar",
    to: paths.workCalendar.workCalendarPage(),
  },
  // {
  //   icon: IconListCheck,
  //   label: "Tasks",
  //   to: paths.tasks.tasksPage(),
  // },
  {
    icon: IconBrandCashapp,
    label: "Finance",
    to: paths.finances.financesPage(),
  },
  {
    icon: IconUsersGroup,
    label: "Group Manager",
    to: paths.groupManager.groupManagerPage(),
  },
];

const profileLinksData = [
  { icon: IconUser, label: "Account", to: paths.account.accountPage() },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setSelectedTab, setIsModalOpen } = useSettingsStore();

  function createLinks(linksData: LinkData[]) {
    const links = linksData.map((link) => (
      <Tooltip
        label={link.label}
        position="right"
        withArrow
        transitionProps={{ duration: 0 }}
        key={link.label}
      >
        <Link href={link.to}>
          <UnstyledButton
            className={classes.mainLink}
            data-active={
              link.to === pathname ||
              (link.to !== "/" &&
                pathname.startsWith(link.to) &&
                // Prevent /work from being active when on /workCalendar
                !(
                  link.to === "/work" && pathname.startsWith("/workCalendar")
                )) ||
              undefined
            }
          >
            <link.icon size={22} stroke={1.5} />
          </UnstyledButton>
        </Link>
      </Tooltip>
    ));

    return links;
  }

  const mainLinks = createLinks(mainLinksData);
  const profileLinks = createLinks(profileLinksData);

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      style={{ height: "100%" }}
      className={classes.navbar}
    >
      <Button
        variant="light"
        c="black"
        onClick={() => router.push("/")}
        mt="md"
      >
        WM
      </Button>

      <Flex
        align="center"
        direction="column"
        justify="space-between"
        style={{ height: "100%" }}
        pb={50}
        pt={20}
      >
        <Stack gap="xs">{mainLinks}</Stack>
        <Stack gap="xl" justify="space-between">
          <SchemeToggle />
          <Stack gap="xs">
            {profileLinks}
            <Tooltip
              label="Settings"
              position="right"
              withArrow
              transitionProps={{ duration: 0 }}
              key="Settings"
            >
              <UnstyledButton
                onClick={() => {
                  setIsModalOpen(true);
                  setSelectedTab(SettingsTab.GENERAL);
                }}
                className={classes.mainLink}
              >
                <IconSettings size={22} stroke={1.5} />
              </UnstyledButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Flex>
      <SettingsModal />
    </Flex>
  );
}
