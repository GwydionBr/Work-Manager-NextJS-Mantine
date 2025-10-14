"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllWorkTimeEntries } from "@/actions/work/workTimeEntry/get-all-work-time-entries";
import { createWorkTimeEntry } from "@/actions/work/workTimeEntry/create-work-time-entry";
import { updateWorkTimeEntries } from "@/actions/work/workTimeEntry/update-work-time-entries";
import { deleteWorkTimeEntries } from "@/actions/work/workTimeEntry/delete-work-time-entries";
import { CustomMutationProps } from "@/types/query.types";
import {
  CompleteWorkProject,
  InsertWorkTimeEntry,
  WorkTimeEntry,
} from "@/types/work.types";
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
  ...props
}: CustomMutationProps = {}) => {
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
        if (props.showNotification !== false) {
          showCompleteOverlapNotification(locale);
        }
        props.onSuccess?.();
        return;
      } else if (overlappingTimeEntries) {
        if (props.showNotification !== false) {
          showOverlapNotification(
            locale,
            variables.newTimeEntry,
            overlappingTimeEntries,
            createdTimeEntries,
            format24h
          );
        }
      } else {
        if (props.showNotification !== false) {
          showActionSuccessNotification(
            getLocalizedText(
              "Arbeitszeit erfolgreich erstellt",
              "Work time successfully created"
            ),
            locale
          );
        }
      }
      context.client.setQueryData(
        ["workTimeEntries"],
        (old: WorkTimeEntry[]) => {
          if (!old) {
            return undefined;
          }
          return [...old, ...createdTimeEntries];
        }
      );
      context.client.setQueryData(
        ["workProjectById", createdTimeEntries[0].project_id],
        (old: CompleteWorkProject) => {
          if (!old) {
            return undefined;
          }
          return {
            ...old,
            timeEntries: [...old.timeEntries, ...createdTimeEntries],
          };
        }
      );
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Arbeitszeit konnten nicht erstellt werden",
            "Work time could not be created"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useUpdateWorkTimeEntryMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { locale, getLocalizedText, format24h } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateWorkTimeEntry"],
    mutationFn: ({
      updateTimeEntry,
      roundingSettings,
    }: {
      updateTimeEntry: WorkTimeEntry;
      roundingSettings: TimerRoundingSettings;
    }) => {
      let updatedTimeEntry: WorkTimeEntry = { ...updateTimeEntry };
      if (roundingSettings.roundInTimeFragments) {
        updatedTimeEntry = getTimeFragmentSession(
          roundingSettings.timeFragmentInterval,
          updateTimeEntry
        );
      }
      return updateWorkTimeEntries({ update: updatedTimeEntry });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      const { createdTimeEntries, overlappingTimeEntries } = data;
      if (!createdTimeEntries) {
        if (props.showNotification !== false) {
          showCompleteOverlapNotification(locale);
        }
        props.onSuccess?.();
        return;
      } else if (overlappingTimeEntries) {
        if (props.showNotification !== false) {
          showOverlapNotification(
            locale,
            variables.updateTimeEntry,
            overlappingTimeEntries,
            createdTimeEntries,
            format24h
          );
        }
      } else {
        if (props.showNotification !== false) {
          showActionSuccessNotification(
            getLocalizedText(
              "Arbeitszeit erfolgreich aktualisiert",
              "Work time successfully updated"
            ),
            locale
          );
        }
      }
      if (createdTimeEntries.length === 0) {
        context.client.setQueryData(
          ["workTimeEntries"],
          (old: WorkTimeEntry[]) => {
            if (!old) {
              return undefined;
            }
            return old.map((entry) =>
              entry.id === variables.updateTimeEntry.id
                ? variables.updateTimeEntry
                : entry
            );
          }
        );
        context.client.setQueryData(
          ["workProjectById", variables.updateTimeEntry.project_id],
          (old: CompleteWorkProject) => {
            if (!old) {
              return undefined;
            }
            return {
              ...old,
              timeEntries: old.timeEntries.map((entry) =>
                entry.id === variables.updateTimeEntry.id
                  ? variables.updateTimeEntry
                  : entry
              ),
            };
          }
        );
      } else {
        context.client.setQueryData(
          ["workTimeEntries"],
          (old: WorkTimeEntry[]) => {
            if (!old) {
              return undefined;
            }
            const filteredOldTimeEntries = old.filter(
              (entry) => entry.id !== variables.updateTimeEntry.id
            );
            return [...filteredOldTimeEntries, ...createdTimeEntries];
          }
        );
        context.client.setQueryData(
          ["workProjectById", variables.updateTimeEntry.project_id],
          (old: CompleteWorkProject) => {
            if (!old) {
              return undefined;
            }
            const filteredOldTimeEntries = old.timeEntries.filter(
              (entry) => entry.id !== variables.updateTimeEntry.id
            );
            return {
              ...old,
              timeEntries: [...filteredOldTimeEntries, ...createdTimeEntries],
            };
          }
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Arbeitszeit konnten nicht aktualisiert werden",
            "Work time could not be updated"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useDeleteWorkTimeEntryMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteWorkTimeEntry"],
    mutationFn: deleteWorkTimeEntries,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["workTimeEntries"],
        (old: WorkTimeEntry[]) => {
          if (!old) {
            return undefined;
          }
          return old.filter((entry) => !variables.ids.includes(entry.id));
        }
      );
      context.client.setQueryData(
        ["workProjectById", data.project_id],
        (old: CompleteWorkProject) => {
          if (!old) {
            return undefined;
          }
          return {
            ...old,
            timeEntries: old.timeEntries.filter(
              (entry) => !variables.ids.includes(entry.id)
            ),
          };
        }
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Arbeitszeit erfolgreich gelöscht",
            "Work time successfully deleted"
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
            "Arbeitszeit konnten nicht gelöscht werden",
            "Work time could not be deleted"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
