"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkStoreState {
  activeProjectId: string | null;
  lastActiveProjectId: string | null;
}

interface WorkStoreActions {
  resetStore: () => void;
  setActiveProjectId: (id: string | null) => void;
}

export const useWorkStore = create<WorkStoreState & WorkStoreActions>()(
  persist(
    (set, get) => ({
      activeProjectId: null,
      lastActiveProjectId: null,

      resetStore: () =>
        set({
          activeProjectId: null,
          lastActiveProjectId: null,
        }),

      setActiveProjectId(id) {
        set({ activeProjectId: id });
        if (id) {
          set({ lastActiveProjectId: id });
        }
      },

      // async addProjectFolder(folder) {
      //   const { handleChangedNodes, projectTree } = get();
      //   const newFolder = await actions.createProjectFolder({ folder: folder });
      //   if (!newFolder.success) {
      //     return false;
      //   }

      //   const { tree, changedNodes } = addNode(
      //     projectTree,
      //     null,
      //     {
      //       id: newFolder.data.id,
      //       name: newFolder.data.title,
      //       type: "folder",
      //       index: 0,
      //       children: [],
      //     },
      //     0
      //   );
      //   set({
      //     projectTree: tree,
      //     folders: [...get().folders, newFolder.data],
      //   });
      //   handleChangedNodes(changedNodes);
      //   return true;
      // },

      // async updateProjectFolder(folder) {
      //   const updatedFolder = await actions.updateProjectFolder({
      //     folder: folder,
      //   });
      //   if (!updatedFolder.success) {
      //     return false;
      //   }

      //   const newProjectTree = renameNode(
      //     get().projectTree,
      //     folder.id!,
      //     folder.title || "project"
      //   );
      //   const updatedFolders = get().folders.map((f) =>
      //     f.id === folder.id ? updatedFolder.data : f
      //   );
      //   set({
      //     projectTree: newProjectTree,
      //     folders: updatedFolders,
      //   });
      //   return true;
      // },

      // async deleteProjectFolder(id) {
      //   const { handleChangedNodes } = get();
      //   const deleted = await actions.deleteProjectFolder({ folderId: id });
      //   if (!deleted.success) {
      //     return false;
      //   }

      //   const { tree, changedNodes } = deleteNode(get().projectTree, id);
      //   const updatedFolders = get().folders.filter((f) => f.id !== id);
      //   set({
      //     projectTree: tree,
      //     folders: updatedFolders,
      //   });
      //   handleChangedNodes(changedNodes);
      //   return true;
      // },
    }),
    {
      name: "work-store",
    }
  )
);
