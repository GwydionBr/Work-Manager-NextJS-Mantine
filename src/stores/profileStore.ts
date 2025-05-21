"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert } from "@/types/db.types";
import { create } from "zustand";

interface ProfileState {
  allProfiles: Tables<"profiles">[] | null;
  profile: Tables<"profiles"> | null;
  pendingFriends: Tables<"profiles">[];
  friends: Tables<"profiles">[];
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
    pendingFriends: [],

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
            friends: friendshipResponse.data.friends,
            pendingFriends: friendshipResponse.data.pendingFriends,
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
      const { allProfiles, pendingFriends } = get();
      const response = await actions.createFriendship({
        friendship: {
          requester_id: get().profile?.id,
          addressee_id: friendId,
        },
      });
      console.log(response);
      if (response.success) {
        const newPendingFriend = allProfiles?.find(
          (profile) => profile.id === friendId
        );
        if (newPendingFriend) {
          set({
            pendingFriends: [...pendingFriends, newPendingFriend],
          });
        }
        return true;
      }
      return false;
    },
  })
);

export default useProfileStore;
