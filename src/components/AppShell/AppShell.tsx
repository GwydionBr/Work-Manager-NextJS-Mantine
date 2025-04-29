'use client';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from '@/components/Navbar/Navbar';
import classes from './AppShell.module.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isBurgerOpen, { toggle: toggleBurger }] = useDisclosure();

  return (
    <AppShell
      className={classes.appShell}
      navbar={{
        width: 65,
        breakpoint: 'sm',
        collapsed: { mobile: !isBurgerOpen },
      }}
    >
      <AppShell.Header hiddenFrom="sm">
        <Group h="100%" px="md">
          <Burger opened={isBurgerOpen} onClick={toggleBurger} hiddenFrom="sm" size="sm" />
          WM Logo
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <Navbar/>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}