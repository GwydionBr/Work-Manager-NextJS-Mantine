"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert } from "@/types/db.types";
import { create } from "zustand";

interface GroupContent {
  group: Tables<"group">;
  groceryItems: Tables<"grocery_item">[];
}

interface GroupState {
  groups: GroupContent[];
  activeGroup: GroupContent | null;
  isLoading: boolean;
}

interface GroupActions {
  fetchGroupData: () => void;
  addGroup: (group: TablesInsert<"group">) => Promise<boolean>;
  setActiveGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState & GroupActions>()(
  (set, get) => ({
    groups: [],
    activeGroup: null,
    isLoading: true,

    fetchGroupData: async () => {
      const activeGroup = get().activeGroup;
      const groupResponse = await actions.getAllGroups();
      const allGroupContent: GroupContent[] = [];

      if (groupResponse.success) {
        if (groupResponse.data.length > 0) {
          for (const group of groupResponse.data) {
            const groceryItemsResponse = await actions.getAllGroceryItems({
              groupId: group.id,
            });
            if (groceryItemsResponse.success) {
              allGroupContent.push({
                group,
                groceryItems: groceryItemsResponse.data,
              });
            }
          }
        }
        if (!activeGroup) {
          set({
            activeGroup: allGroupContent[0] || null,
          });
        }
        set({
          groups: allGroupContent,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    },
    addGroup: async (group) => {
      const response = await actions.createGroup({ group });

      if (response.success) {
        const newGroupContent: GroupContent = {
          group: response.data,
          groceryItems: [],
        };
        set((state) => ({ groups: [...state.groups, newGroupContent] }));
        return true;
      }
      return false;
    },
    setActiveGroup: (id: string) => {
      const group = get().groups.find((g) => g.group.id === id);
      if (group) {
        set({ activeGroup: group });
      }
    },
  })
);

export default useGroupStore;
