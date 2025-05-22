import { useUserStore } from "@/stores/userStore";

import { Card, Loader, Stack, Text } from "@mantine/core";
import LogoutButton from "../Auth/LogoutButton";

export default function Profile() {
  const { profile, isLoading } = useUserStore();

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return <div>No Profile found</div>;
  }

  return (
    <Card withBorder radius="md" shadow="md">
      <Stack>
        <Text>Username: {profile.username}</Text>
        <Text>Email: {profile.email}</Text>
        <LogoutButton />
      </Stack>
    </Card>
  );
}
