"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import * as actions from "@/actions";
import {
  createTree,
  deleteNode,
  renameNode,
  moveNode,
  addNode,
} from "@/utils/treeHelperFunctions";
import { getTimeFragmentSession, resolveSessionOverlaps } from "@/utils/helper";

import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
import { TimerProject, ProjectTreeItem } from "@/types/work.types";
import { Currency } from "@/types/settings.types";
import { ErrorResponse, SuccessPayoutResponse } from "@/types/action.types";

interface WorkStoreState {
  projectTree: ProjectTreeItem[];
  projects: TimerProject[];
  folders: Tables<"timer_project_folder">[];
  activeProjectId: string | null;
  lastActiveProjectId: string | null;
  timerSessions: Tables<"timer_session">[];
  isFetching: boolean;
  lastFetch: Date | null;
}

interface WorkStoreActions {
  resetStore: () => void;
  fetchWorkData: () => Promise<void>;
  updateStore: (
    updatedProjects: TimerProject[],
    updatedSessions: Tables<"timer_session">[]
  ) => void;
  setActiveProjectId: (id: string | null) => void;
  addProject: (
    project: TablesInsert<"timer_project">
  ) => Promise<{ createdProject: Tables<"timer_project"> | null }>;
  addTimerSession: (
    session: TablesInsert<"timer_session">,
    roundInTimeFragments: boolean,
    timeFragmentInterval: number
  ) => Promise<{
    createdSessions: Tables<"timer_session">[] | null;
    completeOverlap: boolean;
    overlappingSessions: Tables<"timer_session">[] | null;
  }>;
  updateProject: (project: TablesUpdate<"timer_project">) => Promise<boolean>;
  updateTimerSession: (
    session: TablesUpdate<"timer_session">
  ) => Promise<boolean>;
  updateMultipleTimerSessions: (
    sessionIds: string[],
    update: TablesUpdate<"timer_session">
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  deleteTimerSessions: (ids: string[]) => Promise<boolean>;
  payoutSessions: (
    sessionIds: string[],
    startValue: number,
    title: string,
    startCurrency: Currency,
    categoryId: string | null,
    endValue: number | null,
    endCurrency: Currency | null
  ) => Promise<SuccessPayoutResponse | ErrorResponse>;
  payoutProjectSalary: (
    projectId: string,
    startValue: number,
    startCurrency: Currency,
    categoryId: string | null,
    endValue: number | null,
    endCurrency: Currency | null
  ) => Promise<SuccessPayoutResponse | ErrorResponse>;
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
    projects: Tables<"timer_project">[],
    folders: Tables<"timer_project_folder">[]
  ) => void;
  handleChangedNodes: (changedNodes: ProjectTreeItem[]) => void;
}

export const useWorkStore = create<WorkStoreState & WorkStoreActions>()(
  persist(
    (set, get) => ({
      projectTree: [],
      projects: [],
      folders: [],
      activeProjectId: null,
      lastActiveProjectId: null,
      timerSessions: [],
      isFetching: true,
      lastFetch: null,

      resetStore: () =>
        set({
          projectTree: [],
          projects: [],
          folders: [],
          activeProjectId: null,
          lastActiveProjectId: null,
          timerSessions: [],
          isFetching: true,
          lastFetch: null,
        }),

      async fetchWorkData() {
        const {
          createProjectTree,
          activeProjectId: storedActiveId,
          lastActiveProjectId: storedLastActiveId,
          setActiveProjectId,
        } = get();
        const [projects, timerSessions, folders] = await Promise.all([
          actions.getAllProjects(),
          actions.getAllSessions(),
          actions.getAllProjectFolders(),
        ]);

        if (!projects.success || !timerSessions.success || !folders.success) {
          return;
        }

        const projectsData = projects.data
          .map((project) => ({
            project,
            sessions: timerSessions.data.filter(
              (session) => session.project_id === project.id
            ),
          }))
          .sort(
            (a, b) =>
              new Date(b.project.created_at).getTime() -
              new Date(a.project.created_at).getTime()
          );

        const stillValidId =
          storedActiveId &&
          projectsData.find((p) => p.project.id === storedActiveId)
            ? storedActiveId
            : storedLastActiveId &&
                projectsData.find((p) => p.project.id === storedLastActiveId)
              ? storedLastActiveId
              : (projectsData[0]?.project.id ?? null);

        set({
          folders: folders.data,
          projects: projectsData,
          timerSessions: timerSessions.data,
        });
        setActiveProjectId(stillValidId);
        createProjectTree(projects.data, folders.data);
        set({ isFetching: false, lastFetch: new Date() });
      },

      setActiveProjectId(id) {
        set({ activeProjectId: id });
        if (id) {
          set({ lastActiveProjectId: id });
        }
      },

      updateStore(
        updatedProjects: TimerProject[],
        updatedSessions: Tables<"timer_session">[]
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
        const { updateStore, timerSessions, projectTree } = get();
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
            projectTree,
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
        const updatedProjects = get().projects.filter(
          (p) => p.project.id !== id
        );
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
        const { updateStore, timerSessions, handleChangedNodes, projectTree } =
          get();

        const newProject = await actions.createProject({ project });
        if (!newProject.success) {
          return { createdProject: null };
        }

        const updatedProjects = [
          ...get().projects,
          { project: newProject.data, sessions: [] },
        ];
        updateStore(updatedProjects, timerSessions);
        const { tree, changedNodes } = addNode(
          projectTree,
          null,
          {
            id: newProject.data.id,
            name: newProject.data.title,
            type: "project",
            index: 0,
          },
          0
        );
        set({
          projectTree: tree,
          activeProjectId: newProject.data.id,
        });
        handleChangedNodes(changedNodes);
        return { createdProject: newProject.data };
      },

      async addTimerSession(
        session,
        roundInTimeFragments,
        timeFragmentInterval
      ) {
        const { updateStore, projects, timerSessions } = get();

        // Find project
        const project = projects.find(
          (p) => p.project.id === session.project_id
        );

        // Check if project was found
        if (!project) {
          return {
            createdSessions: null,
            completeOverlap: false,
            overlappingSessions: null,
          };
        }

        let newSession: TablesInsert<"timer_session"> = { ...session };

        if (roundInTimeFragments) {
          newSession = getTimeFragmentSession(timeFragmentInterval, newSession);
        }

        // Filter out existing sessions that overlap with the new session
        const { adjustedTimeSpans, overlappingSessions } =
          resolveSessionOverlaps(project.sessions, newSession);

        if (!adjustedTimeSpans) {
          return {
            createdSessions: null,
            completeOverlap: true,
            overlappingSessions: null,
          };
        }

        // Create new session
        const newSessions = await actions.createSessions({
          sessions: adjustedTimeSpans,
        });

        // Check if new sessions were created
        if (!newSessions.success) {
          return {
            createdSessions: null,
            completeOverlap: false,
            overlappingSessions: null,
          };
        }

        // Update sessions and projects
        const updatedSessions = [...timerSessions, ...newSessions.data];
        const updatedProjects = projects.map((p) =>
          p.project.id === session.project_id
            ? {
                project: p.project,
                sessions: [...p.sessions, ...newSessions.data],
              }
            : p
        );
        updateStore(updatedProjects, updatedSessions);
        return {
          createdSessions: newSessions.data,
          completeOverlap: false,
          overlappingSessions:
            overlappingSessions.length > 0 ? overlappingSessions : null,
        };
      },

      async deleteTimerSessions(ids) {
        const { updateStore, projects, timerSessions } = get();
        const deleted = await actions.deleteSessions({ sessionIds: ids });
        if (!deleted.success) {
          return false;
        }

        const updatedSessions = timerSessions.filter(
          (s) => !ids.includes(s.id)
        );
        const updatedProjects = projects.map((p) => ({
          project: p.project,
          sessions: p.sessions.filter((s) => !ids.includes(s.id)),
        }));
        updateStore(updatedProjects, updatedSessions);
        return true;
      },

      async updateTimerSession(session) {
        const { updateStore, projects, timerSessions } = get();
        const project = projects.find(
          (p) => p.project.id === session.project_id
        );
        if (!project) {
          return false;
        }

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

      async updateMultipleTimerSessions(sessionIds, update) {
        const { updateStore, projects, timerSessions } = get();

        const updatedSessionsResponse = await actions.updateMultipleSessions({
          sessionIds,
          update,
        });
        if (!updatedSessionsResponse.success) {
          return false;
        }

        const updatedSessions = timerSessions.map((s) =>
          sessionIds.includes(s.id) ? { ...s, ...update } : s
        );
        const updatedProjects = projects.map((p) => ({
          project: p.project,
          sessions: p.sessions.map((s) =>
            sessionIds.includes(s.id) ? { ...s, ...update } : s
          ),
        }));
        updateStore(updatedProjects, updatedSessions);
        return true;
      },

      async payoutSessions(
        sessionIds,
        startValue,
        title,
        startCurrency,
        categoryId,
        endValue,
        endCurrency
      ) {
        const { updateStore, projects, timerSessions } = get();
        const payoutResult = await actions.payoutSessions({
          date: new Date(),
          sessionIds,
          startValue,
          title,
          startCurrency,
          categoryId,
          endValue,
          endCurrency,
        });
        if (!payoutResult.success) {
          return payoutResult;
        }

        // Update sessions to mark them as paid
        const updatedSessions = timerSessions.map((s) =>
          sessionIds.includes(s.id)
            ? { ...s, payed: true, payout_id: payoutResult.data.payout.id }
            : s
        );
        const updatedProjects = projects.map((p) => ({
          project: p.project,
          sessions: p.sessions.map((s) =>
            sessionIds.includes(s.id) ? { ...s, payed: true } : s
          ),
        }));
        updateStore(updatedProjects, updatedSessions);
        return payoutResult;
      },

      async payoutProjectSalary(
        projectId,
        startValue,
        startCurrency,
        categoryId,
        endValue,
        endCurrency
      ) {
        const payoutResult = await actions.createPayout({
          projectId,
          date: new Date(),
          startValue,
          startCurrency,
          categoryId,
          endValue,
          endCurrency,
        });

        return payoutResult;
      },

      async addProjectFolder(folder) {
        const { handleChangedNodes, projectTree } = get();
        const newFolder = await actions.createProjectFolder({ folder: folder });
        if (!newFolder.success) {
          return false;
        }

        const { tree, changedNodes } = addNode(
          projectTree,
          null,
          {
            id: newFolder.data.id,
            name: newFolder.data.title,
            type: "folder",
            index: 0,
            children: [],
          },
          0
        );
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
        const updatedProjects: TablesUpdate<"timer_project">[] = changedNodes
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
    }),
    {
      name: "work-store",
      partialize: (state) => ({
        activeProjectId: state.activeProjectId,
        lastActiveProjectId: state.lastActiveProjectId,
      }),
    }
  )
);
