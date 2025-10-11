"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Autocomplete, Button, Stack, Text } from "@mantine/core";
import { Card } from "@mantine/core";
import FriendList from "./FriendList";
import { IconSearch } from "@tabler/icons-react";
import { useOtherProfilesQuery } from "@/utils/queries/profile/use-profile";

export default function FriendCard() {
  const { getLocalizedText } = useSettingsStore();
  const { data: otherProfiles } = useOtherProfilesQuery();
  const { friends, addFriend } = useUserStore();
  const [search, setSearch] = useState("");
  const [isAddable, setIsAddable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (friends) {
      const isFriend = friends.some(
        (friend) => friend.profile.username === search
      );
      const isValidProfile = otherProfiles?.some(
        (profile) => profile.username === search
      );
      if (!isFriend && isValidProfile) {
        setIsAddable(true);
      } else {
        setIsAddable(false);
      }
    }
  }, [friends, search]);

  async function handleAddFriend() {
    setIsLoading(true);
    const friendId = otherProfiles?.find(
      (profile) => profile.username === search
    )?.id;
    if (friendId) {
      const response = await addFriend(friendId);
      if (response) {
        setSearch("");
        setError(null);
      } else {
        setError("Failed to add friend");
      }
    }
    setIsLoading(false);
  }

  return (
    <Card withBorder radius="md" shadow="md">
      <Stack gap="md" mt="md">
        <Stack maw={500}>
          <Autocomplete
            placeholder={
              getLocalizedText("Suche nach einem Profil", "Search for a profile")
            }
            data={otherProfiles?.map((profile) => profile.username) || []}
            value={search}
            onChange={(e) => setSearch(e)}
            leftSection={<IconSearch size={18} />}
            radius="xl"
            mx="md"
          />
          {isAddable && (
            <Button
              loading={isLoading}
              disabled={isLoading}
              onClick={handleAddFriend}
              mx="xl"
            >
              {getLocalizedText("Freund hinzufügen", "Add Friend")}
            </Button>
          )}
        </Stack>
        {error && <Text c="red">{error}</Text>}
        <FriendList />
      </Stack>
    </Card>
  );
}
