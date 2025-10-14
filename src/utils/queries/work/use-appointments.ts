"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllAppointments } from "@/actions/appointments/get-all-appointments";
import { createAppointment } from "@/actions/appointments/create-appointment";
import { deleteAppointments } from "@/actions/appointments/delete-appointments";
import { updateAppointment } from "@/actions/appointments/update-appointment";
import { CustomMutationProps } from "@/types/query.types";
import { Tables } from "@/types/db.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";

export const useAppointmentsQuery = () => {
  return useQuery({
    queryKey: ["appointments"],
    queryFn: getAllAppointments,
  });
};

export const useCreateAppointmentMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createAppointment"],
    mutationFn: createAppointment,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["appointments"],
        (old: Tables<"appointment">[]) => [data, ...old]
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich erstellt",
            "Appointment successfully created"
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
            "Termin konnten nicht erstellt werden",
            "Appointment could not be created"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useUpdateAppointmentMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateAppointment"],
    mutationFn: updateAppointment,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["appointments"],
        (old: Tables<"appointment">[]) =>
          old.map((a) => (a.id === data.id ? data : a))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich aktualisiert",
            "Appointment successfully updated"
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
            "Termin konnten nicht aktualisiert werden",
            "Appointment could not be updated"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useDeleteAppointmentsMutation = ({
  ...props
}: CustomMutationProps) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["deleteAppointments"],
    mutationFn: deleteAppointments,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["appointments"],
        (old: Tables<"appointment">[]) =>
          old.filter((a) => !variables.includes(a.id))
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Termin erfolgreich gelöscht",
            "Appointment successfully deleted"
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
            "Termin konnten nicht gelöscht werden",
            "Appointment could not be deleted"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
