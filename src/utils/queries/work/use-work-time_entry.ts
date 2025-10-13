"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllWorkTimeEntries } from "@/actions/work/workTimeEntry/get-all-work-time-entries";
import { createWorkTimeEntry } from "@/actions/work/workTimeEntry/create-work-time-entry";
import { updateWorkTimeEntries } from "@/actions/work/workTimeEntry/update-work-time-entries";
import { deleteWorkTimeEntries } from "@/actions/work/workTimeEntry/delete-work-time-entries";
import { MutationOptions } from "@/types/query.types";
import { InsertWorkTimeEntry, WorkTimeEntry } from "@/types/work.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
  showCompleteOverlapNotification,
  showOverlapNotification,
} from "@/utils/notificationFunctions";
import { getTimeFragmentSession } from "@/utils/helper";

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
  const { locale, getLocalizedText, format24h } = useSettingsStore();
  return useMutation({
    mutationKey: ["createWorkTimeEntry"],
    mutationFn: ({
      newTimeEntry,
      roundingSettings,
    }: {
      newTimeEntry: InsertWorkTimeEntry;
      roundingSettings: TimerRoundingSettings;
    }) => {
      let updatedTimeEntry: InsertWorkTimeEntry = { ...newTimeEntry };
      if (roundingSettings.roundInTimeFragments) {
        updatedTimeEntry = getTimeFragmentSession(
          roundingSettings.timeFragmentInterval,
          newTimeEntry
        );
      }
      return createWorkTimeEntry({ newTimeEntry: updatedTimeEntry });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const { createdTimeEntries, overlappingTimeEntries } = data;
      if (!createdTimeEntries) {
        showCompleteOverlapNotification(locale);
        onSuccess?.();
        return;
      } else if (overlappingTimeEntries) {
        showOverlapNotification(
          locale,
          variables.newTimeEntry,
          overlappingTimeEntries,
          createdTimeEntries,
          format24h
        );
      } else {
        showActionSuccessNotification(
          getLocalizedText(
            "Arbeitszeit erfolgreich erstellt",
            "Work time successfully created"
          ),
          locale
        );
      }
      context.client.setQueryData(
        ["workTimeEntries"],
        (old: WorkTimeEntry[]) => [...old, ...createdTimeEntries]
      );
      context.client.invalidateQueries({ queryKey: ["workTimeEntries"] });
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
  const { locale, getLocalizedText, format24h } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateWorkTimeEntry"],
    mutationFn: ({
      newTimeEntry,
      roundingSettings,
    }: {
      newTimeEntry: WorkTimeEntry;
      roundingSettings: TimerRoundingSettings;
    }) => {
      let updatedTimeEntry: WorkTimeEntry = { ...newTimeEntry };
      if (roundingSettings.roundInTimeFragments) {
        updatedTimeEntry = getTimeFragmentSession(
          roundingSettings.timeFragmentInterval,
          newTimeEntry
        );
      }
      return updateWorkTimeEntries({ update: updatedTimeEntry });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const { createdTimeEntries, overlappingTimeEntries } = data;
      if (!createdTimeEntries) {
        showCompleteOverlapNotification(locale);
        onSuccess?.();
        return;
      } else if (overlappingTimeEntries) {
        showOverlapNotification(
          locale,
          variables.newTimeEntry,
          overlappingTimeEntries,
          createdTimeEntries,
          format24h
        );
      } else {
        showActionSuccessNotification(
          getLocalizedText(
            "Arbeitszeit erfolgreich aktualisiert",
            "Work time successfully updated"
          ),
          locale
        );
      }
      if (createdTimeEntries.length === 0) {
        context.client.setQueryData(
          ["workTimeEntries"],
          (old: WorkTimeEntry[]) =>
            old.map((entry) =>
              entry.id === variables.newTimeEntry.id
                ? variables.newTimeEntry
                : entry
            )
        );
        context.client.invalidateQueries({ queryKey: ["workTimeEntries"] });
      } else {
        context.client.setQueryData(
          ["workTimeEntries"],
          (old: WorkTimeEntry[]) => {
            const filteredOld = old.filter(
              (entry) => entry.id !== variables.newTimeEntry.id
            );
            return [...filteredOld, ...createdTimeEntries];
          }
        );
        context.client.invalidateQueries({ queryKey: ["workTimeEntries"] });
      }
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
        old.filter((entry) => !variables.ids.includes(entry.id))
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
