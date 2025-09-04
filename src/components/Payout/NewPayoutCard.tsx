"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Card } from "@mantine/core";
import NewProjectPayoutMenu from "./NewProjectPayoutCard";
import NewHourlyPayoutMenu from "./NewHourlyPayoutCard";
import PayoutModal from "./Modal/PayoutModal";

import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

interface PayoutCardProps {
  sessions: Tables<"timer_session">[];
  project?: Tables<"timer_project">;
}

export default function NewPayoutCard({ sessions, project }: PayoutCardProps) {
  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [payoutCurrency, setPayoutCurrency] = useState<Currency>("USD");
  const [payoutCategoryId, setPayoutCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setPayoutCurrency(project.currency);
      setPayoutCategoryId(project.cash_flow_category_id);
    }
  }, [project]);

  // Filter out already paid sessions
  const unpaidSessions = sessions.filter((session) => {
    return !session.payed;
  });

  // Calculate available payout for non-hourly payment projects
  const calculateAvailablePayout = () => {
    if (!project || project.hourly_payment) return 0;

    const totalSalary = project.salary;
    const alreadyPaid = project.total_payout || 0;
    return Math.max(0, totalSalary - alreadyPaid);
  };

  const availablePayout = calculateAvailablePayout();

  const calculateSessionPayout = () => {

    // Group by currency
    const payoutsByCurrency = unpaidSessions.reduce(
      (acc, session) => {
        const currency = session.currency;
        const earnings = session.hourly_payment
          ? Number(
              ((session.active_seconds * session.salary) / 3600).toFixed(2)
            )
          : 0;

        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += earnings;
        return acc;
      },
      {} as Record<Currency, number>
    );

    return payoutsByCurrency;
  };

  const sessionPayouts = calculateSessionPayout();

  return (
    <Box>
      <Card
        withBorder
        radius="md"
        p="md"
        mb="md"
        shadow="md"
        w="100%"
        maw={700}
        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
      >
        {project && !project.hourly_payment ? (
          <NewProjectPayoutMenu
            project={project}
            openModal={openModal}
            availablePayout={availablePayout}
            useCustomAmount={useCustomAmount}
            payoutAmount={payoutAmount}
            setUseCustomAmount={setUseCustomAmount}
            setPayoutAmount={setPayoutAmount}
          />
        ) : (
          <NewHourlyPayoutMenu
            unpaidSessions={unpaidSessions}
          />
        )}
      </Card>
      <PayoutModal
        opened={openedModal}
        handleClose={closeModal}
        sessionIds={unpaidSessions.map((session) => session.id)}
        sessionPayouts={sessionPayouts}
        payoutCategoryId={payoutCategoryId}
        project={project}
        payoutAmount={useCustomAmount ? payoutAmount : availablePayout}
        payoutCurrency={payoutCurrency}
      />
    </Box>
  );
}
