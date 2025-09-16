"use client";

import * as actions from "@/actions";
import { Tables, TablesUpdate } from "@/types/db.types";
import { redirect } from "next/navigation";
import { create } from "zustand";
import { notifications } from "@mantine/notifications";

// Import store instances to reset them
import { useTimeTrackerManager } from "@/stores/timeTrackerManagerStore";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";
import { useGroupStore } from "@/stores/groupStore";
import { useTaskStore } from "@/stores/taskStore";
import { useCalendarStore } from "@/stores/calendarStore";

// Function to reset all stores to their initial state
function resetAllStores() {
  // Reset time tracker manager store
  useTimeTrackerManager.getState().resetStore();

  // Reset work manager store
  useWorkStore.getState().resetStore();

  // Reset settings store
  useSettingsStore.getState().resetStore();

  // Reset finance store
  useFinanceStore.getState().resetStore();

  // Reset group store
  useGroupStore.getState().resetStore();

  // Reset task store
  useTaskStore.getState().resetStore();

  // Reset user store (this one)
  useUserStore.getState().resetStore();

  // Reset calendar store
  useCalendarStore.getState().resetStore();
}

export interface Friend {
  friendshipId: string;
  createdAt: string;
  profile: Tables<"profiles">;
}

interface UserState {
  allProfiles: Tables<"profiles">[] | null;
  profile: Tables<"profiles"> | null;
  friends: Friend[];
  requestedFriends: Friend[];
  pendingFriends: Friend[];
  declinedFriends: Friend[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface UserActions {
  resetStore: () => void;
  fetchUserData: () => Promise<void>;
  logout: () => Promise<boolean>;
  deleteUser: () => Promise<boolean>;
  updateProfile: (profile: TablesUpdate<"profiles">) => Promise<boolean>;
  addFriend: (friendId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  acceptFriend: (friendId: string) => Promise<boolean>;
  declineFriend: (friendId: string) => Promise<boolean>;
}

export const useUserStore = create<UserState & UserActions>()((set, get) => ({
  allProfiles: null,
  profile: null,
  isFetching: true,
  friends: [],
  requestedFriends: [],
  pendingFriends: [],
  declinedFriends: [],
  lastFetch: null,

  resetStore: () =>
    set({
      allProfiles: null,
      profile: null,
      isFetching: true,
      friends: [],
      requestedFriends: [],
      pendingFriends: [],
      declinedFriends: [],
      lastFetch: null,
    }),

  // Fetch user data
  fetchUserData: async () => {
    set({ isFetching: true });
    const profileResponse = await actions.getProfile();

    if (profileResponse.success) {
      set({
        profile: profileResponse.data,
      });
      const allProfilesResponse = await actions.getAllProfiles();
      if (allProfilesResponse.success) {
        set({
          allProfiles: allProfilesResponse.data,
        });
      }
      const friendshipResponse = await actions.getAllFriends();
      if (friendshipResponse.success) {
        set({
          friends: friendshipResponse.data.friends,
          requestedFriends: friendshipResponse.data.requestedFriends,
          pendingFriends: friendshipResponse.data.pendingFriends,
          declinedFriends: friendshipResponse.data.declinedFriends,
        });
      }
    }
    set({ isFetching: false, lastFetch: new Date() });
  },

  logout: async () => {
    const response = await actions.logout();

    if (response.success) {
      resetAllStores();
      redirect("/");
    }
    return false;
  },

  deleteUser: async () => {
    const response = await actions.deleteUser();
    if (response.success) {
      resetAllStores();
      notifications.show({
        title: "User deleted",
        message: "Your account has been deleted",
        color: "green",
      });
      redirect("/");
    } else {
      notifications.show({
        title: "Error",
        message: response.error,
        color: "red",
      });
    }
    return false;
  },

  updateProfile: async (profile) => {
    const response = await actions.updateProfile({ profile });
    console.log(response);
    if (response.success) {
      set({ profile: response.data });
      return true;
    }
    return false;
  },

  addFriend: async (friendId) => {
    const { allProfiles, pendingFriends } = get();
    const response = await actions.createFriendship({
      friendship: {
        requester_id: get().profile?.id,
        addressee_id: friendId,
      },
    });
    if (response.success) {
      const newPendingFriend = allProfiles?.find(
        (profile) => profile.id === friendId
      );
      if (newPendingFriend) {
        const newPendingFriends = [
          ...pendingFriends,
          {
            friendshipId: response.data.id,
            profile: newPendingFriend,
            createdAt: response.data.created_at,
          },
        ];
        set({
          pendingFriends: newPendingFriends,
        });
      }
      return true;
    }
    return false;
  },
  removeFriend: async (friendId) => {
    const { friends } = get();
    const response = await actions.deleteFriendship({
      friendshipId: friendId,
    });
    if (response.success) {
      const newFriends = friends.filter(
        (friend) => friend.friendshipId !== friendId
      );
      set({ friends: newFriends });
      return true;
    }
    return false;
  },
  acceptFriend: async (friendId) => {
    const { friends, requestedFriends } = get();
    const response = await actions.acceptFriendship({
      friendshipId: friendId,
    });
    if (response.success) {
      const acceptedFriend = requestedFriends.find(
        (friend) => friend.friendshipId === friendId
      );
      if (acceptedFriend) {
        const newFriends = [...friends, acceptedFriend];
        const newRequestedFriends = requestedFriends.filter(
          (friend) => friend.friendshipId !== friendId
        );
        set({ friends: newFriends, requestedFriends: newRequestedFriends });
      }
    }
    return true;
  },
  declineFriend: async (friendId) => {
    const { requestedFriends, declinedFriends } = get();
    const response = await actions.declineFriendship({
      friendshipId: friendId,
    });
    if (response.success) {
      const declinedFriend = requestedFriends.find(
        (friend) => friend.friendshipId === friendId
      );
      if (declinedFriend) {
        const newDeclinedFriends = [...declinedFriends, declinedFriend];
        const newRequestedFriends = requestedFriends.filter(
          (friend) => friend.friendshipId !== friendId
        );
        set({
          declinedFriends: newDeclinedFriends,
          requestedFriends: newRequestedFriends,
        });
      }
    }
    return true;
  },
}));

export default useUserStore;
