import { ProjectTreeItem } from "@/types/work.types";
import { Tables } from "@/types/db.types";

interface SortResult {
  sortedTree: ProjectTreeItem[];
  changedNodes: ProjectTreeItem[];
}

interface TreeOperationResult {
  tree: ProjectTreeItem[];
  changedNodes: ProjectTreeItem[];
}

export function createTree(
  projects: Tables<"timerProject">[],
  folders: Tables<"timer_project_folder">[]
): TreeOperationResult {
  const folderMap = new Map();

  // 1. Füge alle Ordner als leere Knoten ein
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.title,
      index: folder.order_index,
      type: "folder",
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
        index: project.order_index,
        type: "project",
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
        index: project.order_index,
      });
    }
  });

  folders.forEach((folder) => {
    if (!folder.parent_folder) {
      root.push(folderMap.get(folder.id));
    }
  });

  const result = sortAndIndex(root);
  return {
    tree: result.sortedTree,
    changedNodes: result.changedNodes,
  };
}

function sortAndIndex(nodes: ProjectTreeItem[]): SortResult {
  // Sort by index, then by name alphabetically
  const sorted = [...nodes].sort((a, b) => {
    if (a.index !== b.index) {
      return a.index - b.index;
    }
    // fallback: sort by name
    return (a.name || "").localeCompare(b.name || "");
  });

  const changedNodes: ProjectTreeItem[] = [];

  // Assign new index and recursively sort children
  const sortedTree = sorted.map((node, idx) => {
    const newNode: ProjectTreeItem = {
      ...node,
      index: idx,
    };

    // Check if index changed
    if (node.index !== idx) {
      changedNodes.push(newNode);
    }

    if (node.children && node.children.length > 0) {
      const childResult = sortAndIndex(node.children);
      newNode.children = childResult.sortedTree;
      changedNodes.push(...childResult.changedNodes);
    }

    return newNode;
  });

  return {
    sortedTree,
    changedNodes,
  };
}

export function deleteNode(
  tree: ProjectTreeItem[],
  id: string
): TreeOperationResult {
  const filteredTree = tree
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children
        ? { ...node, children: deleteNode(node.children, id).tree }
        : node
    );

  // Sort and collect changes after deletion
  const sortResult = sortAndIndex(filteredTree);
  return {
    tree: sortResult.sortedTree,
    changedNodes: sortResult.changedNodes,
  };
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
): TreeOperationResult {
  let nodeToMove: ProjectTreeItem | null = null;
  const changedNodes: ProjectTreeItem[] = [];

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

  function insertNodeAtSpecificIndex(
    nodes: ProjectTreeItem[]
  ): ProjectTreeItem[] {
    return nodes.map((node) => {
      if (node.id === targetFolderId && node.type === "folder") {
        // Setze den neuen Index für den verschobenen Knoten
        const movedNode = {
          ...nodeToMove!,
          index: index,
        };

        // Füge den verschobenen Knoten zur changedNodes Liste hinzu
        changedNodes.push(movedNode);

        // Füge den Knoten an der spezifischen Position ein
        const children = [...(node.children || [])];
        children.splice(index, 0, movedNode);

        // Aktualisiere die Indizes der nachfolgenden Kinder
        const updatedChildren = children.map((child, idx) => {
          if (idx >= index) {
            const updatedChild = { ...child, index: idx };
            if (child.id !== movedNode.id) {
              changedNodes.push(updatedChild);
            }
            return updatedChild;
          }
          return child;
        });

        return {
          ...node,
          children: updatedChildren,
        };
      }
      return node.children
        ? { ...node, children: insertNodeAtSpecificIndex(node.children) }
        : node;
    });
  }

  let treeWithoutNode = removeNode(tree);

  if (targetFolderId === null) {
    // Wenn der Knoten auf Root-Ebene verschoben wird
    const movedNode = {
      ...nodeToMove!,
      index: index,
    };

    // Füge den verschobenen Knoten zur changedNodes Liste hinzu
    changedNodes.push(movedNode);

    // Füge den Knoten an der spezifischen Position ein
    treeWithoutNode.splice(index, 0, movedNode);

    // Aktualisiere die Indizes der nachfolgenden Knoten
    const updatedTree = treeWithoutNode.map((node, idx) => {
      if (idx >= index) {
        const updatedNode = { ...node, index: idx };
        if (node.id !== movedNode.id) {
          changedNodes.push(updatedNode);
        }
        return updatedNode;
      }
      return node;
    });

    return {
      tree: updatedTree,
      changedNodes: changedNodes,
    };
  }

  const resultTree = insertNodeAtSpecificIndex(treeWithoutNode);

  return {
    tree: resultTree,
    changedNodes: changedNodes,
  };
}

export function addNode(
  tree: ProjectTreeItem[],
  parentId: string | null, // null = auf Root-Ebene einfügen
  newNode: ProjectTreeItem
): TreeOperationResult {
  let modifiedTree: ProjectTreeItem[];

  if (parentId === null) {
    if (newNode.type === "project") {
      modifiedTree = [...tree, { ...newNode }];
    } else {
      modifiedTree = [...tree, { ...newNode, children: [] }];
    }
  } else {
    modifiedTree = tree.map((node) => {
      if (node.id === parentId && node.type === "folder") {
        return {
          ...node,
          children: [...(node.children || []), newNode],
        };
      }

      if (node.children) {
        const childResult = addNode(node.children, parentId, newNode);
        return {
          ...node,
          children: childResult.tree,
        };
      }

      return node;
    });
  }

  // Sort and collect changes after adding
  const sortResult = sortAndIndex(modifiedTree);
  return {
    tree: sortResult.sortedTree,
    changedNodes: sortResult.changedNodes,
  };
}
