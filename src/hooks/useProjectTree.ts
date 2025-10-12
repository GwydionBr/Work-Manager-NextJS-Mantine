// "use client";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useState, useEffect } from "react";
// import {
//   createTree,
//   deleteNode,
//   renameNode,
//   moveNode,
//   addNode,
// } from "@/utils/treeHelperFunctions";
// import { getTimeFragmentSession, resolveSessionOverlaps } from "@/utils/helper";
// import { Tables, TablesInsert, TablesUpdate } from "@/types/db.types";
// import {
//   WorkProject,
//   UpdateWorkProject,
//   UpdateWorkTimeEntry,
//   InsertWorkProject,
//   InsertWorkTimeEntry,
//   ProjectTreeItem,
//   StoreTimerProject,
// } from "@/types/work.types";
// import { Currency } from "@/types/settings.types";
// import { ErrorResponse, SuccessPayoutResponse } from "@/types/action.types";
// import { TimerRoundingSettings } from "@/types/timeTracker.types";
// import { getAllTimerSessions } from "@/actions/work/timerSession/get-all-work-time-entries";
// import { getAllTimerProjects } from "@/actions/work/timerProject/get-all-timer-projects";
// import { getAllWorkFolders } from "@/actions/work/folder/get-all-work-folder";
// import { createTimerProject } from "@/actions/work/timerProject/create-timer-project";

// export const useWorkManager = () => {
//   const queryClient = useQueryClient();
//   const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
//   const [lastActiveProjectId, setLastActiveProjectId] = useState<string | null>(
//     null
//   );

//   // Queries
//   const projectsQuery = useQuery({
//     queryKey: ["workProjects"],
//     queryFn: getAllTimerProjects,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   const sessionsQuery = useQuery({
//     queryKey: ["workTimeEntries"],
//     queryFn: getAllTimerSessions,
//     staleTime: 5 * 60 * 1000,
//   });

//   const foldersQuery = useQuery({
//     queryKey: ["workFolders"],
//     queryFn: getAllWorkFolders,
//     staleTime: 5 * 60 * 1000,
//   });

//   // Create project tree from data
//   const projectTree =
//     projectsQuery.data && foldersQuery.data
//       ? createTree(projectsQuery.data, foldersQuery.data).tree
//       : [];

//   // Local state for project tree (for optimistic updates)
//   const [localProjectTree, setLocalProjectTree] = useState<ProjectTreeItem[]>(
//     []
//   );

//   // Update local tree when data changes
//   useEffect(() => {
//     if (projectsQuery.data && foldersQuery.data) {
//       const { tree } = createTree(projectsQuery.data, foldersQuery.data);
//       setLocalProjectTree(tree);
//     }
//   }, [projectsQuery.data, foldersQuery.data]);

//   // Mutations
//   const addProjectMutation = useMutation({
//     mutationFn: async ({
//       project,
//       setActiveProjectId: setActive,
//       categoryIds,
//     }: {
//       project: InsertWorkProject;
//       setActiveProjectId: boolean;
//       categoryIds: string[];
//     }) => {
//       const result = await createTimerProject({
//         project,
//         categoryIds,
//       });
//       if (!result.success) throw new Error(result.error);
//       return result.data;
//     },
//     onSuccess: (newProject, variables) => {
//       // Invalidate and refetch projects
//       queryClient.invalidateQueries({ queryKey: ["timerProjects"] });

//       if (variables.setActiveProjectId) {
//         setActiveProjectId(newProject.id);
//         setLastActiveProjectId(newProject.id);
//       }
//     },
//   });

//   const updateProjectMutation = useMutation({
//     mutationFn: async ({
//       updatedProject,
//       categoryUpdates,
//     }: {
//       updatedProject: StoreTimerProject;
//       categoryUpdates: {
//         deleteIds: string[];
//         addIds: string[];
//       };
//     }) => {
//       const { categoryIds, ...projectData } = updatedProject;
//       const result = await actions.updateTimerProject({
//         project: projectData,
//         categoryUpdates,
//         categoryIds,
//       });
//       if (!result.success) throw new Error(result.error);
//       return { data: result.data, updatedProject };
//     },
//     onSuccess: (result, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["timerProjects"] });

//       // Update local tree if title changed
//       const oldProject = projectsQuery.data?.data?.find(
//         (p) => p.id === variables.updatedProject.id
//       );
//       if (oldProject && oldProject.title !== variables.updatedProject.title) {
//         const newProjectTree = renameNode(
//           localProjectTree,
//           variables.updatedProject.id,
//           variables.updatedProject.title
//         );
//         setLocalProjectTree(newProjectTree);
//       }
//     },
//   });

//   const deleteProjectMutation = useMutation({
//     mutationFn: async (projectId: string) => {
//       const result = await actions.deleteTimerProjects({
//         projectIds: [projectId],
//       });
//       if (!result.success) throw new Error(result.error);
//       return projectId;
//     },
//     onSuccess: (deletedId) => {
//       queryClient.invalidateQueries({ queryKey: ["timerProjects"] });

//       // Update local tree
//       const { tree, changedNodes } = deleteNode(localProjectTree, deletedId);
//       setLocalProjectTree(tree);
//       handleChangedNodes(changedNodes);

//       if (activeProjectId === deletedId) {
//         const currentProjects = projectsQuery.data?.data || [];
//         const remainingProjects = currentProjects.filter(
//           (p) => p.id !== deletedId
//         );
//         const newActiveId = remainingProjects[0]?.id || null;
//         setActiveProjectId(newActiveId);
//         if (newActiveId) setLastActiveProjectId(newActiveId);
//       }
//     },
//   });

//   const addTimerSessionMutation = useMutation({
//     mutationFn: async ({
//       session,
//       roundingSettings,
//     }: {
//       session: InsertWorkTimeEntry;
//       roundingSettings: TimerRoundingSettings;
//     }) => {
//       const projects = projectsQuery.data?.data || [];
//       const sessions = sessionsQuery.data || [];

//       // Find project
//       const project = projects.find((p) => p.id === session.project_id);
//       if (!project) {
//         throw new Error("Project not found");
//       }

//       let newSession: TablesInsert<"timer_session"> = { ...session };

//       if (roundingSettings.roundInTimeFragments) {
//         newSession = getTimeFragmentSession(
//           roundingSettings.timeFragmentInterval,
//           newSession
//         );
//       }

//       // Filter out existing sessions that overlap with the new session
//       const existingSessions = sessions.filter(
//         (s) => s.project_id === session.project_id
//       );

//       const { adjustedTimeSpans, overlappingSessions } = resolveSessionOverlaps(
//         existingSessions,
//         newSession
//       );

//       if (!adjustedTimeSpans) {
//         return {
//           createdSessions: null,
//           completeOverlap: true,
//           overlappingSessions: null,
//         };
//       }

//       // Create new session
//       const newSessions = await actions.createSessions({
//         sessions: adjustedTimeSpans,
//       });

//       if (!newSessions.success) {
//         throw new Error("Failed to create sessions");
//       }

//       return {
//         createdSessions: newSessions.data,
//         completeOverlap: false,
//         overlappingSessions:
//           overlappingSessions.length > 0 ? overlappingSessions : null,
//       };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["timerSessions"] });
//     },
//   });

//   const deleteTimerSessionsMutation = useMutation({
//     mutationFn: async (sessionIds: string[]) => {
//       const result = await actions.deleteSessions({ sessionIds });
//       if (!result.success) throw new Error(result.error);
//       return sessionIds;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["timerSessions"] });
//     },
//   });

//   const updateTimerSessionMutation = useMutation({
//     mutationFn: async ({
//       oldSession,
//       newSession,
//       roundingSettings,
//     }: {
//       oldSession: Tables<"timer_session">;
//       newSession: Tables<"timer_session">;
//       roundingSettings: TimerRoundingSettings;
//     }) => {
//       const projects = projectsQuery.data?.data || [];
//       const sessions = sessionsQuery.data?.data || [];

//       const project = projects.find((p) => p.id === newSession.project_id);
//       if (!project) {
//         throw new Error("Project not found");
//       }

//       let sessionToUpdate: Tables<"timer_session"> = { ...newSession };

//       if (
//         oldSession.start_time !== newSession.start_time ||
//         oldSession.end_time !== newSession.end_time
//       ) {
//         let updatedSession: TablesInsert<"timer_session"> = { ...newSession };
//         if (roundingSettings.roundInTimeFragments) {
//           updatedSession = getTimeFragmentSession(
//             roundingSettings.timeFragmentInterval,
//             newSession
//           );
//         }

//         const existingSessions = sessions.filter(
//           (s) => s.project_id === newSession.project_id
//         );

//         const { adjustedTimeSpans, overlappingSessions } =
//           resolveSessionOverlaps(
//             existingSessions.filter((s) => s.id !== newSession.id),
//             updatedSession
//           );

//         if (!adjustedTimeSpans || overlappingSessions.length > 0) {
//           return {
//             success: false,
//             overlapDetected: true,
//           };
//         }
//         sessionToUpdate = adjustedTimeSpans[0] as Tables<"timer_session">;
//       }

//       const result = await actions.updateSession({
//         session: sessionToUpdate,
//       });
//       if (!result.success) throw new Error(result.error);

//       return {
//         success: true,
//         overlapDetected: false,
//       };
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["timerSessions"] });
//     },
//   });

//   const updateMultipleTimerSessionsMutation = useMutation({
//     mutationFn: async ({
//       sessionIds,
//       update,
//     }: {
//       sessionIds: string[];
//       update: TablesUpdate<"timer_session">;
//     }) => {
//       const result = await actions.updateMultipleSessions({
//         sessionIds,
//         update,
//       });
//       if (!result.success) throw new Error(result.error);
//       return result.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["timerSessions"] });
//     },
//   });

//   const addProjectFolderMutation = useMutation({
//     mutationFn: async (folder: TablesInsert<"timer_project_folder">) => {
//       const result = await actions.createProjectFolder({ folder });
//       if (!result.success) throw new Error(result.error);
//       return result.data;
//     },
//     onSuccess: (newFolder) => {
//       queryClient.invalidateQueries({ queryKey: ["projectFolders"] });

//       // Update local tree
//       const { tree, changedNodes } = addNode(
//         localProjectTree,
//         null,
//         {
//           id: newFolder.id,
//           name: newFolder.title,
//           type: "folder",
//           index: 0,
//           children: [],
//         },
//         0
//       );
//       setLocalProjectTree(tree);
//       handleChangedNodes(changedNodes);
//     },
//   });

//   const updateProjectFolderMutation = useMutation({
//     mutationFn: async (folder: TablesUpdate<"timer_project_folder">) => {
//       const result = await actions.updateProjectFolder({ folder });
//       if (!result.success) throw new Error(result.error);
//       return result.data;
//     },
//     onSuccess: (updatedFolder) => {
//       queryClient.invalidateQueries({ queryKey: ["projectFolders"] });

//       // Update local tree if title changed
//       const newProjectTree = renameNode(
//         localProjectTree,
//         updatedFolder.id,
//         updatedFolder.title || "project"
//       );
//       setLocalProjectTree(newProjectTree);
//     },
//   });

//   const deleteProjectFolderMutation = useMutation({
//     mutationFn: async (folderId: string) => {
//       const result = await actions.deleteProjectFolder({ folderId });
//       if (!result.success) throw new Error(result.error);
//       return folderId;
//     },
//     onSuccess: (deletedId) => {
//       queryClient.invalidateQueries({ queryKey: ["projectFolders"] });

//       // Update local tree
//       const { tree, changedNodes } = deleteNode(localProjectTree, deletedId);
//       setLocalProjectTree(tree);
//       handleChangedNodes(changedNodes);
//     },
//   });

//   const moveProjectMutation = useMutation({
//     mutationFn: async ({
//       projectId,
//       newFolderId,
//       index,
//     }: {
//       projectId: string;
//       newFolderId: string | null;
//       index: number;
//     }) => {
//       const projects = projectsQuery.data?.data || [];
//       const project = projects.find((p) => p.id === projectId);
//       if (!project) throw new Error("Project not found");

//       const result = await actions.updateTimerProject({
//         project: {
//           id: projectId,
//           folder_id: newFolderId,
//         },
//         categoryUpdates: {
//           deleteIds: [],
//           addIds: [],
//         },
//         categoryIds: project.categoryIds,
//       });
//       if (!result.success) throw new Error(result.error);
//       return { projectId, newFolderId, index };
//     },
//     onSuccess: (variables) => {
//       queryClient.invalidateQueries({ queryKey: ["timerProjects"] });

//       // Update local tree
//       const { tree, changedNodes } = moveNode(
//         localProjectTree,
//         variables.projectId,
//         variables.newFolderId,
//         variables.index
//       );
//       setLocalProjectTree(tree);
//       handleChangedNodes(changedNodes);
//     },
//   });

//   const moveFolderMutation = useMutation({
//     mutationFn: async ({
//       folderId,
//       newParentFolderId,
//       index,
//     }: {
//       folderId: string;
//       newParentFolderId: string | null;
//       index: number;
//     }) => {
//       const result = await actions.updateProjectFolder({
//         folder: {
//           id: folderId,
//           parent_folder: newParentFolderId,
//         },
//       });
//       if (!result.success) throw new Error(result.error);
//       return { folderId, newParentFolderId, index };
//     },
//     onSuccess: (variables) => {
//       queryClient.invalidateQueries({ queryKey: ["projectFolders"] });

//       // Update local tree
//       const { tree, changedNodes } = moveNode(
//         localProjectTree,
//         variables.folderId,
//         variables.newParentFolderId,
//         variables.index
//       );
//       setLocalProjectTree(tree);
//       handleChangedNodes(changedNodes);
//     },
//   });

//   // Helper functions
//   const handleChangedNodes = (changedNodes: ProjectTreeItem[]) => {
//     const projects = projectsQuery.data?.data || [];
//     const updatedFolders: TablesUpdate<"timer_project_folder">[] = changedNodes
//       .filter((node) => node.type === "folder")
//       .map((node) => ({
//         id: node.id,
//         order_index: node.index,
//       }));
//     const updatedProjects: TablesUpdate<"timer_project">[] = changedNodes
//       .filter((node) => node.type === "project")
//       .map((node) => ({
//         id: node.id,
//         order_index: node.index,
//       }));

//     // Update folders
//     updatedFolders.forEach((folder) => {
//       updateProjectFolderMutation.mutate(folder);
//     });

//     // Update projects
//     updatedProjects.forEach((project) => {
//       const projectData = projects.find((p) => p.id === project.id);
//       if (projectData) {
//         updateProjectMutation.mutate({
//           updatedProject: projectData,
//           categoryUpdates: { deleteIds: [], addIds: [] },
//         });
//       }
//     });
//   };

//   const payoutWorkSessions = (sessionIds: string[], cashflowId: string) => {
//     // This would need to be implemented as a mutation
//     // For now, just invalidate sessions to refetch
//     queryClient.invalidateQueries({ queryKey: ["timerSessions"] });
//     return true;
//   };

//   const payoutProjectSalary = async (
//     projectId: string,
//     startValue: number,
//     startCurrency: Currency,
//     categoryId: string | null,
//     endValue: number | null,
//     endCurrency: Currency | null
//   ): Promise<SuccessPayoutResponse | ErrorResponse> => {
//     // This would need to be implemented as a mutation
//     return {
//       success: false,
//       data: null,
//       error: "Payout is not implemented yet",
//     };
//   };

//   return {
//     // Data
//     projectTree: localProjectTree.length > 0 ? localProjectTree : projectTree,
//     projects: projectsQuery.data?.data || [],
//     folders: foldersQuery.data?.data || [],
//     timerSessions: sessionsQuery.data?.data || [],
//     activeProjectId,
//     lastActiveProjectId,

//     // Loading states
//     isFetching:
//       projectsQuery.isFetching ||
//       sessionsQuery.isFetching ||
//       foldersQuery.isFetching,
//     isLoading:
//       projectsQuery.isLoading ||
//       sessionsQuery.isLoading ||
//       foldersQuery.isLoading,

//     // Error states
//     error: projectsQuery.error || sessionsQuery.error || foldersQuery.error,

//     // Actions
//     setActiveProjectId: (id: string | null) => {
//       setActiveProjectId(id);
//       if (id) setLastActiveProjectId(id);
//     },

//     // Mutations
//     addProject: addProjectMutation.mutate,
//     updateProject: updateProjectMutation.mutate,
//     deleteProject: deleteProjectMutation.mutate,
//     addTimerSession: addTimerSessionMutation.mutate,
//     deleteTimerSessions: deleteTimerSessionsMutation.mutate,
//     updateTimerSession: updateTimerSessionMutation.mutate,
//     updateMultipleTimerSessions: updateMultipleTimerSessionsMutation.mutate,
//     addProjectFolder: addProjectFolderMutation.mutate,
//     updateProjectFolder: updateProjectFolderMutation.mutate,
//     deleteProjectFolder: deleteProjectFolderMutation.mutate,
//     moveProject: moveProjectMutation.mutate,
//     moveFolder: moveFolderMutation.mutate,

//     // Helper functions
//     handleChangedNodes,
//     payoutWorkSessions,
//     payoutProjectSalary,

//     // Mutation states
//     isAddingProject: addProjectMutation.isPending,
//     isUpdatingProject: updateProjectMutation.isPending,
//     isDeletingProject: deleteProjectMutation.isPending,
//     isAddingSession: addTimerSessionMutation.isPending,
//     isDeletingSessions: deleteTimerSessionsMutation.isPending,
//     isUpdatingSession: updateTimerSessionMutation.isPending,
//     isAddingFolder: addProjectFolderMutation.isPending,
//     isUpdatingFolder: updateProjectFolderMutation.isPending,
//     isDeletingFolder: deleteProjectFolderMutation.isPending,
//     isMovingProject: moveProjectMutation.isPending,
//     isMovingFolder: moveFolderMutation.isPending,
//   };
// };
