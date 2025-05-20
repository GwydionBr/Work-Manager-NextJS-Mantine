import { useProfileStore } from "@/stores/profileStore";
import { Loader, Stack, Text } from "@mantine/core";

export default function Profile() {
  const { profile, isLoading } = useProfileStore();

  
  if ( isLoading ) {
    return <Loader />
  }

  if ( !profile ) {
    return <div>No Profile found</div>
  }

  return (
    <Stack>
      <Text>Username: {profile.username}</Text>
      <Text>Email: {profile.email}</Text>
    </Stack>
  );
}
