"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/stores/profileStore";

import { Autocomplete, Button, Stack, Text } from "@mantine/core";
import { Card } from "@mantine/core";
import FriendList from "./FriendList";
import { IconSearch } from "@tabler/icons-react";

export default function FriendCard() {
  const { fetchProfileData, allProfiles, friends, addFriend } =
    useProfileStore();
  const [search, setSearch] = useState("");
  const [isAddable, setIsAddable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (friends) {
      const isFriend = friends.some(
        (friend) => friend.profile.username === search
      );
      const isValidProfile = allProfiles?.some(
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
    const friendId = allProfiles?.find(
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
            placeholder="Search for a profile"
            data={allProfiles?.map((profile) => profile.username) || []}
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
              Add Friend
            </Button>
          )}
        </Stack>
        {error && <Text c="red">{error}</Text>}
        <FriendList friends={friends} />
      </Stack>
    </Card>
  );
}
