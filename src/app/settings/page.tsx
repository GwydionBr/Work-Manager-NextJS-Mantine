"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settingsStore";

import classes from "./Settings.module.css";

import { Box, Stack } from "@mantine/core";
import SchemeButtonGroup from "@/components/Scheme/SchemeButtonGroup";
import Header from "@/components/Header/Header";
import SettingsRow from "@/components/Settings/SettingsRow";
import SelectDefaultUnits from "@/components/Settings/SelectDefaultUnits";
import SelectCurrencies from "@/components/Settings/SelectCurrencies";

export default function SettingsPage() {
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <Box className={classes.settingsMainContainer} px="xl">
      <Header headerTitle="Settings Page" />
      <Stack>
        <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
        <SettingsRow title="Default Units" children={<SelectDefaultUnits />} />
        <SettingsRow title="Currencies" children={<SelectCurrencies />} />
      </Stack>
    </Box>
  );
}
