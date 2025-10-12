"use client";

import { useEffect, useState } from "react";

import { Modal, useModalsStack, Group, Text } from "@mantine/core";
import FinanceProjectForm from "./FinanceProjectForm";
import useSettingsStore from "@/stores/settingsStore";
import FinanceClientForm from "../FinanceClient/FinanceClientForm";
import FinanceCategoryForm from "../Category/FinanceCategoryForm";
import {
  IconCategoryPlus,
  IconMoneybagPlus,
  IconUserPlus,
} from "@tabler/icons-react";
import { Tables } from "@/types/db.types";

interface FinanceProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function FinanceProjectFormModal({
  opened,
  onClose,
}: FinanceProjectFormModalProps) {
  const { getLocalizedText } = useSettingsStore();
  const [financeClient, setFinanceClient] =
    useState<Tables<"finance_client"> | null>(null);
  const [categories, setCategories] = useState<Tables<"finance_category">[]>(
    []
  );
  const stack = useModalsStack([
    "project-form",
    "client-form",
    "category-form",
  ]);

  useEffect(() => {
    if (opened) {
      stack.open("project-form");
    } else {
      stack.closeAll();
      setFinanceClient(null);
      setCategories([]);
    }
  }, [opened]);

  return (
    <Modal.Stack>
      <Modal
        {...stack.register("project-form")}
        onClose={onClose}
        title={
          <Group>
            <IconMoneybagPlus />
            <Text>
              {getLocalizedText("Neues Finanz Projekt", "New Finance Project")}
            </Text>
          </Group>
        }
        size="lg"
        padding="md"
      >
        <FinanceProjectForm
          onClose={onClose}
          financeClient={financeClient}
          categories={categories}
          onOpenClientForm={() => stack.open("client-form")}
          onOpenCategoryForm={() => stack.open("category-form")}
          onClientChange={setFinanceClient}
          onCategoryChange={setCategories}
        />
      </Modal>
      <Modal
        {...stack.register("client-form")}
        onClose={() => stack.close("client-form")}
        title={
          <Group>
            <IconUserPlus />
            <Text>{getLocalizedText("Neuer Kunde", "New Client")}</Text>
          </Group>
        }
        size="lg"
        padding="md"
      >
        <FinanceClientForm
          onClose={() => stack.close("client-form")}
          onSuccess={(client) => setFinanceClient(client)}
        />
      </Modal>
      <Modal
        {...stack.register("category-form")}
        onClose={() => stack.close("category-form")}
        title={
          <Group>
            <IconCategoryPlus />
            <Text>
              {getLocalizedText("Neue Finanzkategorie", "New Finance Category")}
            </Text>
          </Group>
        }
        size="lg"
        padding="md"
      >
        <FinanceCategoryForm
          onClose={() => stack.close("category-form")}
          onSuccess={(category) => setCategories((prev) => [...prev, category])}
        />
      </Modal>
    </Modal.Stack>
  );
}
