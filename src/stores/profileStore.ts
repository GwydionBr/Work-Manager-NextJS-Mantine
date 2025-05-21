"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert, Enums } from "@/types/db.types";
import { create } from "zustand";

export interface Friend {
  id: string;
  profile: Tables<"profiles">;
  requester: boolean;
  status: Enums<"status">;
}

interface ProfileState {
  allProfiles: Tables<"profiles">[] | null;
  profile: Tables<"profiles"> | null;
  friends: Friend[];
  isLoading: boolean;
}

interface ProfileActions {
  fetchProfileData: () => void;
  addProfile: (profile: TablesInsert<"profiles">) => Promise<boolean>;
  addFriend: (friendId: string) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
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
              id: friendId,
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
  })
);

export default useProfileStore;
