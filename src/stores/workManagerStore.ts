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
import { ProjectTreeItem, StoreTimerProject } from "@/types/work.types";
import { Currency } from "@/types/settings.types";
import { ErrorResponse, SuccessPayoutResponse } from "@/types/action.types";
import { TimerRoundingSettings } from "@/types/timeTracker.types";

interface WorkStoreState {
  projectTree: ProjectTreeItem[];
  projects: StoreTimerProject[];
  folders: Tables<"timer_project_folder">[];
  activeProjectId: string | null;
  lastActiveProjectId: string | null;
  timerSessions: Tables<"timer_session">[];
  isFetching: boolean;
  lastFetch: Date | null;
  initialized: boolean | null;
  abortController: AbortController | null;
}

interface WorkStoreActions {
  resetStore: () => void;
  fetchWorkData: () => Promise<void>;
  fetchIfStale: (intervalMs?: number) => Promise<void>;
  abortFetch: () => void;
  updateStore: (
    updatedProjects: StoreTimerProject[],
    updatedSessions: Tables<"timer_session">[]
  ) => void;
  setActiveProjectId: (id: string | null) => void;
  addProject: (
    project: TablesInsert<"timer_project">,
    setActiveProjectId: boolean,
    categoryIds: string[]
  ) => Promise<StoreTimerProject | null>;
  addTimerSession: (
    session: TablesInsert<"timer_session">,
    roundingSettings: TimerRoundingSettings
  ) => Promise<{
    createdSessions: Tables<"timer_session">[] | null;
    completeOverlap: boolean;
    overlappingSessions: Tables<"timer_session">[] | null;
  }>;
  updateProject: (
    updatedProject: StoreTimerProject
  ) => Promise<StoreTimerProject | null>;
  updateTimerSession: (
    oldSession: Tables<"timer_session">,
    newSession: Tables<"timer_session">,
    roundingSettings: TimerRoundingSettings
  ) => Promise<{
    success: boolean;
    overlapDetected: boolean;
  }>;
  updateMultipleTimerSessions: (
    sessionIds: string[],
    update: TablesUpdate<"timer_session">
  ) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  deleteTimerSessions: (ids: string[]) => Promise<boolean>;
  payoutWorkSessions: (sessionIds: string[], payoutId: string) => boolean;
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
      isFetching: false,
      lastFetch: null,
      initialized: null,
      abortController: null,

      resetStore: () =>
        set({
          projectTree: [],
          projects: [],
          folders: [],
          activeProjectId: null,
          lastActiveProjectId: null,
          timerSessions: [],
          isFetching: false,
          lastFetch: null,
          initialized: null,
          abortController: null,
        }),

      async fetchIfStale(intervalMs = 5 * 60 * 1000) {
        const { lastFetch, isFetching, abortController } = get();
        const now = Date.now();
        const last = lastFetch ? new Date(lastFetch).getTime() : 0;
        const stale = !lastFetch || now - last > intervalMs;
        if (!stale || isFetching) return;

        // Abort any existing fetch
        if (abortController) {
          abortController.abort();
        }

        await get().fetchWorkData();
      },

      async fetchWorkData() {
        const {
          createProjectTree,
          activeProjectId: storedActiveId,
          lastActiveProjectId: storedLastActiveId,
          setActiveProjectId,
        } = get();
        // Create new AbortController for this fetch
        const abortController = new AbortController();
        set({ isFetching: true, abortController });

        try {
          console.log("start fetching work", new Date().toISOString());
          const [projects, timerSessions, folders] = await Promise.all([
            actions.getAllTimerProjects(),
            actions.getAllSessions(),
            actions.getAllProjectFolders(),
          ]);

          console.log("work fetched", new Date().toISOString());

          // Check if fetch was aborted
          if (abortController.signal.aborted) {
            return;
          }

          if (!projects.success || !timerSessions.success || !folders.success) {
            console.log("work fetch failed", new Date().toISOString());
            set({
              isFetching: false,
              initialized: false,
              abortController: null,
            });
            return;
          }

          const stillValidId =
            storedActiveId && projects.data.find((p) => p.id === storedActiveId)
              ? storedActiveId
              : storedLastActiveId &&
                  projects.data.find((p) => p.id === storedLastActiveId)
                ? storedLastActiveId
                : (projects.data[0]?.id ?? null);

          set({
            folders: folders.data,
            projects: projects.data,
            timerSessions: timerSessions.data,
          });
          setActiveProjectId(stillValidId);
          createProjectTree(projects.data, folders.data);
          console.log("work fetched and set", new Date().toISOString());
          set({
            isFetching: false,
            lastFetch: new Date(),
            initialized: true,
            abortController: null,
          });
        } catch (error) {
          console.log("work fetch error", error, new Date().toISOString());
          // If fetch was aborted, don't update state
          if (abortController.signal.aborted) {
            return;
          }

          // For other errors, reset fetching state
          set({ isFetching: false, initialized: false, abortController: null });
        }
      },

      abortFetch() {
        const { abortController } = get();
        if (abortController) {
          console.log("aborting work fetch", new Date().toISOString());
          abortController.abort();
          set({ isFetching: false, abortController: null });
        }
      },

      setActiveProjectId(id) {
        set({ activeProjectId: id });
        if (id) {
          set({ lastActiveProjectId: id });
        }
      },

      updateStore(
        updatedProjects: StoreTimerProject[],
        updatedSessions: Tables<"timer_session">[]
      ) {
        set({ projects: updatedProjects, timerSessions: updatedSessions });
        const { activeProjectId } = get();
        if (!activeProjectId) {
          const firstProject = updatedProjects[0];
          if (firstProject) {
            set({ activeProjectId: firstProject.id });
          } else {
            set({ activeProjectId: null });
          }
        }
      },

      async updateProject(updatedProject) {
        const { updateStore, timerSessions, projectTree } = get();

        const oldProject = get().projects.find(
          (p) => p.id === updatedProject.id
        );
        if (!oldProject) return null;

        const updateCategories = {
          deleteIds: oldProject.categoryIds.filter(
            (id) => !updatedProject.categoryIds.includes(id)
          ),
          addIds: updatedProject.categoryIds.filter(
            (id) => !oldProject.categoryIds.includes(id)
          ),
        };

        const { categoryIds, ...projectData } = updatedProject;

        const updatedProjectResponse = await actions.updateTimerProject({
          project: projectData,
          categoryUpdates: updateCategories,
          categoryIds: categoryIds,
        });

        if (!updatedProjectResponse.success) {
          return null;
        }

        const updatedProjects = get().projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        );

        const updatedTitle = updatedProject.title !== oldProject.title;

        updateStore(updatedProjects, timerSessions);
        if (updatedTitle) {
          const newProjectTree = renameNode(
            projectTree,
            updatedProject.id,
            updatedProject.title
          );
          set({ projectTree: newProjectTree });
        }
        return updatedProject;
      },

      async deleteProject(id) {
        const {
          updateStore,
          timerSessions,
          activeProjectId,
          projectTree,
          handleChangedNodes,
        } = get();
        const deleted = await actions.deleteTimerProjects({ projectIds: [id] });
        if (!deleted.success) {
          return false;
        }

        // const nextProjectId = findNextProject(projectTree, id);
        const updatedProjects = get().projects.filter((p) => p.id !== id);
        updateStore(updatedProjects, timerSessions);
        const { tree, changedNodes } = deleteNode(projectTree, id);
        if (activeProjectId === id) {
          const newActiveProject = updatedProjects[0];
          if (newActiveProject) {
            set({ activeProjectId: newActiveProject.id });
          } else {
            set({ activeProjectId: null });
          }
        }
        set({ projectTree: tree });
        handleChangedNodes(changedNodes);
        return true;
      },

      async addProject(project, setActiveProjectId, categoryIds) {
        const {
          updateStore,
          timerSessions,
          handleChangedNodes,
          projectTree,
          projects,
        } = get();

        const newProject = await actions.createTimerProject({
          project,
          categoryIds,
        });
        if (!newProject.success) {
          return null;
        }

        const updatedProjects = [...projects, newProject.data];

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
        });
        if (setActiveProjectId) {
          set({ activeProjectId: newProject.data.id });
        }
        handleChangedNodes(changedNodes);
        return newProject.data;
      },

      async addTimerSession(session, roundingSettings) {
        const { updateStore, projects, timerSessions } = get();

        // Find project
        const project = projects.find((p) => p.id === session.project_id);

        // Check if project was found
        if (!project) {
          return {
            createdSessions: null,
            completeOverlap: false,
            overlappingSessions: null,
          };
        }

        let newSession: TablesInsert<"timer_session"> = { ...session };

        if (roundingSettings.roundInTimeFragments) {
          newSession = getTimeFragmentSession(
            roundingSettings.timeFragmentInterval,
            newSession
          );
        }

        // Filter out existing sessions that overlap with the new session
        const existingSessions = timerSessions.filter(
          (s) => s.project_id === session.project_id
        );

        const { adjustedTimeSpans, overlappingSessions } =
          resolveSessionOverlaps(existingSessions, newSession);

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

        updateStore(projects, updatedSessions);
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

        updateStore(projects, updatedSessions);
        return true;
      },

      async updateTimerSession(oldSession, newSession, roundingSettings) {
        const { updateStore, projects, timerSessions } = get();
        const project = projects.find((p) => p.id === newSession.project_id);
        if (!project) {
          return {
            success: false,
            overlapDetected: false,
          };
        }

        let sessionToUpdate: Tables<"timer_session"> = { ...newSession };

        if (
          oldSession.start_time !== newSession.start_time ||
          oldSession.end_time !== newSession.end_time
        ) {
          let updatedSession: TablesInsert<"timer_session"> = { ...newSession };
          if (roundingSettings.roundInTimeFragments) {
            updatedSession = getTimeFragmentSession(
              roundingSettings.timeFragmentInterval,
              newSession
            );
          }

          const existingSessions = timerSessions.filter(
            (s) => s.project_id === newSession.project_id
          );

          const { adjustedTimeSpans, overlappingSessions } =
            resolveSessionOverlaps(
              existingSessions.filter((s) => s.id !== newSession.id),
              updatedSession
            );
          if (!adjustedTimeSpans || overlappingSessions.length > 0) {
            return {
              success: false,
              overlapDetected: true,
            };
          }
          sessionToUpdate = adjustedTimeSpans[0] as Tables<"timer_session">;
        }

        const updatedSession = await actions.updateSession({
          session: sessionToUpdate,
        });
        if (!updatedSession.success) {
          return {
            success: false,
            overlapDetected: false,
          };
        }

        const updatedSessions = timerSessions.map((s) =>
          s.id === newSession.id ? updatedSession.data : s
        );

        updateStore(projects, updatedSessions);
        return {
          success: true,
          overlapDetected: false,
        };
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

        updateStore(projects, updatedSessions);
        return true;
      },

      payoutWorkSessions(sessionIds, payoutId) {
        const { updateStore, projects, timerSessions } = get();

        // Update sessions to mark them as paid
        const updatedSessions = timerSessions.map((s) =>
          sessionIds.includes(s.id)
            ? { ...s, paid: true, payout_id: payoutId }
            : s
        );
        updateStore(projects, updatedSessions);
        return true;
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
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return false;

        const { tree, changedNodes } = moveNode(
          get().projectTree,
          projectId,
          newFolderId,
          index
        );
        set({ projectTree: tree });
        handleChangedNodes(changedNodes);

        const updatedProject = await actions.updateTimerProject({
          project: {
            id: projectId,
            folder_id: newFolderId,
          },
          categoryUpdates: {
            deleteIds: [],
            addIds: [],
          },
          categoryIds: project.categoryIds,
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
        const { projects } = get();
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
          actions.updateTimerProject({
            project,
            categoryUpdates: {
              deleteIds: [],
              addIds: [],
            },
            categoryIds:
              projects.find((p) => p.id === project.id)?.categoryIds || [],
          });
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
