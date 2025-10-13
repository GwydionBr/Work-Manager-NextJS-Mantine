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
import { MutationOptions } from "@/types/query.types";

export const useWorkFolderQuery = () => {
  return useQuery({
    queryKey: ["workFolders"],
    queryFn: getAllWorkFolders,
  });
};

export const useCreateWorkFolderMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createWorkFolder"],
    mutationFn: createWorkFolder,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workFolders"], (old: WorkFolder[]) => [
        data,
        ...old,
      ]);
      showActionSuccessNotification(
        getLocalizedText(
          "Ordner erfolgreich erstellt",
          "Folder successfully created"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Ordner konnten nicht erstellt werden",
          "Folder could not be created"
        ),
        locale
      );
      onError?.();
    },
  });
};
