"use client";

import { create } from "zustand";
import * as actions from "@/actions";

export interface FriendRequest {
  requestId: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export interface GroupRequest {
  requestId: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface NotificationState {
  friendRequests: FriendRequest[];
  groupRequests: GroupRequest[];
  notificationCount: number;
}

interface NotificationActions {
  fetchNotifications: () => void;
  answerFriendRequest: (requestId: string, answer: boolean) => void;
  answerGroupRequest: (requestId: string, answer: boolean) => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
    (set, get) => ({
        friendRequests: [],
        groupRequests: [],
        notificationCount: 0,
        fetchNotifications: async () => {
          const { data: friendRequests, error: friendRequestsError } = await actions.getFriendRequests();
          let count = 0;
          if (friendRequests) {
            set({ friendRequests: friendRequests.friendRequests });
            count += friendRequests.friendRequests.length;
          }
          const { data: groupRequests, error: groupRequestsError } = await actions.getGroupRequests();
          if (groupRequests) {
            set({ groupRequests: groupRequests.groupRequests });
            count += groupRequests.groupRequests.length;
          }
          if (groupRequestsError || friendRequestsError) {
            console.error(groupRequestsError, friendRequestsError);
          }
          set({ notificationCount: count });
        },
        
        answerFriendRequest: async (requestId: string, answer: boolean) => {
            console.log("answering friend request", requestId, answer);
        },
        answerGroupRequest: async (requestId: string, answer: boolean) => {
            console.log("answering group request", requestId, answer);
        },
    })
);

export default useNotificationStore;
