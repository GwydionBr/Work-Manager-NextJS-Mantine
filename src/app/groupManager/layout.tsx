"use client";

import { useEffect } from "react";
import { useGroupStore } from "@/stores/groupStore";
import { useUserStore } from "@/stores/userStore";

import { Box } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchGroupData } = useGroupStore();
  const { fetchUserData: fetchProfileData } = useUserStore();

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
