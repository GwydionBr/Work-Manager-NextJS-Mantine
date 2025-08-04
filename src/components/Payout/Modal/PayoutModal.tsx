"use client";

import { Modal } from "@mantine/core";
import { Currency } from "@/types/settings.types";
import SessionModalForm from "./SessionModalForm";
import ProjectModalForm from "./ProjectModalForm";
import { Tables } from "@/types/db.types";

interface PayoutModalProps {
  opened: boolean;
  handleClose: () => void;
  sessionIds?: string[];
  project?: Tables<"timerProject">;
  payoutAmount?: number;
  payoutCurrency?: Currency;
  payoutCategoryId: string | null;
  sessionPayouts?: Record<Currency, number>;
}

export default function PayoutModal({
  opened,
  handleClose,
  sessionIds,
  project,
  payoutAmount,
  payoutCurrency,
  payoutCategoryId,
  sessionPayouts,
}: PayoutModalProps) {
  const startValue = Object.values(sessionPayouts ?? {})[0] ?? 0;
  const startCurrency = Object.keys(sessionPayouts ?? {})[0] as Currency;

  return (
    <Modal opened={opened} onClose={handleClose} title="Payout">
      {sessionIds && sessionIds.length > 0 ? (
        <SessionModalForm
          sessionIds={sessionIds ?? []}
          handleClose={handleClose}
          startValue={startValue}
          categoryId={payoutCategoryId}
          startCurrency={startCurrency}
        />
      ) : project && payoutAmount && payoutCurrency ? (
        <ProjectModalForm
          project={project}
          handleClose={handleClose}
          startValue={payoutAmount}
          categoryId={payoutCategoryId}
          startCurrency={payoutCurrency}
        />
      ) : null}
    </Modal>
  );
}
