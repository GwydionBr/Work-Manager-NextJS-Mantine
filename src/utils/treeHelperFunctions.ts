import { ProjectTreeItem } from "@/stores/workManagerStore";
import { Tables } from "@/types/db.types";

export function createTree(
  projects: Tables<"timerProject">[],
  folders: Tables<"timer_project_folder">[]
): ProjectTreeItem[] {
  const folderMap = new Map();

  // 1. Füge alle Ordner als leere Knoten ein
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.title,
      index: folder.order_index,
      type: "folder" as const,
      children: [],
    });
  });

  // 2. Ordne die Ordner ihrer Eltern zu (für verschachtelte Struktur)
  folders.forEach((folder) => {
    if (folder.parent_folder && folderMap.has(folder.parent_folder)) {
      folderMap
        .get(folder.parent_folder)
        .children.push(folderMap.get(folder.id));
    }
  });

  // 3. Füge Projekte in ihre jeweiligen Ordner
  projects.forEach((project) => {
    const folderId = project.folder_id;
    if (folderId && folderMap.has(folderId)) {
      folderMap.get(folderId).children.push({
        id: project.id,
        name: project.title,
        type: "project" as const,
      });
    }
  });

  // 4. Gib nur die Root-Ordner (ohne parent_folder) zurück
  const root: ProjectTreeItem[] = [];

  projects.forEach((project) => {
    if (!project.folder_id) {
      root.push({
        id: project.id,
        name: project.title,
        type: "project",
        index: project.order_index || 0,
      });
    }
  });

  folders.forEach((folder) => {
    if (!folder.parent_folder) {
      root.push(folderMap.get(folder.id));
    }
  });

  return root;
}

export function findNode(
  tree: ProjectTreeItem[],
  id: string
): ProjectTreeItem | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const result = findNode(node.children, id);
      if (result) return result;
    }
  }
  return null;
}

export function deleteNode(
  tree: ProjectTreeItem[],
  id: string
): ProjectTreeItem[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children
        ? { ...node, children: deleteNode(node.children, id) }
        : node
    );
}

export function renameNode(
  tree: ProjectTreeItem[],
  id: string,
  newName: string
): ProjectTreeItem[] {
  return tree.map((node) => {
    if (node.id === id) {
      return { ...node, name: newName };
    }
    if (node.children) {
      return { ...node, children: renameNode(node.children, id, newName) };
    }
    return node;
  });
}

export function moveNode(
  tree: ProjectTreeItem[],
  nodeId: string,
  targetFolderId: string | null,
  index: number
): ProjectTreeItem[] {
  let nodeToMove: ProjectTreeItem | null = null;

  function removeNode(nodes: ProjectTreeItem[]): ProjectTreeItem[] {
    return nodes
      .filter((node) => {
        if (node.id === nodeId) {
          nodeToMove = node;
          return false;
        }
        return true;
      })
      .map((node) =>
        node.children ? { ...node, children: removeNode(node.children) } : node
      );
  }

  function insertNode(nodes: ProjectTreeItem[]): ProjectTreeItem[] {
    return nodes.map((node) => {
      if (node.id === targetFolderId && node.type === "folder") {
        return {
          ...node,
          children: [...(node.children || []), nodeToMove!],
        };
      }
      return node.children
        ? { ...node, children: insertNode(node.children) }
        : node;
    });
  }

  let treeWithoutNode = removeNode(tree);
  if (targetFolderId === null) {
    treeWithoutNode.push(nodeToMove!);
    return treeWithoutNode;
  }

  return insertNode(treeWithoutNode);
}

export function addNode(
  tree: ProjectTreeItem[],
  parentId: string | null, // null = auf Root-Ebene einfügen
  newNode: ProjectTreeItem
): ProjectTreeItem[] {
  if (parentId === null) {
    if (newNode.type === "project") {
      return [...tree, { ...newNode }];
    } else {
      return [...tree, { ...newNode, children: [] }];
    }
  }

  return tree.map((node) => {
    if (node.id === parentId && node.type === "folder") {
      return {
        ...node,
        children: [...(node.children || []), newNode],
      };
    }

    if (node.children) {
      return {
        ...node,
        children: addNode(node.children, parentId, newNode),
      };
    }

    return node;
  });
}

function orderTree(tree: ProjectTreeItem[]): ProjectTreeItem[] {
  // Sort the current level by index
  const sortedTree = [...tree].sort((a, b) => {
    // If both have valid indexes, sort by index
    if (a.index !== undefined && b.index !== undefined) {
      return a.index - b.index;
    }
    // If only one has an index, prioritize the one with index
    if (a.index !== undefined) return -1;
    if (b.index !== undefined) return 1;
    // If neither has an index, maintain original order
    return 0;
  });

  // Update indexes to ensure sequential ordering
  const updatedTree = sortedTree.map((node, newIndex) => ({
    ...node,
    index: newIndex,
    // Recursively order children if they exist
    children: node.children ? orderTree(node.children) : undefined,
  }));

  return updatedTree;
}

export function findNextProject(
  tree: ProjectTreeItem[],
  deletedProjectId: string
): string | null {
  // First, find the deleted project to determine its location
  const deletedProject = findNode(tree, deletedProjectId);
  if (!deletedProject) return null;

  // Find the parent folder of the deleted project
  const parentFolder = findParentFolder(tree, deletedProjectId);

  if (parentFolder) {
    // Look for other projects in the same folder
    const siblingProjects =
      parentFolder.children?.filter(
        (child) => child.type === "project" && child.id !== deletedProjectId
      ) || [];

    if (siblingProjects.length > 0) {
      // Return the first sibling project
      return siblingProjects[0].id;
    }

    // If no sibling projects, look in parent folders
    return findNextProjectInParent(tree, parentFolder.id);
  } else {
    // Project is at root level, look for other root projects
    const rootProjects = tree.filter(
      (node) => node.type === "project" && node.id !== deletedProjectId
    );

    if (rootProjects.length > 0) {
      return rootProjects[0].id;
    }

    // Look for any project in subfolders
    return findFirstProjectInSubfolders(tree);
  }
}

function findParentFolder(
  tree: ProjectTreeItem[],
  projectId: string
): ProjectTreeItem | null {
  for (const node of tree) {
    if (node.type === "folder" && node.children) {
      const hasProject = node.children.some((child) => child.id === projectId);
      if (hasProject) return node;

      const result = findParentFolder(node.children, projectId);
      if (result) return result;
    }
  }
  return null;
}

function findNextProjectInParent(
  tree: ProjectTreeItem[],
  parentFolderId: string
): string | null {
  const parentFolder = findNode(tree, parentFolderId);
  if (!parentFolder) return null;

  // Look for projects in this parent folder
  const projectsInParent =
    parentFolder.children?.filter((child) => child.type === "project") || [];

  if (projectsInParent.length > 0) {
    return projectsInParent[0].id;
  }

  // If no projects in this parent, look in its parent
  const grandParent = findParentFolder(tree, parentFolderId);
  if (grandParent) {
    return findNextProjectInParent(tree, grandParent.id);
  }

  // If we're at the root level, look for any project
  return findFirstProjectInSubfolders(tree);
}

function findFirstProjectInSubfolders(tree: ProjectTreeItem[]): string | null {
  for (const node of tree) {
    if (node.type === "project") {
      return node.id;
    }
    if (node.type === "folder" && node.children) {
      const result = findFirstProjectInSubfolders(node.children);
      if (result) return result;
    }
  }
  return null;
}
