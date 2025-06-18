"use client";

import { create } from "zustand";
import * as actions from "@/actions";
import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";

export interface TimerProject {
  project: Tables<"timerProject">;
  sessions: Tables<"timerSession">[];
}

export interface ProjectTreeItem {
  id: string;
  name: string;
  children?: ProjectTreeItem[];
}

interface WorkStoreState {
  projectTree: ProjectTreeItem[];
  projects: TimerProject[];
  activeProject: TimerProject | null;
  timerSessions: Tables<"timerSession">[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface WorkStoreActions {
  fetchWorkData: () => Promise<void>;
  updateStore: (
    updatedProjects: TimerProject[],
    updatedSessions: Tables<"timerSession">[]
  ) => void;
  setActiveProject: (id: string) => void;
  addProject: (project: TablesInsert<"timerProject">) => Promise<boolean>;
  addTimerSession: (session: TablesInsert<"timerSession">) => Promise<boolean>;
  updateProject: (project: TablesUpdate<"timerProject">) => Promise<boolean>;
  updateTimerSession: (
    session: TablesUpdate<"timerSession">
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  deleteTimerSession: (id: string) => Promise<boolean>;
}

export const useWorkStore = create<WorkStoreState & WorkStoreActions>(
  (set, get) => ({
    projectTree: [],
    projects: [],
    activeProject: null,
    timerSessions: [],
    isFetching: true,
    lastFetch: null,

    async fetchWorkData() {
      const { updateStore } = get();
      const [projects, timerSessions, folders] = await Promise.all([
        actions.getAllProjects(),
        actions.getAllSessions(),
        actions.getAllProjectFolders(),
      ]);

      if (!projects.success || !timerSessions.success || !folders.success) {
        return;
      }

      const projectsData = projects.data.map((project) => ({
        project,
        sessions: timerSessions.data.filter(
          (session) => session.project_id === project.id
        ),
      }));

      if (projectsData.length !== 0) {
        set({ activeProject: projectsData[0] });
      }

      const folderMap = new Map();

      // 1. Füge alle Ordner als leere Knoten ein
      folders.data.forEach((folder) => {
        folderMap.set(folder.id, {
          id: folder.id,
          name: folder.title,
          children: [],
        });
      });

      // 2. Ordne die Ordner ihrer Eltern zu (für verschachtelte Struktur)
      folders.data.forEach((folder) => {
        if (folder.parent_folder && folderMap.has(folder.parent_folder)) {
          folderMap
            .get(folder.parent_folder)
            .children.push(folderMap.get(folder.id));
        }
      });

      // 3. Füge Projekte in ihre jeweiligen Ordner
      projects.data.forEach((project) => {
        const folderId = project.folder_id;
        if (folderId && folderMap.has(folderId)) {
          folderMap.get(folderId).children.push({
            id: project.id,
            name: project.title,
          });
        }
      });

      // 4. Gib nur die Root-Ordner (ohne parent_folder) zurück
      const root: ProjectTreeItem[] = [];

      projects.data.forEach((project) => {
        if (!project.folder_id) {
          root.push({
            id: project.id,
            name: project.title,
          });
        }
      });

      folders.data.forEach((folder) => {
        if (!folder.parent_folder) {
          root.push(folderMap.get(folder.id));
        }
      });

      set({ projectTree: root });

      updateStore(projectsData, timerSessions.data);
      set({ isFetching: false, lastFetch: new Date() });
    },

    updateStore(
      updatedProjects: TimerProject[],
      updatedSessions: Tables<"timerSession">[]
    ) {
      set({ projects: updatedProjects, timerSessions: updatedSessions });
      const activeProject = get().activeProject;
      if (activeProject) {
        const updatedActiveProject = updatedProjects.find(
          (p) => p.project.id === activeProject.project.id
        );
        if (updatedActiveProject) {
          set({ activeProject: updatedActiveProject });
        }
      } else {
        const firstProject = updatedProjects[0];
        if (firstProject) {
          set({ activeProject: firstProject });
        } else {
          set({ activeProject: null });
        }
      }
    },

    setActiveProject(id) {
      const project = get().projects.find((p) => p.project.id === id);
      if (project) {
        set({ activeProject: project });
      }
    },

    async updateProject(project) {
      const { updateStore, timerSessions } = get();
      const updatedProject = await actions.updateProject({ project });
      if (!updatedProject.success) {
        return false;
      }

      const updatedProjects = get().projects.map((p) =>
        p.project.id === project.id
          ? { project: updatedProject.data, sessions: p.sessions }
          : p
      );
      updateStore(updatedProjects, timerSessions);
      return true;
    },

    async deleteProject(id) {
      const { updateStore, timerSessions } = get();
      const deleted = await actions.deleteProject({ projectId: id });
      if (!deleted.success) {
        return false;
      }

      const updatedProjects = get().projects.filter((p) => p.project.id !== id);
      updateStore(updatedProjects, timerSessions);
      return true;
    },

    async addProject(project) {
      const { updateStore, timerSessions } = get();
      const newProject = await actions.createProject({ project });
      if (!newProject.success) {
        return false;
      }

      const updatedProjects = [
        ...get().projects,
        { project: newProject.data, sessions: [] },
      ];
      updateStore(updatedProjects, timerSessions);
      return true;
    },

    async addTimerSession(session) {
      const { updateStore, projects, timerSessions } = get();
      const newSession = await actions.createSession({ session });
      if (!newSession.success) {
        return false;
      }

      const updatedSessions = [...timerSessions, newSession.data];
      const updatedProjects = projects.map((p) =>
        p.project.id === session.project_id
          ? { project: p.project, sessions: [...p.sessions, newSession.data] }
          : p
      );
      updateStore(updatedProjects, updatedSessions);
      return true;
    },

    async deleteTimerSession(id) {
      const { updateStore, projects, timerSessions } = get();
      const deleted = await actions.deleteSession({ sessionId: id });
      if (!deleted.success) {
        return false;
      }

      const updatedSessions = timerSessions.filter((s) => s.id !== id);
      const updatedProjects = projects.map((p) => ({
        project: p.project,
        sessions: p.sessions.filter((s) => s.id !== id),
      }));
      updateStore(updatedProjects, updatedSessions);
      return true;
    },

    async updateTimerSession(session) {
      const { updateStore, projects, timerSessions } = get();
      const updatedSession = await actions.updateSession({ session });
      if (!updatedSession.success) {
        return false;
      }

      const updatedSessions = timerSessions.map((s) =>
        s.id === session.id ? updatedSession.data : s
      );
      const updatedProjects = projects.map((p) => ({
        project: p.project,
        sessions: p.sessions.map((s) =>
          s.id === session.id ? updatedSession.data : s
        ),
      }));
      updateStore(updatedProjects, updatedSessions);
      return true;
    },
  })
);
