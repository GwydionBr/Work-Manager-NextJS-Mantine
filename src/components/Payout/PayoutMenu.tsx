"use client";

import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Menu, Button } from "@mantine/core";
import ProjectPayoutMenu from "./ProjectPayoutMenu";
import HourlyPayoutMenu from "./HourlyPayoutMenu";
import PayoutModal from "./Modal/PayoutModal";
import { IconBrandCashapp } from "@tabler/icons-react";

import type { Tables } from "@/types/db.types";
import { Currency } from "@/types/settings.types";

interface PayoutMenuProps {
  sessions: Tables<"timer_session">[];
  project?: Tables<"timer_project">;
  selectedSessions: string[];
  onSessionsChange: (sessions: string[]) => void;
  isOverview?: boolean;
  projects?: Tables<"timer_project">[];
}

export default function PayoutMenu({
  sessions,
  project,
  selectedSessions,
  onSessionsChange,
  isOverview = false,
  projects,
}: PayoutMenuProps) {
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
        return !session.payed;
      } else return false;
    }

    // Normal mode - just check session.payed
    return !session.payed;
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
      <Menu
        opened={openedMenu}
        onClose={closeMenu}
        trigger="click-hover"
        width={350}
        position="bottom-start"
        transitionProps={{ transition: "pop-top-left", duration: 250 }}
      >
        <Menu.Target>
          <Button
            variant="light"
            size="md"
            color="teal"
            disabled={unpaidSessions.length === 0}
            leftSection={<IconBrandCashapp size={20} />}
            onClick={() => {
              openMenu();
            }}
          >
            {unpaidSessions.length === 0
              ? locale === "de-DE"
                ? "Alles ausgezahlt"
                : "All Paid"
              : locale === "de-DE"
                ? "Auszahlung"
                : "Payout"}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {project && !project.hourly_payment ? (
            <ProjectPayoutMenu
              project={project}
              closeMenu={closeMenu}
              openModal={openModal}
              availablePayout={availablePayout}
              useCustomAmount={useCustomAmount}
              payoutAmount={payoutAmount}
              setUseCustomAmount={setUseCustomAmount}
              setPayoutAmount={setPayoutAmount}
            />
          ) : (
            <HourlyPayoutMenu
              opened={openedMenu}
              closeMenu={closeMenu}
              onSessionsChange={onSessionsChange}
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
        </Menu.Dropdown>
      </Menu>
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
