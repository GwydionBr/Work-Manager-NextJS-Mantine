import classes from "./Home.module.css";

import { Group, Text, Button, Stack, Box } from "@mantine/core";
import Link from "next/link";
import Header from "@/components/Header/Header";

export default function HomePage() {
  return (
    <Box className={classes.mainHomeContainer}>
      <Header headerTitle="Work Manager" />
      <Stack align="center" justify="center" h="100%">
        <Group>
          <Text>Get to the Work Console</Text>
        </Group>
        <Button component={Link} href="/work">
          Click me
        </Button>
      </Stack>
    </Box>
  );
}
