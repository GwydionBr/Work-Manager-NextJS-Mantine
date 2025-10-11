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

export const useFriendsQuery = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: getAllFriends,
  });
};

export const useCreateFriendshipMutation = (
  onSuccess?: () => void,
  onError?: () => void
) => {
  const { getLocalizedText, locale } = useSettingsStore();
  return useMutation({
    mutationKey: ["createFriendship"],
    mutationFn: (profileId: string) => createFriendship({ profileId }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["friends"], (old: Friend[]) => [
        data,
        ...old,
      ]);
      showActionSuccessNotification(
        getLocalizedText(
          "Freund erfolgreich angefragt",
          "Friendship successfully requested"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Freund konnte nicht hinzugefügt werden",
          "Error in Friendship request"
        ),
        locale
      ),
        onError?.();
    },
  });
};

export const useAcceptFriendshipMutation = (
  onSuccess?: () => void,
  onError?: () => void
) => {
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
      showActionSuccessNotification(
        getLocalizedText(
          "Freund erfolgreich akzeptiert",
          "Friend successfully accepted"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Freund konnte nicht akzeptiert werden",
          "Friend could not be accepted"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useDeclineFriendshipMutation = (
  onSuccess?: () => void,
  onError?: () => void
) => {
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
      showActionSuccessNotification(
        getLocalizedText(
          "Freund erfolgreich abgelehnt",
          "Friend successfully declined"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Freund konnte nicht abgelehnt werden",
          "Friend could not be declined"
        ),
        locale
      );
      onError?.();
    },
  });
};

export const useRemoveFriendMutation = (
  onSuccess?: () => void,
  onError?: () => void
) => {
  const { getLocalizedText, locale } = useSettingsStore();
  return useMutation({
    mutationKey: ["removeFriend"],
    mutationFn: (friendshipId: string) => deleteFriendship({ friendshipId }),
    onSuccess: (data, variables, onMutateResult, context) => {
      context.client.setQueryData(["friends"], (old: Friend[]) =>
        old.filter((friend) => friend.friendshipId !== variables)
      );
      showActionSuccessNotification(
        getLocalizedText(
          "Freund erfolgreich entfernt",
          "Friend successfully removed"
        ),
        locale
      );
      onSuccess?.();
    },
    onError: () => {
      showActionErrorNotification(
        getLocalizedText(
          "Freund konnte nicht entfernt werden",
          "Friend could not be removed"
        ),
        locale
      );
      onError?.();
    },
  });
};
