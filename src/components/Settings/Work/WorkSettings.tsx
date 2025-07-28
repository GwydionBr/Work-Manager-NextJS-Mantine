import { Stack } from "@mantine/core";
import SettingsRow from "../General/SettingsRow";

export default function WorkSettings() {
  return (
    <Stack>
      <SettingsRow title="Work Settings" children={<div>Work Settings</div>} />
    </Stack>
  );
}