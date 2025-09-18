import { Locale } from "@/types/settings.types";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  IconAlertTriangleFilled,
  IconCheck,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Group, Text } from "@mantine/core";

export const showDeleteConfirmationModal = (
  title: string,
  message: string,
  onConfirm: () => void,
  locale: Locale
) => {
  modals.openConfirmModal({
    title: (
      <Group>
        <IconAlertTriangleFilled size={25} color="red" />
        <Text>{title}</Text>
      </Group>
    ),
    children: <Text>{message}</Text>,
    confirmProps: { color: "red" },
    labels: {
      confirm: (
        <Group>
          <IconTrash size={24} />
          <Text>{locale === "de-DE" ? "Löschen" : "Delete"}</Text>
        </Group>
      ),
      cancel: (
        <Group>
          <IconX size={24} />
          <Text>{locale === "de-DE" ? "Abbrechen" : "Cancel"}</Text>
        </Group>
      ),
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
    position: "top-center",
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
    position: "top-center",
    icon: <IconX />,
  });
};
