"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert } from "@/types/db.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";


interface GroupState {
  groups: Tables<"group">[];
  activeGroup: Tables<"group"> | null;
  groceryItems: Tables<"grocery_item">[];
}

interface GroupActions {
  fetchGroupData: () => void;
  addGroup: (group: TablesInsert<"group">) => void;
  removeGroup: (id: string) => void;
  addGroceryItem: (groceryItem: TablesInsert<"grocery_item">) => void;
  removeGroceryItem: (id: string) => void;
  setActiveGroup: (group: Tables<"group">) => void;
}

export const useGroupStore = create<GroupState & GroupActions>()(
  persist(
    (set, get) => ({
      groups: [],
      activeGroup: null,
      groceryItems: [],
      
      fetchGroupData: async () => {
        const response = await actions.getAllGroups();
        if (response.success) {
          set((state) => ({ groups: response.data }));
        }
      },
      addGroup: async (group) => {
        const response = await actions.createGroup({ group });
        if (response.success) {
          set((state) => ({ groups: [...state.groups, response.data] }));
        }
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
      setActiveGroup: (group: Tables<"group">) => {
        set((state) => ({ activeGroup: group }));
      },
    }),
    {
      name: "group",
    }
  )
);

export default useGroupStore;
