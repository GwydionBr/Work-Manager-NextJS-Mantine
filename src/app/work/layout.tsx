"use client";

import { useEffect } from "react";
import { useWorkStore } from "@/stores/workManagerStore";

import { Box } from "@mantine/core";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchData } = useWorkStore();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <ProjectNavbar />
      <Box ml="200px">{children}</Box>
    </Box>
  );
}
