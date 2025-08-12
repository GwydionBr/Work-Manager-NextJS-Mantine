import { Stack } from "@mantine/core";
import SettingsRow from "../SettingsRow";
import SelectTimerRounding from "./RoundingSettings";
import WorkDefaultSettings from "./WorkDefaultSettings";
import TimeTrackerSettings from "./TimeTrackerSettings";

export default function WorkSettings() {
  return (
    <Stack>
      <SettingsRow title="Time Tracker" children={<TimeTrackerSettings />} />
      <SettingsRow title="Timer Rounding" children={<SelectTimerRounding />} />
      <SettingsRow title="Work Settings" children={<WorkDefaultSettings />} />
    </Stack>
  );
}
