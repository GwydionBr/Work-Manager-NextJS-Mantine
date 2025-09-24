"use client";

import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box } from "@mantine/core";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import WorkInitializer from "@/components/Work/WorkInitializer";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projects, isFetching, initialized } = useWorkStore();

  const { isWorkNavbarOpen } = useSettingsStore();
  if (projects.length === 0 && !isFetching && initialized) {
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
