"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { Box, Flex, Modal } from "@mantine/core";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import AddActionIcon from "@/components/UI/Buttons/AddActionIcon";

import { Currency } from "@/types/settings.types";

export default function NewProjectButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const { addProject } = useWorkStore();
  const { defaultSalaryCurrency, defaultSalaryAmount } = useSettingsStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: Currency;
    payment_per_project: boolean;
  }) {
    setSubmitting(true);
    const success = await addProject({
      ...values,
    });
    if (success) {
      close();
    }
    setSubmitting(false);
  }

  return (
    <Box>
      <Modal
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
              salary: defaultSalaryAmount,
              currency: defaultSalaryCurrency,
              payment_per_project: false,
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newProject
            submitting={submitting}
          />
        </Flex>
      </Modal>

      <AddActionIcon aria-label="Add project" onClick={open} size="md" />
    </Box>
  );
}
