"use client";

import { ProjectTreeItem, useWorkStore } from "@/stores/workManagerStore";
import { useRouter } from "next/navigation";

import { NodeRendererProps, Tree } from "react-arborist";
import {
  IconFile,
  IconFileFilled,
  IconFolderFilled,
  IconFolderOpen,
} from "@tabler/icons-react";
import { Group } from "@mantine/core";

export default function ProjectTree() {
  const { projectTree, setActiveProject, moveProject, moveFolder } =
    useWorkStore();

  const router = useRouter();

  const handleMove = async (
    dragIds: string[],
    parentId: string | null,
    index: number
  ) => {
    for (const id of dragIds) {
      // Prüfe, ob es ein Projekt oder Ordner ist
      const node = findNodeById(projectTree, id);
      if (node?.type === "project") {
        await moveProject(id, parentId, index);
      } else if (node?.type === "folder") {
        await moveFolder(id, parentId, index);
      }
    }
  };

  // Hilfsfunktion zum Finden eines Knotens in der Tree-Struktur
  const findNodeById = (
    tree: ProjectTreeItem[],
    id: string
  ): ProjectTreeItem | null => {
    for (const item of tree) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findNodeById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <Tree<ProjectTreeItem>
      data={projectTree}
      openByDefault={false}
      width={600}
      height={1000}
      indent={24}
      rowHeight={30}
      paddingTop={10}
      paddingBottom={10}
      padding={25}
      onSelect={(nodes) => {
        if (nodes.length > 0) {
          const node = nodes[0];
          if (node.data.type === "project") {
            setActiveProject(node.id);
            router.push("/work");
          }
        }
      }}
      onMove={({ dragIds, parentId, index }) => {
        handleMove(dragIds, parentId, index);
      }}
    >
      {Node}
    </Tree>
  );
}

function Node({ node, style, dragHandle }: NodeRendererProps<ProjectTreeItem>) {
  const { activeProject } = useWorkStore();
  const isSelected = activeProject?.project.id === node.id;

  return (
    <Group
      style={style}
      ref={dragHandle}
      onClick={() => node.toggle()}
      gap={10}
    >
      {node.isLeaf ? (
        isSelected ? (
          <IconFileFilled color="green" size={20} />
        ) : (
          <IconFile color="gray" size={20} />
        )
      ) : node.isOpen ? (
        <IconFolderOpen color="orange" size={20} />
      ) : (
        <IconFolderFilled color="orange" size={20} />
      )}{" "}
      {node.data.name}
    </Group>
  );
}
