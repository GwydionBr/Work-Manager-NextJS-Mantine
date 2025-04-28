import { Group, Title, Text } from '@mantine/core';
import classes from "./Home.module.css";

export default function HomePage() {
  return (
    <div className={classes.mainHomeContainer}>
      <Title order={1} pb="xl">Home Page</Title>
      <Group>
        <Text>Welcome to the home page</Text>
      </Group>
    </div>
  );
}
