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
import { useFormatter } from "@/hooks/useFormatter";

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
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, onMutateResult, context) => {
      router.push("/");
      context.client.clear();
      resetAllStores();
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText("Fehler beim Ausloggen", "Error logging out")
      );
    },
  });
};

export const useDeleteUserMutation = () => {
  const router = useRouter();
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, variables, onMutateResult, context) => {
      router.push("/");
      resetAllStores();
      context.client.clear();
      showActionSuccessNotification(
        getLocalizedText(
          "Konto erfolgreich gelöscht",
          "Account deleted successfully"
        )
      );
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText(
          "Fehler beim Löschen des Kontos",
          "Error deleting account"
        )
      );
    },
  });
};

export const useLoginMutation = () => {
  const { getLocalizedText } = useFormatter();
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["profile"], data);
      router.push("/work");
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText("Fehler beim Login", "Error logging in")
      );
    },
  });
};

export const useSignupMutation = () => {
  const router = useRouter();
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationFn: signup,
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["profile"], data);
      router.push("/work");
    },
    onError: (error) => {
      showActionErrorNotification(
        getLocalizedText("Fehler beim Registrieren", "Error registering")
      );
    },
  });
};
