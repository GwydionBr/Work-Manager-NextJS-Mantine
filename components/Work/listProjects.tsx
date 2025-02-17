'use client';

import { Accordion } from '@mantine/core';
import type { Tables } from '@/db.types';


type ListProjectsProps = {
  projects: Tables<'timerProject'>[];
};

export default function ListProjects({ projects }: ListProjectsProps) {
  const items = projects.map((project) => (
    <Accordion.Item key={project.id} value={project.title}>
      <Accordion.Control>{project.title}</Accordion.Control>
      <Accordion.Panel>{project.description}</Accordion.Panel>
    </Accordion.Item>
  ));

  return <Accordion>{items}</Accordion>;
}