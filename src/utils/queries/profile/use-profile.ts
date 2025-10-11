"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getProfile } from "@/actions/profile/get-profile";
import { getOtherProfiles } from "@/actions/profile/get-other-profiles";
import { updateProfile } from "@/actions/profile/update-profile";
import { TablesUpdate } from "@/types/db.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { useSettingsStore } from "@/stores/settingsStore";

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
};

export const useOtherProfilesQuery = () => {
  return useQuery({
    queryKey: ["otherProfiles"],
    queryFn: getOtherProfiles,
  });
};

export const useUpdateProfileMutation = (
  onSuccess?: () => void,
  onError?: () => void
) => {
  const { locale, getLocalizedText } = useSettingsStore();
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (profile: TablesUpdate<"profiles">) =>
      updateProfile({ profile }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["profile"], data);
      showActionSuccessNotification(
        getLocalizedText(
          "Profil erfolgreich aktualisiert",
          "Profile successfully updated"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      showActionErrorNotification(
        getLocalizedText(
          "Profil konnten nicht aktualisiert werden",
          "Profile could not be updated"
        ),
        locale
      );
      onError?.();
    },
  });
};
