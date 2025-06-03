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
  appointments: Tables<"group_appointment">[];
  groupTasks: Tables<"group_task">[];
  recurringGroupTasks: Tables<"recurring_group_task">[];
  admins: Tables<"profiles">[];
  members: Tables<"profiles">[];
  invitedMemebers: Tables<"profiles">[];
}

interface GroupState {
  groups: Group[];
  groupRequests: GroupRequest[];
  activeGroup: Group | null;
  isFetching: boolean;
  lastFetch: Date | null;
}

interface GroupActions {
  fetchGroupData: () => void;
  updateGroupData: (
    group: TablesUpdate<"group">,
    invitedMembers?: Tables<"profiles">[],
    groupAdmins?: Tables<"profiles">[],
    groupTasks?: Tables<"group_task">[],
    recurringGroupTasks?: Tables<"recurring_group_task">[],
    appointments?: Tables<"group_appointment">[],
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
  addAppointment: (
    appointment: TablesInsert<"group_appointment">
  ) => Promise<boolean>;
  updateAppointment: (
    appointment: TablesUpdate<"group_appointment">
  ) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  setActiveGroup: (id: string) => void;
  toggleGroceryItem: (id: string, checked: boolean) => Promise<boolean>;
  deleteGroceryItem: (id: string) => Promise<boolean>;
  answerGroupRequest: (requestId: string, answer: boolean) => void;
  addSingleGroupTask: (task: TablesInsert<"group_task">) => Promise<boolean>;
  addRecurringGroupTask: (
    task: TablesInsert<"recurring_group_task">
  ) => Promise<boolean>;
}

export const useGroupStore = create<GroupState & GroupActions>()(
  (set, get) => ({
    groups: [],
    groupRequests: [],
    activeGroup: null,
    isFetching: true,
    lastFetch: null,

    updateGroupData: (
      group: TablesUpdate<"group">,
      invitedMembers?: Tables<"profiles">[],
      groupAdmins?: Tables<"profiles">[],
      groupTasks?: Tables<"group_task">[],
      recurringGroupTasks?: Tables<"recurring_group_task">[],
      appointments?: Tables<"group_appointment">[],
      isNewGroup: boolean = false
    ) => {
      const { groups, activeGroup } = get();
      if (isNewGroup) {
        const newGroup: Group = {
          ...(group as Tables<"group">),
          groceryItems: [],
          appointments: [],
          groupTasks: [],
          recurringGroupTasks: [],
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
                groupTasks: [...g.groupTasks, ...(groupTasks || [])],
                recurringGroupTasks: [
                  ...(g.recurringGroupTasks || []),
                  ...(recurringGroupTasks || []),
                ],
                appointments: [...g.appointments, ...(appointments || [])],
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
            groupTasks: [...activeGroup.groupTasks, ...(groupTasks || [])],
            recurringGroupTasks: [
              ...(activeGroup.recurringGroupTasks || []),
              ...(recurringGroupTasks || []),
            ],
            appointments: [
              ...activeGroup.appointments,
              ...(appointments || []),
            ],
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
          isFetching: false,
          lastFetch: new Date(),
        });
        if (!activeGroup) {
          set({
            activeGroup: groupResponse.data[0] || null,
          });
        }
      } else {
        set({ isFetching: false });
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
          undefined,
          undefined,
          undefined,
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
    addSingleGroupTask: async (task) => {
      const { updateGroupData } = get();
      const response = await actions.createSingleGroupTask(task);
      if (response.success) {
        updateGroupData({ id: task.group_id }, undefined, undefined, [
          response.data,
        ]);
        return true;
      }
      return false;
    },
    addRecurringGroupTask: async (task) => {
      const response = await actions.createRecurringGroupTask(task);
      if (response.success) {
        const { updateGroupData } = get();
        updateGroupData(
          { id: task.group_id },
          undefined,
          undefined,
          undefined,
          [response.data]
        );
        return true;
      }
      return false;
    },
    addAppointment: async (appointment) => {
      const response = await actions.createGroupAppointment(appointment);
      if (response.success) {
        const { updateGroupData } = get();
        updateGroupData(
          { id: appointment.group_id },
          undefined,
          undefined,
          undefined,
          undefined,
          [response.data]
        );
        return true;
      }
      return false;
    },
    updateAppointment: async (appointment) => {
      // const response = await actions.updateGroupAppointment(appointment);
      const response = false;
      if (response) {
        return true;
      }
      return false;
    },
    deleteAppointment: async (id) => {
      // const response = await actions.deleteGroupAppointment(id);
      const response = false;
      if (response) {
        return true;
      }
      return false;
    },
  })
);

export default useGroupStore;
