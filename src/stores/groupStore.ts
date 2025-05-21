"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert } from "@/types/db.types";
import { create } from "zustand";

interface GroupContent {
  id: string;
  title: string;
  description: string | null;
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
  addGroceryItem: (
    groceryItem: TablesInsert<"grocery_item">
  ) => Promise<boolean>;
  setActiveGroup: (id: string) => void;
  toggleGroceryItem: (id: string, checked: boolean) => Promise<boolean>;
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
            const groceryItemsResponse = await actions.getGroceryItemsByGroup({
              groupId: group.id,
            });

            if (groceryItemsResponse.success) {
              allGroupContent.push({
                id: group.id,
                title: group.title,
                description: group.description,
                groceryItems: groceryItemsResponse.data,
              });
            }
          }
        }
        console.log(allGroupContent);
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
          id: response.data.id,
          title: response.data.title,
          description: response.data.description,
          groceryItems: [],
        };
        set((state) => ({ groups: [...state.groups, newGroupContent] }));
        return true;
      }
      return false;
    },
    setActiveGroup: (id: string) => {
      const group = get().groups.find((g) => g.id === id);
      if (group) {
        set({ activeGroup: group });
      }
    },
    addGroceryItem: async (groceryItem) => {
      const { activeGroup, groups } = get();
      if (activeGroup) {
        const response = await actions.createGroceryItem({
          item: {
            ...groceryItem,
            group_id: activeGroup.id,
          },
        });

        if (response.success) {
          const newActiveGroup = {
            ...activeGroup,
            groceryItems: [...activeGroup.groceryItems, response.data],
          };
          const newGroups = groups.map((g) =>
            g.id === activeGroup.id ? newActiveGroup : g
          );
          set({ activeGroup: newActiveGroup, groups: newGroups });
          return true;
        }
      }
      return false;
    },
    toggleGroceryItem: async (id: string, checked: boolean) => {
      const { activeGroup, groups } = get();

      if (activeGroup) {
        const item = activeGroup.groceryItems.find((i) => i.id === id);
        if (item) {
          // Update active and other groups
          const newActiveGroup = {
            ...activeGroup,
            groceryItems: activeGroup.groceryItems.map((i) =>
              i.id === id ? { ...i, checked } : i
            ),
          };
          const newGroups = groups.map((g) =>
            g.id === activeGroup.id ? newActiveGroup : g
          );
          set({ activeGroup: newActiveGroup, groups: newGroups });
          
          const response = await actions.updateGroceryItem({
            item: {
              id,
              checked,
            },
          });
          if (response.success) {
            return true;
          }
        }
      }
      // TODO: Handle error and retry updating the item
      return false;
    },
  })
);

export default useGroupStore;
