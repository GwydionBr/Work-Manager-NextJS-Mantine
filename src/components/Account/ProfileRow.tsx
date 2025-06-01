import { Text, Group, Avatar, Badge } from "@mantine/core";
import { Tables } from "@/types/db.types";

import classes from "./Account.module.css";

export default function ProfileRow({
  profile,
  isAdmin,
}: {
  profile: Tables<"profiles">;
  isAdmin?: boolean;
}) {
  console.log(isAdmin);
  return (
    <Group justify="space-between" className={classes.profileRow}>
      <Group gap="sm">
        <Avatar src={profile.avatar_url} size={32} color="teal" />
        <Text>{profile.username}</Text>
      </Group>
      {isAdmin && (
        <Badge size="xs" color="lime" autoContrast>
          Admin
        </Badge>
      )}
    </Group>
  );
}
