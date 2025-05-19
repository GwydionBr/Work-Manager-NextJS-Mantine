"use client";

import { useEffect } from "react";
import { Container } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";
import { useFinanceStore } from "@/stores/financeStore";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchData } = useFinanceStore();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <GroupManagerNavbar />
      <Container ml="250px">{children}</Container>
    </div>
  );
}
