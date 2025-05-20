"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert } from "@/types/db.types";
import { create } from "zustand";

interface GroupState {
  groups: Tables<"group">[];
  activeGroup: Tables<"group"> | null;
  groceryItems: Tables<"grocery_item">[];
  isLoading: boolean;
}

interface GroupActions {
  fetchGroupData: () => void;
  addGroup: (group: TablesInsert<"group">) => Promise<boolean>;
  removeGroup: (id: string) => void;
  addGroceryItem: (groceryItem: TablesInsert<"grocery_item">) => void;
  removeGroceryItem: (id: string) => void;
  setActiveGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState & GroupActions>()(
  (set, get) => ({
    groups: [],
    activeGroup: null,
    groceryItems: [],
    isLoading: true,

    fetchGroupData: async () => {
      const activeGroup = get().activeGroup;
      const response = await actions.getAllGroups();
      if (response.success) {
         if (!activeGroup) {
           set({
             activeGroup: response.data[0] || null,
           });
         }
        set({
          groups: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    },
    addGroup: async (group) => {
      const response = await actions.createGroup({ group });
      console.log(response);

      if (response.success) {
        set((state) => ({ groups: [...state.groups, response.data] }));
        return true;
      }
      return false;
    },
    removeGroup: (id) => {
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
      }));
    },
    addGroceryItem: async (groceryItem) => {
      const response = await actions.createGroceryItem({ item: groceryItem });
      if (response.success) {
        set((state) => ({
          groceryItems: [...state.groceryItems, response.data],
        }));
      }
    },
    removeGroceryItem: (id) => {
      set((state) => ({
        groceryItems: state.groceryItems.filter((i) => i.id !== id),
      }));
    },
    setActiveGroup: (id: string) => {
      const group = get().groups.find((g) => g.id === id);
      if (group) {
        set({ activeGroup: group });
      }
    },
  })
);

export default useGroupStore;
