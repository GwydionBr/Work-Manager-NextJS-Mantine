import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Title } from '@mantine/core';
import paths from '@/paths';
import type { Tables } from '@/types/db.types';
import classes from './Navbar.module.css';

type ListProjectsProps = {
  projects: Tables<'timerProject'>[];
};

export default function ProjectNavbar({ projects }: ListProjectsProps) {
  const pathname = usePathname();

  const links = projects.map((project) => (
    <Link
      className={classes.link}
      data-active={pathname === paths.work.workDetailsPage(project.id) || undefined}
      href={paths.work.workDetailsPage(project.id)}
      key={project.id}
    >
      {project.title}
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
