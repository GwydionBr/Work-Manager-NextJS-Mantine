import { Text, Group, Avatar } from "@mantine/core";
import { Tables } from "@/types/db.types"

import classes from "./Account.module.css";

export default function ProfileRow({ profile }: { profile: Tables<"profiles"> }) {

  return (
    <Group gap="sm" className={classes.profileRow}>
      <Avatar src={profile.avatar_url} size={32} color="teal" />
      <Text>{profile.username}</Text>
    </Group>
  );
}