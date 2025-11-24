"use client";

import { Locale } from "@/types/settings.types";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  IconAlertTriangleFilled,
  IconCheck,
  IconAlertCircle,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Group, List, Stack, Text } from "@mantine/core";
import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";
import { useFormatter } from "@/hooks/useFormatter";

export const showDeleteConfirmationModal = (
  title: string,
  message: React.ReactNode,
  onConfirm: () => void,
  locale: Locale,
  loading?: boolean
) => {
  const { formatTimeSpan, getLocalizedText } = useFormatter();
  modals.openConfirmModal({
    title: (
      <Group>
        <IconAlertTriangleFilled size={25} color="red" />
        <Text>{title}</Text>
      </Group>
    ),
    children: message,
    confirmProps: {
      color: "red",
      leftSection: <IconTrash size={24} />,
      loading,
    },
    cancelProps: { variant: "outline", leftSection: <IconX size={24} /> },
    labels: {
      confirm: getLocalizedText("Löschen", "Delete"),
      cancel: getLocalizedText("Abbrechen", "Cancel"),
    },
    onConfirm,
  });
};

export const showActionSuccessNotification = (
  message: string,
  locale: Locale
) => {
  notifications.show({
    title: locale === "de-DE" ? "Erfolg" : "Success",
    message,
    color: "green",
    autoClose: 3000,
    withBorder: true,
    // position: "top-center",
    icon: <IconCheck />,
  });
};

export const showActionErrorNotification = (
  message: string,
  locale: Locale
) => {
  notifications.show({
    title: locale === "de-DE" ? "Fehler" : "Error",
    message,
    color: "red",
    autoClose: 3000,
    withBorder: true,
    // position: "top-center",
    icon: <IconX />,
  });
};

export const showCompleteOverlapNotification = (locale: Locale) => {
  notifications.show({
    title: locale === "de-DE" ? "Komplette Überschneidung" : "Complete overlap",
    message:
      locale === "de-DE"
        ? "Timer Sitzung überschneided sich komplett mit bereits bestehenden Sitzungen und wurde daher nicht gespeichert."
        : "Timer session completely overlaps with another session and was not saved.",
    color: "red",
    icon: <IconAlertCircle />,
    autoClose: false,
    withBorder: true,
  });
};

export const showOverlapNotification = (
  locale: Locale,
  originalSession: InsertWorkTimeEntry,
  overlappingSessions: WorkTimeEntry[],
  createdSessions: WorkTimeEntry[],
  format24h: boolean
) => {
  const { formatTimeSpan, getLocalizedText } = useFormatter();
  const isSingleOverlap =
    overlappingSessions && overlappingSessions.length === 1;
  const isSingleCreatedSession =
    createdSessions && createdSessions.length === 1;
  notifications.show({
    style: {
      maxHeight: "600px",
    },
    title: getLocalizedText("Überschneidung Erkannnt", "Overlap detected"),
    message: (
      <Stack>
        <Text>
          {locale === "de-DE"
            ? "Timer Sitzung hat Überschneidungen und wurde angepasst."
            : "Timer session has overlaps and was adjusted."}
        </Text>
        {originalSession && (
          <Group>
            <Text>
              {getLocalizedText(
                "Ursprüngliche Sitzung: ",
                "Original session: "
              )}
            </Text>
            <List>
              <List.Item key={originalSession.id}>
                {formatTimeSpan(
                  new Date(originalSession.start_time),
                  new Date(originalSession.end_time)
                )}
              </List.Item>
            </List>
          </Group>
        )}
        <Group>
          <Text>
            {isSingleOverlap
              ? getLocalizedText("Überschneidung: ", "Overlap: ")
              : getLocalizedText("Überschneidungen: ", "Overlaps: ")}
          </Text>
          <List>
            {overlappingSessions.map((fragment) => (
              <List.Item key={fragment.id}>
                {formatTimeSpan(
                  new Date(fragment.start_time),
                  new Date(fragment.end_time)
                )}
              </List.Item>
            ))}
          </List>
        </Group>
        <Group>
          <Text>
            {isSingleCreatedSession
              ? getLocalizedText("Erstellte Sitzung: ", "Created session: ")
              : getLocalizedText("Erstellte Sitzungen: ", "Created sessions: ")}
          </Text>
          <List>
            {createdSessions.map((session) => (
              <List.Item key={session.id}>
                {formatTimeSpan(
                  new Date(session.start_time),
                  new Date(session.end_time)
                )}
              </List.Item>
            ))}
          </List>
        </Group>
      </Stack>
    ),
    color: "yellow",
    autoClose: false,
    withBorder: true,
  });
};
