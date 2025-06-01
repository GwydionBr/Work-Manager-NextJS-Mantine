"use client";

import { Box, Grid } from "@mantine/core";
import Header from "@/components/Header/Header";
import Profile from "@/components/Account/Profile";
import FriendCard from "@/components/Account/FriendCard";

export default function AccountPage() {
  return (
    <Box px="xl" w="100%" maw={1200} mx="auto">
      <Header headerTitle="Account" />
      <Grid w="100%" px="xl" justify="center">
        <Grid.Col span={{ base: 6 }}>
          <Profile />
        </Grid.Col>
        <Grid.Col span={{ base: 12 }}>
          <FriendCard />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
