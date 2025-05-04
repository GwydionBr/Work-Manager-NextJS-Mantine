"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import SchemeButtonGroup from "@/components/Scheme/SchemeButtonGroup";
import classes from "./Settings.module.css";
import { Stack } from "@mantine/core";
import Header from "@/components/Header/Header";
import SettingsRow from "@/components/Settings/SettingsRow";
import SelectDefaultUnits from "@/components/Settings/SelectDefaultUnits";

export default function SettingsPage() {
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className={classes.settingsMainContainer}>
      <Header headerTitle="Settings Page" />
      <Stack>
        <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
        <SettingsRow title="Default Units" children={<SelectDefaultUnits />} />
      </Stack>
    </div>
  );
}
