"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate, Enums } from "@/types/db.types";
import { create } from "zustand";

export interface GroupMember {
  member: Tables<"profiles">;
  status: Enums<"status">;
}

export interface GroupRequest {
  requestId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface GroupContent extends Tables<"group"> {
  groceryItems: Tables<"grocery_item">[];
  members: GroupMember[];
}

interface GroupState {
  groups: GroupContent[];
  groupRequests: GroupRequest[];
  activeGroup: GroupContent | null;
  isLoading: boolean;
}

interface GroupActions {
  fetchGroupData: () => void;
  addGroup: (
    group: TablesInsert<"group">,
    memberIds?: string[]
  ) => Promise<boolean>;
  updateGroup: (group: TablesUpdate<"group">) => Promise<boolean>;
  addGroceryItem: (
    groceryItem: TablesInsert<"grocery_item">
  ) => Promise<boolean>;
  setActiveGroup: (id: string) => void;
  toggleGroceryItem: (id: string, checked: boolean) => Promise<boolean>;
  deleteGroceryItem: (id: string) => Promise<boolean>;
  answerGroupRequest: (requestId: string, answer: boolean) => void;
}

export const useGroupStore = create<GroupState & GroupActions>()(
  (set, get) => ({
    groups: [],
    groupRequests: [],
    activeGroup: null,
    isLoading: true,

    fetchGroupData: async () => {
      const activeGroup = get().activeGroup;
      const groupResponse = await actions.getAllGroups();

      if (groupResponse.success) {
        set({
          groups: groupResponse.data,
          isLoading: false,
        });
        if (!activeGroup) {
          set({
            activeGroup: groupResponse.data[0] || null,
          });
        }
      } else {
        set({ isLoading: false });
      }
      const { data: groupRequests, error: groupRequestsError } =
        await actions.getGroupRequests();
      if (groupRequests) {
        set({ groupRequests: groupRequests.groupRequests });
      }
      if (groupRequestsError) {
        console.error(groupRequestsError);
      }
    },
    addGroup: async (group, memberIds) => {
      const response = await actions.createGroup({ group, memberIds });

      console.log(response);

      if (response.success) {
        const newGroupContent: GroupContent = {
          ...response.data,
          groceryItems: [],
          members: [],
        };
        set((state) => ({ groups: [...state.groups, newGroupContent] }));
        return true;
      }
      return true;
    },
    updateGroup: async (group: TablesUpdate<"group">) => {
      const response = await actions.updateGroup({ group });
      return response.success;
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
    deleteGroceryItem: async (id: string) => {
      const { activeGroup, groups } = get();
      const response = await actions.deleteGroceryItem({ itemId: id });

      if (response.success) {
        if (activeGroup) {
          const newActiveGroup = {
            ...activeGroup,
            groceryItems: activeGroup.groceryItems.filter((i) => i.id !== id),
          };
          const newGroups = groups.map((g) =>
            g.id === activeGroup.id ? newActiveGroup : g
          );
          set({ activeGroup: newActiveGroup, groups: newGroups });
        }
        return true;
      }
      return false;
    },
    answerGroupRequest: async (requestId: string, answer: boolean) => {
      console.log("answering group request", requestId, answer);
    },
  })
);

export default useGroupStore;
