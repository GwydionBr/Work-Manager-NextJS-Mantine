"use client";

import { create } from "zustand";

import * as actions from "@/actions";
import {
  createTree,
  deleteNode,
  renameNode,
  moveNode,
  addNode,
} from "@/utils/treeHelperFunctions";

import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";

export interface TimerProject {
  project: Tables<"timerProject">;
  sessions: Tables<"timerSession">[];
}

export interface ProjectTreeItem {
  id: string;
  name: string;
  index: number;
  type: "project" | "folder";
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
  addProjectFolder: (
    folder: TablesInsert<"timer_project_folder">
  ) => Promise<boolean>;
  updateProjectFolder: (
    folder: TablesUpdate<"timer_project_folder">
  ) => Promise<boolean>;
  deleteProjectFolder: (id: string) => Promise<boolean>;
  moveProject: (
    projectId: string,
    newFolderId: string | null,
    index: number
  ) => Promise<boolean>;
  moveFolder: (
    folderId: string,
    newParentFolderId: string | null,
    index: number
  ) => Promise<boolean>;
  createProjectTree: (
    projects: Tables<"timerProject">[],
    folders: Tables<"timer_project_folder">[]
  ) => void;
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
      const { updateStore, createProjectTree } = get();
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

      createProjectTree(projects.data, folders.data);
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

    async addProjectFolder(folder) {
      const newFolder = await actions.createProjectFolder({ category: folder });
      if (!newFolder.success) {
        return false;
      }

      const newProjectTree = addNode(get().projectTree, null, {
        id: newFolder.data.id,
        name: newFolder.data.title,
        type: "folder",
        index: 0,
      });
      set({ projectTree: newProjectTree });
      return true;
    },

    async updateProjectFolder(folder) {
      const updatedFolder = await actions.updateProjectFolder({
        category: folder,
      });
      if (!updatedFolder.success) {
        return false;
      }

      const newProjectTree = renameNode(
        get().projectTree,
        folder.id!,
        folder.title || "project"
      );
      set({ projectTree: newProjectTree });
      return true;
    },

    async deleteProjectFolder(id) {
      const deleted = await actions.deleteProjectFolder({ categoryId: id });
      if (!deleted.success) {
        return false;
      }

      const newProjectTree = deleteNode(get().projectTree, id);
      set({ projectTree: newProjectTree });
      return true;
    },

    async moveProject(projectId, newFolderId, index) {
      const project = get().projects.find((p) => p.project.id === projectId);
      if (!project) return false;

      const newProjectTree = moveNode(
        get().projectTree,
        projectId,
        newFolderId,
        index
      );
      set({ projectTree: newProjectTree });

      const updatedProject = await actions.updateProject({
        project: {
          id: projectId,
          folder_id: newFolderId,
        },
      });
      if (!updatedProject.success) {
        return false;
      }
      return true;
    },

    async moveFolder(folderId, newParentFolderId, index) {
      const newProjectTree = moveNode(
        get().projectTree,
        folderId,
        newParentFolderId,
        index
      );
      set({ projectTree: newProjectTree });

      const updatedFolder = await actions.updateProjectFolder({
        category: {
          id: folderId,
          parent_folder: newParentFolderId,
        },
      });
      if (!updatedFolder.success) {
        return false;
      }
      return true;
    },

    createProjectTree(projects, folders) {
      const tree = createTree(projects, folders);
      set({ projectTree: tree });
    },
  })
);
