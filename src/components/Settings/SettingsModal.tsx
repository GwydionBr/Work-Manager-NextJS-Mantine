import { Modal, Stack } from "@mantine/core";
import SchemeButtonGroup from "@/components/Settings/Default/SchemeSettings";
import SettingsRow from "@/components/Settings/Default/SettingsRow";
import SelectTimerRounding from "@/components/Settings/Default/RoundingSettings";
import FinanceSettings from "@/components/Settings/Default/FinanceSettings";
import WorkSettings from "@/components/Settings/Default/WorkSettings";
import GroupSettings from "@/components/Settings/Default/GroupSettings";

export default function SettingsModal({
  opened,
  close,
}: {
  opened: boolean;
  close: () => void;
}) {
  return (
    <Modal opened={opened} onClose={close} title="Settings" size="80%" centered>
      <Stack w="100%" p="md">
        <SettingsRow title="Color Scheme" children={<SchemeButtonGroup />} />
        <SettingsRow
          title="Timer Rounding"
          children={<SelectTimerRounding />}
        />
        <SettingsRow title="Work Settings" children={<WorkSettings />} />
        <SettingsRow title="Finances" children={<FinanceSettings />} />
        <SettingsRow title="Group" children={<GroupSettings />} />
      </Stack>
    </Modal>
  );
}
