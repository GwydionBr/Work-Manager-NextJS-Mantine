"use client";

import { useUserStore } from "@/stores/userStore";

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
  const { profile: userProfile } = useUserStore();

  return (
    <Group justify="space-between" className={classes.profileRow}>
      <Group gap="sm">
        <Avatar
          src={profile.avatar_url}
          size={32}
          color={profile.id === userProfile?.id ? "teal" : "cyan"}
          variant="light"
          bd={profile.id === userProfile?.id ? "2px solid red" : "none"}
        />
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
