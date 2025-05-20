"use client";

import { useEffect } from "react";
import { Container } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";
import { useGroupStore } from "@/stores/groupStore";

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
    <div>
      <GroupManagerNavbar />
      <Container ml="250px">{children}</Container>
    </div>
  );
}
