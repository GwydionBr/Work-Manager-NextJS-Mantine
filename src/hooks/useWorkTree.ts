"use client";

import { useMemo } from "react";

import {
  useWorkProjectQuery,
  useUpdateWorkProjectMutation,
} from "@/utils/queries/work/use-work-project";
import {
  useWorkFolderQuery,
  useUpdateWorkFolderMutation,
} from "@/utils/queries/work/use-work-folder";
import { createTree, moveNode } from "@/utils/treeHelperFunctions";
import {
  ProjectTreeItem,
  UpdateWorkProject,
  UpdateWorkFolder,
} from "@/types/work.types";

export const useWorkTree = () => {
  const { data: projects = [], isPending: isProjectsPending } =
    useWorkProjectQuery();
  const { data: folders = [], isPending: isFoldersPending } =
    useWorkFolderQuery();

  const { mutate: updateWorkProject } = useUpdateWorkProjectMutation();
  const { mutate: updateWorkFolder } = useUpdateWorkFolderMutation();

  const cleanedProjects = useMemo(() => {
    return projects?.map((project) => {
      const { categories, ...rest } = project;
      return rest;
    });
  }, [projects]);

  const projectTree = useMemo(() => {
    const { tree } = createTree(cleanedProjects, folders);
    return tree;
  }, [projects, folders]);

  const handleChangedNodes = (
    changedNodes: ProjectTreeItem[],
    folder_id?: string,
    project_id?: string
  ) => {
    const updatedFolders: UpdateWorkFolder[] = changedNodes
      .filter((node) => node.type === "folder" && node.id !== folder_id)
      .map((node) => ({
        id: node.id,
        order_index: node.index,
      }));
    const updatedProjects: UpdateWorkProject[] = changedNodes
      .filter((node) => node.type === "project" && node.id !== project_id)
      .map((node) => ({
        id: node.id,
        order_index: node.index,
        categories: null,
      }));
    for (const folder of updatedFolders) {
      updateWorkFolder({ folder });
    }
    for (const project of updatedProjects) {
      updateWorkProject({ project });
    }
  };

  const moveFolder = async (
    folderId: string,
    newParentFolderId: string | null,
    index: number
  ) => {
    const { tree, changedNodes } = moveNode(
      projectTree,
      folderId,
      newParentFolderId,
      index
    );
    handleChangedNodes(changedNodes);

    updateWorkFolder({
      folder: {
        id: folderId,
        parent_folder: newParentFolderId,
        order_index: index,
      },
    });
  };

  const moveProject = (
    projectId: string,
    newFolderId: string | null,
    index: number
  ) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return false;

    const { tree, changedNodes } = moveNode(
      projectTree,
      projectId,
      newFolderId,
      index
    );
    handleChangedNodes(changedNodes);

    updateWorkProject({
      project: {
        ...project,
        folder_id: newFolderId,
        order_index: index,
        categories: null,
      },
    });
  };

  return {
    projectTree,
    isPending: isProjectsPending || isFoldersPending,
    moveFolder,
    moveProject,
  };
};
