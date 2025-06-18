"use client";

import { ProjectTreeItem, useWorkStore } from "@/stores/workManagerStore";

import { NodeRendererProps, Tree } from "react-arborist";
import {
  IconFile,
  IconFolderFilled,
  IconFolderOpen,
} from "@tabler/icons-react";

export default function ProjectTree() {
  const { projectTree, setActiveProject } = useWorkStore();

  return (
    <Tree<ProjectTreeItem>
      initialData={projectTree}
      openByDefault={false}
      width={600}
      height={1000}
      indent={24}
      rowHeight={30}
      paddingTop={10}
      paddingBottom={10}
      padding={25 /* sets both */}
      onSelect={(nodes) => {
        if (nodes.length > 0) setActiveProject(nodes[0].id);
      }}
    >
      {Node}
    </Tree>
  );
}

function Node({ node, style, dragHandle }: NodeRendererProps<ProjectTreeItem>) {
  /* This node instance can do many things. See the API reference. */
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
