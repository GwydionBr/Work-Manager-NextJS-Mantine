"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkProjectQuery } from "@/utils/queries/work/use-work-project";
import { useWorkStore } from "@/stores/workManagerStore";

import { Center, Loader } from "@mantine/core";

export default function WorkPage() {
  const { data: projects, isPending } = useWorkProjectQuery();
  const { lastActiveProjectId } = useWorkStore();
  const router = useRouter();

  const targetPath = lastActiveProjectId
    ? `/work/${lastActiveProjectId}`
    : projects && projects.length > 0
      ? `/work/${projects[0].id}`
      : undefined;

  useEffect(() => {
    if (targetPath) {
      router.replace(targetPath);
    }
  }, [router, targetPath]);

  if (!lastActiveProjectId && (isPending || targetPath)) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return null;
}
