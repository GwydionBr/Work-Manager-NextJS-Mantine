"use client";

import { useWorkProjectQuery } from "@/utils/queries/work/use-work-project";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box } from "@mantine/core";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import WorkInitializer from "@/components/Work/WorkInitializer";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: projects, isPending } = useWorkProjectQuery();

  const { isWorkNavbarOpen } = useSettingsStore();
  if (projects && projects.length === 0 && !isPending) {
    return <WorkInitializer />;
  }

  return (
    <Box>
      <ProjectNavbar />
      <Box
        ml={isWorkNavbarOpen ? 250 : 60}
        style={{ transition: "margin 0.4s ease-in-out" }}
      >
        {children}
      </Box>
    </Box>
  );
}
