"use client";

import { useGroupStore } from "@/stores/groupStore";

import { Box } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";
import GroupInitializer from "@/components/GroupManager/Group/GroupInitializer";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { groups, isFetching } = useGroupStore();

  if (groups.length === 0 && !isFetching) {
    return <GroupInitializer />;
  }

  return (
    <Box>
      <GroupManagerNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
