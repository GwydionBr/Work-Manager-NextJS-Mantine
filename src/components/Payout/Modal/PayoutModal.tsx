"use client";

import { Modal } from "@mantine/core";
import { Currency } from "@/types/settings.types";
import SessionModalForm from "./SessionModalForm";
import ProjectModalForm from "./ProjectModalForm";

import { useWorkStore } from "@/stores/workManagerStore";

interface PayoutModalProps {
  opened: boolean;
  handleClose: () => void;
  sessionIds?: string[];
  projectId?: string;
  sessionPayouts: Record<Currency, number>;
}

export default function PayoutModal({
  opened,
  handleClose,
  sessionIds,
  projectId,
  sessionPayouts,
}: PayoutModalProps) {
  const { payoutSessions } = useWorkStore();

  const startValue = Object.values(sessionPayouts)[0];
  const startCurrency = Object.keys(sessionPayouts)[0] as Currency;

  return (
    <Modal opened={opened} onClose={handleClose} title="Payout">
      {projectId ? (
        <ProjectModalForm />
      ) : (
        <SessionModalForm
          sessionIds={sessionIds ?? []}
          handleClose={handleClose}
          startValue={startValue}
          startCurrency={startCurrency}
        />
      )}
    </Modal>
  );
}
