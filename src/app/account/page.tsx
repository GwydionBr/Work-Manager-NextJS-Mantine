"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/stores/profileStore";

import classes from "./Account.module.css";

import { Stack, Divider, Button, Text } from "@mantine/core";
import LogoutButton from "@/components/Auth/LogoutButton";
import Header from "@/components/Header/Header";
import Profile from "@/components/Account/Profile";
import FriendList from "@/components/Account/FriendList";
import SearchProfiles from "@/components/Account/SearchProfiles";

export default function AccountPage() {
  const { fetchProfileData, allProfiles, friends, pendingFriends, addFriend } =
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
      const isFriend = friends.some((friend) => friend.username === search);
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
      if (!response) {
        setError("Failed to add friend");
      }
    }
    setIsLoading(false);
  }

  return (
    <div className={classes.accountMainContainer}>
      <Header headerTitle="Account" />
      <Stack>
        <LogoutButton />
        <Profile />
        <Divider />
        <SearchProfiles
          profiles={allProfiles}
          search={search}
          setSearch={setSearch}
        />
        {isAddable && (
          <Button
            loading={isLoading}
            disabled={isLoading}
            onClick={handleAddFriend}
          >
            Add Friend
          </Button>
        )}
        {error && <Text c="red">{error}</Text>}
        <FriendList friends={friends} pendingFriends={pendingFriends} />
      </Stack>
    </div>
  );
}
