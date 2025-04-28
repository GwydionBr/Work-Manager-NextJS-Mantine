import { Group, Text } from '@mantine/core';
import classes from "./Home.module.css";
import Header from '@/components/Header/Header';

export default function HomePage() {
  return (
    <div className={classes.mainHomeContainer}>
      <Header headerTitle="Home Page" />
      <Group>
        <Text>Welcome to the home page</Text>
      </Group>
    </div>
  );
}
