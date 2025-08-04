"use client";

import { Modal, Text } from "@mantine/core";
import { Currency } from "@/types/settings.types";

import { useWorkStore } from "@/stores/workManagerStore";

interface PayoutModalProps {
  opened: boolean;
  handleClose: () => void;
  sessionIds?: string[];
  projectId?: string;
  value: number;
  currency: Currency;
}

export default function PayoutModal({
  opened,
  handleClose,
  sessionIds,
  projectId,
  value,
  currency,
}: PayoutModalProps) {
  return (
    
    <Modal opened={opened} onClose={handleClose} title="Payout">
      <Text>Payout</Text>
    </Modal>
  );
}
