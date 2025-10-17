"use client";

import { useResizeObserver, useViewportSize } from "@mantine/hooks";
import { useRouter, usePathname, useParams } from "next/navigation";

import { NodeRendererProps, Tree } from "react-arborist";
import {
  IconFile,
  IconFileFilled,
  IconFolderFilled,
  IconFolderOpen,
  IconFolder,
} from "@tabler/icons-react";
import { Box, Group, Skeleton, Stack, Text } from "@mantine/core";

import { ProjectTreeItem } from "@/types/work.types";
import { findNodeById } from "@/utils/treeHelperFunctions";
import { useWorkTree } from "@/hooks/useWorkTree";

export default function ProjectTree({ search }: { search: string }) {
  const { height } = useViewportSize();
  const { projectId } = useParams() as { projectId: string | undefined };
  const [ref, rect] = useResizeObserver();

  const { projectTree, isPending, moveProject, moveFolder } = useWorkTree();

  const router = useRouter();

  const handleMove = (
    dragIds: string[],
    parentId: string | null,
    index: number
  ) => {
    for (const id of dragIds) {
      // Prüfe, ob es ein Projekt oder Ordner ist
      const node = findNodeById(projectTree, id);
      if (node?.type === "project") {
        moveProject(id, parentId, index);
      } else if (node?.type === "folder") {
        moveFolder(id, parentId, index);
      }
    }
  };

  if (isPending) {
    return (
      <Stack pt={10} gap="xs">
        <Skeleton height={25} w={200} mx="md" />
        <Skeleton height={25} w={200} mx="md" />
        <Skeleton height={25} w={200} mx="md" />
      </Stack>
    );
  }

  return (
    <Box w="100%" h="100%" ref={ref}>
      <Tree<ProjectTreeItem>
        data={projectTree}
        openByDefault={false}
        width={rect.width}
        height={height - 200}
        paddingTop={5}
        indent={24}
        rowHeight={30}
        searchTerm={search}
        selection={projectId ?? undefined}
        onDelete={(nodes) => {
          console.log(nodes.nodes.map((node) => node.data.name));
        }}
        onRename={(node) => {
          console.log(node.name);
        }}
        onSelect={(nodes) => {
          if (nodes.length > 0) {
            const node = nodes[0];
            if (node.data.type === "project") {
              router.push(`/work/${node.id}`);
            }
          }
        }}
        onMove={({ dragIds, parentId, index }) => {
          handleMove(dragIds, parentId, index);
        }}
      >
        {Node}
      </Tree>
    </Box>
  );
}

function Node({ node, style, dragHandle }: NodeRendererProps<ProjectTreeItem>) {
  const pathname = usePathname();
  const isEditing = node.isEditing;

  if (isEditing) {
    console.log(node.id);
  }

  const isSelected = pathname.includes(node.id);
  const willReceiveDrop = node.willReceiveDrop;

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
        backgroundColor:
          isSelected || willReceiveDrop
            ? "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))"
            : "transparent",
        borderRadius: "var(--mantine-radius-md)",
        cursor: "pointer",
        userSelect: "none",
        marginLeft: 5,
        marginRight: 5,
        paddingTop: 5,
        paddingBottom: 5,
      }}
      ref={dragHandle}
      onClick={handleClick}
    >
      <Group
        gap="xs"
        style={{
          flex: 1,
          whiteSpace: "nowrap",
        }}
        wrap="nowrap"
      >
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
        ) : node.children && node.children.length === 0 ? (
          <IconFolder
            color="light-dark(var(--mantine-color-orange-6), var(--mantine-color-orange-5))"
            size={22}
          />
        ) : (
          <IconFolderFilled
            color="light-dark(var(--mantine-color-orange-6), var(--mantine-color-orange-5))"
            size={22}
          />
        )}
        <Group>
          <Text size="md" style={{ flex: 1, textOverflow: "ellipsis" }}>
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
