"use client";

import { useEffect } from "react";
import LogoutButton from "@/components/Auth/LogoutButton";
import Header from "@/components/Header/Header";
import classes from "./Account.module.css";
import { useProfileStore } from "@/stores/profileStore";
import Profile from "@/components/Account/Profile";
import { Stack } from "@mantine/core";

export default function AccountPage() {
  const { fetchProfileData } = useProfileStore();

  useEffect(() => {
    fetchProfileData();
  }, []);

  return (
    <div className={classes.accountMainContainer}>
      <Header headerTitle="Account" />
      <Stack>
        <LogoutButton />
        <Profile />
      </Stack>
    </div>
  );
}