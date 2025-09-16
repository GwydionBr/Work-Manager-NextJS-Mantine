"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Stack } from "@mantine/core";
import Header from "@/components/Header/Header";
import Profile from "@/components/Account/Profile";
import FriendCard from "@/components/Account/FriendCard";

export default function AccountPage() {
  const { locale } = useSettingsStore();
  return (
    <Box px="xl" w="100%" maw={1200} mx="auto">
      <Header headerTitle={locale === "de-DE" ? "Konto" : "Account"} />
      <Stack w="100%">
        <Profile />
        <FriendCard />
      </Stack>
    </Box>
  );
}
