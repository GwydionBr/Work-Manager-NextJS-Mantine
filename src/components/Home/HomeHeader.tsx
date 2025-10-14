"use client";

import { useProfileQuery } from "@/utils/queries/profile/use-profile";
import { Box, Card, Stack, Text } from "@mantine/core";

import LogoutButton from "../Auth/LogoutButton";

export default function HomeHeader() {
  const { data: profile, isPending: isProfilePending } = useProfileQuery();

  if (isProfilePending || !profile) {
    return null;
  }

  return (
    <Card
      style={{ position: "absolute", top: 10, right: 10 }}
      withBorder
      shadow="sm"
    >
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
