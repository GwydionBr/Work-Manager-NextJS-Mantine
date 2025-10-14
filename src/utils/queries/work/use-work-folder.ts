"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllWorkFolders } from "@/actions/work/folder/get-all-work-folder";
import { createWorkFolder } from "@/actions/work/folder/create-work-folder";
import { WorkFolder } from "@/types/work.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { CustomMutationProps } from "@/types/query.types";
import { updateWorkFolder } from "@/actions/work/folder/update-work-folder";

export const useWorkFolderQuery = () => {
  return useQuery({
    queryKey: ["workFolders"],
    queryFn: getAllWorkFolders,
  });
};

export const useCreateWorkFolderMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createWorkFolder"],
    mutationFn: createWorkFolder,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workFolders"], (old: WorkFolder[]) => [
        data,
        ...old,
      ]);
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Ordner erfolgreich erstellt",
            "Folder successfully created"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Ordner konnten nicht erstellt werden",
            "Folder could not be created"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useUpdateWorkFolderMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateWorkFolder"],
    mutationFn: updateWorkFolder,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workFolders"], (old: WorkFolder[]) =>
        old.map((f) => (f.id === data.id ? data : f))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Ordner erfolgreich aktualisiert",
            "Folder successfully updated"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Ordner konnten nicht aktualisiert werden",
            "Folder could not be updated"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
