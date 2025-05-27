"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert, Enums } from "@/types/db.types";
import { create } from "zustand";

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
  isLoading: boolean;
}

interface UserActions {
  fetchUserData: () => void;
  addProfile: (profile: TablesInsert<"profiles">) => Promise<boolean>;
  addFriend: (friendId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  acceptFriend: (friendId: string) => Promise<boolean>;
  declineFriend: (friendId: string) => Promise<boolean>;
}

export const useUserStore = create<UserState & UserActions>()((set, get) => ({
  allProfiles: null,
  profile: null,
  isLoading: true,
  friends: [],
  requestedFriends: [],
  pendingFriends: [],
  declinedFriends: [],

  fetchUserData: async () => {
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
