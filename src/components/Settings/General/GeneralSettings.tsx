import { Stack } from "@mantine/core";
import SchemeButtonGroup from "./SchemeSettings";
import SettingsRow from "../SettingsRow";

export default function DefaultSettings() {
  return (
    <Stack w="100%" p="md">
      <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
    </Stack>
  );
}
