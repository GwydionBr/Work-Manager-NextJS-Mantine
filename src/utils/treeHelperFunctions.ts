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
