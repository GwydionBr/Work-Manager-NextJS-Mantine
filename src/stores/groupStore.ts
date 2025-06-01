"use client";

import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { create } from "zustand";

export interface GroupRequest {
  requestId: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Group extends Tables<"group"> {
  groceryItems: Tables<"grocery_item">[];
  admins: Tables<"profiles">[];
  members: Tables<"profiles">[];
  invitedMemebers: Tables<"profiles">[];
}

interface GroupState {
  groups: Group[];
  groupRequests: GroupRequest[];
  activeGroup: Group | null;
  isLoading: boolean;
}

interface GroupActions {
  fetchGroupData: () => void;
  updateGroupData: (
    group: TablesUpdate<"group">,
    invitedMembers?: Tables<"profiles">[],
    groupAdmins?: Tables<"profiles">[],
    isNewGroup?: boolean
  ) => void;
  addGroup: (
    group: TablesInsert<"group">,
    memberIds?: string[],
    admins?: string[]
  ) => Promise<boolean>;
  updateGroup: (
    group: TablesUpdate<"group">,
    memberIds?: string[]
  ) => Promise<boolean>;
  updateGroupMembers: (
    groupId: string,
    memberIds: string[]
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
      invitedMembers?: Tables<"profiles">[],
      groupAdmins?: Tables<"profiles">[],
      isNewGroup: boolean = false
    ) => {
      const { groups, activeGroup } = get();
      if (isNewGroup) {
        const newGroup: Group = {
          ...(group as Tables<"group">),
          groceryItems: [],
          admins: groupAdmins || [],
          members: [],
          invitedMemebers: invitedMembers || [],
        };
        const newGroups: Group[] = [...groups, newGroup];
        set({ groups: newGroups, activeGroup: newGroup });
      } else {
        const newGroups: Group[] = groups.map((g) =>
          g.id === group.id
            ? {
                ...g,
                ...group,
                invitedMemebers: [
                  ...g.invitedMemebers,
                  ...(invitedMembers || []),
                ],
                admins: [...g.admins, ...(groupAdmins || [])],
              }
            : g
        );
        set({ groups: newGroups });
        if (activeGroup && activeGroup.id === group.id) {
          const newActiveGroup: Group = {
            ...activeGroup,
            ...group,
            invitedMemebers: [
              ...activeGroup.invitedMemebers,
              ...(invitedMembers || []),
            ],
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
        updateGroupData(
          response.data.group,
          response.data.invitedMembers,
          [response.data.admin],
          true
        );
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
    updateGroupMembers: async (groupId, memberIds) => {
      const { updateGroupData } = get();
      const response = await actions.insertGroupMembers(groupId, memberIds);
      if (response.success) {
        updateGroupData({ id: groupId }, response.data);
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
      const { groupRequests, groups } = get();
      if (answer) {
        const response = await actions.acceptGroupRequest({
          groupRequestId: requestId,
        });
        if (response.success) {
          const groupResponse = await actions.getGroupById(
            response.data.groupId
          );
          if (groupResponse.success) {
            const newGroups = [...groups, groupResponse.data];
            set({ groups: newGroups, activeGroup: groupResponse.data });
          }
          const newGroupRequests = groupRequests.filter(
            (r) => r.requestId !== requestId
          );
          set({ groupRequests: newGroupRequests });
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
