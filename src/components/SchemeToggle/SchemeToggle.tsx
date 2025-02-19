'use client';

import { useEffect, useState } from 'react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import cx from 'clsx';
import { ActionIcon, Group, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import classes from './SchemeToggle.module.css';


export default function SchemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  if (!mounted) {
    return null; // verhindert Server/Client-Mismatch
  }

  return (
    <Group justify="center">
      <ActionIcon
        onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
        variant="default"
        size="xl"
        aria-label="Toggle color scheme"
      >
        { computedColorScheme === 'dark' ?
          <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
          :
          <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
        }
      </ActionIcon>
    </Group>
  );
}