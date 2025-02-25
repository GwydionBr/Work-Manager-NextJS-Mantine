'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Title } from '@mantine/core';
import { useWorkStore } from '@/store/workManagerStore';
import paths from '@/utils/paths';
import classes from './Navbar.module.css';


export default function ProjectNavbar() {
  const pathname = usePathname();
  const { projects } = useWorkStore();

  const links = projects.map((timerProject) => (
    <Link
      className={classes.link}
      data-active={pathname === paths.work.workDetailsPage(timerProject.project.id) || undefined}
      href={paths.work.workDetailsPage(timerProject.project.id)}
      key={timerProject.project.id}
    >
      {timerProject.project.title}
    </Link>
  ));

  return (
    <div className={classes.main}>
      <Title order={4} className={classes.title}>
        Projects
      </Title>

      {links}
    </div>
  );
}