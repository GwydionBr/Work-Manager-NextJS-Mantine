"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDeviceDesktopAnalytics,
  IconGauge,
  IconSettings,
  IconUser,
  IconBrandCashapp,
} from "@tabler/icons-react";
import { Flex, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import SchemeToggle from "@/components/Scheme/SchemeToggleButton";
import paths from "@/utils/paths";
import classes from "./Navbar.module.css";

interface LinkData {
  icon: React.ElementType;
  label: string;
  to: string;
}

const mainLinksData = [
  { icon: IconGauge, label: "Work", to: paths.work.workPage() },
  { icon: IconBrandCashapp, label: "Finance", to: paths.finances.financesPage() },
  {
    icon: IconDeviceDesktopAnalytics,
    label: "Analytics",
    to: paths.analytics.analyticsPage(),
  },
];

const profileLinksData = [
  { icon: IconUser, label: "Account", to: paths.account.accountPage() },
  { icon: IconSettings, label: "Settings", to: paths.settings.settingsPage() },
];

export default function Navbar() {
  const pathname = usePathname();

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
              (link.to !== "/" && pathname.startsWith(link.to)) ||
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
      <Text p="lg">WM</Text>
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
          <Stack gap="xs">{profileLinks}</Stack>
        </Stack>
      </Flex>
    </Flex>
  );
}
