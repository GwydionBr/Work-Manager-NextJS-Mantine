import { Box } from "@mantine/core";
import GroupManagerNavbar from "@/components/Navbar/GroupManagerNavbar";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      <GroupManagerNavbar />
      <Box ml="250px">{children}</Box>
    </Box>
  );
}
