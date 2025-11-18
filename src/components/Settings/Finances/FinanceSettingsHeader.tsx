import { useSettingsStore } from "@/stores/settingsStore";

import PlusActionIcon from "@/components/UI/ActionIcons/PlusActionIcon";
import { Group, Modal } from "@mantine/core";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";

interface FinanceSettingsHeaderProps {
  title: React.ReactNode;
  onAdd: () => void;
  addDisabled: boolean;
  selectDisabled: boolean;
  selectedModeActive: boolean;
  toggleSelectedMode: () => void;
  modalTitle: React.ReactNode;
  modalOpened: boolean;
  modalOnClose: () => void;
  modalChildren: React.ReactNode;
}

export default function FinanceSettingsHeader({
  title,
  onAdd,
  addDisabled,
  selectDisabled,
  selectedModeActive,
  toggleSelectedMode,
  modalTitle,
  modalOpened,
  modalOnClose,
  modalChildren,
}: FinanceSettingsHeaderProps) {
  const { getLocalizedText } = useSettingsStore();
  return (
    <Group justify="space-between" w="100%">
      <PlusActionIcon onClick={onAdd} disabled={addDisabled} />
      <Modal
        opened={modalOpened}
        onClose={modalOnClose}
        closeOnClickOutside
        withOverlay
        trapFocus
        returnFocus
        title={modalTitle}
        size="md"
        padding="md"
      >
        {modalChildren}
      </Modal>
      <Group
        align="center"
        gap="xs"
        mb="md"
        style={{
          borderBottom:
            "1px solid light-dark(var(--mantine-color-gray-5), var(--mantine-color-dark-3))",
        }}
      >
        {title}
      </Group>
      <SelectActionIcon
        disabled={selectDisabled}
        tooltipLabel={getLocalizedText(
          "Aktiviere Mehrfachauswahl",
          "Activate bulk select"
        )}
        mainControl
        selected={selectedModeActive}
        onClick={toggleSelectedMode}
      />
    </Group>
  );
}
