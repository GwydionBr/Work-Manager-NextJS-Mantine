"use client";

import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useDisclosure, useHover } from "@mantine/hooks";

import { Card, Group, Stack, Text, Box, Transition } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import EditSessionDrawer from "@/components/Work/Session/EditSessionDrawer";

import {
  formatTimeSpan,
  formatTime,
  formatMoney,
} from "@/utils/formatFunctions";

import type { Tables } from "@/types/db.types";
import PencilActionIcon from "@/components/UI/ActionIcons/PencilActionIcon";
import SelectActionIcon from "@/components/UI/ActionIcons/SelectActionIcon";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
  showDeleteConfirmationModal,
} from "@/utils/notificationFunctions";

interface SessionRowProps {
  session: Tables<"timer_session"> & { index: number };
  project?: Tables<"timer_project">;
  isSelected?: boolean;
  onToggleSelected?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isOverview?: boolean;
  selectedModeActive: boolean;
}

export default function SessionRow({
  session,
  project,
  isSelected,
  onToggleSelected,
  isOverview = false,
  selectedModeActive,
}: SessionRowProps) {
  const { locale, format24h } = useSettingsStore();
  const [editDrawerOpened, editDrawerHandler] = useDisclosure(false);
  const { deleteTimerSessions } = useWorkStore();

  const { hovered, ref } = useHover();

  const { index, ...cleanedSession } = session;

  async function handleDelete() {
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Sitzung löschen" : "Delete Session",
      locale === "de-DE"
        ? "Sind Sie sicher, dass Sie diese Sitzung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."
        : "Are you sure you want to delete this session? This action cannot be undone.",
      async () => {
        const success = await deleteTimerSessions([session.id]);
        if (success) {
          showActionSuccessNotification(
            locale === "de-DE"
              ? "Sitzung erfolgreich gelöscht"
              : "Session deleted successfully",
            locale
          );
        } else {
          showActionErrorNotification(
            locale === "de-DE"
              ? "Sitzung konnte nicht gelöscht werden"
              : "Session could not be deleted",
            locale
          );
        }
      },
      locale
    );
  }

  const earnings = Number(
    ((session.active_seconds * session.salary) / 3600).toFixed(2)
  );

  // Determine if session should be considered paid
  const isSessionPaid = () => {
    if (!project) return session.payed;
    // For hourly payment projects, check if session is paid
    if (project.hourly_payment) {
      return session.payed;
    }

    // For non-hourly payment projects, check if project is fully paid
    if (project.salary !== 0) {
      return project.total_payout >= project.salary;
    }
    return false;
  };

  const sessionPaid = isSessionPaid();

  // Only show checkbox for hourly payment projects and unpaid sessions
  const showCheckbox = selectedModeActive && onToggleSelected && !sessionPaid;

  return (
    <Box>
      <Card
        shadow="xs"
        withBorder
        p="sm"
        mt="sm"
        radius={20}
        ref={ref}
        bg={
          isSelected
            ? "light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-4))"
            : "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
        }
        style={{
          opacity: sessionPaid ? 0.6 : 1,
          borderColor: sessionPaid ? "var(--mantine-color-green-4)" : undefined,
          borderWidth: isSelected ? "2px" : undefined,
          cursor: showCheckbox ? "pointer" : "default",
        }}
        onClick={
          showCheckbox
            ? (e: React.MouseEvent<HTMLDivElement>) =>
                onToggleSelected?.(e as any)
            : undefined
        }
      >
        <Group justify="space-between">
          <Group gap="xl">
            <Box w={0}>
              <Transition
                mounted={showCheckbox || false}
                transition="fade-right"
                duration={200}
              >
                {(styles) => (
                  <SelectActionIcon
                    style={styles}
                    onClick={() => {}}
                    selected={isSelected}
                  />
                )}
              </Transition>
            </Box>
            <Stack
              gap="xs"
              ml={showCheckbox ? 40 : 0}
              style={{ transition: "margin 0.2s ease" }}
            >
              <Group>
                <IconClock size={14} color="gray" />
                <Text>
                  {formatTimeSpan(
                    new Date(session.start_time),
                    new Date(session.end_time),
                    format24h
                  )}
                </Text>
                {sessionPaid && (
                  <Text size="xs" c="green" fw={500}>
                    {locale === "de-DE" ? "✓ Bezahlt" : "✓ Paid"}
                  </Text>
                )}
              </Group>
              {session.memo && (
                <Text size="sm" c="dimmed" maw={225}>
                  {session.memo}
                </Text>
              )}
              <Group>
                <Text size="sm" c="teal">
                  {locale === "de-DE" ? "Aktiv" : "Active"}:{" "}
                  {formatTime(session.active_seconds)}
                </Text>
                {/* <Text size="sm" c="dimmed">
                  {locale === "de-DE" ? "Pausiert" : "Paused"}:{" "}
                  {formatTime(session.paused_seconds)}
                </Text> */}
              </Group>
            </Stack>
            <Transition
              mounted={hovered && !sessionPaid && !selectedModeActive}
              transition="fade-left"
              duration={200}
              enterDelay={100}
              exitDelay={100}
            >
              {(styles) => (
                <Group style={styles}>
                  <PencilActionIcon
                    onClick={() => editDrawerHandler.open()}
                    tooltipLabel={
                      locale === "de-DE" ? "Sitzung bearbeiten" : "Edit session"
                    }
                  />
                  <DeleteActionIcon
                    onClick={() => handleDelete()}
                    tooltipLabel={
                      locale === "de-DE" ? "Sitzung löschen" : "Delete session"
                    }
                  />
                </Group>
              )}
            </Transition>
          </Group>
          <Group>
            {isOverview && project && (
              <Text size="sm" c="dimmed">
                {project.title}
              </Text>
            )}
            <Text
              style={{
                textDecoration: sessionPaid ? "line-through" : "none",
                color: sessionPaid ? "var(--mantine-color-green-6)" : undefined,
              }}
            >
              {session.hourly_payment
                ? formatMoney(earnings, session.currency, locale)
                : ""}
            </Text>
          </Group>
        </Group>
      </Card>
      {project && (
        <EditSessionDrawer
          timerSession={cleanedSession}
          project={project}
          opened={editDrawerOpened}
          onClose={() => editDrawerHandler.close()}
        />
      )}
    </Box>
  );
}
