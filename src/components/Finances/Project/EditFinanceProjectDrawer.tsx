"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settingsStore";
import { useFinanceStore } from "@/stores/financeStore";

import { Drawer, Group, Text, useDrawersStack } from "@mantine/core";
import { IconAlertTriangleFilled, IconMoneybag } from "@tabler/icons-react";
import CancelButton from "@/components/UI/Buttons/CancelButton";
import DeleteButton from "@/components/UI/Buttons/DeleteButton";
import DeleteActionIcon from "@/components/UI/ActionIcons/DeleteActionIcon";
import { showDeleteConfirmationModal } from "@/utils/notificationFunctions";
import { FinanceProject } from "@/types/finance.types";
import FinanceProjectForm from "./FinanceProjectForm";
import FinanceClientForm from "../FinanceClient/FinanceClientForm";
import FinanceCategoryForm from "../Category/FinanceCategoryForm";
import { useDeleteFinanceProjectMutation } from "@/utils/queries/finances/use-finance-project";
import { Tables } from "@/types/db.types";

interface EditFinanceProjectDrawerProps {
  opened: boolean;
  onClose: () => void;
  financeProject: FinanceProject;
}

export default function EditFinanceProjectDrawer({
  opened,
  onClose,
  financeProject,
}: EditFinanceProjectDrawerProps) {
  const { locale } = useSettingsStore();
  const { mutate: deleteFinanceProjectMutation, isPending: isDeleting } =
    useDeleteFinanceProjectMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [financeClient, setFinanceClient] =
    useState<Tables<"finance_client"> | null>(financeProject.finance_client);
  const [categories, setCategories] = useState<Tables<"finance_category">[]>(
    financeProject.categories.map((category) => category.finance_category)
  );

  const drawerStack = useDrawersStack([
    "edit-finance-project",
    "delete-finance-project",
    "category-form",
    "client-form",
  ]);

  useEffect(() => {
    if (opened) {
      drawerStack.open("edit-finance-project");
      setCategories(
        financeProject.categories.map((category) => category.finance_category)
      );
    } else {
      drawerStack.closeAll();
    }
  }, [opened]);

  const handleDelete = async () => {
    setIsLoading(true);
    showDeleteConfirmationModal(
      locale === "de-DE" ? "Finanzprojekt löschen" : "Delete Finance Project",
      locale === "de-DE"
        ? "Bist du dir sicher, dass du dieses Finanzprojekt löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."
        : "Are you sure you want to delete this finance project? This action cannot be undone.",
      () => {
        deleteFinanceProjectMutation([financeProject.id]);
      },
      locale
    );
    setIsLoading(false);
  };

  return (
    <Drawer.Stack>
      <Drawer
        {...drawerStack.register("edit-finance-project")}
        onClose={onClose}
        title={
          <Group>
            <DeleteActionIcon
              tooltipLabel={
                locale === "de-DE"
                  ? "Finanzprojekt löschen"
                  : "Delete Finance Project"
              }
              onClick={() => drawerStack.open("delete-finance-project")}
            />
            <Text>
              {locale === "de-DE"
                ? "Finanzprojekt bearbeiten"
                : "Edit Finance Project"}
            </Text>
            <IconMoneybag />
          </Group>
        }
        size="md"
        padding="md"
      >
        <FinanceProjectForm
          onClose={onClose}
          financeProject={financeProject}
          financeClient={financeClient}
          categories={categories}
          onOpenClientForm={() => drawerStack.open("client-form")}
          onOpenCategoryForm={() => drawerStack.open("category-form")}
          onClientChange={setFinanceClient}
          onCategoryChange={setCategories}
        />
      </Drawer>
      <Drawer
        {...drawerStack.register("delete-finance-project")}
        onClose={() => drawerStack.close("delete-finance-project")}
        title={
          <Group>
            <IconAlertTriangleFilled size={25} color="red" />
            <Text>
              {locale === "de-DE"
                ? "Finanzprojekt löschen"
                : "Delete Finance Project"}
            </Text>
          </Group>
        }
        size="md"
      >
        <Text>
          {locale === "de-DE"
            ? "Bist du dir sicher, dass du dieses Finanzprojekt löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden."
            : "Are you sure you want to delete this finance project? This action cannot be undone."}
        </Text>
        <Group mt="md" justify="flex-end" gap="sm">
          <CancelButton
            onClick={() => drawerStack.close("delete-finance-project")}
            color="teal"
          />
          <DeleteButton
            onClick={handleDelete}
            tooltipLabel={
              locale === "de-DE"
                ? "Finanzprojekt löschen"
                : "Delete Finance Project"
            }
            loading={isLoading}
          />
        </Group>
      </Drawer>
      <Drawer
        {...drawerStack.register("client-form")}
        onClose={() => drawerStack.close("client-form")}
        title={<Text>{locale === "de-DE" ? "Kunde" : "Client"}</Text>}
      >
        <FinanceClientForm
          onClose={() => drawerStack.close("client-form")}
          onSuccess={(client) => setFinanceClient(client)}
        />
      </Drawer>
      <Drawer
        {...drawerStack.register("category-form")}
        onClose={() => drawerStack.close("category-form")}
        title={<Text>{locale === "de-DE" ? "Kategorie" : "Category"}</Text>}
      >
        <FinanceCategoryForm
          onClose={() => drawerStack.close("category-form")}
          onSuccess={(category) =>
            setCategories((prev) => [...prev, category])
          }
        />
      </Drawer>
    </Drawer.Stack>
  );
}
