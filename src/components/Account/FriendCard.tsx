"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useOtherProfilesQuery } from "@/utils/queries/profile/use-profile";
import {
  useCreateFriendshipMutation,
  useFriendsQuery,
} from "@/utils/queries/profile/use-friends";

import { Autocomplete, Button, Stack } from "@mantine/core";
import { Card } from "@mantine/core";
import FriendList from "./FriendList";
import { IconSearch } from "@tabler/icons-react";

export default function FriendCard() {
  const { getLocalizedText } = useSettingsStore();
  const { data: otherProfiles } = useOtherProfilesQuery();
  const [search, setSearch] = useState("");
  const { data: friends } = useFriendsQuery();
  const { mutate: createFriendship, isPending: isCreatingFriendship } =
    useCreateFriendshipMutation(() => setSearch(""));
  const [isAddable, setIsAddable] = useState(false);

  useEffect(() => {
    if (friends && otherProfiles) {
      const isFriend = friends.some((friend) => friend.username === search);
      const isValidProfile = otherProfiles.some(
        (profile) => profile.username === search
      );
      if (!isFriend && isValidProfile) {
        setIsAddable(true);
      } else {
        setIsAddable(false);
      }
    }
  }, [friends, otherProfiles, search]);

  async function handleAddFriend() {
    const friendId = otherProfiles?.find(
      (profile) => profile.username === search
    )?.id;
    if (friendId) {
      createFriendship(friendId);
    }
  }

  return (
    <Card withBorder radius="md" shadow="md">
      <Stack gap="md" mt="md">
        <Stack maw={500}>
          <Autocomplete
            placeholder={getLocalizedText(
              "Suche nach einem Profil",
              "Search for a profile"
            )}
            data={otherProfiles?.map((profile) => profile.username) || []}
            value={search}
            onChange={(e) => setSearch(e)}
            leftSection={<IconSearch size={18} />}
            radius="xl"
            mx="md"
          />
          {isAddable && (
            <Button
              loading={isCreatingFriendship}
              onClick={handleAddFriend}
              mx="xl"
            >
              {getLocalizedText("Freund hinzufügen", "Add Friend")}
            </Button>
          )}
        </Stack>
        <FriendList />
      </Stack>
    </Card>
  );
}
