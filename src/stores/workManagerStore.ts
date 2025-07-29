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
import { TimerProject, ProjectTreeItem } from "@/types/work.types";

interface WorkStoreState {
  projectTree: ProjectTreeItem[];
  projects: TimerProject[];
  folders: Tables<"timer_project_folder">[];
  activeProjectId: string | null;
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
  setActiveProjectId: (id: string) => void;
  addProject: (project: TablesInsert<"timerProject">) => Promise<boolean>;
  addTimerSession: (session: TablesInsert<"timerSession">) => Promise<boolean>;
  updateProject: (project: TablesUpdate<"timerProject">) => Promise<boolean>;
  updateTimerSession: (
    session: TablesUpdate<"timerSession">
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  deleteTimerSession: (id: string) => Promise<boolean>;
  payoutSessions: (sessionIds: string[]) => Promise<boolean>;
  payoutProjectSalary: (projectId: string, amount: number) => Promise<boolean>;
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
  handleChangedNodes: (changedNodes: ProjectTreeItem[]) => void;
}

export const useWorkStore = create<WorkStoreState & WorkStoreActions>(
  (set, get) => ({
    projectTree: [],
    projects: [],
    folders: [],
    activeProjectId: null,
    timerSessions: [],
    isFetching: true,
    lastFetch: null,

    async fetchWorkData() {
      const {
        updateStore,
        createProjectTree,
        activeProjectId: activeProject,
      } = get();
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

      if (projectsData.length !== 0 && !activeProject) {
        set({ activeProjectId: projectsData[0].project.id });
      }

      createProjectTree(projects.data, folders.data);
      updateStore(projectsData, timerSessions.data);
      set({
        folders: folders.data,
        isFetching: false,
        lastFetch: new Date(),
      });
    },

    setActiveProjectId(id: string) {
      set({ activeProjectId: id });
    },

    updateStore(
      updatedProjects: TimerProject[],
      updatedSessions: Tables<"timerSession">[]
    ) {
      set({ projects: updatedProjects, timerSessions: updatedSessions });
      const { activeProjectId } = get();
      if (!activeProjectId) {
        const firstProject = updatedProjects[0];
        if (firstProject) {
          set({ activeProjectId: firstProject.project.id });
        } else {
          set({ activeProjectId: null });
        }
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
      if (project.id && project.title) {
        const newProjectTree = renameNode(
          get().projectTree,
          project.id,
          updatedProject.data.title
        );
        set({ projectTree: newProjectTree });
      }
      return true;
    },

    async deleteProject(id) {
      const {
        updateStore,
        timerSessions,
        activeProjectId,
        projectTree,
        handleChangedNodes,
      } = get();
      const deleted = await actions.deleteProject({ projectId: id });
      if (!deleted.success) {
        return false;
      }

      // const nextProjectId = findNextProject(projectTree, id);
      const updatedProjects = get().projects.filter((p) => p.project.id !== id);
      updateStore(updatedProjects, timerSessions);
      const { tree, changedNodes } = deleteNode(projectTree, id);
      if (activeProjectId === id) {
        const newActiveProject = updatedProjects[0];
        if (newActiveProject) {
          set({ activeProjectId: newActiveProject.project.id });
        } else {
          set({ activeProjectId: null });
        }
      }
      set({ projectTree: tree });
      handleChangedNodes(changedNodes);
      return true;
    },

    async addProject(project) {
      const { updateStore, timerSessions, handleChangedNodes } = get();

      const newProject = await actions.createProject({ project });
      if (!newProject.success) {
        return false;
      }

      const updatedProjects = [
        ...get().projects,
        { project: newProject.data, sessions: [] },
      ];
      updateStore(updatedProjects, timerSessions);
      const { tree, changedNodes } = addNode(get().projectTree, null, {
        id: newProject.data.id,
        name: newProject.data.title,
        type: "project",
        index: 0,
      });
      set({
        projectTree: tree,
        activeProjectId: newProject.data.id,
      });
      handleChangedNodes(changedNodes);
      return true;
    },

    async addTimerSession(session) {
      const { updateStore, projects, timerSessions } = get();

      const newSession = await actions.createSession({ session });
      if (!newSession.success) {
        console.log("newSession", newSession);
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

    async payoutSessions(sessionIds) {
      const { updateStore, projects, timerSessions } = get();
      const payoutResult = await actions.payoutSessions({ sessionIds });
      if (!payoutResult.success) {
        return false;
      }

      // Update sessions to mark them as paid
      const updatedSessions = timerSessions.map((s) =>
        sessionIds.includes(s.id) ? { ...s, payed: true } : s
      );
      const updatedProjects = projects.map((p) => ({
        project: p.project,
        sessions: p.sessions.map((s) =>
          sessionIds.includes(s.id) ? { ...s, payed: true } : s
        ),
      }));
      updateStore(updatedProjects, updatedSessions);
      return true;
    },

    async payoutProjectSalary(projectId, amount) {
      const { updateStore, projects, timerSessions } = get();
      const payoutResult = await actions.payoutProjectSalary({
        projectId,
        amount,
      });
      if (!payoutResult.success) {
        return false;
      }

      // Update project total_payout in the store
      const updatedProjects = projects.map((p) => {
        if (p.project.id === projectId) {
          const newTotalPayout = (p.project.total_payout || 0) + amount;
          return {
            project: { ...p.project, total_payout: newTotalPayout },
            sessions: p.sessions.map((s) => ({ ...s, payed: true })),
          };
        }
        return p;
      });

      // Update all sessions for this project to mark them as paid
      const updatedSessions = timerSessions.map((s) =>
        s.project_id === projectId ? { ...s, payed: true } : s
      );

      updateStore(updatedProjects, updatedSessions);
      return true;
    },

    async addProjectFolder(folder) {
      const { handleChangedNodes } = get();
      const newFolder = await actions.createProjectFolder({ folder: folder });
      if (!newFolder.success) {
        return false;
      }

      const { tree, changedNodes } = addNode(get().projectTree, null, {
        id: newFolder.data.id,
        name: newFolder.data.title,
        type: "folder",
        index: 0,
      });
      set({
        projectTree: tree,
        folders: [...get().folders, newFolder.data],
      });
      handleChangedNodes(changedNodes);
      return true;
    },

    async updateProjectFolder(folder) {
      const updatedFolder = await actions.updateProjectFolder({
        folder: folder,
      });
      if (!updatedFolder.success) {
        return false;
      }

      const newProjectTree = renameNode(
        get().projectTree,
        folder.id!,
        folder.title || "project"
      );
      const updatedFolders = get().folders.map((f) =>
        f.id === folder.id ? updatedFolder.data : f
      );
      set({
        projectTree: newProjectTree,
        folders: updatedFolders,
      });
      return true;
    },

    async deleteProjectFolder(id) {
      const { handleChangedNodes } = get();
      const deleted = await actions.deleteProjectFolder({ folderId: id });
      if (!deleted.success) {
        return false;
      }

      const { tree, changedNodes } = deleteNode(get().projectTree, id);
      const updatedFolders = get().folders.filter((f) => f.id !== id);
      set({
        projectTree: tree,
        folders: updatedFolders,
      });
      handleChangedNodes(changedNodes);
      return true;
    },

    async moveProject(projectId, newFolderId, index) {
      const { handleChangedNodes } = get();
      const project = get().projects.find((p) => p.project.id === projectId);
      if (!project) return false;

      const { tree, changedNodes } = moveNode(
        get().projectTree,
        projectId,
        newFolderId,
        index
      );
      set({ projectTree: tree });
      handleChangedNodes(changedNodes);

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
      const { handleChangedNodes } = get();
      const { tree, changedNodes } = moveNode(
        get().projectTree,
        folderId,
        newParentFolderId,
        index
      );
      set({ projectTree: tree });
      handleChangedNodes(changedNodes);

      const updatedFolder = await actions.updateProjectFolder({
        folder: {
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
      const { handleChangedNodes } = get();
      const { tree, changedNodes } = createTree(projects, folders);
      set({ projectTree: tree });
      handleChangedNodes(changedNodes);
    },

    handleChangedNodes(changedNodes) {
      const updatedFolders: TablesUpdate<"timer_project_folder">[] =
        changedNodes
          .filter((node) => node.type === "folder")
          .map((node) => ({
            id: node.id,
            order_index: node.index,
          }));
      const updatedProjects: TablesUpdate<"timerProject">[] = changedNodes
        .filter((node) => node.type === "project")
        .map((node) => ({
          id: node.id,
          order_index: node.index,
        }));
      for (const folder of updatedFolders) {
        actions.updateProjectFolder({ folder });
      }
      for (const project of updatedProjects) {
        actions.updateProject({ project });
      }
    },
  })
);
