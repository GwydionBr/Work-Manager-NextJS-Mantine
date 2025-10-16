"use client";

import { useEffect, useMemo, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useOtherProfilesQuery } from "@/utils/queries/profile/use-profile";
import {
  useCreateFriendshipMutation,
  useFriendsQuery,
} from "@/utils/queries/profile/use-friends";

import { Autocomplete, Button, Stack } from "@mantine/core";
import { Card } from "@mantine/core";
import FriendList from "./FriendList";
import { IconUserSearch } from "@tabler/icons-react";

export default function FriendCard() {
  const { getLocalizedText } = useSettingsStore();
  const { data: otherProfiles } = useOtherProfilesQuery();
  const { data: friends } = useFriendsQuery();
  const { mutate: createFriendship, isPending: isCreatingFriendship } =
    useCreateFriendshipMutation({ onSuccess: () => setSearch("") });
  const [search, setSearch] = useState("");
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

  const addableProfiles = useMemo(() => {
    return (
      otherProfiles
        ?.filter(
          (profile) =>
            !friends?.some((friend) => friend.username === profile.username)
        )
        .map((profile) => profile.username) || []
    );
  }, [otherProfiles, friends]);

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
            data={search.length > 1 ? addableProfiles : []}
            value={search}
            onChange={(e) => setSearch(e)}
            leftSection={<IconUserSearch size={18} />}
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
