"use client";

import { useEffect } from "react";
import { Container, Flex, Grid } from "@mantine/core";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";
import TimeTrackerComponent from "@/components/TimeTracker/TimeTrackerComponent";
import { useWorkStore } from "@/stores/workManagerStore";

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
    <div>
      <ProjectNavbar />
      <Container ml="200px">{children}</Container>
    </div>
  );
}
