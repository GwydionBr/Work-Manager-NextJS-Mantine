"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllAppointments } from "@/actions/appointments/get-all-appointments";
import { createAppointment } from "@/actions/appointments/create-appointment";
import { deleteAppointments } from "@/actions/appointments/delete-appointments";
import { updateAppointment } from "@/actions/appointments/update-appointment";
import { MutationOptions } from "@/types/query.types";
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
  onSuccess,
  onError,
}: MutationOptions) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["createAppointment"],
    mutationFn: createAppointment,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(
        ["appointments"],
        (old: Tables<"appointment">[]) => [data, ...old]
      );
      context.client.invalidateQueries({ queryKey: ["appointments"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Termin erfolgreich erstellt",
          "Appointment successfully created"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Termin konnten nicht erstellt werden",
          "Appointment could not be created"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useUpdateAppointmentMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
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
      context.client.invalidateQueries({ queryKey: ["appointments"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Termin erfolgreich aktualisiert",
          "Appointment successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Termin konnten nicht aktualisiert werden",
          "Appointment could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useDeleteAppointmentsMutation = ({
  onSuccess,
  onError,
}: MutationOptions) => {
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
      context.client.invalidateQueries({ queryKey: ["appointments"] });
      showActionSuccessNotification(
        getLocalizedText(
          "Termin erfolgreich gelöscht",
          "Appointment successfully deleted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Termin konnten nicht gelöscht werden",
          "Appointment could not be deleted"
        ),
        locale
      );
      onError?.();
    },
  });
};
