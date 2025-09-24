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
  initialized: boolean | null;
  abortController: AbortController | null;
}

interface UserActions {
  resetStore: () => void;
  fetchUserData: () => Promise<void>;
  fetchIfStale: (intervalMs?: number) => Promise<void>;
  abortFetch: () => void;
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
  friends: [],
  requestedFriends: [],
  pendingFriends: [],
  declinedFriends: [],
  isFetching: false,
  lastFetch: null,
  initialized: null,
  abortController: null,
  resetStore: () =>
    set({
      allProfiles: null,
      profile: null,
      friends: [],
      requestedFriends: [],
      pendingFriends: [],
      declinedFriends: [],
      isFetching: false,
      lastFetch: null,
      initialized: null,
      abortController: null,
    }),

  // Fetch user data
  fetchIfStale: async (intervalMs = 5 * 60 * 1000) => {
    const { lastFetch, isFetching, abortController } = get();
    const now = Date.now();
    const last = lastFetch ? new Date(lastFetch).getTime() : 0;
    const stale = !lastFetch || now - last > intervalMs;
    if (!stale || isFetching) return;

    // Abort any existing fetch
    if (abortController) {
      abortController.abort();
    }

    await get().fetchUserData();
  },
  fetchUserData: async () => {
    // Create new AbortController for this fetch
    const abortController = new AbortController();
    set({ isFetching: true, abortController });

    try {
      const profileResponse = await actions.getProfile();

      // Check if fetch was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (profileResponse.success) {
        set({
          profile: profileResponse.data,
        });
        const allProfilesResponse = await actions.getAllProfiles();

        // Check if fetch was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (allProfilesResponse.success) {
          set({
            allProfiles: allProfilesResponse.data,
          });
        }
        const friendshipResponse = await actions.getAllFriends();

        // Check if fetch was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (friendshipResponse.success) {
          set({
            friends: friendshipResponse.data.friends,
            requestedFriends: friendshipResponse.data.requestedFriends,
            pendingFriends: friendshipResponse.data.pendingFriends,
            declinedFriends: friendshipResponse.data.declinedFriends,
          });
        }
      }
      set({
        isFetching: false,
        lastFetch: new Date(),
        initialized: true,
        abortController: null,
      });
    } catch (error) {
      // If fetch was aborted, don't update state
      if (abortController.signal.aborted) {
        return;
      }

      // For other errors, reset fetching state
      set({ isFetching: false, initialized: false, abortController: null });
    }
  },

  abortFetch() {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ isFetching: false, abortController: null });
    }
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
