"use client";

import { useWorkStore } from "@/stores/workManagerStore";
import { useDisclosure, useHover } from "@mantine/hooks";

import { Card, Group, Stack, Text, Checkbox, Box } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import DeleteActionIcon from "@/components/UI/Buttons/DeleteActionIcon";
import PencilActionIcon from "@/components/UI/Buttons/PencilActionIcon";
import ConfirmDeleteModal from "@/components/UI/ConfirmDeleteModal";
import TimerSessionDrawer from "@/components/Work/Session/TimerSessionDrawer";

import * as helper from "@/utils/workHelperFunctions";

import type { Tables } from "@/types/db.types";

interface SessionRowProps {
  session: Tables<"timerSession">;
  project?: Tables<"timerProject">;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export default function SessionRow({
  session,
  project,
  isSelected,
  onToggleSelection,
}: SessionRowProps) {
  const [deleteModalOpened, deleteModalHandler] = useDisclosure(false);
  const [editDrawerOpened, editDrawerHandler] = useDisclosure(false);
  const { deleteTimerSession } = useWorkStore();

  const { hovered, ref } = useHover();

  async function handleDelete() {
    const success = await deleteTimerSession(session.id);
    if (success) {
      deleteModalHandler.close();
    }
  }

  const earnings = Number(
    ((session.active_seconds * session.salary) / 3600).toFixed(2)
  );

  // Only show checkbox for hourly payment projects and unpaid sessions
  const showCheckbox =
    project?.hourly_payment && onToggleSelection && !session.payed;

  return (
    <Box>
      <Card
        shadow="xs"
        withBorder
        p="sm"
        mt="sm"
        radius={20}
        ref={ref}
        style={{
          opacity: session.payed ? 0.6 : 1,
          borderColor: session.payed
            ? "var(--mantine-color-green-4)"
            : undefined,
        }}
      >
        <Group justify="space-between">
          <Group gap="xl">
            {showCheckbox && (
              <Checkbox
                checked={isSelected}
                onChange={onToggleSelection}
                disabled={session.payed}
              />
            )}
            <Stack gap="xs">
              <Group>
                <IconClock size={14} color="gray" />
                <Text>
                  {helper.formatTimeSpan(
                    new Date(session.start_time),
                    new Date(session.end_time)
                  )}
                </Text>
                {session.payed && (
                  <Text size="xs" c="green" fw={500}>
                    ✓ Paid
                  </Text>
                )}
              </Group>
              <Group>
                <Text size="sm" c="teal">
                  Active: {helper.formatTime(session.active_seconds)}
                </Text>
                <Text size="sm" c="dimmed">
                  Paused: {helper.formatTime(session.paused_seconds)}
                </Text>
              </Group>
            </Stack>
            {hovered && !session.payed && (
              <Group>
                <PencilActionIcon
                  onClick={() => editDrawerHandler.open()}
                  aria-label="Edit session"
                />
                <DeleteActionIcon
                  onClick={() => deleteModalHandler.open()}
                  aria-label="Delete session"
                />
              </Group>
            )}
          </Group>
          <Group>
            {project && (
              <Text size="sm" c="dimmed">
                {project.title}
              </Text>
            )}
            <Text
              style={{
                textDecoration: session.payed ? "line-through" : "none",
                color: session.payed
                  ? "var(--mantine-color-green-6)"
                  : undefined,
              }}
            >
              {session.hourly_payment
                ? helper.formatMoney(
                    earnings,
                    helper.getCurrencySymbol(session.currency)
                  )
                : ""}
            </Text>
          </Group>
        </Group>
      </Card>

      <TimerSessionDrawer
        timerSession={session}
        opened={editDrawerOpened}
        close={() => editDrawerHandler.close()}
      />

      <ConfirmDeleteModal
        opened={deleteModalOpened}
        onClose={() => deleteModalHandler.close()}
        onDelete={handleDelete}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
      />
    </Box>
  );
}
