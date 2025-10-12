"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllWorkTimeEntries } from "@/actions/work/timerSession/get-all-work-time-entries";
import { createWorkTimeEntries } from "@/actions/work/timerSession/create-work-time-entries";
import { updateWorkTimeEntries } from "@/actions/work/timerSession/update-work-time-entries";
import { deleteWorkTimeEntries } from "@/actions/work/timerSession/delete-work-time-entries";
import { MutationOptions } from "@/types/query.types";
import { WorkTimeEntry } from "@/types/work.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

export const useWorkTimeEntryQuery = () => {
  return useQuery({
    queryKey: ["workTimeEntries"],
    queryFn: getAllWorkTimeEntries,
  });
};

export const useCreateWorkTimeEntryMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createWorkTimeEntry"],
    mutationFn: createWorkTimeEntries,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["workTimeEntries"],
        (old: WorkTimeEntry[]) => [...old, ...data]
      );
      context.client.invalidateQueries({ queryKey: ["workTimeEntries"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Arbeitszeit erfolgreich erstellt",
          "Work time successfully created"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Arbeitszeit konnten nicht erstellt werden",
          "Work time could not be created"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useUpdateWorkTimeEntryMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateWorkTimeEntry"],
    mutationFn: updateWorkTimeEntries,
    onSuccess: (data, variables, onMutateResult, context) => {
      const updatedIds = data.map((d) => d.id);
      context.client.setQueryData(["workTimeEntries"], (old: WorkTimeEntry[]) =>
        old.map((entry) =>
          updatedIds.includes(entry.id)
            ? data.find((e) => e.id === entry.id)
            : entry
        )
      );
      context.client.invalidateQueries({ queryKey: ["workTimeEntries"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Arbeitszeit erfolgreich aktualisiert",
          "Work time successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Arbeitszeit konnten nicht aktualisiert werden",
          "Work time could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useDeleteWorkTimeEntryMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteWorkTimeEntry"],
    mutationFn: deleteWorkTimeEntries,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["workTimeEntries"], (old: WorkTimeEntry[]) =>
        old.filter((entry) => !variables.sessionIds.includes(entry.id))
      );
      context.client.invalidateQueries({ queryKey: ["workTimeEntries"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Arbeitszeit erfolgreich gelöscht",
          "Work time successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Arbeitszeit konnten nicht gelöscht werden",
          "Work time could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
};
