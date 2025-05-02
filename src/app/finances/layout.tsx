"use client";

import { useEffect } from "react";
import { Container } from "@mantine/core";
import FinanceNavbar from "@/components/Navbar/FinanceNavbar";
import { useWorkStore } from "@/stores/workManagerStore";

export default function FinanceLayout({
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
      <FinanceNavbar />
      <Container ml="200px">{children}</Container>
    </div>
  );
}
