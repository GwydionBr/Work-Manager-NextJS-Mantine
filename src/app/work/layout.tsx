import { Box } from "@mantine/core";
import ProjectNavbar from "@/components/Navbar/ProjectNavbar";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box>
      <ProjectNavbar />
      <Box ml="200px">{children}</Box>
    </Box>
  );
}
