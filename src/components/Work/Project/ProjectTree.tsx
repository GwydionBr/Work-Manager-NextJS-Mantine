"use client";

import { useViewportSize } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useRouter } from "next/navigation";

import { NodeRendererProps, Tree } from "react-arborist";
import {
  IconFile,
  IconFileFilled,
  IconFolderFilled,
  IconFolderOpen,
} from "@tabler/icons-react";
import { Group, Text } from "@mantine/core";

import { ProjectTreeItem } from "@/types/work.types";

export default function ProjectTree() {
  const { height } = useViewportSize();
  const { projectTree, setActiveProjectId, moveProject, moveFolder } =
    useWorkStore();

  const router = useRouter();

  const handleMove = async (
    dragIds: string[],
    parentId: string | null,
    index: number
  ) => {
    console.log(index, parentId, dragIds);
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
      width={250}
      height={height - 145}
      indent={24}
      rowHeight={30}
      paddingTop={10}
      // selection={activeProjectId ?? undefined}
      onSelect={(nodes) => {
        if (nodes.length > 0) {
          const node = nodes[0];
          if (node.data.type === "project") {
            setActiveProjectId(node.id);
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
  const { activeProjectId } = useWorkStore();
  const isSelected = activeProjectId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle folder open/close
    if (!node.isLeaf) {
      node.toggle();
    }

    // Select the node
    node.select();
  };

  return (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        paddingLeft: `${node.level * 16}px`,
        backgroundColor: isSelected
          ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))"
          : "transparent",
        borderRadius: "var(--mantine-radius-md)",
        cursor: "pointer",
        userSelect: "none",
        paddingTop: 5,
        paddingBottom: 5,
      }}
      ref={dragHandle}
      onClick={handleClick}
    >
      <Group gap="xs" style={{ flex: 1 }}>
        {node.isLeaf ? (
          isSelected ? (
            <IconFileFilled
              color="light-dark(var(--mantine-color-green-8), var(--mantine-color-green-6))"
              size={22}
            />
          ) : (
            <IconFile
              color="light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-5))"
              size={22}
            />
          )
        ) : node.isOpen ? (
          <IconFolderOpen
            color="light-dark(var(--mantine-color-orange-7), var(--mantine-color-orange-5))"
            size={22}
          />
        ) : (
          <IconFolderFilled
            color="light-dark(var(--mantine-color-orange-6), var(--mantine-color-orange-5))"
            size={22}
          />
        )}
        <Group>
          <Text size="md" style={{ flex: 1 }}>
            {node.data.name}
          </Text>
          {!node.isOpen &&
            !node.isLeaf &&
            node.children &&
            node.children.length > 0 && (
              <Text size="sm" c="dimmed">
                {node.children.length}
              </Text>
            )}
        </Group>
      </Group>
    </div>
  );
}
