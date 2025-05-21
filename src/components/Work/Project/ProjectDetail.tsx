"use client";

import type { Tables } from "@/types/db.types";

type ProjectDetailProps = {
  project: Tables<"timerProject"> | null;
};

export default function ProjectDetail({ project }: ProjectDetailProps) {
  if (!project) {
    return null;
  }

  return (
    <>
      <div>{project.title}</div>
    </>
  );
}
