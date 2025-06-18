"use client";

import { useState } from "react";
import { ProjectTreeItem, useWorkStore } from "@/stores/workManagerStore";
import { useRouter } from "next/navigation";
import { useSettingsStore } from "@/stores/settingsStore";

import { NodeRendererProps, Tree } from "react-arborist";
import {
  IconFile,
  IconFolderFilled,
  IconFolderOpen,
} from "@tabler/icons-react";

export default function ProjectTree() {
  const { projectTree, setActiveProject, moveProject, moveFolder } =
    useWorkStore();

  const router = useRouter();

  const handleMove = async (dragIds: string[], parentId: string | null) => {
    for (const id of dragIds) {
      // Prüfe, ob es ein Projekt oder Ordner ist
      const node = findNodeById(projectTree, id);
      if (node?.type === "project") {
        await moveProject(id, parentId);
      } else if (node?.type === "folder") {
        await moveFolder(id, parentId);
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
      onMove={({ dragIds, parentId }) => {
        handleMove(dragIds, parentId);
      }}
    >
      {Node}
    </Tree>
  );
}

function Node({ node, style, dragHandle }: NodeRendererProps<ProjectTreeItem>) {
  return (
    <div style={style} ref={dragHandle} onClick={() => node.toggle()}>
      {node.isLeaf ? (
        <IconFile color="gray" />
      ) : node.isOpen ? (
        <IconFolderOpen color="orange" />
      ) : (
        <IconFolderFilled color="orange" />
      )}{" "}
      {node.data.name}
    </div>
  );
}
