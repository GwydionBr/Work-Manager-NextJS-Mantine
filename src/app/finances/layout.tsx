"use client";

import { Box } from "@mantine/core";
import FinanceNavbar from "@/components/Navbar/FinanceNavbar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      <FinanceNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
