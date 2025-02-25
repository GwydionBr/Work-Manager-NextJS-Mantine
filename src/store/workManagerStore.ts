'use client';

import { create } from 'zustand';
import * as actions from '@/actions';
import { Tables, TablesInsert, TablesUpdate } from '@/types/db.types';

interface WorkStore {
  projects: Tables<'timerProject'>[];
  activeProject: Tables<'timerProject'> | null;
  timerSessions: Tables<'timerSession'>[];
  fetchProjects: () => Promise<void>;
  fetchSessions: () => Promise<void>;
  createProject: (data: TablesInsert<'timerProject'>) => Promise<void>;
  createSession: (data: TablesInsert<'timerSession'>) => Promise<void>;
  updateProject: (data: TablesUpdate<'timerProject'>) => Promise<void>;
  updateSession: (data: TablesUpdate<'timerSession'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}

export const useWorkStore = create<WorkStore>((set, get) => ({
  projects: [],
  activeProject: null,
  timerSessions: [],

  async fetchProjects() {
    await actions.getAllProjects().then(({ data, success }) => {
      if (!success) {
        return;
      }
      set({ projects: data });
    });
  },
  async fetchSessions() {
    await actions.getAllSessions().then(({ data, success }) => {
      if (!success) {
        return;
      }
      set({ timerSessions: data });
    });
  },

  async createSession(data) {
    await actions.createSession({ session: data }).then(({ success }) => {
      if (!success) {
        return;
      }
      get().fetchSessions();
    });
  },

  async createProject(data) {
    await actions.createProject({ project: data }).then(({ success }) => {
      if (!success) {
        return;
      }
      get().fetchProjects();
    });
  },
  async updateProject(data) {
    await actions.updateProject({ updateProject: data }).then(({ success }) => {
      if (!success) {
        return;
      }
      get().fetchProjects();
    });
  },

  async updateSession(data) {
    await actions.updateSession({ updateSession: data }).then(({ success }) => {
      if (!success) {
        return;
      }
      get().fetchSessions();
    });
  },

  async deleteProject(id: string) {
    await actions.deleteProject({ projectId: id }).then(({ success }) => {
      if (!success) {
        return;
      }
      get().fetchProjects();
    });
  },

  async deleteSession(id: string) {
    await actions.deleteSession({ sessionId: id }).then(({ success }) => {
      if (!success) {
        return;
      }
      get().fetchSessions();
    });
  },
}));
