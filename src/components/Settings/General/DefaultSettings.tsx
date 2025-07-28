import { Stack } from "@mantine/core";
import SchemeButtonGroup from "./SchemeSettings";
import SettingsRow from "./SettingsRow";
import SelectTimerRounding from "./RoundingSettings";
import WorkSettings from "./WorkSettings";
import FinanceSettings from "./FinanceSettings";
import GroupSettings from "./GroupSettings";

export default function DefaultSettings() {
  return (
    <Stack w="100%" p="md">
      <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
      <SettingsRow title="Timer Rounding" children={<SelectTimerRounding />} />
      <SettingsRow title="Work Settings" children={<WorkSettings />} />
      <SettingsRow title="Finances" children={<FinanceSettings />} />
      <SettingsRow title="Group" children={<GroupSettings />} />
    </Stack>
  );
}
