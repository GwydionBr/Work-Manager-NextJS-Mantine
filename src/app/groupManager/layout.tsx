"use client";

import { useEffect } from "react";
import { useGroupStore } from "@/stores/groupStore";
import { useProfileStore } from "@/stores/profileStore";

import { Box } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchGroupData } = useGroupStore();
  const { fetchProfileData } = useProfileStore();

  useEffect(() => {
    fetchGroupData();
    fetchProfileData();
  }, []);

  return (
    <Box>
      <GroupManagerNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
