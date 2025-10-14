"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
// Import store instances to reset them
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useGroupStore } from "@/stores/groupStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCalendarStore } from "@/stores/calendarStore";

import { logout } from "@/actions/auth/logout";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { deleteUser } from "@/actions/auth/delete-user";
import { signup } from "@/actions/auth/email/signupEmail";
import { login } from "@/actions/auth/email/loginEmail";

const resetAllStores = () => {
  useTimeTrackerManager.getState().resetStore();
  useWorkStore.getState().resetStore();
  useSettingsStore.getState().resetStore();
  useFinanceStore.getState().resetStore();
  useGroupStore.getState().resetStore();
  useTaskStore.getState().resetStore();
  useCalendarStore.getState().resetStore();
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, onMutateResult, context) => {
      resetAllStores();
      context.client.clear();
      router.push("/");
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText("Fehler beim Ausloggen", "Error logging out"),
        locale
      );
    },
  });
};

export const useDeleteUserMutation = () => {
  const router = useRouter();
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, variables, onMutateResult, context) => {
      resetAllStores();
      context.client.clear();
      router.push("/");
      showActionSuccessNotification(
        getLocalizedText(
          "Konto erfolgreich gelöscht",
          "Account deleted successfully"
        ),
        locale
      );
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Löschen des Kontos",
          "Error deleting account"
        ),
        locale
      );
    },
  });
};

export const useLoginMutation = () => {
  const { locale, getLocalizedText } = useSettingsStore();
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["profile"], data);
      router.push("/work");
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText("Fehler beim Login", "Error logging in"),
        locale
      );
    },
  });
};

export const useSignupMutation = () => {
  const router = useRouter();
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationFn: signup,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["profile"], data);
      router.push("/work");
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText("Fehler beim Registrieren", "Error registering"),
        locale
      );
    },
  });
};
