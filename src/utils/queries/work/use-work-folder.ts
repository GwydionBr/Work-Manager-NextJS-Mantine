"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormatter } from "@/hooks/useFormatter";

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
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
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
          )
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
          )
        );
      }
      props.onError?.();
    },
  });
};

export const useUpdateWorkFolderMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["updateWorkFolder"],
    mutationFn: updateWorkFolder,
    onMutate: async (newFolder, context) => {
      // Cancel the query to avoid race conditions
      await context.client.cancelQueries({ queryKey: ["workFolders"] });
      // Get the previous data
      const previousFolders: WorkFolder[] | undefined =
        context.client.getQueryData(["workFolders"]);
      // Update the data in the cache
      context.client.setQueryData(["workFolders"], (old: WorkFolder[]) =>
        old.map((f) =>
          f.id === newFolder.folder.id ? { ...f, ...newFolder.folder } : f
        )
      );
      // Return the previous data
      return { previousFolders };
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workFolders"], (old: WorkFolder[]) =>
        old.map((f) => (f.id === data.id ? data : f))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Ordner erfolgreich aktualisiert",
            "Folder successfully updated"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      // Rollback the data
      context.client.setQueryData(
        ["workFolders"],
        onMutateResult?.previousFolders ?? []
      );
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Ordner konnten nicht aktualisiert werden",
            "Folder could not be updated"
          )
        );
      }
      props.onError?.();
    },
  });
};
