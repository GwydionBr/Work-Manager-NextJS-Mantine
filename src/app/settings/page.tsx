import { Box, Stack } from "@mantine/core";
import SchemeButtonGroup from "@/components/Scheme/SchemeButtonGroup";
import Header from "@/components/Header/Header";
import SettingsRow from "@/components/Settings/SettingsRow";
import SelectTimerRounding from "@/components/Settings/RoundingSettings";
import FinanceSettings from "@/components/Settings/FinanceSettings";
import WorkSettings from "@/components/Settings/WorkSettings";

import classes from "./Settings.module.css";

export default function SettingsPage() {
  return (
    <Box className={classes.settingsMainContainer} px="xl" w="100%">
      <Header headerTitle="Settings Page" />
      <Stack w="100%">
        <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
        <SettingsRow
          title="Timer Rounding"
          children={<SelectTimerRounding />}
        />
        <SettingsRow title="Work Settings" children={<WorkSettings />} />
        <SettingsRow title="Finances" children={<FinanceSettings />} />
      </Stack>
    </Box>
  );
}
