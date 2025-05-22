"use client";

import { useEffect } from "react";
import { useFinanceStore } from "@/stores/financeStore";

import { Box } from "@mantine/core";
import FinanceNavbar from "@/components/Navbar/FinanceNavbar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { fetchFinanceData: fetchData } = useFinanceStore();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <FinanceNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
