"use client";

import { Group, Modal, Text } from "@mantine/core";
import { Currency } from "@/types/settings.types";
import SessionModalForm from "./SessionModalForm";
import ProjectModalForm from "./ProjectModalForm";
import { Tables } from "@/types/db.types";
import { IconBrandCashapp } from "@tabler/icons-react";


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
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconBrandCashapp size={20} />
          <Text fw={600}>Payout</Text>
        </Group>
      }
      styles={{
        title: {
          fontSize: "1.2rem",
          fontWeight: 600,
        },
        header: {
          borderBottom:
            "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-3))",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        },
      }}
    >
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
