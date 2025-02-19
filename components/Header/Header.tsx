'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Burger, Button, Divider, Drawer, Group, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import paths from '@/paths';
import { createClient } from '@/utils/supabase/client';
import classes from './Header.module.css';
import { logout } from '@/actions/auth/logout';
import UserCard from '@/components/UserCard/Usercard';

export default function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box pb={120}>
      <header className={classes.header}>
        <Group justify="space-between" h="100%">
          <Link href={paths.home()} className={classes.link}>
            Work Manager
          </Link>

          <Group h="100%" gap={10} visibleFrom="sm">
            <Link href={paths.work.workPage()} className={classes.link}>
              Work
            </Link>
            <Link href={paths.finances.financesPage()} className={classes.link}>
              Finances
            </Link>
          </Group>

          <Group visibleFrom="sm">
            {user ? (
              <UserCard />
            ) : (
              <>
                <Button component={Link} href={paths.auth.login()} variant="default">
                  Log in
                </Button>
                <Button component={Link} href={paths.auth.register()}>
                  Sign up
                </Button>
              </>
            )}
          </Group>

          <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
        </Group>
      </header>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />

          <Link href={paths.home()} className={classes.link} onClick={closeDrawer}>
            Home
          </Link>
          <Link href={paths.work.workPage()} className={classes.link} onClick={closeDrawer}>
            Work
          </Link>
          <Link href={paths.finances.financesPage()} className={classes.link} onClick={closeDrawer}>
            Finances
          </Link>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            {user ? (
              <Button
                onClick={async () => {
                  await handleLogout();
                  closeDrawer();
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  href={paths.auth.login()}
                  variant="default"
                  onClick={closeDrawer}
                >
                  Log in
                </Button>
                <Button component={Link} href={paths.auth.register()} onClick={closeDrawer}>
                  Sign up
                </Button>
              </>
            )}
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
