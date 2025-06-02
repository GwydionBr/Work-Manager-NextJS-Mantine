"use client";

import { useWorkStore } from "@/stores/workManagerStore";

import { Box } from "@mantine/core";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import WorkInitializer from "@/components/Work/WorkInitializer";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projects, isFetching } = useWorkStore();

  if (projects.length === 0 && !isFetching) {
    return <WorkInitializer />;
  }

  return (
    <Box>
      <ProjectNavbar />
      <Box ml="200px">{children}</Box>
    </Box>
  );
}
