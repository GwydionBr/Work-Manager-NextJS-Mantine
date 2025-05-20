"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert } from "@/types/db.types";
import { create } from "zustand";

interface ProfileState {
  profile: Tables<"profiles"> | null;
  isLoading: boolean;
}

interface ProfileActions {
  fetchProfileData: () => void;
  addProfile: (profile: TablesInsert<"profiles">) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState & ProfileActions>()(
    (set, get) => ({
      profile: null,
      isLoading: true,
      fetchProfileData: async () => {
        const response = await actions.getProfile();
        if (response.success) {
          set({ profile: response.data, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },
      addProfile: async (profile) => {
        const response = await actions.createProfile({ profile });
        if (response.success) {
          set({ profile: response.data });
          return true;
        }
        return false;
      },
    })
);

export default useProfileStore;
