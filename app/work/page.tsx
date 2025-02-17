'use server';

import * as actions from "@/actions";
import ListProjects from "@/components/Work/listProjects";
import type { Tables } from "@/db.types";


export default async function WorkPage() {
  const response = await actions.getProjects();
  
    if (!response.success) {
      return <div>{response.error}</div>;
    }
  
    if (!response.data) {
      return <div>No projects found</div>;
    }

    const projects: Tables<'timerProject'>[] = response.data;

  return (
    <>
      <ListProjects projects={projects} />
    </>
  );
}