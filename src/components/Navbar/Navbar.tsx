'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDeviceDesktopAnalytics,
  IconGauge,
  IconHome2,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { Flex, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core';
import SchemeToggle from '@/components/SchemeToggle/SchemeToggleButton';
import paths from '@/utils/paths';
import classes from './Navbar.module.css';


interface LinkData {
  icon: React.ElementType;
  label: string;
  to: string;
}

const mainLinksData = [
  { icon: IconHome2, label: 'Home', to: paths.home() },
  { icon: IconGauge, label: 'Work', to: paths.work.workPage() },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics', to: paths.finances.financesPage() },
];

const profileLinksData = [
  { icon: IconUser, label: 'Account', to: paths.account.accountPage() },
  { icon: IconSettings, label: 'Settings', to: paths.settings.settingsPage() },
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
              link.to === pathname || (link.to !== '/' && pathname.startsWith(link.to)) || undefined
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
    <Flex direction="column" align="center" justify="flex-start" style={{ height: '100%' }}>
      <Text p="lg">WM</Text>
      <Flex
        align="center"
        direction="column"
        justify="space-between"
        style={{ height: '100%' }}
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