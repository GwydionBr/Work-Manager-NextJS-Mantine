"use client";

import { useSettingsStore } from "@/stores/settingsStore";

import { Group, Modal, Text } from "@mantine/core";
import { IconBrandCashapp } from "@tabler/icons-react";
import SessionModalForm from "./SessionModalForm";
import ProjectModalForm from "./ProjectModalForm";

import { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";


interface PayoutModalProps {
  opened: boolean;
  handleClose: () => void;
  sessionIds?: string[];
  project?: Tables<"timer_project">;
  projectTitle?: string;
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
  projectTitle,
  payoutAmount,
  payoutCurrency,
  payoutCategoryId,
  sessionPayouts,
}: PayoutModalProps) {
  const { locale } = useSettingsStore();
  const startValue = Object.values(sessionPayouts ?? {})[0] ?? 0;
  const startCurrency = Object.keys(sessionPayouts ?? {})[0] as Currency;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconBrandCashapp size={20} />
          <Text fw={600}>{locale === "de-DE" ? "Auszahlung" : "Payout"}</Text>
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
          projectTitle={projectTitle ?? ""}
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
