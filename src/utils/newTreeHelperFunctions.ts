import { ProjectTreeItem } from "@/types/work.types";
import { Tables } from "@/types/db.types";

interface SortResult {
  sortedTree: ProjectTreeItem[];
  changedNodes: ProjectTreeItem[];
}

interface ComplexTreeItem {
  index: string;
  canMove: boolean;
  isFolder: boolean;
  children?: string[];
  data: string;
  canRename: boolean;
}

interface ComplexTreeData {
  items: Record<string, ComplexTreeItem>;
  root: string[];
}

interface TreeOperationResult {
  tree: ComplexTreeData;
  changedNodes: ProjectTreeItem[];
}

export function createNewTree(
  projects: Tables<"timer_project">[],
  folders: Tables<"timer_project_folder">[]
): TreeOperationResult {
  const folderMap = new Map();
  const items: Record<string, ComplexTreeItem> = {};

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

  // 4. Erstelle die react-complex-tree Datenstruktur
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

  // Konvertiere zu react-complex-tree Format
  const convertToComplexTreeFormat = (nodes: ProjectTreeItem[]): string[] => {
    const nodeIds: string[] = [];

    nodes.forEach((node) => {
      // Erstelle den Eintrag für react-complex-tree
      items[node.id] = {
        index: node.id,
        canMove: true,
        isFolder: node.type === "folder",
        children: node.children
          ? convertToComplexTreeFormat(node.children)
          : undefined,
        data: node.name,
        canRename: true,
      };

      nodeIds.push(node.id);

      // Rekursiv für Kinder
      if (node.children && node.children.length > 0) {
        convertToComplexTreeFormat(node.children);
      }
    });

    return nodeIds;
  };

  const rootIds = convertToComplexTreeFormat(result.sortedTree);

  // Erstelle die finale Datenstruktur mit virtuellem Root-Element
  const complexTreeData = {
    items: {
      ...items,
      root: {
        index: "root",
        canMove: false,
        isFolder: true,
        children: rootIds,
        data: "Root",
        canRename: false,
      },
    },
    root: ["root"],
  };

  return {
    tree: complexTreeData,
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
