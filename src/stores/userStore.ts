"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert, Enums } from "@/types/db.types";
import { create } from "zustand";

export interface Friend {
  frienshipId: string;
  profile: Tables<"profiles">;
  requester: boolean;
  status: Enums<"status">;
}

interface UserState {
  allProfiles: Tables<"profiles">[] | null;
  profile: Tables<"profiles"> | null;
  friends: Friend[];
  isLoading: boolean;
}

interface UserActions {
  fetchProfileData: () => void;
  addProfile: (profile: TablesInsert<"profiles">) => Promise<boolean>;
  addFriend: (friendId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  acceptFriend: (friendId: string) => Promise<boolean>;
  declineFriend: (friendId: string) => Promise<boolean>;
}

export const useUserStore = create<UserState & UserActions>()(
  (set, get) => ({
    allProfiles: null,
    profile: null,
    isLoading: true,
    friends: [],

    fetchProfileData: async () => {
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
        const friendshipResponse = await actions.getAllFriendships();
        if (friendshipResponse.success) {
          set({
            friends: friendshipResponse.data,
          });
        }
      }
      set({ isLoading: false });
    },

    addProfile: async (profile) => {
      const response = await actions.createProfile({ profile });
      if (response.success) {
        set({ profile: response.data });
        return true;
      }
      return false;
    },
    addFriend: async (friendId) => {
      const { allProfiles, friends } = get();
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
          const newFriends = [
            ...friends,
            {
              frienshipId: response.data.id,
              profile: newPendingFriend,
              requester: true,
              status: "pending" as Enums<"status">,
            },
          ];
          set({
            friends: newFriends,
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
          (friend) => friend.frienshipId !== friendId
        );
        set({ friends: newFriends });
        return true;
      }
      return false;
    },
    acceptFriend: async (friendId) => {
      const { friends } = get();
      const response = await actions.acceptFriendship({
        friendshipId: friendId,
      });
      console.log(response);
      if (response.success) {
        const newFriends = friends.map((friend) =>
          friend.frienshipId === friendId
            ? { ...friend, status: "accepted" as Enums<"status"> }
            : friend
        );
        set({ friends: newFriends });
        return true;
      }
      return false;
    },
    declineFriend: async (friendId) => {
      const { friends } = get();
      const response = await actions.declineFriendship({
        friendshipId: friendId,
      });
      if (response.success) {
        const newFriends = friends.map((friend) =>
          friend.frienshipId === friendId
            ? { ...friend, status: "declined" as Enums<"status"> }
            : friend
        );
        set({ friends: newFriends });
        return true;
      }
      return false;
    },
  })
);

export default useUserStore;
