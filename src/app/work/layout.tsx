"use client";

import { useState } from "react";
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
  const [isNavbarMinimized, setIsNavbarMinimized] = useState<boolean>(false);

  if (projects.length === 0 && !isFetching) {
    return <WorkInitializer />;
  }

  return (
    <Box>
      <ProjectNavbar
        isNavbarMinimized={isNavbarMinimized}
        setIsNavbarMinimized={setIsNavbarMinimized}
      />
      <Box
        ml={isNavbarMinimized ? 60 : 250}
        style={{ transition: "margin 0.4s ease-in-out" }}
      >
        {children}
      </Box>
    </Box>
  );
}
