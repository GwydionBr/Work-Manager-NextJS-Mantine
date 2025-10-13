"use client";

import { useMemo } from "react";

import { useWorkProjectQuery } from "@/utils/queries/work/use-work-project";
import { useWorkFolderQuery } from "@/utils/queries/work/use-work-folder";
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

  const handleChangedNodes = (changedNodes: ProjectTreeItem[]) => {
    const updatedFolders: UpdateWorkFolder[] = changedNodes
      .filter((node) => node.type === "folder")
      .map((node) => ({
        id: node.id,
        order_index: node.index,
      }));
    const updatedProjects: UpdateWorkProject[] = changedNodes
      .filter((node) => node.type === "project")
      .map((node) => ({
        id: node.id,
        order_index: node.index,
        categories: [],
      }));
    for (const folder of updatedFolders) {
      console.log("updatedFolder", folder);
      // updateWorkFolder({ folder });
    }
    for (const project of updatedProjects) {
      console.log("updatedProject", project);
      // updateWorkProject({ project });
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

    // TODO: updateFolderMutation
    // updateWorkFolder({
    //   folder: {
    //     id: folderId,
    //     parent_folder: newParentFolderId,
    //   },
    // });
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

    // TODO: updateProjectMutation
    // updateWorkProject({
    //   project: {
    //     ...project,
    //     folder_id: newFolderId,
    //   },
    // });
  };

  return {
    projectTree,
    isPending: isProjectsPending || isFoldersPending,
    moveFolder,
    moveProject,
  };
};
