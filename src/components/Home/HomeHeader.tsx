"use server";

import { getCurrentUserProfile } from "@/actions/profile/getCurrentUserProfile";
import { Box, Card, Stack, Text } from "@mantine/core";

import classes from "./Home.module.css";
import LogoutButton from "../Auth/LogoutButton";

export default async function HomeHeader() {
  const profileResponse = await getCurrentUserProfile();

  if (!profileResponse.success) {
    return null;
  }
  const profile = profileResponse.data;

  return (
    <Card className={classes.homeHeader} withBorder shadow="sm">
      <Stack>
        <Text>Currently logged in as</Text>
        <Box>
          <Text>{profile.username}</Text>
        </Box>
        <LogoutButton />
      </Stack>
    </Card>
  );
}
