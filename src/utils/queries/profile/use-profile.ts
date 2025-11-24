"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormatter } from "@/hooks/useFormatter";

import { getProfile } from "@/actions/profile/get-profile";
import { getOtherProfiles } from "@/actions/profile/get-other-profiles";
import { updateProfile } from "@/actions/profile/update-profile";
import { TablesUpdate } from "@/types/db.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { CustomMutationProps } from "@/types/query.types";

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

export const useUpdateProfileMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText } = useFormatter();
  return useMutation({
    mutationKey: ["updateProfile"],
    mutationFn: (profile: TablesUpdate<"profiles">) =>
      updateProfile({ profile }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["profile"], data);
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Profil erfolgreich aktualisiert",
            "Profile successfully updated"
          )
        );
      }
      props.onSuccess?.();
    },
    onError: (error, variables, onMutateResult, context) => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Profil konnten nicht aktualisiert werden",
            "Profile could not be updated"
          )
        );
      }
      props.onError?.();
    },
  });
};
