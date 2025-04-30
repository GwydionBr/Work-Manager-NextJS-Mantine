import { Group, Text, Button, Stack } from "@mantine/core";
import classes from "./Home.module.css";
import Header from "@/components/Header/Header";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className={classes.mainHomeContainer}>
      <Header headerTitle="Work Manager" />
      <Stack align="center" justify="center" h="100%">
        <Group>
          <Text>Get to the Work Console</Text>
        </Group>
        <Button component={Link} href="/work">
          Click me
        </Button>
      </Stack>
    </div>
  );
}
