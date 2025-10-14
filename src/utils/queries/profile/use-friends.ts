"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSettingsStore } from "@/stores/settingsStore";
import { getAllFriends } from "@/actions/profile/friendship/get-all-friends";
import { createFriendship } from "@/actions/profile/friendship/create-friendship";
import { Friend, FriendshipStatusEnum } from "@/types/profile.types";
import {
  showActionErrorNotification,
  showActionSuccessNotification,
} from "@/utils/notificationFunctions";
import { acceptFriendship } from "@/actions/profile/friendship/accept-friendship";
import { declineFriendship } from "@/actions/profile/friendship/decline-friendship";
import { deleteFriendship } from "@/actions/profile/friendship/delete-friendship";
import { CustomMutationProps } from "@/types/query.types";

export const useFriendsQuery = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: getAllFriends,
  });
};

export const useCreateFriendshipMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText, locale } = useSettingsStore();
  return useMutation({
    mutationKey: ["createFriendship"],
    mutationFn: (profileId: string) => createFriendship({ profileId }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["friends"], (old: Friend[]) => [
        data,
        ...old,
      ]);
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Freund erfolgreich angefragt",
            "Friendship successfully requested"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Freund konnte nicht hinzugefügt werden",
            "Error in Friendship request"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useAcceptFriendshipMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText, locale } = useSettingsStore();
  return useMutation({
    mutationKey: ["acceptFriendship"],
    mutationFn: (friendshipId: string) => acceptFriendship({ friendshipId }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["friends"], (old: Friend[]) =>
        old.map((friend) =>
          friend.friendshipId === variables
            ? { ...friend, friendshipStatus: FriendshipStatusEnum.ACCEPTED }
            : friend
        )
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Freund erfolgreich akzeptiert",
            "Friend successfully accepted"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Freund konnte nicht akzeptiert werden",
            "Friend could not be accepted"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useDeclineFriendshipMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText, locale } = useSettingsStore();
  return useMutation({
    mutationKey: ["declineFriendship"],
    mutationFn: (friendshipId: string) => declineFriendship({ friendshipId }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["friends"], (old: Friend[]) =>
        old.map((friend) =>
          friend.friendshipId === variables
            ? { ...friend, friendshipStatus: FriendshipStatusEnum.DECLINED }
            : friend
        )
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Freund erfolgreich abgelehnt",
            "Friend successfully declined"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Freund konnte nicht abgelehnt werden",
            "Friend could not be declined"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};

export const useRemoveFriendMutation = ({
  ...props
}: CustomMutationProps = {}) => {
  const { getLocalizedText, locale } = useSettingsStore();
  return useMutation({
    mutationKey: ["removeFriend"],
    mutationFn: (friendshipId: string) => deleteFriendship({ friendshipId }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["friends"], (old: Friend[]) =>
        old.filter((friend) => friend.friendshipId !== variables)
      );
      if (props.showNotification !== false) {
        showActionSuccessNotification(
          getLocalizedText(
            "Freund erfolgreich entfernt",
            "Friend successfully removed"
          ),
          locale
        );
      }
      props.onSuccess?.();
    },
    onError: () => {
      if (props.showNotification !== false) {
        showActionErrorNotification(
          getLocalizedText(
            "Freund konnte nicht entfernt werden",
            "Friend could not be removed"
          ),
          locale
        );
      }
      props.onError?.();
    },
  });
};
