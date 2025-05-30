"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";

import { Drawer, Flex } from "@mantine/core";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import AddActionIcon from "@/components/UI/Buttons/AddActionIcon";

import { Currency } from "@/types/settings.types";

export default function NewProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const { addProject } = useWorkStore();
  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: Currency;
  }) {
    setSubmitting(true);
    const success = await addProject({ ...values });
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        title="Add Project"
        size="md"
        padding="md"
      >
        <Flex direction="column" gap="xl">
          <ProjectForm
            initialValues={{
              title: "",
              description: "",
              salary: 0,
              currency: "$",
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newProject
            submitting={submitting}
          />
        </Flex>
      </Drawer>

      <AddActionIcon aria-label="Add project" onClick={open} size="md" />
    </>
  );
}
