"use client";

import { useEffect, useState } from "react";

import { Modal, useModalsStack, Group, Text } from "@mantine/core";
import FinanceProjectForm from "./FinanceProjectForm";
import useSettingsStore from "@/stores/settingsStore";
import FinanceClientForm from "../FinanceClient/FinanceClientForm";
import FinanceCategoryForm from "../FInanceCategory/FinanceCategoryForm";
import {
  IconCategoryPlus,
  IconMoneybagPlus,
  IconUserPlus,
} from "@tabler/icons-react";

interface FinanceProjectFormModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function FinanceProjectFormModal({
  opened,
  onClose,
}: FinanceProjectFormModalProps) {
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const stack = useModalsStack([
    "project-form",
    "client-form",
    "category-form",
  ]);
  const { locale } = useSettingsStore();

  useEffect(() => {
    if (opened) {
      stack.open("project-form");
    } else {
      stack.closeAll();
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
              {locale === "de-DE"
                ? "Neues Finanz Projekt"
                : "New Finance Project"}
            </Text>
          </Group>
        }
        size="lg"
        padding="md"
      >
        <FinanceProjectForm
          onClose={onClose}
          clientIds={clientIds}
          categoryIds={categoryIds}
          onOpenClientForm={() => stack.open("client-form")}
          onOpenCategoryForm={() => stack.open("category-form")}
          onClientChange={setClientIds}
          onCategoryChange={setCategoryIds}
        />
      </Modal>
      <Modal
        {...stack.register("client-form")}
        onClose={() => stack.close("client-form")}
        title={
          <Group>
            <IconUserPlus />
            <Text>{locale === "de-DE" ? "Neuer Kunde" : "New Client"}</Text>
          </Group>
        }
        size="lg"
        padding="md"
      >
        <FinanceClientForm
          onClose={() => stack.close("client-form")}
          onSuccess={(client) => setClientIds((prev) => [...prev, client.id])}
        />
      </Modal>
      <Modal
        {...stack.register("category-form")}
        onClose={() => stack.close("category-form")}
        title={
          <Group>
            <IconCategoryPlus />
            <Text>
              {locale === "de-DE"
                ? "Neue Finanzkategorie"
                : "New Finance Category"}
            </Text>
          </Group>
        }
        size="lg"
        padding="md"
      >
        <FinanceCategoryForm
          onClose={() => stack.close("category-form")}
          onSuccess={(category) =>
            setCategoryIds((prev) => [...prev, category.id])
          }
        />
      </Modal>
    </Modal.Stack>
  );
}
