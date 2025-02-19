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
import { Tooltip, UnstyledButton } from '@mantine/core';
import paths from '@/paths';
import classes from './Navbar.module.css';

const mainLinksMockdata = [
  { icon: IconHome2, label: 'Home', to: paths.home() },
  { icon: IconGauge, label: 'Work', to: paths.work.workPage() },
  { icon: IconDeviceDesktopAnalytics, label: 'Analytics', to: paths.finances.financesPage() },
  { icon: IconUser, label: 'Account', to: paths.account.accountPage() },
  { icon: IconSettings, label: 'Settings', to: paths.settings.settingsPage() },
];

export default function Navbar() {
  const pathname = usePathname();

  const mainLinks = mainLinksMockdata.map((link) => (
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

  return (
    <div className={classes.wrapper}>
      <div className={classes.aside}>
        <div className={classes.logo}>WM</div>
        {mainLinks}
      </div>
    </div>
  );
}
