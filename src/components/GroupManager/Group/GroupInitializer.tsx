import { Stack, Text } from "@mantine/core";
import GroupForm from "./GroupForm";

export default function GroupInitializer() {
  return (
    <Stack>
      <Text>
        Welcome to the Group Manager Section. To get started, please create a
        group.
      </Text>
      <GroupForm onClose={() => {}} />
    </Stack>
  );
}
