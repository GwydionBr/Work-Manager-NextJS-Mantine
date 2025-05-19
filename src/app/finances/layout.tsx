"use client";

import { useEffect } from "react";
import { Container } from "@mantine/core";
import FinanceNavbar from "@/components/Navbar/FinanceNavbar";
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
    <div >
      <FinanceNavbar />
      <Container ml="250px">{children}</Container>
    </div>
  );
}
