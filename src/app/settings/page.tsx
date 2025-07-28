import { Box, Stack } from "@mantine/core";
import SchemeButtonGroup from "@/components/Settings/General/SchemeSettings";
import Header from "@/components/Header/Header";
import SettingsRow from "@/components/Settings/SettingsRow";
import SelectTimerRounding from "@/components/Settings/Work/RoundingSettings";
import FinanceDefaultSettings from "@/components/Settings/Finances/FinanceDefaultSettings";
import WorkDefaultSettings from "@/components/Settings/Work/WorkDefaultSettings";
import GroupDefaultSettings from "@/components/Settings/Group/GroupDefaultSettings";

import classes from "./Settings.module.css";

export default function SettingsPage() {
  return (
    <Box
      className={classes.settingsMainContainer}
      px="xl"
      w="100%"
      maw={1200}
      mx="auto"
    >
      <Header headerTitle="Settings Page" />
      <Stack w="100%">
        <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
        <SettingsRow
          title="Timer Rounding"
          children={<SelectTimerRounding />}
        />
        <SettingsRow title="Work Settings" children={<WorkDefaultSettings />} />
        <SettingsRow title="Finances" children={<FinanceDefaultSettings />} />
        <SettingsRow title="Group" children={<GroupDefaultSettings />} />
      </Stack>
    </Box>
  );
}
