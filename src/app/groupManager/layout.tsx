"use client";

import { useEffect } from "react";
import { useGroupStore } from "@/stores/groupStore";

import { Box } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchGroupData } = useGroupStore();

  useEffect(() => {
    fetchGroupData();
  }, []);

  return (
    <Box>
      <GroupManagerNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
