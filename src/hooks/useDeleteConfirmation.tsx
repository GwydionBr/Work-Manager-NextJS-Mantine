"use client";

import React from "react";
import { useFormatter } from "@/hooks/useFormatter";
import { Stack, Text, List } from "@mantine/core";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";

interface UseDeleteConfirmationOptions<T> {
  items: T[];
  getId: (item: T) => string;
  getTitle: (item: T) => string;
  getDescription?: (item: T) => string | undefined;
  deleteTitle: string;
  deleteMessage: string;
  onConfirm: (ids: string[]) => void;
}

export function useDeleteConfirmation<T>(
  options: UseDeleteConfirmationOptions<T>
) {
  const { getLocalizedText } = useFormatter();
  const {
    items,
    getId,
    getTitle,
    getDescription,
    deleteTitle,
    deleteMessage,
    onConfirm,
  } = options;

  const showDeleteModal = (ids: string[]) => {
    showDeleteConfirmationModal(
      deleteTitle,
      <Stack>
        <Text>{deleteMessage}</Text>
        <List>
          {items
            .filter((item) => ids.includes(getId(item)))
            .map((item) => (
              <List.Item key={getId(item)}>
                <Stack gap={0}>
                  <Text>{getTitle(item)}</Text>
                  {getDescription && getDescription(item) && (
                    <Text fz="xs" c="dimmed">
                      {getDescription(item)}
                    </Text>
                  )}
                </Stack>
              </List.Item>
            ))}
        </List>
      </Stack>,
      () => {
        onConfirm(ids);
      }
    );
  };

  return { showDeleteModal };
}
