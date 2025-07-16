"use client";

import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useWorkStore } from "@/stores/workManagerStore";
import { useSettingsStore } from "@/stores/settingsStore";

import { ActionIcon, Flex, Group, Modal } from "@mantine/core";
import { IconFilePlus } from "@tabler/icons-react";
import ProjectForm from "@/components/Work/Project/ProjectForm";
import AddActionIcon from "@/components/UI/ActionIcons/AddActionIcon";

import { Currency } from "@/types/settings.types";
import DelayedTooltip from "@/components/UI/DelayedTooltip";

export default function NewProjectButton({
  plusIcon = true,
}: {
  plusIcon?: boolean;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [submitting, setSubmitting] = useState(false);
  const { addProject } = useWorkStore();
  const {
    defaultSalaryCurrency,
    defaultSalaryAmount,
    defaultProjectHourlyPayment,
  } = useSettingsStore();

  async function handleSubmit(values: {
    title: string;
    description: string;
    salary: number;
    currency: Currency;
    payment_per_project: boolean;
    cash_flow_category_id?: string | null;
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
    <Group align="center" justify="center">
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
              hourly_payment: defaultProjectHourlyPayment,
              cash_flow_category_id: null,
            }}
            onSubmit={handleSubmit}
            onCancel={close}
            newProject
            submitting={submitting}
          />
        </Flex>
      </Modal>

      {plusIcon ? (
        <AddActionIcon
          aria-label="Add project"
          onClick={open}
          size="md"
          tooltipLabel="Add project"
        />
      ) : (
        <DelayedTooltip label="Add project">
          <ActionIcon
            aria-label="Add project"
            onClick={open}
            size="sm"
            variant="transparent"
          >
            <IconFilePlus />
          </ActionIcon>
        </DelayedTooltip>
      )}
    </Group>
  );
}
