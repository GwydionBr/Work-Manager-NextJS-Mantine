"use client";

import { useState, useEffect } from "react";
import { useWorkStore } from "@/stores/workManagerStore";
import { useFinanceStore } from "@/stores/financeStore";

import { Stack } from "@mantine/core";
import Header from "@/components/Header/Header";
import SessionList from "@/components/Work/Session/SessionList";
import PayoutMenu from "@/components/Work/Project/PayoutMenu";

export default function WorkOverviewPage() {
  const { projects: timerProjects, folders } = useWorkStore();
  const { financeCategories, fetchFinanceData } = useFinanceStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  const sessions = timerProjects.flatMap((project) => project.sessions);
  const projects = timerProjects.map((project) => project.project);

  return (
    <Stack align="center" w="100%" px="xl">
      <Header
        headerTitle="Work Overview"
        leftButton={
          <PayoutMenu
            sessions={sessions}
            projects={projects}
            selectedSessions={selectedSessions}
            onSessionsChange={setSelectedSessions}
            isOverview={true}
          />
        }
      />
      <SessionList
        sessions={sessions}
        projects={projects}
        folders={folders}
        selectedSessions={selectedSessions}
        onSessionsChange={setSelectedSessions}
        isOverview={true}
      />
    </Stack>
  );
}
