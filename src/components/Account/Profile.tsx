import { useProfileStore } from "@/stores/profileStore";
import { Card, Loader, Stack, Text } from "@mantine/core";
import LogoutButton from "../Auth/LogoutButton";

export default function Profile() {
  const { profile, isLoading } = useProfileStore();

  if (isLoading) {
    return <Loader />;
  }

  if (!profile) {
    return <div>No Profile found</div>;
  }

  return (
    <Card>
      <Stack>
        <Text>Username: {profile.username}</Text>
        <Text>Email: {profile.email}</Text>
        <LogoutButton />
      </Stack>
    </Card>
  );
}
