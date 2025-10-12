"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllWorkFolders } from "@/actions/work/folder/get-all-work-folder";

export const useWorkFolderQuery = () => {
  return useQuery({
    queryKey: ["workFolders"],
    queryFn: getAllWorkFolders,
  });
};
