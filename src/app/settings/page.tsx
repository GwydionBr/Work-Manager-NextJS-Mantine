import { Box, Stack } from "@mantine/core";
import SchemeButtonGroup from "@/components/Scheme/SchemeButtonGroup";
import Header from "@/components/Header/Header";
import SettingsRow from "@/components/Settings/SettingsRow";
import SelectTimerRounding from "@/components/Settings/SelectTimerRounding";
import SelectCurrencies from "@/components/Settings/SelectCurrencies";

import classes from "./Settings.module.css";

export default function SettingsPage() {
  return (
    <Box className={classes.settingsMainContainer} px="xl" w="100%">
      <Header headerTitle="Settings Page" />
      <Stack w="100%">
        <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
        <SettingsRow title="Timer Rounding" children={<SelectTimerRounding />} />
        <SettingsRow title="Currencies" children={<SelectCurrencies />} />
      </Stack>
    </Box>
  );
}
