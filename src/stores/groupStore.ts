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
  updateGroupData: (
    group: TablesUpdate<"group">,
    groupMember?: GroupMember[],
    isNewGroup?: boolean
  ) => void;
  addGroup: (
    group: TablesInsert<"group">,
    memberIds?: string[]
  ) => Promise<boolean>;
  updateGroup: (
    group: TablesUpdate<"group">,
    memberIds?: string[]
  ) => Promise<boolean>;
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

    updateGroupData: (
      group: TablesUpdate<"group">,
      groupMember?: GroupMember[],
      isNewGroup: boolean = false
    ) => {
      const { groups, activeGroup } = get();
      if (isNewGroup) {
        const newGroup: GroupContent = {
          ...(group as Tables<"group">),
          groceryItems: [],
          members: groupMember || [],
        };
        const newGroups: GroupContent[] = [...groups, newGroup];
        set({ groups: newGroups, activeGroup: newGroup });
      } else {
        const newGroups: GroupContent[] = groups.map((g) =>
          g.id === group.id
            ? {
                ...g,
                ...group,
                members: [...g.members, ...(groupMember || [])],
              }
            : g
        );
        set({ groups: newGroups });
        if (activeGroup && activeGroup.id === group.id) {
          const newActiveGroup: GroupContent = {
            ...activeGroup,
            ...group,
            members: [...activeGroup.members, ...(groupMember || [])],
          };
          set({ activeGroup: newActiveGroup });
        }
      }
    },

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
      const { updateGroupData } = get();
      const response = await actions.createGroup({ group, memberIds });

      if (response.success) {
        updateGroupData(response.data.group, response.data.groupMember, true);
        return true;
      }
      return true;
    },
    updateGroup: async (group, memberIds) => {
      const { updateGroupData } = get();
      const response = await actions.updateGroup({ group, memberIds });
      if (response.success) {
        updateGroupData(
          response.data.group,
          response.data.groupMember || undefined
        );
        return true;
      }
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
      const { groupRequests, updateGroupData } = get();
      if (answer) {
        const response = await actions.acceptGroupRequest({
          groupRequestId: requestId,
        });
        if (response.success) {
          const newGroupRequests = groupRequests.filter(
            (r) => r.requestId !== requestId
          );
          set({ groupRequests: newGroupRequests });
          updateGroupData({ id: response.data.groupId }, [
            response.data.groupMember,
          ]);
        }
      } else {
        const response = await actions.declineGroupRequest({
          groupRequestId: requestId,
        });
        if (response.success) {
          const newGroupRequests = groupRequests.filter(
            (r) => r.requestId !== requestId
          );
          set({ groupRequests: newGroupRequests });
        }
      }
    },
  })
);

export default useGroupStore;
