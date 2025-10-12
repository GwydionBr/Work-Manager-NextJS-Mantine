"use server";

import { createClient } from "@/utils/supabase/server";
import { WorkProject, UpdateWorkProject } from "@/types/work.types";

interface UpdateWorkProjectProps {
  project: UpdateWorkProject;
}

export async function updateWorkProject({
  project,
}: UpdateWorkProjectProps): Promise<WorkProject> {
  if (!project.id) {
    throw new Error("Project id is required");
  }
  const projectId = project.id;
  const supabase = await createClient();

  const { categories, ...projectData } = project;

  // Update the project
  const { data, error } = await supabase
    .from("timer_project")
    .update(projectData)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: categoryErrorDelete } = await supabase
    .from("timer_project_category")
    .delete()
    .eq("timer_project_id", projectId);

  if (categoryErrorDelete) {
    throw new Error(categoryErrorDelete.message);
  }

  const { error: categoryErrorAdd } = await supabase
    .from("timer_project_category")
    .insert(
      categories.map((category) => ({
        timer_project_id: projectId,
        finance_category_id: category.id,
      }))
    );

  if (categoryErrorAdd) {
    throw new Error(categoryErrorAdd.message);
  }

  return { ...data, categories };
}
