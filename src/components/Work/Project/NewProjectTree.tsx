import {
  UncontrolledTreeEnvironment,
  StaticTreeDataProvider,
} from "react-complex-tree";
import { Tree } from "react-complex-tree";
import { useWorkTree } from "@/hooks/useWorkTree";
import "react-complex-tree/lib/style-modern.css";

export default function NewProjectTree() {
  const { newProjectTree } = useWorkTree();

  console.log("NewProjectTree data:", newProjectTree);


  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(newProjectTree.items, (item, data) => ({
          ...item,
          data,
        }))
      }
      getItemTitle={(item) => item.data}
      canDragAndDrop={true}
      canReorderItems={true}
      canDropOnFolder={true}
      canDropOnNonFolder={false}
      viewState={{
        "tree-1": {
          expandedItems: newProjectTree.root,
        },
      }}
      
    >
      <Tree treeId="tree-1" rootItem="root" treeLabel="Project Tree" />
    </UncontrolledTreeEnvironment>
  );
}
