"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Card } from "@mantine/core";
import ProjectPayoutMenu from "./ProjectPayoutMenu";
import HourlyPayoutMenu from "./HourlyPayoutMenu";
import PayoutModal from "./Modal/PayoutModal";

import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

interface PayoutCardProps {
  sessions: Tables<"timer_session">[];
  project?: Tables<"timer_project">;
  selectedSessions: string[];
  onSessionsChange: (sessions: string[]) => void;
  isOverview?: boolean;
  projects?: Tables<"timer_project">[];
}

export default function PayoutCard({
  sessions,
  project,
  selectedSessions,
  onSessionsChange,
  isOverview = false,
  projects,
}: PayoutCardProps) {
  const { locale } = useSettingsStore();
  const [openedModal, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [openedMenu, { open: openMenu, close: closeMenu }] =
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
    if (isOverview) {
      // In overview mode, we need to find the project for each session
      const sessionProject = projects?.find((p) => p.id === session.project_id);
      if (!sessionProject) return false;

      // For hourly payment projects, check if session is paid
      if (sessionProject.hourly_payment) {
        return !session.paid;
      } else return false;
    }

    // Normal mode - just check session.paid
    return !session.paid;
  });

  // Filter selected sessions to only include unpaid ones
  const selectedUnpaidSessions = selectedSessions.filter((id) =>
    unpaidSessions.some((session) => session.id === id)
  );

  // Calculate available payout for non-hourly payment projects
  const calculateAvailablePayout = () => {
    if (!project || project.hourly_payment) return 0;

    const totalSalary = project.salary;
    const alreadyPaid = project.total_payout || 0;
    return Math.max(0, totalSalary - alreadyPaid);
  };

  const availablePayout = calculateAvailablePayout();

  const handleSessionToggle = (sessionId: string) => {
    // External state management
    onSessionsChange(
      selectedSessions.includes(sessionId)
        ? selectedSessions.filter((id) => id !== sessionId)
        : [...selectedSessions, sessionId]
    );
  };

  const handleSelectAll = () => {
    // External state management
    if (selectedUnpaidSessions.length === unpaidSessions.length) {
      onSessionsChange([]);
    } else {
      onSessionsChange(unpaidSessions.map((s) => s.id));
    }
  };

  const calculateSessionPayout = () => {
    const selectedSessionData = sessions.filter((s) =>
      selectedUnpaidSessions.includes(s.id)
    );

    // Group by currency
    const payoutsByCurrency = selectedSessionData.reduce(
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
          <ProjectPayoutMenu
            project={project}
            openModal={openModal}
            availablePayout={availablePayout}
            useCustomAmount={useCustomAmount}
            payoutAmount={payoutAmount}
            setUseCustomAmount={setUseCustomAmount}
            setPayoutAmount={setPayoutAmount}
          />
        ) : (
          <HourlyPayoutMenu
            openModal={openModal}
            isOverview={isOverview}
            unpaidSessions={unpaidSessions}
            selectedUnpaidSessions={selectedUnpaidSessions}
            handleSelectAll={handleSelectAll}
            handleSessionToggle={handleSessionToggle}
            sessionPayouts={sessionPayouts}
            projects={projects || []}
          />
        )}
      </Card>
      <PayoutModal
        opened={openedModal}
        handleClose={closeModal}
        sessionIds={selectedUnpaidSessions}
        sessionPayouts={sessionPayouts}
        payoutCategoryId={payoutCategoryId}
        project={project}
        payoutAmount={useCustomAmount ? payoutAmount : availablePayout}
        payoutCurrency={payoutCurrency}
      />
    </Box>
  );
}
