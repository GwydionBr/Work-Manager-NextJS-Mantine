"use client";

import { useDisclosure, useHover } from "@mantine/hooks";
import { useFinanceStore } from "@/stores/financeStore";
import { useSettingsStore } from "@/stores/settingsStore";

import {
  Badge,
  Card,
  CardProps,
  Grid,
  Text,
  Group,
  Menu,
  Transition,
} from "@mantine/core";
import {
  IconCashMoveBack,
  IconCashMove,
  IconTag,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { formatMoney } from "@/utils/formatFunctions";
import { Tables } from "@/types/db.types";
import MoreActionIcon from "@/components/UI/ActionIcons/MoreActionIcon";

interface SingleCashflowRowProps extends CardProps {
  cashflow: Tables<"single_cash_flow">;
  onEdit: () => void;
  onDelete: () => void;
}

export default function SingleCashflowRow({
  cashflow,
  onEdit,
  onDelete,
  ...props
}: SingleCashflowRowProps) {
  const { locale } = useSettingsStore();
  const { financeCategories } = useFinanceStore();
  const [opened, { open, close }] = useDisclosure(false);
  const { hovered, ref } = useHover();
  return (
    <Card withBorder shadow="sm" h={45} radius="md" p="xs" {...props} ref={ref}>
      <Grid>
        <Grid.Col span={2}>
          <Group>
            {cashflow.type === "expense" ? (
              <IconCashMoveBack color="red" />
            ) : (
              <IconCashMove color="green" />
            )}
            <Text fw={700} c={cashflow.type === "expense" ? "red" : "green"}>
              {formatMoney(cashflow.amount, cashflow.currency, locale)}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>{cashflow.title}</Text>
        </Grid.Col>
        <Grid.Col span={3}>
          {cashflow.category_id && (
            <Badge
              color="grape"
              variant="light"
              leftSection={<IconTag size={12} />}
            >
              {
                financeCategories.find(
                  (category) => category.id === cashflow.category_id
                )?.title
              }
            </Badge>
          )}
        </Grid.Col>
        <Grid.Col span={1}>
          <Transition
            mounted={hovered || opened}
            transition="fade-left"
            duration={200}
          >
            {(styles) => (
              <Menu opened={opened} onClose={close}>
                <Menu.Target>
                  <MoreActionIcon onClick={open} style={styles} />
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    onClick={onEdit}
                    leftSection={<IconPencil size={16} />}
                  >
                    {locale === "de-DE" ? "Bearbeiten" : "Edit"}
                  </Menu.Item>
                  <Menu.Item
                    onClick={onDelete}
                    leftSection={<IconTrash size={16} />}
                  >
                    {locale === "de-DE" ? "Löschen" : "Delete"}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Transition>
        </Grid.Col>
      </Grid>
    </Card>
  );
}
