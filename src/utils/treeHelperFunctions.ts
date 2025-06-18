import { ProjectTreeItem } from "@/stores/workManagerStore";

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
    return [...tree, newNode]; // Root-Level
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
